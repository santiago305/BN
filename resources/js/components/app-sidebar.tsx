import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { indexPage } from '@/routes/workers';
import { type NavItem } from '@/types';
import { type WorkerSidebarEntry } from '@/types/worker';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, User } from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { props } = usePage<{ sidebarWorkers?: WorkerSidebarEntry[] }>();

    const sidebarWorkers = useMemo(
        () => (Array.isArray(props.sidebarWorkers) ? props.sidebarWorkers : []),
        [props.sidebarWorkers],
    );

    const workerChildren = useMemo<NavItem[]>(
        () =>
            sidebarWorkers.map((worker) => ({
                title: worker.name,
                href: `/workers/${worker.id}`,
            })),
        [sidebarWorkers],
    );

    const mainNavItems = useMemo<NavItem[]>(
        () => [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
            {
                title: 'Usuarios',
                href: indexPage(),
                icon: User,
                ...(workerChildren.length > 0
                    ? { children: workerChildren }
                    : {}),
            },
        ],
        [workerChildren],
    );

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
