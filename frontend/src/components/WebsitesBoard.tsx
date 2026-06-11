'use client';

import { useEffect, useMemo, useState } from 'react';
import RaSwal from '../lib/swal';
import { websitesService, type WebsiteSource } from '../../services/websites.service';

type Prioridad = 'Alta' | 'Media' | 'Baja';

const prioridadOpciones: { value: number; label: Prioridad }[] = [
	{ value: 3, label: 'Alta' },
	{ value: 2, label: 'Media' },
	{ value: 1, label: 'Baja' },
];

const prioridadLabel = (prioridad: number): Prioridad => {
	if (prioridad >= 3) return 'Alta';
	if (prioridad === 2) return 'Media';
	return 'Baja';
};

const prioridadTone: Record<Prioridad, string> = {
	Alta: 'bg-primary-container/20 text-primary border-primary/30',
	Media: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
	Baja: 'bg-surface-container-highest text-on-surface-variant border-outline-variant',
};

const formatScrapeoDate = (iso: string | null) => {
	if (!iso) return 'Sin registros';
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return 'N/D';
	return date.toLocaleString('es-VE', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

export const WebsitesBoard = () => {
	const [websites, setWebsites] = useState<WebsiteSource[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const loadWebsites = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const items = await websitesService.listWebsites();
				if (isMounted) {
					setWebsites(items);
				}
			} catch (caughtError) {
				if (isMounted) {
					const message = caughtError instanceof Error
						? caughtError.message
						: 'No se pudieron cargar los sitios web';
					setError(message);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		loadWebsites();

		return () => {
			isMounted = false;
		};
	}, []);

	const persistChange = async (
		id: string,
		changes: { activo?: boolean; prioridad?: number },
		previous: WebsiteSource[],
	) => {
		try {
			const updated = await websitesService.updateWebsite(id, changes);
			setWebsites((prev) => prev.map((site) => (site.id === id ? updated : site)));
		} catch (caughtError) {
			// Revertir el cambio optimista y avisar al usuario.
			setWebsites(previous);
			const message = caughtError instanceof Error
				? caughtError.message
				: 'No se pudo guardar el cambio';
			RaSwal.fire({
				icon: 'error',
				title: 'No se pudo actualizar',
				text: message,
			});
		}
	};

	const toggleActivo = (id: string) => {
		const previous = websites;
		const site = previous.find((item) => item.id === id);
		if (!site) return;
		const nuevoActivo = !site.activo;

		// Debe quedar siempre al menos un sitio activo: no permitir desactivar el último.
		if (!nuevoActivo && previous.filter((item) => item.activo).length <= 1) {
			RaSwal.fire({
				icon: 'warning',
				title: 'No se puede desactivar',
				text: 'Debe haber al menos un sitio web activo para el flujo de scraping.',
			});
			return;
		}

		setWebsites((prev) =>
			prev.map((item) => (item.id === id ? { ...item, activo: nuevoActivo } : item)),
		);
		void persistChange(id, { activo: nuevoActivo }, previous);
	};

	const cambiarPrioridad = (id: string, prioridad: number) => {
		const previous = websites;

		setWebsites((prev) =>
			prev.map((item) => (item.id === id ? { ...item, prioridad } : item)),
		);
		void persistChange(id, { prioridad }, previous);
	};

	const sitiosOrdenados = useMemo(() => {
		return [...websites].sort((a, b) => {
			if (a.activo !== b.activo) return a.activo ? -1 : 1;
			if (a.prioridad !== b.prioridad) return b.prioridad - a.prioridad;
			return (b.total_productos ?? 0) - (a.total_productos ?? 0);
		});
	}, [websites]);

	const metrics = useMemo(() => {
		const activos = websites.filter((site) => site.activo);
		const productosActivos = activos.reduce((acc, site) => acc + (site.total_productos ?? 0), 0);
		const sitiosConTasa = activos.filter((site) => site.tasa_exito !== null);
		const tasaPromedio = sitiosConTasa.length
			? Math.round(
				sitiosConTasa.reduce((acc, site) => acc + (site.tasa_exito ?? 0), 0) / sitiosConTasa.length,
			)
			: 0;
		const prioritario = sitiosOrdenados.find((site) => site.activo);

		return {
			activos: activos.length,
			total: websites.length,
			productosActivos,
			tasaPromedio,
			prioritario: prioritario?.nombre ?? 'Sin sitio prioritario',
		};
	}, [websites, sitiosOrdenados]);

	const maxProductos = Math.max(...websites.map((site) => site.total_productos ?? 0), 1);

	return (
		<section className="space-y-8">
			<header className="border border-outline-variant bg-surface-container-low p-6 md:p-8">
				<p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3">Fuentes de Scraping</p>
				<h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter uppercase">Sitios Web</h1>
				<p className="text-on-surface-variant mt-4 max-w-2xl">
					Selecciona y prioriza los sitios web que el flujo de n8n usará como fuente al momento de
					scrappear precios y disponibilidad de la competencia. Los sitios activos con mayor prioridad
					se consultan primero en cada ejecución.
				</p>
			</header>

			{isLoading ? (
				<div className="border border-outline-variant bg-surface-container p-10 text-center text-on-surface-variant">
					Cargando fuentes de scraping…
				</div>
			) : error ? (
				<div className="border border-red-500/40 bg-red-500/10 p-6 text-red-400">
					{error}
				</div>
			) : (
				<>
					{/* MÉTRICAS */}
					<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
						<article className="border border-outline-variant bg-surface-container p-5">
							<p className="text-xs uppercase tracking-widest text-on-surface-variant">Sitios Activos</p>
							<p className="font-headline text-3xl font-black tracking-tighter mt-3">
								{metrics.activos}<span className="text-on-surface-variant text-lg"> / {metrics.total}</span>
							</p>
							<p className="text-sm text-primary mt-2 font-semibold">Incluidos en el scraping</p>
						</article>

						<article className="border border-outline-variant bg-surface-container p-5">
							<p className="text-xs uppercase tracking-widest text-on-surface-variant">Sitio Prioritario</p>
							<p className="font-headline text-xl font-black tracking-tighter mt-3 truncate" title={metrics.prioritario}>
								{metrics.prioritario}
							</p>
							<p className="text-sm text-primary mt-2 font-semibold">Primero en consultarse</p>
						</article>

						<article className="border border-outline-variant bg-surface-container p-5">
							<p className="text-xs uppercase tracking-widest text-on-surface-variant">Productos Detectados</p>
							<p className="font-headline text-3xl font-black tracking-tighter mt-3">
								{metrics.productosActivos.toLocaleString('es-VE')}
							</p>
							<p className="text-sm text-primary mt-2 font-semibold">En sitios activos</p>
						</article>

						<article className="border border-outline-variant bg-surface-container p-5">
							<p className="text-xs uppercase tracking-widest text-on-surface-variant">Tasa de Éxito Promedio</p>
							<p className="font-headline text-3xl font-black tracking-tighter mt-3">{metrics.tasaPromedio}%</p>
							<p className="text-sm text-primary mt-2 font-semibold">Scrapings exitosos</p>
						</article>
					</div>

					{/* LISTADO DE SITIOS */}
					<section className="border border-outline-variant bg-surface-container-low overflow-hidden">
						<div className="px-5 md:px-6 py-4 border-b border-outline-variant">
							<h2 className="font-headline text-2xl font-black tracking-tighter uppercase">Fuentes Configuradas</h2>
							<p className="text-sm text-on-surface-variant mt-1">
								Activa o desactiva cada fuente y define su nivel de prioridad para el flujo de scraping.
							</p>
						</div>

						{sitiosOrdenados.length === 0 ? (
							<div className="px-5 md:px-6 py-10 text-center text-on-surface-variant">
								No hay fuentes de scraping registradas.
							</div>
						) : (
							<div className="divide-y divide-outline-variant/60">
								{sitiosOrdenados.map((site) => {
									const productos = site.total_productos ?? 0;
									const productosRatio = Math.round((productos / maxProductos) * 100);
									const prioridad = prioridadLabel(site.prioridad);
									const tasaExito = site.tasa_exito;

									return (
										<article
											key={site.id}
											className={`px-5 md:px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between transition-colors ${site.activo ? '' : 'opacity-60'}`}
										>
											<div className="min-w-0 lg:flex-1">
												<div className="flex items-center gap-3 flex-wrap">
													<h3 className="font-headline text-lg font-black tracking-tighter">{site.nombre}</h3>
													<span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 border ${prioridadTone[prioridad]}`}>
														{prioridad}
													</span>
												</div>
												<a
													href={site.url}
													target="_blank"
													rel="noopener noreferrer"
													onClick={(event) => event.stopPropagation()}
													className="text-sm text-on-surface-variant hover:text-primary transition-colors break-all"
												>
													{site.url}
												</a>

												<div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl">
													<div>
														<p className="text-[11px] uppercase tracking-widest text-on-surface-variant">Productos</p>
														<p className="text-on-surface font-bold mt-1">{productos.toLocaleString('es-VE')}</p>
														<div className="mt-2 h-1.5 bg-surface-container-highest overflow-hidden">
															<div className="h-full bg-primary" style={{ width: `${productosRatio}%` }} />
														</div>
													</div>
													<div>
														<p className="text-[11px] uppercase tracking-widest text-on-surface-variant">Tasa de éxito</p>
														{tasaExito === null ? (
															<p className="text-on-surface-variant font-bold mt-1">N/D</p>
														) : (
															<p className={`font-bold mt-1 ${tasaExito >= 90 ? 'text-green-500' : tasaExito >= 80 ? 'text-yellow-500' : 'text-red-400'}`}>
																{tasaExito}%
															</p>
														)}
													</div>
													<div className="col-span-2 sm:col-span-1">
														<p className="text-[11px] uppercase tracking-widest text-on-surface-variant">Último scraping</p>
														<p className="text-on-surface-variant text-sm mt-1">{formatScrapeoDate(site.ultimo_scrapeo)}</p>
													</div>
												</div>
											</div>

											<div className="flex items-center gap-3 lg:flex-col lg:items-end lg:gap-3">
												<label className="flex flex-col gap-1">
													<span className="text-[11px] uppercase tracking-widest text-on-surface-variant">Prioridad</span>
													<select
														value={site.prioridad}
														onChange={(event) => cambiarPrioridad(site.id, Number(event.target.value))}
														disabled={!site.activo}
														className="border border-outline-variant bg-surface-container px-3 py-2 text-sm uppercase tracking-wider font-semibold text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
													>
														{prioridadOpciones.map((nivel) => (
															<option key={nivel.value} value={nivel.value}>{nivel.label}</option>
														))}
													</select>
												</label>

												<button
													type="button"
													onClick={() => toggleActivo(site.id)}
													role="switch"
													aria-checked={site.activo}
													aria-label={`${site.activo ? 'Desactivar' : 'Activar'} ${site.nombre}`}
													className={`relative inline-flex h-9 w-44 items-center justify-between px-3 border text-xs uppercase tracking-widest font-bold transition-colors ${site.activo
														? 'border-primary bg-primary-container/20 text-primary'
														: 'border-outline-variant text-on-surface-variant hover:border-primary/70'
														}`}
												>
													<span>{site.activo ? 'Activo' : 'Inactivo'}</span>
													<span
														aria-hidden
														className={`h-4 w-4 rounded-full transition-colors ${site.activo ? 'bg-primary' : 'bg-outline-variant'}`}
													/>
												</button>
											</div>
										</article>
									);
								})}
							</div>
						)}
					</section>
				</>
			)}
		</section>
	);
};
