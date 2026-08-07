<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paket_layanan', function (Blueprint $table) {
            $table->unsignedBigInteger('id_paket')->autoIncrement()->primary();
            $table->unsignedBigInteger('id_kategori');
            $table->string('nama_paket');
            $table->text('deskripsi')->nullable();
            $table->decimal('harga', 15, 2);
            $table->string('foto')->nullable();
            $table->enum('status_paket', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamps();

            $table->foreign('id_kategori')
                  ->references('id_kategori')
                  ->on('kategori_event')
                  ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paket_layanan');
    }
};