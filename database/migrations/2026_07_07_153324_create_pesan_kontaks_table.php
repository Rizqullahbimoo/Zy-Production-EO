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
        Schema::create('pesan_kontaks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id_user')->on('users')->onDelete('cascade');
            $table->string('nama_lengkap');
            $table->string('kontak');
            $table->text('pesan');
            $table->text('balasan_admin')->nullable();
            $table->enum('status', ['belum_dibalas', 'dibalas'])->default('belum_dibalas');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pesan_kontaks');
    }
};
