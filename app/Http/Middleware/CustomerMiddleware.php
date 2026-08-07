<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CustomerMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || $request->user()->role !== 'user') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Akses ditolak. Hanya customer yang diizinkan.',
            ], 403);
        }

        return $next($request);
    }
}
