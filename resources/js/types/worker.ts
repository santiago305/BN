import type { FormEvent } from 'react';

export type Worker = {
    id: number;
    name: string;
    is_in_use: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type WorkerFilters = {
    is_active: string | null;
    is_in_use: string | null;
};

export type WorkerPageProps = {
    workers: Worker[];
    filters: WorkerFilters;
};

export type WorkerCreateDialogProps = {
    open: boolean;
    name: string;
    password: string;
    isActive: boolean;
    onNameChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onIsActiveChange: (value: boolean) => void;
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export type WorkerEditDialogProps = {
    open: boolean;
    name: string;
    password: string;
    isActive: boolean;
    isInUse: boolean;
    onNameChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onIsActiveChange: (value: boolean) => void;
    onIsInUseChange: (value: boolean) => void;
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export type WorkerFilterControlsProps = {
    filterActive: string;
    filterInUse: string;
    onFilterActiveChange: (value: string) => void;
    onFilterInUseChange: (value: string) => void;
    onApply: () => void;
};

export type WorkerTableProps = {
    workers: Worker[];
    flashMessage?: string;
    onToggleInUse: (worker: Worker) => void | Promise<void>;
    onEdit: (worker: Worker) => void;
    onDeactivate: (id: number) => void | Promise<void>;
    onActivate: (id: number) => void | Promise<void>;
};

export type WorkerStatsCardsProps = {
    total: number;
    active: number;
    inUse: number;
};
