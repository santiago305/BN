<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FiltersConfigSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $workingHours = [
            'monday' => ['start' => '17:00', 'end' => '18:00'],
            'tuesday' => ['start' => '17:00', 'end' => '18:00'],
            'wednesday' => ['start' => '17:00', 'end' => '18:00'],
            'thursday' => ['start' => '17:00', 'end' => '18:00'],
            'friday' => ['start' => '17:00', 'end' => '18:00'],
            'saturday' => ['start' => '17:00', 'end' => '18:00'],
            'sunday' => ['start' => '00:00', 'end' => '00:00'],
        ];

        $now = Carbon::now();
        $workingHoursJson = json_encode($workingHours);

        $filters = [
            [
                'id' => (string) Str::uuid(),
                'name' => 'buscar',
                'working_hours' => $workingHoursJson,
                'captcha_type' => 'cloudflare',
                'relogin_interval' => 5,
                'filter_url' => 'https://www.google.com',
                'search_without_results' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'ingresar',
                'working_hours' => $workingHoursJson,
                'captcha_type' => 'cloudflare',
                'relogin_interval' => 5,
                'filter_url' => 'https://example.com/ingresar',
                'search_without_results' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'registrar',
                'working_hours' => $workingHoursJson,
                'captcha_type' => 'cloudflare',
                'relogin_interval' => 5,
                'filter_url' => 'https://example.com/registrar',
                'search_without_results' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'dni',
                'working_hours' => $workingHoursJson,
                'captcha_type' => 'cloudflare',
                'relogin_interval' => 5,
                'filter_url' => 'https://example.com/dni',
                'search_without_results' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('filters_config')->insert($filters);
    }
}
