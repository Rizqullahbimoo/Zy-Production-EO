<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Guest\PaketController;
use App\Http\Controllers\Admin\GaleriController;
use App\Http\Controllers\Admin\FasilitasController;
use App\Http\Controllers\Admin\KategoriController;
use App\Http\Controllers\Admin\PaketLayananController;
use App\Http\Controllers\PesanKontakController;
use App\Http\Controllers\MoUController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — ZY-Production
|--------------------------------------------------------------------------
*/

// ─── PUBLIC / GUEST ────────────────────────────────────────────────────────────
// Browsing paket layanan tanpa login
Route::get('/paket', [PaketController::class, 'index']);
Route::get('/paket/{id}', [PaketController::class, 'show']);
Route::get('/kategori', [PaketController::class, 'kategori']);
Route::get('/fasilitas', [PaketController::class, 'fasilitas']);
Route::get('/ulasan', [\App\Http\Controllers\UlasanController::class, 'getTopReviews']);
Route::get('/galeri', [GaleriController::class, 'index']);   // Publik: untuk halaman Portofolio customer
Route::post('/pesan', [PesanKontakController::class, 'store']);

// ─── AUTH ──────────────────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Route yang butuh login (semua role)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

// ─── ADMIN ─────────────────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role.admin'])->prefix('admin')->group(function () {
    // Dashboard Admin
    Route::get('/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index']);

    // Kelola Profil Admin
    Route::match(['put', 'post'], '/profile', [\App\Http\Controllers\Admin\ProfileController::class, 'update']);

    // Kelola Pemesanan
    Route::get('/pemesanan', [\App\Http\Controllers\Admin\PemesananController::class, 'index']);
    Route::get('/pemesanan/{id}', [\App\Http\Controllers\Admin\PemesananController::class, 'show']);
    Route::patch('/pemesanan/{id}/status', [\App\Http\Controllers\Admin\PemesananController::class, 'updateStatus']);

    // Kelola Galeri
    Route::apiResource('galeri', GaleriController::class);

    // Kelola Fasilitas
    Route::apiResource('fasilitas', FasilitasController::class);

    // Kelola Kategori
    Route::apiResource('kategori', KategoriController::class);

    // Kelola Paket Layanan (nested di dalam Kategori)
    Route::apiResource('kategori.paket', PaketLayananController::class);
    Route::post('/kategori/{kategori}/paket/{paket}/fasilitas', [PaketLayananController::class, 'syncFasilitas']);

    // Kelola Request Custom (Admin)
    Route::get('/request-custom', [\App\Http\Controllers\Admin\RequestCustomController::class, 'index']);
    Route::get('/request-custom/{id}', [\App\Http\Controllers\Admin\RequestCustomController::class, 'show']);
    Route::patch('/request-custom/{id}/status', [\App\Http\Controllers\Admin\RequestCustomController::class, 'updateStatus']);

    // Kelola Penawaran (Admin)
    Route::post('/request-custom/{id}/penawaran', [\App\Http\Controllers\Admin\PenawaranController::class, 'store']);
    Route::delete('/penawaran/{id}', [\App\Http\Controllers\Admin\PenawaranController::class, 'destroy']);

    // Laporan (Admin)
    Route::get('/laporan', [\App\Http\Controllers\Admin\LaporanController::class, 'generateLaporan']);

    // Pesan Kontak (Admin)
    Route::get('/pesan', [PesanKontakController::class, 'indexAdmin']);
    Route::patch('/pesan/{id}/reply', [PesanKontakController::class, 'replyAdmin']);

    // Kelola Dokumen MOU (Admin)
    Route::get('/mou', [MoUController::class, 'index']);
    Route::get('/mou/{id_mou}', [MoUController::class, 'show']);
    Route::post('/mou/draft/{tipe}/{id}', [MoUController::class, 'uploadDraft']);
    Route::post('/mou/{id_mou}/final', [MoUController::class, 'uploadFinal']);
});

// ─── CUSTOMER ──────────────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role.customer'])->prefix('customer')->group(function () {
    // Request Custom (Customer)
    Route::get('/request-custom', [\App\Http\Controllers\Customer\RequestCustomController::class, 'index']);
    Route::post('/request-custom', [\App\Http\Controllers\Customer\RequestCustomController::class, 'store']);
    Route::get('/request-custom/{id}', [\App\Http\Controllers\Customer\RequestCustomController::class, 'show']);

    // Pemesanan Paket Bawaan (Customer)
    Route::get('/pemesanan', [\App\Http\Controllers\Customer\PemesananCustomerController::class, 'index']);
    Route::post('/pemesanan', [\App\Http\Controllers\Customer\PemesananCustomerController::class, 'store']);
    Route::get('/pemesanan/{id}', [\App\Http\Controllers\Customer\PemesananCustomerController::class, 'show']);

    // Midtrans Payment Token
    Route::post('/payment/token-paket/{id}', [\App\Http\Controllers\Customer\MidtransController::class, 'createTokenPaket']);
    Route::post('/payment/token-custom/{id}', [\App\Http\Controllers\Customer\MidtransController::class, 'createTokenCustom']);
    Route::post('/payment/sync/{orderId}', [\App\Http\Controllers\Customer\MidtransController::class, 'syncStatus']);

    // Invoice (Customer)
    Route::get('/pemesanan/{id}/invoice', [\App\Http\Controllers\Customer\InvoiceController::class, 'invoicePemesanan']);
    Route::get('/request-custom/{id}/invoice', [\App\Http\Controllers\Customer\InvoiceController::class, 'invoiceCustom']);

    // Submit Ulasan (Customer)
    Route::post('/ulasan', [\App\Http\Controllers\UlasanController::class, 'store']);

    // Pesan Kontak (Customer)
    Route::get('/pesan', [PesanKontakController::class, 'indexCustomer']);

    // Dokumen MOU (Customer)
    Route::get('/mou/{id_mou}', [MoUController::class, 'showForCustomer']);
    Route::post('/mou/{id_mou}/ttd', [MoUController::class, 'uploadTtd']);
});

// ─── MIDTRANS WEBHOOK (public, tanpa auth) ─────────────────────────────────────
Route::post('/payment/notification', [\App\Http\Controllers\Customer\MidtransController::class, 'notification']);

