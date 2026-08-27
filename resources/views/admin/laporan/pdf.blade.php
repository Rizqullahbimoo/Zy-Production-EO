<!DOCTYPE html>
<html>
<head>
    <title>Laporan Keuangan ZY Production</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        h2 { text-align: center; margin-bottom: 5px; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .badge-dp { color: #966400; font-weight: bold; }
        .badge-pelunasan { color: #1a7a3c; font-weight: bold; }
    </style>
</head>
<body>
    <h2>Laporan Pemasukan ZY Production</h2>
    <p class="text-center">Periode: Bulan {{ $bulan }} Tahun {{ $tahun }} — dicatat per tanggal uang diterima (DP &amp; Pelunasan sebagai entri terpisah)</p>

    <h3>1. Pemesanan Paket Bawaan</h3>
    <table>
        <thead>
            <tr>
                <th>Tanggal Diterima</th>
                <th>Kode</th>
                <th>Pelanggan</th>
                <th>Paket</th>
                <th>Jenis</th>
                <th>Jumlah Diterima (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @php $totalPemesanan = 0; @endphp
            @forelse($pemesananRows as $p)
                @php $totalPemesanan += $p->jumlah_bayar; @endphp
                <tr>
                    <td>{{ $p->tanggal_bayar->format('d/m/Y') }}</td>
                    <td>{{ $p->pemesanan->kode_pemesanan ?? '-' }}</td>
                    <td>{{ $p->pemesanan->user->nama ?? '-' }}</td>
                    <td>{{ $p->pemesanan->paketLayanan->nama_paket ?? '-' }}</td>
                    <td class="{{ $p->jenis === 'dp' ? 'badge-dp' : 'badge-pelunasan' }}">{{ $p->jenis === 'dp' ? 'DP' : 'Pelunasan' }}</td>
                    <td class="text-right">{{ number_format($p->jumlah_bayar, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr><td colspan="6" class="text-center">Tidak ada pemasukan</td></tr>
            @endforelse
            <tr>
                <th colspan="5" class="text-right">Subtotal</th>
                <th class="text-right">{{ number_format($totalPemesanan, 0, ',', '.') }}</th>
            </tr>
        </tbody>
    </table>

    <h3>2. Pemesanan Custom Paket</h3>
    <table>
        <thead>
            <tr>
                <th>Tanggal Diterima</th>
                <th>ID Request</th>
                <th>Pelanggan</th>
                <th>Event</th>
                <th>Jenis</th>
                <th>Jumlah Diterima (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @php $totalCustom = 0; @endphp
            @forelse($customRows as $p)
                @php
                    $req = $p->penawaranCustom->requestCustomPaket ?? null;
                    $totalCustom += $p->jumlah_bayar;
                @endphp
                <tr>
                    <td>{{ $p->tanggal_bayar->format('d/m/Y') }}</td>
                    <td>{{ $req->kode_request ?? '-' }}</td>
                    <td>{{ $req->user->nama ?? '-' }}</td>
                    <td>{{ $req->kategoriEvent->nama_kategori ?? 'Event Custom' }}</td>
                    <td class="{{ $p->jenis === 'dp' ? 'badge-dp' : 'badge-pelunasan' }}">{{ $p->jenis === 'dp' ? 'DP' : 'Pelunasan' }}</td>
                    <td class="text-right">{{ number_format($p->jumlah_bayar, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr><td colspan="6" class="text-center">Tidak ada pemasukan</td></tr>
            @endforelse
            <tr>
                <th colspan="5" class="text-right">Subtotal</th>
                <th class="text-right">{{ number_format($totalCustom, 0, ',', '.') }}</th>
            </tr>
        </tbody>
    </table>

    @php
        $totalPendapatan = $totalPemesanan + $totalCustom;
        $totalCount = $pemesananRows->count() + $customRows->count();
        $avgPendapatan = $totalCount > 0 ? $totalPendapatan / $totalCount : 0;
    @endphp

    @if($totalCount == 0)
        <div style="background-color: #f8d7da; color: #721c24; padding: 15px; margin-top: 20px; border: 1px solid #f5c6cb; border-radius: 4px; text-align: center;">
            <strong>Pemberitahuan:</strong> Tidak ada pembayaran yang diterima pada periode Bulan {{ $bulan }} Tahun {{ $tahun }}.
        </div>
    @else
        <div style="margin-top: 30px; border: 1px solid #ccc; padding: 15px; background-color: #f9f9f9; width: 50%; float: right;">
            <h3 style="margin-top: 0; text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Ringkasan Keuangan</h3>
            <table style="width: 100%; border: none; margin-top: 10px;">
                <tr>
                    <td style="border: none; padding: 5px 0;"><strong>Total Entri Pemasukan</strong></td>
                    <td style="border: none; padding: 5px 0;" class="text-right">{{ $totalCount }} Entri (DP + Pelunasan)</td>
                </tr>
                <tr>
                    <td style="border: none; padding: 5px 0;"><strong>Rata-rata per Entri</strong></td>
                    <td style="border: none; padding: 5px 0;" class="text-right">Rp {{ number_format($avgPendapatan, 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td style="border: none; padding: 10px 0 5px 0; border-top: 2px solid #ccc;"><strong>Total Pemasukan Bersih</strong></td>
                    <td style="border: none; padding: 10px 0 5px 0; border-top: 2px solid #ccc;" class="text-right"><strong>Rp {{ number_format($totalPendapatan, 0, ',', '.') }}</strong></td>
                </tr>
            </table>
        </div>
        <div style="clear: both;"></div>
    @endif
</body>
</html>
