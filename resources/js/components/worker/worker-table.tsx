import { Activity, AlertCircle, CheckCircle, Edit3, Power } from 'lucide-react';

import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import type { WorkerTableProps } from '@/types/worker';

export function WorkerTable({
    workers,
    flashMessage,
    onToggleInUse,
    onEdit,
    onDeactivate,
}: WorkerTableProps) {
    return (
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
                                <td colSpan={7} className="px-4 py-10 text-center text-neutral-500 dark:text-neutral-400">
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
                                <td className="px-4 py-3 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                                    {worker.id}
                                </td>

                                <td className="px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                    {worker.name}
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
                                        className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition-colors ${
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

                                <td className="px-4 py-3 text-[11px] text-neutral-500 dark:text-neutral-400">{worker.created_at}</td>
                                <td className="px-4 py-3 text-[11px] text-neutral-500 dark:text-neutral-400">{worker.updated_at}</td>

                                <td className="px-4 py-3 text-right text-xs">
                                    <button
                                        onClick={() => onEdit(worker)}
                                        className="mr-2 inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 font-semibold text-white shadow-sm hover:bg-blue-700"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                        Editar
                                    </button>

                                    <button
                                        onClick={() => onDeactivate(worker.id)}
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

            {flashMessage && (
                <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-xl bg-neutral-900/90 px-4 py-2 text-xs font-medium text-white shadow-xl backdrop-blur dark:bg-neutral-100/90 dark:text-neutral-900">
                    {flashMessage}
                </div>
            )}
        </section>
    );
}
