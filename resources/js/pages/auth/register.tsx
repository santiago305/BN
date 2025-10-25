import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    return (
        <AuthLayout
            title="Crea tu cuenta"
            description="Ingresa tus datos para registrarte"
        >
            <Head title="Registro" />

            {/* CARD de registro */}
            <div
                className="
                    relative w-full rounded-2xl border border-white/10
                    bg-[linear-gradient(to_bottom_right,rgba(20,20,20,0.6),rgba(5,5,5,0.4))]
                    backdrop-blur-xl
                    shadow-[0_30px_120px_rgba(0,0,0,0.9),0_0_80px_rgba(120,64,255,0.2)]
                    p-6 text-left text-white
                "
            >
                {/* línea highlight arriba */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-linear-to-r from-transparent via-white/40 to-transparent" />

                <Form
                    {...store.form()}
                    resetOnSuccess={['password', 'password_confirmation']}
                    disableWhileProcessing
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-5">
                                {/* NAME */}
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="name"
                                        className="text-[0.75rem] font-medium text-white/90"
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
                                        className="
                                            h-11 rounded-xl border border-white/10 bg-white/5
                                            text-[0.85rem] text-white placeholder:text-white/30
                                            focus:border-violet-400/40 focus:ring-0 focus:outline-none
                                        "
                                    />

                                    <InputError
                                        message={errors.name}
                                    />
                                </div>

                                {/* EMAIL */}
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-[0.75rem] font-medium text-white/90"
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
                                    <Label
                                        htmlFor="password"
                                        className="text-[0.75rem] font-medium text-white/90"
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
                                        className="
                                            h-11 rounded-xl border border-white/10 bg-white/5
                                            text-[0.85rem] text-white placeholder:text-white/30
                                            focus:border-violet-400/40 focus:ring-0 focus:outline-none
                                        "
                                    />

                                    <InputError message={errors.password} />
                                </div>

                                {/* CONFIRM PASSWORD */}
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="password_confirmation"
                                        className="text-[0.75rem] font-medium text-white/90"
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
                                        className="
                                            h-11 rounded-xl border border-white/10 bg-white/5
                                            text-[0.85rem] text-white placeholder:text-white/30
                                            focus:border-violet-400/40 focus:ring-0 focus:outline-none
                                        "
                                    />

                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                {/* SUBMIT */}
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
                            <div className="pt-4 text-center text-[0.8rem] text-white/40">
                                <div className="mb-3 flex items-center gap-3 text-[0.7rem] uppercase tracking-wide text-white/30">
                                    <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                                    <span>¿Ya tienes cuenta?</span>
                                    <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                                </div>

                                <TextLink
                                    href={login()}
                                    tabIndex={6}
                                    className="font-medium text-violet-300 hover:text-violet-200 underline-offset-4 hover:underline"
                                >
                                    Inicia sesión
                                </TextLink>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            {/* LEGAL / FOOTNOTE */}
            <p className="mt-6 text-center text-[0.7rem] leading-relaxed text-white/30">
                Al registrarte aceptas nuestros Términos y Política de
                Privacidad.
            </p>
        </AuthLayout>
    );
}
