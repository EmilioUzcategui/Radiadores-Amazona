'use client';

import { useEffect, useMemo } from 'react';
import {
	Chart as ChartJS,
	CategoryScale,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Tooltip,
	type ChartData,
	type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export type InventoryItem = {
	sku: string;
	producto: string;
	categoria: string;
	stock: number;
	estado: string;
};

type Props = {
	isOpen: boolean;
	item: InventoryItem;
	historialStock30d: number[];
	historialLabels30d: string[];
	historialLoading: boolean;
	historialError: string | null;
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

export function InventoryItemModal({
	isOpen,
	item,
	historialStock30d,
	historialLabels30d,
	historialLoading,
	historialError,
	onClose,
}: Props) {
	useEffect(() => {
		if (!isOpen) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, [isOpen, onClose]);

	const themeColors = useMemo(() => {
		if (!isOpen) return null;
		return readThemeColors();
	}, [isOpen]);

	const labels = useMemo(() => {
		if (historialLabels30d.length === 0) return [];
		return historialLabels30d.map((iso) => {
			const date = new Date(iso);
			if (Number.isNaN(date.getTime())) return iso;
			return date.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit' });
		});
	}, [historialLabels30d]);

	const chartData: ChartData<'line'> | null = useMemo(() => {
		if (!themeColors) return null;
		if (historialStock30d.length === 0) return null;

		return {
			labels,
			datasets: [
				{
					label: 'Stock (unidades)',
					data: historialStock30d,
					borderColor: themeColors.primary,
					backgroundColor: 'transparent',
					tension: 0.35,
					pointRadius: 2,
					pointHoverRadius: 4,
				},
			],
		};
	}, [historialStock30d, labels, themeColors]);

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

	const minStock = useMemo(
		() => (historialStock30d.length ? Math.min(...historialStock30d) : null),
		[historialStock30d],
	);
	const maxStock = useMemo(
		() => (historialStock30d.length ? Math.max(...historialStock30d) : null),
		[historialStock30d],
	);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 p-4 md:p-8"
			role="dialog"
			aria-modal="true"
			aria-label={`Detalle de inventario ${item.producto}`}
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
							<p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">Inventario</p>
							<h3 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase">
								{item.producto}
							</h3>
							<p className="text-xs uppercase tracking-widest text-on-surface-variant mt-2">
								Categoría: <span className="text-on-surface font-semibold">{item.categoria}</span>
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
							<p className="text-[11px] uppercase tracking-widest text-on-surface-variant mb-2">Estado actual</p>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="border border-outline-variant bg-surface-container p-4">
									<p className="text-xs uppercase tracking-widest text-on-surface-variant">Stock</p>
									<p className="font-headline text-3xl font-black tracking-tighter mt-2 text-on-surface">
										{item.stock}
									</p>
								</div>
								<div className="border border-outline-variant bg-surface-container p-4">
									<p className="text-xs uppercase tracking-widest text-on-surface-variant">Estado</p>
									<p className="font-headline text-xl font-black tracking-tight mt-2 text-on-surface">
										{item.estado}
									</p>
								</div>
								<div className="border border-outline-variant bg-surface-container p-4">
									<p className="text-xs uppercase tracking-widest text-on-surface-variant">Rango 30d</p>
									<p className="text-sm text-on-surface-variant mt-2">
										{minStock !== null && maxStock !== null ? (
											<>
												<span className="text-on-surface font-semibold">{minStock}</span> min ·{' '}
												<span className="text-on-surface font-semibold">{maxStock}</span> max
											</>
										) : (
											<span>—</span>
										)}
									</p>
								</div>
							</div>
						</section>

						<section className="border border-outline-variant bg-surface-container-low p-4">
							<div className="flex items-end justify-between gap-4 mb-3">
								<div>
									<p className="text-[11px] uppercase tracking-widest text-on-surface-variant">Histórico</p>
									<h4 className="font-headline text-lg font-black tracking-tight uppercase">Variación último mes</h4>
								</div>
								<p className="text-xs uppercase tracking-widest text-on-surface-variant">(30 días)</p>
							</div>

							<div className="h-56 md:h-64">
								{historialError ? (
									<div className="h-full border border-outline-variant bg-surface-container flex items-center justify-center">
										<p className="text-xs uppercase tracking-widest text-on-surface-variant">{historialError}</p>
									</div>
								) : historialLoading || !chartData || !chartOptions ? (
									<div className="h-full border border-outline-variant bg-surface-container flex items-center justify-center">
										<p className="text-xs uppercase tracking-widest text-on-surface-variant">Cargando gráfico…</p>
									</div>
								) : historialStock30d.length === 0 ? (
									<div className="h-full border border-outline-variant bg-surface-container flex items-center justify-center">
										<p className="text-xs uppercase tracking-widest text-on-surface-variant">Sin movimientos registrados</p>
									</div>
								) : (
									<Line data={chartData} options={chartOptions} />
								)}
							</div>
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}
