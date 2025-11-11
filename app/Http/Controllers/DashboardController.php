<?php

namespace App\Http\Controllers;

use App\Models\Ruangan;
use App\Models\Rapat;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // Get total ruangan
        $total_ruangan = Ruangan::count();

        // Get total rapat
        $total_rapat = Rapat::count();

        // Get online and offline rapat counts
        $total_online = Rapat::where('jenis', 'online')-> where('tanggal', '=', today())->where('is_active', '=', 1)->count();
        $total_offline = Rapat::where('jenis', 'offline')->where('tanggal', '=', today())->where('is_active', '=', 1)->count();

        // Get ruangan statistics based on active offline meetings today
        // Count unique rooms that are booked for offline meetings today
        $ruangan_terpakai = Rapat::where('jenis', 'offline')
            ->where('tanggal', '=', today())
            ->where('is_active', '=', 1)
            ->whereNotNull('ruangan_id')
            ->select('ruangan_id')
            ->distinct()
            ->get()
            ->count();

        $total_ruangan = Ruangan::where('is_active', '=', 1)->count();

        // Available rooms = Total rooms - Rooms booked today
        $ruangan_tersedia = max(0, $total_ruangan - $ruangan_terpakai);
        $ruangan_tidak_tersedia = $ruangan_terpakai;

        return response()->json([
            'total_ruangan' => $total_ruangan,
            'total_rapat' => $total_rapat,
            'total_online' => $total_online,
            'total_offline' => $total_offline,
            'ruangan_tersedia' => $ruangan_tersedia,
            'ruangan_tidak_tersedia' => $ruangan_tidak_tersedia,
        ]);
    }
}
