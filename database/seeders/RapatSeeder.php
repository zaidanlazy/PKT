<?php

namespace Database\Seeders;

use App\Models\Rapat;
use App\Models\Ruangan;
use Illuminate\Database\Seeder;

class RapatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get available rooms
        $ruanganTersedia = Ruangan::where('status', 'tersedia')->get();
        
        $rapatData = [
            [
                'nama_rapat' => 'Rapat Bulanan Tim',
                'jenis' => 'online',
                'tanggal' => now()->addDays(1)->format('Y-m-d'),
                'waktu_mulai' => '09:00',
                'waktu_selesai' => '11:00',
                'ruangan_id' => null,
                'deskripsi' => 'Rapat evaluasi bulanan tim',
                'status' => 'terjadwal'
            ],
            [
                'nama_rapat' => 'Rapat Koordinasi Proyek',
                'jenis' => 'offline',
                'tanggal' => now()->addDays(2)->format('Y-m-d'),
                'waktu_mulai' => '14:00',
                'waktu_selesai' => '16:00',
                'ruangan_id' => $ruanganTersedia->first()?->id,
                'deskripsi' => 'Koordinasi proyek pengembangan sistem',
                'status' => 'terjadwal'
            ],
            [
                'nama_rapat' => 'Rapat Review Kinerja',
                'jenis' => 'online',
                'tanggal' => now()->addDays(3)->format('Y-m-d'),
                'waktu_mulai' => '10:00',
                'waktu_selesai' => '12:00',
                'ruangan_id' => null,
                'deskripsi' => 'Review kinerja triwulan',
                'status' => 'terjadwal'
            ],
            [
                'nama_rapat' => 'Rapat Training',
                'jenis' => 'offline',
                'tanggal' => now()->addDays(5)->format('Y-m-d'),
                'waktu_mulai' => '08:00',
                'waktu_selesai' => '17:00',
                'ruangan_id' => $ruanganTersedia->skip(1)->first()?->id,
                'deskripsi' => 'Training teknologi terbaru',
                'status' => 'terjadwal'
            ],
            [
                'nama_rapat' => 'Rapat Strategi Bisnis',
                'jenis' => 'online',
                'tanggal' => now()->addDays(7)->format('Y-m-d'),
                'waktu_mulai' => '13:00',
                'waktu_selesai' => '15:00',
                'ruangan_id' => null,
                'deskripsi' => 'Perencanaan strategi bisnis tahun depan',
                'status' => 'terjadwal'
            ]
        ];

        foreach ($rapatData as $rapat) {
            Rapat::create($rapat);
        }
    }
}