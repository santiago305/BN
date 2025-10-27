import { useEffect, useRef } from 'react';

import type { WorkerEditDialogProps } from '@/types/worker';

export function WorkerEditDialog({
    open,
    name,
    password,
    isActive,
    isInUse,
    onNameChange,
    onPasswordChange,
    onIsActiveChange,
    onIsInUseChange,
    onClose,
    onSubmit,
}: WorkerEditDialogProps) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    useEffect(() => {
        if (!dialogRef.current) return;
        if (open) {
            dialogRef.current.showModal();
        } else {
            dialogRef.current.close();
        }
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            className="w-full max-w-sm rounded-2xl border border-neutral-300 bg-white shadow-2xl backdrop:bg-black/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            onClose={onClose}
        >
            <form onSubmit={onSubmit} className="flex flex-col">
                <div className="flex items-start justify-between border-b border-neutral-200 p-4 dark:border-neutral-700">
                    <div>
                        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Editar usuario</h2>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Actualiza datos de acceso y estado.
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

                <div className="flex flex-col gap-4 p-4 text-sm">
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-neutral-700 dark:text-neutral-200">Nombre</label>
                        <input
                            className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                            value={name}
                            onChange={(event) => onNameChange(event.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-neutral-700 dark:text-neutral-200">Nueva contraseña (opcional)</label>
                        <input
                            type="password"
                            className="rounded-lg border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                            value={password}
                            onChange={(event) => onPasswordChange(event.target.value)}
                            minLength={4}
                        />
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                            Déjalo vacío si no quieres cambiarla.
                        </span>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-neutral-300 text-green-600 focus:ring-green-500 dark:border-neutral-600"
                            checked={isActive}
                            onChange={(event) => onIsActiveChange(event.target.checked)}
                        />
                        <span className="text-neutral-700 dark:text-neutral-200">Usuario activo</span>
                    </label>

                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-neutral-300 text-yellow-600 focus:ring-yellow-500 dark:border-neutral-600"
                            checked={isInUse}
                            onChange={(event) => onIsInUseChange(event.target.checked)}
                        />
                        <span className="text-neutral-700 dark:text-neutral-200">En uso actualmente</span>
                    </label>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-neutral-200 p-4 dark:border-neutral-700">
                    <button
                        type="button"
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
                        onClick={onClose}
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
    );
}
