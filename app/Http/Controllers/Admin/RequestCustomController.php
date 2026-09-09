<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RequestCustomPaket;
use App\Support\CekKapasitasHarian;
use App\Support\KapasitasHarian;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

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
            'penawaranCustom.pembayaran',
            'dokumenMou',
        ])->find($id);

        if (! $customRequest) {
            return response()->json([
                'status' => 'error',
                'message' => 'Request tidak ditemukan.',
            ], 404);
        }

        // Info kapasitas non-blocking untuk tanggal request ini — dipakai
        // frontend menampilkan badge peringatan (bukan larangan) di form buat
        // penawaran, supaya admin tahu risikonya SEBELUM menawarkan harga ke
        // customer di tanggal yang sudah padat, tanpa dipaksa batal.
        // Kapasitas sesungguhnya baru benar-benar digerbangi (blocking) saat
        // customer approve penawaran ini nanti.
        $tanggal = $customRequest->tanggal_acara->toDateString();
        $customRequest->kapasitas_tanggal = [
            'tersedia' => CekKapasitasHarian::tersedia($tanggal),
            'slot_terpakai' => CekKapasitasHarian::hitungSlotTerpakai($tanggal),
            'slot_maks' => KapasitasHarian::MAKS_EVENT_PER_HARI,
        ];

        return response()->json([
            'status' => 'success',
            'data' => $customRequest,
        ]);
    }

    /**
     * Update status request (misal: 'diproses' atau 'ditolak').
     *
     * Kalau target statusnya 'diterima' DAN status sebelumnya BUKAN
     * 'diterima' (transisi baru, bukan re-submit status yang sama), ini
     * artinya request itu akan ikut dihitung slot kapasitas harian — jadi
     * digerbangi mutex+cek kapasitas yang sama seperti
     * Customer\PenawaranController::approve(). Ditemukan saat review
     * independen: dropdown "Ubah Status Request Custom" di admin dashboard
     * punya opsi "Siap Ditinjau" (= status_request 'diterima') yang sebelumnya
     * bisa dipakai admin untuk melewati approve() milik customer sepenuhnya,
     * termasuk melewati validasi kapasitas.
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

        $targetStatus = $request->status_request;
        $akanJadiDiterima = $targetStatus === 'diterima' && $customRequest->status_request !== 'diterima';

        if (! $akanJadiDiterima) {
            $customRequest->update(['status_request' => $targetStatus]);

            return response()->json([
                'status' => 'success',
                'message' => 'Status request berhasil diperbarui.',
                'data' => $customRequest,
            ]);
        }

        $tanggal = $customRequest->tanggal_acara->toDateString();

        try {
            $hasil = Cache::lock("kapasitas:{$tanggal}", 10)->block(5, function () use ($tanggal, $customRequest, $targetStatus) {
                if (! CekKapasitasHarian::tersedia($tanggal)) {
                    return 'penuh';
                }

                $customRequest->update(['status_request' => $targetStatus]);

                return 'sukses';
            });
        } catch (LockTimeoutException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sistem sedang memproses permintaan lain untuk tanggal ini. Silakan coba lagi sesaat lagi.',
            ], 503);
        }

        if ($hasil === 'penuh') {
            return response()->json([
                'status' => 'error',
                'message' => KapasitasHarian::pesanPenuh($tanggal),
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Status request berhasil diperbarui.',
            'data' => $customRequest->fresh(),
        ]);
    }
}
