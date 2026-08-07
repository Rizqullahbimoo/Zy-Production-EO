<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register customer baru.
     * POST /api/register
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'nama'     => $request->nama,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'no_hp'    => $request->no_hp,
            'role'     => 'user',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status'  => 'success',
            'message' => 'Registrasi berhasil.',
            'data'    => [
                'user'  => [
                    'id_user' => $user->id_user,
                    'nama'    => $user->nama,
                    'email'   => $user->email,
                    'no_hp'   => $user->no_hp,
                    'role'    => $user->role,
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ], 201);
    }

    /**
     * Login untuk customer dan admin.
     * POST /api/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Email atau password salah.',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();

        // Hapus token lama (opsional, untuk single session)
        $user->tokens()->delete();

        $tokenName = $user->role === 'admin' ? 'admin_token' : 'user_token';
        $token     = $user->createToken($tokenName)->plainTextToken;

        return response()->json([
            'status'  => 'success',
            'message' => 'Login berhasil.',
            'data'    => [
                'user'  => [
                    'id_user' => $user->id_user,
                    'nama'    => $user->nama,
                    'email'   => $user->email,
                    'no_hp'   => $user->no_hp,
                    'role'    => $user->role,
                ],
                'token'      => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    /**
     * Logout — cabut token saat ini.
     * POST /api/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Logout berhasil.',
        ]);
    }

    /**
     * Profil user yang sedang login.
     * GET /api/me
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'id_user' => $user->id_user,
                'nama'    => $user->nama,
                'email'   => $user->email,
                'no_hp'   => $user->no_hp,
                'role'    => $user->role,
            ],
        ]);
    }
}
