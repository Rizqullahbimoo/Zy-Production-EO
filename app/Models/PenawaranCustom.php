<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PenawaranCustom extends Model
{
    use HasFactory;

    protected $table = 'penawaran_custom';

    protected $primaryKey = 'id_penawaran';

    protected $fillable = [
        'id_request',
        'kode_penawaran',
        'tanggal_penawaran',
        'total_penawaran',
        'dp_awal',
        'status_penawaran',
        'catatan_admin',
        'catatan_revisi_customer',
        'midtrans_order_id',
        'snap_token',
        'payment_status',
    ];

    protected $casts = [
        'tanggal_penawaran' => 'date',
        'total_penawaran' => 'decimal:2',
        'dp_awal' => 'decimal:2',
    ];

    // Alias harga_penawaran -> total_penawaran untuk backward compat frontend
    public function getHargaPenawaranAttribute()
    {
        return $this->total_penawaran;
    }

    // Relasi
    public function requestCustomPaket()
    {
        return $this->belongsTo(RequestCustomPaket::class, 'id_request', 'id_request');
    }

    public function pembayaran()
    {
        return $this->hasMany(Pembayaran::class, 'id_penawaran', 'id_penawaran');
    }
}
