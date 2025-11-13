<?php

namespace App\Http\Controllers;

use App\Models\Ruangan;
use App\Models\Rapat;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $now = Carbon::now();

        // === PERBAIKAN UTAMA ===
        // Cek semua rapat hari ini yang waktu_selesai sudah lewat jam sekarang
        // lalu ubah is_active jadi 0 (nonaktif)
        Rapat::where('tanggal', today())
            ->whereTime('waktu_selesai', '<', $now->format('H:i:s'))
            ->where('is_active', 1)
            ->update(['is_active' => 0]);

        // === Perhitungan dashboard ===
        $total_ruangan = Ruangan::where('is_active', 1)->count();
        $total_rapat = Rapat::count();

        $total_online = Rapat::where('jenis', 'online')
            ->where('tanggal', today())
            ->where('is_active', 1)
            ->count();

        $total_offline = Rapat::where('jenis', 'offline')
            ->where('tanggal', today())
            ->where('is_active', 1)
            ->count();

        // Hitung ruangan yang masih dipakai (offline aktif)
        $ruangan_terpakai = Rapat::where('jenis', 'offline')
            ->where('tanggal', today())
            ->where('is_active', 1)
            ->whereNotNull('ruangan_id')
            ->distinct('ruangan_id')
            ->count('ruangan_id');

        // Ruangan tersedia = total aktif - yang terpakai
        $ruangan_tersedia = max(0, $total_ruangan - $ruangan_terpakai);

        return response()->json([
            'total_ruangan' => $total_ruangan,
            'total_rapat' => $total_rapat,
            'total_online' => $total_online,
            'total_offline' => $total_offline,
            'ruangan_tersedia' => $ruangan_tersedia,
            'ruangan_tidak_tersedia' => $ruangan_terpakai,
        ]);
    }
}
