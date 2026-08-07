<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\RequestCustomRequest;
use App\Models\RequestCustomPaket;
use App\Models\DetailRequestCustom;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RequestCustomController extends Controller
{
    /**
     * Mengajukan request paket custom.
     */
    public function store(RequestCustomRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $customRequest = RequestCustomPaket::create([
                'id_user'         => $request->user()->id_user,
                'id_kategori'     => $request->id_kategori,
                'tanggal_request' => now(),
                'tanggal_acara'   => $request->tanggal_acara,
                'lokasi_acara'    => $request->lokasi_acara,
                'jumlah_tamu'     => $request->jumlah_tamu,
                'budget_acara'    => $request->budget_acara,
                'catatan'         => $request->catatan,
                'status_request'  => 'menunggu',
            ]);

            foreach ($request->fasilitas as $f) {
                DetailRequestCustom::create([
                    'id_request'   => $customRequest->id_request,
                    'id_fasilitas' => $f['id_fasilitas'],
                    'keterangan'   => $f['keterangan'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Request custom paket berhasil dikirim. Menunggu tinjauan admin.',
                'data'    => $customRequest->load('detailRequestCustom.fasilitasLayanan'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Melihat daftar request milik sendiri.
     */
    public function index(Request $request): JsonResponse
    {
        $requests = RequestCustomPaket::with(['kategoriEvent', 'penawaranCustom', 'dokumenMou'])
            ->where('id_user', $request->user()->id_user)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $requests,
        ]);
    }

    /**
     * Melihat detail satu request.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $customRequest = RequestCustomPaket::with([
            'kategoriEvent',
            'detailRequestCustom.fasilitasLayanan',
            'penawaranCustom',
            'dokumenMou',
        ])
        ->where('id_user', $request->user()->id_user)
        ->find($id);

        if (!$customRequest) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Request tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $customRequest,
        ]);
    }
}
