<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaketLayanan extends Model
{
    use HasFactory;

    protected $table = 'paket_layanan';

    protected $primaryKey = 'id_paket';

    protected $fillable = [
        'id_kategori',
        'nama_paket',
        'deskripsi',
        'harga',
        'foto',
        'status_paket',
    ];

    protected $casts = [
        'harga' => 'decimal:2',
    ];

    // Relasi
    public function kategoriEvent()
    {
        return $this->belongsTo(KategoriEvent::class, 'id_kategori', 'id_kategori');
    }

    public function detailPaket()
    {
        return $this->hasMany(DetailPaket::class, 'id_paket', 'id_paket');
    }

    public function pemesanan()
    {
        return $this->hasMany(Pemesanan::class, 'id_paket', 'id_paket');
    }

    public function fasilitas()
    {
        return $this->belongsToMany(
            FasilitasLayanan::class,
            'detail_paket',
            'id_paket',
            'id_fasilitas'
        )->withPivot('qty', 'keterangan')->withTimestamps();
    }
}
