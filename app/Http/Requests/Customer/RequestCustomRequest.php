<?php

namespace App\Http\Requests\Customer;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class RequestCustomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_kategori' => ['required', 'exists:kategori_event,id_kategori'],
            'tanggal_acara' => ['required', 'date', 'after:today'],
            'lokasi_acara' => ['required', 'string', 'max:255'],
            'jumlah_tamu' => ['required', 'integer', 'min:1'],
            'budget_acara' => ['nullable', 'numeric', 'min:0'],
            'catatan' => ['nullable', 'string'],
            'fasilitas' => ['required', 'array', 'min:1'],
            'fasilitas.*.id_fasilitas' => ['required', 'exists:fasilitas_layanan,id_fasilitas'],
            'fasilitas.*.keterangan' => ['nullable', 'string'],
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
