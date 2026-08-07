<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\FasilitasRequest;
use App\Models\FasilitasLayanan;
use Illuminate\Http\JsonResponse;

class FasilitasController extends Controller
{
    /**
     * Daftar semua fasilitas.
     */
    public function index(\Illuminate\Http\Request $request): JsonResponse
    {
        $query = FasilitasLayanan::query();
        if ($request->has('id_kategori')) {
            $query->where('id_kategori', $request->query('id_kategori'));
        }
        $fasilitas = $query->orderBy('nama_fasilitas')->get();

        return response()->json([
            'status' => 'success',
            'data'   => $fasilitas,
        ]);
    }

    /**
     * Simpan fasilitas baru.
     */
    public function store(FasilitasRequest $request): JsonResponse
    {
        $fasilitas = FasilitasLayanan::create([
            'nama_fasilitas' => $request->nama_fasilitas,
            'deskripsi'      => $request->deskripsi,
            'id_kategori'    => $request->id_kategori,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Fasilitas berhasil ditambahkan.',
            'data'    => $fasilitas,
        ], 201);
    }

    /**
     * Detail satu fasilitas.
     */
    public function show(int $id): JsonResponse
    {
        $fasilitas = FasilitasLayanan::find($id);

        if (!$fasilitas) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Fasilitas tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $fasilitas,
        ]);
    }

    /**
     * Update fasilitas.
     */
    public function update(FasilitasRequest $request, int $id): JsonResponse
    {
        $fasilitas = FasilitasLayanan::find($id);

        if (!$fasilitas) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Fasilitas tidak ditemukan.',
            ], 404);
        }

        $fasilitas->update([
            'nama_fasilitas' => $request->nama_fasilitas,
            'deskripsi'      => $request->deskripsi,
            'id_kategori'    => $request->id_kategori,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Fasilitas berhasil diperbarui.',
            'data'    => $fasilitas,
        ]);
    }

    /**
     * Hapus fasilitas.
     */
    public function destroy(int $id): JsonResponse
    {
        $fasilitas = FasilitasLayanan::find($id);

        if (!$fasilitas) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Fasilitas tidak ditemukan.',
            ], 404);
        }

        // Cek apakah dipakai di paket layanan atau request custom
        if ($fasilitas->detailPaket()->exists() || $fasilitas->detailRequestCustom()->exists()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Fasilitas tidak bisa dihapus karena sedang digunakan oleh paket atau request custom.',
            ], 409);
        }

        $fasilitas->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Fasilitas berhasil dihapus.',
        ]);
    }
}
