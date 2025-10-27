import { getCsrfHeaders } from '@/lib/csrf';
import { type Worker } from '@/types/worker';

export interface WorkerFilters {
    is_active?: string;
    is_in_use?: string;
}

export interface CreateWorkerPayload {
    name: string;
    password: string;
    is_active: boolean;
    is_in_use: boolean;
}

export interface UpdateWorkerPayload {
    name: string;
    password?: string;
    is_active: boolean;
    is_in_use: boolean;
}

async function request(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const res = await fetch(input, init);
    if (!res.ok) {
        throw new Error('Request failed');
    }
    return res;
}

export async function fetchWorkers(filters?: WorkerFilters): Promise<Worker[]> {
    const params = new URLSearchParams();
    if (filters?.is_active && filters.is_active !== '') {
        params.set('is_active', filters.is_active);
    }
    if (filters?.is_in_use && filters.is_in_use !== '') {
        params.set('is_in_use', filters.is_in_use);
    }

    const query = params.toString();
    const url = query ? `/api/workers?${query}` : '/api/workers';
    const res = await request(url);
    return (await res.json()) as Worker[];
}

export async function createWorker(payload: CreateWorkerPayload): Promise<Worker> {
    const res = await request('/api/workers', {
        method: 'POST',
        headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
    });
    return (await res.json()) as Worker;
}

export async function updateWorker(id: number, payload: UpdateWorkerPayload): Promise<Worker> {
    const res = await request(`/api/workers/${id}`, {
        method: 'PATCH',
        headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
    });
    return (await res.json()) as Worker;
}

export async function deactivateWorker(id: number): Promise<void> {
    await request(`/api/workers/${id}`, {
        method: 'DELETE',
        headers: getCsrfHeaders(),
    });
}

export async function activateWorker(id: number): Promise<Worker> {
    const res = await request(`/api/workers/${id}`, {
        method: 'PATCH',
        headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ is_active: true }),
    });
    return (await res.json()) as Worker;
}

export async function updateWorkerInUse(id: number, isInUse: boolean): Promise<Worker> {
    const res = await request(`/api/workers/${id}/in-use`, {
        method: 'PATCH',
        headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ is_in_use: isInUse }),
    });
    return (await res.json()) as Worker;
}
