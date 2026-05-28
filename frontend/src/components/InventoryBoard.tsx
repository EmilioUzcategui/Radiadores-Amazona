"use client";

import { useEffect, useMemo, useState } from "react";
import { inventoryService, type InventoryApiItem } from "../../services/inventory.service";
import { InventoryItemModal, type InventoryItem } from "./InventoryItemModal";

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
    const [inventoryItems, setInventoryItems] = useState<InventoryApiItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadInventory = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const items = await inventoryService.listInventory();
                if (isMounted) {
                    setInventoryItems(items);
                }
            } catch (caughtError) {
                if (isMounted) {
                    const message = caughtError instanceof Error
                        ? caughtError.message
                        : "No se pudo cargar el inventario";
                    setError(message);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadInventory();

        return () => {
            isMounted = false;
        };
    }, []);

    const inventory = useMemo(() => {
        return inventoryItems.map((item) => {
            const sku = item.producto.sku?.trim();
            const modelo = item.producto.modelo_vehiculo?.trim();
            const productoLabel = sku && modelo ? `${sku} · ${modelo}` : sku || modelo || "Sin producto";
            const categoriaLabel = item.producto.material ?? item.producto.marca_vehiculo ?? "Sin categoria";
            const stockValue = item.inventario.stock_actual ?? 0;
            const minStock = item.inventario.stock_minimo;
            const estado = stockValue === 0
                ? "Agotado"
                : minStock !== null && stockValue <= minStock
                    ? "Stock Bajo"
                    : "Disponible";
            const tone = estado === "Agotado"
                ? "text-red-300"
                : estado === "Stock Bajo"
                    ? "text-amber-300"
                    : "text-primary";

            return {
                key: item.sku,
                producto: productoLabel,
                categoria: categoriaLabel,
                stock: stockValue,
                estado,
                tone,
            };
        });
    }, [inventoryItems]);

    const historialStock30d = useMemo(() => {
        if (!selectedItem) return [];
        return generateStockHistory30d(selectedItem.producto, Math.max(0, selectedItem.stock));
    }, [selectedItem]);

    return (
        <section className="space-y-8">
            <header className="border border-outline-variant bg-surface-container-low p-6 md:p-8">
                <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3">Control de Stock</p>
                <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter uppercase">Inventario</h1>
                <p className="text-on-surface-variant mt-4 max-w-2xl">
                    Vista del inventario para monitorear disponibilidad y estado de productos críticos.
                </p>
            </header>

            <section className="border border-outline-variant bg-surface-container-low overflow-hidden">
                <div className="px-5 md:px-6 py-4 border-b border-outline-variant">
                    <h2 className="font-headline text-2xl font-black tracking-tighter uppercase">Listado de Inventario</h2>
                </div>

                {isLoading ? (
                    <div className="px-5 md:px-6 py-8 text-sm text-on-surface-variant">
                        Cargando inventario...
                    </div>
                ) : error ? (
                    <div className="px-5 md:px-6 py-8 text-sm text-on-surface-variant">
                        {error}
                    </div>
                ) : inventory.length === 0 ? (
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
                                        key={item.key}
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
