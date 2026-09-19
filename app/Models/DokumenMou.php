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

    /**
     * Path disk mentah (mis. "mou/xxxx.pdf") disembunyikan dari JSON — sejak
     * pindah ke disk 'local' (private), path ini tidak berguna langsung buat
     * frontend. Dipakai internal saja lewat properti model (tidak kena
     * $hidden — itu cuma memengaruhi toArray()/toJson()). Frontend pakai
     * *_url di bawah, yang menunjuk ke endpoint terautentikasi
     * MoUController::downloadFile().
     */
    protected $hidden = [
        'file_draft',
        'file_ttd_customer',
        'file_final',
    ];

    protected $appends = [
        'file_draft_url',
        'file_ttd_customer_url',
        'file_final_url',
    ];

    public function pemesanan(): BelongsTo
    {
        return $this->belongsTo(Pemesanan::class, 'id_pemesanan', 'id_pemesanan');
    }

    public function requestCustomPaket(): BelongsTo
    {
        return $this->belongsTo(RequestCustomPaket::class, 'id_request', 'id_request');
    }

    public function getFileDraftUrlAttribute(): ?string
    {
        return $this->file_draft ? $this->buildFileUrl('draft') : null;
    }

    public function getFileTtdCustomerUrlAttribute(): ?string
    {
        return $this->file_ttd_customer ? $this->buildFileUrl('ttd_customer') : null;
    }

    public function getFileFinalUrlAttribute(): ?string
    {
        return $this->file_final ? $this->buildFileUrl('final') : null;
    }

    private function buildFileUrl(string $type): string
    {
        $prefix = auth()->user()?->role === 'admin' ? 'admin' : 'customer';

        return "/api/{$prefix}/mou/{$this->id_mou}/file/{$type}";
    }
}
