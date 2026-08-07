<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class GaleriRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');

        return [
            'judul' => ['required', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'foto' => [$isUpdate ? 'nullable' : 'required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'urutan' => ['nullable', 'integer', 'min:0'],
            'tanggal' => ['required', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'judul.required' => 'Judul galeri wajib diisi.',
            'foto.required' => 'Foto wajib diunggah.',
            'foto.image' => 'File harus berupa gambar.',
            'foto.max' => 'Ukuran foto maksimal 5MB.',
            'tanggal.required' => 'Tanggal dokumentasi event wajib diisi.',
            'tanggal.date' => 'Format tanggal tidak valid.',
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
