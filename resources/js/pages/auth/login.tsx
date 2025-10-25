import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    return (
        <AuthLayout
            title="Bienvenido de nuevo"
            description="Ingresa tu correo y contraseña para continuar"
        >
            <Head title="Inicio de sesión" />

            {/* STATUS MESSAGE */}
            {status && (
                <div className="mb-4 w-full rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-center text-[0.8rem] font-medium text-emerald-600 dark:text-emerald-300">
                    {status}
                </div>
            )}

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
                {/* highlight line arriba */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-linear-to-r from-transparent via-gray-300 dark:via-white/40 to-transparent" />

                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-5">
                                {/* EMAIL */}
                                <div className="grid gap-2">
                                    <div className="flex items-baseline justify-between">
                                        <Label
                                            htmlFor="email"
                                            className="text-[0.75rem] font-medium text-gray-800 dark:text-white/90"
                                        >
                                            Correo electrónico
                                        </Label>
                                    </div>

                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="tucorreo@ejemplo.com"
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
                                    <div className="flex items-baseline justify-between">
                                        <Label
                                            htmlFor="password"
                                            className="text-[0.75rem] font-medium text-gray-800 dark:text-white/90"
                                        >
                                            Contraseña
                                        </Label>

                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="
                                                    text-[0.7rem] font-normal
                                                    text-[#C41D1D] hover:text-[#a51414]
                                                    dark:text-violet-300/80 dark:hover:text-violet-200
                                                    underline-offset-4 hover:underline
                                                    transition-colors duration-300
                                                "
                                                tabIndex={5}
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </TextLink>
                                        )}
                                    </div>

                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
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

                                {/* REMEMBER ME */}
                                <div className="flex items-start gap-2">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                        className="
                                            mt-0.5
                                            border-gray-400 data-[state=checked]:bg-[#C41D1D] data-[state=checked]:border-[#C41D1D]

                                            dark:border-white/20 dark:data-[state=checked]:bg-violet-500 dark:data-[state=checked]:border-violet-500
                                            transition-colors duration-300
                                        "
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="cursor-pointer select-none text-[0.75rem] font-normal leading-tight text-gray-600 dark:text-white/70"
                                    >
                                        Recuérdame en este dispositivo
                                    </Label>
                                </div>

                                {/* SUBMIT BUTTON */}
                                <Button
                                    type="submit"
                                    className="
                                        mt-2 h-11 w-full rounded-xl text-[0.9rem] font-medium
                                        text-white
                                        bg-linear-to-r from-[#C41D1D] to-fuchsia-500
                                        shadow-[0_10px_40px_rgba(196,29,29,0.35)]
                                        hover:from-[#a51414] hover:to-fuchsia-400
                                        focus:ring-2 focus:ring-[#C41D1D]/50 focus:ring-offset-2 focus:ring-offset-white

                                        dark:from-violet-500 dark:to-fuchsia-500 dark:shadow-[0_20px_60px_rgba(123,47,255,0.4)]
                                        dark:hover:from-violet-400 dark:hover:to-fuchsia-400
                                        dark:focus:ring-violet-500/50 dark:focus:ring-offset-black
                                        disabled:opacity-60
                                        transition-all duration-300
                                    "
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Spinner />
                                            <span>Iniciando…</span>
                                        </span>
                                    ) : (
                                        'Iniciar sesión'
                                    )}
                                </Button>
                            </div>

                            {/* REGISTER / DIVIDER */}
                            {canRegister && (
                                <div className="pt-4 text-center text-[0.8rem] text-gray-500 dark:text-white/50 transition-colors duration-300">
                                    <div className="mb-3 flex items-center gap-3 text-[0.7rem] uppercase tracking-wide text-gray-400 dark:text-white/40">
                                        <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 dark:via-white/20 to-transparent" />
                                        <span>¿No tienes cuenta?</span>
                                        <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 dark:via-white/20 to-transparent" />
                                    </div>

                                    <TextLink
                                        href={register()}
                                        tabIndex={5}
                                        className="
                                            font-medium
                                            text-[#C41D1D] hover:text-[#a51414]
                                            dark:text-violet-300 dark:hover:text-violet-200
                                            underline-offset-4 hover:underline
                                            transition-colors duration-300
                                        "
                                    >
                                        Crear una cuenta
                                    </TextLink>
                                </div>
                            )}
                        </>
                    )}
                </Form>
            </div>

            {/* LEGAL */}
            <p className="mt-6 text-center text-[0.7rem] leading-relaxed text-gray-500 dark:text-white/40 transition-colors duration-300">
                Al continuar aceptas nuestros Términos y Política de Privacidad.
            </p>
        </AuthLayout>
    );
}
