<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KategoriEvent extends Model
{
    use HasFactory;

    protected $table = 'kategori_event';

    protected $primaryKey = 'id_kategori';

    protected $fillable = [
        'nama_kategori',
        'deskripsi',
    ];

    // Relasi
    public function fasilitasLayanan()
    {
        return $this->hasMany(FasilitasLayanan::class, 'id_kategori', 'id_kategori');
    }

    public function paketLayanan()
    {
        return $this->hasMany(PaketLayanan::class, 'id_kategori', 'id_kategori');
    }

    public function requestCustomPaket()
    {
        return $this->hasMany(RequestCustomPaket::class, 'id_kategori', 'id_kategori');
    }
}
