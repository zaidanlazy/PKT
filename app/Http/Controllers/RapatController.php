<?php

namespace App\Http\Controllers;

use App\Models\Rapat;
use App\Models\Ruangan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RapatController extends Controller
{
    public function index()
    {
        $rapat = Rapat::with('ruangan')
                     ->orderBy('tanggal', 'desc')
                     ->orderBy('waktu_mulai', 'desc')
                     ->get();
        
        return response()->json($rapat);
    }

    public function store(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'nama_rapat' => 'required|string|max:255',
            'jenis' => 'required|in:online,offline',
            'tanggal' => 'required|date|after_or_equal:today',
            'waktu_mulai' => 'required|date_format:H:i',
            'waktu_selesai' => 'required|date_format:H:i|after:waktu_mulai',
            'ruangan_id' => 'nullable|exists:ruangan,id',
            'deskripsi' => 'nullable|string',
        ]);

        if ($validated->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validated->errors()
            ], 422);
        }

        // Check if ruangan is available for offline meetings
        if ($request->jenis === 'offline' && $request->ruangan_id) {
            $ruangan = Ruangan::find($request->ruangan_id);
            if (!$ruangan || $ruangan->status !== 'tersedia') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Ruangan tidak tersedia'
                ], 422);
            }

            // Check for time conflicts
            $conflict = Rapat::where('ruangan_id', $request->ruangan_id)
                           ->where('tanggal', $request->tanggal)
                           ->where('jenis', 'offline')
                           ->where(function($query) use ($request) {
                               $query->whereBetween('waktu_mulai', [$request->waktu_mulai, $request->waktu_selesai])
                                     ->orWhereBetween('waktu_selesai', [$request->waktu_mulai, $request->waktu_selesai])
                                     ->orWhere(function($q) use ($request) {
                                         $q->where('waktu_mulai', '<=', $request->waktu_mulai)
                                           ->where('waktu_selesai', '>=', $request->waktu_selesai);
                                     });
                           })
                           ->exists();

            if ($conflict) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Ruangan sudah digunakan pada waktu tersebut'
                ], 422);
            }
        }

        try {
            $rapat = Rapat::create($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Rapat berhasil ditambahkan',
                'data' => $rapat->load('ruangan')
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menambah rapat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $rapat = Rapat::find($id);
        
        if (!$rapat) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rapat tidak ditemukan'
            ], 404);
        }

        $validated = Validator::make($request->all(), [
            'nama_rapat' => 'required|string|max:255',
            'jenis' => 'required|in:online,offline',
            'tanggal' => 'required|date',
            'waktu_mulai' => 'required|date_format:H:i',
            'waktu_selesai' => 'required|date_format:H:i|after:waktu_mulai',
            'ruangan_id' => 'nullable|exists:ruangan,id',
            'deskripsi' => 'nullable|string',
        ]);

        if ($validated->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validated->errors()
            ], 422);
        }

        // Check if ruangan is available for offline meetings
        if ($request->jenis === 'offline' && $request->ruangan_id) {
            $ruangan = Ruangan::find($request->ruangan_id);
            if (!$ruangan || $ruangan->status !== 'tersedia') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Ruangan tidak tersedia'
                ], 422);
            }

            // Check for time conflicts (excluding current rapat)
            $conflict = Rapat::where('ruangan_id', $request->ruangan_id)
                           ->where('tanggal', $request->tanggal)
                           ->where('jenis', 'offline')
                           ->where('id', '!=', $id)
                           ->where(function($query) use ($request) {
                               $query->whereBetween('waktu_mulai', [$request->waktu_mulai, $request->waktu_selesai])
                                     ->orWhereBetween('waktu_selesai', [$request->waktu_mulai, $request->waktu_selesai])
                                     ->orWhere(function($q) use ($request) {
                                         $q->where('waktu_mulai', '<=', $request->waktu_mulai)
                                           ->where('waktu_selesai', '>=', $request->waktu_selesai);
                                     });
                           })
                           ->exists();

            if ($conflict) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Ruangan sudah digunakan pada waktu tersebut'
                ], 422);
            }
        }

        try {
            $rapat->update($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Rapat berhasil diupdate',
                'data' => $rapat->load('ruangan')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengupdate rapat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $rapat = Rapat::find($id);
        
        if (!$rapat) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rapat tidak ditemukan'
            ], 404);
        }

        try {
            $rapat->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Rapat berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menghapus rapat',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
