<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KategoriEvent;
use App\Models\PaketLayanan;
use App\Models\Pemesanan;
use App\Models\RequestCustomPaket;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Get summary metrics and recent orders for the admin dashboard.
     */
    public function index(): JsonResponse
    {
        $kategoriCount = KategoriEvent::count();
        $paketCount = PaketLayanan::where('status_paket', 'aktif')->count();
        $pemesananCount = Pemesanan::count();
        $requestCustomCount = RequestCustomPaket::count();

        // Fetch 5 most recent standard orders
        $recentStandard = Pemesanan::with(['user', 'paketLayanan'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id_pemesanan,
                    'kode' => $p->kode_pemesanan,
                    'nama_pemesan' => $p->user ? $p->user->nama : 'Umum',
                    'paket' => $p->paketLayanan ? $p->paketLayanan->nama_paket : '-',
                    'tanggal_acara' => $p->tanggal_acara ? $p->tanggal_acara->format('Y-m-d') : null,
                    'status' => $p->status_pemesanan,
                    'created_at' => $p->created_at ? $p->created_at->toIso8601String() : null,
                    'is_custom' => false,
                ];
            });

        // Fetch 5 most recent custom requests
        $recentCustom = RequestCustomPaket::with(['user', 'kategoriEvent'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($r) {
                $categoryName = $r->kategoriEvent ? $r->kategoriEvent->nama_kategori : 'Custom';

                return [
                    'id' => $r->id_request,
                    'kode' => 'REQ-'.str_pad($r->id_request, 3, '0', STR_PAD_LEFT),
                    'nama_pemesan' => $r->user ? $r->user->nama : '-',
                    'paket' => 'Custom Paket ('.$categoryName.')',
                    'tanggal_acara' => $r->tanggal_acara ? $r->tanggal_acara->format('Y-m-d') : null,
                    'status' => $r->status_request,
                    'created_at' => $r->created_at ? $r->created_at->toIso8601String() : null,
                    'is_custom' => true,
                ];
            });

        // Merge both collections, sort by created_at descending, and take the top 5
        $recentPemesanan = $recentStandard->concat($recentCustom)
            ->sortByDesc('created_at')
            ->take(5)
            ->values();

        return response()->json([
            'status' => 'success',
            'data' => [
                'counts' => [
                    'kategori' => $kategoriCount,
                    'paket' => $paketCount,
                    'pemesanan' => $pemesananCount,
                    'request_custom' => $requestCustomCount,
                ],
                'recent_pemesanan' => $recentPemesanan,
            ],
        ]);
    }
}
