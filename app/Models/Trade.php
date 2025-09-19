<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Trade extends Model
{
    use HasFactory;

    protected $fillable = [
        'buyer_id','seller_id','listing_id',
        'price','platform_fee','status',
        'is_platform_fee_paid','is_seller_amount_paid',
        'buyer_completed','seller_completed',   // ← 追加
        'meta',
    ];

    protected $casts = [
        'price' => 'integer',
        'platform_fee' => 'integer',
        'is_platform_fee_paid' => 'boolean',
        'is_seller_amount_paid' => 'boolean',
        'buyer_completed' => 'boolean',         // ← 追加
        'seller_completed' => 'boolean',        // ← 追加
        'meta' => 'array',
    ];
     public function getBothCompletedAttribute(): bool
    {
        return (bool) ($this->buyer_completed && $this->seller_completed);
    }
    /** 参加者 */
    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /** 対象出品 */
    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }

    /** DM */
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    /** レビュー（最大2件：双方） */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /** 支払いが両方済んだか */
    public function getBothPaidAttribute(): bool
    {
        return $this->is_platform_fee_paid && $this->is_seller_amount_paid;
    }

    /** ステータス遷移補助 */
    public function markScheduled(): void
    {
        $this->status = 'scheduled';
        $this->save();
    }

    public function markCompleted(): void
    {
        $this->status = 'completed';
        $this->save();
    }
}
