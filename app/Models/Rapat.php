<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rapat extends Model
{
    protected $table = 'rapat';

    protected $fillable = [
        'nama_rapat',
        'jenis',
        'tanggal',
        'waktu_mulai',
        'waktu_selesai',
        'ruangan_id',
        'link_rapat',
        'deskripsi',
        'status'
    ];

    protected $casts = [
        'tanggal' => 'date',
        'waktu_mulai' => 'datetime:H:i',
        'waktu_selesai' => 'datetime:H:i',
    ];

    /**
     * Get the ruangan that owns the rapat.
     */
    public function ruangan(): BelongsTo
    {
        return $this->belongsTo(Ruangan::class);
    }

    /**
     * Get the undangan for the rapat.
     */
    public function undangan(): HasMany
    {
        return $this->hasMany(UndanganRapat::class);
    }

    /**
     * Get the invited users for the rapat.
     */
    public function invitedUsers(): HasMany
    {
        return $this->hasMany(UndanganRapat::class)->with('user');
    }
}
