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
        Schema::create('listings', function (Blueprint $table) {
            $table->id();

            // 出品者
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // 基本情報
            $table->string('title');            // 教科書名（必須）
            $table->string('course_name');      // 講義名（必須）
            $table->unsignedInteger('price');   // 価格（>=100 などはバリデーションで）
            $table->text('description')->nullable();

            // ステータス：draft=下書き, active=公開中, sold=売却済, hidden=非公開
            $table->enum('status', ['draft', 'active', 'sold', 'hidden'])
                  ->default('active')
                  ->index();

            // 画像（最大3枚）
            $table->string('image1')->nullable();
            $table->string('image2')->nullable();
            $table->string('image3')->nullable();

            // 検索最適化（前方一致・全文検索に備えて）
            $table->index(['title']);
            $table->index(['course_name']);
            // MySQLなら全文検索を使う場合（対応環境のみ）
            // $table->fullText(['title', 'course_name', 'description']);

            $table->timestamps();
            $table->softDeletes(); // 任意：削除ではなく非表示運用に便利
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
