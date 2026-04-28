"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import { PasswordInput } from "@/components/PasswordInput";
import { usersService } from "../../../../../services/auth/users.service";

const NewPasswordPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const email = searchParams.get("email")?.trim() ?? "";
    const code = searchParams.get("code")?.trim() ?? "";

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!email || !code) {
            await Swal.fire({
                title: "Sesión de recuperación inválida",
                text: "Debes verificar el código antes de crear una nueva contraseña.",
                icon: "warning",
                confirmButtonText: "Entendido",
            });
            router.push("/auth/recovery-password");
            return;
        }

        const formData = new FormData(event.currentTarget);
        const newPassword = String(formData.get("newPassword") ?? "").trim();
        const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

        if (newPassword.length < 6) {
            await Swal.fire({
                title: "Contraseña inválida",
                text: "La nueva contraseña debe tener al menos 6 caracteres.",
                icon: "warning",
                confirmButtonText: "Entendido",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            await Swal.fire({
                title: "Contraseñas diferentes",
                text: "La confirmación no coincide con la nueva contraseña.",
                icon: "warning",
                confirmButtonText: "Entendido",
            });
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await usersService.resetPassword(email, code, newPassword);

            if (!response.success) {
                throw new Error(response.message || "No se pudo restablecer la contraseña");
            }

            await Swal.fire({
                title: "Contraseña actualizada",
                text: "Ya puedes iniciar sesión con tu nueva contraseña.",
                icon: "success",
                confirmButtonText: "Ir al login",
            });

            router.push("/auth");
        } catch (error) {
            const message = error instanceof Error ? error.message : "No se pudo restablecer la contraseña";
            await Swal.fire({
                title: "Error al restablecer",
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
                <Link href="/auth/recovery-password" className="absolute top-6 left-6 text-sm font-label uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors">
                    &larr; Volver al código
                </Link>

                <div className="w-full max-w-4xl border border-outline-variant bg-surface-container-low overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                    <div className="hidden lg:flex flex-col justify-between p-10 border-r border-outline-variant">
                        <div>
                            <span className="inline-block bg-primary-container/15 border-l-4 border-primary px-4 py-2 mb-8 text-primary font-headline font-bold tracking-widest text-xs uppercase">
                                Recuperación Segura
                            </span>

                            <h1 className="font-headline text-5xl font-black leading-[0.95] tracking-tighter uppercase mb-6">
                                Crea tu <span className="text-primary">Nueva Contraseña</span>
                            </h1>

                            <p className="text-on-surface-variant text-base leading-relaxed max-w-md">
                                Define una contraseña robusta y confirma el cambio para volver a ingresar a tu panel.
                            </p>
                        </div>

                        <div className="space-y-3 text-xs uppercase tracking-widest text-on-surface-variant">
                            <p>Mínimo 8 caracteres</p>
                            <p>Combina letras y números</p>
                            <p>Evita contraseñas anteriores</p>
                        </div>
                    </div>

                    <div className="p-8 md:p-10 lg:p-12">
                        <div className="mb-8">
                            <h2 className="font-headline text-3xl md:text-4xl font-black tracking-tighter uppercase">
                                Restablecer Contraseña
                            </h2>
                            <p className="mt-3 text-on-surface-variant">
                                Ingresa tu nueva contraseña y confírmala para finalizar.
                            </p>
                            {email && (
                                <p className="mt-3 text-xs uppercase tracking-widest text-on-surface-variant">
                                    Correo: {email}
                                </p>
                            )}
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <PasswordInput
                                id="newPassword"
                                name="newPassword"
                                label="Nueva Contraseña"
                                required
                            />

                            <PasswordInput
                                id="confirmPassword"
                                name="confirmPassword"
                                label="Confirmar Contraseña"
                                required
                            />

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full thermal-gradient text-on-primary-container px-6 py-4 font-headline font-black tracking-tighter uppercase hover:brightness-105 transition-all"
                            >
                                {isSubmitting ? "Guardando contraseña..." : "Guardar Nueva Contraseña"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default NewPasswordPage;
