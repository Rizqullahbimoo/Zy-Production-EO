<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class PenawaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // dp_awal tidak divalidasi dari input — selalu dihitung otomatis
        // 30% dari total_penawaran di controller (lihat App\Support\DpCalculator)
        // agar konsisten dengan aturan DP pemesanan paket standar.
        return [
            'total_penawaran' => ['required', 'numeric', 'min:0'],
            'catatan_admin' => ['nullable', 'string'],
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'status' => 'error',
            'message' => 'Validasi gagal.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
