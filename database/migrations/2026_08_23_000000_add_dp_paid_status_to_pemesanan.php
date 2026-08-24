<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Sebelumnya payment_status hanya punya 'paid' untuk menandai pembayaran via
 * Midtrans — padahal Midtrans di sistem ini SELALU cuma nge-charge DP (30%),
 * tidak pernah harga penuh. Ini bikin admin melihat "Lunas" padahal yang
 * masuk baru DP, dan tidak ada cara mencatat sisa pembayaran karena tidak
 * ada status "DP sudah lunas, menunggu pelunasan" yang eksplisit.
 *
 * Migrasi ini menambah nilai enum 'dp_paid', memindahkan data lama yang
 * berstatus 'paid' (yang secara faktual semuanya adalah DP) ke 'dp_paid',
 * dan membackfill baris `pembayaran` untuk pemesanan tersebut supaya
 * riwayat pembayarannya tidak kosong begitu fitur pencatatan pelunasan
 * manual mulai dipakai.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE pemesanan MODIFY payment_status ENUM('unpaid','pending','dp_paid','paid','failed','expired','refund') NOT NULL DEFAULT 'unpaid'");

        // created_id ("admin yang memproses") harus nullable — pembayaran DP
        // yang dicatat otomatis dari webhook Midtrans tidak punya admin di baliknya.
        DB::statement('ALTER TABLE pembayaran MODIFY created_id BIGINT UNSIGNED NULL');

        $affected = DB::table('pemesanan as p')
            ->join('paket_layanan as pl', 'pl.id_paket', '=', 'p.id_paket')
            ->where('p.payment_status', 'paid')
            ->select('p.id_pemesanan', 'p.dp_amount', 'p.updated_at', 'pl.harga')
            ->get();

        foreach ($affected as $row) {
            $sudahAdaPembayaran = DB::table('pembayaran')->where('id_pemesanan', $row->id_pemesanan)->exists();

            if (! $sudahAdaPembayaran) {
                $jumlahDp = $row->dp_amount ?: round((float) $row->harga * 0.3, 2);

                DB::table('pembayaran')->insert([
                    'id_pemesanan' => $row->id_pemesanan,
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

        DB::table('pemesanan')->where('payment_status', 'paid')->update(['payment_status' => 'dp_paid']);
    }

    public function down(): void
    {
        DB::table('pemesanan')->where('payment_status', 'dp_paid')->update(['payment_status' => 'paid']);

        DB::statement("ALTER TABLE pemesanan MODIFY payment_status ENUM('unpaid','pending','paid','failed','expired','refund') NOT NULL DEFAULT 'unpaid'");

        DB::statement('ALTER TABLE pembayaran MODIFY created_id BIGINT UNSIGNED NOT NULL');
    }
};
