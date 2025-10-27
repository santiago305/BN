import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { WorkerFilterControls } from '@/components/worker/worker-filter-controls';
import { WorkerStatsCards } from '@/components/worker/worker-stats-cards';
import { WorkerTable } from '@/components/worker/worker-table';
import { WorkerCreateDialog } from '@/components/worker/worker-create-dialog';
import { WorkerEditDialog } from '@/components/worker/worker-edit-dialog';
import { getCsrfHeaders } from '@/lib/csrf';
import { type BreadcrumbItem } from '@/types';
import { type Worker, type WorkerPageProps } from '@/types/worker';

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

export default function WorkerIndexPage({
    workers: initialWorkers,
    filters,
}: WorkerPageProps) {
    const [workers, setWorkers] = useState<Worker[]>(initialWorkers);

    const [filterActive, setFilterActive] = useState<string>(filters.is_active ?? '');
    const [filterInUse, setFilterInUse] = useState<string>(filters.is_in_use ?? '');

    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newIsActive, setNewIsActive] = useState(true);

    const [showEdit, setShowEdit] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [editIsActive, setEditIsActive] = useState(true);
    const [editIsInUse, setEditIsInUse] = useState(false);

    const [flashMsg, setFlashMsg] = useState<string>('');

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

    async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

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

    function openEditModal(worker: Worker) {
        setEditId(worker.id);
        setEditName(worker.name);
        setEditPassword('');
        setEditIsActive(worker.is_active);
        setEditIsInUse(worker.is_in_use);
        setShowEdit(true);
    }

    async function handleEdit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (editId == null) return;

        const body: Record<string, unknown> = {
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

    async function toggleInUse(worker: Worker) {
        if (!worker.is_active) {
            setFlashMsg('El usuario está inactivo y no se puede poner en uso');
            return;
        }

        const res = await fetch(`/api/workers/${worker.id}/in-use`, {
            method: 'PATCH',
            headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ is_in_use: !worker.is_in_use }),
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
    const activeCount = workers.filter((worker) => worker.is_active).length;
    const inUseCount = workers.filter((worker) => worker.is_in_use).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />

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
                <WorkerStatsCards total={total} active={activeCount} inUse={inUseCount} />

                <WorkerFilterControls
                    filterActive={filterActive}
                    filterInUse={filterInUse}
                    onFilterActiveChange={(value) => setFilterActive(value)}
                    onFilterInUseChange={(value) => setFilterInUse(value)}
                    onApply={applyFilters}
                />

                <WorkerTable
                    workers={workers}
                    flashMessage={flashMsg}
                    onToggleInUse={toggleInUse}
                    onEdit={openEditModal}
                    onDeactivate={handleDeactivate}
                />
            </div>

            <WorkerCreateDialog
                open={showCreate}
                name={newName}
                password={newPassword}
                isActive={newIsActive}
                onNameChange={(value) => setNewName(value)}
                onPasswordChange={(value) => setNewPassword(value)}
                onIsActiveChange={(value) => setNewIsActive(value)}
                onClose={() => setShowCreate(false)}
                onSubmit={handleCreate}
            />

            <WorkerEditDialog
                open={showEdit}
                name={editName}
                password={editPassword}
                isActive={editIsActive}
                isInUse={editIsInUse}
                onNameChange={(value) => setEditName(value)}
                onPasswordChange={(value) => setEditPassword(value)}
                onIsActiveChange={(value) => {
                    setEditIsActive(value);
                    if (!value) {
                        setEditIsInUse(false);
                    }
                }}
                onIsInUseChange={(value) => setEditIsInUse(value)}
                onClose={() => setShowEdit(false)}
                onSubmit={handleEdit}
            />
        </AppLayout>
    );
}
