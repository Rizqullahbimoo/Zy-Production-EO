<?php

use Illuminate\Support\Facades\Route;

// Authentication Routes
Route::get('/login', function () {
    return view('auth.login');
})->name('login');

Route::get('/register', function () {
    return view('auth.register');
})->name('register');

Route::get('/forgot-password', function () {
    return view('auth.forgot-password');
})->name('forgot-password');

Route::get('/reset-password', function () {
    return view('auth.reset-password');
})->name('reset-password');

Route::get('/admin/dashboard', function () {
    return view('admin.dashboard');
})->name('admin.dashboard');

// TEMPORARY — testing koneksi SMTP dari environment Railway (hapus setelah selesai testing)
Route::get('/test-smtp-connection', function () {
    $start = microtime(true);
    try {
        $connection = @fsockopen(config('mail.mailers.smtp.host'), config('mail.mailers.smtp.port'), $errno, $errstr, 10);
        $duration = round(microtime(true) - $start, 2);
        if ($connection) {
            fclose($connection);
            return response()->json([
                'status' => 'success',
                'message' => 'Koneksi ke SMTP host berhasil',
                'host' => config('mail.mailers.smtp.host'),
                'port' => config('mail.mailers.smtp.port'),
                'duration_seconds' => $duration,
            ]);
        } else {
            return response()->json([
                'status' => 'failed',
                'message' => 'Koneksi gagal',
                'error_code' => $errno,
                'error_message' => $errstr,
                'host' => config('mail.mailers.smtp.host'),
                'port' => config('mail.mailers.smtp.port'),
                'duration_seconds' => $duration,
            ]);
        }
    } catch (\Exception $e) {
        $duration = round(microtime(true) - $start, 2);
        return response()->json([
            'status' => 'exception',
            'message' => $e->getMessage(),
            'duration_seconds' => $duration,
        ]);
    }
});

// Customer SPA catch-all: semua URL customer di-handle oleh React Router
// Regex negatif: kecualikan /api, /admin, /login, /register, /forgot-password, /reset-password
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '^(?!api|admin|login|register|forgot-password|reset-password).*$')->name('customer.spa');

// Root route (harus SETELAH catch-all agar tidak konflik)
Route::get('/', function () {
    return view('welcome');
})->name('home');
