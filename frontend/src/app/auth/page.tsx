'use client';

import Link from "next/link";
import { useState } from "react";
import Swal from "../../lib/swal";
import { useRouter } from "next/navigation";
import { usersService } from "../../../services/auth/users.service";
import { useAuthStore } from "@/store/authStore";
import { setAuthToken } from "../../../lib/api";


const Login = () => {

    type FormData = {
        email: string;
        password: string;
    };

    const [formData, setFormData] = useState<FormData>({
        email: "",
        password: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const setLogin = useAuthStore((state) => state.setLogin);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prevState) => ({
            ...prevState, // Mantiene los datos que ya estaban (ej. el email)
            [name]: value, // Actualiza solo el campo que está cambiando (ej. el password)
        }));
    };

    const router = useRouter();

    const onRequestRecoveryCode = async () => {
        let email = formData.email.trim();

        // Si el usuario no escribió su correo en el login, lo pedimos en la propia alerta.
        if (!email) {
            const { value, isConfirmed } = await Swal.fire({
                title: "Recuperar contraseña",
                text: "Ingresa tu correo y te enviaremos el código de recuperación.",
                icon: "info",
                input: "email",
                inputPlaceholder: "tucorreo@ejemplo.com",
                showCancelButton: true,
                confirmButtonText: "Enviar código",
                cancelButtonText: "Cancelar",
                inputValidator: (value) => {
                    const correo = value.trim();
                    if (!correo) {
                        return "Escribe tu correo para continuar.";
                    }
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(correo)) {
                        return "Ingresa un correo válido.";
                    }
                    return undefined;
                },
            });

            if (!isConfirmed || !value) {
                return;
            }

            email = value.trim();
            // Reflejamos el correo ingresado en el formulario del login.
            setFormData((prevState) => ({ ...prevState, email }));
        }

        try {
            setIsSubmitting(true);
            const response = await usersService.requestPasswordRecoveryCode(email);

            if (!response.success) {
                throw new Error(response.message || "No fue posible enviar el código");
            }

            await Swal.fire({
                title: "Código enviado",
                text: `Revisa tu correo ${email} para continuar con la recuperación.`,
                icon: "success",
                confirmButtonText: "Continuar",
            });

            const expiresAt = response.data?.expiresAt;
            const recoveryUrl = expiresAt
                ? `/auth/recovery-password?email=${encodeURIComponent(email)}&expiresAt=${encodeURIComponent(expiresAt)}`
                : `/auth/recovery-password?email=${encodeURIComponent(email)}`;

            router.push(recoveryUrl);
        } catch (error) {
            const message = error instanceof Error ? error.message : "No fue posible enviar el código";
            await Swal.fire({
                title: "Error al enviar código",
                text: message,
                icon: "error",
                confirmButtonText: "Reintentar",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            await Swal.fire({
                title: "Datos incompletos",
                text: "Debes ingresar correo y contraseña.",
                icon: "warning",
                confirmButtonText: "Entendido",
            });
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await usersService.login(formData.email, formData.password);

            if (!response.success || !response.token || !response.data) {
                throw new Error("Respuesta de autenticación inválida");
            }

            setLogin(response.token, {
                id: response.data.id,
                email: response.data.email,
                names: response.data.names,
                last_names: response.data.last_names,
            });
            setAuthToken(response.token);

            await Swal.fire({
                title: "¡Bienvenido!",
                text: `Sesión iniciada para ${response.data.names}.`,
                icon: "success",
                confirmButtonText: "Ir al Dashboard"
            });

            router.push("/dashboard");
        } catch (error) {
            const message = error instanceof Error ? error.message : "No fue posible iniciar sesión";
            await Swal.fire({
                title: "Error de autenticación",
                text: message,
                icon: "error",
                confirmButtonText: "Reintentar",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-surface text-on-surface radiator-grid">
            <section className="container mx-auto px-6 md:px-8 py-16 md:py-24 flex items-center justify-center min-h-screen">
                <Link href="/" className="absolute top-6 left-6 text-sm font-label uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors">
                    &larr; Volver al sitio
                </Link>

                <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 border border-outline-variant bg-surface-container-low overflow-hidden">
                    <div className="hidden lg:flex flex-col justify-between p-10 border-r border-outline-variant">
                        <div>
                            <span className="inline-block bg-primary-container/15 border-l-4 border-primary px-4 py-2 mb-8 text-primary font-headline font-bold tracking-widest text-xs uppercase">
                                Acceso Seguro
                            </span>
                            <h1 className="font-headline text-5xl font-black leading-[0.95] tracking-tighter uppercase mb-6">
                                Panel de <span className="text-primary">Control</span>
                            </h1>
                            <p className="text-on-surface-variant text-base leading-relaxed max-w-md">
                                Inicia sesión para gestionar indicadores comerciales y CRM de Radiadores Amazona.
                            </p>
                        </div>

                    </div>

                    <div className="p-8 md:p-10 lg:p-12">
                        <div className="mb-8">
                            <h2 className="font-headline text-3xl md:text-4xl font-black tracking-tighter uppercase">
                                Iniciar Sesión
                            </h2>
                            <p className="mt-3 text-on-surface-variant">
                                Ingresa tus credenciales para acceder al dashboard.
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={onSubmit}>
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-label uppercase tracking-wider text-on-surface-variant">
                                    Correo
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="tu@empresa.com"
                                    className="w-full bg-surface-container border border-outline-variant px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary"
                                    value={formData.email}
                                    onChange={handleChange}

                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-label uppercase tracking-wider text-on-surface-variant">
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-surface-container border border-outline-variant px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary"
                                    value={formData.password}
                                    onChange={handleChange}
                                />

                                <div className="mt-3 text-right">
                                    <button
                                        type="button"
                                        onClick={onRequestRecoveryCode}
                                        disabled={isSubmitting}
                                        className="text-sm font-label uppercase tracking-wider text-primary hover:brightness-110 transition-all disabled:opacity-60"
                                    >
                                        ¿Se te olvidó la contraseña?
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full thermal-gradient text-on-primary-container px-6 py-4 font-headline font-black tracking-tighter uppercase hover:brightness-105 transition-all"
                            >
                                {isSubmitting ? "Validando credenciales..." : "Entrar al Dashboard"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Login;
