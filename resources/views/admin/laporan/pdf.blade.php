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
    </style>
</head>
<body>
    <h2>Laporan Transaksi Lunas ZY Production</h2>
    <p class="text-center">Periode: Bulan {{ $bulan }} Tahun {{ $tahun }}</p>

    <h3>1. Pemesanan Paket Bawaan</h3>
    <table>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>Kode</th>
                <th>Pelanggan</th>
                <th>Paket</th>
                <th>Total (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @php $totalPemesanan = 0; @endphp
            @forelse($pemesanan as $p)
                @php $totalPemesanan += $p->paketLayanan->harga; @endphp
                <tr>
                    <td>{{ $p->tanggal_pemesanan->format('d/m/Y') }}</td>
                    <td>{{ $p->kode_pemesanan }}</td>
                    <td>{{ $p->user->nama }}</td>
                    <td>{{ $p->paketLayanan->nama_paket }}</td>
                    <td class="text-right">{{ number_format($p->paketLayanan->harga, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr><td colspan="5" class="text-center">Tidak ada transaksi</td></tr>
            @endforelse
            <tr>
                <th colspan="4" class="text-right">Subtotal</th>
                <th class="text-right">{{ number_format($totalPemesanan, 0, ',', '.') }}</th>
            </tr>
        </tbody>
    </table>

    <h3>2. Pemesanan Custom Paket</h3>
    <table>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>ID Request</th>
                <th>Pelanggan</th>
                <th>Catatan Admin</th>
                <th>Total (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @php $totalCustom = 0; @endphp
            @forelse($custom as $c)
                @php $totalCustom += $c->total_penawaran; @endphp
                <tr>
                    <td>{{ $c->created_at->format('d/m/Y') }}</td>
                    <td>{{ $c->requestCustomPaket->kode_request }}</td>
                    <td>{{ $c->requestCustomPaket->user->nama }}</td>
                    <td>{{ Str::limit($c->catatan_admin, 30) }}</td>
                    <td class="text-right">{{ number_format($c->total_penawaran, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr><td colspan="5" class="text-center">Tidak ada transaksi</td></tr>
            @endforelse
            <tr>
                <th colspan="4" class="text-right">Subtotal</th>
                <th class="text-right">{{ number_format($totalCustom, 0, ',', '.') }}</th>
            </tr>
        </tbody>
    </table>

    @php
        $totalPendapatan = $totalPemesanan + $totalCustom;
        $totalCount = $pemesanan->count() + $custom->count();
        $avgPendapatan = $totalCount > 0 ? $totalPendapatan / $totalCount : 0;
    @endphp

    @if($totalCount == 0)
        <div style="background-color: #f8d7da; color: #721c24; padding: 15px; margin-top: 20px; border: 1px solid #f5c6cb; border-radius: 4px; text-align: center;">
            <strong>Pemberitahuan:</strong> Tidak ada data transaksi pemesanan lunas yang ditemukan pada periode Bulan {{ $bulan }} Tahun {{ $tahun }}.
        </div>
    @else
        <div style="margin-top: 30px; border: 1px solid #ccc; padding: 15px; background-color: #f9f9f9; width: 50%; float: right;">
            <h3 style="margin-top: 0; text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Ringkasan Keuangan</h3>
            <table style="width: 100%; border: none; margin-top: 10px;">
                <tr>
                    <td style="border: none; padding: 5px 0;"><strong>Total Transaksi</strong></td>
                    <td style="border: none; padding: 5px 0;" class="text-right">{{ $totalCount }} Pesanan</td>
                </tr>
                <tr>
                    <td style="border: none; padding: 5px 0;"><strong>Rata-rata Pendapatan</strong></td>
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
