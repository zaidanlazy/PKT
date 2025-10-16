<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Validasi sesuai dengan field yang dikirim dari frontend
        $validated = Validator::make($request->all(), [
            'mpk' => 'required|string|max:50|unique:users,mpk',
            'nama' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'unit_kerja' => 'required|string|max:100',
            'no_telp' => 'nullable|string|max:15',
            'password' => 'required|min:6',
        ]);

        if ($validated->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validated->errors()
            ], 422);
        }

        try {
            // Buat user baru
            $user = User::create([
                'mpk' => $request->mpk,
                'nama' => $request->nama,
                'email' => $request->email,
                'unit_kerja' => $request->unit_kerja,
                'no_telp' => $request->no_telp,
                'password' => Hash::make($request->password),
                'role' => 'user', // Default role for new users
            ]);

            // Buat token untuk auto-login setelah register
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'Registrasi berhasil',
                'data' => [
                    'user' => $user,
                    'token' => $token
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat registrasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'mpk' => 'required',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Cari user berdasarkan MPK
        $user = User::where('mpk', $request->mpk)->first();

        // Cek apakah user ada dan password benar
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'MPK atau password salah'
            ], 401);
        }

        // Buat token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Login berhasil',
            'token' => $token,
            'data' => [
                'user' => $user
            ]
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logout berhasil'
        ]);
    }
}