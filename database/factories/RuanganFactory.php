<?php

namespace Database\Factories;

use App\Models\Ruangan;
use Illuminate\Database\Eloquent\Factories\Factory;

class RuanganFactory extends Factory
{
    protected $model = Ruangan::class;

    public function definition()
    {
        return [
            'nama_ruangan' => fake()->name(),
            'status' => 'tersedia',
            'is_active' => true,
        ];
    }
}
