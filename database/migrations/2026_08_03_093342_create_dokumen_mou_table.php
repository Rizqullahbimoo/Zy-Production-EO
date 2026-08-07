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
        Schema::create('dokumen_mou', function (Blueprint $table) {
            $table->id('id_mou');
            $table->unsignedBigInteger('id_pemesanan')->nullable();
            $table->unsignedBigInteger('id_request')->nullable();
            $table->string('file_draft')->nullable();
            $table->string('file_ttd_customer')->nullable();
            $table->string('file_final')->nullable();
            $table->enum('status_mou', ['belum_ada', 'menunggu_ttd_customer', 'menunggu_ttd_admin', 'selesai'])->default('belum_ada');
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->foreign('id_pemesanan')->references('id_pemesanan')->on('pemesanan')->onDelete('cascade');
            $table->foreign('id_request')->references('id_request')->on('request_custom_paket')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dokumen_mou');
    }
};
