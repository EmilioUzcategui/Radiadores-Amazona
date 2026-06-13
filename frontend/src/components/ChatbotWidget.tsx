'use client';

import { useState } from 'react';

/**
 * ChatbotWidget — asesor virtual "AMA" de Radiadores Amazona.
 *
 * Componente puramente visual (mock). Por ahora NO se conecta con n8n ni genera
 * respuestas; sirve para capturas de la tesis. El input y los botones rápidos no
 * disparan ninguna lógica todavía.
 */

// Ícono de radiador (public/radiator-svgrepo-com.svg) inlineado para poder
// controlar el color con currentColor.
const RadiatorIcon = ({ className }: { className?: string }) => (
	<svg
		viewBox="0 0 55 55"
		fill="currentColor"
		className={className}
		aria-hidden="true"
	>
		<path d="M54,13.5h-2v-2.002C52,9.294,50.206,7.5,48,7.5s-4,1.794-4,3.998V13.5h-2v-2.002C42,9.294,40.206,7.5,38,7.5
			s-4,1.794-4,3.998V13.5h-2v-2.002C32,9.294,30.206,7.5,28,7.5s-4,1.794-4,3.998V13.5h-2v-2.002C22,9.294,20.206,7.5,18,7.5
			s-4,1.794-4,3.998V13.5h-2v-2.002C12,9.294,10.206,7.5,8,7.5s-4,1.794-4,3.998V13.5H2v-1H0v2v6v2h2v-1h2v22.002
			C4,45.706,5.794,47.5,8,47.5s4-1.794,4-3.998V42.5h2v1.002c0,2.204,1.794,3.998,4,3.998s4-1.794,4-3.998V42.5h2v1.002
			c0,2.204,1.794,3.998,4,3.998s4-1.794,4-3.998V42.5h2v1.002c0,2.204,1.794,3.998,4,3.998s4-1.794,4-3.998V42.5h2v1.002
			c0,2.204,1.794,3.998,4,3.998s4-1.794,4-3.998V21.5h2c0.553,0,1-0.447,1-1v-6C55,13.947,54.553,13.5,54,13.5z M44,15.5v4h-2v-4H44z
			 M34,15.5v4h-2v-4H34z M24,15.5v4h-2v-4H24z M14,15.5v4h-2v-4H14z M2,19.5v-4h2v4H2z M10,43.502c0,1.102-0.898,1.998-2,1.998
			s-2-0.896-2-1.998V20.5v-6v-3.002C6,10.396,6.898,9.5,8,9.5s2,0.896,2,1.998V14.5v6v20v2V43.502z M12,40.5v-19h2v19H12z M20,43.502
			c0,1.102-0.897,1.998-2,1.998s-2-0.896-2-1.998V20.5v-6v-3.002c0-1.102,0.897-1.998,2-1.998s2,0.896,2,1.998V14.5v6V43.502z
			 M22,40.5v-19h2v19H22z M30,43.502c0,1.102-0.897,1.998-2,1.998s-2-0.896-2-1.998V42.5v-2v-20v-6v-3.002
			c0-1.102,0.897-1.998,2-1.998s2,0.896,2,1.998V14.5v6v20v2V43.502z M32,40.5v-19h2v19H32z M40,43.502c0,1.102-0.897,1.998-2,1.998
			s-2-0.896-2-1.998V20.5v-6v-3.002c0-1.102,0.897-1.998,2-1.998s2,0.896,2,1.998V14.5v6v20v2V43.502z M42,40.5v-19h2v19H42z
			 M50,43.502c0,1.102-0.897,1.998-2,1.998s-2-0.896-2-1.998V20.5v-6v-3.002c0-1.102,0.897-1.998,2-1.998s2,0.896,2,1.998V14.5v6
			V43.502z M53,19.5h-1v-4h1V19.5z" />
	</svg>
);

const quickActions = ['Productos', 'Precios', 'Soporte'];

export const ChatbotWidget = () => {
	// Abierto por defecto para facilitar las capturas de la tesis.
	const [isOpen, setIsOpen] = useState(true);

	return (
		<div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 font-body">
			{/* ---------- Ventana de chat (estado abierto) ---------- */}
			{isOpen && (
				<div className="w-[360px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low shadow-2xl shadow-black/50 animate-[fadeInUp_0.25s_ease-out]">
					{/* Borde superior térmico animado */}
					<div className="h-1 w-full thermal-gradient bg-[length:200%_100%] animate-[thermalSlide_3s_linear_infinite]" />

					{/* Header */}
					<div className="flex items-center gap-3 border-b border-outline-variant bg-surface-container px-4 py-3">
						<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl thermal-gradient text-on-primary shadow-lg shadow-primary/30">
							<RadiatorIcon className="h-6 w-6" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="font-headline text-base font-bold uppercase tracking-wide leading-none">AMA</p>
							<p className="mt-1 flex items-center gap-1.5 text-xs text-on-surface-variant">
								<span className="relative flex h-2 w-2">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
									<span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
								</span>
								Asesor de radiadores · En línea
							</p>
						</div>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							aria-label="Minimizar chat"
							className="grid h-8 w-8 place-items-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-on-surface"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
								<path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</button>
					</div>

					{/* Mensajes */}
					<div className="flex flex-col gap-3 px-4 py-5">
						<div className="max-w-[85%] self-start rounded-2xl rounded-tl-md bg-surface-container-high px-4 py-3 text-sm leading-relaxed text-on-surface">
							¡Hola! Soy AMA, tu asesor de radiadores Amazona.
						</div>
						<div className="max-w-[85%] self-start rounded-2xl rounded-tl-md bg-surface-container-high px-4 py-3 text-sm leading-relaxed text-on-surface">
							¿Para qué vehículo lo buscas? Te ayudo con productos, precios y soporte.
						</div>

						{/* Indicador de "escribiendo" */}
						<div className="flex w-fit items-center gap-1.5 self-start rounded-2xl rounded-tl-md bg-surface-container-high px-4 py-4">
							<span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
							<span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
							<span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
						</div>
					</div>

					{/* Acciones rápidas */}
					<div className="flex flex-wrap gap-2 px-4 pb-4">
						{quickActions.map((action) => (
							<button
								key={action}
								type="button"
								className="flex items-center gap-1.5 rounded-full border border-primary/60 px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-on-primary"
							>
								<RadiatorIcon className="h-3.5 w-3.5" />
								{action}
							</button>
						))}
					</div>

					{/* Input */}
					<div className="flex items-center gap-2 border-t border-outline-variant bg-surface-container px-3 py-3">
						<input
							type="text"
							placeholder="Escribe tu consulta..."
							className="min-w-0 flex-1 bg-transparent px-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none"
						/>
						<button
							type="button"
							aria-label="Enviar mensaje"
							className="grid h-10 w-10 shrink-0 place-items-center rounded-full thermal-gradient text-on-primary shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
								<path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</button>
					</div>
				</div>
			)}

			{/* ---------- Burbuja flotante (estado cerrado) ---------- */}
			{!isOpen && (
				<div className="flex items-center gap-3 animate-[fadeInUp_0.25s_ease-out]">
					{/* Aquí agregamos la imagen. 
            Ajusta los valores de 'top' y 'translate' según necesites */}
					<img 
						src="public\..\..\AvatarRA_sinfondo.png" 
						alt="Asesor" 
						className="absolute -top-19 h-24 w-auto pointer-events-none z-10"
					/>
					<button
						type="button"
						onClick={() => setIsOpen(true)}
						className="group flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-high px-4 py-2.5 text-sm font-semibold text-on-surface shadow-xl shadow-black/40 transition-transform hover:-translate-y-0.5"
					>
						¿Buscas un radiador?
					</button>
					<button
						type="button"
						onClick={() => setIsOpen(true)}
						aria-label="Abrir asesor virtual"
						className="relative grid h-16 w-16 place-items-center rounded-full thermal-gradient text-on-primary shadow-xl shadow-primary/50 transition-transform hover:scale-105 active:scale-95"
					>
						<span className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
						<RadiatorIcon className="relative h-8 w-8" />
					</button>
				</div>
			)}
		</div>
	);
};
