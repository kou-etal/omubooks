<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TradeResource extends JsonResource
{
    public function toArray($request): array
    {
        $uid = optional($request->user())->id;
        $myRole = $uid === $this->buyer_id ? 'buyer' : ($uid === $this->seller_id ? 'seller' : null);
        $iCompleted = match ($myRole) {
            'buyer'  => (bool) $this->buyer_completed,
            'seller' => (bool) $this->seller_completed,
            default  => false,
        };
        $otherCompleted = match ($myRole) {
            'buyer'  => (bool) $this->seller_completed,
            'seller' => (bool) $this->buyer_completed,
            default  => false,
        };
        $bothCompleted = (bool) ($this->buyer_completed && $this->seller_completed);

        return [
            'id'          => $this->id,
            'status'      => $this->status,
            'price'       => (int) $this->price,
            'platform_fee'=> (int) ($this->platform_fee ?? 0),

            'is_platform_fee_paid'   => (bool) $this->is_platform_fee_paid,
            'is_seller_amount_paid'  => (bool) $this->is_seller_amount_paid,

            'buyer_completed'  => (bool) $this->buyer_completed,
            'seller_completed' => (bool) $this->seller_completed,
            'both_completed'   => $bothCompleted,

            // 追加：フロント制御用
            'my_role'       => $myRole,                     // 'buyer' | 'seller'
            'i_completed'   => $iCompleted,                 // 自分側の完了フラグ
            'i_reviewed'    => (bool) ($this->my_review_count ?? 0), // 自分は既にレビュー投稿済みか
            'other_completed'=> $otherCompleted,

            'campaign_message' => '現在は手数料ゼロで取引できます',

            'listing' => $this->whenLoaded('listing', fn() => [
                'id'          => $this->listing->id,
                'title'       => $this->listing->title,
                'course_name' => $this->listing->course_name,
                'price'       => (int) $this->listing->price,
                'images'      => $this->listing->images->pluck('path'),
            ]),
            'buyer'  => $this->whenLoaded('buyer', fn() => [
                'id' => $this->buyer->id,
                'name' => $this->buyer->name,
            ]),
            'seller' => $this->whenLoaded('seller', fn() => [
                'id' => $this->seller->id,
                'name' => $this->seller->name,
            ]),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
