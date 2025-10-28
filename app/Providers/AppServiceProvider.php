<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share('sidebarWorkers', function () {
            if (!Auth::check()) {
                return [];
            }

            return DB::table('workers')
                ->select('id', 'name')
                ->orderBy('name')
                ->get()
                ->map(static function ($worker) {
                    return [
                        'id' => $worker->id,
                        'name' => $worker->name,
                    ];
                })
                ->values()
                ->all();
        });
    }
}
