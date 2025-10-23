<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UndanganRapat extends Model
{
    protected $fillable = [
        'rapat_id',
        'user_id',
        'status',
        'pesan_undangan',
        'dibaca_at',
        'direspon_at'
    ];

    protected $casts = [
        'dibaca_at' => 'datetime',
        'direspon_at' => 'datetime',
    ];

    /**
     * Get the rapat that owns the undangan.
     */
    public function rapat(): BelongsTo
    {
        return $this->belongsTo(Rapat::class);
    }

    /**
     * Get the user that owns the undangan.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
