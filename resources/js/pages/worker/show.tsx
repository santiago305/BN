import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { indexPage } from '@/routes/workers';
import { type BreadcrumbItem } from '@/types';
import { type Worker } from '@/types/worker';
import { Head } from '@inertiajs/react';

interface WorkerShowPageProps {
    worker: Worker;
}

const formatDateTime = (value?: string | null) => {
    if (!value) {
        return '—';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleString();
};

export default function WorkerShowPage({ worker }: WorkerShowPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Usuarios', href: indexPage().url },
        { title: worker.name, href: `/workers/${worker.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Usuario: ${worker.name}`} />

            <div className="space-y-6 px-4 py-6 md:px-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold text-foreground">
                            {worker.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Información detallada del usuario seleccionado.
                        </p>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                DNI
                            </span>
                            <p className="text-sm font-medium text-foreground">
                                {worker.dni}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Estado
                            </span>
                            <div>
                                {worker.is_active ? (
                                    <Badge variant="default">Activo</Badge>
                                ) : (
                                    <Badge variant="destructive">Inactivo</Badge>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Uso actual
                            </span>
                            <div>
                                {worker.is_in_use ? (
                                    <Badge variant="secondary">En uso</Badge>
                                ) : (
                                    <Badge variant="outline">Disponible</Badge>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Creado
                            </span>
                            <p className="text-sm text-foreground">
                                {formatDateTime(worker.created_at)}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Última actualización
                            </span>
                            <p className="text-sm text-foreground">
                                {formatDateTime(worker.updated_at)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
