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
                @php $totalCustom += $c->total_harga; @endphp
                <tr>
                    <td>{{ $c->created_at->format('d/m/Y') }}</td>
                    <td>REQ-{{ $c->id_request }}</td>
                    <td>{{ $c->requestCustomPaket->user->nama }}</td>
                    <td>{{ Str::limit($c->catatan_admin, 30) }}</td>
                    <td class="text-right">{{ number_format($c->total_harga, 0, ',', '.') }}</td>
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

    <h3 class="text-right" style="margin-top: 20px;">Total Keseluruhan: Rp {{ number_format($totalPemesanan + $totalCustom, 0, ',', '.') }}</h3>
</body>
</html>
