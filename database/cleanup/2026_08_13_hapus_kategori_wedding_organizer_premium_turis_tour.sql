-- Hapus kategori "Wedding Organizer Premium" (id 1) & "Turis Tour" (id 8) beserta seluruh data turunannya.
-- Dijalankan manual pada 2026-08-13 terhadap database zy-production-ta.
-- Backup sebelum eksekusi: database/backups/backup_pre_kategori_cleanup_20260813_033939.sql
--
-- Relasi yang diperiksa sebelum eksekusi (lihat migrations untuk detail FK):
--   - paket_layanan.id_kategori      -> kategori_event  (onDelete: restrict)
--   - request_custom_paket.id_kategori -> kategori_event (onDelete: restrict)
--   - fasilitas_layanan.id_kategori  -> kategori_event  (onDelete: cascade)
--   - pemesanan.id_paket             -> paket_layanan   (onDelete: restrict)
--   - detail_paket.id_paket          -> paket_layanan   (onDelete: cascade)
--   - detail_paket.id_fasilitas / detail_request_custom.id_fasilitas -> fasilitas_layanan (onDelete: restrict)
--     -> dipastikan tidak ada paket/request DI LUAR kategori target yang memakai
--        fasilitas "Dekorasi Bunga" (id_fasilitas=1), sehingga cascade fasilitas aman.
--
-- Urutan hapus (anak -> induk) supaya tidak melanggar FK restrict:
--   1) pemesanan (paket di kategori target)      -> cascade: pembayaran, ulasan, dokumen_mou
--   2) request_custom_paket (kategori target)    -> cascade: detail_request_custom, penawaran_custom, ulasan, dokumen_mou
--   3) paket_layanan (kategori target)           -> cascade: detail_paket
--   4) kategori_event (target)                   -> cascade: fasilitas_layanan yang di-scope ke kategori ini
--
-- Hasil:
--   - Wedding Organizer Premium: 2 paket dihapus, 4 pemesanan, 3 request_custom_paket,
--     1 fasilitas_layanan ikut terhapus. Cascade turunan: 4 dokumen_mou, 3 detail_request_custom,
--     2 penawaran_custom, 0 pembayaran, 0 ulasan, 0 detail_paket.
--   - Turis Tour: 0 data terkait, kategori langsung terhapus.
--   - Tersisa persis 6 kategori resmi: Wedding Event, Outbound, Launching Product,
--     Study Field, Birthday Party, Gathering. 0 baris yatim terverifikasi di seluruh
--     tabel terkait (paket_layanan, pemesanan, request_custom_paket, fasilitas_layanan,
--     detail_paket, detail_request_custom, penawaran_custom, dokumen_mou).

START TRANSACTION;

DELETE FROM pemesanan WHERE id_paket IN (1, 20);

DELETE FROM request_custom_paket WHERE id_kategori IN (1, 8);

DELETE FROM paket_layanan WHERE id_kategori IN (1, 8);

DELETE FROM kategori_event WHERE id_kategori IN (1, 8);

COMMIT;
