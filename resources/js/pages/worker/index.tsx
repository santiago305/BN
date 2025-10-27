import React, { useState, useCallback, useEffect } from 'react';
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
    const pagination = props.pagination;
    const stats = props.stats;
    if (!pagination || typeof pagination !== 'object') return false;
    if (!stats || typeof stats !== 'object') return false;
    return 'is_active' in filters && 'is_in_use' in filters;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Usuarios', href: '/workers' },
];

export default function WorkerIndexPage({
    workers: initialWorkers,
    filters,
    pagination: initialPagination,
    stats: initialStats,
}: WorkerPageProps) {
    const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
    const [pagination, setPagination] = useState(initialPagination);
    const [stats, setStats] = useState(initialStats);

    const [filterActive, setFilterActive] = useState<string>(filters.is_active ?? '');
    const [filterInUse, setFilterInUse] = useState<string>(filters.is_in_use ?? '');

    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDni, setNewDni] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newIsActive, setNewIsActive] = useState(true);

    const [showEdit, setShowEdit] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editDni, setEditDni] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [editIsActive, setEditIsActive] = useState(true);
    const [editIsInUse, setEditIsInUse] = useState(false);

    const [flashMsg, setFlashMsg] = useState<string>('');

    const currentPage = pagination.current_page ?? 1;

    const refreshList = useCallback(async (optionalParams?: {
        is_active?: string;
        is_in_use?: string;
        page?: number;
    }): Promise<void> => {
        const params = new URLSearchParams();
        const activeFilter = optionalParams?.is_active ?? filterActive;
        const inUseFilter = optionalParams?.is_in_use ?? filterInUse;
        const page = optionalParams?.page ?? currentPage;

        if (activeFilter !== '') {
            params.set('is_active', activeFilter);
        }
        if (inUseFilter !== '') {
            params.set('is_in_use', inUseFilter);
        }

        params.set('page', page.toString());

        try {
            const res = await fetch(`/api/workers?${params.toString()}`);
            if (!res.ok) {
                return;
            }

            const data: {
                data: Worker[];
                meta: WorkerPageProps['pagination'];
                stats: WorkerPageProps['stats'];
            } = await res.json();
            setWorkers(data.data);
            setPagination(data.meta);
            setStats(data.stats);
        } catch (error) {
            console.error('No se pudo actualizar la lista de usuarios automáticamente.', error);
        }
    }, [filterActive, filterInUse, currentPage]);

    function applyFilters() {
        const params: Record<string, string> = {};
        if (filterActive !== '') params.is_active = filterActive;
        if (filterInUse !== '') params.is_in_use = filterInUse;
        params.page = '1';

        router.get('/workers', params, {
            preserveState: true,
            onSuccess: (page) => {
                if (isWorkerPageProps(page.props)) {
                    setWorkers(page.props.workers);
                    setPagination(page.props.pagination);
                    setStats(page.props.stats);
                }
            },
        });
    }

    async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const body = {
            name: newName,
            dni: newDni,
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
        setNewDni('');
        setNewPassword('');
        setNewIsActive(true);

        await refreshList({
            is_active: filterActive,
            is_in_use: filterInUse,
            page: pagination.current_page,
        });
    }

    function openEditModal(worker: Worker) {
        setEditId(worker.id);
        setEditName(worker.name);
        setEditDni(worker.dni);
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
            dni: editDni,
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
            page: pagination.current_page,
        });
    }

    async function handleDeactivate(id: string) {
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
            page: pagination.current_page,
        });
    }

    async function handleActivate(id: string) {
        const res = await fetch(`/api/workers/${id}`, {
            method: 'PATCH',
            headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ is_active: true }),
        });

        if (!res.ok) {
            setFlashMsg('No se pudo activar');
            return;
        }

        setFlashMsg('Usuario activado');
        await refreshList({
            is_active: filterActive,
            is_in_use: filterInUse,
            page: pagination.current_page,
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
            page: pagination.current_page,
        });
    }

    function handlePageChange(page: number) {
        const nextPage = Math.max(1, Math.min(page, pagination.last_page));
        if (nextPage === pagination.current_page) return;

        const params: Record<string, string> = {};
        if (filterActive !== '') params.is_active = filterActive;
        if (filterInUse !== '') params.is_in_use = filterInUse;
        params.page = nextPage.toString();

        router.get('/workers', params, {
            preserveState: true,
            onSuccess: (pageData) => {
                if (isWorkerPageProps(pageData.props)) {
                    setWorkers(pageData.props.workers);
                    setPagination(pageData.props.pagination);
                    setStats(pageData.props.stats);
                }
            },
        });
    }

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
                return;
            }

            void refreshList();
        }, 2000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [refreshList]);

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
                <WorkerStatsCards total={stats.total} active={stats.active} inUse={stats.inUse} />

                <WorkerFilterControls
                    filterActive={filterActive}
                    filterInUse={filterInUse}
                    onFilterActiveChange={(value) => setFilterActive(value)}
                    onFilterInUseChange={(value) => setFilterInUse(value)}
                    onApply={applyFilters}
                />

                <WorkerTable
                    workers={workers}
                    pagination={pagination}
                    flashMessage={flashMsg}
                    onFlashClear={() => setFlashMsg('')}
                    onToggleInUse={toggleInUse}
                    onEdit={openEditModal}
                    onDeactivate={handleDeactivate}
                    onActivate={handleActivate}
                    onPageChange={handlePageChange}
                />
            </div>

            <WorkerCreateDialog
                open={showCreate}
                name={newName}
                dni={newDni}
                password={newPassword}
                isActive={newIsActive}
                onNameChange={(value) => setNewName(value)}
                onDniChange={(value) => setNewDni(value)}
                onPasswordChange={(value) => setNewPassword(value)}
                onIsActiveChange={(value) => setNewIsActive(value)}
                onClose={() => setShowCreate(false)}
                onSubmit={handleCreate}
            />

            <WorkerEditDialog
                open={showEdit}
                name={editName}
                dni={editDni}
                password={editPassword}
                isActive={editIsActive}
                isInUse={editIsInUse}
                onNameChange={(value) => setEditName(value)}
                onDniChange={(value) => setEditDni(value)}
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
