'use client';

import { useState } from 'react';
import { InventoryActionModal, type InventoryDrillDownDetails } from './InventoryActionModal';

type PredictiveItem = (typeof predictiveData.analisis_predictivo)[number];

type InquiryRow = {
	fecha: string;
	cliente: string;
	canal: string;
	cantidad?: number;
};

function generateCompetitorPricesUSD30d(sku: string) {
	const seed = sku.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
	const base = 80 + (seed % 70);
	const volatility = 2 + (seed % 4);

	return Array.from({ length: 30 }, (_, index) => {
		const weekWave = Math.sin((index / 7) * Math.PI * 2) * volatility;
		const drift = (index - 15) * 0.05;
		const value = base + weekWave + drift;
		return Number(value.toFixed(2));
	});
}

const inquiriesMockBySku: Record<string, InquiryRow[]> = {
	'RAD-TOY-001': [
		{ fecha: '2026-04-28', cliente: 'Minería Andina', canal: 'WhatsApp', cantidad: 2 },
		{ fecha: '2026-04-26', cliente: 'Translog Norte', canal: 'Llamada', cantidad: 1 },
		{ fecha: '2026-04-24', cliente: 'Agrofrío S.A.', canal: 'Instagram', cantidad: 1 },
		{ fecha: '2026-04-22', cliente: 'Planta Delta', canal: 'Web', cantidad: 3 },
		{ fecha: '2026-04-20', cliente: 'Taller Rápido', canal: 'WhatsApp', cantidad: 1 },
		{ fecha: '2026-04-18', cliente: 'Repuestos Central', canal: 'Web', cantidad: 2 },
	],
	'RAD-CHEV-042': [
		{ fecha: '2026-04-27', cliente: 'Taller La Estrella', canal: 'WhatsApp', cantidad: 1 },
		{ fecha: '2026-04-23', cliente: 'Repuestos Express', canal: 'Web', cantidad: 1 },
		{ fecha: '2026-04-19', cliente: 'Transporte Ávila', canal: 'Llamada', cantidad: 2 },
	],
	'RAD-TOY-002': [
		{ fecha: '2026-04-25', cliente: 'Agrofrío S.A.', canal: 'Web', cantidad: 1 },
		{ fecha: '2026-04-21', cliente: 'Tienda El Motor', canal: 'Instagram', cantidad: 1 },
		{ fecha: '2026-04-17', cliente: 'Minería Andina', canal: 'Llamada', cantidad: 1 },
	],
};

function getInventoryDrillDownDetails(sku: string): InventoryDrillDownDetails {
	return {
		precioCompetenciaUSD30d: generateCompetitorPricesUSD30d(sku),
		consultasClientes: inquiriesMockBySku[sku] ?? [
			{ fecha: '2026-04-28', cliente: 'Cliente demo', canal: 'Web', cantidad: 1 },
		],
	};
}

// --- DATA MOCK ORIGINAL ---
const metrics = [
	{ label: 'Ventas del Mes', value: '$128.400', trend: '+12.8%' },
	{ label: 'Leads Activos', value: '86', trend: '+6.1%' },
	{ label: 'Tasa de Conversión', value: '24.5%', trend: '+2.3%' },
	{ label: 'Tickets Abiertos', value: '14', trend: '-8.4%' },
];

const opportunities = [
	{ cliente: 'Minería Andina', etapa: 'Negociación', monto: '$36.000' },
	{ cliente: 'Agrofrío S.A.', etapa: 'Presentación', monto: '$18.500' },
	{ cliente: 'Translog Norte', etapa: 'Calificación', monto: '$9.200' },
	{ cliente: 'Planta Delta', etapa: 'Cierre', monto: '$52.700' },
];

const customerBehaviorMetrics = [
	{ label: 'Producto Más Preguntado', value: 'Radiador Toyota Hilux 2018' },
	{ label: 'Radiador Más Preguntado', value: 'RAD-TOY-001' },
	{ label: 'Radiador Menos Preguntado', value: 'RAD-CHEV-042' },
	{ label: 'Producto Más Vendido', value: 'Radiador Ford Cargo 1722' },
	{ label: 'Producto Menos Vendido', value: 'Radiador Iveco Daily 35S14' },
	{ label: 'Momento de Mayor Tráfico', value: '10:00 a.m. - 12:00 p.m.' },
];

const customerSegmentation = {
	ubicacionPorEstado: [
		{ estado: 'Carabobo', clientes: 42 },
		{ estado: 'Maracay', clientes: 31 },
		{ estado: 'Distrito Capital', clientes: 19 },
		{ estado: 'Lara', clientes: 14 },
	],
	tipoPersona: [
		{ tipo: 'Jurídica', porcentaje: 67 },
		{ tipo: 'Natural', porcentaje: 33 },
	],
	perfilCliente: [
		{ categoria: 'Tienda de repuestos', porcentaje: 44 },
		{ categoria: 'Taller', porcentaje: 28 },
		{ categoria: 'Transporte', porcentaje: 21 },
		{ categoria: 'Ninguna', porcentaje: 7 },
	],
};

// --- NUEVA DATA MOCK DEL AGENTE N8N ---
const predictiveData = {
	analisis_predictivo: [
		{
			sku: "RAD-TOY-001",
			metricas: { nivel_urgencia: "CRÍTICA", oportunidad_arbitraje_usd: 50, indice_rentabilidad_importacion: "ALTO" },
			recomendacion: {
				accion_sugerida: "IMPORTAR_INMEDIATO",
				cantidad_sugerida_comprar: 5,
				razonamiento_comercial: "El stock actual está por debajo del mínimo, y existe una alta oportunidad de arbitraje de $50.00 por unidad. El MOQ del proveedor coincide con nuestra necesidad mínima de stock, haciendo la importación inmediata rentable y urgente."
			}
		},
		{
			sku: "RAD-TOYdd-001",
			metricas: { nivel_urgencia: "CRÍTICA", oportunidad_arbitraje_usd: 50, indice_rentabilidad_importacion: "ALTO" },
			recomendacion: {
				accion_sugerida: "IMPORTAR_INMEDIATO",
				cantidad_sugerida_comprar: 5,
				razonamiento_comercial: "El stock actual está por debajo del mínimo, y existe una alta oportunidad de arbitraje de $50.00 por unidad. El MOQ del proveedor coincide con nuestra necesidad mínima de stock, haciendo la importación inmediata rentable y urgente."
			}
		},
		{
			sku: "RAD-CHEV-042",
			metricas: { nivel_urgencia: "BAJA", oportunidad_arbitraje_usd: 6, indice_rentabilidad_importacion: "BAJO" },
			recomendacion: {
				accion_sugerida: "MANTENER_INVENTARIO",
				cantidad_sugerida_comprar: 0,
				razonamiento_comercial: "El stock actual es saludable y la oportunidad de arbitraje es baja ($6.00). El MOQ de 100 unidades es demasiado alto para la demanda actual, no justificando una importación."
			}
		},
		{
			sku: "RAD-TOY-002",
			metricas: { nivel_urgencia: "BAJA", oportunidad_arbitraje_usd: 80, indice_rentabilidad_importacion: "BAJO" },
			recomendacion: {
				accion_sugerida: "RENEGOCIAR_CON_PROVEEDOR_LOCAL",
				cantidad_sugerida_comprar: 0,
				razonamiento_comercial: "Aunque el stock es adecuado, existe una alta oportunidad de arbitraje de $80.00. Sin embargo, el MOQ de 100 unidades es excesivo, por lo que se recomienda usar esta información para negociar mejores precios con proveedores locales."
			}
		}
	],
	resumen_ejecutivo: "El portafolio presenta una necesidad crítica de reposición para el SKU RAD-TOY-001, con una excelente oportunidad de arbitraje que justifica la importación inmediata. Para los SKUs RAD-CHEV-042 y RAD-TOY-002, el inventario es saludable, pero el RAD-TOY-002 muestra una oportunidad de arbitraje significativa que, aunque no viable para importación directa por alto MOQ, puede ser una palanca fuerte para renegociar con proveedores locales."
};

export const DashBoard = () => {
	const itemsPerPage = 3;
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedItem, setSelectedItem] = useState<PredictiveItem | null>(null);

	const totalPages = Math.max(1, Math.ceil(predictiveData.analisis_predictivo.length / itemsPerPage));
	const paginatedPredictiveData = predictiveData.analisis_predictivo.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);
	const maxEstadoClientes = Math.max(...customerSegmentation.ubicacionPorEstado.map((item) => item.clientes));

	return (
		<section className="space-y-8">
			{/* HEADER ORIGINAL */}
			<header className="border border-outline-variant bg-surface-container-low p-6 md:p-8">
				<p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3">Resumen General</p>
				<h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter uppercase">
					Métricas Comerciales
				</h1>
				<p className="text-on-surface-variant mt-4 max-w-2xl">
					Vista preliminar del dashboard con datos mock para validar estructura, jerarquía visual y legibilidad.
				</p>
			</header>

			{/* METRICAS ORIGINALES */}
			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
				{metrics.map((metric) => (
					<article key={metric.label} className="border border-outline-variant bg-surface-container p-5">
						<p className="text-xs uppercase tracking-widest text-on-surface-variant">{metric.label}</p>
						<p className="font-headline text-3xl font-black tracking-tighter mt-3">{metric.value}</p>
						<p className="text-sm text-primary mt-2 font-semibold">{metric.trend}</p>
					</article>
				))}
			</div>

			<section className="border border-outline-variant bg-surface-container-low p-6 md:p-8 space-y-6">
				<div>
					<p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3">Analítica de Clientes</p>
					<h2 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase">
						Métricas de Demanda y Segmentación
					</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
					{customerBehaviorMetrics.map((metric) => (
						<article key={metric.label} className="border border-outline-variant bg-surface-container p-5">
							<p className="text-[11px] uppercase tracking-widest text-on-surface-variant">{metric.label}</p>
							<p className="font-headline text-xl md:text-2xl font-black tracking-tighter mt-3 leading-tight">
								{metric.value}
							</p>
						</article>
					))}
				</div>

				<div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-5">
					<article className="border border-outline-variant bg-surface-container p-5 space-y-4">
						<h3 className="font-headline text-lg font-black tracking-tight uppercase">Clientes por Estado</h3>
						<div className="space-y-3">
							{customerSegmentation.ubicacionPorEstado.map((item) => (
								<div key={item.estado} className="space-y-1">
									<div className="flex items-center justify-between text-sm">
										<span className="text-on-surface-variant">{item.estado}</span>
										<span className="text-on-surface font-semibold">{item.clientes}</span>
									</div>
									<div className="h-2 bg-surface-container-highest overflow-hidden">
										<div
											className="h-full bg-primary"
											style={{ width: `${(item.clientes / maxEstadoClientes) * 100}%` }}
										/>
									</div>
								</div>
							))}
						</div>
					</article>

					<article className="border border-outline-variant bg-surface-container p-5 space-y-4">
						<h3 className="font-headline text-lg font-black tracking-tight uppercase">Tipo de Persona</h3>
						<div className="space-y-3">
							{customerSegmentation.tipoPersona.map((item) => (
								<div key={item.tipo} className="space-y-1">
									<div className="flex items-center justify-between text-sm">
										<span className="text-on-surface-variant">{item.tipo}</span>
										<span className="text-on-surface font-semibold">{item.porcentaje}%</span>
									</div>
									<div className="h-2 bg-surface-container-highest overflow-hidden">
										<div className="h-full bg-primary" style={{ width: `${item.porcentaje}%` }} />
									</div>
								</div>
							))}
						</div>
					</article>

					<article className="border border-outline-variant bg-surface-container p-5 space-y-4">
						<h3 className="font-headline text-lg font-black tracking-tight uppercase">Perfil de Cliente</h3>
						<div className="space-y-3">
							{customerSegmentation.perfilCliente.map((item) => (
								<div key={item.categoria} className="space-y-1">
									<div className="flex items-center justify-between text-sm">
										<span className="text-on-surface-variant">{item.categoria}</span>
										<span className="text-on-surface font-semibold">{item.porcentaje}%</span>
									</div>
									<div className="h-2 bg-surface-container-highest overflow-hidden">
										<div className="h-full bg-primary" style={{ width: `${item.porcentaje}%` }} />
									</div>
								</div>
							))}
						</div>
					</article>
				</div>
			</section>

			{/* NUEVO: RESUMEN EJECUTIVO AI */}
			<section className="border border-outline-variant bg-surface-container-low p-6 md:p-8 border-l-4 border-l-primary relative overflow-hidden">
				<div className="absolute top-0 right-0 p-4 opacity-10">
					{/* Icono decorativo opcional para denotar IA */}
					<svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
					</svg>
				</div>
				<div className="relative z-10">
					<p className="text-[11px] uppercase tracking-[0.2em] text-primary mb-3 font-bold">Insight Predictivo AI</p>
					<p className="text-on-surface text-base md:text-lg leading-relaxed max-w-5xl">
						{predictiveData.resumen_ejecutivo}
					</p>
				</div>
			</section>

			{/* NUEVO: CUADRICULA DE RECOMENDACIONES POR SKU */}
			<section>
				<div className="mb-4">
					<h2 className="font-headline text-2xl font-black tracking-tighter uppercase">Plan de Acción de Inventario</h2>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
					{paginatedPredictiveData.map((item) => {
						const isCritical = item.metricas.nivel_urgencia === "CRÍTICA";

						return (
								<button
									type="button"
									key={item.sku}
									onClick={() => setSelectedItem(item)}
									className="border border-outline-variant bg-surface-container p-5 flex flex-col justify-between text-left cursor-pointer hover:border-primary/70 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
								>
									<div>
									<div className="flex justify-between items-start mb-4">
										<h3 className="font-headline text-xl font-black tracking-tighter">{item.sku}</h3>
										<span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-sm ${isCritical ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-surface-container-highest text-on-surface-variant'}`}>
											{item.metricas.nivel_urgencia}
										</span>
									</div>

									<div className="space-y-3 mb-5 border-y border-outline-variant/40 py-4">
										<div className="flex justify-between items-center text-sm">
											<span className="text-on-surface-variant">Acción Sugerida:</span>
											<span className="text-on-surface font-semibold text-right text-xs uppercase tracking-wider">
												{item.recomendacion.accion_sugerida.replace(/_/g, ' ')}
											</span>
										</div>
										<div className="flex justify-between items-center text-sm">
											<span className="text-on-surface-variant">Arbitraje Detectado:</span>
											<span className="text-primary font-bold">${item.metricas.oportunidad_arbitraje_usd} USD</span>
										</div>
										{item.recomendacion.cantidad_sugerida_comprar > 0 && (
											<div className="flex justify-between items-center text-sm">
												<span className="text-on-surface-variant">Cantidad Recomendada:</span>
												<span className="text-on-surface font-semibold">{item.recomendacion.cantidad_sugerida_comprar} un.</span>
											</div>
										)}
									</div>

									<div>
										<p className="text-[11px] uppercase tracking-widest text-on-surface-variant mb-2">Razonamiento</p>
										<p className="text-sm text-on-surface-variant leading-relaxed">
											{item.recomendacion.razonamiento_comercial}
										</p>
									</div>
								</div>
							</button>
						);
					})}
				</div>

				<div className="mt-5 border border-outline-variant bg-surface-container-low p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
					<p className="text-xs uppercase tracking-widest text-on-surface-variant">
						Página {currentPage} de {totalPages}
					</p>

					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
							disabled={currentPage === 1}
							className="px-3 py-2 border border-outline-variant text-xs uppercase tracking-widest font-semibold text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/70 hover:text-primary transition-colors"
						>
							Anterior
						</button>

						{Array.from({ length: totalPages }, (_, index) => {
							const pageNumber = index + 1;
							const isActive = pageNumber === currentPage;

							return (
								<button
									type="button"
									key={pageNumber}
									onClick={() => setCurrentPage(pageNumber)}
									className={`min-w-9 px-3 py-2 border text-xs uppercase tracking-widest font-semibold transition-colors ${isActive
										? 'border-primary bg-primary-container/20 text-primary'
										: 'border-outline-variant text-on-surface hover:border-primary/70 hover:text-primary'
										}`}
								>
									{pageNumber}
								</button>
							);
						})}

						<button
							type="button"
							onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
							disabled={currentPage === totalPages}
							className="px-3 py-2 border border-outline-variant text-xs uppercase tracking-widest font-semibold text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/70 hover:text-primary transition-colors"
						>
							Siguiente
						</button>
					</div>
				</div>
			</section>

			{selectedItem && (
				<InventoryActionModal
					isOpen={Boolean(selectedItem)}
					sku={selectedItem.sku}
					urgencia={selectedItem.metricas.nivel_urgencia}
					razonamiento={selectedItem.recomendacion.razonamiento_comercial}
					detalles={getInventoryDrillDownDetails(selectedItem.sku)}
					onClose={() => setSelectedItem(null)}
				/>
			)}

			{/* TABLA PIPELINE ORIGINAL */}
			<section className="border border-outline-variant bg-surface-container-low overflow-hidden">
				<div className="px-5 md:px-6 py-4 border-b border-outline-variant">
					<h2 className="font-headline text-2xl font-black tracking-tighter uppercase">Pipeline de Oportunidades</h2>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full min-w-[560px]">
						<thead>
							<tr className="text-left text-xs uppercase tracking-widest text-on-surface-variant">
								<th className="px-5 md:px-6 py-4">Cliente</th>
								<th className="px-5 md:px-6 py-4">Etapa</th>
								<th className="px-5 md:px-6 py-4">Monto</th>
							</tr>
						</thead>
						<tbody>
							{opportunities.map((item) => (
								<tr key={item.cliente} className="border-t border-outline-variant/60">
									<td className="px-5 md:px-6 py-4 text-on-surface">{item.cliente}</td>
									<td className="px-5 md:px-6 py-4 text-on-surface-variant">{item.etapa}</td>
									<td className="px-5 md:px-6 py-4 text-primary font-bold">{item.monto}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
		</section>
	);
};