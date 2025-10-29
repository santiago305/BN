import type { FormEvent } from 'react';

export type Worker = {
    id: string;
    name: string;
    dni: string;
    is_in_use: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type WorkerSidebarEntry = Pick<Worker, 'id' | 'name'>;

export type WorkerFilters = {
    is_active: string | null;
    is_in_use: string | null;
};

export type FilterWorkingHoursDay = {
    start: string;
    end: string;
};

export type FilterWorkingHours = {
    monday: FilterWorkingHoursDay;
    tuesday: FilterWorkingHoursDay;
    wednesday: FilterWorkingHoursDay;
    thursday: FilterWorkingHoursDay;
    friday: FilterWorkingHoursDay;
    saturday: FilterWorkingHoursDay;
    sunday: FilterWorkingHoursDay;
};

export type FilterConfig = {
    id: string;
    name: string;
    working_hours: FilterWorkingHours;
    captcha_type: 'cloudflare' | 'recaptcha';
    relogin_interval: number;
    filter_url: string;
    search_without_results: boolean;
    workers: WorkerSidebarEntry[];
    worker_ids: string[];
};

export type FilterConfigFormInput = {
    name: string;
    working_hours: FilterWorkingHours;
    captcha_type: 'cloudflare' | 'recaptcha';
    relogin_interval: number;
    filter_url: string;
    search_without_results: boolean;
    worker_ids: string[];
};

export type PaginationMeta = {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
};

export type WorkerStats = {
    total: number;
    active: number;
    inUse: number;
};

export type WorkerPageProps = {
    workers: Worker[];
    filters: WorkerFilters;
    pagination: PaginationMeta;
    stats: WorkerStats;
    filterConfigs: FilterConfig[];
    workerOptions: WorkerSidebarEntry[];
};

export type WorkerCreateDialogProps = {
    open: boolean;
    name: string;
    dni: string;
    password: string;
    isActive: boolean;
    onNameChange: (value: string) => void;
    onDniChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onIsActiveChange: (value: boolean) => void;
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export type WorkerEditDialogProps = {
    open: boolean;
    name: string;
    dni: string;
    password: string;
    isActive: boolean;
    isInUse: boolean;
    onNameChange: (value: string) => void;
    onDniChange: (value: string) => void;
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
    pagination: PaginationMeta;
    flashMessage?: string;
    onFlashClear?: () => void;
    onToggleInUse: (worker: Worker) => void | Promise<void>;
    onEdit: (worker: Worker) => void;
    onDeactivate: (id: string) => void | Promise<void>;
    onActivate: (id: string) => void | Promise<void>;
    onPageChange: (page: number) => void;
};

export type WorkerStatsCardsProps = {
    total: number;
    active: number;
    inUse: number;
};
