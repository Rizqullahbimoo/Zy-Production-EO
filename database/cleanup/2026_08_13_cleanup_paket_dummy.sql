-- Cleanup data paket_layanan dummy, persiapan data baru.
-- Dijalankan manual pada 2026-08-13 terhadap database zy-production-ta.
-- Backup sebelum eksekusi: database/backups/backup_pre_paket_cleanup_20260813_032737.sql
--
-- Aturan:
--   - Wedding Event & Outbound: hapus SEMUA paket di kategori ini.
--   - Launching Product, Study Field, Birthday Party, Gathering: sisakan
--     hanya 1 paket (id_paket terkecil / dibuat pertama), hapus sisanya.
--   - pemesanan yang mereferensikan paket-paket tersebut dihapus lebih dulu
--     (data dummy/testing) agar tidak melanggar FK constraint (onDelete restrict).
--   - pembayaran, ulasan, dokumen_mou (anak dari pemesanan) dan detail_paket
--     (anak dari paket_layanan) ikut terhapus otomatis lewat FK onDelete cascade.
--
-- Hasil:
--   - 16 paket_layanan dihapus, 24 pemesanan terkait ikut dihapus.
--   - Cascade otomatis: 3 dokumen_mou, 1 detail_paket. 0 pembayaran, 0 ulasan terdampak.
--   - Sisa: Wedding Event = 0, Outbound = 0, Launching Product = 1 (id 8),
--     Study Field = 1 (id 11), Birthday Party = 1 (id 14), Gathering = 1 (id 17).
--   - Kategori lain (Wedding Organizer Premium, Turis Tour) tidak disentuh.

START TRANSACTION;

DELETE FROM pemesanan
WHERE id_paket IN (2,3,4,5,6,7,9,10,12,13,15,16,18,19,21,22);

DELETE FROM paket_layanan
WHERE id_paket IN (2,3,4,5,6,7,9,10,12,13,15,16,18,19,21,22);

COMMIT;
