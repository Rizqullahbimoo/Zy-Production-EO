<?php

namespace App\Support;

/**
 * Sumber tunggal aturan bisnis "DP minimal 30%" — dipakai oleh alur
 * Pemesanan Paket Standar maupun Custom Paket agar tidak ada dua
 * implementasi persentase yang bisa saling menyimpang.
 */
class DpCalculator
{
    public const PERSENTASE = 0.3;

    public static function hitung(float $totalHarga): float
    {
        return round($totalHarga * self::PERSENTASE, 2);
    }
}
