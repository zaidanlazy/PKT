<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rapat', function (Blueprint $table) {
            $table->string('link_rapat')->nullable()->after('jenis');
        });
    }

    public function down(): void
    {
        Schema::table('rapat', function (Blueprint $table) {
            $table->dropColumn('link_rapat');
        });
    }
};
