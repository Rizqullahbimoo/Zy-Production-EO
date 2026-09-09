<?php

namespace App\Support;

/**
 * Sumber tunggal aturan bisnis "kapasitas maksimal event per hari".
 *
 * Berdasarkan hasil wawancara dengan ZY Production: tim operasional hanya
 * sanggup menjalankan maksimal 2-3 event dalam satu hari yang sama (angka
 * final di dokumen skripsi: 3). Nilai ini dihitung gabungan lintas
 * pemesanan paket bawaan (Pemesanan) dan custom paket yang penawarannya
 * sudah diterima (RequestCustomPaket dengan status_request = 'diterima') —
 * lihat App\Support\CekKapasitasHarian untuk logika hitungnya.
 */
class KapasitasHarian
{
    const MAKS_EVENT_PER_HARI = 3;

    /**
     * Sumber tunggal teks pesan "kapasitas penuh" — dipakai oleh SEMUA titik
     * backend yang menolak transisi ke slot terhitung (PemesananCustomerController::store,
     * Customer\PenawaranController::approve, Admin\RequestCustomController::updateStatus,
     * Admin\PemesananController::updateStatus). Frontend membangun pesan yang
     * SAMA PERSIS dari field `slot_maks` yang dikembalikan GET /api/ketersediaan
     * (lihat CustomerKatalog.jsx) — jangan hardcode angka atau teks ini ulang
     * di tempat lain, supaya kalau MAKS_EVENT_PER_HARI berubah, semua pesan
     * ikut berubah otomatis tanpa perlu disinkronkan manual.
     */
    public static function pesanPenuh(string $tanggal): string
    {
        return "Maaf, tanggal {$tanggal} sudah mencapai kapasitas maksimal ".self::MAKS_EVENT_PER_HARI.' event per hari. Silakan pilih tanggal lain.';
    }
}
