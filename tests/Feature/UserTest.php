<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $adminUser;

    /**
     * Setup untuk setiap test - buat user admin untuk authentication
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Buat user admin untuk authentication dengan Sanctum
        $this->adminUser = User::factory()->create([
            'role' => 'admin',
            'is_active' => 1,
            'password' => Hash::make('password'),
        ]);
    }

    /**
     * @test
     * Dapat melihat daftar user
     */
    public function dapat_melihat_daftar_user(): void
    {
        // Arrange: Login sebagai admin
        Sanctum::actingAs($this->adminUser);

        // Buat beberapa user aktif
        User::factory()->count(3)->create(['is_active' => 1]);

        // Buat user tidak aktif (seharusnya tidak muncul)
        User::factory()->create(['is_active' => 0]);

        // Act: Panggil endpoint
        $response = $this->getJson('/api/users');

        // Assert: Periksa response (4 user aktif: 3 factory + 1 admin)
        $response->assertStatus(200)
                 ->assertJsonCount(4);
    }

    /**
     * @test
     * Dapat membuat user baru dengan data valid
     */
    public function dapat_membuat_user_baru_dengan_data_valid(): void
    {
        // Arrange: Login sebagai admin
        Sanctum::actingAs($this->adminUser);

        // Siapkan data user
        $userData = [
            'mpk' => 'MPK12345',
            'nama' => 'John Doe',
            'email' => 'john@example.com',
            'unit_kerja' => 'IT Department',
            'no_telp' => '081234567890',
            'password' => 'password123',
            'role' => 'user',
        ];

        // Act: Kirim request POST
        $response = $this->postJson('/api/users', $userData);

        // Assert: Periksa response dan database
        $response->assertStatus(201)
                 ->assertJson([
                     'status' => 'success',
                     'message' => 'User berhasil ditambahkan',
                 ])
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => [
                         'id',
                         'mpk',
                         'nama',
                         'email',
                         'unit_kerja',
                         'no_telp',
                         'role',
                     ]
                 ]);

        $this->assertDatabaseHas('users', [
            'mpk' => 'MPK12345',
            'email' => 'john@example.com',
        ]);

        // Pastikan password di-hash
        $user = User::where('email', 'john@example.com')->first();
        $this->assertTrue(Hash::check('password123', $user->password));
    }

    /**
     * @test
     * Tidak dapat membuat user dengan data tidak valid
     */
    public function tidak_dapat_membuat_user_dengan_data_tidak_valid(): void
    {
        // Arrange: Login sebagai admin
        Sanctum::actingAs($this->adminUser);

        // Data tidak lengkap
        $userData = [
            'mpk' => '',
            'email' => 'invalid-email',
            'password' => '123', // Terlalu pendek
        ];

        // Act: Kirim request POST
        $response = $this->postJson('/api/users', $userData);

        // Assert: Harus gagal validasi
        $response->assertStatus(422)
                 ->assertJson([
                     'status' => 'error',
                     'message' => 'Validasi gagal',
                 ])
                 ->assertJsonValidationErrors(['mpk', 'nama', 'email', 'unit_kerja', 'password', 'role']);
    }

    /**
     * @test
     * Tidak dapat membuat user dengan MPK atau email yang sudah ada
     */
    public function tidak_dapat_membuat_user_dengan_mpk_atau_email_duplikat(): void
    {
        // Arrange: Login sebagai admin
        Sanctum::actingAs($this->adminUser);

        // Buat user existing
        $existingUser = User::factory()->create([
            'mpk' => 'MPK99999',
            'email' => 'existing@example.com',
        ]);

        // Act: Coba buat user dengan MPK yang sama
        $response = $this->postJson('/api/users', [
            'mpk' => 'MPK99999',
            'nama' => 'Test User',
            'email' => 'newemail@example.com',
            'unit_kerja' => 'IT',
            'password' => 'password123',
            'role' => 'user',
        ]);

        // Assert: Harus gagal
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['mpk']);

        // Act: Coba buat user dengan email yang sama
        $response = $this->postJson('/api/users', [
            'mpk' => 'MPK88888',
            'nama' => 'Test User',
            'email' => 'existing@example.com',
            'unit_kerja' => 'IT',
            'password' => 'password123',
            'role' => 'user',
        ]);

        // Assert: Harus gagal
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    /**
     * @test
     * Dapat mengupdate user dengan data valid
     */
    public function dapat_mengupdate_user_dengan_data_valid(): void
    {
        // Arrange: Login sebagai admin
        Sanctum::actingAs($this->adminUser);

        // Buat user
        $user = User::factory()->create([
            'mpk' => 'MPK11111',
            'nama' => 'Old Name',
            'email' => 'old@example.com',
        ]);

        // Act: Update user
        $response = $this->putJson("/api/users/{$user->id}", [
            'mpk' => 'MPK11111',
            'nama' => 'New Name',
            'email' => 'new@example.com',
            'unit_kerja' => 'New Department',
            'no_telp' => '081234567890',
            'role' => 'admin',
        ]);

        // Assert: Periksa response dan database
        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'success',
                     'message' => 'User berhasil diupdate',
                 ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'nama' => 'New Name',
            'email' => 'new@example.com',
            'role' => 'admin',
        ]);
    }

    /**
     * @test
     * Tidak dapat mengupdate user yang tidak ada
     */
    public function tidak_dapat_mengupdate_user_yang_tidak_ada(): void
    {
        // Arrange: Login sebagai admin
        Sanctum::actingAs($this->adminUser);

        // Act: Update user dengan ID yang tidak ada
        $response = $this->putJson('/api/users/99999', [
            'mpk' => 'MPK11111',
            'nama' => 'Test',
            'email' => 'test@example.com',
            'unit_kerja' => 'IT',
            'role' => 'user',
        ]);

        // Assert: Harus return 404
        $response->assertStatus(404)
                 ->assertJson([
                     'status' => 'error',
                     'message' => 'User tidak ditemukan',
                 ]);
    }

    /**
     * @test
     * Dapat mengupdate user dengan MPK dan email yang sama
     */
    public function dapat_mengupdate_user_dengan_mpk_dan_email_yang_sama(): void
    {
        // Arrange: Login sebagai admin
        Sanctum::actingAs($this->adminUser);

        // Buat user
        $user = User::factory()->create([
            'mpk' => 'MPK11111',
            'email' => 'user@example.com',
        ]);

        // Act: Update dengan MPK dan email yang sama
        $response = $this->putJson("/api/users/{$user->id}", [
            'mpk' => 'MPK11111',
            'nama' => 'Updated Name',
            'email' => 'user@example.com',
            'unit_kerja' => 'IT',
            'role' => 'user',
        ]);

        // Assert: Harus berhasil
        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'success',
                 ]);
    }

    /**
     * @test
     * Dapat menghapus user
     */
    public function dapat_menghapus_user(): void
    {
        // Arrange: Login sebagai admin
        Sanctum::actingAs($this->adminUser);

        // Buat user
        $user = User::factory()->create(['is_active' => 1]);

        // Act: Hapus user
        $response = $this->deleteJson("/api/users/{$user->id}");

        // Assert: Periksa response dan database
        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'success',
                     'message' => 'User berhasil dihapus',
                 ]);

        // Periksa apakah is_active menjadi false (soft delete)
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'is_active' => 0,
        ]);
    }

    /**
     * @test
     * Tidak dapat menghapus user yang tidak ada
     */
    public function tidak_dapat_menghapus_user_yang_tidak_ada(): void
    {
        // Arrange: Login sebagai admin
        Sanctum::actingAs($this->adminUser);

        // Act: Hapus user dengan ID yang tidak ada
        $response = $this->deleteJson('/api/users/99999');

        // Assert: Harus return 404
        $response->assertStatus(404)
                 ->assertJson([
                     'status' => 'error',
                     'message' => 'User tidak ditemukan',
                 ]);
    }

    /**
     * @test
     * Role harus berupa user atau admin
     */
    public function role_harus_berupa_user_atau_admin(): void
    {
        // Arrange: Login sebagai admin
        Sanctum::actingAs($this->adminUser);

        // Act: Coba buat user dengan role invalid
        $response = $this->postJson('/api/users', [
            'mpk' => 'MPK12345',
            'nama' => 'Test User',
            'email' => 'test@example.com',
            'unit_kerja' => 'IT',
            'password' => 'password123',
            'role' => 'superadmin', // Role tidak valid
        ]);

        // Assert: Harus gagal validasi
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['role']);
    }

    /**
     * @test
     * Tidak dapat mengakses tanpa autentikasi
     */
    public function tidak_dapat_mengakses_tanpa_autentikasi(): void
    {
        // Act: Coba akses tanpa authentication
        $response = $this->getJson('/api/users');

        // Assert: Harus return 401 Unauthorized
        $response->assertStatus(401);
    }

    /**
     * @test
     * Tidak dapat membuat user tanpa autentikasi
     */
    public function tidak_dapat_membuat_user_tanpa_autentikasi(): void
    {
        // Act: Coba create user tanpa authentication
        $response = $this->postJson('/api/users', [
            'mpk' => 'MPK12345',
            'nama' => 'Test User',
            'email' => 'test@example.com',
            'unit_kerja' => 'IT',
            'password' => 'password123',
            'role' => 'user',
        ]);

        // Assert: Harus return 401 Unauthorized
        $response->assertStatus(401);
    }
}
