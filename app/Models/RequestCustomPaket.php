<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestCustomPaket extends Model
{
    use HasFactory;

    protected $table = 'request_custom_paket';
    protected $primaryKey = 'id_request';

    protected $fillable = [
        'id_user',
        'id_kategori',
        'tanggal_request',
        'tanggal_acara',
        'lokasi_acara',
        'jumlah_tamu',
        'budget_acara',
        'catatan',
        'status_request',
    ];

    protected $casts = [
        'tanggal_request' => 'date',
        'tanggal_acara'   => 'date',
        'budget_acara'    => 'decimal:2',
    ];

    // Relasi
    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function kategoriEvent()
    {
        return $this->belongsTo(KategoriEvent::class, 'id_kategori', 'id_kategori');
    }

    public function detailRequestCustom()
    {
        return $this->hasMany(DetailRequestCustom::class, 'id_request', 'id_request');
    }

    public function penawaranCustom()
    {
        return $this->hasMany(PenawaranCustom::class, 'id_request', 'id_request');
    }

    public function fasilitas()
    {
        return $this->belongsToMany(
            FasilitasLayanan::class,
            'detail_request_custom',
            'id_request',
            'id_fasilitas'
        )->withPivot('keterangan')->withTimestamps();
    }

    public function ulasan()
    {
        return $this->hasOne(Ulasan::class, 'id_request', 'id_request');
    }

    public function dokumenMou()
    {
        return $this->hasOne(DokumenMou::class, 'id_request', 'id_request');
    }
}
