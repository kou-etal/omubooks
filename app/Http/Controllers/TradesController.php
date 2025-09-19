<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\Trades\StoreTradeRequest;
use App\Http\Resources\TradeResource;
use App\Models\Trade;
use App\Models\User;
use App\Models\Listing;
use App\Models\Message;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TradesController extends Controller
{
    /** 取引一覧（購入/販売どちらも） */
    public function index(Request $request)
{
    $userId = Auth::id();
    $statusGroup = $request->string('status_group')->toString() ?: 'active';
    // active = 進行中 / history = 完了・キャンセル
    $active = ['pending_payment', 'scheduled'];
    $history = ['completed', 'cancelled'];

    $trades = Trade::query()
        ->with([
            'listing.images',
            'buyer:id,name',
            'seller:id,name',
            'messages' => fn($q) => $q->latest()->limit(1),
        ])
        // 自分が当事者のみ
        ->where(fn($q) => $q->where('buyer_id', $userId)->orWhere('seller_id', $userId))
        // 一覧絞り込み（デフォは進行中だけ）
        ->when($statusGroup === 'active', fn($q) => $q->whereIn('status', $active))
        ->when($statusGroup === 'history', fn($q) => $q->whereIn('status', $history))
        // 「自分がこの取引で既にレビューしたか」を withCount で取得
        ->withCount(['reviews as my_review_count' => fn($q) => $q->where('rater_id', $userId)])
        ->latest()
        ->paginate($request->integer('per_page', 20));

    return TradeResource::collection($trades);
}

    /** 取引詳細（DMスレッド） */
    public function show(Trade $trade)
    {
        $this->authorizeAccess($trade);

        $trade->load([
            'listing.images',
            'buyer:id,name,paypay_id',
            'seller:id,name,paypay_id',
            'messages.from:id,name',
            'messages.to:id,name'
        ]);

        return new TradeResource($trade);
    }

    /** 購入 → 取引作成 → DM初期化（手数料0%キャンペーン版） */
    public function store(StoreTradeRequest $request)
    {
        $buyer = Auth::user();

        return DB::transaction(function () use ($request, $buyer) {
            $listing = Listing::lockForUpdate()->findOrFail($request->validated()['listing_id']);

            if ($listing->user_id === $buyer->id) {
                return response()->json(['message' => '自分の商品は購入できません'], 403);
            }
            if ($listing->status !== 'active') {
                return response()->json(['message' => 'この商品は現在購入できません'], 400);
            }

            // --- 手数料ロジック（停止中） ---
            // $platformFee = floor($listing->price * 0.08);

            $trade = Trade::create([
                'buyer_id'              => $buyer->id,
                'seller_id'             => $listing->user_id,
                'listing_id'            => $listing->id,
                'price'                 => $listing->price,
                'platform_fee'          => 0,               // ← 0%運用
                'status'                => 'pending_payment',// ※既存の状態を維持（後で整えるならOK）
                'is_platform_fee_paid'  => false,           // 参照停止中（残す）
                'is_seller_amount_paid' => false,           // 参照停止中（残す）
                'buyer_completed'       => false,
                'seller_completed'      => false,
            ]);

            // 出品を購入ロック
            $listing->status = 'hidden';
            $listing->save();

            // 最初のDM：手数料0%の案内
            $this->sendZeroFeeCampaignMessage($trade);

            $trade->load(['listing.images', 'buyer:id,name', 'seller:id,name']);

            return (new TradeResource($trade))
                ->additional(['message' => '取引を開始しました（現在は手数料ゼロで取引できます）']);
        });
    }

    /** 受け渡し待ちへ（支払い確認チェックを停止） */
    public function markScheduled(Trade $trade)
    {
        $this->authorizeAccess($trade);

        // --- 元のチェックを停止 ---
        // if (!$trade->is_platform_fee_paid || !$trade->is_seller_amount_paid) {
        //     return response()->json(['message' => '両方の支払い確認後に受け渡しを設定できます'], 400);
        // }

        $trade->status = 'scheduled';
        $trade->save();

        return response()->json([
            'message' => '受け渡し待ちに更新しました',
            'trade'   => new TradeResource($trade),
        ]);
    }

    /**
     * 自分側の完了フラグを立てる（双方完了になってもここでは評価はしない）
     * 後で別コントローラで「双方完了 → 評価可能」にする前提。
     */
   public function completeByMe(Trade $trade)
{
    $this->authorizeAccess($trade);
    $uid = auth()->id();

    return DB::transaction(function () use ($trade, $uid) {
        // この取引の行をロックして同時実行を防止
        $t = Trade::lockForUpdate()->findOrFail($trade->id);

        // すでに全体が完了なら冪等応答
        if ($t->status === 'completed') {
            return response()->json([
                'message' => 'すでに取引は完了しています',
                'trade'   => new \App\Http\Resources\TradeResource($t),
            ]);
        }

        // 自分側の完了フラグだけ更新（冪等）
        $changed = false;
        if ($t->buyer_id === $uid && !$t->buyer_completed) {
            $t->buyer_completed = true;
            $changed = true;
        }
        if ($t->seller_id === $uid && !$t->seller_completed) {
            $t->seller_completed = true;
            $changed = true;
        }

        // 両者完了した「今この瞬間」に初めて completed へ遷移させる
        if ($t->buyer_completed && $t->seller_completed && $t->status !== 'completed') {
            $t->status = 'completed';
            $t->save();

            // ★ ここで初回のみ実績を +1（ロック中なので二重加算されない）
            User::whereKey($t->buyer_id)->increment('deals_count');
            User::whereKey($t->seller_id)->increment('deals_count');
        } elseif ($changed) {
            $t->save(); // 途中段階の保存
        }

        return response()->json([
            'message' => $t->status === 'completed'
                ? '双方が取引完了しました（評価へ進めます）'
                : '取引完了フラグを設定しました',
            'trade' => new \App\Http\Resources\TradeResource($t),
        ]);
    });
}
    /** 手数料0%キャンペーンの案内をDM送信 */
    protected function sendZeroFeeCampaignMessage(Trade $trade): void
    {
        Message::create([
            'trade_id'     => $trade->id,
            'from_user_id' => config('app.admin_id', 1),
            'to_user_id'   => $trade->buyer_id, // ひとまず購入者へ（両者に送りたければ2通作成）
            'body'         => "【お知らせ】現在は手数料ゼロで取引できます。\n".
                              "運営への送金は不要です。受け渡し日時をチャットで調整してください。",
            'is_system'    => true,
        ]);
    }

    /**（旧）8%請求DM → 保全のため残すが未使用 */
    protected function sendPlatformFeeRequestMessage(Trade $trade, int $fee): void
    {
        // 停止中：手数料0%キャンペーン
        // Message::create([...]);
    }

    /** 認可：購入者 or 出品者のみ */
    protected function authorizeAccess(Trade $trade): void
    {
        if ($trade->buyer_id !== Auth::id() && $trade->seller_id !== Auth::id()) {
            abort(403, 'この取引にアクセスする権限がありません');
        }
    }
}
