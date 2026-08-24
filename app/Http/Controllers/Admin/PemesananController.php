<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\Pemesanan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PemesananController extends Controller
{
    /**
     * Display a listing of orders (with optional keyword search).
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $status = $request->query('status');

        $query = Pemesanan::with(['user', 'paketLayanan.kategoriEvent', 'dokumenMou']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('kode_pemesanan', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('nama', 'like', "%{$search}%");
                    })
                    ->orWhereHas('paketLayanan', function ($pq) use ($search) {
                        $pq->where('nama_paket', 'like', "%{$search}%");
                    });
            });
        }

        if ($status) {
            $query->where('status_pemesanan', $status);
        }

        $orders = $query->orderBy('created_at', 'desc')->get()->map(function ($p) {
            return [
                'id_pemesanan' => $p->id_pemesanan,
                'kode_pemesanan' => $p->kode_pemesanan,
                'nama_pemesan' => $p->user ? $p->user->nama : 'Umum',
                'paket' => $p->paketLayanan ? $p->paketLayanan->nama_paket : 'Custom Paket',
                'tanggal_acara' => $p->tanggal_acara ? $p->tanggal_acara->format('Y-m-d') : null,
                'status_pemesanan' => $p->status_pemesanan,
                'payment_status' => $p->payment_status,
                'status_mou' => $p->dokumenMou->status_mou ?? 'belum_ada',
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $orders,
        ]);
    }

    /**
     * Display detailed order data along with relationships.
     */
    public function show(int $id): JsonResponse
    {
        $order = Pemesanan::with(['user', 'paketLayanan.kategoriEvent', 'pembayaran', 'dokumenMou'])->find($id);

        if (! $order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pemesanan tidak ditemukan.',
            ], 404);
        }

        $harga = (float) ($order->paketLayanan->harga ?? 0);
        $totalDibayar = (float) $order->pembayaran->where('status_konfirmasi', 'dikonfirmasi')->sum('jumlah_bayar');

        return response()->json([
            'status' => 'success',
            'data' => [
                'id_pemesanan' => $order->id_pemesanan,
                'kode_pemesanan' => $order->kode_pemesanan,
                'tanggal_acara' => $order->tanggal_acara ? $order->tanggal_acara->format('Y-m-d') : null,
                'lokasi_acara' => $order->lokasi_acara,
                'status_pemesanan' => $order->status_pemesanan,
                'payment_status' => $order->payment_status,
                'catatan' => $order->catatan,
                'user' => $order->user ? [
                    'nama' => $order->user->nama,
                    'email' => $order->user->email,
                    'no_hp' => $order->user->no_hp,
                ] : null,
                'paket' => $order->paketLayanan ? [
                    'nama_paket' => $order->paketLayanan->nama_paket,
                    'harga' => $order->paketLayanan->harga,
                    'kategori' => $order->paketLayanan->kategoriEvent ? $order->paketLayanan->kategoriEvent->nama_kategori : '-',
                ] : null,
                'pembayaran' => $order->pembayaran,
                'total_dibayar' => $totalDibayar,
                'sisa_pembayaran' => max(0, $harga - $totalDibayar),
                'mou' => $order->dokumenMou ? [
                    'id_mou' => $order->dokumenMou->id_mou,
                    'status_mou' => $order->dokumenMou->status_mou,
                ] : null,
            ],
        ]);
    }

    /**
     * Catat pembayaran manual (pelunasan) untuk pemesanan yang DP-nya sudah
     * lunas. Kalau total yang tercatat sudah menutupi harga paket, status
     * pembayaran otomatis naik jadi 'paid' (Lunas).
     */
    public function recordPayment(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'jumlah_bayar' => ['required', 'numeric', 'min:1'],
            'tanggal_bayar' => ['nullable', 'date'],
            'catatan_admin' => ['nullable', 'string', 'max:1000'],
            'bukti_pembayaran' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        $order = Pemesanan::with('paketLayanan')->find($id);

        if (! $order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pemesanan tidak ditemukan.',
            ], 404);
        }

        if ($order->payment_status !== 'dp_paid') {
            return response()->json([
                'status' => 'error',
                'message' => 'Pembayaran manual hanya bisa dicatat setelah DP lunas dan sebelum pemesanan lunas penuh.',
            ], 422);
        }

        $buktiPath = $request->hasFile('bukti_pembayaran')
            ? $request->file('bukti_pembayaran')->store('pembayaran', 'public')
            : null;

        Pembayaran::create([
            'id_pemesanan' => $order->id_pemesanan,
            'created_id' => $request->user()->id_user,
            'tanggal_bayar' => $request->input('tanggal_bayar', now()->toDateString()),
            'jumlah_bayar' => $request->jumlah_bayar,
            'bukti_pembayaran' => $buktiPath,
            'status_konfirmasi' => 'dikonfirmasi',
            'catatan_admin' => $request->catatan_admin,
        ]);

        $harga = (float) ($order->paketLayanan->harga ?? 0);
        $totalDibayar = (float) $order->pembayaran()->where('status_konfirmasi', 'dikonfirmasi')->sum('jumlah_bayar');

        if ($totalDibayar >= $harga) {
            $order->update(['payment_status' => 'paid']);
        }

        $order->load('pembayaran');

        return response()->json([
            'status' => 'success',
            'message' => 'Pembayaran berhasil dicatat.',
            'data' => [
                'payment_status' => $order->payment_status,
                'pembayaran' => $order->pembayaran,
                'total_dibayar' => $totalDibayar,
                'sisa_pembayaran' => max(0, $harga - $totalDibayar),
            ],
        ]);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status_pemesanan' => ['required', 'in:menunggu,dikonfirmasi,dibatalkan,selesai'],
        ]);

        $order = Pemesanan::find($id);

        if (! $order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pemesanan tidak ditemukan.',
            ], 404);
        }

        $order->update([
            'status_pemesanan' => $request->status_pemesanan,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Status pemesanan berhasil diperbarui.',
            'data' => $order,
        ]);
    }
}
