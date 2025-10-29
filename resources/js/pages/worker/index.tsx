import React, { useState, useCallback, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { FilterConfigDialog } from '@/components/worker/filter-config-dialog';
import { WorkerFilterControls } from '@/components/worker/worker-filter-controls';
import { WorkerStatsCards } from '@/components/worker/worker-stats-cards';
import { WorkerTable } from '@/components/worker/worker-table';
import { WorkerCreateDialog } from '@/components/worker/worker-create-dialog';
import { WorkerEditDialog } from '@/components/worker/worker-edit-dialog';
import { getCsrfHeaders } from '@/lib/csrf';
import { type BreadcrumbItem } from '@/types';
import {
    type FilterConfig,
    type FilterConfigFormInput,
    type Worker,
    type WorkerPageProps,
    type WorkerSidebarEntry,
} from '@/types/worker';

function isWorkerPageProps(value: unknown): value is WorkerPageProps {
    if (!value || typeof value !== 'object') return false;
    const props = value as Partial<WorkerPageProps>;
    if (!Array.isArray(props.workers)) return false;
    if (!Array.isArray(props.filterConfigs)) return false;
    if (!Array.isArray(props.workerOptions)) return false;
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
    filterConfigs: initialFilterConfigs,
    workerOptions: initialWorkerOptions,
}: WorkerPageProps) {
    const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
    const [pagination, setPagination] = useState(initialPagination);
    const [stats, setStats] = useState(initialStats);
    const [filterConfigs, setFilterConfigs] = useState<FilterConfig[]>(initialFilterConfigs);
    const [workerOptions, setWorkerOptions] = useState<WorkerSidebarEntry[]>(initialWorkerOptions);

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

    const [selectedFilterId, setSelectedFilterId] = useState<string | null>(null);
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
    const [isSavingFilter, setIsSavingFilter] = useState(false);

    const selectedFilter = selectedFilterId
        ? filterConfigs.find((filter) => filter.id === selectedFilterId) ?? null
        : null;

    const filterColorPalette = [
        'from-sky-100 via-sky-50 to-white dark:from-sky-900/30 dark:via-sky-900/10 dark:to-neutral-900',
        'from-emerald-100 via-emerald-50 to-white dark:from-emerald-900/30 dark:via-emerald-900/10 dark:to-neutral-900',
        'from-amber-100 via-amber-50 to-white dark:from-amber-900/30 dark:via-amber-900/10 dark:to-neutral-900',
        'from-violet-100 via-violet-50 to-white dark:from-violet-900/30 dark:via-violet-900/10 dark:to-neutral-900',
    ];

    const formatFilterName = useCallback((name: string) => {
        if (!name) return '';
        return name.charAt(0).toUpperCase() + name.slice(1);
    }, []);

    const reloadFilterConfigs = useCallback(async () => {
        try {
            const res = await fetch('/api/filter-configs');
            if (!res.ok) {
                return;
            }

            const data: { data: FilterConfig[]; worker_options?: WorkerSidebarEntry[] } = await res.json();
            setFilterConfigs(data.data);
            if (Array.isArray(data.worker_options)) {
                setWorkerOptions(data.worker_options);
            }

            if (selectedFilterId && !data.data.some((config) => config.id === selectedFilterId)) {
                setSelectedFilterId(null);
                setIsFilterDialogOpen(false);
            }
        } catch (error) {
            console.error('No se pudo actualizar la configuración de filtros.', error);
        }
    }, [selectedFilterId]);

    function handleOpenFilterConfig(filterId: string) {
        setSelectedFilterId(filterId);
        setIsFilterDialogOpen(true);
    }

    function handleCloseFilterConfig() {
        setIsFilterDialogOpen(false);
        setSelectedFilterId(null);
    }

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
                    const nextProps = page.props as WorkerPageProps;
                    const nextFilterConfigs = nextProps.filterConfigs;

                    setWorkers(nextProps.workers);
                    setPagination(nextProps.pagination);
                    setStats(nextProps.stats);
                    setFilterConfigs(nextFilterConfigs);
                    setSelectedFilterId((currentId) =>
                        currentId
                            ? (() => {
                                  const found = nextFilterConfigs.find((config) => config.id === currentId);
                                  if (!found) {
                                      setIsFilterDialogOpen(false);
                                      return null;
                                  }
                                  return found.id;
                                })()
                            : null
                    );
                    // Actualizamos el catálogo de usuarios disponibles por si hubo cambios
                    setWorkerOptions(nextProps.workerOptions);
                }
            },
        });
    }

     async function handleFilterConfigSubmit(values: FilterConfigFormInput) {
        if (!selectedFilter) return;

        setIsSavingFilter(true);
        try {
            const res = await fetch(`/api/filter-configs/${selectedFilter.id}`, {
                method: 'PATCH',
                headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                setFlashMsg('No se pudo guardar la configuración');
                return;
            }

            const data: { data: FilterConfig; worker_options?: WorkerSidebarEntry[] } = await res.json();

            setFilterConfigs((prev) => prev.map((config) => (config.id === data.data.id ? data.data : config)));
            if (Array.isArray(data.worker_options)) {
                setWorkerOptions(data.worker_options);
            }
            setFlashMsg('Configuración guardada');
            handleCloseFilterConfig();
        } catch (error) {
            console.error('No se pudo actualizar la configuración del filtro.', error);
            setFlashMsg('No se pudo guardar la configuración');
        } finally {
            setIsSavingFilter(false);
        }
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

        await reloadFilterConfigs();
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

        await reloadFilterConfigs();
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

        await reloadFilterConfigs();
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

        await reloadFilterConfigs();
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
                    const nextProps = pageData.props as WorkerPageProps;
                    const nextFilterConfigs = nextProps.filterConfigs;

                    setWorkers(nextProps.workers);
                    setPagination(nextProps.pagination);
                    setStats(nextProps.stats);
                    setFilterConfigs(nextFilterConfigs);
                    setSelectedFilterId((currentId) =>
                        currentId
                            ? (() => {
                                  const found = nextFilterConfigs.find((config) => config.id === currentId);
                                  if (!found) {
                                      setIsFilterDialogOpen(false);
                                      return null;
                                  }
                                  return found.id;
                                })()
                            : null
                    );
                    setWorkerOptions(nextProps.workerOptions);
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

                {filterConfigs.length > 0 && (
                    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {filterConfigs.map((config, index) => {
                            const colorClass = filterColorPalette[index % filterColorPalette.length];
                            const assignedCount = config.worker_ids.length;
                            return (
                                <button
                                    key={config.id}
                                    type="button"
                                    onClick={() => handleOpenFilterConfig(config.id)}
                                    className={`group relative overflow-hidden rounded-2xl border border-neutral-200 bg-linear-to-br p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-neutral-500 dark:border-neutral-700 ${colorClass}`}
                                >
                                    <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                                        <div className="absolute inset-0 bg-white/30 dark:bg-neutral-900/20" />
                                    </div>

                                    <div className="relative z-10 flex h-full flex-col justify-between gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500/80 dark:text-neutral-400">
                                                Filtro
                                            </p>
                                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                                {formatFilterName(config.name)}
                                            </h3>
                                            <p className="truncate text-xs text-neutral-600 dark:text-neutral-300">
                                                {config.filter_url}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">Captcha</span>
                                                <span className="uppercase tracking-wide text-neutral-700 dark:text-neutral-200">
                                                    {config.captcha_type}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">Re-login</span>
                                                <span className="text-neutral-700 dark:text-neutral-200">
                                                    Cada {config.relogin_interval} min
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">Usuarios</span>
                                                <span className="text-neutral-700 dark:text-neutral-200">
                                                    {assignedCount === 0
                                                        ? 'Sin asignar'
                                                        : `${assignedCount} asignado${assignedCount === 1 ? '' : 's'}`}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">Sin resultados</span>
                                                <span className="text-neutral-700 dark:text-neutral-200">
                                                    {config.search_without_results ? 'Permitido' : 'No permitido'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </section>
                )}

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

            <FilterConfigDialog
                open={isFilterDialogOpen && selectedFilter != null}
                config={selectedFilter}
                workerOptions={workerOptions}
                loading={isSavingFilter}
                onClose={handleCloseFilterConfig}
                onSubmit={handleFilterConfigSubmit}
            />
        </AppLayout>
    );
}
