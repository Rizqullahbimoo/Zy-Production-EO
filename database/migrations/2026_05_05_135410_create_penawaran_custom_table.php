<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('penawaran_custom', function (Blueprint $table) {
            $table->unsignedBigInteger('id_penawaran')->autoIncrement()->primary();
            $table->unsignedBigInteger('id_request');
            $table->date('tanggal_penawaran');
            $table->decimal('total_penawaran', 15, 2);
            $table->decimal('dp_awal', 15, 2)->nullable();
            $table->enum('status_penawaran', [
                'menunggu',
                'diterima',
                'ditolak',
                'direvisi',
            ])->default('menunggu');
            $table->text('catatan_admin')->nullable();
            $table->timestamps();

            $table->foreign('id_request')
                ->references('id_request')
                ->on('request_custom_paket')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('penawaran_custom');
    }
};
