<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RapatController;
use App\Http\Controllers\RuanganController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UndanganRapatController;

// Public routes (no authentication required)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Route publik - tidak perlu login
Route::get('/rapat/hari-ini/public', [RapatController::class, 'todayMeetingsPublic']);

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/rapat/hari-ini/list', [RapatController::class, 'todayMeetings']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });


    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/rapat', [RapatController::class, 'index']);
    Route::get('/rapat-ruang', [RapatController::class, 'indexrapat']);
    Route::get('/rapat-today-all', [RapatController::class, 'todayAll']);

    Route::get('/rapat/{id}', [RapatController::class, 'show']);
    Route::post('/rapat', [RapatController::class, 'store']);
    Route::put('/rapat/{id}', [RapatController::class, 'update']);
    Route::delete('/rapat/{id}', [RapatController::class, 'destroy']);

    // Undangan routes
    Route::get('/undangan/user', [UndanganRapatController::class, 'getByUser']);
    Route::get('/undangan/rapat/{id}', [UndanganRapatController::class, 'getByRapat']);
    Route::post('/undangan', [UndanganRapatController::class, 'store']);
    Route::put('/undangan/{id}/status', [UndanganRapatController::class, 'updateStatus']);
    Route::put('/undangan/{id}/read', [UndanganRapatController::class, 'markAsRead']);
    Route::delete('/undangan/{id}', [UndanganRapatController::class, 'destroy']);

    // Ruangan routes
    Route::get('/ruangan', [RuanganController::class, 'index']);
    Route::post('/ruangan', [RuanganController::class, 'store']);
    Route::put('/ruangan/{id}', [RuanganController::class, 'update']);
    Route::delete('/ruangan/{id}', [RuanganController::class, 'destroy']);

    // Admin only routes
    Route::middleware('admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });
});
