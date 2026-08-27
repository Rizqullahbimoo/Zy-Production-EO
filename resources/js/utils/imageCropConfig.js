/**
 * imageCropConfig.js — Satu sumber kebenaran untuk rasio crop & validasi file
 * gambar yang dipakai ImageCropper.jsx. Jangan hardcode angka rasio atau
 * aturan validasi ulang di tempat lain — import dari sini.
 */

// Rasio landscape 3:2 — dipakai untuk foto yang tampil sebagai kartu/thumbnail
// (Foto Paket, Galeri Tambahan Paket, Galeri Portfolio).
export const CROP_ASPECT_LANDSCAPE = 3 / 2;

// Rasio persegi 1:1 — dipakai untuk foto yang tampil bulat/avatar (Foto Profil Admin).
export const CROP_ASPECT_SQUARE = 1;

export const IMAGE_UPLOAD_RULES = {
  maxSizeMB: 5,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  allowedExtLabel: 'JPG/PNG/WebP',
};

/**
 * Validasi ukuran & tipe file SEBELUM masuk ke cropper, supaya admin tidak
 * buang waktu crop file yang nanti bakal ditolak validasi backend.
 * Return string pesan error, atau null kalau valid.
 */
export function validateImageFile(file) {
  if (!file) return null;

  if (!IMAGE_UPLOAD_RULES.allowedTypes.includes(file.type)) {
    return `Format file tidak didukung. Gunakan ${IMAGE_UPLOAD_RULES.allowedExtLabel}.`;
  }

  const maxBytes = IMAGE_UPLOAD_RULES.maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `Ukuran file maksimal ${IMAGE_UPLOAD_RULES.maxSizeMB}MB.`;
  }

  return null;
}
