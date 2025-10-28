<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AutomationWorkerController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->validate([
            'name' => 'required_without:dni|string',
            'dni' => 'required_without:name|string',
        ]);

        $identifierColumn = array_key_exists('name', $data) ? 'name' : 'dni';
        $identifierValue = $data[$identifierColumn];

        $query = 'SELECT is_in_use FROM workers WHERE ' . $identifierColumn . ' = :identifier LIMIT 1';
        $worker = DB::select($query, ['identifier' => $identifierValue]);

        if (empty($worker)) {
            return response()->json([
                'message' => 'Worker not found',
            ], 404);
        }

        return response()->json((bool) ($worker[0]->is_in_use ?? false));
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

        $identifierColumn = array_key_exists('name', $data) ? 'name' : 'dni';
        $identifierValue = $data[$identifierColumn];

        $query = 'SELECT id, password, is_in_use, is_active FROM workers WHERE ' . $identifierColumn . ' = :identifier LIMIT 1';
        $worker = DB::select($query, ['identifier' => $identifierValue]);

        if (empty($worker)) {
            return response()->json([
                'message' => 'Worker not found',
            ], 404);
        }

        $worker = $worker[0];

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

        $updateQuery = 'UPDATE workers SET is_in_use = :is_in_use, updated_at = :updated_at WHERE id = :id';
        DB::update($updateQuery, [
            'is_in_use' => $desiredState,
            'updated_at' => Carbon::now(),
            'id' => $worker->id,
        ]);

        $updatedQuery = 'SELECT is_in_use FROM workers WHERE id = :id LIMIT 1';
        $updated = DB::select($updatedQuery, ['id' => $worker->id]);

        $updatedWorker = $updated[0] ?? null;

        return response()->json([
            'message' => $desiredState ? 'Worker marked as in use' : 'Worker released',
            'data' => [
                'is_in_use' => (bool) ($updatedWorker->is_in_use ?? false),
            ],
        ]);
    }
}
