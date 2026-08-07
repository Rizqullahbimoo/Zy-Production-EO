<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pemesanan', function (Blueprint $table) {
            $table->unsignedBigInteger('id_pemesanan')->autoIncrement()->primary();
            $table->unsignedBigInteger('id_user');
            $table->unsignedBigInteger('id_paket');
            $table->string('kode_pemesanan')->unique();
            $table->date('tanggal_pemesanan');
            $table->date('tanggal_acara');
            $table->string('lokasi_acara');
            $table->enum('status_pemesanan', [
                'menunggu',
                'dikonfirmasi',
                'dibatalkan',
                'selesai',
            ])->default('menunggu');
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->foreign('id_user')
                ->references('id_user')
                ->on('users')
                ->onDelete('restrict');

            $table->foreign('id_paket')
                ->references('id_paket')
                ->on('paket_layanan')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pemesanan');
    }
};
