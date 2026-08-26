<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Menyamakan alur pelunasan penawaran custom dengan pemesanan paket bawaan
 * (lihat 2026_08_23_000000_add_dp_paid_status_to_pemesanan.php) — sebelumnya
 * payment_status penawaran_custom langsung lompat ke 'paid' begitu DP settle
 * di Midtrans, padahal itu cuma DP (30%), dan tidak ada cara admin mencatat
 * pelunasan sisa pembayaran untuk custom paket.
 *
 * Migrasi ini menambah nilai enum 'dp_paid', menambah kolom id_penawaran ke
 * tabel pembayaran (supaya baris pembayaran bisa menunjuk ke pemesanan ATAU
 * penawaran custom), memindahkan data lama berstatus 'paid' ke 'dp_paid',
 * dan membackfill baris pembayaran untuk penawaran tersebut.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE penawaran_custom MODIFY payment_status ENUM('unpaid','pending','dp_paid','paid','failed','expired','refund') NOT NULL DEFAULT 'unpaid'");

        Schema::table('pembayaran', function (Blueprint $table) {
            $table->unsignedBigInteger('id_penawaran')->nullable()->after('id_pemesanan');

            $table->foreign('id_penawaran')
                ->references('id_penawaran')
                ->on('penawaran_custom')
                ->onDelete('cascade');
        });

        // id_pemesanan tidak lagi selalu wajib — baris pembayaran untuk
        // penawaran custom akan mengisi id_penawaran saja.
        DB::statement('ALTER TABLE pembayaran MODIFY id_pemesanan BIGINT UNSIGNED NULL');

        $affected = DB::table('penawaran_custom')
            ->where('payment_status', 'paid')
            ->select('id_penawaran', 'dp_awal', 'total_penawaran', 'updated_at')
            ->get();

        foreach ($affected as $row) {
            $sudahAdaPembayaran = DB::table('pembayaran')->where('id_penawaran', $row->id_penawaran)->exists();

            if (! $sudahAdaPembayaran) {
                $jumlahDp = $row->dp_awal ?: round((float) $row->total_penawaran * 0.3, 2);

                DB::table('pembayaran')->insert([
                    'id_penawaran' => $row->id_penawaran,
                    'created_id' => null,
                    'tanggal_bayar' => $row->updated_at,
                    'jumlah_bayar' => $jumlahDp,
                    'status_konfirmasi' => 'dikonfirmasi',
                    'catatan_admin' => 'Pembayaran DP via Midtrans (dicatat retroaktif saat migrasi status dp_paid).',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        DB::table('penawaran_custom')->where('payment_status', 'paid')->update(['payment_status' => 'dp_paid']);
    }

    public function down(): void
    {
        DB::table('penawaran_custom')->where('payment_status', 'dp_paid')->update(['payment_status' => 'paid']);

        DB::statement("ALTER TABLE penawaran_custom MODIFY payment_status ENUM('unpaid','pending','paid','failed','expired','refund') NOT NULL DEFAULT 'unpaid'");

        Schema::table('pembayaran', function (Blueprint $table) {
            $table->dropForeign(['id_penawaran']);
            $table->dropColumn('id_penawaran');
        });

        DB::statement('ALTER TABLE pembayaran MODIFY id_pemesanan BIGINT UNSIGNED NOT NULL');
    }
};
