<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\WorkerNormalizer;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AutomationWorkerController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('workers')
            ->select('id', 'name', 'dni', 'is_in_use', 'is_active', 'created_at', 'updated_at')
            ->orderBy('name');

        if ($request->filled('name')) {
            $query->where('name', $request->input('name'));
        }

        if ($request->filled('dni')) {
            $query->where('dni', $request->input('dni'));
        }

        $workers = $query->get();

        if (($request->filled('name') || $request->filled('dni')) && $workers->isEmpty()) {
            return response()->json([
                'message' => 'Worker not found',
            ], 404);
        }

        return response()->json([
            'data' => WorkerNormalizer::normalizeMany($workers->all()),
        ]);
    }

    public function updateUsage(Request $request)
    {
        $data = $request->validate([
            'name' => 'required_without:dni|string',
            'dni' => 'required_without:name|string',
            'password' => 'required|string',
            'is_in_use' => 'required|boolean',
            'force' => 'sometimes|boolean',
        ]);

        $workerQuery = DB::table('workers')
            ->select('id', 'name', 'dni', 'password', 'is_in_use', 'is_active', 'created_at', 'updated_at');

        if (!empty($data['name'] ?? null)) {
            $workerQuery->where('name', $data['name']);
        } else {
            $workerQuery->where('dni', $data['dni']);
        }

        $worker = $workerQuery->first();

        if ($worker === null) {
            return response()->json([
                'message' => 'Worker not found',
            ], 404);
        }

        if (!Hash::check($data['password'], $worker->password)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        $desiredState = (bool) $data['is_in_use'];
        $isActive = (bool) ($worker->is_active ?? false);
        $isCurrentlyInUse = (bool) ($worker->is_in_use ?? false);
        $force = isset($data['force']) ? (bool) $data['force'] : false;

        if ($desiredState && !$isActive) {
            return response()->json([
                'message' => 'Worker is inactive and cannot be marked as in use',
            ], 409);
        }

        if ($desiredState && $isCurrentlyInUse && !$force) {
            return response()->json([
                'message' => 'Worker is already in use',
            ], 409);
        }

        DB::table('workers')
            ->where('id', $worker->id)
            ->update([
                'is_in_use' => $desiredState,
                'updated_at' => Carbon::now(),
            ]);

        $updated = DB::table('workers')
            ->select('id', 'name', 'dni', 'is_in_use', 'is_active', 'created_at', 'updated_at')
            ->where('id', $worker->id)
            ->first();

        return response()->json([
            'message' => $desiredState ? 'Worker marked as in use' : 'Worker released',
            'data' => WorkerNormalizer::normalize($updated),
        ]);
    }
}
