<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
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
            $table->unsignedInteger('price');   // 価格
            $table->text('description')->nullable();

            // ステータス
            $table->enum('status', ['draft', 'active', 'sold', 'hidden'])
                  ->default('active')
                  ->index();

            // 画像（最大3枚）※現行仕様を維持
            $table->string('image1')->nullable();
            $table->string('image2')->nullable();
            $table->string('image3')->nullable();

            /**
             * ▼ タグ（絞り込み用）
             * 値は英字スラッグで保存し、フロント/リソースで日本語表記にマッピング
             */

            // 科目: 一般教養, 基礎教育科目, 専門科目, その他, なし
            $table->enum('tag_subject', [
                'liberal_arts',     // 一般教養
                'basic_education',  // 基礎教育科目
                'specialized',      // 専門科目
                'other',            // その他
                'none',             // なし
            ])->default('none')->index();

            // 分野: 数学, 物理, 化学, 生物, 英語, その他, なし
            $table->enum('tag_field', [
                'math','physics','chemistry','biology','english','other','none',
            ])->default('none')->index();

            // 学部（大阪公立大ver想定）+ その他/なし
            $table->enum('tag_faculty', [
                'modern_system_science', // 現代システム科学
                'law',        // 法学部
                'commerce',   // 商学部
                'engineering',// 工学部
                'veterinary', // 獣医学部
                'medicine',   // 医学部
                'human_life_science', // 生活科学部
                'letters',    // 文学部
                'economics',  // 経済学部
                'science',    // 理学部
                'agriculture',// 農学部
                'nursing',    // 看護学部
                'other', 'none',
            ])->default('none')->index();

            // 書き込みの有無: あり/なし → boolean で表現
            $table->boolean('has_writing')->default(false)->index();

            // 検索用インデックス
            $table->index(['title']);
            $table->index(['course_name']);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
