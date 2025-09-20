<?php

namespace App\Notifications;

use App\Models\Trade;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TradeCompleted extends Notification
{
    use Queueable;

    public function __construct(public Trade $trade) {}

    /** DB通知のみ（必要なら mail / broadcast を追加） */
    public function via($notifiable): array
    {
        return ['database'];
    }

    /** DB に保存される payload（フロントが読む形に統一） */
    public function toDatabase($notifiable): array
    {
        return [
            'kind'       => 'trade_completed',
            'title'      => '取引が完了しました',
            'body'       => $this->trade->listing?->title ?? '',
            // SPA 内遷移しやすい相対パス
            'action_url' => "/trades/{$this->trade->id}/review",
            'trade_id'   => $this->trade->id,
            'listing_id' => $this->trade->listing_id,
            'meta'       => [
                'buyer_id'  => $this->trade->buyer_id,
                'seller_id' => $this->trade->seller_id,
            ],
        ];
    }

    /** 任意：他ドライバ用にも同形を返す */
    public function toArray($notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
