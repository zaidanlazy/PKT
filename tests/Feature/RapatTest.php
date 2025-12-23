<?php

namespace Tests\Feature;

use App\Models\Rapat;
use App\Models\Ruangan;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Carbon\Carbon;
//use Illuminate\Foundation\Testing\RefreshDatabase;

class RapatTest extends TestCase
{

    // use RefreshDatabase;
    protected function setUp(): void
    {
        parent::setUp();

        // Fake waktu supaya validasi tanggal >= hari ini tidak error
        Carbon::setTestNow(Carbon::now());

        // Authenticate user for all tests
        $user = User::factory()->create();
        Sanctum::actingAs($user);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow(); // Reset Carbon mock
        parent::tearDown();
    }

    /** ============================================
     * 1. Tambah rapat OFFLINE
     * ============================================ */
    public function test_tambah_rapat_offline()
    {
        // Fake HTTP untuk mencegah actual API calls
        Http::fake([
            '*' => Http::response(['success' => true], 200)
        ]);

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

        // Dump database untuk debugging
        // $this->assertDatabaseCount('rapat', 1);

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
        Http::fake([
            '*' => Http::response(['success' => true], 200)
        ]);

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
        Http::fake([
            '*' => Http::response(['success' => true], 200)
        ]);

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
        Http::fake([
            '*' => Http::response(['success' => true], 200)
        ]);

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
        'ruangan_id' => $ruangan->id,
        'is_active' => true
    ]);

    $response = $this->deleteJson("/api/rapat/{$rapat->id}");

    $response->assertStatus(200);


    $this->assertDatabaseHas('rapat', [
        'id' => $rapat->id,
        'is_active' => 0,
    ]);
}

/** ============================================
 * 6. Hapus rapat ONLINE
 * ============================================ */
public function test_hapus_rapat_online()
{
    $rapat = Rapat::factory()->create([
        'jenis' => 'online',
        'link_rapat' => 'https://meet.google.com/abc',
        'is_active' => true // ← Set true dulu
    ]);

    $response = $this->deleteJson("/api/rapat/{$rapat->id}");

    $response->assertStatus(200);

    // Cek is_active jadi false (BUKAN soft delete)
    $this->assertDatabaseHas('rapat', [
        'id' => $rapat->id,
        'is_active' => 0,
    ]);
}

/** ============================================
     * 7. Tambah rapat offline dengan waktu bentrok
     * ============================================ */
    public function test_tambah_rapat_offline_waktu_bentrok()
    {
        Http::fake([
            '*' => Http::response(['success' => true], 200)
        ]);

        $ruangan = Ruangan::factory()->create();

        //Buat rapat pertama yang valid
        $rapatPertama = [
            'nama_rapat' => 'Rapat Pertama',
            'jenis' => 'offline',
            'tanggal' => Carbon::now()->format('Y-m-d'),
            'waktu_mulai' => '09:00',
            'waktu_selesai' => '11:00',
            'ruangan_id' => $ruangan->id,
            'deskripsi' => 'Rapat pertama yang valid'
        ];

        $responseFirst = $this->postJson('/api/rapat', $rapatPertama);
        $responseFirst->assertStatus(201);

        // buat rapat kedua yang bentrok
        $payload = [
            'nama_rapat' => 'Rapat Bentrok',
            'jenis' => 'offline',
            'tanggal' => now()->format('Y-m-d'),
            'waktu_mulai' => '09:00',
            'waktu_selesai' => '10:00',
            'ruangan_id' => $ruangan->id,
            'deskripsi' => 'Rapat yang seharusnya gagal'
        ];

        $response = $this->postJson('/api/rapat', $payload);

        $response->assertStatus(409)
                 ->Json([
                     'status' => 'error',
                     'message' => 'Ruangan sudah digunakan pada waktu tersebut.'
                 ]);
     }


    /** ============================================
     * 8. Melihat detail rapat offline
     * ============================================ */
    public function test_lihat_detail_rapat_offline()
    {
        Http::fake([
            '*' => Http::response(['success' => true], 200)
        ]);

        $ruangan = Ruangan::factory()->create([
            'nama_ruangan' => 'Ruang Meeting A',
        ]);

        $rapat = Rapat::factory()->create([
            'nama_rapat' => 'Rapat Koordinasi',
            'jenis' => 'offline',
            'tanggal' => Carbon::now()->format('Y-m-d'),
            'waktu_mulai' => '09:00',
            'waktu_selesai' => '11:00',
            'ruangan_id' => $ruangan->id,
            'deskripsi' => 'Rapat koordinasi bulanan',
            'is_active' => true
        ]);

        $response = $this->getJson("/api/rapat/{$rapat->id}");

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'success',
                     'data' => [
                         'id' => $rapat->id,
                         'nama_rapat' => 'Rapat Koordinasi',
                         'jenis' => 'offline',
                         'deskripsi' => 'Rapat koordinasi bulanan',
                         'ruangan' => [
                             'id' => $ruangan->id,
                             'nama_ruangan' => 'Ruang Meeting A',
                         ]
                     ]
                 ]);

        // Pastikan link_rapat null untuk rapat offline
        $this->assertNull($response->json('data.link_rapat'));
    }
}
