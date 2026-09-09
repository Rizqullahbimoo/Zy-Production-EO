<?php

namespace App\Support;

use App\Models\Pemesanan;
use App\Models\RequestCustomPaket;
use Carbon\Carbon;

/**
 * Helper hitung slot event yang sudah terpakai pada satu tanggal, dipakai
 * bersama oleh endpoint cek ketersediaan (Guest\KetersediaanController) dan
 * dua titik validasi tulis (PemesananCustomerController::store,
 * Customer\PenawaranController::approve) — supaya definisi "1 slot terpakai"
 * konsisten di ketiga tempat itu.
 *
 * Definisi 1 slot terpakai pada suatu tanggal:
 *  - Pemesanan paket bawaan dengan status_pemesanan menunggu/dikonfirmasi/
 *    selesai (BUKAN dibatalkan) — begitu dibuat sudah dianggap niat serius
 *    memakai tanggal itu.
 *  - Request custom paket yang penawarannya SUDAH diterima customer
 *    (status_request = 'diterima') — sebelum itu (menunggu/diproses/
 *    ditawarkan/direvisi) masih tahap negosiasi, belum layak dihitung
 *    sebagai event yang pasti terjadi.
 */
class CekKapasitasHarian
{
    private const STATUS_PEMESANAN_TERHITUNG = ['menunggu', 'dikonfirmasi', 'selesai'];

    public static function hitungSlotTerpakai(string $tanggal): int
    {
        // Normalisasi ke 'Y-m-d' murni — supaya perbandingan ke kolom `date`
        // di database tetap benar terlepas dari format input mentah (client
        // yang tidak lewat <input type="date"> browser, mis. panggilan API
        // langsung, bisa saja kirim format tanggal lain yang tetap valid
        // menurut rule Laravel `date` tapi tidak dikenali MySQL sebagai DATE).
        $tanggal = Carbon::parse($tanggal)->toDateString();

        $dariPemesanan = Pemesanan::where('tanggal_acara', $tanggal)
            ->whereIn('status_pemesanan', self::STATUS_PEMESANAN_TERHITUNG)
            ->count();

        $dariCustom = RequestCustomPaket::where('tanggal_acara', $tanggal)
            ->where('status_request', 'diterima')
            ->count();

        return $dariPemesanan + $dariCustom;
    }

    public static function tersedia(string $tanggal): bool
    {
        return self::hitungSlotTerpakai($tanggal) < KapasitasHarian::MAKS_EVENT_PER_HARI;
    }
}
