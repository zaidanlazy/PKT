<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ruangan', function (Blueprint $table) {
            // Cek apakah kolom is_active belum ada
            if (!Schema::hasColumn('ruangan', 'is_active')) {
                $table->boolean('is_active')->default(true);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ruangan', function (Blueprint $table) {
            // Cek apakah kolom is_active ada sebelum drop
            if (Schema::hasColumn('ruangan', 'is_active')) {
                $table->dropColumn('is_active');
            }
        });
    }
};
