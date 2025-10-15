<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class RapatController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Data rapat berhasil dimuat',
            'data' => [
                ['id' => 1, 'judul' => 'Rapat Bulanan', 'tanggal' => '2025-10-15'],
                ['id' => 2, 'judul' => 'Rapat Tim IT', 'tanggal' => '2025-10-20']
            ]
        ]);
    }
}
