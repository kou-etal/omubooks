<?php

namespace App\Http\Controllers;

use App\Http\Requests\Trades\StoreTradeRequest;
use App\Http\Resources\TradeResource;
use App\Models\Trade;
use App\Models\Listing;
use App\Models\Message;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TradesController extends Controller
{
    /**
     * 取引一覧（購入/販売どちらも含む）
     */
    public function index()
    {
        $userId = Auth::id();

        $trades = Trade::with([
                'listing.images',
                'buyer:id,name',
                'seller:id,name',
                'messages' => fn($q) => $q->latest()->limit(1) // 最新メッセージのみ
            ])
            ->where(function ($q) use ($userId) {
                $q->where('buyer_id', $userId)
                  ->orWhere('seller_id', $userId);
            })
            ->latest()
            ->paginate(20);

        return TradeResource::collection($trades);
    }

    /**
     * 取引詳細（DMスレッド表示）
     */
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

    /**
     * 購入 → 取引作成 → DM初期化
     */
    public function store(StoreTradeRequest $request)
    {
        $buyer = Auth::user();

        return DB::transaction(function () use ($request, $buyer) {
            // 対象の出品情報を取得
            $listing = Listing::lockForUpdate()->findOrFail($request->validated()['listing_id']);

            // 自分の商品は購入不可
            if ($listing->user_id === $buyer->id) {
                return response()->json(['message' => '自分の商品は購入できません'], 403);
            }

            // 売り切れチェック
            if ($listing->status !== 'active') {
                return response()->json(['message' => 'この商品は現在購入できません'], 400);
            }

            // 取引作成
            $platformFee = floor($listing->price * 0.08);
            $trade = Trade::create([
                'buyer_id'             => $buyer->id,
                'seller_id'            => $listing->user_id,
                'listing_id'           => $listing->id,
                'price'                => $listing->price,
                'platform_fee'         => $platformFee,
                'status'               => 'pending_payment',
                'is_platform_fee_paid' => false,
                'is_seller_amount_paid'=> false,
            ]);

            // 出品を購入ロック
            $listing->status = 'hidden';
            $listing->save();

            // 運営8%請求リンクをDMで自動送信
            $this->sendPlatformFeeRequestMessage($trade, $platformFee);

            $trade->load(['listing.images', 'buyer:id,name', 'seller:id,name']);
            return (new TradeResource($trade))
                ->additional(['message' => '取引を開始しました']);
        });
    }

    /**
     * 取引を受け渡し待ち状態へ遷移
     * → 運営8%と出品者92%両方の入金確認後に呼ぶ
     */
    public function markScheduled(Trade $trade)
    {
        $this->authorizeAccess($trade);

        if (!$trade->is_platform_fee_paid || !$trade->is_seller_amount_paid) {
            return response()->json(['message' => '両方の支払い確認後に受け渡しを設定できます'], 400);
        }

        $trade->status = 'scheduled';
        $trade->save();

        return response()->json([
            'message' => '受け渡し待ちに更新しました',
            'trade'   => new TradeResource($trade),
        ]);
    }

    /**
     * 取引完了
     */
    public function markCompleted(Trade $trade)
    {
        $this->authorizeAccess($trade);

        if ($trade->status !== 'scheduled') {
            return response()->json(['message' => '受け渡しが未設定のため完了できません'], 400);
        }

        $trade->status = 'completed';
        $trade->save();

        return response()->json([
            'message' => '取引を完了しました',
            'trade'   => new TradeResource($trade),
        ]);
    }

    /**
     * 運営8%請求リンクを最初のDMに送る
     */
    protected function sendPlatformFeeRequestMessage(Trade $trade, int $fee): void
    {
        Message::create([
            'trade_id'    => $trade->id,
            'from_user_id'=> config('app.admin_id', 1), // 運営アカウント
            'to_user_id'  => $trade->buyer_id,
            'body'        => "【運営手数料のお支払い】{$fee}円\n" .
                             "PayPay送金先: " . config('app.platform_paypay_id'),
            'is_system'   => true,
        ]);
    }

    /**
     * 認可：購入者 or 出品者しか見れない
     */
    protected function authorizeAccess(Trade $trade): void
    {
        if ($trade->buyer_id !== Auth::id() && $trade->seller_id !== Auth::id()) {
            abort(403, 'この取引にアクセスする権限がありません');
        }
    }
}
