<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GaleriRequest;
use App\Models\Galeri;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class GaleriController extends Controller
{
    /**
     * Daftar semua galeri.
     * GET /api/admin/galeri
     */
    public function index(): JsonResponse
    {
        $galeri = Galeri::orderBy('urutan')->orderBy('created_at', 'desc')->get()
            ->map(function ($item) {
                return $this->formatGaleri($item);
            });

        return response()->json([
            'status' => 'success',
            'data'   => $galeri,
        ]);
    }

    /**
     * Simpan galeri baru.
     * POST /api/admin/galeri
     */
    public function store(GaleriRequest $request): JsonResponse
    {
        $path = $request->file('foto')->store('galeri', 'public');

        $galeri = Galeri::create([
            'judul'     => $request->judul,
            'deskripsi' => $request->deskripsi,
            'foto'      => $path,
            'urutan'    => $request->urutan ?? 0,
            'tanggal'   => $request->tanggal,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Galeri berhasil ditambahkan.',
            'data'    => $this->formatGaleri($galeri),
        ], 201);
    }

    /**
     * Detail satu galeri.
     * GET /api/admin/galeri/{id}
     */
    public function show(int $id): JsonResponse
    {
        $galeri = Galeri::find($id);

        if (! $galeri) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Galeri tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $this->formatGaleri($galeri),
        ]);
    }

    /**
     * Update galeri.
     * PUT /api/admin/galeri/{id}
     */
    public function update(GaleriRequest $request, int $id): JsonResponse
    {
        $galeri = Galeri::find($id);

        if (! $galeri) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Galeri tidak ditemukan.',
            ], 404);
        }

        $data = [
            'judul'     => $request->judul,
            'deskripsi' => $request->deskripsi,
            'urutan'    => $request->urutan ?? $galeri->urutan,
            'tanggal'   => $request->tanggal ?? $galeri->tanggal,
        ];

        if ($request->hasFile('foto')) {
            // Hapus foto lama
            Storage::disk('public')->delete($galeri->foto);
            $data['foto'] = $request->file('foto')->store('galeri', 'public');
        }

        $galeri->update($data);

        return response()->json([
            'status'  => 'success',
            'message' => 'Galeri berhasil diperbarui.',
            'data'    => $this->formatGaleri($galeri->fresh()),
        ]);
    }

    /**
     * Hapus galeri.
     * DELETE /api/admin/galeri/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $galeri = Galeri::find($id);

        if (! $galeri) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Galeri tidak ditemukan.',
            ], 404);
        }

        Storage::disk('public')->delete($galeri->foto);
        $galeri->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Galeri berhasil dihapus.',
        ]);
    }

    private function formatGaleri(Galeri $galeri): array
    {
        return [
            'id_galeri'  => $galeri->id_galeri,
            'judul'      => $galeri->judul,
            'deskripsi'  => $galeri->deskripsi,
            'foto'       => asset('storage/' . $galeri->foto),
            'urutan'     => $galeri->urutan,
            'tanggal'    => $galeri->tanggal,
            'created_at' => $galeri->created_at,
            'updated_at' => $galeri->updated_at,
        ];
    }
}
