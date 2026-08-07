<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\PesanKontak;
use Illuminate\Support\Facades\Auth;

class PesanKontakController extends Controller
{
    // Customer submit form
    public function store(Request $request)
    {
        $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'kontak' => 'required|string|max:255',
            'pesan' => 'required|string',
        ]);

        $userId = Auth::guard('sanctum')->check() ? Auth::guard('sanctum')->id() : null;

        $pesan = PesanKontak::create([
            'user_id' => $userId,
            'nama_lengkap' => $request->nama_lengkap,
            'kontak' => $request->kontak,
            'pesan' => $request->pesan,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pesan berhasil dikirim',
            'data' => $pesan
        ]);
    }

    // Admin view all messages
    public function indexAdmin()
    {
        $pesan = PesanKontak::orderBy('created_at', 'desc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $pesan
        ]);
    }

    // Admin reply message
    public function replyAdmin(Request $request, $id)
    {
        $request->validate([
            'balasan_admin' => 'required|string'
        ]);

        $pesan = PesanKontak::findOrFail($id);
        $pesan->update([
            'balasan_admin' => $request->balasan_admin,
            'status' => 'dibalas'
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Balasan berhasil dikirim',
            'data' => $pesan
        ]);
    }

    // Customer view their own messages
    public function indexCustomer()
    {
        $userId = Auth::id();
        $pesan = PesanKontak::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'status' => 'success',
            'data' => $pesan
        ]);
    }
}
