<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Menambah kolom `jenis` (dp/pelunasan) ke tabel pembayaran, supaya Laporan
 * Keuangan bisa membedakan tiap baris pembayaran tanpa menebak dari urutan.
 *
 * Data lama tetap direkonstruksi dari urutan kronologis (satu-satunya cara
 * merekonstruksi histori, karena kolom ini belum ada saat baris itu dibuat):
 * baris pertama per pemesanan/penawaran = 'dp', baris berikutnya = 'pelunasan'.
 * Ini valid karena recordPayment() selalu mensyaratkan status sudah 'dp_paid'
 * lebih dulu — jadi baris DP selalu tercatat sebelum baris pelunasan mana pun.
 *
 * Untuk baris baru ke depannya, jenis diisi eksplisit oleh masing-masing jalur
 * kode saat baris dibuat (MidtransController = 'dp', recordPayment = 'pelunasan')
 * — tidak ada lagi inferensi dari urutan setelah migrasi ini.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pembayaran', function (Blueprint $table) {
            $table->enum('jenis', ['dp', 'pelunasan'])->nullable()->after('id_penawaran');
        });

        $parents = DB::table('pembayaran')
            ->select('id_pemesanan', 'id_penawaran')
            ->distinct()
            ->get();

        foreach ($parents as $parent) {
            $query = DB::table('pembayaran');

            if ($parent->id_pemesanan) {
                $query->where('id_pemesanan', $parent->id_pemesanan);
            } else {
                $query->where('id_penawaran', $parent->id_penawaran);
            }

            $rows = (clone $query)->orderBy('tanggal_bayar')->orderBy('id_pembayaran')->pluck('id_pembayaran');

            foreach ($rows as $index => $idPembayaran) {
                DB::table('pembayaran')
                    ->where('id_pembayaran', $idPembayaran)
                    ->update(['jenis' => $index === 0 ? 'dp' : 'pelunasan']);
            }
        }

        DB::statement("ALTER TABLE pembayaran MODIFY jenis ENUM('dp','pelunasan') NOT NULL");
    }

    public function down(): void
    {
        Schema::table('pembayaran', function (Blueprint $table) {
            $table->dropColumn('jenis');
        });
    }
};
