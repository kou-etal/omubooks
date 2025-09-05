<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'        => $this->id,
            'trade_id'  => $this->trade_id,
            'score'     => $this->score,
            'comment'   => $this->comment,
            'rater'     => [
                'id'   => $this->rater->id,
                'name' => $this->rater->name,
            ],
            'ratee'     => [
                'id'   => $this->ratee->id,
                'name' => $this->ratee->name,
            ],
            'created_at'=> $this->created_at,
        ];
    }
}
