<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('request_custom_paket', function (Blueprint $table) {
            $table->unsignedBigInteger('id_request')->autoIncrement()->primary();
            $table->unsignedBigInteger('id_user');
            $table->unsignedBigInteger('id_kategori');
            $table->date('tanggal_request');
            $table->date('tanggal_acara');
            $table->string('lokasi_acara');
            $table->integer('jumlah_tamu');
            $table->decimal('budget_acara', 15, 2)->nullable();
            $table->text('catatan')->nullable();
            $table->enum('status_request', [
                'menunggu',
                'diproses',
                'ditawarkan',
                'diterima',
                'ditolak',
                'selesai'
            ])->default('menunggu');
            $table->timestamps();

            $table->foreign('id_user')
                  ->references('id_user')
                  ->on('users')
                  ->onDelete('restrict');

            $table->foreign('id_kategori')
                  ->references('id_kategori')
                  ->on('kategori_event')
                  ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('request_custom_paket');
    }
};