<?php

namespace Database\Factories;
use Laravel\Sanctum\Sanctum;
// use carbon \Carbon;


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
        'nama_rapat' => 'test rapat',
        'jenis' => 'offline',
        'tanggal' => now()->format('Y-m-d'),
        'waktu_mulai' => '09:00',
        'waktu_selesai' => '10:00',
        'ruangan_id' => \App\Models\Ruangan::factory(),
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
        'ruangan_id' => null,
        'link_rapat' => 'https://meet.google.com/xxx',
        'deskripsi' => 'Tes rapat online',
        'status' => 'terjadwal'
    ];

    $response = $this->postJson('/api/rapat', $payload);

    $response->assertStatus(201);
}

public function test_tambah_rapat_offline_waktu_bentrok()
{
    Http::fake([
        '*' => Http::response(['success' => true], 200)
    ]);

    // Buat satu ruangan supaya kedua rapat pakai ruangan yang sama
    $ruangan = \App\Models\Ruangan::factory()->create();

    // Rapat pertama (valid)
    $rapat1 = \App\Models\Rapat::factory()->create([
        'jenis' => 'offline',
        'ruangan_id' => $ruangan->id,
        'tanggal' => now()->format('Y-m-d'),
        'waktu_mulai' => '09:00',
        'waktu_selesai' => '11:00',
    ]);

    // Payload rapat kedua yang bentrok
    $payload = [
        'nama_rapat' => 'Rapat Bentrok',
        'jenis' => 'offline',
        'tanggal' =>now()->format('Y-m-d'),
        'waktu_mulai' => '09:30',
        'waktu_selesai' => '10:00',
        'ruangan_id' => $ruangan->id,
        'deskripsi' => 'Rapat yang seharusnya gagal'
    ];

    // API request tambah rapat kedua
    $response = $this->postJson('/api/rapat', $payload);

    // RESPONSE YANG BENAR HARUS ERROR
    $response->assertStatus(409)
             ->assertJson([
                 'status' => 'error',
                 'message' => 'Ruangan sudah digunakan pada waktu tersebut.'
             ]);
}


}
