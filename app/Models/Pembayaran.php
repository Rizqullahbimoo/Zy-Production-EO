<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pembayaran extends Model
{
    use HasFactory;

    protected $table = 'pembayaran';

    protected $primaryKey = 'id_pembayaran';

    protected $fillable = [
        'id_pemesanan',
        'id_penawaran',
        'created_id',
        'tanggal_bayar',
        'jumlah_bayar',
        'bukti_pembayaran',
        'status_konfirmasi',
        'catatan_admin',
    ];

    protected $casts = [
        'tanggal_bayar' => 'date',
        'jumlah_bayar' => 'decimal:2',
    ];

    // Relasi
    public function pemesanan()
    {
        return $this->belongsTo(Pemesanan::class, 'id_pemesanan', 'id_pemesanan');
    }

    public function penawaranCustom()
    {
        return $this->belongsTo(PenawaranCustom::class, 'id_penawaran', 'id_penawaran');
    }

    public function adminPemroses()
    {
        return $this->belongsTo(User::class, 'created_id', 'id_user');
    }
}
