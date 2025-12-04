<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Rapat>
 */
class RapatFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
{
    return [
        'nama_rapat' => $this->faker->sentence(3),
        'jenis' => 'offline',
        'tanggal' => now()->format('Y-m-d'),
        'waktu_mulai' => '09:00',
        'waktu_selesai' => '10:00',
        'ruangan_id' => null,
        'link_rapat' => null,
        'deskripsi' => 'desc',
        'is_active' => 1
    ];

}

public function test_tambah_rapat_online()
{
    // Login user
    $user = \App\Models\User::factory()->create();
    Sanctum::actingAs($user);

    $payload = [
        'nama_rapat' => 'Rapat Online',
        'jenis' => 'online',
        'tanggal' => '2025-12-05',
        'waktu_mulai' => '10:00',
        'waktu_selesai' => '11:00',
        'ruangan_id' => 1,
        'link_rapat' => 'https://meet.google.com/xxx',
        'deskripsi' => 'Tes rapat online',
        'status' => 'terjadwal'
    ];

    $response = $this->postJson('/api/rapat', $payload);

    $response->assertStatus(201);
}

}
