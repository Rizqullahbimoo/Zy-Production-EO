<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PenawaranRequest;
use App\Mail\PenawaranBaruMail;
use App\Models\PenawaranCustom;
use App\Models\RequestCustomPaket;
use App\Support\DpCalculator;
use App\Support\KodeGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class PenawaranController extends Controller
{
    /**
     * Membuat penawaran baru untuk suatu request.
     */
    public function store(PenawaranRequest $request, int $id_request): JsonResponse
    {
        $customRequest = RequestCustomPaket::find($id_request);

        if (! $customRequest) {
            return response()->json([
                'status' => 'error',
                'message' => 'Request custom tidak ditemukan.',
            ], 404);
        }

        try {
            DB::beginTransaction();

            $penawaran = PenawaranCustom::create([
                'id_request' => $id_request,
                'kode_penawaran' => KodeGenerator::buat('PNW'),
                'tanggal_penawaran' => now(),
                'total_penawaran' => $request->total_penawaran,
                'dp_awal' => DpCalculator::hitung((float) $request->total_penawaran),
                'status_penawaran' => 'menunggu',
                'catatan_admin' => $request->catatan_admin,
            ]);

            // Update status request menjadi 'ditawarkan'
            $customRequest->update([
                'status_request' => 'ditawarkan',
            ]);

            DB::commit();

            // Send Email Notification
            try {
                Mail::to($customRequest->user->email)->send(new PenawaranBaruMail($penawaran));
            } catch (\Exception $e) {
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Penawaran harga berhasil dikirim ke customer.',
                'data' => $penawaran,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membuat penawaran: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Perbarui penawaran yang sudah ada (revisi hasil negosiasi lanjutan),
     * bukan membuat baris baru — mencegah duplikasi riwayat penawaran.
     *
     * Jika DP penawaran ini sudah dibayar customer (payment_status = paid),
     * total_penawaran & dp_awal dikunci (tidak diubah) agar tidak terjadi
     * mismatch dengan nominal yang sudah dibayarkan; hanya catatan_admin
     * yang tetap bisa diperbarui.
     */
    public function update(PenawaranRequest $request, int $id_penawaran): JsonResponse
    {
        $penawaran = PenawaranCustom::with('requestCustomPaket')->find($id_penawaran);

        if (! $penawaran) {
            return response()->json([
                'status' => 'error',
                'message' => 'Penawaran tidak ditemukan.',
            ], 404);
        }

        if ($penawaran->payment_status === 'paid') {
            $penawaran->update([
                'catatan_admin' => $request->catatan_admin,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Catatan penawaran diperbarui. Total & DP tidak diubah karena DP sudah dibayar customer.',
                'data' => $penawaran->fresh(),
            ]);
        }

        try {
            DB::beginTransaction();

            $penawaran->update([
                'total_penawaran' => $request->total_penawaran,
                'dp_awal' => DpCalculator::hitung((float) $request->total_penawaran),
                'catatan_admin' => $request->catatan_admin,
                'status_penawaran' => 'menunggu',
            ]);

            $penawaran->requestCustomPaket->update([
                'status_request' => 'ditawarkan',
            ]);

            DB::commit();

            try {
                Mail::to($penawaran->requestCustomPaket->user->email)->send(new PenawaranBaruMail($penawaran->fresh()));
            } catch (\Exception $e) {
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Penawaran berhasil diperbarui.',
                'data' => $penawaran->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui penawaran: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Hapus penawaran.
     */
    public function destroy(int $id_penawaran): JsonResponse
    {
        $penawaran = PenawaranCustom::find($id_penawaran);

        if (! $penawaran) {
            return response()->json([
                'status' => 'error',
                'message' => 'Penawaran tidak ditemukan.',
            ], 404);
        }

        $penawaran->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Penawaran berhasil dihapus.',
        ]);
    }
}
