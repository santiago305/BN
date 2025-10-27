<?php

use App\Http\Controllers\Api\AutomationWorkerController;
use Illuminate\Support\Facades\Route;

Route::prefix('automation')->group(function () {
    Route::get('workers', [AutomationWorkerController::class, 'index']);
    Route::post('workers/usage', [AutomationWorkerController::class, 'updateUsage']);
});
