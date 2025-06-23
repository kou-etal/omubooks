<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    protected $table = 'purchase';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = ['user_id', 'created_at', 'total'];

    // ユーザー（元: customer）
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // 購入詳細
    public function purchaseDetails()
    {
        return $this->hasMany(PurchaseDetail::class, 'purchase_id');
    }
}

