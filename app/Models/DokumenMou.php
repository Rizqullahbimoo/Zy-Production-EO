<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DokumenMou extends Model
{
    use HasFactory;

    protected $table = 'dokumen_mou';
    protected $primaryKey = 'id_mou';

    protected $fillable = [
        'id_pemesanan',
        'id_request',
        'file_draft',
        'file_ttd_customer',
        'file_final',
        'status_mou',
        'catatan',
    ];

    public function pemesanan(): BelongsTo
    {
        return $this->belongsTo(Pemesanan::class, 'id_pemesanan', 'id_pemesanan');
    }

    public function requestCustomPaket(): BelongsTo
    {
        return $this->belongsTo(RequestCustomPaket::class, 'id_request', 'id_request');
    }
}
