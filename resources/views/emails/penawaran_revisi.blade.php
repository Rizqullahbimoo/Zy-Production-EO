<!DOCTYPE html>
<html>
<head>
    <title>Permintaan Revisi Penawaran</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Halo, Admin ZY Production!</h2>
    <p>Customer <strong>{{ $penawaran->requestCustomPaket->user->nama ?? 'Customer' }}</strong> mengajukan revisi atas penawaran harga untuk request custom <strong>{{ $penawaran->requestCustomPaket->kode_request }}</strong>.</p>
    <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Total Penawaran Saat Ini:</strong> Rp {{ number_format($penawaran->total_penawaran, 0, ',', '.') }}</p>
        <p><strong>Catatan Revisi Customer:</strong></p>
        <p style="white-space: pre-line;">{{ $penawaran->catatan_revisi_customer }}</p>
    </div>
    <p>Silakan tinjau catatan revisi tersebut dan perbarui penawaran melalui Dashboard Admin.</p>
    <br>
    <p>Terima kasih,<br><strong>Sistem ZY Production</strong></p>
</body>
</html>
