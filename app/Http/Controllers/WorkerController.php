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
        // Obtener los parámetros de la solicitud
        $isActive = $request->input('is_active');
        $isInUse = $request->input('is_in_use');

        // Construir la consulta SQL
        $query = "SELECT id, name, is_active, is_in_use FROM workers WHERE 1=1";

        // Filtrar por estado activo si se proporciona
        if ($isActive !== null) {
            $query .= " AND is_active = :isActive";
        }

        // Filtrar por uso si se proporciona
        if ($isInUse !== null) {
            $query .= " AND is_in_use = :isInUse";
        }

        // Ejecutar la consulta con parámetros
        $workers = DB::select($query, [
            ':isActive' => $isActive,
            ':isInUse' => $isInUse
        ]);

        // Obtener la información de paginación si es necesario (esto es un ejemplo simple)
        $totalWorkers = DB::table('workers')->count();

        // Devolver la respuesta en formato JSON
        return response()->json([
            'data' => $workers,
            'meta' => [
                'total' => $totalWorkers
            ],
            'stats' => [
                'active_workers' => DB::table('workers')->where('is_active', 1)->count(),
                'in_use_workers' => DB::table('workers')->where('is_in_use', 1)->count()
            ],
        ]);
    }

    /**
     * show (API)
     * Devuelve un worker por id.
     * GET /api/workers/{id}
     */
    public function show($id)
    {
        $worker = DB::table('workers')
            ->select('id', 'name', 'dni', 'is_in_use', 'is_active', 'created_at', 'updated_at')
            ->where('id', $id)
            ->first();

        if ($worker === null) {
            return response()->json(['message' => 'Worker not found'], 404);
        }

        return response()->json($this->normalizeWorker($worker));
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

        DB::table('workers')->insert([
            'id' => $id,
            'name' => $request->input('name'),
            'dni' => $request->input('dni'),
            'password' => Hash::make($request->input('password')),
            'is_in_use' => $request->boolean('is_in_use', false),
            'is_active' => $request->boolean('is_active', true),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $created = DB::table('workers')
            ->select('id', 'name', 'dni', 'is_in_use', 'is_active', 'created_at', 'updated_at')
            ->where('id', $id)
            ->first();

        return response()->json([
            'message' => 'Worker created successfully',
            'data' => $this->normalizeWorker($created),
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
        $worker = DB::table('workers')
            ->select('id', 'is_active', 'is_in_use')
            ->where('id', $id)
            ->first();

        if ($worker === null) {
            return response()->json(['message' => 'Worker not found'], 404);
        }

        // La lógica de actualización sigue igual, pero ahora los datos ya están validados
        $fields = [];
        if ($request->has('name')) {
            $fields['name'] = $request->input('name');
        }

        if ($request->has('dni')) {
            $fields['dni'] = $request->input('dni');
        }

        if ($request->has('password')) {
            $fields['password'] = Hash::make($request->input('password'));
        }

        if ($request->has('is_in_use')) {
            $fields['is_in_use'] = $request->boolean('is_in_use');
        }

        if ($request->has('is_active')) {
            $fields['is_active'] = $request->boolean('is_active');
        }

        if (empty($fields)) {
            return response()->json(['message' => 'No fields to update'], 400);
        }

        $fields['updated_at'] = Carbon::now();

        DB::table('workers')
            ->where('id', $id)
            ->update($fields);

        $updated = DB::table('workers')
            ->select('id', 'name', 'dni', 'is_in_use', 'is_active', 'created_at', 'updated_at')
            ->where('id', $id)
            ->first();

        return response()->json([
            'message' => 'Worker updated successfully',
            'data' => $this->normalizeWorker($updated),
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
        $exists = DB::table('workers')
            ->select('id')
            ->where('id', $id)
            ->first();

        if ($exists === null) {
            return response()->json(['message' => 'Worker not found'], 404);
        }

        DB::table('workers')
            ->where('id', $id)
            ->update([
                'is_active' => false,
                'is_in_use' => false,
                'updated_at' => Carbon::now(),
            ]);

        $updated = DB::table('workers')
            ->select('id', 'name', 'dni', 'is_in_use', 'is_active', 'created_at', 'updated_at')
            ->where('id', $id)
            ->first();

        return response()->json([
            'message' => 'Worker deactivated (is_active = 0)',
            'data' => $this->normalizeWorker($updated),
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
        $worker = DB::table('workers')
            ->select('id', 'is_active')
            ->where('id', $id)
            ->first();

        if ($worker === null) {
            return response()->json(['message' => 'Worker not found'], 404);
        }

        if ((bool) ($worker->is_active ?? false) === false) {
            return response()->json([
                'message' => 'Worker is inactive and cannot change usage status',
            ], 409);
        }

        DB::table('workers')
            ->where('id', $id)
            ->update([
                'is_in_use' => $request->boolean('is_in_use'),
                'updated_at' => Carbon::now(),
            ]);

        $updated = DB::table('workers')
            ->select('id', 'name', 'dni', 'is_in_use', 'is_active', 'created_at', 'updated_at')
            ->where('id', $id)
            ->first();

        return response()->json([
            'message' => 'Worker usage status updated',
            'data' => $this->normalizeWorker($updated),
        ]);

    }

    private function getWorkerListing(Request $request): array
    {
        $perPage = 20;
        $page = max(1, (int) $request->input('page', 1));

        $query = $this->filteredWorkersQuery($request);

        $total = (clone $query)->count();
        $lastPage = max(1, (int) ceil($total / $perPage));
        $page = min($page, $lastPage);
        $offset = ($page - 1) * $perPage;

        $workers = (clone $query)
            ->select('id', 'name', 'dni', 'is_in_use', 'is_active', 'created_at', 'updated_at')
            ->orderBy('name')
            ->offset($offset)
            ->limit($perPage)
            ->get()
            ->map(fn ($worker) => $this->normalizeWorker($worker))
            ->values()
            ->all();

        $statsRow = (clone $query)
            ->selectRaw('COUNT(*) as total')
            ->selectRaw('SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active')
            ->selectRaw('SUM(CASE WHEN is_in_use THEN 1 ELSE 0 END) as in_use')
            ->first();

        $stats = [
            'total' => (int) ($statsRow->total ?? 0),
            'active' => (int) ($statsRow->active ?? 0),
            'inUse' => (int) ($statsRow->in_use ?? 0),
        ];

        return [
            'workers' => $workers,
            'meta' => [
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => $lastPage,
            ],
            'stats' => $stats,
        ];
    }

    private function filteredWorkersQuery(Request $request)
    {
        $query = DB::table('workers');

        if ($request->has('is_active') && $request->input('is_active') !== '') {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('is_in_use') && $request->input('is_in_use') !== '') {
            $query->where('is_in_use', $request->boolean('is_in_use'));
        }

        return $query;
    }

    /**
     * Convierte los flags booleanos de un registro individual a bool nativo.
     */
    private function normalizeWorker($worker)
    {
        if ($worker === null) {
            return null;
        }

        return WorkerNormalizer::normalize($worker);
    }

    /**
     * Normaliza un arreglo de registros de workers.
     */
    private function normalizeWorkers(array $workers): array
    {
        return WorkerNormalizer::normalizeMany($workers);
    }
}
