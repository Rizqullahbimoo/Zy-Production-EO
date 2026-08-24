<!DOCTYPE html>
<html>
<head>
    <title>Penawaran Baru</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Halo, {{ $penawaran->requestCustomPaket->user->nama }}!</h2>
    <p>Admin ZY Production telah memberikan penawaran harga untuk Request Custom Paket Anda.</p>
    <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>ID Request:</strong> {{ $penawaran->requestCustomPaket->kode_request }}</p>
        <p><strong>Total Harga:</strong> Rp {{ number_format($penawaran->total_penawaran, 0, ',', '.') }}</p>
        <p><strong>DP Minimal (30%):</strong> Rp {{ number_format($penawaran->dp_awal, 0, ',', '.') }}</p>
        <p><strong>Catatan Admin:</strong> {{ $penawaran->catatan_admin ?: '-' }}</p>
    </div>
    <p>Silakan login ke akun Anda di website ZY Production untuk melihat detail penawaran dan melakukan pembayaran.</p>
    <br>
    <p>Terima kasih,<br><strong>Tim ZY Production</strong></p>
</body>
</html>
