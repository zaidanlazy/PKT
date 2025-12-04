<?php

namespace Tests\Feature;

use App\Models\Rapat;
use App\Models\Ruangan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Carbon\Carbon;

class RapatTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Fake waktu supaya validasi tanggal >= hari ini tidak error
        Carbon::setTestNow(Carbon::now());

        // Authenticate user for all tests
        $user = User::factory()->create();
        Sanctum::actingAs($user);
    }

    /** ============================================
     * 1. Tambah rapat OFFLINE
     * ============================================ */
    public function test_tambah_rapat_offline()
    {
        Http::fake(); // block API WA

        $ruangan = Ruangan::factory()->create();

        $payload = [
            'nama_rapat' => 'Rapat offline',
            'jenis' => 'offline',
            'tanggal' => Carbon::now()->format('Y-m-d'),
            'waktu_mulai' => '09:00',
            'waktu_selesai' => '10:00',
            'ruangan_id' => $ruangan->id,
            'deskripsi' => 'Deskripsi rapat'
        ];

        $response = $this->postJson('/api/rapat', $payload);

        $response->assertStatus(201)
                 ->assertJson(['status' => 'success']);

        $this->assertDatabaseHas('rapat', [
            'nama_rapat' => 'Rapat offline',
            'jenis' => 'offline',
            'ruangan_id' => $ruangan->id,
        ]);
    }

    /** ============================================
     * 2. Tambah rapat ONLINE
     * ============================================ */
    public function test_tambah_rapat_online()
    {
        Http::fake();

        $payload = [
            'nama_rapat' => 'Rapat Online',
            'jenis' => 'online',
            'tanggal' => Carbon::now()->format('Y-m-d'),
            'waktu_mulai' => '09:00',
            'waktu_selesai' => '10:00',
            'link_rapat' => 'https://meet.google.com/abc',
            'deskripsi' => 'Rapat via Google Meet'
        ];

        $response = $this->postJson('/api/rapat', $payload);

        $response->assertStatus(201);

        $this->assertDatabaseHas('rapat', [
            'nama_rapat' => 'Rapat Online',
            'jenis' => 'online',
            'link_rapat' => 'https://meet.google.com/abc'
        ]);
    }

    /** ============================================
     * 3. Edit rapat OFFLINE (ubah ruangan)
     * ============================================ */
    public function test_edit_rapat_offline()
    {
        Http::fake();

        $ruangan1 = Ruangan::factory()->create();
        $ruangan2 = Ruangan::factory()->create();

        $rapat = Rapat::factory()->create([
            'jenis' => 'offline',
            'ruangan_id' => $ruangan1->id,
            'tanggal' => now()->format('Y-m-d'),
            'waktu_mulai' => '09:00',
            'waktu_selesai' => '10:00'
        ]);

        $payload = [
            'nama_rapat' => 'Rapat Edit Offline',
            'jenis' => 'offline',
            'tanggal' => now()->format('Y-m-d'),
            'waktu_mulai' => '10:00',
            'waktu_selesai' => '11:00',
            'ruangan_id' => $ruangan2->id,
        ];

        $response = $this->putJson("/api/rapat/{$rapat->id}", $payload);

        $response->assertStatus(200);

        $this->assertDatabaseHas('rapat', [
            'id' => $rapat->id,
            'ruangan_id' => $ruangan2->id
        ]);
    }

    /** ============================================
     * 4. Edit rapat ONLINE (ubah link)
     * ============================================ */
    public function test_edit_rapat_online()
    {
        Http::fake();

        $rapat = Rapat::factory()->create([
            'jenis' => 'online',
            'link_rapat' => 'https://meet.google.com/old',
            'tanggal' => now()->format('Y-m-d'),
            'waktu_mulai' => '09:00',
            'waktu_selesai' => '10:00'
        ]);

        $payload = [
            'nama_rapat' => 'Rapat Update Online',
            'jenis' => 'online',
            'tanggal' => now()->format('Y-m-d'),
            'waktu_mulai' => '11:00',
            'waktu_selesai' => '12:00',
            'link_rapat' => 'https://meet.google.com/new'
        ];

        $response = $this->putJson("/api/rapat/{$rapat->id}", $payload);

        $response->assertStatus(200);

        $this->assertDatabaseHas('rapat', [
            'id' => $rapat->id,
            'link_rapat' => 'https://meet.google.com/new'
        ]);
    }

    /** ============================================
     * 5. Hapus rapat OFFLINE
     * ============================================ */
    public function test_hapus_rapat_offline()
    {
        $ruangan = Ruangan::factory()->create();

        $rapat = Rapat::factory()->create([
            'jenis' => 'offline',
            'ruangan_id' => $ruangan->id
        ]);

        $response = $this->deleteJson("/api/rapat/{$rapat->id}");

        $response->assertStatus(200);

        // If using soft deletes, use assertSoftDeleted instead
        $this->assertSoftDeleted('rapat', [
            'id' => $rapat->id
        ]);
    }

    /** ============================================
     * 6. Hapus rapat ONLINE
     * ============================================ */
    public function test_hapus_rapat_online()
    {
        $rapat = Rapat::factory()->create([
            'jenis' => 'online',
            'link_rapat' => 'https://meet.google.com/abc'
        ]);

        $response = $this->deleteJson("/api/rapat/{$rapat->id}");

        $response->assertStatus(200);

        // If using soft deletes, use assertSoftDeleted instead
        $this->assertSoftDeleted('rapat', [
            'id' => $rapat->id
        ]);
    }
}
