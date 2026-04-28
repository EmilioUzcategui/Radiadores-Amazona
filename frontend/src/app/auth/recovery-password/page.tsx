"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { CodeInput } from "@/components/CodeInput";
import { usersService } from "../../../../services/auth/users.service";

const RecoveryPasswordPage = () => {
	const router = useRouter();
	const searchParams = useSearchParams();

	const email = searchParams.get("email")?.trim() ?? "";
	const expiresAtParam = searchParams.get("expiresAt");

	const expiresAtTimestamp = useMemo(() => {
		if (!expiresAtParam) {
			return Date.now() + 15 * 60 * 1000;
		}

		const parsedTimestamp = new Date(expiresAtParam).getTime();
		if (Number.isNaN(parsedTimestamp)) {
			return Date.now() + 15 * 60 * 1000;
		}

		return parsedTimestamp;
	}, [expiresAtParam]);

	const [code, setCode] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [secondsRemaining, setSecondsRemaining] = useState(0);

	useEffect(() => {
		const updateCountdown = () => {
			const remaining = Math.max(0, Math.floor((expiresAtTimestamp - Date.now()) / 1000));
			setSecondsRemaining(remaining);
		};

		updateCountdown();
		const intervalId = window.setInterval(updateCountdown, 1000);

		return () => {
			window.clearInterval(intervalId);
		};
	}, [expiresAtTimestamp]);

	const formattedCountdown = useMemo(() => {
		const minutes = Math.floor(secondsRemaining / 60);
		const seconds = secondsRemaining % 60;
		return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	}, [secondsRemaining]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!email) {
			await Swal.fire({
				title: "Sesión de recuperación inválida",
				text: "Debes iniciar el proceso desde la pantalla de inicio de sesión.",
				icon: "warning",
				confirmButtonText: "Volver",
			});
			router.push("/auth");
			return;
		}

		if (secondsRemaining <= 0) {
			await Swal.fire({
				title: "Código expirado",
				text: "Tu código venció. Solicita uno nuevo desde el inicio de sesión.",
				icon: "error",
				confirmButtonText: "Entendido",
			});
			return;
		}

		if (!/^\d{6}$/.test(code)) {
			await Swal.fire({
				title: "Código inválido",
				text: "Ingresa un código de 6 dígitos.",
				icon: "warning",
				confirmButtonText: "Entendido",
			});
			return;
		}

		try {
			setIsSubmitting(true);
			const response = await usersService.verifyRecoveryCode(email, code);

			if (!response.success) {
				throw new Error(response.message || "No se pudo verificar el código");
			}

			await Swal.fire({
				title: "Código verificado",
				text: "Ahora puedes crear tu nueva contraseña.",
				icon: "success",
				confirmButtonText: "Continuar",
			});

			router.push(
				`/auth/recovery-password/new-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`,
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : "No se pudo verificar el código";
			await Swal.fire({
				title: "Verificación fallida",
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
				<Link href="/auth" className="absolute top-6 left-6 text-sm font-label uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors">
					&larr; Volver al inicio de sesión
				</Link>

				<div className="w-full max-w-4xl border border-outline-variant bg-surface-container-low overflow-hidden grid grid-cols-1 lg:grid-cols-2">
					<div className="hidden lg:flex flex-col justify-between p-10 border-r border-outline-variant">
						<div>
							<span className="inline-block bg-primary-container/15 border-l-4 border-primary px-4 py-2 mb-8 text-primary font-headline font-bold tracking-widest text-xs uppercase">
								Recuperación Segura
							</span>

							<h1 className="font-headline text-5xl font-black leading-[0.95] tracking-tighter uppercase mb-6">
								Verifica tu <span className="text-primary">Código</span>
							</h1>

							<p className="text-on-surface-variant text-base leading-relaxed max-w-md">
								Ingresa el código que enviamos a tu correo corporativo para continuar con el cambio de contraseña.
							</p>
						</div>

						<div className="space-y-3 text-xs uppercase tracking-widest text-on-surface-variant">
							<p>Paso 1: validación por correo</p>
							<p>Paso 2: nueva contraseña segura</p>
							<p>Paso 3: acceso al dashboard</p>
						</div>
					</div>

					<div className="p-8 md:p-10 lg:p-12">
						<div className="mb-8">
							<h2 className="font-headline text-3xl md:text-4xl font-black tracking-tighter uppercase">
								Código de Verificación
							</h2>
							<p className="mt-3 text-on-surface-variant">
								Introduce el código de 6 dígitos que recibiste en tu correo.
							</p>
							<p className={`mt-3 text-sm font-label uppercase tracking-widest ${secondsRemaining <= 60 ? "text-error" : "text-primary"}`}>
								Tiempo restante: {formattedCountdown}
							</p>
							{email && (
								<p className="mt-2 text-xs text-on-surface-variant">Correo: {email}</p>
							)}
						</div>

						<form className="space-y-6" onSubmit={handleSubmit}>
							<CodeInput
								length={6}
								label="Código"
								value={code}
								onChange={setCode}
								disabled={isSubmitting || secondsRemaining <= 0}
							/>

							<button
								type="submit"
								disabled={isSubmitting || secondsRemaining <= 0}
								className="w-full thermal-gradient text-on-primary-container px-6 py-4 font-headline font-black tracking-tighter uppercase hover:brightness-105 transition-all"
							>
								{isSubmitting ? "Verificando código..." : "Continuar"}
							</button>
						</form>
					</div>
				</div>
			</section>
		</main>
	);
};

export default RecoveryPasswordPage;
