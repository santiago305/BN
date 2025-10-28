import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion'; // Importamos AnimatePresence

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [open, setOpen] = useState<Record<string, boolean>>({});

    // Función para alternar el submenú
    const toggleSubmenu = (title: string) => {
        setOpen(prevState => ({
            ...prevState,
            [title]: !prevState[title],
        }));
    };

    // Efecto para mantener abierto el submenú de "Usuarios" cuando estamos en la ruta correspondiente
    useEffect(() => {
        // Si estamos en la página de "Usuarios", aseguramos que el submenú esté abierto
        if (page.url.includes('/workers')) {
            setOpen(prevState => ({
                ...prevState,
                'Usuarios': true, // Asegura que el submenú de "Usuarios" se abra
            }));
        }
    }, [page.url]); // Se ejecuta cada vez que cambia la URL

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={page.url.startsWith(resolveUrl(item.href))}
                            tooltip={{ children: item.title }}
                            onClick={() => item.children && toggleSubmenu(item.title)} // Activamos el submenú
                        >
                            {/* Usamos Link de Inertia para navegar sin recargar */}
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>

                        {/* Usamos AnimatePresence para manejar la animación de salida */}
                        <AnimatePresence>
                            {item.children && open[item.title] && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <SidebarMenu>
                                        {item.children.map((child) => (
                                            <SidebarMenuItem key={child.title}>
                                                <SidebarMenuButton asChild>
                                                    <Link href={child.href} prefetch>
                                                        <span>{child.title}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
