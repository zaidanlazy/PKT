<?php

namespace App\Helpers;

use App\Models\Rapat;
use App\Models\Ruangan;
use Carbon\Carbon;

class RapatHelper
{
    public static function updateStatus()
    {
        $now = Carbon::now()->format('H:i');

        // 1. Nonaktifkan rapat yang sudah selesai
        Rapat::where('tanggal', today())
            ->where('is_active', 1)
            ->where('waktu_selesai', '<', $now)
            ->update(['is_active' => 0]);

        // 2. Ambil ruangan yg masih dipakai rapat aktif OFFLINE
        $ruanganDipakai = Rapat::where('jenis', 'offline')
            ->where('tanggal', today())
            ->where('is_active', 1)
            ->pluck('ruangan_id')
            ->filter()
            ->toArray();

        // 3. Ruangan yang dipakai → set is_active = 0
        Ruangan::whereIn('id', $ruanganDipakai)
            ->update(['is_active' => 0]);

        // 4. Ruangan lain → set is_active = 1
        Ruangan::whereNotIn('id', $ruanganDipakai)
            ->update(['is_active' => 1]);

        return true;
    }
}
