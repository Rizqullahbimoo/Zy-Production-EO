<?php

namespace App\Http\Controllers;

use App\Models\Pemesanan;
use App\Models\RequestCustomPaket;
use App\Models\Ulasan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UlasanController extends Controller
{
    // Public: Ambil ulasan terbaik untuk Landing Page
    public function getTopReviews()
    {
        $ulasan = Ulasan::with('user:id_user,nama,foto')
            ->where('rating', '>=', 4)
            ->latest()
            ->take(6)
            ->get();

        return response()->json(['status' => 'success', 'data' => $ulasan]);
    }

    // Auth Customer: Simpan ulasan baru
    public function store(Request $request)
    {
        $request->validate([
            'id_pemesanan' => 'nullable|exists:pemesanan,id_pemesanan',
            'id_request' => 'nullable|exists:request_custom_paket,id_request',
            'rating' => 'required|integer|min:1|max:5',
            'komentar' => 'nullable|string',
        ]);

        if (! $request->id_pemesanan && ! $request->id_request) {
            return response()->json(['message' => 'ID Pemesanan atau Request harus diisi'], 400);
        }

        // Pastikan pesanan milik user ini dan statusnya selesai
        if ($request->id_pemesanan) {
            $pemesanan = Pemesanan::findOrFail($request->id_pemesanan);
            if ($pemesanan->id_user !== Auth::id() || $pemesanan->status_pemesanan !== 'selesai') {
                return response()->json(['message' => 'Tidak valid'], 403);
            }
        }

        if ($request->id_request) {
            $reqCustom = RequestCustomPaket::findOrFail($request->id_request);
            if ($reqCustom->id_user !== Auth::id() || $reqCustom->status_request !== 'selesai') {
                return response()->json(['message' => 'Tidak valid'], 403);
            }
        }

        $ulasan = Ulasan::create([
            'id_user' => Auth::id(),
            'id_pemesanan' => $request->id_pemesanan,
            'id_request' => $request->id_request,
            'rating' => $request->rating,
            'komentar' => $request->komentar,
        ]);

        return response()->json(['status' => 'success', 'message' => 'Ulasan berhasil disimpan', 'data' => $ulasan]);
    }
}
