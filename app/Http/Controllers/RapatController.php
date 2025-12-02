<?php

namespace App\Http\Controllers;

use App\Models\Rapat;
use App\Models\Ruangan;
use App\Models\UndanganRapat;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

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
        $rules = [
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
                            $fail('Waktu selesai harus lebih setelah waktu mulai.');
                        }
                    }
                },
            ],
            'deskripsi' => 'nullable|string',
            'invited_users' => 'nullable|array',
            'invited_users.*' => 'exists:users,id',
            'pesan_undangan' => 'nullable|string|max:500'
        ];

        // Tambahkan validasi kondisional berdasarkan jenis
        if ($request->jenis === 'offline') {
            $rules['ruangan_id'] = 'required|exists:ruangan,id';
        } elseif ($request->jenis === 'online') {
            $rules['link_rapat'] = 'required|url';
        }

        $validated = Validator::make($request->all(), $rules);

        if ($validated->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validated->errors()
            ], 422);
        }

        // CEK JIKA RUANGAN SUDAH DIGUNAKAN (hanya untuk offline)
        if ($request->jenis === 'offline' && $request->ruangan_id) {
            $isRuanganTerpakai = Rapat::where('ruangan_id', $request->ruangan_id)
                ->where('tanggal', $request->tanggal)
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
            // Siapkan data untuk disimpan
            $dataRapat = [
                'nama_rapat' => $request->nama_rapat,
                'jenis' => $request->jenis,
                'tanggal' => $request->tanggal,
                'waktu_mulai' => $request->waktu_mulai,
                'waktu_selesai' => $request->waktu_selesai,
                'deskripsi' => $request->deskripsi,
            ];

            // Set ruangan_id atau link_rapat berdasarkan jenis
            if ($request->jenis === 'offline') {
                $dataRapat['ruangan_id'] = $request->ruangan_id;
                $dataRapat['link_rapat'] = null;
            } else {
                $dataRapat['link_rapat'] = $request->link_rapat;
                $dataRapat['ruangan_id'] = null;
            }

            // Buat rapat
            $rapat = Rapat::create($dataRapat);

            // PENTING: Refresh data dari database untuk memastikan semua field ter-load
            $rapat->refresh();

            // Load relasi yang dibutuhkan
            $rapat->load('ruangan');

            // === PROSES UNDANGAN ===
            if ($request->has('invited_users') && is_array($request->invited_users)) {
                foreach ($request->invited_users as $userId) {
                    UndanganRapat::create([
                        'rapat_id' => $rapat->id,
                        'user_id' => $userId,
                        'pesan_undangan' => $request->pesan_undangan,
                        'status' => 'pending'
                    ]);

                    $user = User::find($userId);

                    if ($user && $user->no_telp) {
                        // Format tanggal & waktu
                        $tanggalFormat = Carbon::parse($rapat->tanggal)->locale('id')->isoFormat('dddd, D MMMM YYYY');
                        $mulaiFormat   = Carbon::parse($rapat->waktu_mulai)->format('H:i');
                        $selesaiFormat = Carbon::parse($rapat->waktu_selesai)->format('H:i');

                        // Pesan undangan dari user
                        $pesanUndangan = "";
                        if ($request->pesan_undangan) {
                            $pesanUndangan = "\n*Pesan:*\n{$request->pesan_undangan}\n";
                        }

                        // Deskripsi rapat
                        $deskripsiRapat = "";
                        if ($rapat->deskripsi) {
                            $deskripsiRapat = "\n*Deskripsi:*\n{$rapat->deskripsi}\n";
                        }

                        // Format pesan berbeda untuk online dan offline
                        if ($rapat->jenis === 'online') {
                            // PESAN UNTUK RAPAT ONLINE
                            $linkMeeting = "";
                            if (!empty($rapat->link_rapat)) {
                                $linkMeeting = "*Link Meeting*\n{$rapat->link_rapat}\n\n";
                            }

                            $message =
                                "*UNDANGAN RAPAT ONLINE*\n" .
                                "Kepada Yth.\n*{$user->nama}*\n\n" .
                                "Anda diundang untuk menghadiri:\n\n" .
                                "*Nama Rapat*\n{$rapat->nama_rapat}\n\n" .
                                "*Jenis*\nOnline\n\n" .
                                "*Tanggal*\n{$tanggalFormat}\n\n" .
                                "*Waktu*\n{$mulaiFormat} - {$selesaiFormat} WIB\n\n" .
                                "*Link Meeting*\n{$rapat->link_rapat}\n\n" .
                                $deskripsiRapat .
                                $pesanUndangan .
                                "Silakan Bergabung link diatas.\n\n" .
                                "Applikasi ini dikelola melalui sistem PKT.";
                        } else {
                            // PESAN UNTUK RAPAT OFFLINE
                            $lokasiInfo = "";
                            if ($rapat->ruangan) {
                                $lokasiInfo = "*Ruangan*\n{$rapat->ruangan->nama_ruangan}\n\n";
                                if ($rapat->ruangan->lokasi) {
                                    $lokasiInfo .= "*Lokasi*\n{$rapat->ruangan->lokasi}\n\n";
                                }
                            }

                            $message =
                                "*UNDANGAN RAPAT*\n" .
                                "Kepada Yth.\n*{$user->nama}*\n\n" .
                                "Anda diundang untuk menghadiri:\n\n" .
                                "*Nama Rapat*\n{$rapat->nama_rapat}\n\n" .
                                "*Jenis*\nOffline (Tatap Muka)\n\n" .
                                "*Tanggal*\n{$tanggalFormat}\n\n" .
                                "*Waktu*\n{$mulaiFormat} - {$selesaiFormat} WIB\n\n" .
                                $lokasiInfo .
                                $deskripsiRapat .
                                $pesanUndangan .
                                "Mohon untuk hadir tepat waktu pada rapat ini.\n\n" .
                                "Applikasi ini dikelola melalui sistem PKT.";

                        }

                        // Log untuk debugging
                        Log::info('Sending WhatsApp notification', [
                            'rapat_id' => $rapat->id,
                            'user_id' => $userId,
                            'no_telp' => $user->no_telp,
                            'jenis' => $rapat->jenis,
                            'link_rapat' => $rapat->link_rapat,
                            'ruangan_id' => $rapat->ruangan_id,
                            'link_empty' => empty($rapat->link_rapat),
                            'link_isset' => isset($rapat->link_rapat),
                            'dataRapat' => $dataRapat // Tambahan untuk debug
                        ]);

                        $this->sendWhatsapp($user->no_telp, $message);
                    }
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Rapat berhasil ditambahkan',
                'data' => $rapat->load(['ruangan', 'undangan.user'])
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating rapat', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menambah rapat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function sendWhatsapp($target, $message)
    {
        $token = env('FONNTE_TOKEN');

        $curl = curl_init();

        curl_setopt_array($curl, [
            CURLOPT_URL => "https://api.fonnte.com/send",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => [
                'target' => $target,
                'message' => $message
            ],
            CURLOPT_HTTPHEADER => [
                "Authorization: $token"
            ],
        ]);

        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        // Log response untuk debugging
        Log::info('WhatsApp API Response', [
            'target' => $target,
            'http_code' => $httpCode,
            'response' => $response
        ]);

        return $response;
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

        // Validasi dasar terlebih dahulu
        $rules = [
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
            'deskripsi' => 'nullable|string',
            'invited_users' => 'nullable|array',
            'invited_users.*' => 'exists:users,id',
            'pesan_undangan' => 'nullable|string|max:500'
        ];

        // validasi kondisional berdasarkan jenis
        if ($request->jenis === 'offline') {
            $rules['ruangan_id'] = 'required|exists:ruangan,id';
        } elseif ($request->jenis === 'online') {
            $rules['link_rapat'] = 'required|url';
        }

        $validated = Validator::make($request->all(), $rules);

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
            // Siapkan data untuk diupdate
            $dataRapat = [
                'nama_rapat' => $request->nama_rapat,
                'jenis' => $request->jenis,
                'tanggal' => $request->tanggal,
                'waktu_mulai' => $request->waktu_mulai,
                'waktu_selesai' => $request->waktu_selesai,
                'deskripsi' => $request->deskripsi,
            ];

            // Set ruangan_id atau link_rapat berdasarkan jenis
            if ($request->jenis === 'offline') {
                $dataRapat['ruangan_id'] = $request->ruangan_id;
                $dataRapat['link_rapat'] = null;
            } else {
                $dataRapat['link_rapat'] = $request->link_rapat;
                $dataRapat['ruangan_id'] = null;
            }

            $rapat->update($dataRapat);

            // PENTING: Refresh data dari database
            $rapat->refresh();

            // Load relasi yang dibutuhkan
            $rapat->load('ruangan');

            // Hapus undangan lama
            UndanganRapat::where('rapat_id', $rapat->id)->delete();

            // Buat undangan baru dan kirim notifikasi
            if ($request->has('invited_users') && is_array($request->invited_users)) {
                foreach ($request->invited_users as $userId) {
                    UndanganRapat::create([
                        'rapat_id' => $rapat->id,
                        'user_id' => $userId,
                        'pesan_undangan' => $request->pesan_undangan,
                        'status' => 'pending'
                    ]);

                    $user = User::find($userId);

                    if ($user && $user->no_telp) {
                        // Format tanggal & waktu
                        $tanggalFormat = Carbon::parse($rapat->tanggal)->locale('id')->isoFormat('dddd, D MMMM YYYY');
                        $mulaiFormat   = Carbon::parse($rapat->waktu_mulai)->format('H:i');
                        $selesaiFormat = Carbon::parse($rapat->waktu_selesai)->format('H:i');

                        // Pesan undangan dari user
                        $pesanUndangan = "";
                        if ($request->pesan_undangan) {
                            $pesanUndangan = "\n*Pesan:*\n{$request->pesan_undangan}\n";
                        }

                        // Deskripsi rapat
                        $deskripsiRapat = "";
                        if ($rapat->deskripsi) {
                            $deskripsiRapat = "\n*Deskripsi:*\n{$rapat->deskripsi}\n";
                        }

                        // Format pesan berbeda untuk online dan offline
                        if ($rapat->jenis === 'online') {
                            // PESAN UNTUK RAPAT ONLINE
                            $linkMeeting = "";
                            if (!empty($rapat->link_rapat)) {
                                $linkMeeting = "*Link Meeting*\n{$rapat->link_rapat}\n\n";
                            }

                            $message =
                                "*UPDATE UNDANGAN RAPAT ONLINE*\n" .
                                "Kepada Yth.\n*{$user->nama}*\n\n" .
                                "Terdapat perubahan pada rapat yang Anda ikuti:\n\n" .
                                "*Nama Rapat*\n{$rapat->nama_rapat}\n\n" .
                                "*Jenis*\nOnline\n\n" .
                                "*Tanggal*\n{$tanggalFormat}\n\n" .
                                "*Waktu*\n{$mulaiFormat} - {$selesaiFormat} WIB\n\n" .
                                "*Link Meeting*\n{$rapat->link_rapat}\n\n" .
                                $deskripsiRapat .
                                $pesanUndangan .
                                "Silakan konfirmasi kehadiran Anda melalui aplikasi dan bergabung melalui link di atas.\n\n" .
                                "Applikasi ini dikelola melalui sistem PKT.";
                        } else {
                            // PESAN UNTUK RAPAT OFFLINE
                            $lokasiInfo = "";
                            if ($rapat->ruangan) {
                                $lokasiInfo = "*Ruangan*\n{$rapat->ruangan->nama_ruangan}\n\n";
                                if ($rapat->ruangan->lokasi) {
                                    $lokasiInfo .= "*Lokasi*\n{$rapat->ruangan->lokasi}\n\n";
                                }
                            }

                            $message =
                                "*UPDATE UNDANGAN RAPAT*\n".
                                "Kepada Yth.\n*{$user->nama}*\n\n" .
                                "Terdapat perubahan pada rapat yang Anda ikuti:\n\n" .
                                "*Nama Rapat*\n{$rapat->nama_rapat}\n\n" .
                                "*Jenis*\nOffline (Tatap Muka)\n\n" .
                                "*Tanggal*\n{$tanggalFormat}\n\n" .
                                "*Waktu*\n{$mulaiFormat} - {$selesaiFormat} WIB\n\n" .
                                $lokasiInfo .
                                $deskripsiRapat .
                                $pesanUndangan .
                                "Mohon untuk hadir tepat waktu pada rapat ini.\n\n" .
                                "Applikasi ini dikelola melalui sistem PKT.";
                        }

                        Log::info('Sending WhatsApp update notification', [
                            'rapat_id' => $rapat->id,
                            'user_id' => $userId,
                            'no_telp' => $user->no_telp,
                            'jenis' => $rapat->jenis,
                              'link_rapat' => $rapat->link_rapat,
                            'link_empty' => empty($rapat->link_rapat),
                            'link_isset' => isset($rapat->link_rapat)
                        ]);

                        $this->sendWhatsapp($user->no_telp, $message);
                    }
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Rapat berhasil diupdate',
                'data' => $rapat->load(['ruangan', 'undangan.user'])
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating rapat', [
                'rapat_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

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
            ->where('is_active', 1)
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

            // Karena TIME, format dengan Carbon
           $mulai = $item->waktu_mulai
                ? Carbon::parse($item->waktu_mulai)->format('H:i')
                : null;

           $selesai = $item->waktu_selesai
                ? Carbon::parse($item->waktu_selesai)->format('H:i')
                : null;


            return [
                'id' => $item->id,
                'nama_rapat' => $item->nama_rapat,
                'jenis' => $item->jenis,

                // Format DATE → Y-m-d
                'tanggal' => Carbon::parse($item->tanggal)->format('Y-m-d'),

                'deskripsi' => $item->deskripsi,

                'ruangan' => $item->ruangan ? [
                    'id' => $item->ruangan->id,
                    'nama_ruangan' => $item->ruangan->nama_ruangan,
                    'kapasitas' => $item->ruangan->kapasitas,
                ] : null,

                // Waktu sudah rapi
                'waktu_mulai' => $mulai,
                'waktu_selesai' => $selesai,
                'waktu_range' => "$mulai - $selesai",
            ];
        });

    return response()->json([
        'status' => 'success',
        'data' => $rapat
    ]);
}


/**
 * Show rapat detail for public (no authentication)
 */
public function showPublic($id)
{
    try {
        $rapat = Rapat::with(['ruangan'])->find($id);

        if (!$rapat) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rapat tidak ditemukan'
            ], 404);
        }

        // Cek apakah rapat masih aktif
        if (!$rapat->is_active) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rapat tidak tersedia'
            ], 404);
        }

        // Format waktu dengan Carbon
        $waktuMulai = $rapat->waktu_mulai
            ? Carbon::parse($rapat->waktu_mulai)->format('H:i')
            : null;

        $waktuSelesai = $rapat->waktu_selesai
            ? Carbon::parse($rapat->waktu_selesai)->format('H:i')
            : null;

        // Format response
        $data = [
            'id' => $rapat->id,
            'nama_rapat' => $rapat->nama_rapat,
            'jenis' => $rapat->jenis,
            'tanggal' => Carbon::parse($rapat->tanggal)->format('Y-m-d'),
            'waktu_mulai' => $waktuMulai,
            'waktu_selesai' => $waktuSelesai,
            'deskripsi' => $rapat->deskripsi,
            'link_rapat' => $rapat->link_rapat,
            'ruangan' => null
        ];

        // Tambahkan info ruangan jika ada (untuk rapat offline)
        if ($rapat->ruangan) {
            $data['ruangan'] = [
                'id' => $rapat->ruangan->id,
                'nama_ruangan' => $rapat->ruangan->nama_ruangan,
                'kapasitas' => $rapat->ruangan->kapasitas,
                'lokasi' => $rapat->ruangan->lokasi ?? null,
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $data
        ], 200);

    } catch (\Exception $e) {
        Log::error('Error fetching public rapat detail', [
            'rapat_id' => $id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'status' => 'error',
            'message' => 'Terjadi kesalahan saat mengambil data rapat'
        ], 500);
    }
}

}
