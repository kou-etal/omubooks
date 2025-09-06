<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class MessageResource extends JsonResource
{
    /**
     * @param \Illuminate\Http\Request $request
     */
    public function toArray($request): array
    {
        // 添付の取り出し（JSONカラム or リレーション）
        $attachments = $this->extractAttachments();

        return [
            'id'         => $this->id,
            'trade_id'   => $this->trade_id,
            'from'       => $this->when(
                $this->relationLoaded('fromUser'),
                fn () => [
                    'id'            => $this->fromUser->id,
                    'name'          => $this->fromUser->name,
                    'profile_image' => $this->absUrl($this->fromUser->profile_image),
                ],
                // リレーション未ロード時は最低限の情報だけ
                fn () => ['id' => $this->from_user_id]
            ),
            'to'         => $this->when(
                $this->relationLoaded('toUser'),
                fn () => [
                    'id'            => $this->toUser->id,
                    'name'          => $this->toUser->name,
                    'profile_image' => $this->absUrl($this->toUser->profile_image),
                ],
                fn () => ['id' => $this->to_user_id]
            ),
            // 旧カラム名（message）にもフォールバック
            'body'       => $this->body ?? $this->message,
            'is_system'  => (bool) ($this->is_system ?? false),
            'attachments'=> $attachments,          // 画像URL配列
            'created_at' => optional($this->created_at)->toISOString(),
        ];
    }

    /**
     * 添付を配列の絶対URLへ正規化
     * - JSONカラム: attachments / images
     * - リレーション: attachments / images がロード済みならそこから
     */
    protected function extractAttachments(): array
    {
        // 1) リレーション優先（例: $message->attachments()->pluck('path') など）
        if ($this->relationLoaded('attachments')) {
            return collect($this->attachments)
                ->map(fn ($att) => is_string($att) ? $att : ($att->path ?? null))
                ->filter()
                ->map(fn ($p) => $this->absUrl($p))
                ->values()
                ->all();
        }
        if ($this->relationLoaded('images')) {
            return collect($this->images)
                ->map(fn ($img) => is_string($img) ? $img : ($img->path ?? null))
                ->filter()
                ->map(fn ($p) => $this->absUrl($p))
                ->values()
                ->all();
        }

        // 2) JSON カラム（attachments または images）にフォールバック
        $raw = $this->attachments ?? $this->images ?? [];
        if (is_string($raw)) {
            $raw = json_decode($raw, true) ?: [];
        }
        return collect((array) $raw)
            ->filter()
            ->map(fn ($p) => $this->absUrl($p))
            ->values()
            ->all();
    }

    /**
     * ストレージパス→絶対URL（すでに http ならそのまま）
     */
    protected function absUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }
        if (preg_match('#^https?://#i', $path)) {
            return $path;
        }
        // public ディスク優先、失敗時は url() でフォールバック
        try {
            return Storage::disk('public')->url($path);
        } catch (\Throwable $e) {
            return url($path);
        }
    }
}
