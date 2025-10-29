<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

        Schema::create('filters_config', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('name');

            // Horarios de funcionamiento detallados por día (lunes a domingo)
            // Ejemplo:
            // {
            //     "monday": {"start": "08:00", "end": "17:00"},
            //     "tuesday": {"start": "00:00", "end": "00:00"}, // no se trabaja
            //     "wednesday": {"start": "08:00", "end": "17:00"},
            //     "thursday": {"start": "08:00", "end": "17:00"},
            //     "friday": {"start": "08:00", "end": "17:00"},
            //     "saturday": {"start": "08:00", "end": "14:00"},
            //     "sunday": {"start": "00:00", "end": "00:00"} // no se trabaja
            // }
            $table->json('working_hours');

            $table->enum('captcha_type', ['cloudflare', 'recaptcha'])->default('recaptcha');
            $table->unsignedInteger('relogin_interval')->default(5);
            $table->string('filter_url');
            $table->boolean('search_without_results')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('filters_config');
    }
};
