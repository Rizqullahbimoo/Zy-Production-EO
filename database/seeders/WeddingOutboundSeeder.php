<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * WeddingOutboundSeeder
 * ---------------------
 * Mengisi data Fasilitas Layanan dan Paket Layanan untuk kategori
 * "Wedding Event" dan "Outbound", berdasarkan price list resmi ZY Production
 * (AiR Organizer & Outbound Organizer).
 *
 * CATATAN:
 * 1. Nama kolom di bawah sudah dicocokkan dengan skema live database
 *    (paket_layanan: id_paket, id_kategori, nama_paket, deskripsi, harga,
 *    foto, status_paket, timestamps — TIDAK ada kolom 'keterangan'; dan
 *    fasilitas_layanan: id_fasilitas, id_kategori, nama_fasilitas, deskripsi,
 *    timestamps — TIDAK ada kolom 'harga_estimasi'). Estimasi harga per
 *    fasilitas dilipat ke dalam teks 'deskripsi' agar informasinya tidak hilang.
 * 2. Seeder ini mengasumsikan kategori "Wedding Event" dan "Outbound" SUDAH ADA
 *    di tabel kategori_event (tidak dibuat ulang di sini), dan saat ini
 *    KOSONG dari paket (sudah dibersihkan lewat proses cleanup sebelumnya).
 * 3. Kolom 'foto' pada paket_layanan diisi NULL karena seeder tidak
 *    meng-upload file gambar. Tambahkan/upload foto manual lewat form admin
 *    setelah seeding jika diperlukan.
 * 4. Jalankan dengan: php artisan db:seed --class=WeddingOutboundSeeder
 */
class WeddingOutboundSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $idWedding  = $this->getKategoriId('Wedding Event');
            $idOutbound = $this->getKategoriId('Outbound');

            $this->seedFasilitas($idWedding, $idOutbound);
            $this->seedPaketWedding($idWedding);
            $this->seedPaketOutbound($idOutbound);
        });

        $this->command->info('WeddingOutboundSeeder selesai: 12 fasilitas, 24 paket ditambahkan.');
    }

    /**
     * Ambil id_kategori berdasarkan nama kategori.
     */
    private function getKategoriId(string $nama): int
    {
        $row = DB::table('kategori_event')->where('nama_kategori', $nama)->first();

        if (! $row) {
            throw new \Exception("Kategori '{$nama}' tidak ditemukan di tabel kategori_event. " .
                "Pastikan kategori ini sudah dibuat sebelum menjalankan seeder.");
        }

        return $row->id_kategori;
    }

    private function seedFasilitas(int $idWedding, int $idOutbound): void
    {
        $now = now();

        $fasilitasWedding = [
            [
                'nama_fasilitas' => 'MC',
                'deskripsi'      => 'Derry Emilga, Nanda Futhia, Koko Imam, Dewi Satya, atau Anggun Muetia — akad & resepsi (1 hari)',
                'harga_estimasi' => 1200000,
            ],
            [
                'nama_fasilitas' => 'Tari Tradisional',
                'deskripsi'      => 'Sanggar Nuo Sikep (reguler) atau Sanggar Bunga Mayang dengan live musik (Gedung Besar)',
                'harga_estimasi' => 600000,
            ],
            [
                'nama_fasilitas' => 'Dekorasi Akad & Resepsi',
                'deskripsi'      => 'Dekadi, Evi Dec, Yogi, atau Yugo (reguler); Moelia atau Kencana (tier Heavently) — dekorasi pelaminan utama, properti akad, taman depan pelaminan, gazebo, standing bunga hidup, lorong buku tamu, meja buku tamu, hand bouquet, rias mobil pengantin',
                'harga_estimasi' => 9000000,
            ],
            [
                'nama_fasilitas' => 'Attire',
                'deskripsi'      => 'Dewi Sadewo, Nuo Lambra, Rya Attire, atau Sewa Jas Kebaya BDL — baju pengantin akad & resepsi, 2 baju ibu, 2 baju bapak, kain pengantin, kain orang tua',
                'harga_estimasi' => 4800000,
            ],
            [
                'nama_fasilitas' => 'Catering',
                'deskripsi'      => 'Livia, Modern, atau Humma (reguler); Moelia, Rice Table, atau Nugraha (skala 1000 pax) — 3 menu utama, pondokan, meja prasmanan, meja VIP, dekorasi catering, peralatan makan, parcel, crew catering',
                'harga_estimasi' => 21000000,
            ],
            [
                'nama_fasilitas' => 'MUA',
                'deskripsi'      => 'Rya Wedding, Eva Twiny, Restika, Senna, Desna, Nadia Aulia, atau Martavia (reguler); Anggry Amelia, Anastasya Baya, Rangga Juans, atau Rias Id (Gedung Besar) — make up pengantin akad, retouch, make up 2 ibu, henna, soft lens, aksesoris adat & modern',
                'harga_estimasi' => 6000000,
            ],
            [
                'nama_fasilitas' => 'Dokumentasi',
                'deskripsi'      => 'Metamorphosis, Legras, atau Wahyu Fo (reguler); Helo Word, Ligart, atau Ellviera Timeless (tier Heavently) — album hardcover, album magnetik, cetak 22R+frame, video liputan, video cinematic, seluruh file flashdisk',
                'harga_estimasi' => 7200000,
            ],
            [
                'nama_fasilitas' => 'Entertainment',
                'deskripsi'      => 'Coco Entertainment, Eqhies Enterprise, atau Al Kahfi Voice — 2 singer, keyboardist, saxophone, sound system, mic wireless (Gedung Besar tambah gitar & drum elektrik)',
                'harga_estimasi' => 6000000,
            ],
            [
                'nama_fasilitas' => 'Jasa WO Full Service',
                'deskripsi'      => 'Tim 9-14 orang (menyesuaikan skala venue) — MoU Paket Planner, meeting konsep acara, rundown booklet, pendampingan hunting & fitting attire, koordinasi vendor, gladi & cek lokasi H-1, organize on the day',
                'harga_estimasi' => 4200000,
            ],
            [
                'nama_fasilitas' => 'Bonus',
                'deskripsi'      => 'Kotak hantaran 10-13 box, wedding content creator, make up sister 2 orang, tas 2 ibu, buku tamu, konfeti, hand bouquet',
                'harga_estimasi' => 0,
            ],
        ];

        $fasilitasOutbound = [
            [
                'nama_fasilitas' => 'Tim Outbound',
                'deskripsi'      => 'Team Leader Outbound & Fasilitator Outbound',
                'harga_estimasi' => 900000,
            ],
            [
                'nama_fasilitas' => 'Peralatan & Program',
                'deskripsi'      => 'Peralatan outbound, setting outdoor games, 3 sesi (Fun Games, Team Building, Outbound dengan Alat), total 7 game, obat-obatan P3K, speaker portable',
                'harga_estimasi' => 500000,
            ],
        ];

        foreach ($fasilitasWedding as $f) {
            $this->insertFasilitas($idWedding, $f, $now);
        }

        foreach ($fasilitasOutbound as $f) {
            $this->insertFasilitas($idOutbound, $f, $now);
        }
    }

    /**
     * Insert satu baris fasilitas_layanan. Kolom 'harga_estimasi' tidak ada
     * di skema, jadi nilainya dilipat ke akhir teks deskripsi (kalau > 0).
     */
    private function insertFasilitas(int $idKategori, array $f, $now): void
    {
        $deskripsi = $f['deskripsi'];
        if (! empty($f['harga_estimasi'])) {
            $deskripsi .= ' — Estimasi: Rp '.number_format($f['harga_estimasi'], 0, ',', '.');
        }

        DB::table('fasilitas_layanan')->insert([
            'id_kategori'    => $idKategori,
            'nama_fasilitas' => $f['nama_fasilitas'],
            'deskripsi'      => $deskripsi,
            'created_at'     => $now,
            'updated_at'     => $now,
        ]);
    }

    private function seedPaketWedding(int $idKategori): void
    {
        $now = now();

        $fasilitasUmum = 'venue lengkap, MC, tari tradisional, dekorasi akad & resepsi, attire, catering, MUA, dokumentasi, entertainment, jasa WO full service, bonus';

        $paketGedungKecil = [
            ['Wisma Haji', 99000000],
            ['LPMP', 99000000],
            ['Museum', 97000000],
            ['Graha Gading', 96000000],
        ];

        $paketGedungMiddle = [
            ['Ernawan', 128000000],
            ['Pramuka', 131000000],
            ['Univ. Saburai', 125000000],
            ['Al Furqon', 123000000],
            ['Golkar', 129000000],
            ['GSG UIN', 146000000],
        ];

        $paketGedungBesarSerenity = [
            ['Krakatau', 188000000],
            ['MM UBL', 169500000],
            ['Ballroom UIN', 170500000],
            ['UMITRA', 182500000],
            ['Bagas', 202500000],
        ];

        $paketGedungBesarHeavently = [
            ['Krakatau', 217000000],
            ['MM UBL', 210500000],
            ['Ballroom UIN', 219500000],
            ['UMITRA', 216500000],
            ['Bagas', 251500000],
        ];

        foreach ($paketGedungKecil as [$venue, $harga]) {
            $this->insertPaket($idKategori, "Wedding - Gedung Kecil ($venue)", $harga,
                "Venue $venue, kapasitas 500 pax. Fasilitas: $fasilitasUmum (kursi tamu+sarung, ruang transit, AC, panggung pelaminan, sofa+meja, toilet, parkir).", $now);
        }

        foreach ($paketGedungMiddle as [$venue, $harga]) {
            $this->insertPaket($idKategori, "Wedding - Gedung Middle ($venue)", $harga,
                "Venue $venue, kapasitas 700 pax. Fasilitas: $fasilitasUmum.", $now);
        }

        foreach ($paketGedungBesarSerenity as [$venue, $harga]) {
            $this->insertPaket($idKategori, "Wedding - Gedung Besar Serenity ($venue)", $harga,
                "Venue $venue, kapasitas 1000 pax, tier Serenity. Fasilitas: $fasilitasUmum (+ruang VIP prasmanan, panggung musik permanen, surat izin keramaian).", $now);
        }

        foreach ($paketGedungBesarHeavently as [$venue, $harga]) {
            $this->insertPaket($idKategori, "Wedding - Gedung Besar Heavently ($venue)", $harga,
                "Venue $venue, kapasitas 1000 pax, tier Heavently (fasilitas premium). Fasilitas: $fasilitasUmum (entertainment lengkap +gitar, drum elektrik).", $now);
        }
    }

    private function seedPaketOutbound(int $idKategori): void
    {
        $now = now();

        $deskripsiDasar = 'Fasilitas: Team Leader & Fasilitator Outbound, peralatan lengkap, 3 sesi (Fun Games, Team Building, Outbound dengan Alat), total 7 game, obat-obatan P3K, speaker portable.';

        $paketOutbound = [
            ['Outbound 10-30 Peserta', 3000000, "Untuk 10-30 peserta. $deskripsiDasar"],
            ['Outbound 31-60 Peserta', 4000000, "Untuk 31-60 peserta. $deskripsiDasar"],
            ['Outbound 61-90 Peserta', 5000000, "Untuk 61-90 peserta. $deskripsiDasar"],
            ['Outbound 91-150 Peserta', 6000000, "Untuk 91-150 peserta. $deskripsiDasar"],
        ];

        foreach ($paketOutbound as [$nama, $harga, $deskripsi]) {
            $this->insertPaket($idKategori, $nama, $harga, $deskripsi, $now);
        }
    }

    /**
     * Helper insert satu baris paket_layanan.
     * Kolom disesuaikan dengan skema live database (tidak ada 'keterangan').
     */
    private function insertPaket(int $idKategori, string $nama, int $harga, string $deskripsi, $now): void
    {
        DB::table('paket_layanan')->insert([
            'id_kategori'  => $idKategori,
            'nama_paket'   => $nama,
            'harga'        => $harga,
            'deskripsi'    => $deskripsi,
            'foto'         => null, // upload manual lewat form admin jika perlu
            'status_paket' => 'aktif',
            'created_at'   => $now,
            'updated_at'   => $now,
        ]);
    }
}
