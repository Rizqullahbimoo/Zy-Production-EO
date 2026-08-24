<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\PaketLayanan;
use App\Models\Pemesanan;
use App\Support\DpCalculator;
use App\Support\KodeGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

        $kode = KodeGenerator::buat('PMS');

        $dpAmount = DpCalculator::hitung((float) $paket->harga);

        $pemesanan = Pemesanan::create([
            'id_user' => $request->user()->id_user,
            'id_paket' => $validated['id_paket'],
            'kode_pemesanan' => $kode,
            'tanggal_pemesanan' => now()->toDateString(),
            'tanggal_acara' => $validated['tanggal_acara'],
            'lokasi_acara' => $validated['lokasi_acara'],
            'jumlah_tamu' => $validated['jumlah_tamu'],
            'dp_amount' => $dpAmount,
            'status_pemesanan' => 'menunggu',
            'catatan' => $validated['catatan'] ?? null,
        ]);

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
