<?php

namespace App\Support;

/**
 * Sumber tunggal pembuatan kode unik customer-facing (bukan ID auto-increment
 * database) — dipakai oleh Pemesanan paket bawaan, Request Custom Paket, dan
 * Penawaran Custom, masing-masing dengan prefix berbeda supaya jenisnya bisa
 * dibedakan langsung dari kodenya.
 */
class KodeGenerator
{
    public static function buat(string $prefix): string
    {
        return $prefix.'-'.strtoupper(substr(uniqid(), -6)).'-'.now()->format('ymd');
    }
}
