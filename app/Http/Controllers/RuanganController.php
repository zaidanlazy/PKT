<?php

namespace App\Http\Controllers;

use App\Models\Ruangan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RuanganController extends Controller
{
    public function index()
    {
        $ruangan = Ruangan::orderBy('created_at', 'desc')->get();
        
        return response()->json($ruangan);
    }

    public function store(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'nama_ruangan' => 'required|string|max:255',
            'kapasitas' => 'required|integer|min:1',
            'lokasi' => 'required|string|max:255',
            'fasilitas' => 'nullable|string',
            'status' => 'required|in:tersedia,tidak_tersedia',
        ]);

        if ($validated->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validated->errors()
            ], 422);
        }

        try {
            $ruangan = Ruangan::create($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Ruangan berhasil ditambahkan',
                'data' => $ruangan
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menambah ruangan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $ruangan = Ruangan::find($id);
        
        if (!$ruangan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ruangan tidak ditemukan'
            ], 404);
        }

        $validated = Validator::make($request->all(), [
            'nama_ruangan' => 'required|string|max:255',
            'kapasitas' => 'required|integer|min:1',
            'lokasi' => 'required|string|max:255',
            'fasilitas' => 'nullable|string',
            'status' => 'required|in:tersedia,tidak_tersedia',
        ]);

        if ($validated->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validated->errors()
            ], 422);
        }

        try {
            $ruangan->update($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Ruangan berhasil diupdate',
                'data' => $ruangan
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengupdate ruangan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $ruangan = Ruangan::find($id);
        
        if (!$ruangan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ruangan tidak ditemukan'
            ], 404);
        }

        try {
            $ruangan->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Ruangan berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menghapus ruangan',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}