<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserTest extends TestCase
{
    use DatabaseTransactions; // ✅ BUKAN RefreshDatabase

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        // NPK UNIK → tidak pernah duplicate
        $adminNpk = 'ADMIN_' . Str::uuid();

        $this->adminUser = User::factory()->create([
            'role' => 'admin',
            'npk' => $adminNpk,
            'nama' => 'Administrator',
            'email' => 'admin_' . Str::uuid() . '@test.com',
            'unit_kerja' => 'TI',
            'no_telp' => '081234567890',
            'is_active' => 1,
            'password' => Hash::make('admin123'),
        ]);
    }


    /** @test */
    public function dapat_membuat_user_baru_dengan_data_valid(): void
    {
        Sanctum::actingAs($this->adminUser);

        $payload = [
            'npk' => 'USR_' . Str::uuid(),
            'nama' => 'John Doe',
            'email' => 'john_' . Str::uuid() . '@test.com',
            'unit_kerja' => 'IT',
            'no_telp' => '081234567890',
            'password' => 'password123',
            'role' => 'user',
        ];

        $response = $this->postJson('/api/users', $payload);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'status' => 'success',
                'email' => $payload['email'],
            ]);

        $this->assertDatabaseHas('users', [
            'npk' => $payload['npk'],
            'email' => $payload['email'],
        ]);
    }

    /** @test */
    public function tidak_dapat_membuat_user_dengan_data_tidak_valid(): void
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson('/api/users', [
            'npk' => '',
            'email' => 'salah',
            'password' => '123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'npk',
                'nama',
                'email',
                'unit_kerja',
                'password',
                'role',
            ]);
    }

    /** @test */
    public function tidak_dapat_membuat_user_dengan_npk_duplikat(): void
    {
        Sanctum::actingAs($this->adminUser);

        $npk = 'DUP_' . Str::uuid();

        User::factory()->create([
            'npk' => $npk,
            'email' => 'old_' . Str::uuid() . '@test.com',
        ]);

        $response = $this->postJson('/api/users', [
            'npk' => $npk,
            'nama' => 'New',
            'email' => 'new_' . Str::uuid() . '@test.com',
            'unit_kerja' => 'IT',
            'password' => 'password123',
            'role' => 'user',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['npk']);
    }

    /** @test */
    public function dapat_mengupdate_user(): void
    {
        Sanctum::actingAs($this->adminUser);

        $user = User::factory()->create();

        $response = $this->putJson("/api/users/{$user->id}", [
            'npk' => $user->npk,
            'nama' => 'Updated',
            'email' => 'updated_' . Str::uuid() . '@test.com',
            'unit_kerja' => 'IT',
            'role' => 'admin',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'role' => 'admin',
        ]);
    }

    /** @test */
    public function dapat_menghapus_user(): void
    {
        Sanctum::actingAs($this->adminUser);

        $user = User::factory()->create([
            'is_active' => 1,
        ]);

        $response = $this->deleteJson("/api/users/{$user->id}");

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'is_active' => 0,
        ]);
    }

    /** @test */
    public function tidak_dapat_akses_tanpa_login(): void
    {
        $this->getJson('/api/users')->assertStatus(401);
        $this->postJson('/api/users', [])->assertStatus(401);
    }
}
