<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'total_ruangan' => 5,
            'total_rapat' => 12,
            'total_online' => 8,
            'total_offline' => 4,
        ]);
    }
}
