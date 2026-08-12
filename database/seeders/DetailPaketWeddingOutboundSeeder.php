<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * DetailPaketWeddingOutboundSeeder
 * ---------------------------------
 * Menghubungkan paket_layanan hasil WeddingOutboundSeeder ke fasilitas_layanan
 * terkait lewat tabel detail_paket, supaya chip/checklist fasilitas muncul
 * di halaman Detail Paket (konsisten dengan paket lama).
 *
 * Setiap paket di suatu kategori dihubungkan ke SELURUH fasilitas di kategori
 * yang sama (qty=1, keterangan kosong) — karena price list aslinya memang
 * satu paket bundling semua fasilitas kategori tersebut, bukan pilihan
 * sebagian fasilitas per paket.
 *
 * Skema detail_paket (dikonfirmasi live): id_detail_paket, id_paket,
 * id_fasilitas, qty (default 1), keterangan (nullable), timestamps.
 *
 * Idempotent: baris detail_paket lama untuk paket-paket target dihapus dulu
 * sebelum insert ulang, supaya seeder ini aman dijalankan berkali-kali tanpa
 * membuat duplikat.
 *
 * Prasyarat: WeddingOutboundSeeder sudah dijalankan lebih dulu.
 * Jalankan dengan: php artisan db:seed --class=DetailPaketWeddingOutboundSeeder
 */
class DetailPaketWeddingOutboundSeeder extends Seeder
{
    public function run(): void
    {
        $totalRows = 0;

        DB::transaction(function () use (&$totalRows) {
            $idWedding = $this->getKategoriId('Wedding Event');
            $idOutbound = $this->getKategoriId('Outbound');

            $totalRows += $this->linkPaketKeFasilitas($idWedding);
            $totalRows += $this->linkPaketKeFasilitas($idOutbound);
        });

        $this->command->info("DetailPaketWeddingOutboundSeeder selesai: {$totalRows} baris detail_paket dibuat.");
    }

    private function getKategoriId(string $nama): int
    {
        $row = DB::table('kategori_event')->where('nama_kategori', $nama)->first();

        if (! $row) {
            throw new \Exception("Kategori '{$nama}' tidak ditemukan di tabel kategori_event.");
        }

        return $row->id_kategori;
    }

    /**
     * Hubungkan setiap paket di $idKategori ke seluruh fasilitas di kategori yang sama.
     * Mengembalikan jumlah baris detail_paket yang dibuat.
     */
    private function linkPaketKeFasilitas(int $idKategori): int
    {
        $now = now();

        $paketIds = DB::table('paket_layanan')
            ->where('id_kategori', $idKategori)
            ->pluck('id_paket');

        $fasilitasIds = DB::table('fasilitas_layanan')
            ->where('id_kategori', $idKategori)
            ->pluck('id_fasilitas');

        if ($paketIds->isEmpty() || $fasilitasIds->isEmpty()) {
            return 0;
        }

        // Bersihkan dulu supaya idempotent (aman dijalankan ulang tanpa duplikat).
        DB::table('detail_paket')->whereIn('id_paket', $paketIds)->delete();

        $rows = [];
        foreach ($paketIds as $idPaket) {
            foreach ($fasilitasIds as $idFasilitas) {
                $rows[] = [
                    'id_paket' => $idPaket,
                    'id_fasilitas' => $idFasilitas,
                    'qty' => 1,
                    'keterangan' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // Insert per-chunk supaya aman untuk jumlah baris besar (20 paket x 10 fasilitas = 200 baris).
        foreach (array_chunk($rows, 100) as $chunk) {
            DB::table('detail_paket')->insert($chunk);
        }

        return count($rows);
    }
}
