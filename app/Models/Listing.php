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
        'status',
        'image1','image2','image3',
        // ▼ タグ系
        'tag_subject',
        'tag_field',
        'tag_faculty',
        'has_writing',
    ];

    protected $casts = [
        'price'       => 'integer',
        'has_writing' => 'boolean',
    ];

    /** 選択肢（バリデーションや選択UIに使える定数） */
    public const SUBJECT_OPTIONS = ['liberal_arts','basic_education','specialized','other','none'];
    public const FIELD_OPTIONS   = ['math','physics','chemistry','biology','english','other','none'];
    public const FACULTY_OPTIONS = [
        'modern_system_science','law','commerce','engineering','veterinary','medicine',
        'human_life_science','letters','economics','science','agriculture','nursing','other','none',
    ];

    /** スコープ: タグでの絞り込み（任意：一覧APIで使うと楽） */
    public function scopeFilterTags($q, array $f)
    {
        return $q
            ->when(!empty($f['tag_subject']) && $f['tag_subject'] !== 'all', fn($qq) => $qq->where('tag_subject', $f['tag_subject']))
            ->when(!empty($f['tag_field'])   && $f['tag_field']   !== 'all', fn($qq) => $qq->where('tag_field',   $f['tag_field']))
            ->when(!empty($f['tag_faculty']) && $f['tag_faculty'] !== 'all', fn($qq) => $qq->where('tag_faculty', $f['tag_faculty']))
            ->when(isset($f['has_writing']) && $f['has_writing'] !== '', function ($qq) use ($f) {
                // '1' / '0' / true / false どれでも受けられるように
                $qq->where('has_writing', filter_var($f['has_writing'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false);
            });
    }

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
