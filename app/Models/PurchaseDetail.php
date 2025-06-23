<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseDetail extends Model
{
    protected $table = 'purchase_detail';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = ['purchase_id', 'product_id', 'quantity']; // 保存可能なカラム

    // 紐づく購入
    public function purchase()
    {
        return $this->belongsTo(Purchase::class, 'purchase_id', 'id');
    }

    // 紐づく商品
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }
}
?>
