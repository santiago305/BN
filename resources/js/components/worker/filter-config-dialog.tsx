import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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
    const innerRef = useRef<HTMLFormElement | null>(null);

    const [viewMode, setViewMode] = useState<ViewMode>('config');
    const [formState, setFormState] = useState<FilterConfigFormInput | null>(null);

    // controlar <dialog/> como modal nativo
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        try {
            if (open && config) {
                if (!dialog.open) {
                    dialog.showModal();
                }
            } else if (dialog.open) {
                dialog.close();
            }
        } catch (error) {
            console.error('No se pudo controlar la visibilidad del modal de filtro.', error);
        }
    }, [open, config, formState]);

    // iniciar form cuando cambie config
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

    // mapa rápido de workers {id -> workerData}
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

    // cierre al clickear fuera:
    // - El <dialog> ocupa toda el área clickleable (incluye backdrop).
    // - El formulario interno es el content box.
    // - Si el target del mousedown NO está dentro del formulario, cerramos.
    function handleBackdropMouseDown(e: React.MouseEvent<HTMLDialogElement>) {
        if (!innerRef.current) return;
        const wasInside = innerRef.current.contains(e.target as Node);
        if (!wasInside) {
            onClose();
        }
    }

    const assignedWorkers = formState.worker_ids
        .map((id) => workersById.get(id))
        .filter(Boolean) as WorkerSidebarEntry[];

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onMouseDown={handleBackdropMouseDown}
            className="m-auto w-full max-w-xl rounded-2xl border border-neutral-300/60 bg-white/80 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm dark:border-neutral-700/60 dark:bg-neutral-900/80 dark:text-neutral-100"
        >
            <form
                ref={innerRef}
                onSubmit={handleSubmit}
                className="flex max-h-[90vh] flex-col overflow-hidden"
            >
                {/* HEADER */}
                <div className="flex flex-col border-b border-neutral-200/70 p-4 dark:border-neutral-700/60">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1 pr-4">
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                    Configuración del filtro
                                </p>

                                <span className="inline-flex items-center rounded-full bg-neutral-900/90 px-2 py-0.5 text-[10px] font-semibold text-white dark:bg-neutral-100/90 dark:text-neutral-900">
                                    #{config.id.slice(0, 4)}
                                </span>
                            </div>

                            <h2 className="text-lg font-semibold text-neutral-900 capitalize dark:text-neutral-100">
                                {formState.name || config.name}
                            </h2>

                            <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                                Ajusta los parámetros del flujo y los usuarios que lo usan.
                            </p>

                            <p className="truncate font-mono text-[10px] text-neutral-600 dark:text-neutral-400">
                                {formState.filter_url}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-2 py-1 text-xs text-neutral-500 transition hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                        >
                            ✕
                        </button>
                    </div>

                    {/* TABS */}
                    <div className="mt-4 flex w-full gap-2 rounded-xl bg-neutral-100/70 p-1 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-300">
                        {(['config', 'users'] as const).map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => setViewMode(mode)}
                                className={[
                                    'flex-1 rounded-lg px-3 py-1.5 transition focus:outline-none',
                                    viewMode === mode
                                        ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-100 dark:ring-neutral-700'
                                        : 'opacity-60 hover:opacity-100',
                                ].join(' ')}
                            >
                                {mode === 'config' ? 'Configuración' : 'Usuarios'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-4 text-sm">
                    <AnimatePresence mode="wait">
                        {viewMode === 'config' ? (
                            <motion.div
                                key="tab-config"
                                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                transition={{ duration: 0.18, ease: 'easeOut' }}
                                className="grid gap-6 md:grid-cols-[1fr]"
                            >
                                {/* Nombre */}
                                <div className="flex flex-col gap-1">
                                    <label className="font-medium text-neutral-700 dark:text-neutral-200">
                                        Nombre
                                    </label>
                                    <input
                                        className="rounded-lg border border-neutral-300 bg-white/80 p-2 text-sm shadow-sm dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-100"
                                        value={formState.name}
                                        onChange={(event) =>
                                            setFormState((prev) =>
                                                prev
                                                    ? { ...prev, name: event.target.value }
                                                    : prev
                                            )
                                        }
                                        required
                                    />
                                </div>

                                {/* URL */}
                                <div className="flex flex-col gap-1">
                                    <label className="font-medium text-neutral-700 dark:text-neutral-200">
                                        URL objetivo
                                    </label>
                                    <input
                                        className="rounded-lg border border-neutral-300 bg-white/80 p-2 text-sm shadow-sm dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-100"
                                        value={formState.filter_url}
                                        onChange={(event) =>
                                            setFormState((prev) =>
                                                prev
                                                    ? { ...prev, filter_url: event.target.value }
                                                    : prev
                                            )
                                        }
                                        required
                                        type="url"
                                    />
                                </div>

                                {/* Captcha / Relogin */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex flex-col gap-1">
                                        <label className="font-medium text-neutral-700 dark:text-neutral-200">
                                            Captcha
                                        </label>
                                        <select
                                            className="rounded-lg border border-neutral-300 bg-white/80 p-2 text-sm shadow-sm dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-100"
                                            value={formState.captcha_type}
                                            onChange={(event) =>
                                                setFormState((prev) =>
                                                    prev
                                                        ? {
                                                              ...prev,
                                                              captcha_type:
                                                                  event.target
                                                                      .value as FilterConfigFormInput['captcha_type'],
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
                                        <label className="font-medium text-neutral-700 dark:text-neutral-200">
                                            Re login (minutos)
                                        </label>
                                        <input
                                            className="rounded-lg border border-neutral-300 bg-white/80 p-2 text-sm shadow-sm dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-100"
                                            value={formState.relogin_interval}
                                            min={1}
                                            onChange={(event) =>
                                                setFormState((prev) =>
                                                    prev
                                                        ? {
                                                              ...prev,
                                                              relogin_interval: Number.parseInt(
                                                                  event.target.value || '0',
                                                                  10
                                                              ),
                                                          }
                                                        : prev
                                                )
                                            }
                                            required
                                            type="number"
                                        />
                                    </div>
                                </div>

                                {/* Checkbox */}
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
                                                          search_without_results:
                                                              event.target.checked,
                                                      }
                                                    : prev
                                            )
                                        }
                                    />
                                    <span className="text-neutral-700 dark:text-neutral-200">
                                        Permitir búsqueda sin resultados
                                    </span>
                                </label>

                                {/* Horarios */}
                                <section>
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                        Horario por día
                                    </p>

                                    <div className="mt-3 grid gap-3">
                                        {Object.entries(dayLabels).map(([key, label]) => {
                                            const dayKey = key as keyof FilterWorkingHours;
                                            const value = formState.working_hours[dayKey];

                                            return (
                                                <motion.div
                                                    key={key}
                                                    className="rounded-xl border border-neutral-200/70 bg-white/60 p-3 shadow-sm backdrop-blur-sm dark:border-neutral-700/60 dark:bg-neutral-800/40"
                                                    whileHover={{ scale: 1.01 }}
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 260,
                                                        damping: 20,
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                                                            {label}
                                                        </p>

                                                        <span className="rounded-lg bg-neutral-900/90 px-2 py-0.5 text-[10px] font-semibold text-white dark:bg-neutral-100/90 dark:text-neutral-900">
                                                            {value.start} - {value.end}
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                                        <label className="flex flex-col gap-1 text-neutral-600 dark:text-neutral-300">
                                                            Inicio
                                                            <input
                                                                type="time"
                                                                value={value.start}
                                                                onChange={(event) =>
                                                                    handleWorkingHourChange(
                                                                        dayKey,
                                                                        'start',
                                                                        event.target.value
                                                                    )
                                                                }
                                                                className="rounded-lg border border-neutral-300 bg-white/80 p-2 text-sm shadow-sm dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100"
                                                                required
                                                            />
                                                        </label>

                                                        <label className="flex flex-col gap-1 text-neutral-600 dark:text-neutral-300">
                                                            Fin
                                                            <input
                                                                type="time"
                                                                value={value.end}
                                                                onChange={(event) =>
                                                                    handleWorkingHourChange(
                                                                        dayKey,
                                                                        'end',
                                                                        event.target.value
                                                                    )
                                                                }
                                                                className="rounded-lg border border-neutral-300 bg-white/80 p-2 text-sm shadow-sm dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100"
                                                                required
                                                            />
                                                        </label>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </section>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="tab-users"
                                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                transition={{ duration: 0.18, ease: 'easeOut' }}
                                className="flex flex-col gap-4"
                            >
                                {/* resumen */}
                                <div className="rounded-xl border border-neutral-200/70 bg-neutral-50/80 p-3 text-xs text-neutral-600 shadow-sm dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300">
                                    <p className="font-medium">
                                        Usuarios asignados ({assignedWorkers.length})
                                    </p>

                                    {assignedWorkers.length > 0 ? (
                                        <ul className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                            {assignedWorkers.map((worker) => (
                                                <li
                                                    key={worker.id}
                                                    className="rounded-lg bg-white px-2 py-1 shadow-sm dark:bg-neutral-900"
                                                >
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

                                {/* selector */}
                                <div className="max-h-64 overflow-y-auto rounded-xl border border-neutral-200/70 bg-white/50 p-3 shadow-inner dark:border-neutral-700/60 dark:bg-neutral-900/40">
                                    {workerOptions.length === 0 ? (
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            No hay usuarios disponibles para asignar.
                                        </p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {workerOptions.map((worker) => (
                                                <li
                                                    key={worker.id}
                                                    className="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2 text-sm shadow-sm ring-1 ring-neutral-200/60 transition hover:bg-neutral-100/80 dark:bg-neutral-900/80 dark:ring-neutral-700/60 dark:hover:bg-neutral-800"
                                                >
                                                    <span className="font-medium text-neutral-700 dark:text-neutral-200">
                                                        {worker.name}
                                                    </span>

                                                    <input
                                                        type="checkbox"
                                                        checked={formState.worker_ids.includes(worker.id)}
                                                        onChange={() => toggleWorker(worker.id)}
                                                        className="h-4 w-4 rounded border-neutral-300 text-green-600 focus:ring-green-500 dark:border-neutral-600"
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* FOOTER */}
                <div className="flex flex-col gap-3 border-t border-neutral-200/70 bg-white/60 p-4 text-sm shadow-[0_-8px_16px_rgba(0,0,0,0.03)] backdrop-blur-sm dark:border-neutral-700/60 dark:bg-neutral-900/60 dark:shadow-[0_-8px_16px_rgba(0,0,0,0.6)] sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                        <span className="inline-block h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
                        {viewMode === 'config'
                            ? 'Editando parámetros'
                            : `Asignando usuarios (${assignedWorkers.length})`}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            className="rounded-lg border border-neutral-300 bg-white/40 px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm ring-1 ring-neutral-200/60 transition hover:bg-white/80 dark:border-neutral-600 dark:bg-neutral-800/40 dark:text-neutral-200 dark:ring-neutral-700/60 dark:hover:bg-neutral-800"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>

                        <motion.button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-green-600/30 transition hover:bg-green-700 disabled:opacity-70 dark:ring-green-500/30"
                            disabled={loading}
                            whileTap={{ scale: 0.96 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            {loading ? 'Guardando…' : 'Guardar'}
                        </motion.button>
                    </div>
                </div>
            </form>
        </dialog>
    );
}
