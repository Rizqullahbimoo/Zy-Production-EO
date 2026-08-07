<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\KategoriRequest;
use App\Models\KategoriEvent;
use Illuminate\Http\JsonResponse;

class KategoriController extends Controller
{
    /**
     * Daftar semua kategori beserta jumlah paketnya.
     * GET /api/admin/kategori
     */
    public function index(): JsonResponse
    {
        $kategori = KategoriEvent::withCount('paketLayanan')
            ->orderBy('nama_kategori')
            ->get()
            ->map(fn ($k) => $this->formatKategori($k));

        return response()->json([
            'status' => 'success',
            'data'   => $kategori,
        ]);
    }

    /**
     * Simpan kategori baru.
     * POST /api/admin/kategori
     */
    public function store(KategoriRequest $request): JsonResponse
    {
        $kategori = KategoriEvent::create([
            'nama_kategori' => $request->nama_kategori,
            'deskripsi'     => $request->deskripsi,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Kategori berhasil ditambahkan.',
            'data'    => $this->formatKategori($kategori),
        ], 201);
    }

    /**
     * Detail satu kategori beserta paket di dalamnya.
     * GET /api/admin/kategori/{id}
     */
    public function show(int $id): JsonResponse
    {
        $kategori = KategoriEvent::with([
            'paketLayanan' => fn ($q) => $q->orderBy('nama_paket'),
        ])->find($id);

        if (! $kategori) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kategori tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => [
                'id_kategori'   => $kategori->id_kategori,
                'nama_kategori' => $kategori->nama_kategori,
                'deskripsi'     => $kategori->deskripsi,
                'paket'         => $kategori->paketLayanan->map(fn ($p) => [
                    'id_paket'     => $p->id_paket,
                    'nama_paket'   => $p->nama_paket,
                    'harga'        => $p->harga,
                    'foto'         => $p->foto ? asset('storage/' . $p->foto) : null,
                    'status_paket' => $p->status_paket,
                ]),
            ],
        ]);
    }

    /**
     * Update kategori.
     * PUT /api/admin/kategori/{id}
     */
    public function update(KategoriRequest $request, int $id): JsonResponse
    {
        $kategori = KategoriEvent::find($id);

        if (! $kategori) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kategori tidak ditemukan.',
            ], 404);
        }

        $kategori->update([
            'nama_kategori' => $request->nama_kategori,
            'deskripsi'     => $request->deskripsi,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Kategori berhasil diperbarui.',
            'data'    => $this->formatKategori($kategori->fresh()),
        ]);
    }

    /**
     * Hapus kategori.
     * DELETE /api/admin/kategori/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $kategori = KategoriEvent::find($id);

        if (! $kategori) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kategori tidak ditemukan.',
            ], 404);
        }

        if ($kategori->paketLayanan()->exists()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kategori tidak bisa dihapus karena masih memiliki paket layanan.',
            ], 409);
        }

        $kategori->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Kategori berhasil dihapus.',
        ]);
    }

    private function formatKategori(KategoriEvent $kategori): array
    {
        return [
            'id_kategori'   => $kategori->id_kategori,
            'nama_kategori' => $kategori->nama_kategori,
            'deskripsi'     => $kategori->deskripsi,
            'jumlah_paket'  => $kategori->paket_layanan_count ?? $kategori->paketLayanan()->count(),
            'created_at'    => $kategori->created_at,
            'updated_at'    => $kategori->updated_at,
        ];
    }
}
