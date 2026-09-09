<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Support\CekKapasitasHarian;
use App\Support\KapasitasHarian;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KetersediaanController extends Controller
{
    /**
     * Cek ketersediaan slot event pada satu tanggal (publik, tanpa perlu
     * login — dipakai frontend untuk kasih peringatan sebelum customer
     * submit form pemesanan/request custom).
     * GET /api/ketersediaan?tanggal=YYYY-MM-DD
     */
    public function cek(Request $request): JsonResponse
    {
        $request->validate([
            'tanggal' => ['required', 'date'],
        ]);

        $tanggal = $request->query('tanggal');
        $slotTerpakai = CekKapasitasHarian::hitungSlotTerpakai($tanggal);

        return response()->json([
            'status' => 'success',
            'data' => [
                'tersedia' => $slotTerpakai < KapasitasHarian::MAKS_EVENT_PER_HARI,
                'slot_terpakai' => $slotTerpakai,
                'slot_maks' => KapasitasHarian::MAKS_EVENT_PER_HARI,
            ],
        ]);
    }
}
