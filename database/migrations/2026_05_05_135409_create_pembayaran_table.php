<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pembayaran', function (Blueprint $table) {
            $table->unsignedBigInteger('id_pembayaran')->autoIncrement()->primary();
            $table->unsignedBigInteger('id_pemesanan');
            $table->unsignedBigInteger('created_id'); // id admin yang memproses
            $table->date('tanggal_bayar');
            $table->decimal('jumlah_bayar', 15, 2);
            $table->string('bukti_pembayaran')->nullable(); // path file/foto
            $table->enum('status_konfirmasi', [
                'menunggu',
                'dikonfirmasi',
                'ditolak'
            ])->default('menunggu');
            $table->text('catatan_admin')->nullable();
            $table->timestamps();

            $table->foreign('id_pemesanan')
                  ->references('id_pemesanan')
                  ->on('pemesanan')
                  ->onDelete('cascade');

            $table->foreign('created_id')
                  ->references('id_user')
                  ->on('users')
                  ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pembayaran');
    }
};