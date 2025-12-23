<?php

namespace Tests\Feature;

use App\Models\Ruangan;
use App\Models\Rapat;
use App\Models\User;
// use Illuminate\Foundation\Testing\RefreshDatabase;
// use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RuanganTest extends TestCase
{
    // use RefreshDatabase, WithFaker;

    protected $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::factory()->create([
            'role' => 'admin',
            'is_active' => 1,
            'password' => Hash::make('password'),
        ]);
    }

     public function test_dapat_mengambil_daftar_ruangan(): void
    {
        Sanctum::actingAs($this->adminUser);

        // Bersihkan data dulu (PENTING!)
        Ruangan::query()->delete();

        // Buat HANYA 1 ruangan
        Ruangan::factory()->create(['is_active' => 1]);

        $response = $this->getJson('/api/ruangan');

        $response->assertStatus(200)
                 ->assertJson(['status' => 'success'])
                 ->assertJsonCount(1, 'data');
    }

    public function test_tidak_dapat_membuat_ruangan_tanpa_nama(): void
    {
        Sanctum::actingAs($this->adminUser);

        $ruanganData = [
            'nama_ruangan' => '',
        ];

        $response = $this->postJson('/api/ruangan', $ruanganData);

        $response->assertStatus(422)
                 ->assertJson([
                     'status' => 'error',
                     'message' => 'Validasi gagal',
                 ])
                 ->assertJsonValidationErrors(['nama_ruangan']);
    }

    public function test_tidak_dapat_membuat_ruangan_dengan_nama_terlalu_panjang(): void
    {
        Sanctum::actingAs($this->adminUser);

        $ruanganData = [
            'nama_ruangan' => str_repeat('A', 256),
        ];

        $response = $this->postJson('/api/ruangan', $ruanganData);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['nama_ruangan']);
    }

    public function test_dapat_mengupdate_ruangan_dengan_data_valid(): void
    {
        Sanctum::actingAs($this->adminUser);

        $ruangan = Ruangan::factory()->create([
            'nama_ruangan' => 'Ruang Lama',
            'is_active' => 1,
        ]);

        $response = $this->putJson("/api/ruangan/{$ruangan->id}", [
            'nama_ruangan' => 'Ruang Baru',
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'success',
                     'message' => 'Ruangan berhasil diupdate',
                 ]);

        $this->assertDatabaseHas('ruangan', [
            'id' => $ruangan->id,
            'nama_ruangan' => 'Ruang Baru',
        ]);
    }

    public function test_tidak_dapat_mengupdate_ruangan_yang_tidak_ada(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->putJson('/api/ruangan/99999', [
            'nama_ruangan' => 'Test',
        ]);

        $response->assertStatus(404)
                 ->assertJson([
                     'status' => 'error',
                     'message' => 'Ruangan tidak ditemukan',
                 ]);
    }

    public function test_dapat_menghapus_ruangan(): void
    {
        Sanctum::actingAs($this->adminUser);

        $ruangan = Ruangan::factory()->create(['is_active' => 1]);

        $response = $this->deleteJson("/api/ruangan/{$ruangan->id}");

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'success',
                     'message' => 'Ruangan berhasil dinonaktifkan',
                 ]);

        $this->assertDatabaseHas('ruangan', [
            'id' => $ruangan->id,
            'is_active' => 0,
        ]);
    }

    public function test_tidak_dapat_menghapus_ruangan_yang_tidak_ada(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->deleteJson('/api/ruangan/99999');

        $response->assertStatus(404)
                 ->assertJson([
                     'status' => 'error',
                     'message' => 'Ruangan tidak ditemukan',
                 ]);
    }

    public function test_status_ruangan_tetap_tersedia_ketika_rapat_belum_dimulai(): void
    {
        Sanctum::actingAs($this->adminUser);

        $ruangan = Ruangan::factory()->create([
            'status' => 'tersedia',
            'is_active' => 1,
        ]);

        $today = now()->format('Y-m-d');

        Rapat::factory()->create([
            'jenis' => 'offline',
            'ruangan_id' => $ruangan->id,
            'tanggal' => $today,
            'waktu_mulai' => now()->addHours(1)->format('H:i:s'),
            'waktu_selesai' => now()->addHours(2)->format('H:i:s'),
            'is_active' => 1,
        ]);

        $response = $this->getJson('/api/ruangan');

        $response->assertStatus(200);

        $ruangan->refresh();
        $this->assertEquals('tersedia', $ruangan->status);
    }

    public function test_status_ruangan_menjadi_tersedia_setelah_rapat_selesai(): void
    {
        Sanctum::actingAs($this->adminUser);

        $ruangan = Ruangan::factory()->create([
            'status' => 'tidak_tersedia',
            'is_active' => 1,
        ]);

        $today = now()->format('Y-m-d');

        Rapat::factory()->create([
            'jenis' => 'offline',
            'ruangan_id' => $ruangan->id,
            'tanggal' => $today,
            'waktu_mulai' => now()->subHours(2)->format('H:i:s'),
            'waktu_selesai' => now()->subHours(1)->format('H:i:s'),
            'is_active' => 1,
        ]);

        $response = $this->getJson('/api/ruangan');

        $response->assertStatus(200);
        $ruangan->refresh();
        $this->assertEquals('tersedia', $ruangan->status);
    }

    public function test_status_ruangan_tidak_terpengaruh_oleh_rapat_online(): void
    {
        Sanctum::actingAs($this->adminUser);

        $ruangan = Ruangan::factory()->create([
            'status' => 'tersedia',
            'is_active' => 1,
        ]);

        $today = now()->format('Y-m-d');

        Rapat::factory()->create([
            'jenis' => 'online',
            'ruangan_id' => null,
            'tanggal' => $today,
            'waktu_mulai' => now()->subMinutes(30)->format('H:i:s'),
            'waktu_selesai' => now()->addMinutes(30)->format('H:i:s'),
            'is_active' => 1,
        ]);

        $response = $this->getJson('/api/ruangan');

        $response->assertStatus(200);
        $ruangan->refresh();
        $this->assertEquals('tersedia', $ruangan->status);
    }

    public function test_status_ruangan_tidak_terpengaruh_oleh_rapat_nonaktif(): void
    {
        Sanctum::actingAs($this->adminUser);

        $ruangan = Ruangan::factory()->create([
            'status' => 'tersedia',
            'is_active' => 1,
        ]);

        $today = now()->format('Y-m-d');

        Rapat::factory()->create([
            'jenis' => 'offline',
            'ruangan_id' => $ruangan->id,
            'tanggal' => $today,
            'waktu_mulai' => now()->subMinutes(30)->format('H:i:s'),
            'waktu_selesai' => now()->addMinutes(30)->format('H:i:s'),
            'is_active' => 0,
        ]);

        $response = $this->getJson('/api/ruangan');

        $response->assertStatus(200);
        $ruangan->refresh();
        $this->assertEquals('tersedia', $ruangan->status);
    }

    public function test_tidak_dapat_mengakses_tanpa_autentikasi(): void
    {
        $response = $this->getJson('/api/ruangan');
        $response->assertStatus(401);
    }

    public function test_tidak_dapat_membuat_ruangan_tanpa_autentikasi(): void
    {
        $response = $this->postJson('/api/ruangan', [
            'nama_ruangan' => 'Ruang Test',
        ]);
        $response->assertStatus(401);
    }

    public function test_tidak_dapat_mengupdate_ruangan_tanpa_autentikasi(): void
    {
        $ruangan = Ruangan::factory()->create();

        $response = $this->putJson("/api/ruangan/{$ruangan->id}", [
            'nama_ruangan' => 'Ruangan Diperbarui',
        ]);

        $response->assertStatus(401);
    }

    public function test_tidak_dapat_menghapus_ruangan_tanpa_autentikasi(): void
    {
        $ruangan = Ruangan::factory()->create();
        $response = $this->deleteJson("/api/ruangan/{$ruangan->id}");
        $response->assertStatus(401);
    }


   public function test_daftar_ruangan_diurutkan_berdasarkan_created_at_desc(): void
    {
        Sanctum::actingAs($this->adminUser);

        // Bersihkan data dulu (PENTING!)
        Ruangan::query()->delete();

        // Buat 3 ruangan dengan nama spesifik
        $ruangan1 = Ruangan::factory()->create([
            'nama_ruangan' => 'Ruangan 1',
            'created_at' => now()->subMinutes(3)
        ]);

        $ruangan2 = Ruangan::factory()->create([
            'nama_ruangan' => 'Ruangan 2',
            'created_at' => now()->subMinutes(2)
        ]);

        $ruangan3 = Ruangan::factory()->create([
            'nama_ruangan' => 'Ruangan 3',
            'created_at' => now()->subMinutes(1)
        ]);

        $response = $this->getJson('/api/ruangan');

        $response->assertStatus(200);

        $data = $response->json('data');

        // Yang terbaru (Ruangan 3) harus di urutan pertama
        $this->assertEquals('Ruangan 3', $data[0]['nama_ruangan']);
        $this->assertEquals('Ruangan 2', $data[1]['nama_ruangan']);
        $this->assertEquals('Ruangan 1', $data[2]['nama_ruangan']);
    }
}
