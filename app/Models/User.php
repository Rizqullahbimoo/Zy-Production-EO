<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'id_user';

    protected $fillable = [
        'nama',
        'email',
        'password',
        'no_hp',
        'role',
        'status',
        'foto',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    // Relasi
    public function pemesanan()
    {
        return $this->hasMany(Pemesanan::class, 'id_user', 'id_user');
    }

    public function requestCustomPaket()
    {
        return $this->hasMany(RequestCustomPaket::class, 'id_user', 'id_user');
    }

    public function pembayaranDiproses()
    {
        return $this->hasMany(Pembayaran::class, 'created_id', 'id_user');
    }
}
