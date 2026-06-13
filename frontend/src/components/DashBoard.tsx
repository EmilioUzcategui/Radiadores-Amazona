'use client';

import { useEffect, useMemo, useState } from 'react';
import { metricsService, type PredictiveInventoryItem } from '../../services/auth/metrics.service';
import { inventoryService } from '../../services/inventory.service';
import { InventoryActionModal, type CompetitorSeries, type InventoryDrillDownDetails } from './InventoryActionModal';

type PredictiveItem = PredictiveInventoryItem;

type InquiryRow = {
	fecha: string;
	cliente: string;
	canal: string;
	cantidad?: number;
};

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

function getInventoryDrillDownDetails(
	sku: string,
	seriesCompetencia: CompetitorSeries[],
): InventoryDrillDownDetails {
	return {
		seriesCompetencia,
		consultasClientes: inquiriesMockBySku[sku] ?? [
			{ fecha: '2026-04-28', cliente: 'Cliente demo', canal: 'Web', cantidad: 1 },
		],
	};
}

function getLatestAnalysisDate(items: PredictiveInventoryItem[]): Date | null {
	const dates = items
		.map((item) => (item.fecha_analisis ? new Date(item.fecha_analisis) : null))
		.filter((d): d is Date => d !== null && !Number.isNaN(d.getTime()));

	if (dates.length === 0) return null;
	return new Date(Math.max(...dates.map((d) => d.getTime())));
}

function isAnalysisStale(date: Date | null): boolean {
	if (!date) return false;
	const today = new Date();
	return (
		date.getFullYear() !== today.getFullYear() ||
		date.getMonth() !== today.getMonth() ||
		date.getDate() !== today.getDate()
	);
}

// --- DATA MOCK ORIGINAL ---
const baseMetrics = [
	{ label: 'Ventas del Mes', value: '$128.400', trend: '' },
	{ label: 'Interacciones del chatbot (mensual)', value: '86', trend: '' },
	{ label: 'SKUs en Riesgo Crítico', value: '8', trend: '' },
	{ label: 'Oportunidades de Arbitraje', value: '14', trend: '' },
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

const resumenEjecutivoFallback =
	"No se pudo generar el resumen ejecutivo predictivo. Por favor, revise los datos de inventario y las recomendaciones de acción para obtener insights detallados sobre oportunidades de arbitraje, niveles de urgencia y estrategias de reposición.";

export const DashBoard = () => {
	const itemsPerPage = 3;
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedItem, setSelectedItem] = useState<PredictiveItem | null>(null);
	const [competitorSeries, setCompetitorSeries] = useState<CompetitorSeries[]>([]);
	const [isCompetitorPricesLoading, setIsCompetitorPricesLoading] = useState(false);
	const [predictiveItems, setPredictiveItems] = useState<PredictiveItem[]>([]);
	const [predictiveSummary, setPredictiveSummary] = useState<string | null>(null);
	const [predictiveError, setPredictiveError] = useState<string | null>(null);
	const [isPredictiveLoading, setIsPredictiveLoading] = useState(true);
	const [chatbotInteractions, setChatbotInteractions] = useState<number | null>(null);
	const [interactionsError, setInteractionsError] = useState<string | null>(null);
	const [monthlySales, setMonthlySales] = useState<number | null>(null);
	const [monthlySalesError, setMonthlySalesError] = useState<string | null>(null);
	const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
	const [inventoryKpis, setInventoryKpis] = useState<{
		critical_skus: number;
		arbitrage_opportunities: number;
	} | null>(null);
	const [inventoryKpisError, setInventoryKpisError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [urgenciaFilter, setUrgenciaFilter] = useState('TODAS');
	const [rentabilidadFilter, setRentabilidadFilter] = useState('TODAS');

	// Carga la serie real de precios de la competencia (último mes) al abrir el drill-down.
	useEffect(() => {
		if (!selectedItem) return;

		let isMounted = true;
		const sku = selectedItem.sku;

		setIsCompetitorPricesLoading(true);
		setCompetitorSeries([]);

		inventoryService
			.getCompetitorPrices30d(sku)
			.then((series) => {
				if (isMounted) {
					setCompetitorSeries(
						series.map((serie) => ({
							fuente: serie.fuente,
							precios: serie.points.map((point) => point.precio),
						})),
					);
				}
			})
			.catch((error) => {
				console.error('Error al cargar precios de la competencia:', error);
				if (isMounted) setCompetitorSeries([]);
			})
			.finally(() => {
				if (isMounted) setIsCompetitorPricesLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, [selectedItem]);

	const formatCurrency = (value: number) => {
		const formatted = new Intl.NumberFormat('es-VE', { maximumFractionDigits: 0 }).format(value);
		return `$${formatted}`;
	};

	const insightText = predictiveSummary ?? resumenEjecutivoFallback;
	const insightPreview = isPredictiveLoading
		? 'Cargando resumen ejecutivo...'
		: insightText;
	const isInsightLong = !isPredictiveLoading && insightText.length > 220;

	const openInsightModal = () => {
		if (!isInsightLong) return;
		setIsInsightModalOpen(true);
	};

	const closeInsightModal = () => {
		setIsInsightModalOpen(false);
	};

	const handleInsightKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
		if (!isInsightLong) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			setIsInsightModalOpen(true);
		}
	};

	useEffect(() => {
		let isMounted = true;

		const loadPredictiveData = async () => {
			setIsPredictiveLoading(true);
			setPredictiveError(null);
			try {
				const data = await metricsService.getPredictiveInventory();
				if (isMounted) {
					setPredictiveItems(data.analisis_predictivo ?? []);
					setPredictiveSummary(data.resumen_ejecutivo ?? null);
				}
			} catch (error) {
				if (isMounted) {
					const message = error instanceof Error
						? error.message
						: "No se pudieron cargar las predicciones";
					setPredictiveError(message);
				}
			} finally {
				if (isMounted) {
					setIsPredictiveLoading(false);
				}
			}
		};

		loadPredictiveData();

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (!isInsightModalOpen) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsInsightModalOpen(false);
			}
		};
		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, [isInsightModalOpen]);

	useEffect(() => {
		let isMounted = true;

		const loadMonthlySales = async () => {
			setMonthlySalesError(null);
			try {
				const total = await metricsService.getMonthlySales();
				if (isMounted) {
					setMonthlySales(total);
				}
			} catch (error) {
				if (isMounted) {
					const message = error instanceof Error
						? error.message
						: "No se pudieron cargar las ventas del mes";
					setMonthlySalesError(message);
				}
			}
		};

		loadMonthlySales();

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		let isMounted = true;

		const loadInventoryKpis = async () => {
			setInventoryKpisError(null);
			try {
				const data = await metricsService.getInventoryKpis();
				if (isMounted) {
					setInventoryKpis(data);
				}
			} catch (error) {
				if (isMounted) {
					const message = error instanceof Error
						? error.message
						: "No se pudieron cargar los KPIs";
					setInventoryKpisError(message);
				}
			}
		};

		loadInventoryKpis();

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		let isMounted = true;

		const loadInteractions = async () => {
			setInteractionsError(null);
			try {
				const count = await metricsService.getChatbotInteractionsCount();
				if (isMounted) {
					setChatbotInteractions(count);
				}
			} catch (error) {
				if (isMounted) {
					const message = error instanceof Error
						? error.message
						: "No se pudieron cargar las interacciones";
					setInteractionsError(message);
				}
			}
		};

		loadInteractions();

		return () => {
			isMounted = false;
		};
	}, []);

	const metrics = baseMetrics.map((metric) => {
		if (metric.label === 'Ventas del Mes') {
			if (monthlySalesError) {
				return { ...metric, value: 'Sin datos', trend: '—' };
			}
			return {
				...metric,
				value: monthlySales === null ? 'Cargando...' : formatCurrency(monthlySales),
			};
		}

		if (metric.label === 'Interacciones del chatbot (mensual)') {
			if (interactionsError) {
				return { ...metric, value: 'Sin datos', trend: '—' };
			}

			return {
				...metric,
				value: chatbotInteractions === null ? 'Cargando...' : String(chatbotInteractions),
			};
		}

		if (metric.label === 'SKUs en Riesgo Crítico') {
			if (inventoryKpisError) {
				return { ...metric, value: 'Sin datos', trend: '—' };
			}
			return {
				...metric,
				value: inventoryKpis === null ? 'Cargando...' : String(inventoryKpis.critical_skus),
			};
		}
		if (metric.label === 'Oportunidades de Arbitraje') {
			if (inventoryKpisError) {
				return { ...metric, value: 'Sin datos', trend: '—' };
			}
			return {
				...metric,
				value: inventoryKpis === null ? 'Cargando...' : String(inventoryKpis.arbitrage_opportunities),
			};
		}

		return metric;
	});

	// Opciones de filtro derivadas de los propios datos (evita hardcodear niveles).
	const urgenciaOptions = useMemo(() => {
		const set = new Set<string>();
		predictiveItems.forEach((item) => {
			if (item.metricas.nivel_urgencia) set.add(item.metricas.nivel_urgencia);
		});
		return Array.from(set).sort();
	}, [predictiveItems]);

	const rentabilidadOptions = useMemo(() => {
		const set = new Set<string>();
		predictiveItems.forEach((item) => {
			if (item.metricas.indice_rentabilidad_importacion) {
				set.add(item.metricas.indice_rentabilidad_importacion);
			}
		});
		return Array.from(set).sort();
	}, [predictiveItems]);

	const filteredPredictiveItems = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		return predictiveItems.filter((item) => {
			if (urgenciaFilter !== 'TODAS' && item.metricas.nivel_urgencia !== urgenciaFilter) {
				return false;
			}
			if (
				rentabilidadFilter !== 'TODAS' &&
				item.metricas.indice_rentabilidad_importacion !== rentabilidadFilter
			) {
				return false;
			}
			if (term) {
				const haystack = [
					item.sku,
					item.recomendacion.accion_sugerida,
					item.recomendacion.razonamiento_comercial,
					item.metricas.alerta_competitividad,
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase();
				if (!haystack.includes(term)) return false;
			}
			return true;
		});
	}, [predictiveItems, searchTerm, urgenciaFilter, rentabilidadFilter]);

	const hasActiveFilters =
		searchTerm.trim() !== '' || urgenciaFilter !== 'TODAS' || rentabilidadFilter !== 'TODAS';

	const clearFilters = () => {
		setSearchTerm('');
		setUrgenciaFilter('TODAS');
		setRentabilidadFilter('TODAS');
	};

	// Al cambiar cualquier filtro volvemos a la primera página de resultados.
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, urgenciaFilter, rentabilidadFilter]);

	const totalPages = Math.max(1, Math.ceil(filteredPredictiveItems.length / itemsPerPage));
	const paginatedPredictiveData = filteredPredictiveItems.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);
	const firstPages = Array.from({ length: Math.min(3, totalPages) }, (_, index) => index + 1);
	const showEllipsis = totalPages > 4;
	const showLastPage = totalPages > 3;

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);
	const maxEstadoClientes = Math.max(...customerSegmentation.ubicacionPorEstado.map((item) => item.clientes));

	return (
		<section className="space-y-8">
			{/* HEADER ORIGINAL */}
			<header className="border border-outline-variant bg-surface-container-low p-6 md:p-8">
				<p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3">Resumen General</p>
				<h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter uppercase">
					Métricas predictivas de inventario para Radiadores Amazona
				</h1>
				<p className="text-on-surface-variant mt-4 text-justify">
					Este dashboard presenta un análisis predictivo avanzado del inventario de Radiadores Amazona, utilizando inteligencia artificial para identificar oportunidades de arbitraje, niveles de urgencia en reposición y recomendaciones de acción comercial. Las métricas se actualizan en tiempo real para reflejar las dinámicas del mercado y el comportamiento del cliente, permitiendo una toma de decisiones informada y estratégica.
				</p>
				<p className="text-on-surface-variant mt-2 italic text-sm text-justify">
					*Nota: Las recomendaciones de acción se basan en un análisis integral de datos históricos, tendencias de mercado y condiciones competitivas actuales.
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


			{/* NUEVO: RESUMEN EJECUTIVO AI */}
			<section
				className={`border border-outline-variant bg-surface-container-low p-6 md:p-8 border-l-4 border-l-primary relative overflow-hidden ${isInsightLong ? 'cursor-pointer hover:border-primary/70 transition-colors' : ''}`}
				onClick={openInsightModal}
				onKeyDown={handleInsightKeyDown}
				role={isInsightLong ? 'button' : undefined}
				tabIndex={isInsightLong ? 0 : undefined}
				aria-haspopup={isInsightLong ? 'dialog' : undefined}
				aria-label={isInsightLong ? 'Ver insight predictivo completo' : undefined}
			>
				<div className="absolute top-0 right-0 p-4 opacity-10">
					{/* Icono decorativo opcional para denotar IA */}
					<svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
					</svg>
				</div>
				<div className="relative z-10">
					<p className="text-[11px] uppercase tracking-[0.2em] text-primary mb-3 font-bold">Insight Predictivo AI</p>
					<p className={`text-on-surface text-base md:text-lg leading-relaxed max-w-5xl ${isInsightLong ? 'line-clamp-3' : ''}`}>
						{insightPreview}
					</p>
					{isInsightLong ? (
						<p className="text-[10px] uppercase tracking-[0.2em] text-primary mt-4">Click para ver completo</p>
					) : null}
				</div>
			</section>

			{/* NUEVO: CUADRICULA DE RECOMENDACIONES POR SKU */}
			<section>
				<div className="mb-4">
					<h2 className="font-headline text-2xl font-black tracking-tighter uppercase">Plan de Acción de Inventario</h2>
				</div>
				{/* BÚSQUEDA Y FILTROS */}
				<div className="mb-4 border border-outline-variant bg-surface-container-low p-4">
					<div className="flex flex-col gap-3 lg:flex-row lg:items-end">
						<div className="flex-1">
							<label htmlFor="plan-busqueda" className="block text-[11px] uppercase tracking-widest text-on-surface-variant mb-1">
								Buscar
							</label>
							<input
								id="plan-busqueda"
								type="text"
								value={searchTerm}
								onChange={(event) => setSearchTerm(event.target.value)}
								placeholder="SKU, acción o razonamiento…"
								className="w-full border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
							/>
						</div>

						<div>
							<label htmlFor="plan-urgencia" className="block text-[11px] uppercase tracking-widest text-on-surface-variant mb-1">
								Urgencia
							</label>
							<select
								id="plan-urgencia"
								value={urgenciaFilter}
								onChange={(event) => setUrgenciaFilter(event.target.value)}
								className="w-full lg:w-44 border border-outline-variant bg-surface-container px-3 py-2 text-sm uppercase tracking-wider font-semibold text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
							>
								<option value="TODAS">Todas</option>
								{urgenciaOptions.map((option) => (
									<option key={option} value={option}>{option}</option>
								))}
							</select>
						</div>

						<div>
							<label htmlFor="plan-rentabilidad" className="block text-[11px] uppercase tracking-widest text-on-surface-variant mb-1">
								Rentabilidad
							</label>
							<select
								id="plan-rentabilidad"
								value={rentabilidadFilter}
								onChange={(event) => setRentabilidadFilter(event.target.value)}
								className="w-full lg:w-44 border border-outline-variant bg-surface-container px-3 py-2 text-sm uppercase tracking-wider font-semibold text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
							>
								<option value="TODAS">Todas</option>
								{rentabilidadOptions.map((option) => (
									<option key={option} value={option}>{option}</option>
								))}
							</select>
						</div>

						{hasActiveFilters && (
							<button
								type="button"
								onClick={clearFilters}
								className="px-3 py-2 border border-outline-variant text-xs uppercase tracking-widest font-semibold text-on-surface hover:border-primary/70 hover:text-primary transition-colors"
							>
								Limpiar
							</button>
						)}
					</div>

					{!isPredictiveLoading && (
						<p className="text-xs text-on-surface-variant mt-3">
							Mostrando <span className="font-semibold text-on-surface">{filteredPredictiveItems.length}</span> de{' '}
							<span className="font-semibold text-on-surface">{predictiveItems.length}</span> planes
						</p>
					)}
				</div>

				{!isPredictiveLoading && predictiveItems.length > 0 && (() => {
					const latestDate = getLatestAnalysisDate(predictiveItems);
					if (!isAnalysisStale(latestDate) || !latestDate) return null;
					const formattedDate = latestDate.toLocaleDateString('es-VE', {
						day: '2-digit',
						month: '2-digit',
						year: 'numeric',
					});
					return (
						<div className="mb-4 flex items-center gap-3 border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
							<span className="text-yellow-500 text-lg leading-none">⚠</span>
							<div>
								<p className="text-[11px] uppercase tracking-[0.2em] text-yellow-500 font-bold">Datos desactualizados</p>
								<p className="text-xs text-on-surface-variant mt-0.5">
									El último análisis predictivo es del <span className="font-semibold text-on-surface">{formattedDate}</span>. Los datos pueden no reflejar las condiciones actuales del mercado.
								</p>
							</div>
						</div>
					);
				})()}
				{predictiveError ? (
					<p className="text-sm text-on-surface-variant mb-4">{predictiveError}</p>
				) : null}
				{isPredictiveLoading ? (
					<p className="text-sm text-on-surface-variant">Cargando predicciones...</p>
				) : paginatedPredictiveData.length === 0 ? (
					<p className="text-sm text-on-surface-variant">
						{predictiveItems.length === 0
							? 'No hay predicciones registradas.'
							: 'No se encontraron planes con los filtros aplicados.'}
					</p>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
						{paginatedPredictiveData.map((item) => {
							const nivelUrgencia = item.metricas.nivel_urgencia ?? 'N/D';
							const isCritical = nivelUrgencia.toUpperCase().includes('CRIT');
							const rentabilidadColor =
								item.metricas.indice_rentabilidad_importacion === 'ALTO' ? 'text-green-500' :
									item.metricas.indice_rentabilidad_importacion === 'MEDIO' ? 'text-yellow-500' : 'text-red-400';
							const accionSugerida = item.recomendacion.accion_sugerida
								? item.recomendacion.accion_sugerida.replace(/_/g, ' ')
								: 'SIN ACCIÓN';
							const cantidadSugerida = item.recomendacion.cantidad_sugerida_comprar ?? 0;
							const fechaScrapeo = item.fecha_analisis
								? new Date(item.fecha_analisis).toLocaleString('es-VE', {
									day: '2-digit',
									month: '2-digit',
									year: 'numeric',
									hour: '2-digit',
									minute: '2-digit',
									hour12: true,
								})
								: null;

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
												{nivelUrgencia}
											</span>
										</div>

										{/* SECCIÓN ACTUALIZADA DE MÉTRICAS */}
										<div className="space-y-3 mb-5 border-y border-outline-variant/40 py-4">
											<div className="flex justify-between items-center text-sm">
												<span className="text-on-surface-variant">Acción Sugerida:</span>
												<span className="text-on-surface font-semibold text-right text-xs uppercase tracking-wider">
													{accionSugerida}
												</span>
											</div>

											<div className="flex justify-between items-center text-sm">
												<span className="text-on-surface-variant">Días Estimados para Quiebre:</span>
												<span className="text-primary font-bold">
													{item.metricas.dias_estimados_quiebre ?? 'N/D'} días
												</span>
											</div>

											<div className="flex justify-between items-center text-sm">
												<span className="text-on-surface-variant">Índice Rentabilidad:</span>
												<span className={`font-bold text-xs uppercase tracking-wider ${rentabilidadColor}`}>
													{item.metricas.indice_rentabilidad_importacion || 'N/D'}
												</span>
											</div>

											<div className="flex justify-between items-center text-sm">
												<span className="text-on-surface-variant">Alerta Competitiva:</span>
												<span className="text-on-surface font-semibold text-xs uppercase tracking-wider text-right max-w-[140px] truncate" title={item.metricas.alerta_competitividad?.replace(/_/g, ' ')}>
													{item.metricas.alerta_competitividad?.replace(/_/g, ' ') || 'SIN ALERTA'}
												</span>
											</div>

											<div className="flex justify-between items-center text-sm">
												<span className="text-on-surface-variant">Arbitraje Detectado:</span>
												<span className="text-primary font-bold">
													{item.metricas.oportunidad_arbitraje_usd ?? 'N/D'} USD
												</span>
											</div>

											{cantidadSugerida > 0 && (
												<div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-outline-variant/20">
													<span className="text-on-surface-variant">Cantidad Recomendada:</span>
													<span className="text-on-surface font-black text-base">{cantidadSugerida} un.</span>
												</div>
											)}
										</div>

										<div>
											<p className="text-[11px] uppercase tracking-widest text-on-surface-variant mb-2">Razonamiento</p>
											<p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">
												{item.recomendacion.razonamiento_comercial}
											</p>
										</div>

										{fechaScrapeo && (
											<p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mt-4 pt-3 border-t border-outline-variant/20">
												Scrapeado el <span className="font-semibold text-on-surface">{fechaScrapeo}</span>
											</p>
										)}
									</div>
								</button>
							);
						})}
					</div>
				)}

				<div className="mt-5 border border-outline-variant bg-surface-container-low p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
					<p className="text-xs uppercase tracking-widest text-on-surface-variant">
						Página {currentPage} de {totalPages}
					</p>

					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
							disabled={currentPage === 1 || isPredictiveLoading || totalPages === 1}
							className="px-3 py-2 border border-outline-variant text-xs uppercase tracking-widest font-semibold text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/70 hover:text-primary transition-colors"
						>
							Anterior
						</button>

						{firstPages.map((pageNumber) => {
							const isActive = pageNumber === currentPage;

							return (
								<button
									type="button"
									key={pageNumber}
									onClick={() => setCurrentPage(pageNumber)}
									disabled={isPredictiveLoading || totalPages === 1}
									className={`min-w-9 px-3 py-2 border text-xs uppercase tracking-widest font-semibold transition-colors ${isActive
										? 'border-primary bg-primary-container/20 text-primary'
										: 'border-outline-variant text-on-surface hover:border-primary/70 hover:text-primary'
										}`}
								>
									{pageNumber}
								</button>
							);
						})}

						{showEllipsis ? (
							<span className="px-2 text-xs uppercase tracking-widest text-on-surface-variant">...</span>
						) : null}

						{showLastPage ? (() => {
							const pageNumber = totalPages;
							const isActive = pageNumber === currentPage;

							if (firstPages.includes(pageNumber)) {
								return null;
							}

							return (
								<button
									type="button"
									key={pageNumber}
									onClick={() => setCurrentPage(pageNumber)}
									disabled={isPredictiveLoading || totalPages === 1}
									className={`min-w-9 px-3 py-2 border text-xs uppercase tracking-widest font-semibold transition-colors ${isActive
										? 'border-primary bg-primary-container/20 text-primary'
										: 'border-outline-variant text-on-surface hover:border-primary/70 hover:text-primary'
										}`}
								>
									{pageNumber}
								</button>
							);
						})() : null}

						<button
							type="button"
							onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
							disabled={currentPage === totalPages || isPredictiveLoading || totalPages === 1}
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
					urgencia={selectedItem.metricas.nivel_urgencia ?? 'N/D'}
					alertaCompetitividad={selectedItem.metricas.alerta_competitividad}
					oportunidadArbitraje={selectedItem.metricas.oportunidad_arbitraje_usd}
					indiceRentabilidad={selectedItem.metricas.indice_rentabilidad_importacion}
					accionSugerida={selectedItem.recomendacion.accion_sugerida ?? 'SIN ACCIÓN'}
					cantidadSugerida={selectedItem.recomendacion.cantidad_sugerida_comprar ?? 0}
					razonamiento={selectedItem.recomendacion.razonamiento_comercial ?? 'Sin detalles'}
					detalles={getInventoryDrillDownDetails(selectedItem.sku, competitorSeries)}
					preciosLoading={isCompetitorPricesLoading}
					onClose={() => setSelectedItem(null)}
				/>
			)}

			{isInsightModalOpen && (
				<div
					className="fixed inset-0 z-50 p-4 md:p-8"
					role="dialog"
					aria-modal="true"
					aria-label="Insight predictivo AI"
					onMouseDown={closeInsightModal}
				>
					<div className="absolute inset-0 bg-background/80" />

					<div className="relative w-full h-full flex items-start md:items-center justify-center">
						<div
							className="w-full max-w-3xl border border-outline-variant bg-surface-container shadow-none max-h-[calc(100dvh-2rem)] md:max-h-[calc(100dvh-4rem)] flex flex-col"
							onMouseDown={(event) => event.stopPropagation()}
						>
							<header className="px-5 md:px-6 py-4 border-b border-outline-variant flex items-start justify-between gap-4 sticky top-0 bg-surface-container z-10">
								<div>
									<p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">Insight Predictivo AI</p>
									<h3 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase">
										Detalle completo
									</h3>
								</div>

								<button
									type="button"
									onClick={closeInsightModal}
									className="px-3 py-2 border border-outline-variant text-xs uppercase tracking-widest font-semibold text-on-surface hover:border-primary/70 hover:text-primary transition-colors"
								>
									Cerrar
								</button>
							</header>

							<div className="p-5 md:p-6 overflow-y-auto">
								<p className="text-sm md:text-base text-on-surface-variant leading-relaxed whitespace-pre-line">
									{insightText}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}


		</section>
	);
};