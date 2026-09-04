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

// Customer SPA catch-all: semua URL customer di-handle oleh React Router
// Regex negatif: kecualikan /api, /admin, /login, /register, /forgot-password, /reset-password
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '^(?!api|admin|login|register|forgot-password|reset-password).*$')->name('customer.spa');

// Root route (harus SETELAH catch-all agar tidak konflik)
Route::get('/', function () {
    return view('welcome');
})->name('home');
