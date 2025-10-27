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
