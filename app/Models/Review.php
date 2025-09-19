<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'trade_id',
        'rater_id',
        'ratee_id',
        'score',
        'comment',
        'is_public',
    ];

    protected $casts = [
        'score' => 'integer',
        'is_public' => 'boolean',
    ];

    /** 紐づく取引 */
    public function trade()
    {
        return $this->belongsTo(Trade::class);
    }

    /** 評価する人 */
    public function rater()
    {
        return $this->belongsTo(User::class, 'rater_id');
    }

    /** 評価される人 */
    public function ratee()
    {
        return $this->belongsTo(User::class, 'ratee_id');
    }
}
