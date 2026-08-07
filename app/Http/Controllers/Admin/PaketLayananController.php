<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PaketLayananRequest;
use App\Models\DetailPaket;
use App\Models\KategoriEvent;
use App\Models\PaketLayanan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PaketLayananController extends Controller
{
    /**
     * Daftar paket dalam satu kategori.
     * GET /api/admin/kategori/{kategori}/paket
     */
    public function index(int $kategori): JsonResponse
    {
        $kat = KategoriEvent::find($kategori);

        if (! $kat) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kategori tidak ditemukan.',
            ], 404);
        }

        $paket = PaketLayanan::where('id_kategori', $kategori)
            ->orderBy('nama_paket')
            ->get()
            ->map(fn ($p) => $this->formatPaket($p));

        return response()->json([
            'status' => 'success',
            'data'   => [
                'kategori' => [
                    'id_kategori'   => $kat->id_kategori,
                    'nama_kategori' => $kat->nama_kategori,
                ],
                'paket' => $paket,
            ],
        ]);
    }

    /**
     * Simpan paket baru dalam kategori.
     * POST /api/admin/kategori/{kategori}/paket
     */
    public function store(PaketLayananRequest $request, int $kategori): JsonResponse
    {
        $kat = KategoriEvent::find($kategori);

        if (! $kat) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kategori tidak ditemukan.',
            ], 404);
        }

        $fotoPath = null;
        if ($request->hasFile('foto')) {
            $fotoPath = $request->file('foto')->store('paket', 'public');
        }

        $paket = PaketLayanan::create([
            'id_kategori'  => $kategori,
            'nama_paket'   => $request->nama_paket,
            'deskripsi'    => $request->deskripsi,
            'harga'        => $request->harga,
            'foto'         => $fotoPath,
            'status_paket' => $request->status_paket ?? 'aktif',
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Paket layanan berhasil ditambahkan.',
            'data'    => $this->formatPaket($paket->load('kategoriEvent')),
        ], 201);
    }

    /**
     * Detail satu paket beserta fasilitasnya.
     * GET /api/admin/kategori/{kategori}/paket/{paket}
     */
    public function show(int $kategori, int $paket): JsonResponse
    {
        $p = PaketLayanan::with(['kategoriEvent', 'detailPaket.fasilitasLayanan'])
            ->where('id_kategori', $kategori)
            ->find($paket);

        if (! $p) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Paket tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => array_merge($this->formatPaket($p), [
                'fasilitas' => $p->detailPaket->map(fn ($d) => [
                    'id_detail_paket' => $d->id_detail_paket,
                    'id_fasilitas'    => $d->fasilitasLayanan->id_fasilitas,
                    'nama_fasilitas'  => $d->fasilitasLayanan->nama_fasilitas,
                    'deskripsi'       => $d->fasilitasLayanan->deskripsi,
                    'qty'             => $d->qty,
                    'keterangan'      => $d->keterangan,
                ]),
            ]),
        ]);
    }

    /**
     * Update paket layanan.
     * PUT /api/admin/kategori/{kategori}/paket/{paket}
     */
    public function update(PaketLayananRequest $request, int $kategori, int $paket): JsonResponse
    {
        $p = PaketLayanan::where('id_kategori', $kategori)->find($paket);

        if (! $p) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Paket tidak ditemukan.',
            ], 404);
        }

        $data = [
            'nama_paket'   => $request->nama_paket,
            'deskripsi'    => $request->deskripsi,
            'harga'        => $request->harga,
            'status_paket' => $request->status_paket ?? $p->status_paket,
        ];

        if ($request->hasFile('foto')) {
            if ($p->foto) {
                Storage::disk('public')->delete($p->foto);
            }
            $data['foto'] = $request->file('foto')->store('paket', 'public');
        }

        $p->update($data);

        return response()->json([
            'status'  => 'success',
            'message' => 'Paket layanan berhasil diperbarui.',
            'data'    => $this->formatPaket($p->fresh()->load('kategoriEvent')),
        ]);
    }

    /**
     * Sinkronkan fasilitas yang tergabung dalam sebuah paket.
     * POST /api/admin/kategori/{kategori}/paket/{paket}/fasilitas
     */
    public function syncFasilitas(Request $request, int $kategori, int $paket): JsonResponse
    {
        $p = PaketLayanan::where('id_kategori', $kategori)->find($paket);

        if (! $p) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Paket tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'fasilitas'                => ['nullable', 'array'],
            'fasilitas.*.id_fasilitas' => ['required', 'integer', 'exists:fasilitas_layanan,id_fasilitas'],
            'fasilitas.*.qty'          => ['nullable', 'integer', 'min:1'],
            'fasilitas.*.keterangan'   => ['nullable', 'string'],
        ]);

        DetailPaket::where('id_paket', $paket)->delete();

        $rows = collect($validated['fasilitas'] ?? [])->map(fn ($f) => [
            'id_paket'     => $paket,
            'id_fasilitas' => $f['id_fasilitas'],
            'qty'          => $f['qty'] ?? 1,
            'keterangan'   => $f['keterangan'] ?? null,
            'created_at'   => now(),
            'updated_at'   => now(),
        ])->all();

        if (! empty($rows)) {
            DetailPaket::insert($rows);
        }

        $p->load('detailPaket.fasilitasLayanan');

        return response()->json([
            'status'  => 'success',
            'message' => 'Fasilitas paket berhasil diperbarui.',
            'data'    => [
                'fasilitas' => $p->detailPaket->map(fn ($d) => [
                    'id_detail_paket' => $d->id_detail_paket,
                    'id_fasilitas'    => $d->fasilitasLayanan->id_fasilitas,
                    'nama_fasilitas'  => $d->fasilitasLayanan->nama_fasilitas,
                    'deskripsi'       => $d->fasilitasLayanan->deskripsi,
                    'qty'             => $d->qty,
                    'keterangan'      => $d->keterangan,
                ]),
            ],
        ]);
    }

    /**
     * Hapus paket layanan.
     * DELETE /api/admin/kategori/{kategori}/paket/{paket}
     */
    public function destroy(int $kategori, int $paket): JsonResponse
    {
        $p = PaketLayanan::where('id_kategori', $kategori)->find($paket);

        if (! $p) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Paket tidak ditemukan.',
            ], 404);
        }

        if ($p->pemesanan()->exists()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Paket tidak bisa dihapus karena sudah memiliki data pemesanan.',
            ], 409);
        }

        if ($p->foto) {
            Storage::disk('public')->delete($p->foto);
        }

        $p->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Paket layanan berhasil dihapus.',
        ]);
    }

    private function formatPaket(PaketLayanan $paket): array
    {
        return [
            'id_paket'     => $paket->id_paket,
            'id_kategori'  => $paket->id_kategori,
            'nama_paket'   => $paket->nama_paket,
            'deskripsi'    => $paket->deskripsi,
            'harga'        => $paket->harga,
            'foto'         => $paket->foto ? asset('storage/' . $paket->foto) : null,
            'status_paket' => $paket->status_paket,
            'kategori'     => $paket->relationLoaded('kategoriEvent') && $paket->kategoriEvent ? [
                'id_kategori'   => $paket->kategoriEvent->id_kategori,
                'nama_kategori' => $paket->kategoriEvent->nama_kategori,
            ] : null,
            'created_at'   => $paket->created_at,
            'updated_at'   => $paket->updated_at,
        ];
    }
}
