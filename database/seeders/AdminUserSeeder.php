<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'mpk' => 'ADMIN001',
            'nama' => 'Administrator',
            'email' => 'admin@pupukkaltim.com',
            'unit_kerja' => 'IT',
            'no_telp' => '081234567890',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);

        // Create a regular user for testing
        User::create([
            'mpk' => 'USER001',
            'nama' => 'John Doe',
            'email' => 'john@pupukkaltim.com',
            'unit_kerja' => 'HRD',
            'no_telp' => '081234567891',
            'password' => Hash::make('user123'),
            'role' => 'user',
        ]);
    }
}