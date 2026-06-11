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

// Una serie de precios por competidor/fuente (Made in China, Alibaba, …).
// `precios` puede contener null en los días sin scraping (huecos en la serie).
export type CompetitorSeries = {
    fuente: string;
    precios: (number | null)[];
};

export type InventoryDrillDownDetails = {
    seriesCompetencia: CompetitorSeries[];
    consultasClientes: Inquiry[];
};

// Paleta para diferenciar cada fuente en la gráfica (la primera usa el color primario del tema).
const SERIES_PALETTE = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#a855f7', '#ec4899'];

// 1. ACTUALIZAMOS LOS PROPS PARA RECIBIR LAS NUEVAS MÉTRICAS
type Props = {
    isOpen: boolean;
    sku: string;
    urgencia: string;
    alertaCompetitividad: string | null;
    oportunidadArbitraje: number | null;
    indiceRentabilidad: string | null;
    accionSugerida: string;
    cantidadSugerida: number;
    razonamiento: string;
    detalles: InventoryDrillDownDetails;
    preciosLoading?: boolean;
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

export function InventoryActionModal({
    isOpen,
    sku,
    urgencia,
    alertaCompetitividad,
    oportunidadArbitraje,
    indiceRentabilidad,
    accionSugerida,
    cantidadSugerida,
    razonamiento,
    detalles,
    preciosLoading = false,
    onClose
}: Props) {
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

    // La longitud de cada serie = nº de días; usamos la más larga para las etiquetas.
    const labels = useMemo(() => {
        const length = detalles.seriesCompetencia.reduce(
            (max, serie) => Math.max(max, serie.precios.length),
            0,
        ) || 30;
        return Array.from({ length }, (_, i) => `D${i + 1}`);
    }, [detalles.seriesCompetencia]);

    // ¿Hay al menos un precio real en alguna fuente? (todo puede venir vacío o en null)
    const hasPriceData = useMemo(
        () => detalles.seriesCompetencia.some((serie) => serie.precios.some((value) => value !== null)),
        [detalles.seriesCompetencia],
    );

    const chartData: ChartData<'line'> | null = useMemo(() => {
        if (!themeColors) return null;

        const palette = [themeColors.primary, ...SERIES_PALETTE];

        return {
            labels,
            datasets: detalles.seriesCompetencia.map((serie, index) => {
                const color = palette[index % palette.length];
                return {
                    label: serie.fuente,
                    data: serie.precios,
                    borderColor: color,
                    backgroundColor: color,
                    tension: 0.35,
                    pointRadius: 2,
                    pointHoverRadius: 4,
                    spanGaps: true,
                };
            }),
        };
    }, [detalles.seriesCompetencia, labels, themeColors]);

    const chartOptions: ChartOptions<'line'> | null = useMemo(() => {
        if (!themeColors) return null;

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: themeColors.onSurfaceVariant,
                        boxWidth: 12,
                        boxHeight: 12,
                        usePointStyle: true,
                    },
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

    // Lógica de colores para rentabilidad
    const rentabilidadColor =
        indiceRentabilidad === 'ALTO' ? 'text-green-500' :
            indiceRentabilidad === 'MEDIO' ? 'text-yellow-500' :
                indiceRentabilidad === 'BAJO' ? 'text-red-400' : 'text-on-surface-variant';

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
                    {/* CABECERA */}
                    <header className="px-5 md:px-6 py-4 border-b border-outline-variant flex items-start justify-between gap-4 sticky top-0 bg-surface-container z-10">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">Drill-down Predictivo</p>
                            <h3 className="font-headline text-2xl md:text-3xl font-black tracking-tighter uppercase">
                                {sku}
                            </h3>
                            <p className="text-xs uppercase tracking-widest text-on-surface-variant mt-2">
                                Urgencia: <span className={`font-bold ${urgencia === 'CRÍTICA' ? 'text-red-500' : 'text-on-surface'}`}>{urgencia}</span>
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

                        {/* NUEVO: CUADRÍCULA DE KPIS FINANCIEROS Y DE ACCIÓN */}
                        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="border border-outline-variant bg-surface-container-low p-4 flex flex-col justify-center">
                                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Arbitraje USD</p>
                                <p className="text-2xl font-black text-primary">
                                    {oportunidadArbitraje ? `$${oportunidadArbitraje}` : 'N/D'}
                                </p>
                            </div>

                            <div className="border border-outline-variant bg-surface-container-low p-4 flex flex-col justify-center">
                                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Rentabilidad</p>
                                <p className={`text-xl font-black uppercase tracking-tight ${rentabilidadColor}`}>
                                    {indiceRentabilidad || 'N/D'}
                                </p>
                            </div>

                            <div className="border border-outline-variant bg-surface-container-low p-4 flex flex-col justify-center">
                                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Alerta Competitiva</p>
                                <p className="text-sm font-bold text-on-surface uppercase leading-tight line-clamp-2" title={alertaCompetitividad?.replace(/_/g, ' ')}>
                                    {alertaCompetitividad?.replace(/_/g, ' ') || 'SIN ALERTA'}
                                </p>
                            </div>

                            <div className="border border-outline-variant bg-surface-container-low p-4 flex flex-col justify-center border-l-4 border-l-primary">
                                <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Sugerencia AI</p>
                                <p className="text-sm font-bold text-on-surface uppercase leading-tight">
                                    {accionSugerida.replace(/_/g, ' ')}
                                    {cantidadSugerida > 0 && <span className="block text-primary mt-1">{cantidadSugerida} un.</span>}
                                </p>
                            </div>
                        </section>

                        <section className="border border-outline-variant bg-surface-container-low p-4">
                            <p className="text-[11px] uppercase tracking-widest text-on-surface-variant mb-2">Razonamiento Comercial (IA)</p>
                            <p className="text-sm text-on-surface-variant leading-relaxed">{razonamiento}</p>
                        </section>

                        <section className="border border-outline-variant bg-surface-container-low p-4">
                            <div className="flex items-end justify-between gap-4 mb-3">
                                <div>
                                    <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">Competencia</p>
                                    <h4 className="font-headline text-lg font-black tracking-tight uppercase">Precio último mes</h4>
                                </div>
                                <p className="text-xs uppercase tracking-widest text-on-surface-variant">(30 días)</p>
                            </div>

                            <div className="h-56 md:h-64">
                                {preciosLoading || !chartData || !chartOptions ? (
                                    <div className="h-full border border-outline-variant bg-surface-container flex items-center justify-center">
                                        <p className="text-xs uppercase tracking-widest text-on-surface-variant">Cargando gráfico…</p>
                                    </div>
                                ) : hasPriceData ? (
                                    <Line data={chartData} options={chartOptions} />
                                ) : (
                                    <div className="h-full border border-outline-variant bg-surface-container flex flex-col items-center justify-center gap-1 text-center px-4">
                                        <p className="text-xs uppercase tracking-widest text-on-surface-variant">Sin datos de competencia</p>
                                        <p className="text-[11px] text-on-surface-variant/70">Aún no se han scrapeado precios para este SKU en los últimos 30 días.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* <section className="border border-outline-variant bg-surface-container-low p-4">
                            <div className="flex items-end justify-between gap-4 mb-3">
                                <div>
                                    <p className="text-[11px] uppercase tracking-widest text-on-surface-variant">Demanda</p>
                                    <h4 className="font-headline text-lg font-black tracking-tight uppercase">Consultas recientes</h4>
                                </div>
                                <p className="text-xs uppercase tracking-widest text-on-surface-variant">(30 días)</p>
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
                        </section> */}
                    </div>
                </div>
            </div>
        </div>
    );
}