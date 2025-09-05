<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_admin',
        'profile_image',
        'bio',
        'faculty',
        'department',
        'paypay_id',
        'rating_avg',
        'deals_count',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_admin'          => 'boolean',
        'rating_avg'        => 'float',
        'deals_count'       => 'integer',
    ];

    /** 出品一覧 */
    public function listings()
    {
        return $this->hasMany(Listing::class);
    }

    /** 購入側の取引 */
    public function buyingTrades()
    {
        return $this->hasMany(Trade::class, 'buyer_id');
    }

    /** 販売側の取引 */
    public function sellingTrades()
    {
        return $this->hasMany(Trade::class, 'seller_id');
    }

    /** 送信メッセージ */
    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'from_user_id');
    }

    /** 受信メッセージ */
    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'to_user_id');
    }

    /** 自分が付けたレビュー */
    public function givenReviews()
    {
        return $this->hasMany(Review::class, 'rater_id');
    }

    /** 自分が受けたレビュー */
    public function receivedReviews()
    {
        return $this->hasMany(Review::class, 'ratee_id');
    }

    /** 学内限定：@omu.ac.jp 以外を弾くときに使える簡易スコープ */
    public function scopeOmuEmail($q)
    {
        return $q->where('email', 'like', '%@omu.ac.jp');
    }
}
