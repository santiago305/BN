import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Users2,
    CheckCircle,
    Activity,
    Plus,
    Filter,
    Edit3,
    Power,
    AlertCircle,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { type BreadcrumbItem } from '@/types';

type Worker = {
    id: number;
    name: string;
    is_in_use: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

type WorkerPageProps = {
    workers: Worker[];
    filters: {
        is_active: string | null;
        is_in_use: string | null;
    };
};

function isWorkerPageProps(value: unknown): value is WorkerPageProps {
    if (!value || typeof value !== 'object') return false;
    const props = value as Partial<WorkerPageProps>;
    if (!Array.isArray(props.workers)) return false;
    const filters = props.filters;
    if (!filters || typeof filters !== 'object') return false;
    return 'is_active' in filters && 'is_in_use' in filters;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Usuarios', href: '/workers' },
];

// csrf helper
function getCsrfHeaders(extra: Record<string, string> = {}): Record<string, string> {
    if (typeof document === 'undefined') {
        return { ...extra };
    }
    const token = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content');

    return {
        ...(token ? { 'X-CSRF-TOKEN': token } : {}),
        ...extra,
    };
}

export default function WorkerIndexPage({
    workers: initialWorkers,
    filters,
}: WorkerPageProps) {
    // estado local lista
    const [workers, setWorkers] = useState<Worker[]>(initialWorkers);

    // filtros (UI controlado)
    const [filterActive, setFilterActive] = useState<string>(
        filters.is_active ?? ''
    );
    const [filterInUse, setFilterInUse] = useState<string>(
        filters.is_in_use ?? ''
    );

    // modal crear
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newIsActive, setNewIsActive] = useState(true);

    // modal editar
    const [showEdit, setShowEdit] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [editIsActive, setEditIsActive] = useState(true);
    const [editIsInUse, setEditIsInUse] = useState(false);

    // toast
    const [flashMsg, setFlashMsg] = useState<string>('');

    const createDialogRef = useRef<HTMLDialogElement | null>(null);
    const editDialogRef = useRef<HTMLDialogElement | null>(null);

    // abrir/cerrar modal crear
    useEffect(() => {
        if (showCreate) createDialogRef.current?.showModal();
        else createDialogRef.current?.close();
    }, [showCreate]);

    // abrir/cerrar modal editar
    useEffect(() => {
        if (showEdit) editDialogRef.current?.showModal();
        else editDialogRef.current?.close();
    }, [showEdit]);

    // helper para refrescar lista sin recargar toda la vista inertia
    async function refreshList(optionalParams?: {
        is_active?: string;
        is_in_use?: string;
    }) {
        const params = new URLSearchParams();
        if (optionalParams?.is_active && optionalParams.is_active !== '') {
            params.set('is_active', optionalParams.is_active);
        }
        if (optionalParams?.is_in_use && optionalParams.is_in_use !== '') {
            params.set('is_in_use', optionalParams.is_in_use);
        }

        const res = await fetch(`/api/workers?${params.toString()}`);
        const data = await res.json();
        setWorkers(data);
    }

    // aplicar filtros con Inertia (para que URL quede limpia y SSR coherente)
    function applyFilters() {
        const params: Record<string, string> = {};
        if (filterActive !== '') params.is_active = filterActive;
        if (filterInUse !== '') params.is_in_use = filterInUse;

        router.get('/workers', params, {
            preserveState: true,
            onSuccess: (page) => {
                if (isWorkerPageProps(page.props)) {
                    setWorkers(page.props.workers);
                }
            },
        });
    }

    // CREAR
    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();

        const body = {
            name: newName,
            password: newPassword,
            is_in_use: false,
            is_active: newIsActive,
        };

        const res = await fetch('/api/workers', {
            method: 'POST',
            headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            setFlashMsg('Error al crear usuario');
            return;
        }

        setFlashMsg('Usuario creado');
        setShowCreate(false);
        setNewName('');
        setNewPassword('');
        setNewIsActive(true);

        await refreshList({
            is_active: filterActive,
            is_in_use: filterInUse,
        });
    }

    // abrir modal editar
    function openEditModal(w: Worker) {
        setEditId(w.id);
        setEditName(w.name);
        setEditPassword('');
        setEditIsActive(w.is_active);
        setEditIsInUse(w.is_in_use);
        setShowEdit(true);
    }

    // GUARDAR edición
    async function handleEdit(e: React.FormEvent) {
        e.preventDefault();
        if (editId == null) return;

        const body: Record<string, any> = {
            name: editName,
            is_active: editIsActive,
            is_in_use: editIsInUse,
        };

        if (editPassword.trim() !== '') {
            body.password = editPassword;
        }

        const res = await fetch(`/api/workers/${editId}`, {
            method: 'PATCH',
            headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            setFlashMsg('Error al actualizar');
            return;
        }

        setFlashMsg('Usuario actualizado');
        setShowEdit(false);

        await refreshList({
            is_active: filterActive,
            is_in_use: filterInUse,
        });
    }

    // DESACTIVAR rápido
    async function handleDeactivate(id: number) {
        const res = await fetch(`/api/workers/${id}`, {
            method: 'DELETE',
            headers: getCsrfHeaders(),
        });

        if (!res.ok) {
            setFlashMsg('No se pudo desactivar');
            return;
        }

        setFlashMsg('Usuario desactivado');
        await refreshList({
            is_active: filterActive,
            is_in_use: filterInUse,
        });
    }

    // Toggle is_in_use
    async function toggleInUse(w: Worker) {
        const res = await fetch(`/api/workers/${w.id}/in-use`, {
            method: 'PATCH',
            headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ is_in_use: !w.is_in_use }),
        });

        if (!res.ok) {
            setFlashMsg('Error al actualizar estado de uso');
            return;
        }

        setFlashMsg('Estado de uso actualizado');
        await refreshList({
            is_active: filterActive,
            is_in_use: filterInUse,
        });
    }

    const total = workers.length;
    const activeCount = workers.filter((w) => w.is_active).length;
    const inUseCount = workers.filter((w) => w.is_in_use).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios - Admin" />

            {/* Top header */}
            <div className="flex flex-col gap-2 px-4 pt-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                        Usuarios
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Gestión de cuentas internas y estado de uso.
                    </p>
                </div>

                <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
                >
                    <Plus className="h-4 w-4" />
                    <span>Nuevo usuario</span>
                </button>
            </div>

            <div className="flex flex-1 flex-col gap-6 p-4">

                {/* KPI cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Total */}
                    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <p className="flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                    <Users2 className="h-3.5 w-3.5" />
                                    Total usuarios
                                </p>
                                <div className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                                    {total}
                                </div>
                            </div>
                            <span className="rounded-lg bg-neutral-100 px-2 py-1 text-[10px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                {total === 1 ? '1 cuenta' : total + ' cuentas'}
                            </span>
                        </div>
                    </div>

                    {/* Activos */}
                    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-green-600/10 dark:stroke-green-400/10" />
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <p className="flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Activos
                                </p>
                                <div className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                                    {activeCount}
                                </div>
                            </div>
                            <span className="rounded-lg bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                {activeCount} activos
                            </span>
                        </div>
                    </div>

                    {/* En uso ahora */}
                    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-yellow-500/10 dark:stroke-yellow-400/10" />
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <p className="flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                    <Activity className="h-3.5 w-3.5" />
                                    En uso ahora
                                </p>
                                <div className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                                    {inUseCount}
                                </div>
                            </div>
                            <span className="rounded-lg bg-yellow-100 px-2 py-1 text-[10px] font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                                {inUseCount} en uso
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="grid gap-4 sm:grid-cols-2 lg:flex lg:flex-row">
                            <div className="flex flex-col text-sm">
                                <label className="font-medium text-neutral-700 dark:text-neutral-200">
                                    Activo
                                </label>
                                <select
                                    className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                    value={filterActive}
                                    onChange={(e) => setFilterActive(e.target.value)}
                                >
                                    <option value="">Todos</option>
                                    <option value="1">Solo activos</option>
                                    <option value="0">Solo inactivos</option>
                                </select>
                            </div>

                            <div className="flex flex-col text-sm">
                                <label className="font-medium text-neutral-700 dark:text-neutral-200">
                                    En uso
                                </label>
                                <select
                                    className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                    value={filterInUse}
                                    onChange={(e) => setFilterInUse(e.target.value)}
                                >
                                    <option value="">Todos</option>
                                    <option value="1">En uso</option>
                                    <option value="0">Libre</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={applyFilters}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Aplicar filtros</span>
                        </button>
                    </div>
                </section>

                {/* Tabla */}
                <section className="relative min-h-[50vh] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                    <div className="absolute inset-0 pointer-events-none">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/5 dark:stroke-neutral-100/5" />
                    </div>

                    <div className="relative z-10 overflow-x-auto">
                        <table className="min-w-full text-left text-sm text-neutral-800 dark:text-neutral-100">
                            <thead className="bg-neutral-50 text-[11px] font-semibold uppercase tracking-wide text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Usuario</th>
                                    <th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3">Uso</th>
                                    <th className="px-4 py-3">Creado</th>
                                    <th className="px-4 py-3">Actualizado</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                {workers.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-10 text-center text-neutral-500 dark:text-neutral-400"
                                        >
                                            No se encontraron usuarios
                                        </td>
                                    </tr>
                                )}

                                {workers.map((w) => (
                                    <tr
                                        key={w.id}
                                        className={
                                            w.is_active
                                                ? 'bg-white dark:bg-neutral-900'
                                                : 'bg-neutral-50 dark:bg-neutral-800/40'
                                        }
                                    >
                                        <td className="px-4 py-3 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                                            {w.id}
                                        </td>

                                        <td className="px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                            {w.name}
                                        </td>

                                        <td className="px-4 py-3">
                                            {w.is_active ? (
                                                <span className="inline-flex items-center gap-1 rounded-lg bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Inactivo
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => toggleInUse(w)}
                                                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold ${
                                                    w.is_in_use
                                                        ? 'border-yellow-600 bg-yellow-100 text-yellow-700 dark:border-yellow-400 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                        : 'border-neutral-400 bg-neutral-100 text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                                                }`}
                                            >
                                                <Activity className="h-3 w-3" />
                                                {w.is_in_use ? 'En uso' : 'Libre'}
                                            </button>
                                        </td>

                                        <td className="px-4 py-3 text-[11px] text-neutral-500 dark:text-neutral-400">
                                            {w.created_at}
                                        </td>
                                        <td className="px-4 py-3 text-[11px] text-neutral-500 dark:text-neutral-400">
                                            {w.updated_at}
                                        </td>

                                        <td className="px-4 py-3 text-right text-xs">
                                            <button
                                                onClick={() => openEditModal(w)}
                                                className="mr-2 inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 font-semibold text-white shadow-sm hover:bg-blue-700"
                                            >
                                                <Edit3 className="h-3.5 w-3.5" />
                                                Editar
                                            </button>

                                            <button
                                                onClick={() => handleDeactivate(w.id)}
                                                className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1 font-semibold text-white shadow-sm hover:bg-red-700"
                                            >
                                                <Power className="h-3.5 w-3.5" />
                                                Desactivar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* toast flotante */}
                    {flashMsg && (
                        <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-xl bg-neutral-900/90 px-4 py-2 text-xs font-medium text-white shadow-xl backdrop-blur dark:bg-neutral-100/90 dark:text-neutral-900">
                            {flashMsg}
                        </div>
                    )}
                </section>
            </div>

            {/* MODAL CREAR */}
            <dialog
                ref={createDialogRef}
                className="w-full max-w-sm rounded-2xl border border-neutral-300 bg-white shadow-2xl backdrop:bg-black/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                onClose={() => setShowCreate(false)}
            >
                <form
                    onSubmit={handleCreate}
                    className="flex flex-col"
                >
                    {/* header */}
                    <div className="flex items-start justify-between border-b border-neutral-200 p-4 dark:border-neutral-700">
                        <div>
                            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                                Nuevo usuario
                            </h2>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Crea credenciales de acceso internas
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowCreate(false)}
                            className="rounded-lg px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                        >
                            ✕
                        </button>
                    </div>

                    {/* body */}
                    <div className="flex flex-col gap-4 p-4 text-sm">
                        <div className="flex flex-col gap-1">
                            <label className="font-medium text-neutral-700 dark:text-neutral-200">
                                Nombre
                            </label>
                            <input
                                className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-medium text-neutral-700 dark:text-neutral-200">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={4}
                            />
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                Se almacenará con hash (bcrypt).
                            </span>
                        </div>

                        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-neutral-300 text-green-600 focus:ring-green-500 dark:border-neutral-600"
                                checked={newIsActive}
                                onChange={(e) => setNewIsActive(e.target.checked)}
                            />
                            <span className="text-neutral-700 dark:text-neutral-200">
                                Usuario activo
                            </span>
                        </label>
                    </div>

                    {/* footer */}
                    <div className="flex items-center justify-end gap-2 border-t border-neutral-200 p-4 dark:border-neutral-700">
                        <button
                            type="button"
                            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
                            onClick={() => setShowCreate(false)}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </dialog>

            {/* MODAL EDITAR */}
            <dialog
                ref={editDialogRef}
                className="w-full max-w-sm rounded-2xl border border-neutral-300 bg-white shadow-2xl backdrop:bg-black/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                onClose={() => setShowEdit(false)}
            >
                <form
                    onSubmit={handleEdit}
                    className="flex flex-col"
                >
                    {/* header */}
                    <div className="flex items-start justify-between border-b border-neutral-200 p-4 dark:border-neutral-700">
                        <div>
                            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                                Editar usuario
                            </h2>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Actualiza datos de acceso y estado
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowEdit(false)}
                            className="rounded-lg px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                        >
                            ✕
                        </button>
                    </div>

                    {/* body */}
                    <div className="flex flex-col gap-4 p-4 text-sm">
                        <div className="flex flex-col gap-1">
                            <label className="font-medium text-neutral-700 dark:text-neutral-200">
                                Nombre
                            </label>
                            <input
                                className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-medium text-neutral-700 dark:text-neutral-200">
                                Nueva contraseña (opcional)
                            </label>
                            <input
                                type="password"
                                className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                minLength={4}
                            />
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                Déjalo vacío si no quieres cambiarla.
                            </span>
                        </div>

                        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-neutral-300 text-green-600 focus:ring-green-500 dark:border-neutral-600"
                                checked={editIsActive}
                                onChange={(e) => setEditIsActive(e.target.checked)}
                            />
                            <span className="text-neutral-700 dark:text-neutral-200">
                                Usuario activo
                            </span>
                        </label>

                        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-neutral-300 text-yellow-600 focus:ring-yellow-500 dark:border-neutral-600"
                                checked={editIsInUse}
                                onChange={(e) => setEditIsInUse(e.target.checked)}
                            />
                            <span className="text-neutral-700 dark:text-neutral-200">
                                En uso actualmente
                            </span>
                        </label>
                    </div>

                    {/* footer */}
                    <div className="flex items-center justify-end gap-2 border-t border-neutral-200 p-4 dark:border-neutral-700">
                        <button
                            type="button"
                            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
                            onClick={() => setShowEdit(false)}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Guardar cambios
                        </button>
                    </div>
                </form>
            </dialog>
        </AppLayout>
    );
}
