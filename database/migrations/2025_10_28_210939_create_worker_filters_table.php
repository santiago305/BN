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

        Schema::create('worker_filters', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('worker_id');
            $table->uuid('filter_config_id');

            $table->foreign('worker_id')
                ->references('id')
                ->on('workers')
                ->cascadeOnDelete();

            $table->foreign('filter_config_id')
                ->references('id')
                ->on('filters_config')
                ->cascadeOnDelete();

            $table->timestamps();

            $table->unique(['worker_id', 'filter_config_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('worker_filters');
    }
};
