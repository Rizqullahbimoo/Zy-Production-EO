<!DOCTYPE html>
<html>
<head>
    <title>Dokumen MOU Selesai</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    @php
        $isPaket = $mou->id_pemesanan !== null;
        $nama = $isPaket ? ($mou->pemesanan->user->nama ?? 'Customer') : ($mou->requestCustomPaket->user->nama ?? 'Customer');
        $kode = $isPaket ? $mou->pemesanan->kode_pemesanan : $mou->requestCustomPaket->kode_request;
        $link = rtrim(config('app.url'), '/') . '/status';
    @endphp

    <h2>Halo, {{ $nama }}!</h2>
    <p>Proses tanda tangan dokumen MOU untuk transaksi <strong>{{ $kode }}</strong> telah <strong>selesai</strong>.</p>
    <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Status:</strong> <span style="color: green; font-weight: bold;">MOU SELESAI</span></p>
        <p>Anda sekarang dapat melanjutkan pembayaran DP (Down Payment) melalui halaman Status Pemesanan.</p>
    </div>
    <p><a href="{{ $link }}" style="color: #e29a00; font-weight: bold;">Lanjutkan Pembayaran DP</a></p>
    <br>
    <p>Terima kasih,<br><strong>Tim ZY Production</strong></p>
</body>
</html>
