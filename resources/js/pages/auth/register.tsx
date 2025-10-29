import { login } from '@/routes';
import { Head, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        post('/register', {
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    }

    return (
        <AuthLayout
            title="Crea tu cuenta"
            description="Ingresa tus datos para registrarte"
        >
            <Head title="Registro" />

            {/* CARD */}
            <div
                className="
                    relative w-full rounded-2xl border
                    border-gray-200/80 bg-white/90 shadow-xl
                    dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md
                    dark:shadow-[0_30px_120px_rgba(0,0,0,0.9),0_0_80px_rgba(168,85,247,0.22)]
                    p-6 text-left
                    transition-colors duration-500
                "
            >
                {/* línea highlight arriba */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-linear-to-r from-transparent via-gray-300 dark:via-white/40 to-transparent" />

                <form
                    onSubmit={submit}
                    className="flex flex-col gap-6"
                >
                    <div className="grid gap-5">
                        {/* NAME */}
                        <div className="grid gap-2">
                            <Label
                                htmlFor="name"
                                className="text-[0.75rem] font-medium text-gray-800 dark:text-white/90"
                            >
                                Nombre
                            </Label>

                            <Input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="name"
                                name="name"
                                placeholder="Nombre completo"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                className="
                                    h-11 rounded-xl
                                    border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
                                    focus:border-[#C41D1D]/60 focus:ring-0 focus:outline-none

                                    dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40
                                    dark:focus:border-violet-400/60 dark:focus:ring-0 dark:focus:outline-none
                                    transition-colors duration-300
                                "
                            />
                            <InputError message={errors.name} />
                        </div>

                        {/* EMAIL */}
                        <div className="grid gap-2">
                            <Label
                                htmlFor="email"
                                className="text-[0.75rem] font-medium text-gray-800 dark:text-white/90"
                            >
                                Correo electrónico
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                required
                                tabIndex={2}
                                autoComplete="email"
                                name="email"
                                placeholder="tucorreo@ejemplo.com"
                                value={data.email}
                                onChange={(event) => setData('email', event.target.value)}
                                className="
                                    h-11 rounded-xl
                                    border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
                                    focus:border-[#C41D1D]/60 focus:ring-0 focus:outline-none

                                    dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40
                                    dark:focus:border-violet-400/60 dark:focus:ring-0 dark:focus:outline-none
                                    transition-colors duration-300
                                "
                            />
                            <InputError message={errors.email} />
                        </div>

                        {/* PASSWORD */}
                        <div className="grid gap-2">
                            <Label
                                htmlFor="password"
                                className="text-[0.75rem] font-medium text-gray-800 dark:text-white/90"
                            >
                                Contraseña
                            </Label>

                            <Input
                                id="password"
                                type="password"
                                required
                                tabIndex={3}
                                autoComplete="new-password"
                                name="password"
                                placeholder="••••••••"
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                className="
                                    h-11 rounded-xl
                                    border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
                                    focus:border-[#C41D1D]/60 focus:ring-0 focus:outline-none

                                    dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40
                                    dark:focus:border-violet-400/60 dark:focus:ring-0 dark:focus:outline-none
                                    transition-colors duration-300
                                "
                            />
                            <InputError message={errors.password} />
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="grid gap-2">
                            <Label
                                htmlFor="password_confirmation"
                                className="text-[0.75rem] font-medium text-gray-800 dark:text-white/90"
                            >
                                Confirmar contraseña
                            </Label>

                            <Input
                                id="password_confirmation"
                                type="password"
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                name="password_confirmation"
                                placeholder="Repite tu contraseña"
                                value={data.password_confirmation}
                                onChange={(event) => setData('password_confirmation', event.target.value)}
                                className="
                                    h-11 rounded-xl
                                    border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400
                                    focus:border-[#C41D1D]/60 focus:ring-0 focus:outline-none

                                    dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40
                                    dark:focus:border-violet-400/60 dark:focus:ring-0 dark:focus:outline-none
                                    transition-colors duration-300
                                "
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        {/* SUBMIT */}
                        <Button
                            type="submit"
                            className="
                                mt-2 h-11 w-full rounded-xl text-[0.9rem] font-medium
                                text-white
                                bg-linear-to-r from-[#C41D1D] to-fuchsia-500
                                shadow-[0_10px_40px_rgba(196,29,29,0.35)]
                                hover:from-[#a51414] hover:to-fuchsia-400
                                focus:ring-2 focus:ring-[#C41D1D]/50 focus:ring-offset-2 focus:ring-offset-white

                                dark:from-violet-500 dark:to-fuchsia-500
                                dark:shadow-[0_20px_60px_rgba(123,47,255,0.4)]
                                dark:hover:from-violet-400 dark:hover:to-fuchsia-400
                                dark:focus:ring-violet-500/50 dark:focus:ring-offset-black
                                disabled:opacity-60
                                transition-all duration-300
                            "
                            tabIndex={5}
                            data-test="register-user-button"
                            disabled={processing}
                        >
                            {processing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Spinner />
                                    <span>Creando cuenta…</span>
                                </span>
                            ) : (
                                'Crear cuenta'
                            )}
                        </Button>
                    </div>

                    {/* YA TIENES CUENTA */}
                    <div className="pt-4 text-center text-[0.8rem] text-gray-500 dark:text-white/50 transition-colors duration-300">
                        <div className="mb-3 flex items-center gap-3 text-[0.7rem] uppercase tracking-wide text-gray-400 dark:text-white/40">
                            <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 dark:via-white/20 to-transparent" />
                            <span>¿Ya tienes cuenta?</span>
                            <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 dark:via-white/20 to-transparent" />
                        </div>

                        <TextLink
                            href={login()}
                            tabIndex={6}
                            className="
                                font-medium
                                text-[#C41D1D] hover:text-[#a51414]
                                dark:text-violet-300 dark:hover:text-violet-200
                                underline-offset-4 hover:underline
                                transition-colors duration-300
                            "
                        >
                            Inicia sesión
                        </TextLink>
                    </div>
                </form>
            </div>

            {/* LEGAL / FOOTNOTE */}
            <p className="mt-6 text-center text-[0.7rem] leading-relaxed text-gray-500 dark:text-white/40 transition-colors duration-300">
                Al registrarte aceptas nuestros Términos y Política de
                Privacidad.
            </p>
        </AuthLayout>
    );
}
