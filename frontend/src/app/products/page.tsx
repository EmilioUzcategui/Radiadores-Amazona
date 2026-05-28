"use client";

import { useMemo, useState } from "react";

type Product = {
    id: number;
    name: string;
    category: string;
    price: number;
    image: string;
    description: string;
};

const products: Product[] = [
    {
        id: 1,
        name: "Radiador Liviano AL-120",
        category: "Vehículos livianos",
        price: 480000,
        image:
            "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=900&q=80",
        description: "Radiador compacto para autos urbanos con alta transferencia térmica.",
    },
    {
        id: 2,
        name: "Radiador Camioneta HD-220",
        category: "Vehículos livianos",
        price: 690000,
        image:
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
        description: "Mayor capacidad de enfriamiento para camionetas de carga media.",
    },
    {
        id: 3,
        name: "Radiador Bus Proline 450",
        category: "Vehículos pesados",
        price: 1250000,
        image:
            "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80",
        description: "Solución robusta para buses intermunicipales de operación continua.",
    },
    {
        id: 4,
        name: "Radiador Camión Torque 500",
        category: "Vehículos pesados",
        price: 1590000,
        image:
            "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80",
        description: "Diseñado para camiones de trabajo intensivo y alta exigencia térmica.",
    },
    {
        id: 5,
        name: "Radiador Maquinaria MX-700",
        category: "Maquinaria",
        price: 1760000,
        image:
            "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80",
        description: "Configuración especializada para maquinaria móvil en entornos exigentes.",
    },
    {
        id: 6,
        name: "Radiador Industrial AT-900",
        category: "Maquinaria",
        price: 1980000,
        image:
            "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=900&q=80",
        description: "Modelo de alto desempeño para cargas térmicas prolongadas.",
    },
];

const formatPrice = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(value);
};

export default function ProductsPage() {
    const [query, setQuery] = useState("");

    const filteredProducts = useMemo(() => {
        const cleanQuery = query.trim().toLowerCase();
        if (!cleanQuery) {
            return products;
        }

        return products.filter((product) => product.name.toLowerCase().includes(cleanQuery));
    }, [query]);

    return (
        <main className="bg-surface min-h-screen pt-36 pb-20">
            <section className="container mx-auto px-8">
                <div className="max-w-3xl">
                    <span className="inline-flex items-center border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-headline font-bold tracking-widest text-primary uppercase">
                        Catálogo informativo
                    </span>

                    <h1 className="mt-6 font-headline text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.95]">
                        Productos
                    </h1>

                    <p className="mt-6 text-on-surface-variant text-lg md:text-xl leading-relaxed">
                        Esta sección es demostrativa y muestra productos con imágenes y precios de referencia.
                        Puedes buscar por nombre usando la barra inferior.
                    </p>
                </div>

                <div className="mt-10 max-w-xl">
                    <label htmlFor="product-search" className="block text-xs font-headline font-bold tracking-widest uppercase text-primary mb-2">
                        Buscar por nombre
                    </label>
                    <input
                        id="product-search"
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Ej: Radiador Camión"
                        className="w-full rounded-xl border border-surface-bright bg-surface-container px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/60"
                    />
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <article
                            key={product.id}
                            className="overflow-hidden rounded-2xl border border-surface-bright bg-surface-container/80 transition-all hover:-translate-y-1 hover:border-primary/60"
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-52 w-full object-cover"
                                loading="lazy"
                            />
                            <div className="p-6">
                                <p className="text-xs uppercase tracking-widest text-primary font-headline font-bold">
                                    {product.category}
                                </p>
                                <h2 className="mt-2 font-headline text-2xl font-black tracking-tight uppercase text-on-surface">
                                    {product.name}
                                </h2>
                                <p className="mt-3 text-on-surface-variant leading-relaxed">{product.description}</p>
                                <p className="mt-5 text-2xl font-headline font-black text-primary">{formatPrice(product.price)}</p>
                            </div>
                        </article>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="mt-10 rounded-xl border border-surface-bright bg-surface-container p-6">
                        <p className="text-on-surface-variant">
                            No encontramos productos con ese nombre. Prueba con otro término.
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}