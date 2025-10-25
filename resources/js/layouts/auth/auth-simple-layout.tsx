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
                relative flex min-h-[100vh] w-full items-center justify-center px-4 py-10
                bg-[#050505]
                bg-[radial-gradient(circle_at_20%_20%,rgba(80,80,255,0.18)_0%,transparent_60%),radial-gradient(circle_at_80%_30%,rgba(255,0,128,0.15)_0%,transparent_60%)]
                overflow-hidden
                text-white
            `}
        >
            {/* Glow blur central */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[240px] w-[240px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)] blur-3xl" />
            </div>

            {/* Contenido centrado */}
            <div className="relative w-full max-w-[380px] flex flex-col items-center text-center">
                {/* Logo / marca */}
                <Link
                    href={home()}
                    className="flex flex-col items-center gap-3 font-medium"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md">
                        <AppLogoIcon className="size-9 fill-current text-white" />
                    </div>

                    {/* sr-only por accesibilidad, en caso de que uses screen readers */}
                    <span className="sr-only">{title}</span>
                </Link>

                {/* Heading & descripción */}
                {(title || description) && (
                    <div className="mt-6 mb-8 space-y-2 text-center">
                        {title && (
                            <h1 className="text-lg font-semibold tracking-[-0.04em] text-white">
                                {title}
                            </h1>
                        )}

                        {description && (
                            <p className="text-[0.8rem] leading-relaxed text-white/50">
                                {description}
                            </p>
                        )}
                    </div>
                )}

                {/* Aquí va el hijo (form card y demás) */}
                {children}
            </div>
        </div>
    );
}
