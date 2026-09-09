<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * StudyFieldPackageSeeder
 * -----------------------
 * Mengisi data Fasilitas Layanan dan Paket Layanan untuk kategori
 * "Study Field", berdasarkan dokumen penawaran resmi ZY Production
 * (Field Study Bali–Bromo–Yogyakarta 8 Hari 7 Malam).
 *
 * CATATAN:
 * 1. Skema live (dikonfirmasi lewat Schema::getColumns() sebelum menulis
 *    seeder ini): paket_layanan (id_paket, id_kategori, nama_paket,
 *    deskripsi, harga, foto, status_paket, timestamps — TIDAK ada kolom
 *    'keterangan'/'catatan' terpisah); fasilitas_layanan (id_fasilitas,
 *    id_kategori, nama_fasilitas, deskripsi, harga_estimasi, timestamps);
 *    detail_paket (id_detail_paket, id_paket, id_fasilitas, qty NOT NULL,
 *    keterangan nullable, timestamps).
 * 2. Karena tidak ada kolom 'keterangan'/'catatan' di paket_layanan, baris
 *    "Keterangan" (PP 8H7M, hotel bintang 3, bus SUMEX 97) dan "Catatan"
 *    (item harga tidak termasuk) DIGABUNG ke kolom 'deskripsi' sebagai
 *    paragraf terstruktur — konsisten dengan pola WeddingOutboundSeeder.
 * 3. Fasilitas yang kuantitasnya berupa durasi/frekuensi teks (hotel 3
 *    malam, konsumsi 3x/hari, dst.) — qty di detail_paket diseragamkan
 *    qty=1 untuk SEMUA 13 fasilitas (termasuk yang non-numerik seperti
 *    "sesuai itinerary"/"sesuai kebutuhan"), detail durasi/frekuensi
 *    lengkap tetap disimpan utuh sebagai teks di kolom 'keterangan'
 *    detail_paket — supaya frontend tidak salah menampilkan badge "(x3)"
 *    yang bisa disalahartikan customer.
 * 4. harga_estimasi per fasilitas TIDAK diisi (null) — dokumen sumber
 *    hanya memberi harga di level paket (Rp 3.500.000/orang), bukan per
 *    fasilitas individual.
 * 5. Idempoten: kategori di-updateOrCreate by nama_kategori, paket
 *    di-updateOrCreate by (id_kategori, nama_paket), fasilitas
 *    di-updateOrCreate by (id_kategori, nama_fasilitas), dan baris
 *    detail_paket untuk paket ini dihapus-lalu-insert-ulang setiap run
 *    (pola sama seperti DetailPaketWeddingOutboundSeeder) — aman
 *    dijalankan berkali-kali tanpa duplikat.
 * 6. Kolom 'foto' pada paket_layanan diisi NULL — upload manual lewat
 *    form admin setelah seeding.
 * 7. Jalankan dengan: php artisan db:seed --class=StudyFieldPackageSeeder
 */
class StudyFieldPackageSeeder extends Seeder
{
    private const NAMA_KATEGORI = 'Study Field';

    private const DESKRIPSI_KATEGORI = 'Perjalanan edukatif/field trip untuk instansi, sekolah, atau organisasi ke destinasi wisata dan institusi pendidikan, dikelola penuh oleh ZY Production mulai transportasi hingga dokumentasi.';

    private const NAMA_PAKET = 'Field Study Bali – Bromo – Yogyakarta (8 Hari 7 Malam)';

    public function run(): void
    {
        DB::transaction(function () {
            $idKategori = $this->seedKategori();
            $idPaket = $this->seedPaket($idKategori);
            $this->seedFasilitasDanDetail($idKategori, $idPaket);
        });

        $this->command->info('StudyFieldPackageSeeder selesai: 1 paket, 13 fasilitas, 13 baris detail_paket.');
    }

    private function seedKategori(): int
    {
        $kategori = DB::table('kategori_event')->where('nama_kategori', self::NAMA_KATEGORI)->first();

        if (! $kategori) {
            $id = DB::table('kategori_event')->insertGetId([
                'nama_kategori' => self::NAMA_KATEGORI,
                'deskripsi' => self::DESKRIPSI_KATEGORI,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return $id;
        }

        DB::table('kategori_event')->where('id_kategori', $kategori->id_kategori)->update([
            'deskripsi' => self::DESKRIPSI_KATEGORI,
            'updated_at' => now(),
        ]);

        return $kategori->id_kategori;
    }

    /**
     * Deskripsi utama + baris "Keterangan" + baris "Catatan" digabung jadi
     * satu teks multi-paragraf (dipisah baris kosong) karena paket_layanan
     * tidak punya kolom terpisah untuk itu.
     */
    private function seedPaket(int $idKategori): int
    {
        $deskripsi = implode("\n\n", [
            'Field study menuju Bali (2 malam), transit di Bromo, dan Yogyakarta (1 malam). '
                .'Mencakup kunjungan destinasi wisata (Tanah Lot, Pantai Jimbaran, Desa Panglipuran, '
                .'Pantai Melasti, Bromo, Candi Prambanan) dan institusi pendidikan (Universitas Udayana, '
                .'Sekolah Tinggi Pariwisata AMPTA).',
            'Keterangan: PP 8 Hari 7 Malam, hotel bintang 3 (3 malam), menggunakan Bus Pariwisata SUMEX 97.',
            'Catatan — harga belum termasuk: obat-obatan pribadi (riwayat sakit bawaan), belanja oleh-oleh, '
                .'keperluan pribadi, water sport, mini bar/laundry/telepon hotel, dan biaya porter.',
        ]);

        $existing = DB::table('paket_layanan')
            ->where('id_kategori', $idKategori)
            ->where('nama_paket', self::NAMA_PAKET)
            ->first();

        $payload = [
            'id_kategori' => $idKategori,
            'nama_paket' => self::NAMA_PAKET,
            'deskripsi' => $deskripsi,
            'harga' => 3500000,
            'foto' => null,
            'status_paket' => 'aktif',
            'updated_at' => now(),
        ];

        if ($existing) {
            DB::table('paket_layanan')->where('id_paket', $existing->id_paket)->update($payload);

            return $existing->id_paket;
        }

        $payload['created_at'] = now();

        return DB::table('paket_layanan')->insertGetId($payload);
    }

    private function seedFasilitasDanDetail(int $idKategori, int $idPaket): void
    {
        $now = now();

        // [nama_fasilitas, deskripsi, keterangan_di_detail_paket]
        $fasilitasList = [
            ['Bus Pariwisata', 'Full AC, TV, karaoke, bantal & selimut, termasuk tol/BBM/parkir/penyeberangan via dermaga eksekutif', 'Kapasitas 50 seat — 1 unit/rombongan'],
            ['Penginapan Hotel', 'Bintang 3, AC, TV, shower air panas-dingin', '1 kamar isi 2 orang — 3 malam'],
            ['Konsumsi', 'Prasmanan, menu ayam/daging/ikan', '3x/hari selama perjalanan'],
            ['Snack Ringan', 'Disediakan selama perjalanan', 'Setiap hari'],
            ['P3K', 'Perlengkapan P3K secukupnya', '1 paket selama perjalanan'],
            ['Tiket Objek Wisata', 'Retribusi ditanggung ZY Production, termasuk administrasi kunjungan', 'Sesuai itinerary'],
            ['Tour Leader (TL)', 'Pendamping rombongan selama perjalanan', 'Minimal 1 orang per bus'],
            ['Tour Guide Lokal', 'Khusus saat kunjungan wisata di Bali', 'Sesuai kebutuhan'],
            ['Air Mineral', 'Botol 600ml', '1 botol/hari/peserta'],
            ['Dokumentasi', 'Foto + video kegiatan', '1 paket'],
            ['Tipping', 'Untuk guide, sopir, dan kernet', '1 paket'],
            ['Banner/Spanduk', 'Untuk bus dan sesi foto, ukuran 1x3m', '1 per bus'],
            ['Asuransi Kecelakaan', 'By Jasindo', '1 per peserta'],
        ];

        $idFasilitasList = [];
        foreach ($fasilitasList as [$nama, $deskripsi, $keterangan]) {
            $existing = DB::table('fasilitas_layanan')
                ->where('id_kategori', $idKategori)
                ->where('nama_fasilitas', $nama)
                ->first();

            $payload = [
                'id_kategori' => $idKategori,
                'nama_fasilitas' => $nama,
                'deskripsi' => $deskripsi,
                'harga_estimasi' => null, // dokumen sumber hanya kasih harga di level paket
                'updated_at' => $now,
            ];

            if ($existing) {
                DB::table('fasilitas_layanan')->where('id_fasilitas', $existing->id_fasilitas)->update($payload);
                $idFasilitas = $existing->id_fasilitas;
            } else {
                $payload['created_at'] = $now;
                $idFasilitas = DB::table('fasilitas_layanan')->insertGetId($payload);
            }

            $idFasilitasList[] = ['id_fasilitas' => $idFasilitas, 'keterangan' => $keterangan];
        }

        // Bersihkan dulu detail_paket paket ini supaya idempoten (aman dijalankan ulang).
        DB::table('detail_paket')->where('id_paket', $idPaket)->delete();

        $rows = array_map(fn ($f) => [
            'id_paket' => $idPaket,
            'id_fasilitas' => $f['id_fasilitas'],
            'qty' => 1,
            'keterangan' => $f['keterangan'],
            'created_at' => $now,
            'updated_at' => $now,
        ], $idFasilitasList);

        DB::table('detail_paket')->insert($rows);
    }
}
