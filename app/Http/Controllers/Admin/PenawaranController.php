<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PenawaranRequest;
use App\Models\PenawaranCustom;
use App\Models\RequestCustomPaket;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\PenawaranBaruMail;

class PenawaranController extends Controller
{
    /**
     * Membuat penawaran baru untuk suatu request.
     */
    public function store(PenawaranRequest $request, int $id_request): JsonResponse
    {
        $customRequest = RequestCustomPaket::find($id_request);

        if (!$customRequest) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Request custom tidak ditemukan.',
            ], 404);
        }

        try {
            DB::beginTransaction();

            $penawaran = PenawaranCustom::create([
                'id_request'        => $id_request,
                'tanggal_penawaran' => now(),
                'total_penawaran'   => $request->total_penawaran,
                'dp_awal'           => $request->dp_awal,
                'status_penawaran'  => 'menunggu',
                'catatan_admin'     => $request->catatan_admin,
            ]);

            // Update status request menjadi 'ditawarkan'
            $customRequest->update([
                'status_request' => 'ditawarkan',
            ]);

            DB::commit();

            // Send Email Notification
            try { Mail::to($customRequest->user->email)->send(new PenawaranBaruMail($penawaran)); } catch (\Exception $e) {}

            return response()->json([
                'status'  => 'success',
                'message' => 'Penawaran harga berhasil dikirim ke customer.',
                'data'    => $penawaran,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal membuat penawaran: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Hapus penawaran.
     */
    public function destroy(int $id_penawaran): JsonResponse
    {
        $penawaran = PenawaranCustom::find($id_penawaran);

        if (!$penawaran) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Penawaran tidak ditemukan.',
            ], 404);
        }

        $penawaran->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Penawaran berhasil dihapus.',
        ]);
    }
}
