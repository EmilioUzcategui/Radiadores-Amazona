"use client";

import { useMemo, useState } from 'react';

const chats = [
    {
        empresa: 'Frigorífico Patagónico',
        contacto: 'Laura Méndez',
        consulta: 'Necesito saber el precio del radiador industrial R-600 y tiempos de entrega.',
        categoria: 'Radiador',
        producto: 'Radiador R-600',
        fecha: '02/05/2026',
        hora: '10:42',
    },
    {
        empresa: 'Constructora Alerce',
        contacto: 'Carlos Ruiz',
        consulta: 'Busco tapa para radiador modelo TX-90, tienen stock?',
        categoria: 'Tapa',
        producto: 'Tapa TX-90',
        fecha: '02/05/2026',
        hora: '11:20',
    },
    {
        empresa: 'Termicos del Sur',
        contacto: 'Marta Salinas',
        consulta: 'Quiero comparar radiadores para camiones, que opciones hay?',
        categoria: 'Radiador',
        producto: 'Radiador R-320',
        fecha: '02/05/2026',
        hora: '14:05',
    },
    {
        empresa: 'Logistica Boreal',
        contacto: 'Andres Vidal',
        consulta: 'Necesito un radiador compacto para minicargador, recomendaciones?',
        categoria: 'Radiador',
        producto: 'Radiador R-210',
        fecha: '03/05/2026',
        hora: '09:15',
    },
    {
        empresa: 'Minera Cumbre',
        contacto: 'Valentina Farias',
        consulta: 'Categoria de radiadores disponibles para maquinaria pesada?',
        categoria: 'Radiador',
        producto: 'Radiador R-780',
        fecha: '03/05/2026',
        hora: '10:10',
    },
    {
        empresa: 'Transporte Andino',
        contacto: 'Miguel Pizarro',
        consulta: 'Estoy buscando una tapa reforzada para radiador R-210.',
        categoria: 'Tapa',
        producto: 'Tapa R-210',
        fecha: '03/05/2026',
        hora: '12:32',
    },
    {
        empresa: 'Servicios Austral',
        contacto: 'Natalia Rojas',
        consulta: 'Que radiador es compatible con el modelo RT-450?',
        categoria: 'Radiador',
        producto: 'Radiador RT-450',
        fecha: '03/05/2026',
        hora: '15:48',
    },
    {
        empresa: 'Mecanica Laguna',
        contacto: 'Tomas Vera',
        consulta: 'Busco tapas economicas para radiadores viejos.',
        categoria: 'Tapa',
        producto: 'Tapa Clasica',
        fecha: '03/05/2026',
        hora: '16:20',
    },
    {
        empresa: 'Agricola Norte',
        contacto: 'Paula Soto',
        consulta: 'Necesito un radiador menos costoso para tractor.',
        categoria: 'Radiador',
        producto: 'Radiador R-120',
        fecha: '03/05/2026',
        hora: '18:02',
    },
];

export const ClientsBoard = () => {
    const [page, setPage] = useState(1);
    const pageSize = 6;
    const totalPages = Math.max(1, Math.ceil(chats.length / pageSize));
    const pagedChats = useMemo(() => {
        const start = (page - 1) * pageSize;
        return chats.slice(start, start + pageSize);
    }, [page]);

    const metrics = {
        productoMas: 'Radiador R-600',
        categoriaMas: 'Radiador',
        productoMenos: 'Radiador R-120',
        categoriaMenos: 'Tapa',
        horaMas: '10:00 - 12:00',
        horaMenos: '16:00 - 18:00',
    };

    return (
        <section className="space-y-8">
            <header className="border border-outline-variant bg-surface-container-low p-6 md:p-8">
                <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3">Historial de Chatbot</p>
                <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter uppercase">Historial de chats</h1>
                <p className="text-on-surface-variant mt-4 max-w-2xl">
                    Registro mock de conversaciones y consultas realizadas por clientes en el chatbot.
                </p>
            </header>

            <section className="border border-outline-variant bg-surface-container-low overflow-hidden">
                <div className="px-5 md:px-6 py-4 border-b border-outline-variant space-y-4">
                    <h2 className="font-headline text-2xl font-black tracking-tighter uppercase">Resumen de Metricas</h2>
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
                            <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">Radiador menos preguntado</p>
                            <p className="font-headline text-lg font-semibold text-on-surface mt-2">{metrics.productoMenos}</p>
                        </div>
                        <div className="border border-outline-variant/70 bg-surface-container p-4">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">Categoria menos preguntada</p>
                            <p className="font-headline text-lg font-semibold text-on-surface mt-2">{metrics.categoriaMenos}</p>
                        </div>
                        <div className="border border-outline-variant/70 bg-surface-container p-4">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">Hora con mas trafico</p>
                            <p className="font-headline text-lg font-semibold text-on-surface mt-2">{metrics.horaMas}</p>
                        </div>
                        <div className="border border-outline-variant/70 bg-surface-container p-4">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">Hora con menos trafico</p>
                            <p className="font-headline text-lg font-semibold text-on-surface mt-2">{metrics.horaMenos}</p>
                        </div>
                    </div>
                </div>

                {chats.length === 0 ? (
                    <div className="px-5 md:px-6 py-8 text-sm text-on-surface-variant">
                        Aún no hay chats registrados en esta vista.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[620px]">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-widest text-on-surface-variant">

                                    <th className="px-5 md:px-6 py-4">Consulta</th>
                                    <th className="px-5 md:px-6 py-4">Categoria</th>
                                    <th className="px-5 md:px-6 py-4">Producto</th>
                                    <th className="px-5 md:px-6 py-4">Fecha</th>
                                    <th className="px-5 md:px-6 py-4">Hora</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagedChats.map((chat) => (
                                    <tr key={`${chat.empresa}-${chat.fecha}-${chat.hora}`} className="border-t border-outline-variant/60">

                                        <td className="px-5 md:px-6 py-4 text-on-surface-variant">{chat.consulta}</td>
                                        <td className="px-5 md:px-6 py-4 text-on-surface-variant">{chat.categoria}</td>
                                        <td className="px-5 md:px-6 py-4 text-on-surface-variant">{chat.producto}</td>
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
