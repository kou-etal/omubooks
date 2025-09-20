<?php

namespace App\Notifications;

use App\Models\Trade;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ListingPurchased extends Notification
{
    use Queueable;

    public function __construct(public Trade $trade) {}

    public function via($notifiable)
    {
        return ['database']; // 必要なら mail/broadcast 追加
    }

    public function toDatabase($notifiable)
    {
        // SPA 内部遷移できるように、絶対URLではなくパスを返す
        return [
            'kind'       => 'listing_purchased',
            'title'      => 'あなたの出品が購入されました',
            'body'       => $this->trade->listing->title,
            'action_url' => "/trades/{$this->trade->id}/messages",
            'trade_id'   => $this->trade->id,
            'listing_id' => $this->trade->listing_id,
        ];
    }
}
