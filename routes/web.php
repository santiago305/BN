<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\AuthLandingController;
use App\Http\Controllers\WorkerController;

Route::get('/', AuthLandingController::class)->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // -----------------------------------------------------------------
    // VISTA (Inertia) PRINCIPAL DE WORKERS
    // -----------------------------------------------------------------
    Route::get('/workers', [WorkerController::class, 'indexPage'])
        ->name('workers.indexPage');

    Route::get('/workers/{worker}', [WorkerController::class, 'showPage'])
        ->name('workers.show');
    // -----------------------------------------------------------------
    // API Workers
    // -----------------------------------------------------------------
    Route::get('/api/workers', [WorkerController::class, 'index']);
    Route::get('/api/workers/{id}', [WorkerController::class, 'show']);
    Route::post('/api/workers', [WorkerController::class, 'store']);
    Route::put('/api/workers/{id}', [WorkerController::class, 'update']);
    Route::patch('/api/workers/{id}', [WorkerController::class, 'update']);
    Route::delete('/api/workers/{id}', [WorkerController::class, 'destroy']);
    Route::patch('/api/workers/{id}/in-use', [WorkerController::class, 'markInUse']);
});

require __DIR__.'/settings.php';
