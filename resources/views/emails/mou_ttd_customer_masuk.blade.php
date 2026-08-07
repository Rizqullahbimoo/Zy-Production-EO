<!DOCTYPE html>
<html>
<head>
    <title>Dokumen MOU Baru dari Customer</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    @php
        $isPaket = $mou->id_pemesanan !== null;
        $nama = $isPaket ? ($mou->pemesanan->user->nama ?? 'Customer') : ($mou->requestCustomPaket->user->nama ?? 'Customer');
        $kode = $isPaket ? $mou->pemesanan->kode_pemesanan : ('REQ-' . str_pad($mou->id_request, 3, '0', STR_PAD_LEFT));
    @endphp

    <h2>Halo, Admin ZY Production!</h2>
    <p>Customer <strong>{{ $nama }}</strong> telah mengunggah dokumen MOU yang sudah ditandatangani untuk transaksi <strong>{{ $kode }}</strong>.</p>
    <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p>Mohon periksa dokumen tersebut, tandatangani secara manual, lalu unggah dokumen final melalui halaman Kelola MOU di Dashboard Admin.</p>
    </div>
    <br>
    <p>Terima kasih,<br><strong>Sistem ZY Production</strong></p>
</body>
</html>
