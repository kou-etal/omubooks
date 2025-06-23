<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    protected $table = 'favorite';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = ['customer_id', 'product_id']; // 保存可能なカラム

    // お気に入り登録した顧客
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }

    // お気に入りの商品
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }
}
?>
