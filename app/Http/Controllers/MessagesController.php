<?php

namespace App\Http\Controllers;

use App\Http\Requests\Messages\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Models\Trade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class MessagesController extends Controller
{
    /** スレッド一覧（最新→古い、ページネーション） */
    public function index(Trade $trade, Request $request)
    {
        $this->authorizeAccess($trade);

        $messages = Message::with(['from:id,name', 'to:id,name'])
            ->where('trade_id', $trade->id)
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 30));

        return MessageResource::collection($messages);
    }

    /** 通常送信（テキスト/画像添付） */
    public function store(StoreMessageRequest $request, Trade $trade)
    {
        $this->authorizeAccess($trade);

        $v = $request->validated();

        $attachments = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $f) {
                $path = $f->store('dm_images', 'public');
                $attachments[] = config('app.url') . '/storage/' . $path;
            }
        }

        $msg = Message::create([
            'trade_id'     => $trade->id,
            'from_user_id' => Auth::id(),
            'to_user_id'   => $this->otherPartyId($trade, Auth::id()),
            'body'         => $v['body'] ?? null,
            'attachments'  => $attachments ?: null,
            'is_system'    => false,
        ]);

        $msg->load(['from:id,name','to:id,name']);
        return (new MessageResource($msg))
            ->additional(['message' => 'メッセージを送信しました。']);
    }

    /** 運営8%のリマインド（system message） */
    public function sendPlatformFeeReminder(Trade $trade)
    {
        $this->authorizeAccess($trade);

        $fee = $trade->platform_fee;
        $body = "【運営手数料のお支払い】{$fee}円\n"
              . "PayPay送金先: " . config('app.platform_paypay_id')
              . "\n※お支払いが完了するまで受け渡し確定はできません";

        $msg = Message::create([
            'trade_id'     => $trade->id,
            'from_user_id' => config('app.admin_id', 1),
            'to_user_id'   => $trade->buyer_id, // 購入者に送る
            'body'         => $body,
            'is_system'    => true,
        ]);

        return response()->json([
            'message' => '運営手数料のリマインドを送信しました。',
            'data'    => new MessageResource($msg),
        ]);
    }

    /**
     * 出品者用：92%請求テンプレを「送信」する
     * （フロントの“コピペUI”に合わせて、サーバ側でも1クリック送信をサポート）
     */
    public function sendSellerChargeTemplate(Trade $trade)
    {
        $this->authorizeAccess($trade);

        // 出品者のみ
        if (Auth::id() !== $trade->seller_id) {
            abort(403, '出品者のみ実行できます');
        }

        $remain = max($trade->price - $trade->platform_fee, 0);
        $seller = $trade->seller;

        $lines = [
            "【出品者へのお支払い】{$remain}円",
            "PayPay ID：{$seller->paypay_id}",
            "※PayPayアプリで「送る」→ID入力→金額を{$remain}円に設定してください。",
        ];
        $body = implode("\n", $lines);

        $msg = Message::create([
            'trade_id'     => $trade->id,
            'from_user_id' => $seller->id,
            'to_user_id'   => $trade->buyer_id,
            'body'         => $body,
            'is_system'    => false,
        ]);

        return response()->json([
            'message' => '出品者の請求テンプレートを送信しました。',
            'data'    => new MessageResource($msg),
        ]);
    }

    /** 認可（当事者のみ） */
    protected function authorizeAccess(Trade $trade): void
    {
        if ($trade->buyer_id !== Auth::id() && $trade->seller_id !== Auth::id()) {
            abort(403, 'この取引のメッセージにアクセスできません');
        }
    }

    /** 相手のユーザーID */
    protected function otherPartyId(Trade $trade, int $me): int
    {
        return $trade->buyer_id === $me ? $trade->seller_id : $trade->buyer_id;
    }
}
