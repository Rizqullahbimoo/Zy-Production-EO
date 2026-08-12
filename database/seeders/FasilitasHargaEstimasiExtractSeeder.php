<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * FasilitasHargaEstimasiExtractSeeder
 * ------------------------------------
 * Script SEKALI-JALAN (one-time data migration): memindahkan angka estimasi
 * harga yang sebelumnya dilipat ke akhir teks 'deskripsi' oleh
 * WeddingOutboundSeeder (format "... — Estimasi: Rp 1.200.000") ke kolom
 * 'harga_estimasi' yang baru ditambahkan lewat migration
 * 2026_08_12_210814_add_harga_estimasi_to_fasilitas_layanan_table.
 *
 * Untuk setiap baris fasilitas_layanan yang deskripsinya cocok pola
 * " — Estimasi: Rp <angka>" di akhir teks:
 *   1. Angka di-parse (format ribuan pakai titik, mis. "1.200.000" -> 1200000)
 *      dan disimpan ke harga_estimasi.
 *   2. Suffix " — Estimasi: Rp <angka>" dihapus dari deskripsi, sisakan teks bersih.
 *
 * Fasilitas "Bonus" (id_fasilitas=13) sengaja TIDAK punya suffix ini karena
 * estimasi aslinya Rp 0 (bonus/gratis) sehingga tidak pernah dilipat ke teks
 * oleh seeder awal — baris ini di-set eksplisit ke harga_estimasi=0, bukan
 * dibiarkan NULL, supaya tetap merepresentasikan nilai aslinya untuk admin.
 *
 * Idempotent: hanya memproses baris yang deskripsinya masih mengandung
 * "Estimasi: Rp", jadi aman dijalankan ulang tanpa efek samping.
 *
 * Jalankan dengan: php artisan db:seed --class=FasilitasHargaEstimasiExtractSeeder
 */
class FasilitasHargaEstimasiExtractSeeder extends Seeder
{
    public function run(): void
    {
        $updated = 0;

        DB::transaction(function () use (&$updated) {
            $rows = DB::table('fasilitas_layanan')
                ->where('deskripsi', 'like', '%Estimasi: Rp%')
                ->get();

            foreach ($rows as $row) {
                if (! preg_match('/\s*—\s*Estimasi:\s*Rp\s*([\d.]+)\s*$/u', $row->deskripsi, $m)) {
                    continue;
                }

                $hargaEstimasi = (int) str_replace('.', '', $m[1]);
                $deskripsiBersih = trim(preg_replace('/\s*—\s*Estimasi:\s*Rp\s*[\d.]+\s*$/u', '', $row->deskripsi));

                DB::table('fasilitas_layanan')
                    ->where('id_fasilitas', $row->id_fasilitas)
                    ->update([
                        'harga_estimasi' => $hargaEstimasi,
                        'deskripsi' => $deskripsiBersih,
                        'updated_at' => now(),
                    ]);

                $updated++;
            }

            // Fasilitas "Bonus": estimasi asli Rp 0, tidak pernah punya suffix teks.
            // Set eksplisit supaya kolom baru tetap merepresentasikan nilai aslinya.
            DB::table('fasilitas_layanan')
                ->where('nama_fasilitas', 'Bonus')
                ->whereNull('harga_estimasi')
                ->update(['harga_estimasi' => 0, 'updated_at' => now()]);
        });

        $this->command->info("FasilitasHargaEstimasiExtractSeeder selesai: {$updated} baris diekstrak dari deskripsi.");
    }
}
