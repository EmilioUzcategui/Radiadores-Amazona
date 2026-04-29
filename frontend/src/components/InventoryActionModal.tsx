'use client';

import { useEffect, useMemo } from 'react';
import {
	Chart as ChartJS,
	CategoryScale,
	Filler,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Tooltip,
	type ChartOptions,
	type ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

type Inquiry = {
	fecha: string;
	cliente: string;
	canal: string;
	cantidad?: number;
};

export type InventoryDrillDownDetails = {
	precioCompetenciaUSD30d: number[];
	consultasClientes: Inquiry[];
};

type Props = {
	isOpen: boolean;
	sku: string;
	urgencia: string;
	razonamiento: string;
	detalles: InventoryDrillDownDetails;
	onClose: () => void;
};

type ThemeColors = {
	primary: string;
	onSurfaceVariant: string;
	outlineVariant: string;
	surfaceContainerHighest: string;
};

function readThemeColors(): ThemeColors {
	const root = getComputedStyle(document.documentElement);
	return {
		primary: root.getPropertyValue('--color-primary').trim(),
		onSurfaceVariant: root.getPropertyValue('--color-on-surface-variant').trim(),
		outlineVariant: root.getPropertyValue('--color-outline-variant').trim(),
		surfaceContainerHighest: root.getPropertyValue('--color-surface-container-highest').trim(),
	};
}

export function InventoryActionModal({ isOpen, sku, urgencia, razonamiento, detalles, onClose }: Props) {
	const themeColors = useMemo(() => {
		if (!isOpen) return null;
		return readThemeColors();
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, [isOpen, onClose]);

	const labels = useMemo(() => Array.from({ length: 30 }, (_, i) => `D${i + 1}`), []);

	const chartData: ChartData<'line'> | null = useMemo(() => {
		if (!themeColors) return null;

		return {
			labels,
			datasets: [
				{
					label: 'Precio competencia (USD)',
					data: detalles.precioCompetenciaUSD30d,
					borderColor: themeColors.primary,
					backgroundColor: 'transparent',
					tension: 0.35,
					pointRadius: 2,
					pointHoverRadius: 4,
				},
			],
		};
	}, [detalles.precioCompetenciaUSD30d, labels, themeColors]);

	const chartOptions: ChartOptions<'line'> | null = useMemo(() => {
		if (!themeColors) return null;

		return {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					display: false,
				},
				tooltip: {
					mode: 'index',
					intersect: false,
				},
			},
			scales: {
				x: {
					grid: {
						color: themeColors.surfaceContainerHighest,
					},
					ticks: {
						color: themeColors.onSurfaceVariant,
						maxTicksLimit: 6,
					},
					border: {
						color: themeColors.outlineVariant,
					},
				},
				y: {
					grid: {
						color: themeColors.surfaceContainerHighest,
					},
					ticks: {
						color: themeColors.onSurfaceVariant,
					},
					border: {
						color: themeColors.outlineVariant,
					},
				},
			},
		};
	}, [themeColors]);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 p-4 md:p-8"
			role="dialog"
			aria-modal="true"
			aria-label={`Detalle de inventario ${sku}`}
			onMouseDown={onClose}
		>
			<div className="absolute inset-0 bg-background/80" />

			<div className="relative w-full h-full flex items-start md:items-center justify-center">
				<div
					className="w-full max-w-4xl border border-outline-variant bg-surface-container shadow-none max-h-[calc(100dvh-2rem)] md:max-h-[calc(100dvh-4rem)] flex flex-col"
					onMouseDown={(event) => event.stopPropagation()}
				>
					<header className="px-5 md:px-6 py-4 border-b border-outline-variant flex items-start justify-between gap-4 sticky top-0 bg-surface-container">
						<div>
							<p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">Drill-down</p>
							<h3 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase">
								{sku}
							</h3>
							<p className="text-xs uppercase tracking-widest text-on-surface-variant mt-2">
								Urgencia: <span className="text-on-surface font-semibold">{urgencia}</span>
							</p>
						</div>

						<button
							type="button"
							onClick={onClose}
							className="px-3 py-2 border border-outline-variant text-xs uppercase tracking-widest font-semibold text-on-surface hover:border-primary/70 hover:text-primary transition-colors"
						>
							Cerrar
						</button>
					</header>

					<div className="p-5 md:p-6 space-y-6 overflow-y-auto">
						<section className="border border-outline-variant bg-surface-container-low p-4">
							<p className="text-[11px] uppercase tracking-widest text-on-surface-variant mb-2">Razonamiento (completo)</p>
							<p className="text-sm text-on-surface-variant leading-relaxed">{razonamiento}</p>
						</section>

						<section className="border border-outline-variant bg-surface-container-low p-4">
							<div className="flex items-end justify-between gap-4 mb-3">
								<div>
									<p className="text-[11px] uppercase tracking-widest text-on-surface-variant">Competencia</p>
									<h4 className="font-headline text-lg font-black tracking-tight uppercase">Precio último mes</h4>
								</div>
								<p className="text-xs uppercase tracking-widest text-on-surface-variant">Mock (30 días)</p>
							</div>

							<div className="h-56 md:h-64">
								{chartData && chartOptions ? (
									<Line data={chartData} options={chartOptions} />
								) : (
									<div className="h-full border border-outline-variant bg-surface-container flex items-center justify-center">
										<p className="text-xs uppercase tracking-widest text-on-surface-variant">Cargando gráfico…</p>
									</div>
								)}
							</div>
						</section>

						<section className="border border-outline-variant bg-surface-container-low p-4">
							<div className="flex items-end justify-between gap-4 mb-3">
								<div>
									<p className="text-[11px] uppercase tracking-widest text-on-surface-variant">Demanda</p>
									<h4 className="font-headline text-lg font-black tracking-tight uppercase">Consultas recientes</h4>
								</div>
								<p className="text-xs uppercase tracking-widest text-on-surface-variant">Mock</p>
							</div>

							<div className="overflow-x-auto">
								<table className="w-full min-w-[520px]">
									<thead>
										<tr className="text-left text-xs uppercase tracking-widest text-on-surface-variant">
											<th className="py-3 pr-4">Fecha</th>
											<th className="py-3 pr-4">Cliente</th>
											<th className="py-3 pr-4">Canal</th>
											<th className="py-3">Cantidad</th>
										</tr>
									</thead>
									<tbody>
										{detalles.consultasClientes.map((row, index) => (
											<tr key={`${row.fecha}-${row.cliente}-${index}`} className="border-t border-outline-variant/60">
												<td className="py-3 pr-4 text-on-surface">{row.fecha}</td>
												<td className="py-3 pr-4 text-on-surface-variant">{row.cliente}</td>
												<td className="py-3 pr-4 text-on-surface-variant">{row.canal}</td>
												<td className="py-3 text-on-surface font-semibold">{row.cantidad ?? '-'}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}
