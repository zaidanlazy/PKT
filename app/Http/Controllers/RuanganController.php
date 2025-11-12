<?php

namespace App\Http\Controllers;

use App\Models\Ruangan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RuanganController extends Controller
{
    public function index()
    {
        // Update status ruangan berdasarkan rapat aktif hari ini
        $this->updateRuanganStatus();

        $ruangan = Ruangan::orderBy('created_at', 'desc')
                           ->where('is_active', '=', 1)
                           ->get();

        return response()->json([
            'data' => $ruangan
        ]);
    }

    /**
     * Memperbarui status ruangan berdasarkan rapat aktif hari ini
     */
    private function updateRuanganStatus()
    {
        try {
            $today = now()->format('Y-m-d');
            $currentTime = now()->format('H:i');

            // Get all active offline meetings for today
            $rapatAktif = \App\Models\Rapat::where('jenis', 'offline')
                ->whereDate('tanggal', $today)
                ->where('is_active', 1)
                ->whereNotNull('ruangan_id')
                ->get();

            // Get all unique room IDs that are currently in use by active meetings
            $ruanganTerpakai = $rapatAktif
                ->filter(function($r) use ($currentTime) {
                    // Only count rooms for meetings that haven't finished yet
                    return $currentTime <= $r->waktu_selesai;
                })
                ->pluck('ruangan_id')
                ->unique()
                ->toArray();

            // Get all rooms
            $semuaRuangan = Ruangan::where('is_active', 1)->get();

            foreach ($semuaRuangan as $ruangan) {
                try {
                    if (in_array($ruangan->id, $ruanganTerpakai)) {
                        // Room is being used by an active meeting
                        if ($ruangan->status !== 'tidak_tersedia') {
                            $ruangan->status = 'tidak_tersedia';
                            $ruangan->save();
                        }
                    } else {
                        // Room is not being used by any active meeting
                        if ($ruangan->status !== 'tersedia') {
                            $ruangan->status = 'tersedia';
                            $ruangan->save();
                        }
                    }
                } catch (\Exception $e) {
                    // ignore
                }
            }
        } catch (\Exception $e) {
            // ignore
        }
    }

    public function store(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'nama_ruangan' => 'required|string|max:255',
        ]);

        if ($validated->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validated->errors()
            ], 422);
        }

        try {
            $payload = [
                'nama_ruangan' => $request->input('nama_ruangan'),
                'status' => 'tersedia',
            ];

            $ruangan = Ruangan::create($payload);

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
        ]);

        if ($validated->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validated->errors()
            ], 422);
        }

        try {
            $payload = [
                'nama_ruangan' => $request->input('nama_ruangan'),
            ];
            $ruangan->update($payload);

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
            $ruangan->is_active = false;
            $ruangan->save();

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
