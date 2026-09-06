<?php

use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FasilitasController;
use App\Http\Controllers\Admin\GaleriController;
use App\Http\Controllers\Admin\KategoriController;
use App\Http\Controllers\Admin\LaporanController;
use App\Http\Controllers\Admin\PaketLayananController;
use App\Http\Controllers\Admin\PemesananController;
use App\Http\Controllers\Admin\PenawaranController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\RequestCustomController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Customer\InvoiceController;
use App\Http\Controllers\Customer\MidtransController;
use App\Http\Controllers\Customer\PemesananCustomerController;
use App\Http\Controllers\Customer\PenawaranController as CustomerPenawaranController;
use App\Http\Controllers\Customer\RequestCustomController as CustomerRequestCustomController;
use App\Http\Controllers\Guest\PaketController;
use App\Http\Controllers\MoUController;
use App\Http\Controllers\PesanKontakController;
use App\Http\Controllers\UlasanController;
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
Route::get('/ulasan', [UlasanController::class, 'getTopReviews']);
Route::get('/galeri', [GaleriController::class, 'index']);   // Publik: untuk halaman Portofolio customer
Route::post('/pesan', [PesanKontakController::class, 'store']);

// ─── AUTH ──────────────────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Route yang butuh login (semua role)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

// ─── ADMIN ─────────────────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role.admin'])->prefix('admin')->group(function () {
    // Dashboard Admin
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Kelola Profil Admin
    Route::match(['put', 'post'], '/profile', [ProfileController::class, 'update']);

    // Kelola Pemesanan
    Route::get('/pemesanan', [PemesananController::class, 'index']);
    Route::get('/pemesanan/{id}', [PemesananController::class, 'show']);
    Route::patch('/pemesanan/{id}/status', [PemesananController::class, 'updateStatus']);
    Route::post('/pemesanan/{id}/pembayaran', [PemesananController::class, 'recordPayment']);

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
    Route::get('/request-custom', [RequestCustomController::class, 'index']);
    Route::get('/request-custom/{id}', [RequestCustomController::class, 'show']);
    Route::patch('/request-custom/{id}/status', [RequestCustomController::class, 'updateStatus']);

    // Kelola Penawaran (Admin)
    Route::post('/request-custom/{id}/penawaran', [PenawaranController::class, 'store']);
    Route::patch('/penawaran/{id}', [PenawaranController::class, 'update']);
    Route::delete('/penawaran/{id}', [PenawaranController::class, 'destroy']);
    Route::post('/penawaran/{id}/pembayaran', [PenawaranController::class, 'recordPayment']);

    // Laporan (Admin)
    Route::get('/laporan/ringkasan', [LaporanController::class, 'ringkasan']);
    Route::get('/laporan', [LaporanController::class, 'generateLaporan']);

    // Pesan Kontak (Admin)
    Route::get('/pesan', [PesanKontakController::class, 'indexAdmin']);
    Route::patch('/pesan/{id}/reply', [PesanKontakController::class, 'replyAdmin']);

    // Kelola Dokumen MOU (Admin)
    Route::get('/mou', [MoUController::class, 'index']);
    Route::get('/mou/{id_mou}', [MoUController::class, 'show']);
    Route::post('/mou/draft/{tipe}/{id}', [MoUController::class, 'uploadDraft']);
    Route::post('/mou/{id_mou}/final', [MoUController::class, 'uploadFinal']);

    // Kelola Admin — multi-admin (semua admin setara, tidak ada tier super-admin)
    Route::get('/kelola-admin', [AdminUserController::class, 'index']);
    Route::post('/kelola-admin', [AdminUserController::class, 'store']);
    Route::patch('/kelola-admin/{id}/nonaktifkan', [AdminUserController::class, 'nonaktifkan']);
});

// ─── CUSTOMER ──────────────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role.customer'])->prefix('customer')->group(function () {
    // Request Custom (Customer)
    Route::get('/request-custom', [CustomerRequestCustomController::class, 'index']);
    Route::post('/request-custom', [CustomerRequestCustomController::class, 'store']);
    Route::get('/request-custom/{id}', [CustomerRequestCustomController::class, 'show']);

    // Penawaran Custom Paket — respon customer (Customer)
    Route::post('/penawaran/{id}/approve', [CustomerPenawaranController::class, 'approve']);
    Route::post('/penawaran/{id}/revisi', [CustomerPenawaranController::class, 'revisi']);

    // Pemesanan Paket Bawaan (Customer)
    Route::get('/pemesanan', [PemesananCustomerController::class, 'index']);
    Route::post('/pemesanan', [PemesananCustomerController::class, 'store']);
    Route::get('/pemesanan/{id}', [PemesananCustomerController::class, 'show']);

    // Midtrans Payment Token
    Route::post('/payment/token-paket/{id}', [MidtransController::class, 'createTokenPaket']);
    Route::post('/payment/token-custom/{id}', [MidtransController::class, 'createTokenCustom']);
    Route::post('/payment/sync/{orderId}', [MidtransController::class, 'syncStatus']);

    // Invoice (Customer)
    Route::get('/pemesanan/{id}/invoice', [InvoiceController::class, 'invoicePemesanan']);
    Route::get('/request-custom/{id}/invoice', [InvoiceController::class, 'invoiceCustom']);

    // Submit Ulasan (Customer)
    Route::post('/ulasan', [UlasanController::class, 'store']);

    // Pesan Kontak (Customer)
    Route::get('/pesan', [PesanKontakController::class, 'indexCustomer']);

    // Dokumen MOU (Customer)
    Route::get('/mou/{id_mou}', [MoUController::class, 'showForCustomer']);
    Route::post('/mou/upload-ttd/{tipe}/{id}', [MoUController::class, 'uploadTtd']);
});

// ─── MIDTRANS WEBHOOK (public, tanpa auth) ─────────────────────────────────────
Route::post('/payment/notification', [MidtransController::class, 'notification']);
