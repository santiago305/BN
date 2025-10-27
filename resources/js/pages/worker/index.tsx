import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';

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

type PageProps = {
    workers: Worker[];
    filters: {
        is_active: string | null;
        is_in_use: string | null;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuarios',
        href: '/workers',
    },
];

export default function WorkerIndexPage({ workers: initialWorkers, filters }: PageProps) {
    // estado local
    const [workers, setWorkers] = useState<Worker[]>(initialWorkers);

    // filtros
    const [filterActive, setFilterActive] = useState<string>(filters.is_active ?? '');
    const [filterInUse, setFilterInUse] = useState<string>(filters.is_in_use ?? '');

    // modal crear
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newIsActive, setNewIsActive] = useState(true);

    // modal editar
    const [showEdit, setShowEdit] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editPassword, setEditPassword] = useState(''); // opcional
    const [editIsActive, setEditIsActive] = useState(true);
    const [editIsInUse, setEditIsInUse] = useState(false);

    // feedback simple
    const [flashMsg, setFlashMsg] = useState<string>('');

    const createDialogRef = useRef<HTMLDialogElement | null>(null);
    const editDialogRef = useRef<HTMLDialogElement | null>(null);

    // abrir/cerrar modal crear
    useEffect(() => {
        if (showCreate) {
            createDialogRef.current?.showModal();
        } else {
            createDialogRef.current?.close();
        }
    }, [showCreate]);

    // abrir/cerrar modal editar
    useEffect(() => {
        if (showEdit) {
            editDialogRef.current?.showModal();
        } else {
            editDialogRef.current?.close();
        }
    }, [showEdit]);

    // helper para refrescar la lista desde /api/workers sin recargar toda la página
    async function refreshList(optionalParams?: { is_active?: string; is_in_use?: string }) {
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

    // aplicar filtros recargando la página Inertia (para mantener filtros en URL/SSR)
    function applyFilters() {
        const params: Record<string, string> = {};
        if (filterActive !== '') params.is_active = filterActive;
        if (filterInUse !== '') params.is_in_use = filterInUse;

        router.get('/workers', params, {
            preserveState: true,
            onSuccess: (page) => {
                const p = page.props as PageProps;
                setWorkers(p.workers);
            },
        });
    }

    // CREAR worker
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            setFlashMsg('Error creating worker');
            return;
        }

        setFlashMsg('Worker created');
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            setFlashMsg('Error updating worker');
            return;
        }

        setFlashMsg('Worker updated');
        setShowEdit(false);

        await refreshList({
            is_active: filterActive,
            is_in_use: filterInUse,
        });
    }

    // DESACTIVAR (is_active = 0)
    async function handleDeactivate(id: number) {
        const res = await fetch(`/api/workers/${id}`, {
            method: 'DELETE',
        });

        if (!res.ok) {
            setFlashMsg('Error deactivating worker');
            return;
        }

        setFlashMsg('Worker deactivated');
        await refreshList({
            is_active: filterActive,
            is_in_use: filterInUse,
        });
    }

    // Toggle rápido de is_in_use desde la tabla
    async function toggleInUse(w: Worker) {
        const res = await fetch(`/api/workers/${w.id}/in-use`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                is_in_use: !w.is_in_use,
            }),
        });

        if (!res.ok) {
            setFlashMsg('Error updating usage state');
            return;
        }

        setFlashMsg('Usage state updated');
        await refreshList({
            is_active: filterActive,
            is_in_use: filterInUse,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Workers - Admin" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                {/* Tarjetas resumen */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border flex flex-col justify-between">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10">
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">Total Workers</div>
                            <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                                {workers.length}
                            </div>
                        </div>
                    </div>

                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border flex flex-col justify-between">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10">
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">Active</div>
                            <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                                {workers.filter(w => w.is_active).length}
                            </div>
                        </div>
                    </div>

                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border flex flex-col justify-between">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10">
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">In Use Now</div>
                            <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                                {workers.filter(w => w.is_in_use).length}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros + botón crear */}
                <div className="flex flex-col gap-4 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-col gap-2 md:flex-row md:items-end">
                        <div className="flex flex-col text-sm">
                            <label className="font-medium text-neutral-700 dark:text-neutral-200">Activo</label>
                            <select
                                className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                value={filterActive}
                                onChange={(e) => setFilterActive(e.target.value)}
                            >
                                <option value="">Todos</option>
                                <option value="1">Solo activos</option>
                                <option value="0">Solo inactivos</option>
                            </select>
                        </div>

                        <div className="flex flex-col text-sm md:ml-4">
                            <label className="font-medium text-neutral-700 dark:text-neutral-200">En uso</label>
                            <select
                                className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                value={filterInUse}
                                onChange={(e) => setFilterInUse(e.target.value)}
                            >
                                <option value="">Todos</option>
                                <option value="1">En uso</option>
                                <option value="0">Libre</option>
                            </select>
                        </div>

                        <button
                            onClick={applyFilters}
                            className="mt-2 inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 md:mt-0 md:ml-4"
                        >
                            Filtrar
                        </button>
                    </div>

                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                        + New Worker
                    </button>
                </div>

                {/* Tabla */}
                <div className="relative min-h-[50vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="absolute inset-0">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                    </div>

                    <div className="relative z-10 overflow-x-auto">
                        <table className="min-w-full text-left text-sm text-neutral-800 dark:text-neutral-100">
                            <thead className="bg-neutral-100 text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Active</th>
                                    <th className="px-4 py-3">In Use</th>
                                    <th className="px-4 py-3">Created</th>
                                    <th className="px-4 py-3">Updated</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                {workers.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400"
                                        >
                                            No workers found
                                        </td>
                                    </tr>
                                )}

                                {workers.map((w) => (
                                    <tr
                                        key={w.id}
                                        className={w.is_active ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-100/50 dark:bg-neutral-800/50'}
                                    >
                                        <td className="px-4 py-3 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                                            {w.id}
                                        </td>
                                        <td className="px-4 py-3 font-medium">{w.name}</td>
                                        <td className="px-4 py-3">
                                            {w.is_active ? (
                                                <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    active
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                    inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => toggleInUse(w)}
                                                className={`rounded-lg border px-2 py-1 text-[10px] font-semibold ${
                                                    w.is_in_use
                                                        ? 'border-yellow-600 bg-yellow-100 text-yellow-700 dark:border-yellow-400 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                        : 'border-neutral-400 bg-neutral-100 text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                                                }`}
                                            >
                                                {w.is_in_use ? 'in use' : 'free'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400">
                                            {w.created_at}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400">
                                            {w.updated_at}
                                        </td>
                                        <td className="px-4 py-3 text-right text-xs">
                                            <button
                                                onClick={() => openEditModal(w)}
                                                className="mr-2 rounded-lg bg-blue-600 px-3 py-1 font-semibold text-white hover:bg-blue-700"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDeactivate(w.id)}
                                                className="rounded-lg bg-red-600 px-3 py-1 font-semibold text-white hover:bg-red-700"
                                            >
                                                Deactivate
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {flashMsg && (
                        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-medium text-white shadow-lg dark:bg-neutral-100 dark:text-neutral-900">
                            {flashMsg}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL CREAR */}
            <dialog
                ref={createDialogRef}
                className="rounded-xl border border-neutral-300 bg-white p-6 shadow-xl backdrop:bg-black/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                onClose={() => setShowCreate(false)}
            >
                <form onSubmit={handleCreate} className="flex flex-col gap-4 min-w-[260px]">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        New Worker
                    </h2>

                    <div className="flex flex-col text-sm">
                        <label className="font-medium">Name</label>
                        <input
                            className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col text-sm">
                        <label className="font-medium">Password</label>
                        <input
                            type="password"
                            className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={4}
                        />
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                            Se guardará en hash (bcrypt) en el servidor.
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={newIsActive}
                            onChange={(e) => setNewIsActive(e.target.checked)}
                        />
                        <span>Activo</span>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
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
                className="rounded-xl border border-neutral-300 bg-white p-6 shadow-xl backdrop:bg-black/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                onClose={() => setShowEdit(false)}
            >
                <form onSubmit={handleEdit} className="flex flex-col gap-4 min-w-[260px]">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        Edit Worker
                    </h2>

                    <div className="flex flex-col text-sm">
                        <label className="font-medium">Name</label>
                        <input
                            className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col text-sm">
                        <label className="font-medium">New Password (opcional)</label>
                        <input
                            type="password"
                            className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            minLength={4}
                        />
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                            Déjalo vacío si no quieres cambiar la contraseña.
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={editIsActive}
                            onChange={(e) => setEditIsActive(e.target.checked)}
                        />
                        <span>Activo</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={editIsInUse}
                            onChange={(e) => setEditIsInUse(e.target.checked)}
                        />
                        <span>En uso actualmente (is_in_use)</span>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
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
