<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->unsignedBigInteger('id_user')->autoIncrement()->primary();
            $table->string('nama');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('no_hp', 20)->nullable();
            $table->enum('role', ['admin', 'user'])->default('user');
            $table->timestamps(); // created_at & updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};