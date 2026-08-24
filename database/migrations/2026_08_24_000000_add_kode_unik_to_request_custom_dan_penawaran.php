<?php

use App\Support\KodeGenerator;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('request_custom_paket', function (Blueprint $table) {
            $table->string('kode_request')->nullable()->unique()->after('id_request');
        });

        Schema::table('penawaran_custom', function (Blueprint $table) {
            $table->string('kode_penawaran')->nullable()->unique()->after('id_penawaran');
        });

        // Backfill kode unik untuk baris yang sudah ada, supaya tidak ada request/
        // penawaran custom yang masih diidentifikasi lewat id auto-increment mentah
        // (mis. "REQ-005") seperti sebelumnya — sekarang setara dengan kode_pemesanan
        // di alur paket bawaan (PMS-xxxxxx-yymmdd), hanya beda prefix.
        DB::table('request_custom_paket')->orderBy('id_request')->get(['id_request'])->each(function ($row) {
            DB::table('request_custom_paket')->where('id_request', $row->id_request)->update([
                'kode_request' => KodeGenerator::buat('CST'),
            ]);
        });

        DB::table('penawaran_custom')->orderBy('id_penawaran')->get(['id_penawaran'])->each(function ($row) {
            DB::table('penawaran_custom')->where('id_penawaran', $row->id_penawaran)->update([
                'kode_penawaran' => KodeGenerator::buat('PNW'),
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('request_custom_paket', function (Blueprint $table) {
            $table->dropColumn('kode_request');
        });

        Schema::table('penawaran_custom', function (Blueprint $table) {
            $table->dropColumn('kode_penawaran');
        });
    }
};
