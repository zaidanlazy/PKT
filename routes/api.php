<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RapatController;

// Public routes (no authentication required)
Route::post('/register', [AuthController::class, 'register']);      
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/rapat', [RapatController::class, 'index']);
    Route::post('/rapat', [RapatController::class, 'store']);
    Route::put('/rapat/{id}', [RapatController::class, 'update']);
    Route::delete('/rapat/{id}', [RapatController::class, 'destroy']);
});
