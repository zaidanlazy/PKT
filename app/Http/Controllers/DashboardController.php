<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Data dashboard berhasil dimuat',
            'data' => [
                'total_user' => 120,
                'total_rapat' => 15
            ]
        ]);
    }
}
