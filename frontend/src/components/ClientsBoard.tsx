"use client";

import { useEffect, useMemo, useState } from "react";
import {
    metricsService,
    type ChatHistoryItem,
    type SummaryMetrics,
} from "../../services/auth/metrics.service";

export const ClientsBoard = () => {
    const [page, setPage] = useState(1);
    const [chats, setChats] = useState<ChatHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<SummaryMetrics | null>(null);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const pageSize = 6;

    useEffect(() => {
        let isMounted = true;

        const loadChats = async () => {
            setIsLoading(true);
            setError(null);
            setSummaryError(null);
            try {
                const [historyResult, summaryResult] = await Promise.allSettled([
                    metricsService.listConversationalHistory({
                        limit: 500,
                        offset: 0,
                    }),
                    metricsService.getSummaryMetrics(),
                ]);

                if (isMounted) {
                    if (historyResult.status === "fulfilled") {
                        setChats(historyResult.value);
                    } else {
                        const message = historyResult.reason instanceof Error
                            ? historyResult.reason.message
                            : "No se pudieron cargar los chats";
                        setError(message);
                    }

                    if (summaryResult.status === "fulfilled") {
                        setSummary(summaryResult.value);
                    } else {
                        const message = summaryResult.reason instanceof Error
                            ? summaryResult.reason.message
                            : "No se pudieron cargar las métricas";
                        setSummaryError(message);
                    }
                }
            } catch (caughtError) {
                if (isMounted) {
                    const message = caughtError instanceof Error
                        ? caughtError.message
                        : "No se pudieron cargar los datos";
                    setError(message);
                    setSummaryError(message);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadChats();

        return () => {
            isMounted = false;
        };
    }, []);

    const normalizedChats = useMemo(() => {
        return chats.map((chat) => {
            const message = typeof chat.message?.content === "string" && chat.message.content.trim()
                ? chat.message.content.trim()
                : "Sin mensaje";
            const date = chat.fecha_hora ? new Date(chat.fecha_hora) : null;
            const fecha = date ? date.toLocaleDateString("es-ES") : "--/--/----";
            const hora = date
                ? date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false })
                : "--:--";
            return {
                id: chat.id,
                mensaje: message,
                fecha,
                hora,
            };
        });
    }, [chats]);

    const totalPages = Math.max(1, Math.ceil(normalizedChats.length / pageSize));

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const pagedChats = useMemo(() => {
        const start = (page - 1) * pageSize;
        return normalizedChats.slice(start, start + pageSize);
    }, [page, normalizedChats]);

    const metrics = {
        productoMas: summary?.producto_mas_preguntado ?? "Cargando...",
        categoriaMas: summary?.categoria_mas_preguntada ?? "Cargando...",
        productoMenos: summary?.radiador_menos_preguntado ?? "Cargando...",
        categoriaMenos: summary?.categoria_menos_preguntada ?? "Cargando...",
        horaMas: summary?.hora_mas_trafico ?? "Cargando...",
        horaMenos: summary?.hora_menos_trafico ?? "Cargando...",
    };

    return (
        <section className="space-y-8">
            <header className="border border-outline-variant bg-surface-container-low p-6 md:p-8">
                <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3">Historial de Chatbot</p>
                <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter uppercase">Historial de chats</h1>
                <p className="text-on-surface-variant mt-4 max-w-2xl">
                    Registro de conversaciones y consultas realizadas por clientes en el chatbot.
                </p>
            </header>

            <section className="border border-outline-variant bg-surface-container-low overflow-hidden">
                <div className="px-5 md:px-6 py-4 border-b border-outline-variant space-y-4">
                    <h2 className="font-headline text-2xl font-black tracking-tighter uppercase">Resumen de Metricas</h2>
                    {summaryError ? (
                        <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                            {summaryError}
                        </p>
                    ) : null}
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        <div className="border border-outline-variant/70 bg-surface-container p-4">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">Producto mas preguntado</p>
                            <p className="font-headline text-lg font-semibold text-on-surface mt-2">{metrics.productoMas}</p>
                        </div>
                        <div className="border border-outline-variant/70 bg-surface-container p-4">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">Categoria mas preguntada</p>
                            <p className="font-headline text-lg font-semibold text-on-surface mt-2">{metrics.categoriaMas}</p>
                        </div>
                        <div className="border border-outline-variant/70 bg-surface-container p-4">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">Hora con mas trafico</p>
                            <p className="font-headline text-lg font-semibold text-on-surface mt-2">{metrics.horaMas}</p>
                        </div>

                        <div className="border border-outline-variant/70 bg-surface-container p-4">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">Producto menos preguntado</p>
                            <p className="font-headline text-lg font-semibold text-on-surface mt-2">{metrics.productoMenos}</p>
                        </div>
                        <div className="border border-outline-variant/70 bg-surface-container p-4">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">Categoria menos preguntada</p>
                            <p className="font-headline text-lg font-semibold text-on-surface mt-2">{metrics.categoriaMenos}</p>
                        </div>


                        <div className="border border-outline-variant/70 bg-surface-container p-4">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">Hora con menos trafico</p>
                            <p className="font-headline text-lg font-semibold text-on-surface mt-2">{metrics.horaMenos}</p>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="px-5 md:px-6 py-8 text-sm text-on-surface-variant">
                        Cargando chats...
                    </div>
                ) : error ? (
                    <div className="px-5 md:px-6 py-8 text-sm text-on-surface-variant">
                        {error}
                    </div>
                ) : normalizedChats.length === 0 ? (
                    <div className="px-5 md:px-6 py-8 text-sm text-on-surface-variant">
                        Aún no hay chats registrados en esta vista.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[620px]">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-widest text-on-surface-variant">

                                    <th className="px-5 md:px-6 py-4">Mensaje</th>
                                    <th className="px-5 md:px-6 py-4">Fecha</th>
                                    <th className="px-5 md:px-6 py-4">Hora</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagedChats.map((chat) => (
                                    <tr key={chat.id} className="border-t border-outline-variant/60">

                                        <td className="px-5 md:px-6 py-4 text-on-surface-variant">{chat.mensaje}</td>
                                        <td className="px-5 md:px-6 py-4 text-on-surface-variant">{chat.fecha}</td>
                                        <td className="px-5 md:px-6 py-4 text-on-surface-variant">{chat.hora}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex flex-wrap items-center justify-between gap-3 px-5 md:px-6 py-4 border-t border-outline-variant">
                            <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                                Pagina {page} de {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="border border-outline-variant px-3 py-1 text-xs uppercase tracking-widest text-on-surface-variant disabled:opacity-50"
                                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                                    disabled={page === 1}
                                >
                                    Anterior
                                </button>
                                <button
                                    type="button"
                                    className="border border-outline-variant px-3 py-1 text-xs uppercase tracking-widest text-on-surface-variant disabled:opacity-50"
                                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                    disabled={page === totalPages}
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </section>
    );
};
