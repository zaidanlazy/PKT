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
        Schema::create('ruangan', function (Blueprint $table) {
            $table->id();
            $table->string('nama_ruangan');
            $table->string('lokasi');
            $table->text('fasilitas')->nullable();
            $table->enum('status', ['tersedia', 'tidak_tersedia'])->default('tersedia');
            $table->boolean('is_active')->default(1)->after('status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('ruangan', function (Blueprint $table) {
        $table->dropColumn(['status', 'is_active']);
   });
}
