<!DOCTYPE html>
<html>
<head>
    <title>Invoice ZY Production</title>
    <style>
        body { font-family: sans-serif; font-size: 14px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #e29a00; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { margin: 0; color: #e29a00; }
        .invoice-details { margin-bottom: 30px; }
        .invoice-details table { width: 100%; }
        .invoice-details td { padding: 5px 0; }
        .table-items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table-items th, .table-items td { border: 1px solid #ddd; padding: 10px; }
        .table-items th { background-color: #f9f9f9; text-align: left; }
        .text-right { text-align: right; }
        .status-paid { color: #fff; background-color: #28a745; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
        .status-dp { color: #fff; background-color: #e29a00; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #777; }
        .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .summary-table td { padding: 6px 10px; }
        .summary-label { text-align: right; font-weight: bold; color: #555; }
        .summary-value { text-align: right; width: 180px; }
        .summary-dp { font-size: 16px; font-weight: bold; color: #e29a00; }
        .summary-sisa { font-size: 13px; color: #999; }
        .note-box { background-color: #fffbea; border: 1px solid #f0e5c2; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; font-size: 12px; color: #856404; }
    </style>
</head>
<body>
    <div class="header">
        <h1>ZY PRODUCTION</h1>
        <p>Jl. Contoh Event Organizer No. 123, Kota Anda | Telp: 0812-3456-7890</p>
    </div>

    @php
        $isPaket = $jenis === 'paket';
        $namaPelanggan = $isPaket ? $data->user->nama : $data->requestCustomPaket->user->nama;
        $orderId = $isPaket ? $data->kode_pemesanan : 'REQ-'.$data->id_request;
        $tglAcara = $isPaket ? $data->tanggal_acara->format('d M Y') : $data->requestCustomPaket->tanggal_acara->format('d M Y');
        $lokasi = $isPaket ? $data->lokasi_acara : $data->requestCustomPaket->lokasi_acara;
        $tamu = $isPaket ? $data->jumlah_tamu : $data->requestCustomPaket->jumlah_tamu;
        $namaProduk = $isPaket ? "Paket: " . $data->paketLayanan->nama_paket : "Custom: " . $data->requestCustomPaket->kategoriEvent->nama_kategori;

        // Harga total & DP
        if ($isPaket) {
            $hargaTotal = (float) $data->paketLayanan->harga;
            $dpAmount = $data->dp_amount ? (float) $data->dp_amount : round($hargaTotal * 0.5, 2);
        } else {
            $hargaTotal = (float) $data->total_penawaran;
            $dpAmount = $data->dp_awal ? (float) $data->dp_awal : round($hargaTotal * 0.5, 2);
        }
        $sisaPelunasan = $hargaTotal - $dpAmount;
    @endphp

    <div class="invoice-details">
        <table>
            <tr>
                <td width="50%">
                    <strong>DITAGIHKAN KEPADA:</strong><br>
                    {{ $namaPelanggan }}<br>
                </td>
                <td width="50%" class="text-right">
                    <strong>INVOICE NO:</strong> #INV-{{ $orderId }}<br>
                    <strong>TANGGAL:</strong> {{ \Carbon\Carbon::now()->format('d M Y') }}<br>
                    <strong>STATUS:</strong> <span class="status-dp">DP LUNAS</span>
                </td>
            </tr>
        </table>
    </div>

    <table class="table-items">
        <thead>
            <tr>
                <th>Deskripsi Layanan</th>
                <th>Informasi Acara</th>
                <th class="text-right">Harga Total (Rp)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $namaProduk }}</td>
                <td>
                    Tanggal: {{ $tglAcara }}<br>
                    Lokasi: {{ $lokasi }}<br>
                    Tamu: {{ $tamu }} Pax
                </td>
                <td class="text-right">{{ number_format($hargaTotal, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <table class="summary-table">
        <tr>
            <td class="summary-label">Harga Total Paket:</td>
            <td class="summary-value">Rp {{ number_format($hargaTotal, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="summary-label" style="font-size: 15px;">DP yang Dibayar (50%):</td>
            <td class="summary-value summary-dp">Rp {{ number_format($dpAmount, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="summary-label summary-sisa">Sisa Pelunasan:</td>
            <td class="summary-value summary-sisa">Rp {{ number_format($sisaPelunasan, 0, ',', '.') }}</td>
        </tr>
    </table>

    <div class="note-box">
        <strong>📌 Catatan:</strong> Invoice ini merupakan bukti pembayaran Down Payment (DP). Sisa pelunasan sebesar <strong>Rp {{ number_format($sisaPelunasan, 0, ',', '.') }}</strong> dibayarkan langsung pada hari pelaksanaan acara.
    </div>

    <div class="footer">
        <p>Terima kasih atas kepercayaan Anda menggunakan layanan ZY Production.</p>
        <p>Invoice ini dibuat secara otomatis oleh sistem dan sah sebagai bukti pembayaran DP.</p>
    </div>
</body>
</html>

