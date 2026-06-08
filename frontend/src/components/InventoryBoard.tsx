"use client";

import { useEffect, useMemo, useState } from "react";
import {
    inventoryService,
    type InventoryApiItem,
    type InventoryHistoryPoint,
} from "../../services/inventory.service";
import { InventoryItemModal, type InventoryItem } from "./InventoryItemModal";

const ITEMS_PER_PAGE = 10;

export const InventoryBoard = () => {
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [inventoryItems, setInventoryItems] = useState<InventoryApiItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [estadoFilter, setEstadoFilter] = useState("Todos");
    const [categoriaFilter, setCategoriaFilter] = useState("Todas");

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

    const categorias = useMemo(() => {
        const unique = new Set(inventory.map((item) => item.categoria));
        return Array.from(unique).sort((a, b) => a.localeCompare(b, "es"));
    }, [inventory]);

    const filteredInventory = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return inventory.filter((item) => {
            const matchesSearch =
                term === "" ||
                item.producto.toLowerCase().includes(term) ||
                item.categoria.toLowerCase().includes(term);
            const matchesEstado = estadoFilter === "Todos" || item.estado === estadoFilter;
            const matchesCategoria = categoriaFilter === "Todas" || item.categoria === categoriaFilter;
            return matchesSearch && matchesEstado && matchesCategoria;
        });
    }, [inventory, searchTerm, estadoFilter, categoriaFilter]);

    const hasActiveFilters =
        searchTerm.trim() !== "" || estadoFilter !== "Todos" || categoriaFilter !== "Todas";

    const totalPages = Math.max(1, Math.ceil(filteredInventory.length / ITEMS_PER_PAGE));

    useEffect(() => {
        setCurrentPage((prev) => Math.min(prev, totalPages));
    }, [totalPages]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, estadoFilter, categoriaFilter]);

    const paginatedInventory = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredInventory.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredInventory, currentPage]);

    const rangeStart = filteredInventory.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const rangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredInventory.length);

    const [history, setHistory] = useState<InventoryHistoryPoint[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedItem) {
            setHistory([]);
            setHistoryError(null);
            setHistoryLoading(false);
            return;
        }

        let isMounted = true;
        setHistoryLoading(true);
        setHistoryError(null);

        inventoryService
            .getInventoryHistory30d(selectedItem.sku)
            .then((points) => {
                if (isMounted) setHistory(points);
            })
            .catch((caughtError: unknown) => {
                if (!isMounted) return;
                const message = caughtError instanceof Error
                    ? caughtError.message
                    : "No se pudo cargar el histórico";
                setHistoryError(message);
                setHistory([]);
            })
            .finally(() => {
                if (isMounted) setHistoryLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [selectedItem]);

    const historialStock30d = useMemo(
        () => history.map((point) => point.stock ?? 0),
        [history],
    );
    const historialLabels30d = useMemo(
        () => history.map((point) => point.dia),
        [history],
    );

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

                <div className="flex flex-col gap-3 px-5 md:px-6 py-4 border-b border-outline-variant lg:flex-row lg:items-end">
                    <div className="flex-1">
                        <label htmlFor="inventory-search" className="block text-[11px] uppercase tracking-widest text-on-surface-variant mb-1">
                            Buscar
                        </label>
                        <div className="relative">
                            <svg
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                            </svg>
                            <input
                                id="inventory-search"
                                type="search"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Buscar por producto o categoría..."
                                className="w-full border border-outline-variant bg-surface-container-low py-2 pl-10 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="inventory-estado" className="text-[11px] uppercase tracking-widest text-on-surface-variant">
                            Estado
                        </label>
                        <select
                            id="inventory-estado"
                            value={estadoFilter}
                            onChange={(event) => setEstadoFilter(event.target.value)}
                            className="border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                        >
                            <option value="Todos">Todos</option>
                            <option value="Disponible">Disponible</option>
                            <option value="Stock Bajo">Stock Bajo</option>
                            <option value="Agotado">Agotado</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="inventory-categoria" className="text-[11px] uppercase tracking-widest text-on-surface-variant">
                            Categoría
                        </label>
                        <select
                            id="inventory-categoria"
                            value={categoriaFilter}
                            onChange={(event) => setCategoriaFilter(event.target.value)}
                            className="border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
                        >
                            <option value="Todas">Todas</option>
                            {categorias.map((categoria) => (
                                <option key={categoria} value={categoria}>
                                    {categoria}
                                </option>
                            ))}
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm("");
                                setEstadoFilter("Todos");
                                setCategoriaFilter("Todas");
                            }}
                            className="border border-outline-variant px-4 py-2 text-xs uppercase tracking-widest text-on-surface transition-colors hover:bg-surface-container-highest/40"
                        >
                            Limpiar
                        </button>
                    )}
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
                ) : filteredInventory.length === 0 ? (
                    <div className="px-5 md:px-6 py-8 text-sm text-on-surface-variant">
                        No se encontraron productos que coincidan con la búsqueda.
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
                                {paginatedInventory.map((item) => (
                                    <tr
                                        key={item.key}
                                        className="border-t border-outline-variant/60 cursor-pointer hover:bg-surface-container-highest/40 transition-colors"
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setSelectedItem({ sku: item.key, producto: item.producto, categoria: item.categoria, stock: item.stock, estado: item.estado })}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" || event.key === " ") {
                                                event.preventDefault();
                                                setSelectedItem({ sku: item.key, producto: item.producto, categoria: item.categoria, stock: item.stock, estado: item.estado });
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

                {!isLoading && !error && filteredInventory.length > 0 && (
                    <div className="flex flex-col gap-3 px-5 md:px-6 py-4 border-t border-outline-variant sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                            Mostrando {rangeStart}-{rangeEnd} de {filteredInventory.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="border border-outline-variant px-4 py-2 text-xs uppercase tracking-widest text-on-surface transition-colors hover:bg-surface-container-highest/40 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Anterior
                            </button>
                            <span className="text-xs uppercase tracking-widest text-on-surface-variant">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="border border-outline-variant px-4 py-2 text-xs uppercase tracking-widest text-on-surface transition-colors hover:bg-surface-container-highest/40 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {selectedItem && (
                <InventoryItemModal
                    isOpen={Boolean(selectedItem)}
                    item={selectedItem}
                    historialStock30d={historialStock30d}
                    historialLabels30d={historialLabels30d}
                    historialLoading={historyLoading}
                    historialError={historyError}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </section>
    );
};
