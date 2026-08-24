<!DOCTYPE html>
<html>
<head>
    <title>Dokumen MOU Siap Ditandatangani</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    @php
        $isPaket = $mou->id_pemesanan !== null;
        $nama = $isPaket ? ($mou->pemesanan->user->nama ?? 'Customer') : ($mou->requestCustomPaket->user->nama ?? 'Customer');
        $namaPaket = $isPaket
            ? ($mou->pemesanan->paketLayanan->nama_paket ?? 'Paket Layanan')
            : ('Custom Event (' . ($mou->requestCustomPaket->kategoriEvent->nama_kategori ?? 'Custom') . ')');
        $kode = $isPaket ? $mou->pemesanan->kode_pemesanan : $mou->requestCustomPaket->kode_request;
        $link = rtrim(config('app.url'), '/') . '/status';
    @endphp

    <h2>Halo, {{ $nama }}!</h2>
    <p>Dokumen MOU (Memorandum of Understanding) untuk pesanan <strong>{{ $namaPaket }}</strong> ({{ $kode }}) sudah tersedia dan siap untuk ditandatangani.</p>
    <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p>Silakan unduh draf dokumen MOU melalui halaman <strong>Status Pemesanan</strong>, cetak, tandatangani secara manual, lalu unggah kembali hasil scan/foto dokumen yang sudah ditandatangani.</p>
    </div>
    <p><a href="{{ $link }}" style="color: #e29a00; font-weight: bold;">Buka Halaman Status Pemesanan</a></p>
    <br>
    <p>Terima kasih,<br><strong>Tim ZY Production</strong></p>
</body>
</html>
