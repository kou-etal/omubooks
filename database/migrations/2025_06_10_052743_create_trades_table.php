<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Run the migrations. */
    public function up(): void
    {
        Schema::create('trades', function (Blueprint $table) {
            $table->id();

            // 参加者
            $table->foreignId('buyer_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('seller_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // 対象商品
            $table->foreignId('listing_id')
                ->constrained('listings')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // 金額系（円・税込／整数）
            $table->unsignedInteger('price');                 // 商品価格（例: 3000）
            $table->unsignedInteger('platform_fee')->default(0); // プラットフォーム手数料（0%運用時は常に0を焼き付け）

            // ステータス
            // pending_payment: 支払い/調整中（0%運用中でも既存フロー維持）
            // scheduled: 受け渡し待ち（日時・場所はDMで調整）
            // completed: 双方が完了フラグ押下で完了
            // cancelled: キャンセル
            $table->enum('status', ['pending_payment', 'scheduled', 'completed', 'cancelled'])
                  ->default('pending_payment')
                  ->index();

            // 支払い確認フラグ（0%運用のため現在は参照停止。将来復帰用に保持）
            $table->boolean('is_platform_fee_paid')->default(false);
            $table->boolean('is_seller_amount_paid')->default(false);

            // 双方完了フラグ（評価解放の前段）
            $table->boolean('buyer_completed')->default(false);
            $table->boolean('seller_completed')->default(false);

            // 任意メタ（支払いスクショURL、備考など）
            $table->json('meta')->nullable();

            $table->timestamps();

            // 実用インデックス
            $table->index(['buyer_id', 'seller_id']);
            $table->index(['listing_id', 'status']);
        });
    }

    /** Reverse the migrations. */
    public function down(): void
    {
        Schema::dropIfExists('trades');
    }
};
