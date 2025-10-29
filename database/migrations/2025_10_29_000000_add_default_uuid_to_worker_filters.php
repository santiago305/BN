<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
        DB::statement('ALTER TABLE worker_filters ALTER COLUMN id SET DEFAULT gen_random_uuid();');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE worker_filters ALTER COLUMN id DROP DEFAULT;');
    }
};
