<?php

namespace Database\Seeders;

use App\Models\Galeri;
use App\Models\KategoriEvent;
use App\Models\PaketLayanan;
use App\Models\Pemesanan;
use App\Models\RequestCustomPaket;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed test users for login testing (2 roles: admin & user/customer).
     */
    public function run(): void
    {
        // ── Admin Account ───────────────────────────────────────────────
        $admin = User::updateOrCreate(
            ['email' => 'admin@zyproduction.com'],
            [
                'nama' => 'Admin ZY Production',
                'password' => Hash::make('admin123'),
                'no_hp' => '08123456789',
                'role' => 'admin',
            ]
        );

        // ── Customer Account ─────────────────────────────────────────────
        $customer = User::updateOrCreate(
            ['email' => 'customer@zyproduction.com'],
            [
                'nama' => 'Bimo Customer',
                'password' => Hash::make('customer123'),
                'no_hp' => '08198765432',
                'role' => 'user',
            ]
        );

        // Create some additional customer users to make order names look realistic
        $customersList = [$customer];
        $names = ['Andi Saputra', 'Siti Rahma', 'Budi Santoso', 'Rina Oktavia', 'Dimas Pratama', 'Ahmad Fauzi', 'Dewi Lestari', 'Hadi Wijaya'];
        foreach ($names as $idx => $name) {
            $email = 'customer'.($idx + 1).'@example.com';
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'nama' => $name,
                    'password' => Hash::make('customer123'),
                    'no_hp' => '0812'.rand(11111111, 99999999),
                    'role' => 'user',
                ]
            );
            $customersList[] = $user;
        }

        // ── Seed Categories ──────────────────────────────────────────────
        $categoriesData = [
            ['nama_kategori' => 'Wedding Event', 'deskripsi' => 'Layanan paket pernikahan lengkap.'],
            ['nama_kategori' => 'Outbound', 'deskripsi' => 'Paket aktivitas outdoor corporate team building.'],
            ['nama_kategori' => 'Launching Product', 'deskripsi' => 'Penyelenggaraan event peluncuran produk baru.'],
            ['nama_kategori' => 'Study Field', 'deskripsi' => 'Paket studi tour edukatif untuk pelajar.'],
            ['nama_kategori' => 'Birthday Party', 'deskripsi' => 'Penyelenggaraan pesta ulang tahun meriah.'],
            ['nama_kategori' => 'Gathering', 'deskripsi' => 'Paket gathering keluarga atau perusahaan.'],
        ];

        $categories = [];
        foreach ($categoriesData as $catData) {
            $categories[] = KategoriEvent::updateOrCreate(
                ['nama_kategori' => $catData['nama_kategori']],
                ['deskripsi' => $catData['deskripsi']]
            );
        }

        // ── Seed Packages (3 per category = 18 total) ──────────────────────
        $packagesData = [
            'Wedding Event' => [
                ['nama' => 'Paket Sakinah', 'harga' => 35000000],
                ['nama' => 'Paket Mawaddah', 'harga' => 55000000],
                ['nama' => 'Paket Warahmah', 'harga' => 85000000],
            ],
            'Outbound' => [
                ['nama' => 'Paket Team Building Pro', 'harga' => 12000000],
                ['nama' => 'Paket Adventure Camping', 'harga' => 18000000],
                ['nama' => 'Paket Fun Games Executive', 'harga' => 25000000],
            ],
            'Launching Product' => [
                ['nama' => 'Paket Launching Basic', 'harga' => 20000000],
                ['nama' => 'Paket Launching Exclusive', 'harga' => 45000000],
                ['nama' => 'Paket Launching Grand Premium', 'harga' => 90000000],
            ],
            'Study Field' => [
                ['nama' => 'Paket Edukasi Museum', 'harga' => 8000000],
                ['nama' => 'Paket Outbound Kids', 'harga' => 10000000],
                ['nama' => 'Paket Tour Industri', 'harga' => 15000000],
            ],
            'Birthday Party' => [
                ['nama' => 'Paket Sweet Seventeen', 'harga' => 15000000],
                ['nama' => 'Paket Birthday Kids Joyful', 'harga' => 12000000],
                ['nama' => 'Paket Birthday Elegant Dinner', 'harga' => 30000000],
            ],
            'Gathering' => [
                ['nama' => 'Paket Family Gathering', 'harga' => 18000000],
                ['nama' => 'Paket Corporate Gathering Lite', 'harga' => 22000000],
                ['nama' => 'Paket Corporate Gathering VIP', 'harga' => 40000000],
            ],
        ];

        $allPackages = [];
        foreach ($categories as $cat) {
            $catName = $cat->nama_kategori;
            if (isset($packagesData[$catName])) {
                foreach ($packagesData[$catName] as $pInfo) {
                    $allPackages[] = PaketLayanan::updateOrCreate(
                        ['nama_paket' => $pInfo['nama']],
                        [
                            'id_kategori' => $cat->id_kategori,
                            'deskripsi' => 'Paket lengkap layanan '.$catName.' dengan fasilitas terbaik.',
                            'harga' => $pInfo['harga'],
                            'status_paket' => 'aktif',
                        ]
                    );
                }
            }
        }

        // ── Seed Orders (Pemesanan: 24 total) ──────────────────────────────────
        // If there are less than 24 orders, seed them
        if (Pemesanan::count() < 24) {
            $statuses = ['menunggu', 'dikonfirmasi', 'dibatalkan', 'selesai'];
            $locations = ['Grand Ballroom Hotel Jakarta', 'Taman Budaya Sentul', 'JIExpo Kemayoran', 'Lippo Mall Convention', 'Ancol Beach Park', 'Sheraton Hotel'];

            for ($i = 1; $i <= 24; $i++) {
                $randCustomer = $customersList[array_rand($customersList)];
                $randPackage = $allPackages[array_rand($allPackages)];
                $status = $statuses[$i % count($statuses)];

                // Let's make the last few orders match the wireframe exactly
                if ($i === 20) { // ORD-005
                    $randCustomer = User::where('nama', 'Dimas Pratama')->first() ?: $customer;
                    $randPackage = PaketLayanan::where('nama_paket', 'Paket Team Building Pro')->first() ?: $randPackage; // Outbound
                    $status = 'menunggu';
                } elseif ($i === 21) { // ORD-004
                    $randCustomer = User::where('nama', 'Rina Oktavia')->first() ?: $customer;
                    $randPackage = PaketLayanan::where('nama_paket', 'Paket Launching Basic')->first() ?: $randPackage; // Launching Product
                    $status = 'selesai';
                } elseif ($i === 22) { // ORD-003
                    $randCustomer = User::where('nama', 'Budi Santoso')->first() ?: $customer;
                    $randPackage = PaketLayanan::where('nama_paket', 'Paket Family Gathering')->first() ?: $randPackage; // Gathering
                    $status = 'menunggu';
                } elseif ($i === 23) { // ORD-002
                    $randCustomer = User::where('nama', 'Siti Rahma')->first() ?: $customer;
                    $randPackage = PaketLayanan::where('nama_paket', 'Paket Sweet Seventeen')->first() ?: $randPackage; // Birthday Party
                    $status = 'dikonfirmasi';
                } elseif ($i === 24) { // ORD-001
                    $randCustomer = User::where('nama', 'Andi Saputra')->first() ?: $customer;
                    $randPackage = PaketLayanan::where('nama_paket', 'Paket Mawaddah')->first() ?: $randPackage; // Wedding Event
                    $status = 'menunggu';
                }

                Pemesanan::create([
                    'id_user' => $randCustomer->id_user,
                    'id_paket' => $randPackage->id_paket,
                    'kode_pemesanan' => 'ORD-'.str_pad($i, 3, '0', STR_PAD_LEFT),
                    'tanggal_pemesanan' => Carbon::now()->subDays(25 - $i),
                    'tanggal_acara' => Carbon::now()->addDays($i + 5),
                    'lokasi_acara' => $locations[array_rand($locations)],
                    'status_pemesanan' => $status,
                    'catatan' => 'Catatan pemesanan dummy ke-'.$i,
                ]);
            }
        }

        // ── Seed Custom Request Packages (RequestCustomPaket: 8 total) ───────
        if (RequestCustomPaket::count() < 8) {
            $reqStatuses = ['menunggu', 'diproses', 'ditawarkan', 'diterima', 'ditolak', 'selesai'];
            for ($i = 1; $i <= 8; $i++) {
                $randCustomer = $customersList[array_rand($customersList)];
                $randCat = $categories[array_rand($categories)];

                RequestCustomPaket::create([
                    'id_user' => $randCustomer->id_user,
                    'id_kategori' => $randCat->id_kategori,
                    'tanggal_request' => Carbon::now()->subDays(10 - $i),
                    'tanggal_acara' => Carbon::now()->addDays($i + 15),
                    'lokasi_acara' => 'Lokasi Custom Klien ke-'.$i,
                    'jumlah_tamu' => rand(50, 500),
                    'budget_acara' => rand(10, 100) * 1000000,
                    'catatan' => 'Permintaan kustomisasi paket event detail ke-'.$i,
                    'status_request' => $reqStatuses[$i % count($reqStatuses)],
                ]);
            }
        }

        // ── Seed Gallery (Galeri: 6 total) ──────────────────────────────────
        if (Galeri::count() == 0) {
            $galleryData = [
                [
                    'judul' => 'Wedding Event',
                    'deskripsi' => 'Dokumentasi event pernikahan dengan konsep dekorasi elegan dan susunan acara formal.',
                    'foto' => 'galeri/wedding_event.jpg',
                    'urutan' => 1,
                    'tanggal' => '2026-08-12',
                    'created_at' => '2026-08-12 10:00:00',
                ],
                [
                    'judul' => 'Launching Product',
                    'deskripsi' => 'Portofolio kegiatan peluncuran produk dengan kebutuhan panggung, branding, dan dokumentasi.',
                    'foto' => 'galeri/launching_product.jpg',
                    'urutan' => 2,
                    'tanggal' => '2026-08-20',
                    'created_at' => '2026-08-20 10:00:00',
                ],
                [
                    'judul' => 'Outbound Team',
                    'deskripsi' => 'Kegiatan outbound perusahaan dengan berbagai aktivitas lapangan dan permainan kelompok.',
                    'foto' => 'galeri/outbound_team.jpg',
                    'urutan' => 3,
                    'tanggal' => '2026-08-28',
                    'created_at' => '2026-08-28 10:00:00',
                ],
                [
                    'judul' => 'Birthday Party',
                    'deskripsi' => 'Acara ulang tahun dengan tema dekorasi khusus, hiburan, dan tata ruang sederhana.',
                    'foto' => 'galeri/birthday_party.jpg',
                    'urutan' => 4,
                    'tanggal' => '2026-09-02',
                    'created_at' => '2026-09-02 10:00:00',
                ],
                [
                    'judul' => 'Company Gathering',
                    'deskripsi' => 'Dokumentasi gathering perusahaan dengan suasana santai, interaktif, dan terorganisir.',
                    'foto' => 'galeri/company_gathering.jpg',
                    'urutan' => 5,
                    'tanggal' => '2026-09-10',
                    'created_at' => '2026-09-10 10:00:00',
                ],
                [
                    'judul' => 'Study Field',
                    'deskripsi' => 'Galeri kegiatan studi lapangan dengan fokus pada koordinasi peserta dan alur kunjungan.',
                    'foto' => 'galeri/study_field.jpg',
                    'urutan' => 6,
                    'tanggal' => '2026-09-18',
                    'created_at' => '2026-09-18 10:00:00',
                ],
            ];

            foreach ($galleryData as $data) {
                Galeri::create($data);
            }
        }
    }
}
