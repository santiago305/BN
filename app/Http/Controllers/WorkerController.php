<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Carbon\Carbon;

class WorkerController extends Controller
{
    /**
     * indexPage
     * Renderiza la vista Inertia con la tabla, filtros, etc.
     * Esta es la pantalla principal del módulo Workers.
     *
     * - GET /workers
     */
    public function indexPage(Request $request)
    {
        // Construimos las mismas condiciones que el index API para que la tabla pueda venir filtrada
        $conditions = [];
        $params = [];

        if ($request->has('is_active') && $request->input('is_active') !== '') {
            $conditions[] = 'is_active = ?';
            $params[] = $request->boolean('is_active');
        }

        if ($request->has('is_in_use') && $request->input('is_in_use') !== '') {
            $conditions[] = 'is_in_use = ?';
            $params[] = $request->boolean('is_in_use');
        }

        $sql = 'SELECT id, name, is_in_use, is_active, created_at, updated_at FROM workers';
        if (count($conditions) > 0) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }
        $sql .= ' ORDER BY id ASC';

        $workers = DB::select($sql, $params);
        $workers = $this->normalizeWorkers($workers);

        return Inertia::render('worker/index', [
            'workers' => $workers,
            'filters' => [
                'is_active' => $request->input('is_active', null),
                'is_in_use' => $request->input('is_in_use', null),
            ],
        ]);
    }

    /**
     * index (API)
     * Devuelve todos los workers como JSON.
     * GET /api/workers
     *
     * Soporta filtros opcionales:
     *  - ?is_active=1/0
     *  - ?is_in_use=1/0
     */
    public function index(Request $request)
    {
        $conditions = [];
        $params = [];

        if ($request->has('is_active') && $request->input('is_active') !== '') {
            $conditions[] = 'is_active = ?';
            $params[] = $request->boolean('is_active');
        }

        if ($request->has('is_in_use') && $request->input('is_in_use') !== '') {
            $conditions[] = 'is_in_use = ?';
            $params[] = $request->boolean('is_in_use');
        }

        $sql = 'SELECT id, name, is_in_use, is_active, created_at, updated_at FROM workers';
        if (count($conditions) > 0) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }
        $sql .= ' ORDER BY id ASC';

        $workers = DB::select($sql, $params);

        return response()->json($this->normalizeWorkers($workers));
    }

    /**
     * show (API)
     * Devuelve un worker por id.
     * GET /api/workers/{id}
     */
    public function show($id)
    {
        $worker = DB::select(
            'SELECT id, name, is_in_use, is_active, created_at, updated_at
             FROM workers
             WHERE id = ?
             LIMIT 1',
            [$id]
        );

        if (count($worker) === 0) {
            return response()->json(['message' => 'Worker not found'], 404);
        }

        return response()->json($this->normalizeWorker($worker[0]));
        }

    /**
     * store (API)
     * Crea un nuevo worker.
     * POST /api/workers
     *
     * Campos:
     * - name (required)
     * - password (required)
     * - is_in_use (optional, default false)
     * - is_active (optional, default true)
     *
     * Importante:
     *  - Guardamos password con Hash::make()
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'password' => 'required|string|min:4',
            'is_in_use' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
        ]);

        $name = $request->input('name');
        $hashedPassword = Hash::make($request->input('password'));
        $isInUse = $request->boolean('is_in_use', false);
        $isActive = $request->boolean('is_active', true);
        $now = Carbon::now();

        DB::insert(
            'INSERT INTO workers (name, password, is_in_use, is_active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)',
            [
                $name,
                $hashedPassword,
                $isInUse,
                $isActive,
                $now,
                $now,
            ]
        );

        $id = DB::getPdo()->lastInsertId();

        $created = DB::select(
            'SELECT id, name, is_in_use, is_active, created_at, updated_at
             FROM workers
             WHERE id = ?
             LIMIT 1',
            [$id]
        );

        return response()->json([
            'message' => 'Worker created successfully',
            'data' => $this->normalizeWorker($created[0] ?? null),
        ], 201);
    }

    /**
     * update (API)
     * Actualiza datos de un worker existente.
     * PUT/PATCH /api/workers/{id}
     *
     * Campos aceptados:
     * - name
     * - password (si llega, se rehashea)
     * - is_in_use
     * - is_active
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'password' => 'sometimes|string|min:4',
            'is_in_use' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
        ]);

        $worker = DB::select('SELECT id, is_active, is_in_use FROM workers WHERE id = ? LIMIT 1', [$id]);
        if (count($worker) === 0) {
            return response()->json(['message' => 'Worker not found'], 404);
        }

        $current = $worker[0];
        $currentIsActive = (bool) ($current->is_active ?? false);
        $currentIsInUse = (bool) ($current->is_in_use ?? false);

        $newIsActive = $request->has('is_active')
            ? $request->boolean('is_active')
            : $currentIsActive;

        $newIsInUse = $request->has('is_in_use')
            ? $request->boolean('is_in_use')
            : $currentIsInUse;

        if ($newIsActive === false) {
            $newIsInUse = false;
        }

        $fields = [];
        $params = [];

        if ($request->has('name')) {
            $fields[] = 'name = ?';
            $params[] = $request->input('name');
        }

        if ($request->has('password')) {
            $fields[] = 'password = ?';
            $params[] = Hash::make($request->input('password'));
        }

        if ($request->has('is_in_use') || $newIsInUse !== $currentIsInUse) {
            $fields[] = 'is_in_use = ?';
            $params[] = $newIsInUse;
        }

        if ($request->has('is_active') || $newIsActive !== $currentIsActive) {
            $fields[] = 'is_active = ?';
            $params[] = $newIsActive;
        }

        // siempre actualizamos updated_at
        $fields[] = 'updated_at = ?';
        $params[] = Carbon::now();

        // id para el WHERE
        $params[] = $id;

        if (count($fields) === 1) { // solo updated_at => nada útil por actualizar
            return response()->json(['message' => 'No fields to update'], 400);
        }

        $sql = 'UPDATE workers SET ' . implode(', ', $fields) . ' WHERE id = ?';
        DB::update($sql, $params);

        $updated = DB::select(
            'SELECT id, name, is_in_use, is_active, created_at, updated_at
             FROM workers
             WHERE id = ?
             LIMIT 1',
            [$id]
        );

        return response()->json([
            'message' => 'Worker updated successfully',
            'data' => $this->normalizeWorker($updated[0] ?? null),
        ]);
    }

    /**
     * destroy (API)
     * Desactiva lógicamente al worker (is_active = 0).
     * DELETE /api/workers/{id}
     *
     * Esto NO borra la fila.
     */
    public function destroy($id)
    {
        $exists = DB::select('SELECT id FROM workers WHERE id = ? LIMIT 1', [$id]);
        if (count($exists) === 0) {
            return response()->json(['message' => 'Worker not found'], 404);
        }

         DB::update(
            'UPDATE workers
             SET is_active = ?, is_in_use = ?, updated_at = ?
             WHERE id = ?',
            [false, false, Carbon::now(), $id]
        );

        $updated = DB::select(
            'SELECT id, name, is_in_use, is_active, created_at, updated_at
             FROM workers
             WHERE id = ?
             LIMIT 1',
            [$id]
        );

        return response()->json([
            'message' => 'Worker deactivated (is_active = 0)',
            'data' => $this->normalizeWorker($updated[0] ?? null),
        ]);
    }

    /**
     * markInUse (API)
     * Marca si el worker está siendo usado por la automatización.
     * PATCH /api/workers/{id}/in-use
     *
     * Campo:
     * - is_in_use (boolean)
     */
    public function markInUse(Request $request, $id)
    {
        $request->validate([
            'is_in_use' => 'required|boolean',
        ]);

        $worker = DB::select('SELECT id, is_active FROM workers WHERE id = ? LIMIT 1', [$id]);
        if (count($worker) === 0) {
            return response()->json(['message' => 'Worker not found'], 404);
        }

        if ((bool) ($worker[0]->is_active ?? false) === false) {
            return response()->json([
                'message' => 'Worker is inactive and cannot change usage status',
            ], 409);
        }

        DB::update(
            'UPDATE workers
             SET is_in_use = ?, updated_at = ?
             WHERE id = ?',
            [
                $request->boolean('is_in_use'),
                Carbon::now(),
                $id,
            ]
        );

        $updated = DB::select(
            'SELECT id, name, is_in_use, is_active, created_at, updated_at
             FROM workers
             WHERE id = ?
             LIMIT 1',
            [$id]
        );

        return response()->json([
            'message' => 'Worker usage status updated',
            'data' => $this->normalizeWorker($updated[0] ?? null),
        ]);

    }

    /**
     * Convierte los flags booleanos de un registro individual a bool nativo.
     */
    private function normalizeWorker($worker)
    {
        if ($worker === null) {
            return null;
        }

        $worker->is_in_use = (bool) $worker->is_in_use;
        $worker->is_active = (bool) $worker->is_active;

        return $worker;
    }

    /**
     * Normaliza un arreglo de registros de workers.
     */
    private function normalizeWorkers(array $workers): array
    {
        return array_map(fn ($worker) => $this->normalizeWorker($worker), $workers);
    }
}
