import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { WorkerCreateDialogProps } from '@/types/worker';

export function WorkerCreateDialog({
    open,
    name,
    dni,
    password,
    isActive,
    onNameChange,
    onDniChange,
    onPasswordChange,
    onIsActiveChange,
    onClose,
    onSubmit,
}: WorkerCreateDialogProps) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const innerRef = useRef<HTMLFormElement | null>(null);

    // abrir / cerrar modal nativo <dialog> como en tu versión original
    useEffect(() => {
        if (!dialogRef.current) return;
        if (open) {
            dialogRef.current.showModal();
        } else {
            dialogRef.current.close();
        }
    }, [open]);

    // cerrar si clic fuera del contenido
    function handleBackdropMouseDown(e: React.MouseEvent<HTMLDialogElement>) {
        if (!innerRef.current) return;
        const wasInside = innerRef.current.contains(e.target as Node);
        if (!wasInside) {
            onClose();
        }
    }

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onMouseDown={handleBackdropMouseDown}
            className="
                m-auto w-full max-w-sm rounded-2xl border border-neutral-300/60
                bg-white/80 shadow-2xl
                backdrop:bg-black/40 backdrop:backdrop-blur-sm
                dark:border-neutral-700/60 dark:bg-neutral-900/80 dark:text-neutral-100
            "
        >
            <form
                ref={innerRef}
                onSubmit={onSubmit}
                className="flex max-h-[90vh] flex-col overflow-hidden"
            >
                {/* HEADER */}
                <div className="flex flex-col border-b border-neutral-200/70 p-4 dark:border-neutral-700/60">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1 pr-4">
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                    Nuevo usuario
                                </p>

                                <span className="inline-flex items-center rounded-full bg-green-600/15 px-2 py-0.5 text-[10px] font-semibold text-green-700 ring-1 ring-green-600/30 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/30">
                                    Creación
                                </span>
                            </div>

                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                Registrar cuenta interna
                            </h2>

                            <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                                Estos usuarios se usan para acceso interno, monitoreo o soporte.
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
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-4 text-sm">
                    <div className="flex flex-col gap-4">
                        {/* Nombre */}
                        <div className="flex flex-col gap-1">
                            <label className="font-medium text-neutral-700 dark:text-neutral-200">
                                Nombre
                            </label>
                            <input
                                className="rounded-lg border border-neutral-300 bg-white/80 p-2 text-sm shadow-sm dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-100"
                                value={name}
                                onChange={(event) => onNameChange(event.target.value)}
                                required
                            />
                        </div>

                        {/* DNI */}
                        <div className="flex flex-col gap-1">
                            <label className="font-medium text-neutral-700 dark:text-neutral-200">
                                DNI
                            </label>
                            <input
                                className="rounded-lg border border-neutral-300 bg-white/80 p-2 text-sm shadow-sm dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-100"
                                value={dni}
                                onChange={(event) => onDniChange(event.target.value)}
                                maxLength={20}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1">
                            <label className="font-medium text-neutral-700 dark:text-neutral-200">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                className="rounded-lg border border-neutral-300 bg-white/80 p-2 text-sm shadow-sm dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-100"
                                value={password}
                                onChange={(event) => onPasswordChange(event.target.value)}
                                minLength={4}
                                required
                            />
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                Mínimo 4 caracteres.
                            </span>
                        </div>

                        {/* Activo */}
                        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-neutral-300 text-green-600 focus:ring-green-500 dark:border-neutral-600"
                                checked={isActive}
                                onChange={(event) => onIsActiveChange(event.target.checked)}
                            />
                            <span className="text-neutral-700 dark:text-neutral-200">
                                Usuario activo
                            </span>
                        </label>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex flex-col gap-3 border-t border-neutral-200/70 bg-white/60 p-4 text-sm shadow-[0_-8px_16px_rgba(0,0,0,0.03)] backdrop-blur-sm dark:border-neutral-700/60 dark:bg-neutral-900/60 dark:shadow-[0_-8px_16px_rgba(0,0,0,0.6)] sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                        <span className="inline-block h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
                        Creando usuario nuevo
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            className="rounded-lg border border-neutral-300 bg-white/40 px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm ring-1 ring-neutral-200/60 transition hover:bg-white/80 dark:border-neutral-600 dark:bg-neutral-800/40 dark:text-neutral-200 dark:ring-neutral-700/60 dark:hover:bg-neutral-800"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>

                        <motion.button
                            type="submit"
                            whileTap={{ scale: 0.96 }}
                            whileHover={{ scale: 1.02 }}
                            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-green-600/30 transition hover:bg-green-700 dark:ring-green-500/30"
                        >
                            Guardar
                        </motion.button>
                    </div>
                </div>
            </form>
        </dialog>
    );
}
