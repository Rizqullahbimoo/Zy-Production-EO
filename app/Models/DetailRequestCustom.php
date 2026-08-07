<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailRequestCustom extends Model
{
    use HasFactory;

    protected $table = 'detail_request_custom';
    protected $primaryKey = 'id_detail_request';

    protected $fillable = [
        'id_request',
        'id_fasilitas',
        'keterangan',
    ];

    // Relasi
    public function requestCustomPaket()
    {
        return $this->belongsTo(RequestCustomPaket::class, 'id_request', 'id_request');
    }

    public function fasilitasLayanan()
    {
        return $this->belongsTo(FasilitasLayanan::class, 'id_fasilitas', 'id_fasilitas');
    }
}
