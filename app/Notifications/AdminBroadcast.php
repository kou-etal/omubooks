<?php
// app/Notifications/AdminBroadcast.php
namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AdminBroadcast extends Notification
{
    use Queueable;

    public function __construct(
        public string $title,
        public ?string $body = null,
        public ?string $actionUrl = null,
        public array $meta = [],
    ) {}

    /** DB通知のみ（リアルタイム不要の前提） */
    public function via($notifiable): array
    {
        return ['database'];
    }

    /** DBペイロード（フロントのモーダルが読む形に統一） */
    public function toDatabase($notifiable): array
    {
        return [
            'kind'       => 'admin_broadcast',
            'title'      => $this->title,
            'body'       => $this->body ?? '',
            // SPA 内遷移しやすいよう相対パスのままでも可
            'action_url' => $this->actionUrl,
            'meta'       => $this->meta,
        ];
    }

    /** 任意: 他ドライバ用にも同形を返す */
    public function toArray($notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
