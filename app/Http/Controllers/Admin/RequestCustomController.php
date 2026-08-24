<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RequestCustomPaket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RequestCustomController extends Controller
{
    /**
     * Daftar semua request custom dari semua user (dengan pencarian).
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $status = $request->query('status');

        $query = RequestCustomPaket::with(['user', 'kategoriEvent', 'penawaranCustom', 'dokumenMou']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('kode_request', 'like', "%{$search}%");

                // Hapus awalan 'REQ-' jika dimasukkan user untuk mencari id_request secara numerik
                // (fallback untuk data lama / pencarian manual pakai ID mentah)
                $numericSearch = preg_replace('/^req-/i', '', trim($search));
                $numericSearch = ltrim($numericSearch, '0');

                if (is_numeric($numericSearch) && $numericSearch !== '') {
                    $q->orWhere('id_request', $numericSearch);
                }

                $q->orWhereHas('user', function ($uq) use ($search) {
                    $uq->where('nama', 'like', "%{$search}%");
                })
                    ->orWhereHas('kategoriEvent', function ($kq) use ($search) {
                        $kq->where('nama_kategori', 'like', "%{$search}%");
                    });
            });
        }

        if ($status) {
            $query->where('status_request', $status);
        }

        $requests = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $requests,
        ]);
    }

    /**
     * Detail request custom (admin).
     */
    public function show(int $id): JsonResponse
    {
        $customRequest = RequestCustomPaket::with([
            'user',
            'kategoriEvent',
            'detailRequestCustom.fasilitasLayanan',
            'penawaranCustom',
            'dokumenMou',
        ])->find($id);

        if (! $customRequest) {
            return response()->json([
                'status' => 'error',
                'message' => 'Request tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $customRequest,
        ]);
    }

    /**
     * Update status request (misal: 'diproses' atau 'ditolak').
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status_request' => ['required', 'in:menunggu,diproses,ditawarkan,diterima,ditolak,selesai'],
        ]);

        $customRequest = RequestCustomPaket::find($id);

        if (! $customRequest) {
            return response()->json([
                'status' => 'error',
                'message' => 'Request tidak ditemukan.',
            ], 404);
        }

        $customRequest->update([
            'status_request' => $request->status_request,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Status request berhasil diperbarui.',
            'data' => $customRequest,
        ]);
    }
}
