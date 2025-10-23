<?php

namespace App\Http\Controllers;

use App\Models\UndanganRapat;
use App\Models\Rapat;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UndanganRapatController extends Controller
{
    /**
     * Get invitations for a specific rapat
     */
    public function getByRapat($rapatId)
    {
        $undangan = UndanganRapat::with('user')
            ->where('rapat_id', $rapatId)
            ->get();

        return response()->json([
            'data' => $undangan
        ]);
    }

    /**
     * Get invitations for a specific user
     */
    public function getByUser(Request $request)
    {
        $undangan = UndanganRapat::with(['rapat.ruangan'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $undangan
        ]);
    }

    /**
     * Create new invitations for a rapat
     */
    public function store(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'rapat_id' => 'required|exists:rapat,id',
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'pesan_undangan' => 'nullable|string|max:500'
        ]);

        if ($validated->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validated->errors()
            ], 422);
        }

        try {
            $undangan = [];
            foreach ($request->user_ids as $userId) {
                // Check if invitation already exists
                $existing = UndanganRapat::where('rapat_id', $request->rapat_id)
                    ->where('user_id', $userId)
                    ->first();

                if (!$existing) {
                    $undangan[] = UndanganRapat::create([
                        'rapat_id' => $request->rapat_id,
                        'user_id' => $userId,
                        'pesan_undangan' => $request->pesan_undangan,
                        'status' => 'pending'
                    ]);
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Undangan berhasil dikirim',
                'data' => $undangan
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengirim undangan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update invitation status (accept/decline)
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = Validator::make($request->all(), [
            'status' => 'required|in:accepted,declined'
        ]);

        if ($validated->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validated->errors()
            ], 422);
        }

        try {
            $undangan = UndanganRapat::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->first();

            if (!$undangan) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Undangan tidak ditemukan'
                ], 404);
            }

            $undangan->update([
                'status' => $request->status,
                'direspon_at' => now()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Status undangan berhasil diupdate',
                'data' => $undangan->load('rapat.ruangan')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengupdate status undangan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark invitation as read
     */
    public function markAsRead($id)
    {
        try {
            $undangan = UndanganRapat::where('id', $id)
                ->where('user_id', auth()->id())
                ->first();

            if (!$undangan) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Undangan tidak ditemukan'
                ], 404);
            }

            $undangan->update([
                'dibaca_at' => now()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Undangan ditandai sebagai sudah dibaca'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menandai undangan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete invitation
     */
    public function destroy($id)
    {
        try {
            $undangan = UndanganRapat::find($id);

            if (!$undangan) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Undangan tidak ditemukan'
                ], 404);
            }

            $undangan->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Undangan berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menghapus undangan',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}