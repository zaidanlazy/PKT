<?php

namespace App\Http\Controllers;

use App\Models\Rapat;
use App\Models\Ruangan;
use App\Models\UndanganRapat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RapatController extends Controller
{
    public function index()
    {
        $rapat = Rapat::with('ruangan')
                    ->orderBy('tanggal', 'desc')
                    ->orderBy('waktu_mulai', 'desc')
                    ->whereDate('tanggal', today())
                    ->where('is_active', '=', 1)
                    ->orderBy('id', 'desc')
                    ->get();

        return response()->json([
            'data' => $rapat
        ]);
    }

    public function indexrapat()
    {
        $rapat = Rapat::with('ruangan')
                    ->orderBy('tanggal', 'desc')
                    ->orderBy('waktu_mulai', 'desc')
                    ->where('is_active', '=', 1)
                    ->get();

        return response()->json([
            'data' => $rapat
        ]);
    }

    public function store(Request $request)
    {
        $validated = Validator::make(
            $request->all(),
            [
                'nama_rapat' => 'required|string|max:255',
                'jenis' => 'required|in:online,offline',
                'tanggal' => 'required|date|after_or_equal:today',
                'waktu_mulai' => 'required|date_format:H:i',
                'waktu_selesai' => [
                    'required',
                    'date_format:H:i',
                    function ($attribute, $value, $fail) use ($request) {
                        if ($request->waktu_mulai && $value) {
                            list($startHour, $startMin) = explode(':', $request->waktu_mulai);
                            list($endHour, $endMin) = explode(':', $value);
                            $startMinutes = (int)$startHour * 60 + (int)$startMin;
                            $endMinutes = (int)$endHour * 60 + (int)$endMin;
                            if ($endMinutes <= $startMinutes) {
                                $fail('Waktu selesai harus setelah waktu mulai.');
                            }
                        }
                    },
                ],
                'ruangan_id' => 'nullable|exists:ruangan,id',
                'deskripsi' => 'nullable|string',
                'invited_users' => 'nullable|array',
                'invited_users.*' => 'exists:users,id',
                'pesan_undangan' => 'nullable|string|max:500'
            ],
            [
                'nama_rapat.required' => 'Nama rapat tidak boleh kosong.',
                'jenis.required' => 'Jenis rapat harus dipilih.',
                'tanggal.required' => 'Kalender tidak boleh kosong.',
                'tanggal.after_or_equal' => 'Tanggal rapat tidak boleh sebelum hari ini.',
                'waktu_mulai.required' => 'Waktu mulai tidak boleh kosong.',
                'waktu_selesai.required' => 'Waktu selesai tidak boleh kosong.',
                'waktu_selesai.after' => 'Waktu selesai harus setelah waktu mulai.',
                'ruangan_id.exists' => 'Ruangan yang dipilih tidak valid.',
            ]
        );

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

            // Jika rapat offline dengan ruangan, tandai ruangan tidak tersedia
            if ($rapat->jenis === 'offline' && $rapat->ruangan_id) {
                try {
                    $ruangan = Ruangan::find($rapat->ruangan_id);
                    if ($ruangan && $ruangan->status !== 'tidak_tersedia') {
                        $ruangan->status = 'tidak_tersedia';
                        $ruangan->save();
                    }
                } catch (\Exception $e) {
                    // ignore
                }
            }

            // Create invitations if users are invited
            if ($request->has('invited_users') && is_array($request->invited_users)) {
                foreach ($request->invited_users as $userId) {
                    UndanganRapat::create([
                        'rapat_id' => $rapat->id,
                        'user_id' => $userId,
                        'pesan_undangan' => $request->pesan_undangan,
                        'status' => 'pending'
                    ]);
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Rapat berhasil ditambahkan',
                'data' => $rapat->load(['ruangan', 'undangan.user'])
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

        $validated = Validator::make(
            $request->all(),
            [
                'nama_rapat' => 'required|string|max:255',
                'jenis' => 'required|in:online,offline',
                'tanggal' => 'required|date',
                'waktu_mulai' => 'required|date_format:H:i',
                'waktu_selesai' => [
                    'required',
                    'date_format:H:i',
                    function ($attribute, $value, $fail) use ($request) {
                        if ($request->waktu_mulai && $value) {
                            list($startHour, $startMin) = explode(':', $request->waktu_mulai);
                            list($endHour, $endMin) = explode(':', $value);
                            $startMinutes = (int)$startHour * 60 + (int)$startMin;
                            $endMinutes = (int)$endHour * 60 + (int)$endMin;
                            if ($endMinutes <= $startMinutes) {
                                $fail('Waktu selesai harus setelah waktu mulai.');
                            }
                        }
                    },
                ],
                'ruangan_id' => 'nullable|exists:ruangan,id',
                'deskripsi' => 'nullable|string',
            ],
            [
                'nama_rapat.required' => 'Nama rapat tidak boleh kosong.',
                'jenis.required' => 'Jenis rapat harus dipilih.',
                'tanggal.required' => 'Kalender tidak boleh kosong.',
                'waktu_mulai.required' => 'Waktu mulai tidak boleh kosong.',
                'waktu_selesai.required' => 'Waktu selesai tidak boleh kosong.',
                'waktu_selesai.after' => 'Waktu selesai harus setelah waktu mulai.',
                'ruangan_id.exists' => 'Ruangan yang dipilih tidak valid.',
            ]
        );

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

            // Pastikan ruangan ditandai tidak tersedia ketika rapat offline aktif
            if ($rapat->jenis === 'offline' && $rapat->ruangan_id) {
                try {
                    $ruangan = Ruangan::find($rapat->ruangan_id);
                    if ($ruangan && $ruangan->status !== 'tidak_tersedia') {
                        $ruangan->status = 'tidak_tersedia';
                        $ruangan->save();
                    }
                } catch (\Exception $e) {
                    // ignore
                }
            }

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

    public function show($id)
    {
        $rapat = Rapat::with(['ruangan', 'undangan.user'])
                    ->find($id);

        if (!$rapat) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rapat tidak ditemukan'
            ], 404);
        }

        // Jika rapat hari ini sudah lewat waktunya, tandai nonaktif dan tolak detail
        try {
            $today = now()->format('Y-m-d');
            $currentTime = now()->format('H:i');
            $rapatDate = date('Y-m-d', strtotime($rapat->tanggal));
            if ($rapatDate === $today && $currentTime > $rapat->waktu_selesai) {
                if ($rapat->is_active) {
                    $rapat->is_active = false;
                    $rapat->save();
                }
                // Ruangan kembali tersedia
                if ($rapat->jenis === 'offline' && $rapat->ruangan_id) {
                    try {
                        $ruangan = Ruangan::find($rapat->ruangan_id);
                        if ($ruangan && $ruangan->status !== 'tersedia') {
                            $ruangan->status = 'tersedia';
                            $ruangan->save();
                        }
                    } catch (\Exception $e) {
                        // ignore
                    }
                }
                return response()->json([
                    'status' => 'error',
                    'message' => 'Rapat sudah selesai',
                    'finished' => true
                ], 410);
            }
        } catch (\Exception $e) {
            // ignore sweep error
        }

        return response()->json([
            'status' => 'success',
            'data' => $rapat
        ]);
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
            // $rapat->delete();
            $rapat->is_active = false;
            $rapat->save();

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

    /**
     * Mengembalikan semua rapat hari ini (termasuk yang sudah selesai),
     * serta menandai rapat yang sudah melewati waktu selesai sebagai nonaktif.
     */
    public function todayAll()
    {
        $today = now()->format('Y-m-d');
        $currentTime = now()->format('H:i');

        $rapat = Rapat::with('ruangan')
            ->whereDate('tanggal', $today)
            ->orderBy('waktu_mulai', 'desc')
            ->get();

        // Sweep: set nonaktif untuk rapat yang sudah selesai hari ini
        foreach ($rapat as $r) {
            try {
                if ($r->is_active && $currentTime > $r->waktu_selesai) {
                    $r->is_active = false;
                    $r->save();
                    // Ruangan kembali tersedia
                    if ($r->jenis === 'offline' && $r->ruangan_id) {
                        $ruangan = Ruangan::find($r->ruangan_id);
                        if ($ruangan && $ruangan->status !== 'tersedia') {
                            $ruangan->status = 'tersedia';
                            $ruangan->save();
                        }
                    }
                }
            } catch (\Exception $e) {
                // ignore
            }
        }

        return response()->json([
            'data' => $rapat
        ]);
    }
}
