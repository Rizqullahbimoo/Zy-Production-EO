<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pemesanan extends Model
{
    use HasFactory;

    protected $table = 'pemesanan';
    protected $primaryKey = 'id_pemesanan';

    protected $fillable = [
        'id_user',
        'id_paket',
        'kode_pemesanan',
        'tanggal_pemesanan',
        'tanggal_acara',
        'lokasi_acara',
        'jumlah_tamu',
        'dp_amount',
        'status_pemesanan',
        'catatan',
        'midtrans_order_id',
        'snap_token',
        'payment_status',
    ];

    protected $casts = [
        'tanggal_pemesanan' => 'date',
        'tanggal_acara'     => 'date',
        'dp_amount'         => 'decimal:2',
    ];

    // Relasi
    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function paketLayanan()
    {
        return $this->belongsTo(PaketLayanan::class, 'id_paket', 'id_paket');
    }

    public function pembayaran()
    {
        return $this->hasMany(Pembayaran::class, 'id_pemesanan', 'id_pemesanan');
    }

    public function ulasan()
    {
        return $this->hasOne(Ulasan::class, 'id_pemesanan', 'id_pemesanan');
    }

    public function dokumenMou()
    {
        return $this->hasOne(DokumenMou::class, 'id_pemesanan', 'id_pemesanan');
    }
}
