<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Mail\PembayaranBerhasilMail;
use App\Models\DokumenMou;
use App\Models\Pemesanan;
use App\Models\PenawaranCustom;
use App\Support\DpCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Midtrans\Config;
use Midtrans\Notification;
use Midtrans\Snap;
use Midtrans\Transaction;

class MidtransController extends Controller
{
    public function __construct()
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$clientKey = config('services.midtrans.client_key');
        Config::$isProduction = config('services.midtrans.is_production', false);
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    /* ─────────────────────────────────────────────────────────
     | 1. CREATE SNAP TOKEN — PAKET BAWAAN
     ───────────────────────────────────────────────────────── */
    public function createTokenPaket(Request $request, int $id): JsonResponse
    {
        $pemesanan = Pemesanan::with(['paketLayanan', 'user'])
            ->where('id_user', $request->user()->id_user)
            ->find($id);

        if (! $pemesanan) {
            return response()->json(['status' => 'error', 'message' => 'Pemesanan tidak ditemukan.'], 404);
        }

        $mou = DokumenMou::where('id_pemesanan', $pemesanan->id_pemesanan)->first();
        if (! $mou || $mou->status_mou !== 'selesai') {
            return response()->json([
                'status' => 'error',
                'message' => 'Dokumen MOU belum selesai. Selesaikan proses tanda tangan MOU terlebih dahulu sebelum melanjutkan pembayaran.',
            ], 422);
        }

        if ($pemesanan->payment_status === 'paid') {
            return response()->json(['status' => 'error', 'message' => 'Pemesanan sudah dibayar.'], 422);
        }

        // Jika sudah ada snap token yang valid, return saja
        if ($pemesanan->snap_token) {
            return response()->json(['status' => 'success', 'snap_token' => $pemesanan->snap_token, 'order_id' => $pemesanan->midtrans_order_id]);
        }

        $orderId = $pemesanan->kode_pemesanan.'-'.time();
        // Charge DP saja, bukan harga penuh
        $dpAmount = $pemesanan->dp_amount
            ? (float) $pemesanan->dp_amount
            : DpCalculator::hitung((float) $pemesanan->paketLayanan->harga);
        $grossAmount = $dpAmount;
        $user = $pemesanan->user;

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $grossAmount,
            ],
            'customer_details' => [
                'first_name' => $user->nama,
                'email' => $user->email,
                'phone' => $user->no_hp ?? '',
            ],
            'item_details' => [
                [
                    'id' => 'DP-PKT-'.$pemesanan->paketLayanan->id_paket,
                    'price' => $grossAmount,
                    'quantity' => 1,
                    'name' => 'DP '.substr($pemesanan->paketLayanan->nama_paket, 0, 47),
                ],
            ],
        ];

        try {
            $snapToken = Snap::getSnapToken($params);

            $pemesanan->update([
                'midtrans_order_id' => $orderId,
                'snap_token' => $snapToken,
                'payment_status' => 'pending',
            ]);

            return response()->json([
                'status' => 'success',
                'snap_token' => $snapToken,
                'order_id' => $orderId,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membuat token pembayaran: '.$e->getMessage(),
            ], 500);
        }
    }

    /* ─────────────────────────────────────────────────────────
     | 2. CREATE SNAP TOKEN — PENAWARAN CUSTOM
     ───────────────────────────────────────────────────────── */
    public function createTokenCustom(Request $request, int $id): JsonResponse
    {
        // id di sini adalah id_penawaran
        $penawaran = PenawaranCustom::with(['requestCustomPaket.user'])
            ->whereHas('requestCustomPaket', fn ($q) => $q->where('id_user', $request->user()->id_user))
            ->find($id);

        if (! $penawaran) {
            return response()->json(['status' => 'error', 'message' => 'Penawaran tidak ditemukan.'], 404);
        }

        $mou = DokumenMou::where('id_request', $penawaran->requestCustomPaket->id_request)->first();
        if (! $mou || $mou->status_mou !== 'selesai') {
            return response()->json([
                'status' => 'error',
                'message' => 'Dokumen MOU belum selesai. Selesaikan proses tanda tangan MOU terlebih dahulu sebelum melanjutkan pembayaran.',
            ], 422);
        }

        if ($penawaran->payment_status === 'paid') {
            return response()->json(['status' => 'error', 'message' => 'Penawaran sudah dibayar.'], 422);
        }

        if ($penawaran->snap_token) {
            return response()->json(['status' => 'success', 'snap_token' => $penawaran->snap_token, 'order_id' => $penawaran->midtrans_order_id]);
        }

        $customReq = $penawaran->requestCustomPaket;
        $user = $customReq->user;
        $orderId = 'CUSTOM-'.$customReq->id_request.'-PNW-'.$id.'-'.time();
        // Charge DP saja, bukan total penawaran
        $dpAmount = $penawaran->dp_awal
            ? (float) $penawaran->dp_awal
            : DpCalculator::hitung((float) $penawaran->total_penawaran);
        $grossAmount = $dpAmount;

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $grossAmount,
            ],
            'customer_details' => [
                'first_name' => $user->nama,
                'email' => $user->email,
                'phone' => $user->no_hp ?? '',
            ],
            'item_details' => [
                [
                    'id' => 'DP-CUSTOM-REQ-'.$customReq->id_request,
                    'price' => $grossAmount,
                    'quantity' => 1,
                    'name' => 'DP Custom Event #'.$customReq->id_request,
                ],
            ],
        ];

        try {
            $snapToken = Snap::getSnapToken($params);

            $penawaran->update([
                'midtrans_order_id' => $orderId,
                'snap_token' => $snapToken,
                'payment_status' => 'pending',
            ]);

            return response()->json([
                'status' => 'success',
                'snap_token' => $snapToken,
                'order_id' => $orderId,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membuat token pembayaran: '.$e->getMessage(),
            ], 500);
        }
    }

    /* ─────────────────────────────────────────────────────────
     | 3. WEBHOOK NOTIFICATION dari Midtrans
     ───────────────────────────────────────────────────────── */
    public function notification(Request $request): JsonResponse
    {
        try {
            $notification = new Notification;

            $orderId = $notification->order_id;
            $transactionStatus = $notification->transaction_status;
            $fraudStatus = $notification->fraud_status;

            // Tentukan payment_status kita
            $paymentStatus = match (true) {
                $transactionStatus === 'capture' && $fraudStatus === 'accept' => 'paid',
                $transactionStatus === 'settlement' => 'paid',
                $transactionStatus === 'pending' => 'pending',
                in_array($transactionStatus, ['deny', 'cancel', 'failure']) => 'failed',
                $transactionStatus === 'expire' => 'expired',
                $transactionStatus === 'refund' => 'refund',
                default => 'pending',
            };

            // Update pemesanan paket bawaan
            $pemesanan = Pemesanan::where('midtrans_order_id', $orderId)->first();
            if ($pemesanan) {
                $pemesanan->update(['payment_status' => $paymentStatus]);
                if ($paymentStatus === 'paid') {
                    $pemesanan->update(['status_pemesanan' => 'dikonfirmasi']);
                    // Send Email Notification
                    try {
                        Mail::to($pemesanan->user->email)->send(new PembayaranBerhasilMail($pemesanan, 'paket'));
                    } catch (\Exception $e) {
                    }
                }
            }

            // Update penawaran custom
            $penawaran = PenawaranCustom::where('midtrans_order_id', $orderId)->first();
            if ($penawaran) {
                $penawaran->update(['payment_status' => $paymentStatus]);
                if ($paymentStatus === 'paid') {
                    $penawaran->update(['status_penawaran' => 'diterima']);
                    // Update status request juga
                    if ($penawaran->requestCustomPaket) {
                        $penawaran->requestCustomPaket->update(['status_request' => 'diterima']);
                    }
                    // Send Email Notification
                    try {
                        Mail::to($penawaran->requestCustomPaket->user->email)->send(new PembayaranBerhasilMail($penawaran, 'custom'));
                    } catch (\Exception $e) {
                    }
                }
            }

            return response()->json(['status' => 'success', 'message' => 'Notification processed.']);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /* ─────────────────────────────────────────────────────────
     | 4. SYNC STATUS MANUAL (Fallback untuk Localhost)
     ───────────────────────────────────────────────────────── */
    public function syncStatus(Request $request, $orderId): JsonResponse
    {
        try {
            $status = Transaction::status($orderId);
            $transactionStatus = $status->transaction_status;
            $fraudStatus = $status->fraud_status ?? null;

            $paymentStatus = match (true) {
                $transactionStatus === 'capture' && $fraudStatus === 'accept' => 'paid',
                $transactionStatus === 'settlement' => 'paid',
                $transactionStatus === 'pending' => 'pending',
                in_array($transactionStatus, ['deny', 'cancel', 'failure']) => 'failed',
                $transactionStatus === 'expire' => 'expired',
                $transactionStatus === 'refund' => 'refund',
                default => 'pending',
            };

            // Update pemesanan paket bawaan
            $pemesanan = Pemesanan::where('midtrans_order_id', $orderId)->first();
            if ($pemesanan) {
                $pemesanan->update(['payment_status' => $paymentStatus]);
                if ($paymentStatus === 'paid') {
                    $pemesanan->update(['status_pemesanan' => 'dikonfirmasi']);
                }
            }

            // Update penawaran custom
            $penawaran = PenawaranCustom::where('midtrans_order_id', $orderId)->first();
            if ($penawaran) {
                $penawaran->update(['payment_status' => $paymentStatus]);
                if ($paymentStatus === 'paid') {
                    $penawaran->update(['status_penawaran' => 'diterima']);
                    if ($penawaran->requestCustomPaket) {
                        $penawaran->requestCustomPaket->update(['status_request' => 'diterima']);
                    }
                }
            }

            return response()->json(['status' => 'success', 'payment_status' => $paymentStatus]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal sinkronisasi status: '.$e->getMessage(),
            ], 500);
        }
    }
}
