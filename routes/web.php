<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/', function () {
    return view('welcome');
});

// API routes without CSRF protection
Route::prefix('api')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::get('/login', function () {
    return response()->json(['error' => 'Unauthorized'], 401);
})->name('login');

});
