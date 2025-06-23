<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('product', function (Blueprint $table) {
            $table->id(); // id BIGINT AUTO_INCREMENT PRIMARY KEY
            $table->string('name');
            $table->integer('price');
            // DBにないimage/detailは省略
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product');
    }
};
