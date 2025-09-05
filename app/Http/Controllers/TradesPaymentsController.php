<?php

namespace App\Http\Controllers;

use App\Http\Requests\Trades\PayPlatformRequest;
use App\Http\Requests\Trades\PaySellerRequest;
use App\Http\Resources\TradeResource;
use App\Models\Message;
use App\Models\Trade;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class TradesPaymentsController extends Controller
{
    /**
     * 運営8%：支払い完了フラグ
     * 原則：購入者が自己申告（運用で運営が確認してもOK）
     */
    public function markPlatformPaid(PayPlatformRequest $request, Trade $trade)
    {
        // 当事者のみ
        $this->authorizeAccess($trade);

        // 原則、購入者のみ自己申告可能（運営操作を許すなら追加条件で許可）
        if (Auth::id() !== $trade->buyer_id && !Auth::user()->is_admin) {
            abort(403, '購入者のみ操作できます');
        }

        return DB::transaction(function () use ($request, $trade) {
            // スクショ保存（任意）
            $proofUrl = $this->storeProof($request, 'platform');

            $trade->is_platform_fee_paid = true;
            $trade->save();

            // Systemメッセージ（共有）
            $body = "【運営手数料の入金確認】{$trade->platform_fee}円\n"
                  . ($proofUrl ? "証跡: {$proofUrl}" : "（証跡なし）");
            $this->systemMessageToBoth($trade, $body);

            // 両方揃っていれば scheduled に遷移
            $this->maybeMarkScheduled($trade);

            $trade->load(['listing.images', 'buyer:id,name', 'seller:id,name']);

            return (new TradeResource($trade))
                ->additional(['message' => '運営手数料の支払いを確認しました。']);
        });
    }

    /**
     * 出品者92%：受領完了フラグ
     * 原則：出品者が確認して立てる
     */
    public function markSellerPaid(PaySellerRequest $request, Trade $trade)
    {
        // 当事者のみ
        $this->authorizeAccess($trade);

        // 出品者のみ
        if (Auth::id() !== $trade->seller_id && !Auth::user()->is_admin) {
            abort(403, '出品者のみ操作できます');
        }

        return DB::transaction(function () use ($request, $trade) {
            // スクショ保存（任意）
            $proofUrl = $this->storeProof($request, 'seller');

            $trade->is_seller_amount_paid = true;
            $trade->save();

            $remain = max($trade->price - $trade->platform_fee, 0);
            $body = "【出品者受領の確認】{$remain}円\n"
                  . ($proofUrl ? "証跡: {$proofUrl}" : "（証跡なし）");
            $this->systemMessageToBoth($trade, $body);

            // 両方揃っていれば scheduled に遷移
            $this->maybeMarkScheduled($trade);

            $trade->load(['listing.images', 'buyer:id,name', 'seller:id,name']);

            return (new TradeResource($trade))
                ->additional(['message' => '出品者受領を確認しました。']);
        });
    }

    /** 両方の支払いが揃ったら scheduled へ */
    protected function maybeMarkScheduled(Trade $trade): void
    {
        if ($trade->is_platform_fee_paid && $trade->is_seller_amount_paid && $trade->status === 'pending_payment') {
            $trade->status = 'scheduled';
            $trade->save();

            $this->systemMessageToBoth($trade, "【受け渡し待ちに移行】両方の支払いが確認されました。DMで日時を決めてください。");
        }
    }

    /** 当事者のみアクセス可能 */
    protected function authorizeAccess(Trade $trade): void
    {
        if ($trade->buyer_id !== Auth::id() && $trade->seller_id !== Auth::id() && !Auth::user()->is_admin) {
            abort(403, 'この取引を操作する権限がありません');
        }
    }

    /** 証跡画像の保存（任意） */
    protected function storeProof($request, string $kind): ?string
    {
        if (!$request->hasFile('proof')) return null;

        $path = $request->file('proof')->store("trade_proofs/{$kind}", 'public');
        return config('app.url') . '/storage/' . $path;
    }

    /** 双方へSystemメッセージ送信 */
    protected function systemMessageToBoth(Trade $trade, string $body): void
    {
        // 購入者へ
        Message::create([
            'trade_id'     => $trade->id,
            'from_user_id' => config('app.admin_id', 1),
            'to_user_id'   => $trade->buyer_id,
            'body'         => $body,
            'is_system'    => true,
        ]);

        // 出品者へ
        Message::create([
            'trade_id'     => $trade->id,
            'from_user_id' => config('app.admin_id', 1),
            'to_user_id'   => $trade->seller_id,
            'body'         => $body,
            'is_system'    => true,
        ]);
    }
}
