<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detail_paket', function (Blueprint $table) {
            $table->unsignedBigInteger('id_detail_paket')->autoIncrement()->primary();
            $table->unsignedBigInteger('id_paket');
            $table->unsignedBigInteger('id_fasilitas');
            $table->integer('qty')->default(1);
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->foreign('id_paket')
                ->references('id_paket')
                ->on('paket_layanan')
                ->onDelete('cascade');

            $table->foreign('id_fasilitas')
                ->references('id_fasilitas')
                ->on('fasilitas_layanan')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detail_paket');
    }
};
