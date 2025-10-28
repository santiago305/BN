<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\StoreWorkerRequest;
use App\Http\Requests\UpdateWorkerRequest;
use App\Http\Requests\UpdateWorkerUsageRequest;
use App\Support\WorkerNormalizer;
use Illuminate\Support\Str;
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
        $listing = $this->getWorkerListing($request);

        return Inertia::render('worker/index', [
            'workers' => $listing['workers'],
            'pagination' => $listing['meta'],
            'stats' => $listing['stats'],
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
        $listing = $this->getWorkerListing($request);

        return response()->json([
            'data' => $listing['workers'],
            'meta' => $listing['meta'],
            'stats' => $listing['stats'],
        ]);
    }

    /**
     * show (API)
     * Devuelve un worker por id.
     * GET /api/workers/{id}
     */
    public function show($id)
    {
        $worker = DB::select('
            SELECT id, name, dni, is_in_use, is_active
            FROM workers
            WHERE id = :id
        ', ['id' => $id]);

        if (empty($worker)) {
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
    public function store(StoreWorkerRequest $request)
    {
        // No es necesario validar los datos ya que se ha hecho en RequestWorker
        $now = Carbon::now();
        $id = (string) Str::uuid();

        // Insertar el nuevo trabajador
        DB::insert('
            INSERT INTO workers (id, name, dni, password, is_in_use, is_active, created_at, updated_at)
            VALUES (:id, :name, :dni, :password, :is_in_use, :is_active, :created_at, :updated_at)
        ', [
            'id' => $id,
            'name' => $request->input('name'),
            'dni' => $request->input('dni'),
            'password' => Hash::make($request->input('password')),
            'is_in_use' => $request->boolean('is_in_use', false),
            'is_active' => $request->boolean('is_active', true),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Obtener el trabajador recién insertado
        $worker = DB::select('
            SELECT id, name, dni, is_in_use, is_active, created_at, updated_at
            FROM workers
            WHERE id = :id
        ', ['id' => $id]);

        if (empty($worker)) {
            return response()->json(['message' => 'Worker not found'], 404);
        }

        return response()->json([
            'message' => 'Worker created successfully',
            'data' => $this->normalizeWorker($worker[0]),
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
    public function update(UpdateWorkerRequest $request, $id)
    {
        // Verificar si el trabajador existe
        $worker = DB::select('
            SELECT id, is_active, is_in_use
            FROM workers
            WHERE id = :id
        ', ['id' => $id]);

        if (empty($worker)) {
            return response()->json(['message' => 'Worker not found'], 404);
        }

        // Construir dinámicamente los campos a actualizar
        $fields = [];
        $updateFields = [];

        // Recorrer el request y agregar los campos que están presentes
        foreach ($request->only(['name', 'dni', 'password', 'is_in_use', 'is_active']) as $key => $value) {
            if ($key == 'password') {
                // Si es el campo password, hashearlo antes de añadirlo
                $fields[$key] = Hash::make($value);
            } else {
                $fields[$key] = $value;
            }
        }

        // Si no hay campos para actualizar, devolver error
        if (empty($fields)) {
            return response()->json(['message' => 'No fields to update'], 400);
        }

        // Añadir el campo updated_at
        $fields['updated_at'] = Carbon::now();

        // Preparar la consulta de actualización
        $updateQuery = 'UPDATE workers SET ';
        $updateFields = [];
        foreach ($fields as $key => $value) {
            $updateFields[] = "$key = :$key";
        }
        $updateQuery .= implode(', ', $updateFields) . ' WHERE id = :id';

        // Ejecutar la consulta de actualización
        DB::update($updateQuery, array_merge($fields, ['id' => $id]));

        // Obtener el trabajador actualizado
        $updatedWorker = DB::select('
            SELECT id, name, dni, is_in_use, is_active, created_at, updated_at
            FROM workers
            WHERE id = :id
        ', ['id' => $id]);

        return response()->json([
            'message' => 'Worker updated successfully',
            'data' => $this->normalizeWorker($updatedWorker[0]),
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
        // Verificar si el trabajador existe
        $worker = DB::select('
            SELECT id
            FROM workers
            WHERE id = :id
        ', ['id' => $id]);

        if (empty($worker)) {
            return response()->json(['message' => 'Worker not found'], 404);
        }

        // Actualizar los campos is_active e is_in_use
        DB::update('
            UPDATE workers
            SET is_active = :is_active, is_in_use = :is_in_use, updated_at = :updated_at
            WHERE id = :id
        ', [
            'is_active' => false,
            'is_in_use' => false,
            'updated_at' => Carbon::now(),
            'id' => $id
        ]);

        // Obtener el trabajador actualizado
        $updatedWorker = DB::select('
            SELECT id, name, dni, is_in_use, is_active, created_at, updated_at
            FROM workers
            WHERE id = :id
        ', ['id' => $id]);

        return response()->json([
            'message' => 'Worker deactivated (is_active = 0)',
            'data' => $this->normalizeWorker($updatedWorker[0]),
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
    public function markInUse(UpdateWorkerUsageRequest $request, $id)
    {
        // Verificar si el trabajador existe y si está activo
        $worker = DB::select('
            SELECT id, is_active
            FROM workers
            WHERE id = :id
        ', ['id' => $id]);

        if (empty($worker)) {
            return response()->json(['message' => 'Worker not found'], 404);
        }

        // Si el trabajador está inactivo, no se puede cambiar el estado de uso
        if (!$worker[0]->is_active) {
            return response()->json([
                'message' => 'Worker is inactive and cannot change usage status',
            ], 409);
        }

        // Actualizar el estado de uso del trabajador
        DB::update('
            UPDATE workers
            SET is_in_use = :is_in_use, updated_at = :updated_at
            WHERE id = :id
        ', [
            'is_in_use' => $request->boolean('is_in_use'),
            'updated_at' => Carbon::now(),
            'id' => $id,
        ]);

        // Obtener el trabajador actualizado
        $updatedWorker = DB::select('
            SELECT id, name, dni, is_in_use, is_active, created_at, updated_at
            FROM workers
            WHERE id = :id
        ', ['id' => $id]);

        return response()->json([
            'message' => 'Worker usage status updated',
            'data' => $this->normalizeWorker($updatedWorker[0]),
        ]);
    }

    private function filteredWorkersQuery(Request $request)
    {
        // Construir la consulta base en SQL
        $query = 'SELECT * FROM workers WHERE 1=1';

        // Parámetros para bind
        $parameters = [];

        // Filtro por 'is_active'
        if ($request->has('is_active') && $request->input('is_active') !== '') {
            $query .= ' AND is_active = :is_active';
            $parameters['is_active'] = $request->boolean('is_active');
        }

        // Filtro por 'is_in_use'
        if ($request->has('is_in_use') && $request->input('is_in_use') !== '') {
            $query .= ' AND is_in_use = :is_in_use';
            $parameters['is_in_use'] = $request->boolean('is_in_use');
        }

        // Ejecutar la consulta con los parámetros bind
        $results = DB::select($query, $parameters);

        return $results;
    }

    /**
     * Convierte los flags booleanos de un registro individual a bool nativo.
     */
    private function normalizeWorker($worker)
    {
        return $worker ? WorkerNormalizer::normalize($worker) : null;
    }

    /**
     * Normaliza un arreglo de registros de workers.
     */
    private function normalizeWorkers(array $workers): array
    {
        return WorkerNormalizer::normalizeMany($workers);
    }
    private function getWorkerListing(Request $request): array
    {
        $perPage = (int) $request->input('per_page', 10);
        if ($perPage <= 0) {
            $perPage = 10;
        }

        $requestedPage = (int) $request->input('page', 1);
        if ($requestedPage <= 0) {
            $requestedPage = 1;
        }

        $baseQuery = DB::table('workers')
            ->select('id', 'name', 'dni', 'is_in_use', 'is_active', 'created_at', 'updated_at');

        if ($request->has('is_active') && $request->input('is_active') !== '') {
            $baseQuery->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('is_in_use') && $request->input('is_in_use') !== '') {
            $baseQuery->where('is_in_use', $request->boolean('is_in_use'));
        }

        $filteredQuery = clone $baseQuery;
        $totalFiltered = $filteredQuery->count();

        $lastPage = max(1, (int) ceil($totalFiltered / $perPage));
        $currentPage = min($requestedPage, $lastPage);

        $workers = $baseQuery
            ->orderByDesc('created_at')
            ->offset(($currentPage - 1) * $perPage)
            ->limit($perPage)
            ->get();

        $allWorkersQuery = DB::table('workers');
        $totalWorkers = (clone $allWorkersQuery)->count();
        $activeWorkers = (clone $allWorkersQuery)->where('is_active', true)->count();
        $inUseWorkers = (clone $allWorkersQuery)->where('is_in_use', true)->count();

        return [
            'workers' => $this->normalizeWorkers($workers->all()),
            'meta' => [
                'total' => $totalFiltered,
                'per_page' => $perPage,
                'current_page' => $currentPage,
                'last_page' => $lastPage,
            ],
            'stats' => [
                'total' => $totalWorkers,
                'active' => $activeWorkers,
                'inUse' => $inUseWorkers,
            ],
        ];
    }
}
