<!DOCTYPE html>
<html>
<head>
    <title>Penawaran Disetujui Customer</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Halo, Admin ZY Production!</h2>
    <p>Customer <strong>{{ $penawaran->requestCustomPaket->user->nama ?? 'Customer' }}</strong> telah menyetujui penawaran harga untuk request custom <strong>{{ $penawaran->requestCustomPaket->kode_request }}</strong>.</p>
    <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Total Harga:</strong> Rp {{ number_format($penawaran->total_penawaran, 0, ',', '.') }}</p>
        <p><strong>DP Minimal (30%):</strong> Rp {{ number_format($penawaran->dp_awal, 0, ',', '.') }}</p>
    </div>
    <p>Silakan lanjutkan proses penyiapan dokumen MOU melalui Dashboard Admin.</p>
    <br>
    <p>Terima kasih,<br><strong>Sistem ZY Production</strong></p>
</body>
</html>
