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

        return response()->json(['data' => $rapat]);
    }

    public function indexrapat()
    {
        $rapat = Rapat::with('ruangan')
            ->orderBy('tanggal', 'desc')
            ->orderBy('waktu_mulai', 'desc')
            ->where('is_active', '=', 1)
            ->get();

        return response()->json(['data' => $rapat]);
    }

    public function store(Request $request)
    {
        $validated = Validator::make(
            $request->all(),
            [
                'nama_rapat' => 'required|string|max:255',
                'jenis' => 'required|in:online,offline,',
                'tanggal' => 'required|date|after_or_equal:today',
                'waktu_mulai' => 'required|date_format:H:i',
                'waktu_selesai' => [
                    'required',
                    //waktu selesai harus lebih besar dari waktu mulai
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
                'ruangan_id' => 'nullable|required_if:jenis,offline|exists:ruangan,id',
                'deskripsi' => 'nullable|string',
                'invited_users' => 'nullable|array',
                'invited_users.*' => 'exists:users,id',
                'pesan_undangan' => 'nullable|string|max:500'
            ]
        );

        if ($validated->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validated->errors()
            ], 422);
        }

        // CEK APAKAH RUANGAN SUDAH DIPAKAI
        if ($request->jenis === 'offline' && $request->ruangan_id) {

            $isRuanganTerpakai = Rapat::where('ruangan_id', $request->ruangan_id)
                ->where('tanggal', $request->tanggal)
                ->where('waktu_selesai', '>', $request->waktu_mulai)
                ->exists();

            if ($isRuanganTerpakai) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Ruangan sedang di gunakan.'
                ], 409);
            }
        }


        try {
            $rapat = Rapat::create($request->all());

            // Tambahkan undangan jika ada
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
                'invited_users' => 'nullable|array',
                'invited_users.*' => 'exists:users,id',
                'pesan_undangan' => 'nullable|string|max:500'
            ]
        );

        if ($validated->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validated->errors()
            ], 422);
        }

        // CEK JIKA RUANGAN SUDAH DIGUNAKAN (kecuali oleh rapat yang sedang diedit)
        if ($request->jenis === 'offline' && $request->ruangan_id) {
            $isRuanganTerpakai = Rapat::where('ruangan_id', $request->ruangan_id)
                ->where('tanggal', $request->tanggal)
                ->where('id', '!=', $rapat->id)
                ->where('is_active', 1)
                ->where(function ($query) use ($request) {
                    $query->whereBetween('waktu_mulai', [$request->waktu_mulai, $request->waktu_selesai])
                          ->orWhereBetween('waktu_selesai', [$request->waktu_mulai, $request->waktu_selesai])
                          ->orWhere(function ($q) use ($request) {
                              $q->where('waktu_mulai', '<=', $request->waktu_mulai)
                                ->where('waktu_selesai', '>=', $request->waktu_selesai);
                          });
                })
                ->exists();

            if ($isRuanganTerpakai) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Ruangan sudah digunakan pada waktu tersebut.'
                ], 409);
            }
        }

        try {
            $rapat->update($request->all());
            UndanganRapat::where('rapat_id', $rapat->id)->delete();

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
                'message' => 'Rapat berhasil diupdate',
                'data' => $rapat->load(['ruangan', 'undangan.user'])
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
        $rapat = Rapat::with(['ruangan', 'undangan.user'])->find($id);

        if (!$rapat) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rapat tidak ditemukan'
            ], 404);
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

    public function todayAll()
    {
        $today = now()->format('Y-m-d');

        $rapat = Rapat::with('ruangan')
            ->whereDate('tanggal', $today)
            ->orderBy('waktu_mulai', 'desc')
            ->get();

        return response()->json(['data' => $rapat]);
    }

    public function todayMeetingsPublic()
    {
        $today = now()->toDateString();

        $rapat = Rapat::with('ruangan')
            ->whereDate('tanggal', $today)
            ->where('is_active', 1)
            ->orderBy('waktu_mulai', 'asc')
            ->get()
            ->map(function($item) {
                //format waktu
                $waktuMulai = $item->waktu_mulai ? substr($item->waktu_mulai, 0, 5) : '';
                $waktuSelesai = $item->waktu_selesai ? substr($item->waktu_selesai, 0, 5) : '';

                return [
                    'id' => $item->id,
                    'nama_rapat' => $item->nama_rapat,
                    'jenis' => $item->jenis,
                    'deskripsi' => $item->deskripsi,
                    'tanggal' => $item->tanggal,
                    'ruangan' => $item->ruangan ? [
                        'id' => $item->ruangan->id,
                        'nama_ruangan' => $item->ruangan->nama_ruangan,
                        'kapasitas' => $item->ruangan->kapasitas ?? null,
                    ] : null,
                    'waktu_mulai' => $waktuMulai,
                    'waktu_selesai' => $waktuSelesai,
                    'waktu_range' => $waktuMulai . ' - ' . $waktuSelesai,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $rapat
        ]);
    }

    // METHOD BARU: Detail Rapat Public (Tanpa Auth)
    public function showPublic($id)
    {
        $rapat = Rapat::with(['ruangan', 'undangan.user'])
            ->where('is_active', 1)
            ->find($id);

        if (!$rapat) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rapat tidak ditemukan atau sudah tidak aktif'
            ], 404);
        }

        // Format waktu
        $waktuMulai = $rapat->waktu_mulai ? substr($rapat->waktu_mulai, 0, 5) : '';
        $waktuSelesai = $rapat->waktu_selesai ? substr($rapat->waktu_selesai, 0, 5) : '';

        $data = [
            'id' => $rapat->id,
            'nama_rapat' => $rapat->nama_rapat,
            'jenis' => $rapat->jenis,
            'deskripsi' => $rapat->deskripsi,
            'tanggal' => $rapat->tanggal,
            'waktu_mulai' => $waktuMulai,
            'waktu_selesai' => $waktuSelesai,
            'waktu_range' => $waktuMulai . ' - ' . $waktuSelesai,
            'ruangan' => $rapat->ruangan ? [
                'id' => $rapat->ruangan->id,
                'nama_ruangan' => $rapat->ruangan->nama_ruangan,
                'kapasitas' => $rapat->ruangan->kapasitas ?? null,
                'lokasi' => $rapat->ruangan->lokasi ?? null,
            ] : null,
            // Jangan tampilkan data undangan di public untuk privacy
            'jumlah_undangan' => $rapat->undangan ? $rapat->undangan->count() : 0,
        ];

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }
}