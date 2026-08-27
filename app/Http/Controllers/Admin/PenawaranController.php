<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PenawaranRequest;
use App\Mail\PenawaranBaruMail;
use App\Models\Pembayaran;
use App\Models\PenawaranCustom;
use App\Models\RequestCustomPaket;
use App\Support\DpCalculator;
use App\Support\KodeGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        // Kunci harga jika: penawaran sudah disetujui customer ATAU DP sudah dibayar.
        // Dalam kedua kondisi ini hanya catatan_admin yang boleh diperbarui.
        $harganDikunci = $penawaran->status_penawaran === 'diterima'
            || $penawaran->payment_status === 'paid';

        if ($harganDikunci) {
            $penawaran->update([
                'catatan_admin' => $request->catatan_admin,
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Catatan penawaran diperbarui. Total & DP dikunci karena penawaran sudah disetujui customer atau DP sudah dibayar.',
                'data'    => $penawaran->fresh(),
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
     * Catat pembayaran manual (pelunasan) untuk penawaran custom yang DP-nya
     * sudah lunas. Kalau total yang tercatat sudah menutupi total penawaran,
     * status pembayaran otomatis naik jadi 'paid' (Lunas). Menyamakan alur
     * pelunasan paket bawaan (lihat PemesananController::recordPayment).
     */
    public function recordPayment(Request $request, int $id_penawaran): JsonResponse
    {
        $request->validate([
            'jumlah_bayar' => ['required', 'numeric', 'min:1'],
            'tanggal_bayar' => ['nullable', 'date', 'before_or_equal:today'],
            'catatan_admin' => ['nullable', 'string', 'max:1000'],
            'bukti_pembayaran' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        $penawaran = PenawaranCustom::find($id_penawaran);

        if (! $penawaran) {
            return response()->json([
                'status' => 'error',
                'message' => 'Penawaran tidak ditemukan.',
            ], 404);
        }

        if ($penawaran->payment_status !== 'dp_paid') {
            return response()->json([
                'status' => 'error',
                'message' => 'Pembayaran manual hanya bisa dicatat setelah DP lunas dan sebelum penawaran lunas penuh.',
            ], 422);
        }

        $buktiPath = $request->hasFile('bukti_pembayaran')
            ? $request->file('bukti_pembayaran')->store('pembayaran', 'public')
            : null;

        Pembayaran::create([
            'id_penawaran' => $penawaran->id_penawaran,
            'jenis' => 'pelunasan',
            'created_id' => $request->user()->id_user,
            'tanggal_bayar' => $request->input('tanggal_bayar', now()->toDateString()),
            'jumlah_bayar' => $request->jumlah_bayar,
            'bukti_pembayaran' => $buktiPath,
            'status_konfirmasi' => 'dikonfirmasi',
            'catatan_admin' => $request->catatan_admin,
        ]);

        $total = (float) $penawaran->total_penawaran;
        $totalDibayar = (float) $penawaran->pembayaran()->where('status_konfirmasi', 'dikonfirmasi')->sum('jumlah_bayar');

        if ($totalDibayar >= $total) {
            $penawaran->update(['payment_status' => 'paid']);
        }

        $penawaran->load('pembayaran');

        return response()->json([
            'status' => 'success',
            'message' => 'Pembayaran berhasil dicatat.',
            'data' => [
                'payment_status' => $penawaran->payment_status,
                'pembayaran' => $penawaran->pembayaran,
                'total_dibayar' => $totalDibayar,
                'sisa_pembayaran' => max(0, $total - $totalDibayar),
            ],
        ]);
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
