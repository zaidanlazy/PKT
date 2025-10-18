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
        $total_online = Rapat::where('jenis', 'online')->count();
        $total_offline = Rapat::where('jenis', 'offline')->count();
        
        // Get ruangan statistics
        $ruangan_tersedia = Ruangan::where('status', 'tersedia')->count();
        $ruangan_tidak_tersedia = Ruangan::where('status', 'tidak_tersedia')->count();

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
