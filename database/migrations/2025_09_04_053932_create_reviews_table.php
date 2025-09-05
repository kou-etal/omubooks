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
            $table->unsignedTinyInteger('score')  // 1〜5想定（バリデーションで縛る）
                  ->comment('1-5');
            $table->text('comment')->nullable();

            // 不正防止用：同一取引で同一raterが複数レビューできない
            $table->unique(['trade_id', 'rater_id']);

            // よく使う検索用
            $table->index(['ratee_id', 'created_at']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
