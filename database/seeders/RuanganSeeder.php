<?php

namespace Database\Seeders;

use App\Models\Ruangan;
use Illuminate\Database\Seeder;

class RuanganSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ruanganData = [
            [
                'nama_ruangan' => 'Ruang Meeting A',
                'kapasitas' => 20,
                'lokasi' => 'Lantai 1',
                'fasilitas' => 'AC, Proyektor, Whiteboard, Sound System',
                'status' => 'tersedia'
            ],
            [
                'nama_ruangan' => 'Ruang Meeting B',
                'kapasitas' => 15,
                'lokasi' => 'Lantai 2',
                'fasilitas' => 'AC, Proyektor, Whiteboard',
                'status' => 'tersedia'
            ],
            [
                'nama_ruangan' => 'Ruang Rapat Besar',
                'kapasitas' => 50,
                'lokasi' => 'Lantai 3',
                'fasilitas' => 'AC, Proyektor, Sound System, Microphone, Video Conference',
                'status' => 'tidak_tersedia'
            ],
            [
                'nama_ruangan' => 'Ruang Diskusi',
                'kapasitas' => 8,
                'lokasi' => 'Lantai 1',
                'fasilitas' => 'AC, Whiteboard',
                'status' => 'tersedia'
            ],
            [
                'nama_ruangan' => 'Ruang Training',
                'kapasitas' => 30,
                'lokasi' => 'Lantai 2',
                'fasilitas' => 'AC, Proyektor, Whiteboard, Laptop, Sound System',
                'status' => 'tersedia'
            ]
        ];

        foreach ($ruanganData as $ruangan) {
            Ruangan::create($ruangan);
        }
    }
}