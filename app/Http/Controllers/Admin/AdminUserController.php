<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    /**
     * Daftar semua akun admin.
     * GET /api/admin/kelola-admin
     */
    public function index(): JsonResponse
    {
        $admins = User::where('role', 'admin')
            ->orderBy('created_at', 'desc')
            ->get(['id_user', 'nama', 'email', 'no_hp', 'status', 'created_at']);

        return response()->json([
            'status' => 'success',
            'data' => $admins,
        ]);
    }

    /**
     * Buat akun admin baru.
     * POST /api/admin/kelola-admin
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'no_hp' => ['required', 'string', 'max:20'],
        ], [
            'nama.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan oleh pengguna lain.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal harus 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            'no_hp.required' => 'Nomor HP wajib diisi.',
        ]);

        $admin = User::create([
            'nama' => $request->nama,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'no_hp' => $request->no_hp,
            'role' => 'admin',
            'status' => 'aktif',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Akun admin baru berhasil dibuat.',
            'data' => [
                'id_user' => $admin->id_user,
                'nama' => $admin->nama,
                'email' => $admin->email,
                'no_hp' => $admin->no_hp,
                'status' => $admin->status,
                'created_at' => $admin->created_at,
            ],
        ], 201);
    }

    /**
     * Nonaktifkan akun admin (soft — bukan hapus permanen, supaya histori
     * relasi data seperti siapa yang approve penawaran tetap utuh).
     * PATCH /api/admin/kelola-admin/{id}/nonaktifkan
     *
     * Guard "tidak bisa nonaktifkan diri sendiri" dicek di sini (backend),
     * bukan cuma disable tombol di frontend — supaya tidak bisa dilewati
     * lewat panggilan API langsung.
     */
    public function nonaktifkan(Request $request, int $id): JsonResponse
    {
        if ($id === $request->user()->id_user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak bisa menonaktifkan akun sendiri.',
            ], 422);
        }

        $admin = User::where('role', 'admin')->find($id);

        if (! $admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun admin tidak ditemukan.',
            ], 404);
        }

        $admin->update(['status' => 'nonaktif']);

        // Cabut semua token aktif milik admin ini supaya sesi yang sedang
        // berjalan langsung terputus, bukan cuma diblokir di login berikutnya.
        $admin->tokens()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Akun admin berhasil dinonaktifkan.',
            'data' => [
                'id_user' => $admin->id_user,
                'status' => $admin->status,
            ],
        ]);
    }
}
