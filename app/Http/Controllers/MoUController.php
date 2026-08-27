<?php

namespace App\Http\Controllers;

use App\Mail\MouDraftTersediaMail;
use App\Mail\MouSelesaiMail;
use App\Mail\MouTtdCustomerMasukMail;
use App\Models\DokumenMou;
use App\Models\Pemesanan;
use App\Models\RequestCustomPaket;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class MoUController extends Controller
{
    private const FILE_RULES = ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'];

    /* ─────────────────────────────────────────────────────────
     |  ADMIN
     ───────────────────────────────────────────────────────── */

    /**
     * Admin mengunggah draf MOU untuk sebuah pemesanan/custom request.
     * POST /admin/mou/draft/{tipe}/{id}
     */
    public function uploadDraft(Request $request, string $tipe, int $id): JsonResponse
    {
        if (! in_array($tipe, ['pemesanan', 'custom'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tipe transaksi tidak valid.',
            ], 422);
        }

        $request->validate(['file' => self::FILE_RULES]);

        if ($tipe === 'pemesanan') {
            $pemesanan = Pemesanan::with('user')->find($id);
            if (! $pemesanan) {
                return response()->json(['status' => 'error', 'message' => 'Pemesanan tidak ditemukan.'], 404);
            }
            $mou = DokumenMou::firstOrNew(['id_pemesanan' => $pemesanan->id_pemesanan]);
            $customerEmail = $pemesanan->user->email ?? null;
        } else {
            $customRequest = RequestCustomPaket::with('user')->find($id);
            if (! $customRequest) {
                return response()->json(['status' => 'error', 'message' => 'Request custom tidak ditemukan.'], 404);
            }
            $mou = DokumenMou::firstOrNew(['id_request' => $customRequest->id_request]);
            $customerEmail = $customRequest->user->email ?? null;
        }

        $path = $request->file('file')->store('mou', 'public');

        $mou->file_draft = $path;
        $mou->status_mou = 'menunggu_ttd_customer';
        $mou->save();

        if ($customerEmail) {
            try {
                Mail::to($customerEmail)->send(new MouDraftTersediaMail($mou));
            } catch (\Exception $e) {
                Log::error('Gagal kirim email MOU (draft tersedia): '.$e->getMessage());
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Draf dokumen MOU berhasil diunggah.',
            'data' => $this->formatMou($mou->fresh()),
        ]);
    }

    /**
     * Admin mengunggah dokumen final (sudah ditandatangani dua pihak).
     * POST /admin/mou/{id_mou}/final
     */
    public function uploadFinal(Request $request, int $id_mou): JsonResponse
    {
        $mou = DokumenMou::with(['pemesanan.user', 'requestCustomPaket.user'])->find($id_mou);

        if (! $mou) {
            return response()->json(['status' => 'error', 'message' => 'Dokumen MOU tidak ditemukan.'], 404);
        }

        if ($mou->status_mou !== 'menunggu_ttd_admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Dokumen MOU belum berada di tahap menunggu tanda tangan admin.',
            ], 422);
        }

        $request->validate(['file' => self::FILE_RULES]);

        $path = $request->file('file')->store('mou', 'public');

        $mou->file_final = $path;
        $mou->status_mou = 'selesai';
        $mou->save();

        $customerEmail = $mou->pemesanan->user->email ?? $mou->requestCustomPaket->user->email ?? null;
        if ($customerEmail) {
            try {
                Mail::to($customerEmail)->send(new MouSelesaiMail($mou));
            } catch (\Exception $e) {
                Log::error('Gagal kirim email MOU (selesai): '.$e->getMessage());
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Dokumen MOU final berhasil diunggah. Proses MOU selesai.',
            'data' => $this->formatMou($mou->fresh()),
        ]);
    }

    /**
     * Detail satu dokumen MOU (untuk modal admin).
     * GET /admin/mou/{id_mou}
     */
    public function show(int $id_mou): JsonResponse
    {
        $mou = DokumenMou::with([
            'pemesanan.user',
            'pemesanan.paketLayanan',
            'requestCustomPaket.user',
            'requestCustomPaket.kategoriEvent',
        ])->find($id_mou);

        if (! $mou) {
            return response()->json(['status' => 'error', 'message' => 'Dokumen MOU tidak ditemukan.'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $this->formatMou($mou, true),
        ]);
    }

    /**
     * Daftar seluruh status MOU dari pemesanan & request custom.
     * GET /admin/mou
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $status = $request->query('status');

        $pemesananQuery = Pemesanan::with(['user', 'paketLayanan', 'dokumenMou']);
        if ($search) {
            $pemesananQuery->where(function ($q) use ($search) {
                $q->where('kode_pemesanan', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($uq) => $uq->where('nama', 'like', "%{$search}%"));
            });
        }

        $customQuery = RequestCustomPaket::with(['user', 'kategoriEvent', 'dokumenMou']);
        if ($search) {
            $customQuery->where(function ($q) use ($search) {
                $q->whereHas('user', fn ($uq) => $uq->where('nama', 'like', "%{$search}%"))
                    ->orWhereHas('kategoriEvent', fn ($kq) => $kq->where('nama_kategori', 'like', "%{$search}%"));
            });
        }

        $daftarPemesanan = $pemesananQuery->orderBy('created_at', 'desc')->get()->map(function ($p) {
            return [
                'tipe' => 'pemesanan',
                'id' => $p->id_pemesanan,
                'id_mou' => $p->dokumenMou->id_mou ?? null,
                'kode' => $p->kode_pemesanan,
                'nama_pemesan' => $p->user->nama ?? '-',
                'label' => $p->paketLayanan->nama_paket ?? 'Paket Layanan',
                'status_mou' => $p->dokumenMou->status_mou ?? 'belum_ada',
                'created_at' => $p->created_at,
            ];
        });

        $daftarCustom = $customQuery->orderBy('created_at', 'desc')->get()->map(function ($r) {
            return [
                'tipe' => 'custom',
                'id' => $r->id_request,
                'id_mou' => $r->dokumenMou->id_mou ?? null,
                'kode' => $r->kode_request,
                'nama_pemesan' => $r->user->nama ?? '-',
                'label' => 'Custom Paket ('.($r->kategoriEvent->nama_kategori ?? 'Custom').')',
                'status_mou' => $r->dokumenMou->status_mou ?? 'belum_ada',
                'created_at' => $r->created_at,
            ];
        });

        $daftar = $daftarPemesanan->concat($daftarCustom);

        if ($status) {
            $daftar = $daftar->where('status_mou', $status);
        }

        $daftar = $daftar->sortByDesc('created_at')->values();

        return response()->json([
            'status' => 'success',
            'data' => $daftar,
        ]);
    }

    /* ─────────────────────────────────────────────────────────
     |  CUSTOMER
     ───────────────────────────────────────────────────────── */

    /**
     * Customer mengunggah dokumen MOU yang sudah ditandatangani.
     * POST /customer/mou/upload-ttd/{tipe}/{id}
     *
     * Sengaja dikunci berdasarkan (tipe, id pemesanan/request) — bukan id_mou —
     * karena baris DokumenMou baru ada setelah admin mengunggah draf. Kalau
     * endpoint ini tetap dikunci ke id_mou, tidak ada cara memanggilnya sama
     * sekali sebelum draf tersedia, sehingga skenario "customer mencoba unggah
     * sebelum draf tersedia" (TC-66) tidak pernah bisa ditolak secara eksplisit
     * oleh backend — satu-satunya pertahanan cuma menyembunyikan tombol di UI.
     */
    public function uploadTtd(Request $request, string $tipe, int $id): JsonResponse
    {
        if (! in_array($tipe, ['pemesanan', 'custom'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tipe transaksi tidak valid.',
            ], 422);
        }

        if ($tipe === 'pemesanan') {
            $pemesanan = Pemesanan::find($id);
            if (! $pemesanan) {
                return response()->json(['status' => 'error', 'message' => 'Pemesanan tidak ditemukan.'], 404);
            }
            if ($pemesanan->id_user !== Auth::id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            $mou = DokumenMou::where('id_pemesanan', $pemesanan->id_pemesanan)->first();
        } else {
            $customRequest = RequestCustomPaket::find($id);
            if (! $customRequest) {
                return response()->json(['status' => 'error', 'message' => 'Request custom tidak ditemukan.'], 404);
            }
            if ($customRequest->id_user !== Auth::id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            $mou = DokumenMou::where('id_request', $customRequest->id_request)->first();
        }

        // TC-66: draf MOU belum pernah diunggah admin sama sekali — tolak
        // eksplisit disertai pesan, bukan cuma mengandalkan frontend yang
        // menyembunyikan kontrol unggah.
        if (! $mou) {
            return response()->json([
                'status' => 'error',
                'message' => 'Draf MOU belum tersedia. Admin belum menyiapkan dokumen MOU untuk pesanan Anda.',
            ], 422);
        }

        if ($mou->status_mou !== 'menunggu_ttd_customer') {
            return response()->json([
                'status' => 'error',
                'message' => 'Dokumen MOU belum berada di tahap menunggu tanda tangan Anda.',
            ], 422);
        }

        $request->validate(['file' => self::FILE_RULES]);

        $path = $request->file('file')->store('mou', 'public');

        $mou->file_ttd_customer = $path;
        $mou->status_mou = 'menunggu_ttd_admin';
        $mou->save();

        $adminEmails = User::where('role', 'admin')->pluck('email');
        foreach ($adminEmails as $email) {
            try {
                Mail::to($email)->send(new MouTtdCustomerMasukMail($mou));
            } catch (\Exception $e) {
                Log::error('Gagal kirim email MOU (ttd customer masuk) ke '.$email.': '.$e->getMessage());
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Dokumen MOU yang sudah ditandatangani berhasil diunggah.',
            'data' => $this->formatMou($mou->fresh()),
        ]);
    }

    /**
     * Customer melihat status & file MOU miliknya sendiri.
     * GET /customer/mou/{id_mou}
     */
    public function showForCustomer(int $id_mou): JsonResponse
    {
        $mou = DokumenMou::with([
            'pemesanan.paketLayanan',
            'requestCustomPaket.kategoriEvent',
        ])->find($id_mou);

        if (! $mou) {
            return response()->json(['status' => 'error', 'message' => 'Dokumen MOU tidak ditemukan.'], 404);
        }

        $ownerId = $mou->pemesanan->id_user ?? $mou->requestCustomPaket->id_user ?? null;
        if ($ownerId !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $this->formatMou($mou),
        ]);
    }

    /* ─────────────────────────────────────────────────────────
     |  HELPER
     ───────────────────────────────────────────────────────── */

    private function formatMou(DokumenMou $mou, bool $withRelasi = false): array
    {
        $data = [
            'id_mou' => $mou->id_mou,
            'id_pemesanan' => $mou->id_pemesanan,
            'id_request' => $mou->id_request,
            'status_mou' => $mou->status_mou,
            'catatan' => $mou->catatan,
            'file_draft' => $mou->file_draft ? '/storage/'.$mou->file_draft : null,
            'file_ttd_customer' => $mou->file_ttd_customer ? '/storage/'.$mou->file_ttd_customer : null,
            'file_final' => $mou->file_final ? '/storage/'.$mou->file_final : null,
            'created_at' => $mou->created_at,
            'updated_at' => $mou->updated_at,
        ];

        if ($withRelasi) {
            $data['pemesanan'] = $mou->relationLoaded('pemesanan') && $mou->pemesanan ? [
                'id_pemesanan' => $mou->pemesanan->id_pemesanan,
                'kode_pemesanan' => $mou->pemesanan->kode_pemesanan,
                'nama_paket' => $mou->pemesanan->paketLayanan->nama_paket ?? '-',
                'nama_customer' => $mou->pemesanan->user->nama ?? '-',
            ] : null;

            $data['request_custom'] = $mou->relationLoaded('requestCustomPaket') && $mou->requestCustomPaket ? [
                'id_request' => $mou->requestCustomPaket->id_request,
                'kode' => $mou->requestCustomPaket->kode_request,
                'kategori' => $mou->requestCustomPaket->kategoriEvent->nama_kategori ?? '-',
                'nama_customer' => $mou->requestCustomPaket->user->nama ?? '-',
            ] : null;
        }

        return $data;
    }
}
