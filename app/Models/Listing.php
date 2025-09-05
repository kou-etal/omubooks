<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Listing extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'course_name',
        'price',
        'description',
        'status', // draft / active / sold / hidden
    ];

    protected $casts = [
        'price' => 'integer',
    ];

    /** 出品者 */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /** 画像（最大3枚想定だが hasMany で柔軟に） */
    public function images()
    {
        return $this->hasMany(ListingImage::class);
    }

    /** 関連取引（通常は最新1件が進行中） */
    public function trades()
    {
        return $this->hasMany(Trade::class);
    }

    /** よく使うスコープ */
    public function scopeActive($q)   { return $q->where('status', 'active'); }
    public function scopeSold($q)     { return $q->where('status', 'sold'); }
    public function scopeSearch($q, string $term)
    {
        $t = trim($term);
        return $q->where(function ($qq) use ($t) {
            $qq->where('title', 'like', "%{$t}%")
               ->orWhere('course_name', 'like', "%{$t}%");
        });
    }
}
