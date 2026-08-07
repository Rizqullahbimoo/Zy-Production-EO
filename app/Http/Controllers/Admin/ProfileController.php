<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * Update the authenticated admin's profile.
     * PUT /api/admin/profile
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'nama' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id_user, 'id_user'),
            ],
            'no_hp' => 'required|string|max:15',
            'password' => 'nullable|string|min:8|confirmed',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ], [
            'nama.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan oleh pengguna lain.',
            'no_hp.required' => 'Nomor HP wajib diisi.',
            'password.min' => 'Password minimal harus 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            'foto.image' => 'File harus berupa gambar.',
            'foto.mimes' => 'Format gambar harus jpeg, png, jpg, atau gif.',
            'foto.max' => 'Ukuran gambar maksimal 5 MB.',
        ]);

        $user->nama = $request->nama;
        $user->email = $request->email;
        $user->no_hp = $request->no_hp;

        if ($request->hasFile('foto')) {
            if ($user->foto) {
                Storage::disk('public')->delete($user->foto);
            }
            $path = $request->file('foto')->store('profile', 'public');
            $user->foto = $path;
        }

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui.',
            'data' => [
                'id_user' => $user->id_user,
                'nama' => $user->nama,
                'email' => $user->email,
                'no_hp' => $user->no_hp,
                'role' => $user->role,
                'foto' => $user->foto,
            ],
        ]);
    }
}
