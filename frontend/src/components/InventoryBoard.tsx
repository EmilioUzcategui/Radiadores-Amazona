const inventory = [
    { producto: 'Radiador Industrial R-800', categoria: 'Aluminio', stock: 42, estado: 'Disponible', tone: 'text-primary' },
    { producto: 'Intercambiador HX-21', categoria: 'Acero', stock: 7, estado: 'Stock Bajo', tone: 'text-amber-300' },
    { producto: 'Kit de Válvulas KV-4', categoria: 'Repuestos', stock: 19, estado: 'Disponible', tone: 'text-primary' },
    { producto: 'Módulo Ventilación V-12', categoria: 'Componentes', stock: 0, estado: 'Agotado', tone: 'text-red-300' },
];

export const InventoryBoard = () => {
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
                                    <tr key={item.producto} className="border-t border-outline-variant/60">
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
        </section>
    );
};
