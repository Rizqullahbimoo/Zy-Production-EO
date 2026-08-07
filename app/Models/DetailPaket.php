<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailPaket extends Model
{
    use HasFactory;

    protected $table = 'detail_paket';

    protected $primaryKey = 'id_detail_paket';

    protected $fillable = [
        'id_paket',
        'id_fasilitas',
        'qty',
        'keterangan',
    ];

    // Relasi
    public function paketLayanan()
    {
        return $this->belongsTo(PaketLayanan::class, 'id_paket', 'id_paket');
    }

    public function fasilitasLayanan()
    {
        return $this->belongsTo(FasilitasLayanan::class, 'id_fasilitas', 'id_fasilitas');
    }
}
