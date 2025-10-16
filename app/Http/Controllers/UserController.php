<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function index()
    {
        $users = User::select('id', 'mpk', 'nama', 'email', 'unit_kerja', 'no_telp', 'role', 'created_at')
                     ->orderBy('created_at', 'desc')
                     ->get();
        
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'mpk' => 'required|string|max:50|unique:users,mpk',
            'nama' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'unit_kerja' => 'required|string|max:100',
            'no_telp' => 'nullable|string|max:15',
            'password' => 'required|min:6',
            'role' => 'required|in:user,admin',
        ]);

        if ($validated->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validated->errors()
            ], 422);
        }

        try {
            $user = User::create([
                'mpk' => $request->mpk,
                'nama' => $request->nama,
                'email' => $request->email,
                'unit_kerja' => $request->unit_kerja,
                'no_telp' => $request->no_telp,
                'password' => Hash::make($request->password),
                'role' => $request->role,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'User berhasil ditambahkan',
                'data' => $user
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menambah user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        $validated = Validator::make($request->all(), [
            'mpk' => 'required|string|max:50|unique:users,mpk,' . $id,
            'nama' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'unit_kerja' => 'required|string|max:100',
            'no_telp' => 'nullable|string|max:15',
            'role' => 'required|in:user,admin',
        ]);

        if ($validated->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validated->errors()
            ], 422);
        }

        try {
            $user->update([
                'mpk' => $request->mpk,
                'nama' => $request->nama,
                'email' => $request->email,
                'unit_kerja' => $request->unit_kerja,
                'no_telp' => $request->no_telp,
                'role' => $request->role,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'User berhasil diupdate',
                'data' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengupdate user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        try {
            $user->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'User berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menghapus user',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}