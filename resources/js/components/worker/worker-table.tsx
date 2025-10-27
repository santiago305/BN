import { Activity, AlertCircle, CheckCircle, Edit3, Power } from 'lucide-react';

import { Fragment, useEffect } from 'react';

import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import type { WorkerTableProps } from '@/types/worker';
import { AnimatePresence, motion } from 'framer-motion';

export function WorkerTable({
    workers,
    pagination,
    flashMessage,
    onFlashClear,
    onToggleInUse,
    onEdit,
    onDeactivate,
    onActivate,
    onPageChange,
}: WorkerTableProps) {
    useEffect(() => {
        if (!flashMessage) {
            return;
        }

        const timeout = setTimeout(() => {
            onFlashClear?.();
        }, 2000);

        return () => clearTimeout(timeout);
    }, [flashMessage, onFlashClear]);

    return (
        <section className="relative min-h-[50vh] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <div className="absolute inset-0 pointer-events-none">
                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/5 dark:stroke-neutral-100/5" />
            </div>

            <div className="relative z-10 overflow-x-auto">
                <table className="min-w-full text-left text-sm text-neutral-800 dark:text-neutral-100">
                    <thead className="bg-neutral-50 text-[11px] font-semibold uppercase tracking-wide text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                         <tr>
                            <th className="px-4 py-3">Usuario</th>
                            <th className="px-4 py-3">DNI</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3">Uso</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                        {workers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-neutral-500 dark:text-neutral-400">
                                    No se encontraron usuarios
                                </td>
                            </tr>
                        )}

                        {workers.map((worker) => (
                            <tr
                                key={worker.id}
                                className={
                                    worker.is_active
                                        ? 'bg-white dark:bg-neutral-900'
                                        : 'bg-neutral-50 dark:bg-neutral-800/40'
                                }
                            >

                                <td className="px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                    {worker.name}
                                </td>

                                <td className="px-4 py-3 text-xs font-mono uppercase tracking-wide text-neutral-700 dark:text-neutral-300">
                                    {worker.dni}
                                </td>

                                <td className="px-4 py-3">
                                    {worker.is_active ? (
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
                                        onClick={() => onToggleInUse(worker)}
                                        disabled={!worker.is_active}
                                        className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition-colors cursor-pointer ${
                                            worker.is_active
                                                ? worker.is_in_use
                                                    ? 'border-yellow-600 bg-yellow-100 text-yellow-700 dark:border-yellow-400 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                    : 'border-neutral-400 bg-neutral-100 text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                                                : 'cursor-not-allowed border-neutral-300 bg-neutral-100 text-neutral-400 opacity-60 dark:border-neutral-700 dark:bg-neutral-800/40 dark:text-neutral-500'
                                        }`}
                                    >
                                        <Activity className="h-3 w-3" />
                                        {worker.is_in_use ? 'En uso' : 'Libre'}
                                    </button>
                                </td>

                                <td className="px-4 py-3 text-right text-xs">
                                    <div
                                    className='flex gap-2 w-auto h-auto justify-end flex-wrap'
                                    >
                                        <button
                                            onClick={() => onEdit(worker)}
                                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 font-semibold text-white shadow-sm hover:bg-blue-700"
                                        >
                                            <Edit3 className="h-3.5 w-3.5" />
                                            Editar
                                        </button>

                                        {worker.is_active ? (
                                            <button
                                                onClick={() => onDeactivate(worker.id)}
                                                className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1 font-semibold text-white shadow-sm hover:bg-red-700"
                                            >
                                                <Power className="h-3.5 w-3.5" />
                                                Desactivar
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => onActivate(worker.id)}
                                                className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1 font-semibold text-white shadow-sm hover:bg-green-700"
                                            >
                                                <Power className="h-3.5 w-3.5" />
                                                Activar
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination.total > pagination.per_page && (
                <div className="relative z-10 flex flex-col gap-3 border-t border-neutral-200 bg-white/80 px-4 py-3 text-xs dark:border-neutral-700 dark:bg-neutral-900/80 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-neutral-600 dark:text-neutral-300">
                        Mostrando
                        <span className="mx-1 font-semibold text-neutral-900 dark:text-neutral-100">
                            {pagination.total === 0
                                ? 0
                                : (pagination.current_page - 1) * pagination.per_page + 1}
                        </span>
                        a
                        <span className="mx-1 font-semibold text-neutral-900 dark:text-neutral-100">
                            {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                        </span>
                        de
                        <span className="ml-1 font-semibold text-neutral-900 dark:text-neutral-100">
                            {pagination.total}
                        </span>
                        registros
                    </span>

                    <div className="flex items-center justify-end gap-1">
                        <button
                            type="button"
                            onClick={() => onPageChange(pagination.current_page - 1)}
                            disabled={pagination.current_page <= 1}
                            className="rounded-lg border border-neutral-300 px-3 py-1 font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
                        >
                            Anterior
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from(
                                { length: pagination.last_page },
                                (_, index) => index + 1
                            )
                                .filter((page) => {
                                    if (pagination.last_page <= 5) return true;
                                    const start = Math.max(1, pagination.current_page - 2);
                                    const end = Math.min(pagination.last_page, pagination.current_page + 2);
                                    if (page === 1 || page === pagination.last_page) return true;
                                    return page >= start && page <= end;
                                })
                                .map((page, index, pages) => (
                                    <Fragment key={page}>
                                        {index > 0 && pages[index - 1] + 1 < page && (
                                            <span className="px-1 text-neutral-400">…</span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => onPageChange(page)}
                                            className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                                                page === pagination.current_page
                                                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                                                    : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    </Fragment>
                                ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => onPageChange(pagination.current_page + 1)}
                            disabled={pagination.current_page >= pagination.last_page}
                            className="rounded-lg border border-neutral-300 px-3 py-1 font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {flashMessage && (
                    <motion.div
                        key={flashMessage}
                        className="absolute right-4 z-20 flex items-center gap-2 rounded-xl bg-neutral-900/90 px-4 py-2 text-xs font-medium text-white shadow-xl backdrop-blur dark:bg-neutral-100/90 dark:text-neutral-900"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {flashMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
