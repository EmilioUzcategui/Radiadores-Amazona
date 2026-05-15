"use client";

import { useMemo, useState } from "react";
import { InventoryItemModal, type InventoryItem } from "./InventoryItemModal";

const inventory = [
    { producto: 'Radiador Industrial R-800', categoria: 'Aluminio', stock: 42, estado: 'Disponible', tone: 'text-primary' },
    { producto: 'Intercambiador HX-21', categoria: 'Acero', stock: 7, estado: 'Stock Bajo', tone: 'text-amber-300' },
    { producto: 'Kit de Válvulas KV-4', categoria: 'Repuestos', stock: 19, estado: 'Disponible', tone: 'text-primary' },
    { producto: 'Módulo Ventilación V-12', categoria: 'Componentes', stock: 0, estado: 'Agotado', tone: 'text-red-300' },
];

function generateStockHistory30d(producto: string, currentStock: number) {
    const seed = producto.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    let value = Math.max(0, currentStock + ((seed % 7) - 3));
    const volatility = 1 + (seed % 3);

    const series: number[] = [];
    for (let i = 0; i < 30; i += 1) {
        const wave = Math.sin((i / 7) * Math.PI * 2) * volatility;
        const shock = ((seed + i * 13) % 5) - 2;
        value = Math.max(0, Math.round(value + wave + shock * 0.15));
        series.push(value);
    }

    // Asegura que el último punto refleje el stock actual (mock pero consistente)
    series[series.length - 1] = Math.max(0, currentStock);
    return series;
}

export const InventoryBoard = () => {
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    const historialStock30d = useMemo(() => {
        if (!selectedItem) return [];
        return generateStockHistory30d(selectedItem.producto, selectedItem.stock);
    }, [selectedItem]);

    return (
        <section className="space-y-8">
            <header className="border border-outline-variant bg-surface-container-low p-6 md:p-8">
                <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3">Control de Stock</p>
                <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter uppercase">Inventario</h1>
                <p className="text-on-surface-variant mt-4 max-w-2xl">
                    Vista mock del inventario para monitorear disponibilidad y estado de productos críticos.
                </p>
            </header>

            <section className="border border-outline-variant bg-surface-container-low overflow-hidden">
                <div className="px-5 md:px-6 py-4 border-b border-outline-variant">
                    <h2 className="font-headline text-2xl font-black tracking-tighter uppercase">Listado de Inventario</h2>
                </div>

                {inventory.length === 0 ? (
                    <div className="px-5 md:px-6 py-8 text-sm text-on-surface-variant">
                        No hay registros de inventario disponibles por ahora.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px]">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-widest text-on-surface-variant">
                                    <th className="px-5 md:px-6 py-4">Producto</th>
                                    <th className="px-5 md:px-6 py-4">Categoría</th>
                                    <th className="px-5 md:px-6 py-4">Stock</th>
                                    <th className="px-5 md:px-6 py-4">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map((item) => (
                                    <tr
                                        key={item.producto}
                                        className="border-t border-outline-variant/60 cursor-pointer hover:bg-surface-container-highest/40 transition-colors"
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setSelectedItem({ producto: item.producto, categoria: item.categoria, stock: item.stock, estado: item.estado })}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" || event.key === " ") {
                                                event.preventDefault();
                                                setSelectedItem({ producto: item.producto, categoria: item.categoria, stock: item.stock, estado: item.estado });
                                            }
                                        }}
                                    >
                                        <td className="px-5 md:px-6 py-4 text-on-surface">{item.producto}</td>
                                        <td className="px-5 md:px-6 py-4 text-on-surface-variant">{item.categoria}</td>
                                        <td className="px-5 md:px-6 py-4 text-primary font-bold">{item.stock}</td>
                                        <td className={`px-5 md:px-6 py-4 font-semibold ${item.tone}`}>{item.estado}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {selectedItem && (
                <InventoryItemModal
                    isOpen={Boolean(selectedItem)}
                    item={selectedItem}
                    historialStock30d={historialStock30d}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </section>
    );
};
