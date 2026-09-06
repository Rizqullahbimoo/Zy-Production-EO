<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Mail\ResetPasswordMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    /**
     * Register customer baru.
     * POST /api/register
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'nama' => $request->nama,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'no_hp' => $request->no_hp,
            'role' => 'user',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Registrasi berhasil.',
            'data' => [
                'user' => [
                    'id_user' => $user->id_user,
                    'nama' => $user->nama,
                    'email' => $user->email,
                    'no_hp' => $user->no_hp,
                    'role' => $user->role,
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
                'status' => 'error',
                'message' => 'Email atau password salah.',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();

        if ($user->status === 'nonaktif') {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun Anda telah dinonaktifkan. Hubungi admin lain untuk informasi lebih lanjut.',
            ], 403);
        }

        // Hapus token lama (opsional, untuk single session)
        $user->tokens()->delete();

        $tokenName = $user->role === 'admin' ? 'admin_token' : 'user_token';
        $token = $user->createToken($tokenName)->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Login berhasil.',
            'data' => [
                'user' => [
                    'id_user' => $user->id_user,
                    'nama' => $user->nama,
                    'email' => $user->email,
                    'no_hp' => $user->no_hp,
                    'role' => $user->role,
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    /**
     * Kirim link reset password ke email, jika email terdaftar.
     * POST /api/forgot-password
     *
     * Pesan respons SENGAJA sama persis baik email terdaftar maupun tidak,
     * supaya endpoint ini tidak bisa dipakai untuk mengecek keberadaan akun
     * (user enumeration).
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        Password::sendResetLink(
            $request->only('email'),
            function (User $user, string $token) {
                $resetUrl = rtrim(config('app.url'), '/').'/reset-password?token='.$token;

                try {
                    Mail::to($user->email)->send(new ResetPasswordMail($user, $resetUrl));
                } catch (\Exception $e) {
                    Log::error('Gagal mengirim email reset password: '.$e->getMessage());
                }
            }
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Jika email terdaftar, kami telah mengirimkan link reset password ke email tersebut.',
        ]);
    }

    /**
     * Reset password menggunakan token dari email.
     * POST /api/reset-password
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->password = Hash::make($password);
                $user->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'status' => 'success',
                'message' => 'Password berhasil direset. Silakan login dengan password baru Anda.',
            ]);
        }

        // INVALID_TOKEN atau INVALID_USER — pesan digeneralisir supaya tidak
        // membocorkan informasi keberadaan akun.
        return response()->json([
            'status' => 'error',
            'message' => 'Token reset tidak valid atau sudah kedaluwarsa. Silakan minta link reset baru.',
        ], 400);
    }

    /**
     * Logout — cabut token saat ini.
     * POST /api/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
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
            'data' => [
                'id_user' => $user->id_user,
                'nama' => $user->nama,
                'email' => $user->email,
                'no_hp' => $user->no_hp,
                'role' => $user->role,
            ],
        ]);
    }
}
