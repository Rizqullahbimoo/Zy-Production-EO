<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Pemesanan;
use App\Models\PenawaranCustom;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;

class InvoiceController extends Controller
{
    public function invoicePemesanan($id)
    {
        $pemesanan = Pemesanan::with(['user', 'paketLayanan'])->findOrFail($id);

        if ($pemesanan->id_user !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $pdf = Pdf::loadView('customer.invoice.pdf', [
            'data' => $pemesanan,
            'jenis' => 'paket'
        ]);

        return $pdf->download("Invoice_{$pemesanan->kode_pemesanan}.pdf");
    }

    public function invoiceCustom($id)
    {
        $penawaran = PenawaranCustom::with(['requestCustomPaket.user', 'requestCustomPaket.kategoriEvent'])->findOrFail($id);

        if ($penawaran->requestCustomPaket->id_user !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $pdf = Pdf::loadView('customer.invoice.pdf', [
            'data' => $penawaran,
            'jenis' => 'custom'
        ]);

        return $pdf->download("Invoice_Custom_REQ_{$penawaran->id_request}.pdf");
    }
}
