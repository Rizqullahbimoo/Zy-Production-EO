<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('penawaran_custom', function (Blueprint $table) {
            $table->text('catatan_revisi_customer')->nullable()->after('catatan_admin');
        });
    }

    public function down(): void
    {
        Schema::table('penawaran_custom', function (Blueprint $table) {
            $table->dropColumn('catatan_revisi_customer');
        });
    }
};
