<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();

            // どの取引に対するレビューか
            $table->foreignId('trade_id')
                ->constrained('trades')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // 評価する人 / される人
            $table->foreignId('rater_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignId('ratee_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // スコア＆コメント
            $table->unsignedTinyInteger('score')  // 1〜5想定
                  ->comment('1-5');
            $table->text('comment')->nullable();

            // 両者レビューが揃うまで非公開
            $table->boolean('is_public')->default(false)->index();

            // 不正防止：同一取引で同一raterは一度だけ
            $table->unique(['trade_id', 'rater_id']);

            // よく使う検索用
            $table->index(['ratee_id', 'is_public', 'created_at']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
