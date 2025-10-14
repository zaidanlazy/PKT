<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Kolom yang bisa diisi (fillable)
     */
    protected $fillable = [
        'mpk',
        'nama',
        'unit_kerja',
        'email',
        'no_telp',
        'password',
    ];

    /**
     * Kolom yang disembunyikan (tidak tampil di response)
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // perubahan 

    /**
     * Konversi otomatis tipe data
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
        ];
    }
}


// test

//test 