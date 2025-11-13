<?php

namespace App\Http\Controllers;

use App\Models\Ruangan;
use App\Models\Rapat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RuanganController extends Controller
{
    /**
     * Menampilkan semua ruangan aktif dan memperbarui statusnya otomatis
     */
    public function index()
    {
        try {
            // Update status ruangan berdasarkan rapat aktif hari ini
            $this->updateRuanganStatus();

            // Ambil semua ruangan aktif
            $ruangan = Ruangan::where('is_active', 1)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $ruangan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data ruangan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Memperbarui status ruangan berdasarkan rapat aktif hari ini
     */
    private function updateRuanganStatus()
    {
        try {
            $today = now()->format('Y-m-d');
            $currentTime = now()->format('H:i');

            // Ambil semua rapat offline aktif hari ini
            $rapatAktif = Rapat::where('jenis', 'offline')
                ->whereDate('tanggal', $today)
                ->where('is_active', 1)
                ->whereNotNull('ruangan_id')
                ->get();

            // Ambil semua ruangan yang sedang dipakai oleh rapat aktif
            $ruanganTerpakai = $rapatAktif
                ->filter(function ($r) use ($currentTime) {
                    // Hanya rapat yang belum selesai
                    return $currentTime = $r->waktu_selesai;
                })
                ->pluck('ruangan_id')
                ->unique()
                ->toArray();

            // Ambil semua ruangan aktif
            $semuaRuangan = Ruangan::where('is_active', 1)->get();

            foreach ($semuaRuangan as $ruangan) {
                $newStatus = in_array($ruangan->id, $ruanganTerpakai)
                    ? 'tidak_tersedia'
                    : 'tersedia';

                if ($ruangan->status !== $newStatus) {
                    $ruangan->update(['status' => $newStatus]);
                }
            }
        } catch (\Exception $e) {
            // abaikan error internal agar tidak ganggu API utama
        }
    }

    /**
     * Menambahkan ruangan baru
     */
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
                'is_active' => 1,
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

    /**
     * Mengupdate data ruangan
     */
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
            $ruangan->update([
                'nama_ruangan' => $request->input('nama_ruangan'),
            ]);

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

    /**
     * Menonaktifkan (soft delete) ruangan
     */
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
            // Tidak dihapus dari DB, hanya dinonaktifkan
            $ruangan->is_active = 0;
            $ruangan->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Ruangan berhasil dinonaktifkan'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menonaktifkan ruangan',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
