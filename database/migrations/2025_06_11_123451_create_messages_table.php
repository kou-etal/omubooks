<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();

            // どの取引(DMスレッド)か
            $table->foreignId('trade_id')
                ->constrained('trades')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // 送信者・受信者
            $table->foreignId('from_user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('to_user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // メッセージ本文
            $table->text('body')->nullable()->comment('テキスト本文');

            // 添付ファイル(JSON) → 画像やPayPayリンクを配列で保持
            // 例: ["https://s3.ap-northeast-1.amazonaws.com/app/uploads/paypay_qr.png"]
            $table->json('attachments')->nullable();

            // 運営システムメッセージかどうか
            $table->boolean('is_system')->default(false)
                  ->comment('trueなら運営による自動送信');

            $table->timestamps();

            // よく使うインデックス
            $table->index(['trade_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
