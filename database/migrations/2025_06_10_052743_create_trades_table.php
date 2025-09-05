<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
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

            // 金額系（円・税込想定／整数）
            $table->unsignedInteger('price');            // 商品価格（例: 3000）
            $table->unsignedInteger('platform_fee');     // プラットフォーム手数料（例: price*0.08 を丸め）

            // ステータス
            // pending_payment: 支払い手続き中（運営8%／出品者92%とも未済 or 片方済）
            // scheduled: 支払い確認後、受け渡し待ち（日時・場所はDMで調整）
            // completed: 受け渡し完了
            // cancelled: 取引キャンセル
            $table->enum('status', ['pending_payment', 'scheduled', 'completed', 'cancelled'])
                  ->default('pending_payment')
                  ->index();

            // 支払い確認フラグ（MVP：運営8%と出品者92%を個別に確認）
            $table->boolean('is_platform_fee_paid')->default(false);
            $table->boolean('is_seller_amount_paid')->default(false);

            // 任意メタ（将来の拡張用：支払いスクショURL、備考など）
            $table->json('meta')->nullable();

            $table->timestamps();

            // 一意性・整合性を高めるための実用的インデックス
            $table->index(['buyer_id', 'seller_id']);
            $table->index(['listing_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trades');
    }
};
