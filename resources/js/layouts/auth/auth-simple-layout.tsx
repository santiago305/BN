import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div
            className={`
                relative flex min-h-screen w-full items-center justify-center px-4 py-10
                bg-white text-gray-900
                dark:bg-[#050505] dark:text-white
                bg-[radial-gradient(circle_at_70%_80%,rgba(255,0,128,0.05)_0%,transparent_60%)]
                dark:bg-[radial-gradient(circle_at_20%_20%,rgba(80,80,255,0.18)_0%,transparent_60%),radial-gradient(circle_at_80%_30%,rgba(255,0,128,0.15)_0%,transparent_60%)]
                overflow-hidden
                transition-colors duration-500
            `}
        >
            {/* Glow blur central */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.04)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)] blur-3xl" />
            </div>

            {/* Contenido centrado */}
            <div className="relative w-full max-w-[380px] flex flex-col items-center text-center">
                {/* Logo / marca */}
                <Link
                    href={home()}
                    className="flex flex-col items-center gap-3 font-medium"
                >
                    <div
                        className="
                            flex h-12 w-12 items-center justify-center rounded-md
                            bg-[#C41D1D] dark:bg-white
                            transition-colors duration-500
                        "
                    >
                        <AppLogoIcon
                            className="
                                size-10
                                text-white dark:text-[#C41D1D]
                                transition-colors duration-500
                            "
                        />
                    </div>

                    {/* sr-only por accesibilidad */}
                    <span className="sr-only">{title}</span>
                </Link>

                {/* Heading & descripción */}
                {(title || description) && (
                    <div className="mt-6 mb-8 space-y-2 text-center">
                        {title && (
                            <h1 className="text-lg font-semibold tracking-[-0.04em]">
                                {title}
                            </h1>
                        )}
                        {description && (
                            <p className="text-[0.8rem] leading-relaxed text-gray-500 dark:text-white/50">
                                {description}
                            </p>
                        )}
                    </div>
                )}

                {/* Hijos */}
                {children}
            </div>
        </div>
    );
}
