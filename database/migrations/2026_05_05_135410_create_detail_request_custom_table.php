<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detail_request_custom', function (Blueprint $table) {
            $table->unsignedBigInteger('id_detail_request')->autoIncrement()->primary();
            $table->unsignedBigInteger('id_request');
            $table->unsignedBigInteger('id_fasilitas');
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->foreign('id_request')
                  ->references('id_request')
                  ->on('request_custom_paket')
                  ->onDelete('cascade');

            $table->foreign('id_fasilitas')
                  ->references('id_fasilitas')
                  ->on('fasilitas_layanan')
                  ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detail_request_custom');
    }
};