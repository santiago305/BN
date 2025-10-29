<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateFilterConfigRequest;
use App\Models\FilterConfig;
use App\Models\Worker;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class FilterConfigController extends Controller
{
    public function index(): JsonResponse
    {
        $filters = FilterConfig::with(['workers' => function ($query) {
            $query->select('workers.id', 'workers.name');
        }])->orderBy('name')->get();

        return response()->json([
            'data' => $filters->map(fn (FilterConfig $filter) => $this->formatFilterConfig($filter))->all(),
            'worker_options' => $this->getWorkerOptions(),
        ]);
    }

    public function show(FilterConfig $filterConfig): JsonResponse
    {
        $filterConfig->loadMissing(['workers' => function ($query) {
            $query->select('workers.id', 'workers.name');
        }]);

        return response()->json([
            'data' => $this->formatFilterConfig($filterConfig),
            'worker_options' => $this->getWorkerOptions(),
        ]);
    }

    public function update(UpdateFilterConfigRequest $request, FilterConfig $filterConfig): JsonResponse
    {
        $validated = $request->validated();
        $workerIds = $validated['worker_ids'] ?? null;
        unset($validated['worker_ids']);

        DB::transaction(function () use ($filterConfig, $validated, $workerIds) {
            $filterConfig->fill($validated);
            $filterConfig->save();

            if ($workerIds !== null) {
                $filterConfig->workers()->sync($workerIds);
            }
        });

        $filterConfig->load(['workers' => function ($query) {
            $query->select('workers.id', 'workers.name');
        }]);

        return response()->json([
            'message' => 'Filter config updated successfully',
            'data' => $this->formatFilterConfig($filterConfig),
            'worker_options' => $this->getWorkerOptions(),
        ]);
    }

    private function formatFilterConfig(FilterConfig $filterConfig): array
    {
        return [
            'id' => $filterConfig->id,
            'name' => $filterConfig->name,
            'working_hours' => $filterConfig->working_hours,
            'captcha_type' => $filterConfig->captcha_type,
            'relogin_interval' => $filterConfig->relogin_interval,
            'filter_url' => $filterConfig->filter_url,
            'search_without_results' => $filterConfig->search_without_results,
            'workers' => $filterConfig->workers->map(fn ($worker) => [
                'id' => $worker->id,
                'name' => $worker->name,
            ])->values()->all(),
            'worker_ids' => $filterConfig->workers->pluck('id')->values()->all(),
        ];
    }

    private function getWorkerOptions(): array
    {
        return Worker::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get()
            ->map(fn (Worker $worker) => [
                'id' => $worker->id,
                'name' => $worker->name,
            ])->all();
    }
}
