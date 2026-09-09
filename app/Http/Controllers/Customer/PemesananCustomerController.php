<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\PaketLayanan;
use App\Models\Pemesanan;
use App\Support\CekKapasitasHarian;
use App\Support\DpCalculator;
use App\Support\KapasitasHarian;
use App\Support\KodeGenerator;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class PemesananCustomerController extends Controller
{
    /**
     * Buat pemesanan paket bawaan (standard package).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_paket' => ['required', 'integer', 'exists:paket_layanan,id_paket'],
            'tanggal_acara' => ['required', 'date', 'after:today'],
            'lokasi_acara' => ['required', 'string', 'max:255'],
            'jumlah_tamu' => ['required', 'integer', 'min:1'],
            'catatan' => ['nullable', 'string'],
        ]);

        $paket = PaketLayanan::find($validated['id_paket']);

        if (! $paket || $paket->status_paket !== 'aktif') {
            return response()->json([
                'status' => 'error',
                'message' => 'Paket tidak tersedia.',
            ], 422);
        }

        // Normalisasi ke 'Y-m-d' murni sekali di sini — dipakai konsisten untuk
        // key lock, pesan error, DAN baris yang disimpan, supaya dua input
        // yang merepresentasikan tanggal kalender yang sama tidak pernah
        // dianggap "tanggal berbeda" oleh mutex di bawah.
        $tanggal = Carbon::parse($validated['tanggal_acara'])->toDateString();

        // Mutex per-tanggal — mencegah race condition dua pemesanan nyaris
        // bersamaan sama-sama lolos hitung kapasitas pada slot terakhir.
        // Lihat CekKapasitasHarian untuk definisi "1 slot terpakai".
        try {
            $pemesanan = Cache::lock("kapasitas:{$tanggal}", 10)->block(5, function () use ($request, $validated, $paket, $tanggal) {
                if (! CekKapasitasHarian::tersedia($tanggal)) {
                    return null; // sentinel: kapasitas penuh
                }

                return DB::transaction(function () use ($request, $validated, $paket, $tanggal) {
                    return Pemesanan::create([
                        'id_user' => $request->user()->id_user,
                        'id_paket' => $validated['id_paket'],
                        'kode_pemesanan' => KodeGenerator::buat('PMS'),
                        'tanggal_pemesanan' => now()->toDateString(),
                        'tanggal_acara' => $tanggal,
                        'lokasi_acara' => $validated['lokasi_acara'],
                        'jumlah_tamu' => $validated['jumlah_tamu'],
                        'dp_amount' => DpCalculator::hitung((float) $paket->harga),
                        'status_pemesanan' => 'menunggu',
                        'catatan' => $validated['catatan'] ?? null,
                    ]);
                });
            });
        } catch (\Illuminate\Contracts\Cache\LockTimeoutException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Sistem sedang memproses pemesanan lain untuk tanggal ini. Silakan coba lagi sesaat lagi.',
            ], 503);
        }

        if ($pemesanan === null) {
            return response()->json([
                'status' => 'error',
                'message' => KapasitasHarian::pesanPenuh($tanggal),
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Pemesanan berhasil dibuat. Silakan lanjutkan pembayaran.',
            'data' => $pemesanan->load('paketLayanan.kategoriEvent'),
        ], 201);
    }

    /**
     * Daftar pemesanan paket bawaan milik customer.
     */
    public function index(Request $request): JsonResponse
    {
        $pemesanan = Pemesanan::with(['paketLayanan.kategoriEvent', 'dokumenMou'])
            ->where('id_user', $request->user()->id_user)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $pemesanan,
        ]);
    }

    /**
     * Detail satu pemesanan milik customer.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $pemesanan = Pemesanan::with(['paketLayanan.kategoriEvent', 'pembayaran', 'dokumenMou'])
            ->where('id_user', $request->user()->id_user)
            ->find($id);

        if (! $pemesanan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pemesanan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $pemesanan,
        ]);
    }
}
