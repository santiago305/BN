export function getCsrfHeaders(extra: Record<string, string> = {}): Record<string, string> {
    if (typeof document === 'undefined') {
        return { ...extra };
    }

    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    return {
        ...(token ? { 'X-CSRF-TOKEN': token } : {}),
        ...extra,
    };
}
