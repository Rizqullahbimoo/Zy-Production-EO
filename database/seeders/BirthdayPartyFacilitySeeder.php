<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * BirthdayPartyFacilitySeeder
 * ----------------------------
 * Mengisi 5 baris fasilitas_layanan untuk kategori "Birthday Party",
 * mengikuti pola vendor yang sama seperti kategori Wedding Event
 * (WeddingOutboundSeeder), disesuaikan konteksnya untuk acara ulang tahun.
 *
 * CATATAN:
 * 1. Skema live (dikonfirmasi lewat query langsung sebelum menulis seeder
 *    ini): fasilitas_layanan (id_fasilitas, id_kategori, nama_fasilitas,
 *    deskripsi, harga_estimasi nullable, timestamps).
 * 2. harga_estimasi SENGAJA dibiarkan NULL untuk kelima fasilitas ini —
 *    atas instruksi eksplisit user (bukan lupa diisi), berbeda dengan
 *    fasilitas Wedding Event yang harga_estimasi-nya sudah terisi.
 * 3. Fasilitas Birthday Party ini adalah baris BARU yang independen dari
 *    fasilitas Wedding Event manapun (fasilitas_layanan.id_kategori
 *    membuat setiap kategori punya daftar fasilitasnya sendiri) — bukan
 *    reuse/reference ke baris Wedding, sesuai desain sistem yang sudah ada.
 * 4. Idempoten: tiap fasilitas di-updateOrCreate by (id_kategori,
 *    nama_fasilitas) — aman dijalankan berkali-kali tanpa duplikasi.
 * 5. Jalankan dengan: php artisan db:seed --class=BirthdayPartyFacilitySeeder
 */
class BirthdayPartyFacilitySeeder extends Seeder
{
    private const NAMA_KATEGORI = 'Birthday Party';

    public function run(): void
    {
        $totalRows = 0;

        DB::transaction(function () use (&$totalRows) {
            $idKategori = $this->getKategoriId(self::NAMA_KATEGORI);
            $totalRows = $this->seedFasilitas($idKategori);
        });

        $this->command->info("BirthdayPartyFacilitySeeder selesai: {$totalRows} fasilitas ditambahkan/diperbarui.");
    }

    private function getKategoriId(string $nama): int
    {
        $row = DB::table('kategori_event')->where('nama_kategori', $nama)->first();

        if (! $row) {
            throw new \Exception("Kategori '{$nama}' tidak ditemukan di tabel kategori_event. ".
                'Pastikan kategori ini sudah dibuat sebelum menjalankan seeder.');
        }

        return $row->id_kategori;
    }

    private function seedFasilitas(int $idKategori): int
    {
        $now = now();

        $fasilitas = [
            [
                'nama_fasilitas' => 'Dekorasi',
                'deskripsi' => 'Dekadi, Evi Dec, Yogi, atau Yugo (reguler); Moelia atau Kencana (tier premium) — dekorasi panggung utama sesuai tema ulang tahun, backdrop foto, standing bunga/balon, meja kue, dekorasi jalan menuju venue',
            ],
            [
                'nama_fasilitas' => 'MC',
                'deskripsi' => 'Derry Emilga, Nanda Futhia, Koko Imam, Dewi Satya, atau Anggun Muetia — pemandu acara ulang tahun (1 hari)',
            ],
            [
                'nama_fasilitas' => 'MUA',
                'deskripsi' => 'Rya Wedding, Eva Twiny, Restika, Senna, Desna, Nadia Aulia, atau Martavia (reguler); Anggry Amelia, Anastasya Baya, Rangga Juans, atau Rias Id (tier premium) — make up ulang tahun/tokoh utama, retouch, soft lens, aksesoris modern',
            ],
            [
                'nama_fasilitas' => 'Entertainment',
                'deskripsi' => 'Coco Entertainment, Eqhies Enterprise, atau Al Kahfi Voice — singer, keyboardist, saxophone, sound system, mic wireless (tier venue besar tambah gitar & drum elektrik)',
            ],
            [
                'nama_fasilitas' => 'Dokumentasi',
                'deskripsi' => 'Metamorphosis, Legras, atau Wahyu Fo (reguler); Helo Word, Ligart, atau Ellviera Timeless (tier premium) — album hardcover, cetak foto + frame, video liputan, video cinematic, seluruh file flashdisk',
            ],
        ];

        $count = 0;
        foreach ($fasilitas as $f) {
            $existing = DB::table('fasilitas_layanan')
                ->where('id_kategori', $idKategori)
                ->where('nama_fasilitas', $f['nama_fasilitas'])
                ->first();

            $payload = [
                'id_kategori' => $idKategori,
                'nama_fasilitas' => $f['nama_fasilitas'],
                'deskripsi' => $f['deskripsi'],
                'harga_estimasi' => null, // sengaja dikosongkan atas instruksi user
                'updated_at' => $now,
            ];

            if ($existing) {
                DB::table('fasilitas_layanan')->where('id_fasilitas', $existing->id_fasilitas)->update($payload);
            } else {
                $payload['created_at'] = $now;
                DB::table('fasilitas_layanan')->insert($payload);
            }

            $count++;
        }

        return $count;
    }
}
