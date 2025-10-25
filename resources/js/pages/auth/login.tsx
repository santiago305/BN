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
            <Head title="Log in" />

            {/* STATUS MESSAGE (si hay, aparece arriba de la tarjeta) */}
            {status && (
                <div className="mb-4 w-full rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-center text-[0.8rem] font-medium text-emerald-300">
                    {status}
                </div>
            )}

            {/* ====== CARD DEL FORM ====== */}
            <div
                className="
                    relative w-full rounded-2xl border border-white/10
                    bg-[linear-gradient(to_bottom_right,rgba(20,20,20,0.6),rgba(5,5,5,0.4))]
                    backdrop-blur-xl
                    shadow-[0_30px_120px_rgba(0,0,0,0.9),0_0_80px_rgba(120,64,255,0.2)]
                    p-6 text-left
                "
            >
                {/* highlight line arriba */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-linear-to-r from-transparent via-white/40 to-transparent" />

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
                                            className="text-[0.75rem] font-medium text-white/90"
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
                                            h-11 rounded-xl border border-white/10 bg-white/5
                                            text-[0.85rem] text-white placeholder:text-white/30
                                            focus:border-violet-400/40 focus:ring-0 focus:outline-none
                                        "
                                    />

                                    <InputError message={errors.email} />
                                </div>

                                {/* PASSWORD */}
                                <div className="grid gap-2">
                                    <div className="flex items-baseline justify-between">
                                        <Label
                                            htmlFor="password"
                                            className="text-[0.75rem] font-medium text-white/90"
                                        >
                                            Contraseña
                                        </Label>

                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="
                                                    text-[0.7rem] font-normal
                                                    text-violet-300/80 hover:text-violet-200
                                                    underline-offset-4 hover:underline
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
                                            h-11 rounded-xl border border-white/10 bg-white/5
                                            text-[0.85rem] text-white placeholder:text-white/30
                                            focus:border-violet-400/40 focus:ring-0 focus:outline-none
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
                                        className="mt-0.5 border-white/20 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="cursor-pointer select-none text-[0.75rem] font-normal leading-tight text-white/60"
                                    >
                                        Recuérdame en este dispositivo
                                    </Label>
                                </div>

                                {/* SUBMIT BUTTON */}
                                <Button
                                    type="submit"
                                    className="
                                        mt-2 h-11 w-full rounded-xl text-[0.9rem] font-medium
                                        shadow-[0_20px_60px_rgba(123,47,255,0.4)]
                                        bg-linear-to-r from-violet-500 to-fuchsia-500
                                        text-white
                                        hover:from-violet-400 hover:to-fuchsia-400
                                        focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-black
                                        disabled:opacity-60
                                    "
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Spinner />
                                            <span>Ingresando…</span>
                                        </span>
                                    ) : (
                                        'Iniciar sesión'
                                    )}
                                </Button>
                            </div>

                            {/* REGISTER / DIVIDER */}
                            {canRegister && (
                                <div className="pt-4 text-center text-[0.8rem] text-white/40">
                                    <div className="mb-3 flex items-center gap-3 text-[0.7rem] uppercase tracking-wide text-white/30">
                                        <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                                        <span>¿No tienes cuenta?</span>
                                        <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                                    </div>

                                    <TextLink
                                        href={register()}
                                        tabIndex={5}
                                        className="font-medium text-violet-300 hover:text-violet-200 underline-offset-4 hover:underline"
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
            <p className="mt-6 text-center text-[0.7rem] leading-relaxed text-white/30">
                Al continuar aceptas nuestros Términos y Política de
                Privacidad.
            </p>
        </AuthLayout>
    );
}
