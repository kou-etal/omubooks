<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ListingResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'course_name' => $this->course_name,
            'price'       => $this->price,
            'description' => $this->description,
            'status'      => $this->status,
            'images'      => $this->whenLoaded('images', fn () => $this->images->pluck('path')),
            'seller'      => $this->whenLoaded('user', function () {
                return [
                    'id'          => $this->user->id,
                    'name'        => $this->user->name,
                    'rating_avg'  => $this->user->rating_avg,
                    'deals_count' => $this->user->deals_count,
                ];
            }),
            'created_at'  => $this->created_at,
        ];
    }
}
