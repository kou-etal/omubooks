<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('listing_images', function (Blueprint $table) {
    $table->id();
    $table->foreignId('listing_id')
          ->constrained('listings')
          ->cascadeOnUpdate()
          ->cascadeOnDelete();
    $table->string('path'); // S3 or storage の画像URL
    $table->timestamps();
});

}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_images');
    }
};

