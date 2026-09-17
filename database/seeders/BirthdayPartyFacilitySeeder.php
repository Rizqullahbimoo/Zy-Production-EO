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
 * 5. linkPaketKeFasilitas() menghubungkan SEMUA paket di kategori Birthday
 *    Party ke SEMUA fasilitas di kategori yang sama lewat detail_paket —
 *    pola persis DetailPaketWeddingOutboundSeeder (satu kategori = satu
 *    bundle fasilitas untuk semua paketnya, bukan pilihan sebagian per
 *    paket). Baris detail_paket lama untuk paket-paket itu dihapus dulu
 *    sebelum insert ulang supaya idempoten.
 * 6. updateDeskripsiPaket() mengganti deskripsi generik "Paket Sweet
 *    Seventeen" (dari DatabaseSeeder) dengan deskripsi yang di-generate
 *    (bukan dari dokumen resmi ZY Production — user tidak punya detail
 *    paket aslinya, dan secara eksplisit mengizinkan deskripsi digenerate
 *    sesuai preferensi umum paket ulang tahun).
 * 7. Jalankan dengan: php artisan db:seed --class=BirthdayPartyFacilitySeeder
 */
class BirthdayPartyFacilitySeeder extends Seeder
{
    private const NAMA_KATEGORI = 'Birthday Party';

    private const NAMA_PAKET = 'Paket Sweet Seventeen';

    private const DESKRIPSI_PAKET = 'Paket perayaan Sweet Seventeen untuk merayakan momen ulang tahun ke-17 yang berkesan. '
        .'Fasilitas: dekorasi panggung & backdrop foto sesuai tema, MC yang memandu jalannya acara, make up untuk tokoh utama, '
        .'entertainment (live music, keyboardist, sound system), serta dokumentasi lengkap foto dan video — seluruh persiapan '
        .'ditangani penuh oleh tim ZY Production dari konsep hingga hari-H.';

    public function run(): void
    {
        $totalFasilitas = 0;
        $totalDetail = 0;

        DB::transaction(function () use (&$totalFasilitas, &$totalDetail) {
            $idKategori = $this->getKategoriId(self::NAMA_KATEGORI);
            $totalFasilitas = $this->seedFasilitas($idKategori);
            $totalDetail = $this->linkPaketKeFasilitas($idKategori);
            $this->updateDeskripsiPaket($idKategori);
        });

        $this->command->info("BirthdayPartyFacilitySeeder selesai: {$totalFasilitas} fasilitas, {$totalDetail} baris detail_paket.");
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

    /**
     * Hubungkan setiap paket di $idKategori ke seluruh fasilitas di kategori
     * yang sama (qty=1, keterangan kosong) — mengembalikan jumlah baris
     * detail_paket yang dibuat.
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

        // Bersihkan dulu supaya idempoten (aman dijalankan ulang tanpa duplikat).
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

        DB::table('detail_paket')->insert($rows);

        return count($rows);
    }

    /**
     * Ganti deskripsi generik "Paket Sweet Seventeen" (dari DatabaseSeeder,
     * "Paket lengkap layanan Birthday Party dengan fasilitas terbaik.")
     * dengan deskripsi yang sesuai konteks 5 fasilitas yang baru dihubungkan.
     * No-op kalau paket dengan nama itu tidak ditemukan di kategori ini
     * (tidak melempar error — deskripsi cuma kosmetik, bukan prasyarat).
     */
    private function updateDeskripsiPaket(int $idKategori): void
    {
        DB::table('paket_layanan')
            ->where('id_kategori', $idKategori)
            ->where('nama_paket', self::NAMA_PAKET)
            ->update([
                'deskripsi' => self::DESKRIPSI_PAKET,
                'updated_at' => now(),
            ]);
    }
}
