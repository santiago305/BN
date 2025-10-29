
import { useEffect, useMemo, useRef, useState } from 'react';

import type {
    FilterConfig,
    FilterConfigFormInput,
    FilterWorkingHours,
    WorkerSidebarEntry,
} from '@/types/worker';

const dayLabels: Record<keyof FilterWorkingHours, string> = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
};

type FilterConfigDialogProps = {
    open: boolean;
    config: FilterConfig | null;
    workerOptions: WorkerSidebarEntry[];
    loading?: boolean;
    onClose: () => void;
    onSubmit: (values: FilterConfigFormInput) => void | Promise<void>;
};

type ViewMode = 'config' | 'users';

export function FilterConfigDialog({
    open,
    config,
    workerOptions,
    loading = false,
    onClose,
    onSubmit,
}: FilterConfigDialogProps) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('config');
    const [formState, setFormState] = useState<FilterConfigFormInput | null>(null);

    useEffect(() => {
        if (!dialogRef.current) return;
        if (open && config) {
            dialogRef.current.showModal();
        } else {
            dialogRef.current.close();
        }
    }, [open, config]);

    useEffect(() => {
        if (!config || !open) {
            setFormState(null);
            return;
        }

        setFormState({
            name: config.name,
            working_hours: JSON.parse(JSON.stringify(config.working_hours)) as FilterWorkingHours,
            captcha_type: config.captcha_type,
            relogin_interval: config.relogin_interval,
            filter_url: config.filter_url,
            search_without_results: config.search_without_results,
            worker_ids: [...config.worker_ids],
        });
        setViewMode('config');
    }, [config, open]);

    const workersById = useMemo(() => {
        const record = new Map<string, WorkerSidebarEntry>();
        for (const worker of workerOptions) {
            record.set(worker.id, worker);
        }
        if (config) {
            for (const worker of config.workers) {
                if (!record.has(worker.id)) {
                    record.set(worker.id, worker);
                }
            }
        }
        return record;
    }, [workerOptions, config]);

    if (!config || !formState) {
        return null;
    }

    function handleWorkingHourChange(day: keyof FilterWorkingHours, key: 'start' | 'end', value: string) {
        setFormState((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                working_hours: {
                    ...prev.working_hours,
                    [day]: {
                        ...prev.working_hours[day],
                        [key]: value,
                    },
                },
            };
        });
    }

    function toggleWorker(workerId: string) {
        setFormState((prev) => {
            if (!prev) return prev;
            const alreadySelected = prev.worker_ids.includes(workerId);
            return {
                ...prev,
                worker_ids: alreadySelected
                    ? prev.worker_ids.filter((id) => id !== workerId)
                    : [...prev.worker_ids, workerId],
            };
        });
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!formState) return;
        await onSubmit(formState);
    }

    const assignedWorkers = formState.worker_ids
        .map((id) => workersById.get(id))
        .filter(Boolean) as WorkerSidebarEntry[];

    return (
        <dialog
            ref={dialogRef}
            className="m-auto w-full max-w-3xl rounded-2xl border border-neutral-300 bg-white shadow-2xl backdrop:bg-black/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-0">
                <div className="flex items-start justify-between border-b border-neutral-200 p-4 dark:border-neutral-700">
                    <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                            Configuración del filtro
                        </p>
                        <h2 className="text-lg font-semibold text-neutral-900 capitalize dark:text-neutral-100">
                            {formState.name || config.name}
                        </h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Ajusta los parámetros y usuarios vinculados a este flujo.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    >
                        ✕
                    </button>
                </div>

                {viewMode === 'config' ? (
                    <div className="grid gap-6 p-4 text-sm md:grid-cols-[2fr,1fr]">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <label className="font-medium text-neutral-700 dark:text-neutral-200">Nombre</label>
                                <input
                                    className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                    value={formState.name}
                                    onChange={(event) =>
                                        setFormState((prev) =>
                                            prev
                                                ? {
                                                      ...prev,
                                                      name: event.target.value,
                                                  }
                                                : prev
                                        )
                                    }
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-medium text-neutral-700 dark:text-neutral-200">URL objetivo</label>
                                <input
                                    className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                    value={formState.filter_url}
                                    onChange={(event) =>
                                        setFormState((prev) =>
                                            prev
                                                ? {
                                                      ...prev,
                                                      filter_url: event.target.value,
                                                  }
                                                : prev
                                        )
                                    }
                                    required
                                    type="url"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1">
                                    <label className="font-medium text-neutral-700 dark:text-neutral-200">Captcha</label>
                                    <select
                                        className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                        value={formState.captcha_type}
                                        onChange={(event) =>
                                            setFormState((prev) =>
                                                prev
                                                    ? {
                                                          ...prev,
                                                          captcha_type: event.target.value as FilterConfigFormInput['captcha_type'],
                                                      }
                                                    : prev
                                            )
                                        }
                                    >
                                        <option value="cloudflare">Cloudflare</option>
                                        <option value="recaptcha">reCAPTCHA</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="font-medium text-neutral-700 dark:text-neutral-200">Re login (minutos)</label>
                                    <input
                                        className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                        value={formState.relogin_interval}
                                        min={1}
                                        onChange={(event) =>
                                            setFormState((prev) =>
                                                prev
                                                    ? {
                                                          ...prev,
                                                          relogin_interval: Number.parseInt(event.target.value || '0', 10),
                                                      }
                                                    : prev
                                            )
                                        }
                                        required
                                        type="number"
                                    />
                                </div>
                            </div>

                            <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-neutral-300 text-green-600 focus:ring-green-500 dark:border-neutral-600"
                                    checked={formState.search_without_results}
                                    onChange={(event) =>
                                        setFormState((prev) =>
                                            prev
                                                ? {
                                                      ...prev,
                                                      search_without_results: event.target.checked,
                                                  }
                                                : prev
                                        )
                                    }
                                />
                                <span className="text-neutral-700 dark:text-neutral-200">
                                    Permitir búsqueda sin resultados
                                </span>
                            </label>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                Horario por día
                            </p>
                            <div className="grid gap-3">
                                {Object.entries(dayLabels).map(([key, label]) => {
                                    const dayKey = key as keyof FilterWorkingHours;
                                    const value = formState.working_hours[dayKey];
                                    return (
                                        <div key={key} className="rounded-xl border border-neutral-200 p-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-800/40">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                                                {label}
                                            </p>
                                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                                <label className="flex flex-col gap-1 text-neutral-600 dark:text-neutral-300">
                                                    Inicio
                                                    <input
                                                        type="time"
                                                        value={value.start}
                                                        onChange={(event) =>
                                                            handleWorkingHourChange(dayKey, 'start', event.target.value)
                                                        }
                                                        className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100"
                                                        required
                                                    />
                                                </label>
                                                <label className="flex flex-col gap-1 text-neutral-600 dark:text-neutral-300">
                                                    Fin
                                                    <input
                                                        type="time"
                                                        value={value.end}
                                                        onChange={(event) =>
                                                            handleWorkingHourChange(dayKey, 'end', event.target.value)
                                                        }
                                                        className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100"
                                                        required
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 p-4">
                        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
                            <p className="font-medium">
                                Usuarios asignados ({assignedWorkers.length})
                            </p>
                            {assignedWorkers.length > 0 ? (
                                <ul className="mt-1 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                    {assignedWorkers.map((worker) => (
                                        <li key={worker.id} className="rounded-lg bg-white px-2 py-1 shadow-sm dark:bg-neutral-900">
                                            {worker.name}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                                    Aún no hay usuarios vinculados.
                                </p>
                            )}
                        </div>

                        <div className="grid max-h-80 gap-2 overflow-y-auto rounded-xl border border-neutral-200 p-3 dark:border-neutral-700">
                            {workerOptions.length === 0 ? (
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    No hay usuarios disponibles para asignar.
                                </p>
                            ) : (
                                workerOptions.map((worker) => (
                                    <label
                                        key={worker.id}
                                        className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm transition hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                                    >
                                        <span className="font-medium text-neutral-700 dark:text-neutral-200">{worker.name}</span>
                                        <input
                                            type="checkbox"
                                            checked={formState.worker_ids.includes(worker.id)}
                                            onChange={() => toggleWorker(worker.id)}
                                            className="h-4 w-4 rounded border-neutral-300 text-green-600 focus:ring-green-500 dark:border-neutral-600"
                                        />
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-3 border-t border-neutral-200 p-4 dark:border-neutral-700 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        type="button"
                        onClick={() => setViewMode((mode) => (mode === 'config' ? 'users' : 'config'))}
                        className="inline-flex items-center justify-center rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                        {viewMode === 'config' ? 'Usuarios' : 'Configuración'}
                    </button>

                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-70"
                            disabled={loading}
                        >
                            {loading ? 'Guardando…' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </form>
        </dialog>
    );
}
