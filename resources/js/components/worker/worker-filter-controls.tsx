import { Filter } from 'lucide-react';

export type WorkerFilterControlsProps = {
    filterActive: string;
    filterInUse: string;
    onFilterActiveChange: (value: string) => void;
    onFilterInUseChange: (value: string) => void;
    onApply: () => void;
};

export function WorkerFilterControls({
    filterActive,
    filterInUse,
    onFilterActiveChange,
    onFilterInUseChange,
    onApply,
}: WorkerFilterControlsProps) {
    return (
        <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="grid gap-4 sm:grid-cols-2 lg:flex lg:flex-row">
                    <div className="flex flex-col text-sm">
                        <label className="font-medium text-neutral-700 dark:text-neutral-200">Activo</label>
                        <select
                            className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                            value={filterActive}
                            onChange={(event) => onFilterActiveChange(event.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="1">Solo activos</option>
                            <option value="0">Solo inactivos</option>
                        </select>
                    </div>

                    <div className="flex flex-col text-sm">
                        <label className="font-medium text-neutral-700 dark:text-neutral-200">En uso</label>
                        <select
                            className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                            value={filterInUse}
                            onChange={(event) => onFilterInUseChange(event.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="1">En uso</option>
                            <option value="0">Libre</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={onApply}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                    <Filter className="h-4 w-4" />
                    <span>Aplicar filtros</span>
                </button>
            </div>
        </section>
    );
}
