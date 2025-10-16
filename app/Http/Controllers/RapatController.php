<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class RapatController extends Controller
{
    public function index()
    {
        return response()->json([
            [
                'id' => 1,
                'nama_rapat' => 'Rapat Bulanan',
                'jenis' => 'online',
                'tanggal' => '2025-01-15',
                'waktu_mulai' => '09:00',
                'waktu_selesai' => '11:00',
                'ruangan_id' => null
            ],
            [
                'id' => 2,
                'nama_rapat' => 'Rapat Tim IT',
                'jenis' => 'offline',
                'tanggal' => '2025-01-20',
                'waktu_mulai' => '14:00',
                'waktu_selesai' => '16:00',
                'ruangan_id' => 'R001'
            ],
            [
                'id' => 3,
                'nama_rapat' => 'Rapat Koordinasi',
                'jenis' => 'online',
                'tanggal' => '2025-01-25',
                'waktu_mulai' => '10:00',
                'waktu_selesai' => '12:00',
                'ruangan_id' => null
            ]
        ]);
    }

    public function store(Request $request)
    {
        // For now, return success response
        // In real implementation, you would save to database
        return response()->json([
            'status' => 'success',
            'message' => 'Rapat berhasil ditambahkan'
        ], 201);
    }

    public function update(Request $request, $id)
    {
        // For now, return success response
        // In real implementation, you would update in database
        return response()->json([
            'status' => 'success',
            'message' => 'Rapat berhasil diupdate'
        ]);
    }

    public function destroy($id)
    {
        // For now, return success response
        // In real implementation, you would delete from database
        return response()->json([
            'status' => 'success',
            'message' => 'Rapat berhasil dihapus'
        ]);
    }
}
