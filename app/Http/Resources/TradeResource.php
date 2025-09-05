<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TradeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'status'      => $this->status,
            'price'       => $this->price,
            'platform_fee'=> $this->platform_fee,
            'is_platform_fee_paid'   => $this->is_platform_fee_paid,
            'is_seller_amount_paid'  => $this->is_seller_amount_paid,
            'listing' => $this->whenLoaded('listing', fn() => [
                'id'          => $this->listing->id,
                'title'       => $this->listing->title,
                'course_name' => $this->listing->course_name,
                'price'       => $this->listing->price,
                'images'      => $this->listing->images->pluck('path'),
            ]),
            'buyer'  => $this->whenLoaded('buyer', fn() => [
                'id'   => $this->buyer->id,
                'name' => $this->buyer->name,
                'paypay_id' => $this->buyer->paypay_id,
            ]),
            'seller' => $this->whenLoaded('seller', fn() => [
                'id'   => $this->seller->id,
                'name' => $this->seller->name,
                'paypay_id' => $this->seller->paypay_id,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
