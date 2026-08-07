<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FasilitasLayanan extends Model
{
    use HasFactory;

    protected $table = 'fasilitas_layanan';
    protected $primaryKey = 'id_fasilitas';

    protected $fillable = [
        'id_kategori',
        'nama_fasilitas',
        'deskripsi',
    ];

    // Relasi
    public function kategoriEvent()
    {
        return $this->belongsTo(KategoriEvent::class, 'id_kategori', 'id_kategori');
    }

    public function detailPaket()
    {
        return $this->hasMany(DetailPaket::class, 'id_fasilitas', 'id_fasilitas');
    }

    public function detailRequestCustom()
    {
        return $this->hasMany(DetailRequestCustom::class, 'id_fasilitas', 'id_fasilitas');
    }
}
