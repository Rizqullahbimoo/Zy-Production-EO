<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\PenawaranRevisiRequest;
use App\Mail\PenawaranDisetujuiMail;
use App\Mail\PenawaranRevisiMail;
use App\Models\PenawaranCustom;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PenawaranController extends Controller
{
    /**
     * Customer menyetujui penawaran custom paket yang diajukan admin.
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $penawaran = PenawaranCustom::with('requestCustomPaket')->find($id);

        if (! $penawaran) {
            return response()->json([
                'status' => 'error',
                'message' => 'Penawaran tidak ditemukan.',
            ], 404);
        }

        if ($penawaran->requestCustomPaket->id_user !== $request->user()->id_user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses untuk penawaran ini.',
            ], 403);
        }

        if ($penawaran->status_penawaran !== 'menunggu') {
            return response()->json([
                'status' => 'error',
                'message' => 'Penawaran ini sudah diproses sebelumnya.',
            ], 422);
        }

        try {
            DB::beginTransaction();

            $penawaran->update([
                'status_penawaran' => 'diterima',
            ]);

            $penawaran->requestCustomPaket->update([
                'status_request' => 'diterima',
            ]);

            DB::commit();

            $adminEmails = User::where('role', 'admin')->where('status', 'aktif')->pluck('email');
            foreach ($adminEmails as $email) {
                try {
                    Mail::to($email)->send(new PenawaranDisetujuiMail($penawaran->fresh()));
                } catch (\Exception $e) {
                    Log::error('Gagal kirim email penawaran disetujui ke '.$email.': '.$e->getMessage());
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Penawaran berhasil disetujui.',
                'data' => $penawaran->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menyetujui penawaran: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Customer mengajukan revisi atas penawaran custom paket.
     */
    public function revisi(PenawaranRevisiRequest $request, int $id): JsonResponse
    {
        $penawaran = PenawaranCustom::with('requestCustomPaket')->find($id);

        if (! $penawaran) {
            return response()->json([
                'status' => 'error',
                'message' => 'Penawaran tidak ditemukan.',
            ], 404);
        }

        if ($penawaran->requestCustomPaket->id_user !== $request->user()->id_user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses untuk penawaran ini.',
            ], 403);
        }

        if ($penawaran->status_penawaran !== 'menunggu') {
            return response()->json([
                'status' => 'error',
                'message' => 'Penawaran ini sudah diproses sebelumnya.',
            ], 422);
        }

        $penawaran->update([
            'status_penawaran' => 'direvisi',
            'catatan_revisi_customer' => $request->catatan_revisi,
        ]);

        $adminEmails = User::where('role', 'admin')->where('status', 'aktif')->pluck('email');
        foreach ($adminEmails as $email) {
            try {
                Mail::to($email)->send(new PenawaranRevisiMail($penawaran->fresh()));
            } catch (\Exception $e) {
                Log::error('Gagal kirim email penawaran revisi ke '.$email.': '.$e->getMessage());
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Permintaan revisi berhasil dikirim ke admin.',
            'data' => $penawaran->fresh(),
        ]);
    }
}
