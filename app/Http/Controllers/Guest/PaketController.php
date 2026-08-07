<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\KategoriEvent;
use App\Models\PaketLayanan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaketController extends Controller
{
    /**
     * Daftar semua paket aktif (publik).
     * GET /api/paket
     *
     * Query params:
     *   - kategori: filter by id_kategori
     *   - search: cari berdasarkan nama_paket
     */
    public function index(Request $request): JsonResponse
    {
        $query = PaketLayanan::with(['kategoriEvent', 'detailPaket.fasilitasLayanan'])
            ->where('status_paket', 'aktif');

        if ($request->filled('kategori')) {
            $query->where('id_kategori', $request->kategori);
        }

        if ($request->filled('search')) {
            $query->where('nama_paket', 'like', '%' . $request->search . '%');
        }

        $paket = $query->orderBy('nama_paket')->get()->map(function ($item) {
            return [
                'id_paket'     => $item->id_paket,
                'nama_paket'   => $item->nama_paket,
                'deskripsi'    => $item->deskripsi,
                'harga'        => $item->harga,
                'foto'         => $item->foto ? asset('storage/' . $item->foto) : null,
                'status_paket' => $item->status_paket,
                'kategori'     => [
                    'id_kategori'    => $item->kategoriEvent->id_kategori,
                    'nama_kategori'  => $item->kategoriEvent->nama_kategori,
                ],
                'fasilitas' => $item->detailPaket->map(fn ($d) => [
                    'id_fasilitas'   => $d->fasilitasLayanan->id_fasilitas,
                    'nama_fasilitas' => $d->fasilitasLayanan->nama_fasilitas,
                ]),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $paket,
        ]);
    }

    /**
     * Detail satu paket beserta fasilitasnya (publik).
     * GET /api/paket/{id}
     */
    public function show(int $id): JsonResponse
    {
        $paket = PaketLayanan::with(['kategoriEvent', 'detailPaket.fasilitasLayanan'])
            ->where('status_paket', 'aktif')
            ->find($id);

        if (! $paket) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Paket tidak ditemukan.',
            ], 404);
        }

        $fasilitas = $paket->detailPaket->map(function ($detail) {
            return [
                'id_fasilitas'   => $detail->fasilitasLayanan->id_fasilitas,
                'nama_fasilitas' => $detail->fasilitasLayanan->nama_fasilitas,
                'deskripsi'      => $detail->fasilitasLayanan->deskripsi,
                'qty'            => $detail->qty,
                'keterangan'     => $detail->keterangan,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => [
                'id_paket'     => $paket->id_paket,
                'nama_paket'   => $paket->nama_paket,
                'deskripsi'    => $paket->deskripsi,
                'harga'        => $paket->harga,
                'foto'         => $paket->foto ? asset('storage/' . $paket->foto) : null,
                'status_paket' => $paket->status_paket,
                'kategori'     => [
                    'id_kategori'   => $paket->kategoriEvent->id_kategori,
                    'nama_kategori' => $paket->kategoriEvent->nama_kategori,
                    'deskripsi'     => $paket->kategoriEvent->deskripsi,
                ],
                'fasilitas' => $fasilitas,
            ],
        ]);
    }

    /**
     * Daftar semua kategori (publik, untuk filter).
     * GET /api/kategori
     */
    public function kategori(): JsonResponse
    {
        $kategori = KategoriEvent::withCount([
            'paketLayanan' => fn ($q) => $q->where('status_paket', 'aktif'),
        ])->get()->map(function ($item) {
            return [
                'id_kategori'   => $item->id_kategori,
                'nama_kategori' => $item->nama_kategori,
                'deskripsi'     => $item->deskripsi,
                'jumlah_paket'  => $item->paket_layanan_count,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $kategori,
        ]);
    }

    /**
     * Daftar semua fasilitas (publik).
     * GET /api/fasilitas
     */
    public function fasilitas(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = \App\Models\FasilitasLayanan::query();
        if ($request->filled('id_kategori')) {
            $query->where('id_kategori', $request->id_kategori);
        }
        $fasilitas = $query->orderBy('nama_fasilitas')->get();

        return response()->json([
            'status' => 'success',
            'data'   => $fasilitas,
        ]);
    }
}
