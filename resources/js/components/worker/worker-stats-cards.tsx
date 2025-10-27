import { Activity, CheckCircle, Users2 } from 'lucide-react';

import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';

import type { WorkerStatsCardsProps } from '@/types/worker';

export function WorkerStatsCards({ total, active, inUse }: WorkerStatsCardsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                <div className="relative z-10 flex items-start justify-between">
                    <div>
                        <p className="flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            <Users2 className="h-3.5 w-3.5" />
                            Total usuarios
                        </p>
                        <div className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{total}</div>
                    </div>
                    <span className="rounded-lg bg-neutral-100 px-2 py-1 text-[10px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        {total === 1 ? '1 cuenta' : `${total} cuentas`}
                    </span>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                <PlaceholderPattern className="absolute inset-0 size-full stroke-green-600/10 dark:stroke-green-400/10" />
                <div className="relative z-10 flex items-start justify-between">
                    <div>
                        <p className="flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Activos
                        </p>
                        <div className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{active}</div>
                    </div>
                    <span className="rounded-lg bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {active} activos
                    </span>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                <PlaceholderPattern className="absolute inset-0 size-full stroke-yellow-500/10 dark:stroke-yellow-400/10" />
                <div className="relative z-10 flex items-start justify-between">
                    <div>
                        <p className="flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            <Activity className="h-3.5 w-3.5" />
                            En uso ahora
                        </p>
                        <div className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{inUse}</div>
                    </div>
                    <span className="rounded-lg bg-yellow-100 px-2 py-1 text-[10px] font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                        {inUse} en uso
                    </span>
                </div>
            </div>
        </div>
    );
}
