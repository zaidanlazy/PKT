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
        Schema::create('undangan_rapats', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('rapat_id');
            $table->unsignedBigInteger('user_id');
            $table->enum('status', ['pending', 'accepted', 'declined'])->default('pending');
            $table->text('pesan_undangan')->nullable();
            $table->timestamp('dibaca_at')->nullable();
            $table->timestamp('direspon_at')->nullable();
            $table->timestamps();
            
            // Foreign key constraints
            $table->foreign('rapat_id')->references('id')->on('rapat')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Unique constraint to prevent duplicate invitations
            $table->unique(['rapat_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('undangan_rapats');
    }
};
