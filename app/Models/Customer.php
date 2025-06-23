<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $table = 'customer';

    // 主キー（デフォルト 'id' なので今回は省略もOK）
    protected $primaryKey = 'id';

    // タイムスタンプ（created_at, updated_at）がない場合 false にする
    public $timestamps = false;

    // ホワイトリスト（保存可能なカラム）
    protected $fillable = ['name', 'address', 'login', 'password'];

    // リレーション（例: 購入履歴との関係）
    public function purchases()
    {
        return $this->hasMany(Purchase::class, 'customer_id', 'id');
    }

    // お気に入り商品
    public function favorites()
    {
        return $this->hasMany(Favorite::class, 'customer_id', 'id');
    }
}
?>
