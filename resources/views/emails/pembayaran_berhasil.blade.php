<!DOCTYPE html>
<html>
<head>
    <title>Pembayaran Berhasil</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    @php
        $nama = $jenis === 'paket' ? $pemesanan->user->nama : $pemesanan->requestCustomPaket->user->nama;
        $total = $jenis === 'paket' ? $pemesanan->paketLayanan->harga : $pemesanan->total_harga;
        $orderId = $jenis === 'paket' ? $pemesanan->kode_pemesanan : $pemesanan->kode_penawaran;
    @endphp

    <h2>Halo, {{ $nama }}!</h2>
    <p>Terima kasih, pembayaran Anda telah berhasil kami terima.</p>
    <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>ID Pesanan:</strong> {{ $orderId }}</p>
        <p><strong>Total Dibayar:</strong> Rp {{ number_format($total, 0, ',', '.') }}</p>
        <p><strong>Status:</strong> <span style="color: green; font-weight: bold;">LUNAS</span></p>
    </div>
    <p>Anda dapat mengunduh Invoice / Tanda Terima PDF melalui menu <strong>Status Pemesanan</strong> di akun Anda.</p>
    <br>
    <p>Terima kasih,<br><strong>Tim ZY Production</strong></p>
</body>
</html>
