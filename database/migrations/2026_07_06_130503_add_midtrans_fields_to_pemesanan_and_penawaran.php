<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah kolom jumlah_tamu ke tabel pemesanan.
     * Tambah kolom midtrans ke tabel pemesanan dan penawaran_custom.
     */
    public function up(): void
    {
        // ── Tambah jumlah_tamu + midtrans ke tabel pemesanan ──────────────────
        Schema::table('pemesanan', function (Blueprint $table) {
            $table->unsignedInteger('jumlah_tamu')->nullable()->after('lokasi_acara');
            $table->string('midtrans_order_id')->nullable()->unique()->after('catatan');
            $table->text('snap_token')->nullable()->after('midtrans_order_id');
            $table->enum('payment_status', [
                'unpaid', 'pending', 'paid', 'failed', 'expired', 'refund'
            ])->default('unpaid')->after('snap_token');
        });

        // ── Tambah midtrans ke tabel penawaran_custom ─────────────────────────
        Schema::table('penawaran_custom', function (Blueprint $table) {
            $table->string('midtrans_order_id')->nullable()->unique()->after('catatan_admin');
            $table->text('snap_token')->nullable()->after('midtrans_order_id');
            $table->enum('payment_status', [
                'unpaid', 'pending', 'paid', 'failed', 'expired', 'refund'
            ])->default('unpaid')->after('snap_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pemesanan', function (Blueprint $table) {
            $table->dropColumn(['jumlah_tamu', 'midtrans_order_id', 'snap_token', 'payment_status']);
        });

        Schema::table('penawaran_custom', function (Blueprint $table) {
            $table->dropColumn(['midtrans_order_id', 'snap_token', 'payment_status']);
        });
    }
};
