<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Mail\PembayaranBerhasilMail;
use App\Models\DokumenMou;
use App\Models\Pembayaran;
use App\Models\Pemesanan;
use App\Models\PenawaranCustom;
use App\Support\DpCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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

        if (in_array($pemesanan->payment_status, ['dp_paid', 'paid'])) {
            return response()->json(['status' => 'error', 'message' => 'DP untuk pemesanan ini sudah dibayar. Sisa pembayaran dicatat oleh admin.'], 422);
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
        $grossAmount = (int) round($dpAmount);
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

        if (in_array($penawaran->payment_status, ['dp_paid', 'paid'])) {
            return response()->json(['status' => 'error', 'message' => 'DP untuk penawaran ini sudah dibayar. Sisa pembayaran dicatat oleh admin.'], 422);
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
        $grossAmount = (int) round($dpAmount);

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

            // Status "mentah" dari Midtrans, terlepas dari makna 'paid' yang beda
            // antara pemesanan (selalu DP saja) dan penawaran custom.
            $settledStatus = match (true) {
                $transactionStatus === 'capture' && $fraudStatus === 'accept' => 'settled',
                $transactionStatus === 'settlement' => 'settled',
                $transactionStatus === 'pending' => 'pending',
                in_array($transactionStatus, ['deny', 'cancel', 'failure']) => 'failed',
                $transactionStatus === 'expire' => 'expired',
                $transactionStatus === 'refund' => 'refund',
                default => 'pending',
            };

            // Update pemesanan paket bawaan — Midtrans di sini SELALU cuma nge-charge
            // DP, jadi transaksi settle berarti 'dp_paid' (menunggu pelunasan manual
            // oleh admin), bukan 'paid' (lunas penuh).
            $pemesanan = Pemesanan::with('paketLayanan')->where('midtrans_order_id', $orderId)->first();
            if ($pemesanan) {
                $sudahDpSebelumnya = in_array($pemesanan->payment_status, ['dp_paid', 'paid']);
                $pemesananStatus = $settledStatus === 'settled' ? 'dp_paid' : $settledStatus;
                $pemesanan->update(['payment_status' => $pemesananStatus]);

                if ($pemesananStatus === 'dp_paid') {
                    $pemesanan->update(['status_pemesanan' => 'dikonfirmasi']);

                    if (! $sudahDpSebelumnya) {
                        Pembayaran::create([
                            'id_pemesanan' => $pemesanan->id_pemesanan,
                            'jenis' => 'dp',
                            'created_id' => null,
                            'tanggal_bayar' => now()->toDateString(),
                            'jumlah_bayar' => $pemesanan->dp_amount ?: DpCalculator::hitung((float) $pemesanan->paketLayanan->harga),
                            'status_konfirmasi' => 'dikonfirmasi',
                            'catatan_admin' => 'Pembayaran DP otomatis terverifikasi via Midtrans.',
                        ]);
                    }

                    // Send Email Notification
                    try {
                        Mail::to($pemesanan->user->email)->send(new PembayaranBerhasilMail($pemesanan, 'paket'));
                    } catch (\Exception $e) {
                        Log::error('Gagal mengirim email PembayaranBerhasilMail', [
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString(),
                        ]);
                    }
                }
            }

            // Update penawaran custom — Midtrans di sini juga SELALU cuma nge-charge
            // DP, jadi transaksi settle berarti 'dp_paid' (menunggu pelunasan manual
            // oleh admin), bukan 'paid' (lunas penuh). Sama seperti alur pemesanan.
            $penawaran = PenawaranCustom::with('requestCustomPaket')->where('midtrans_order_id', $orderId)->first();
            if ($penawaran) {
                $sudahDpSebelumnya = in_array($penawaran->payment_status, ['dp_paid', 'paid']);
                $penawaranStatus = $settledStatus === 'settled' ? 'dp_paid' : $settledStatus;
                $penawaran->update(['payment_status' => $penawaranStatus]);
                if ($penawaranStatus === 'dp_paid') {
                    $penawaran->update(['status_penawaran' => 'diterima']);
                    // Update status request juga
                    if ($penawaran->requestCustomPaket) {
                        $penawaran->requestCustomPaket->update(['status_request' => 'diterima']);
                    }

                    if (! $sudahDpSebelumnya) {
                        Pembayaran::create([
                            'id_penawaran' => $penawaran->id_penawaran,
                            'jenis' => 'dp',
                            'created_id' => null,
                            'tanggal_bayar' => now()->toDateString(),
                            'jumlah_bayar' => $penawaran->dp_awal ?: DpCalculator::hitung((float) $penawaran->total_penawaran),
                            'status_konfirmasi' => 'dikonfirmasi',
                            'catatan_admin' => 'Pembayaran DP otomatis terverifikasi via Midtrans.',
                        ]);
                    }

                    // Send Email Notification
                    try {
                        Mail::to($penawaran->requestCustomPaket->user->email)->send(new PembayaranBerhasilMail($penawaran, 'custom'));
                    } catch (\Exception $e) {
                        Log::error('Gagal mengirim email PembayaranBerhasilMail', [
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString(),
                        ]);
                    }
                }
            }

            return response()->json(['status' => 'success', 'message' => 'Notification processed.']);

        } catch (\Exception $e) {
            Log::error('Midtrans notification gagal diproses.', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'payload' => $request->all(),
            ]);

            // Transaction::status() (dipanggil di dalam constructor Notification)
            // balas 404 "Transaction doesn't exist" untuk order_id yang tidak
            // pernah benar-benar ada di Midtrans — ini persis yang terjadi kalau
            // Midtrans kirim "Test Notification" dari dashboard (order_id sintetis
            // payment_notif_test_...), bukan transaksi asli. Balas 200 supaya
            // Midtrans berhenti retry, tapi tetap ada jejak log sebagai warning.
            if ($e->getCode() === 404) {
                Log::warning('Midtrans notification: transaksi tidak ditemukan di Midtrans — kemungkinan test notification dari dashboard atau order_id tidak dikenal. Diabaikan tanpa diproses.', [
                    'order_id' => $request->input('order_id'),
                    'transaction_id' => $request->input('transaction_id'),
                ]);

                return response()->json([
                    'status' => 'ignored',
                    'message' => 'Transaction not found in Midtrans (likely a test notification or unknown order_id) — acknowledged without processing.',
                ]);
            }

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

            $settledStatus = match (true) {
                $transactionStatus === 'capture' && $fraudStatus === 'accept' => 'settled',
                $transactionStatus === 'settlement' => 'settled',
                $transactionStatus === 'pending' => 'pending',
                in_array($transactionStatus, ['deny', 'cancel', 'failure']) => 'failed',
                $transactionStatus === 'expire' => 'expired',
                $transactionStatus === 'refund' => 'refund',
                default => 'pending',
            };

            // Update pemesanan paket bawaan (lihat notification() untuk penjelasan
            // kenapa settle = 'dp_paid', bukan 'paid')
            $reportedStatus = $settledStatus === 'settled' ? 'dp_paid' : $settledStatus;
            $pemesanan = Pemesanan::with('paketLayanan')->where('midtrans_order_id', $orderId)->first();
            if ($pemesanan) {
                $sudahDpSebelumnya = in_array($pemesanan->payment_status, ['dp_paid', 'paid']);
                $pemesanan->update(['payment_status' => $reportedStatus]);
                if ($reportedStatus === 'dp_paid') {
                    $pemesanan->update(['status_pemesanan' => 'dikonfirmasi']);

                    if (! $sudahDpSebelumnya) {
                        Pembayaran::create([
                            'id_pemesanan' => $pemesanan->id_pemesanan,
                            'jenis' => 'dp',
                            'created_id' => null,
                            'tanggal_bayar' => now()->toDateString(),
                            'jumlah_bayar' => $pemesanan->dp_amount ?: DpCalculator::hitung((float) $pemesanan->paketLayanan->harga),
                            'status_konfirmasi' => 'dikonfirmasi',
                            'catatan_admin' => 'Pembayaran DP otomatis terverifikasi via Midtrans (sync manual).',
                        ]);
                    }
                }
            }

            // Update penawaran custom (lihat notification() untuk penjelasan
            // kenapa settle = 'dp_paid', bukan 'paid')
            $penawaran = PenawaranCustom::with('requestCustomPaket')->where('midtrans_order_id', $orderId)->first();
            if ($penawaran) {
                $sudahDpSebelumnya = in_array($penawaran->payment_status, ['dp_paid', 'paid']);
                $penawaranStatus = $settledStatus === 'settled' ? 'dp_paid' : $settledStatus;
                $penawaran->update(['payment_status' => $penawaranStatus]);
                if ($penawaranStatus === 'dp_paid') {
                    $penawaran->update(['status_penawaran' => 'diterima']);
                    if ($penawaran->requestCustomPaket) {
                        $penawaran->requestCustomPaket->update(['status_request' => 'diterima']);
                    }

                    if (! $sudahDpSebelumnya) {
                        Pembayaran::create([
                            'id_penawaran' => $penawaran->id_penawaran,
                            'jenis' => 'dp',
                            'created_id' => null,
                            'tanggal_bayar' => now()->toDateString(),
                            'jumlah_bayar' => $penawaran->dp_awal ?: DpCalculator::hitung((float) $penawaran->total_penawaran),
                            'status_konfirmasi' => 'dikonfirmasi',
                            'catatan_admin' => 'Pembayaran DP otomatis terverifikasi via Midtrans (sync manual).',
                        ]);
                    }
                }
            }

            return response()->json(['status' => 'success', 'payment_status' => $pemesanan?->payment_status ?? $penawaran?->payment_status ?? $reportedStatus]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal sinkronisasi status: '.$e->getMessage(),
            ], 500);
        }
    }
}
