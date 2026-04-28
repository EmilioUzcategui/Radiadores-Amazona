const differentiators = [
    {
        title: "Ingeniería térmica aplicada",
        text: "Analizamos flujo, disipación y demanda real para cada plataforma vehicular.",
    },
    {
        title: "Fabricación confiable",
        text: "Procesos de control de calidad para entregar radiadores resistentes y estables.",
    },
    {
        title: "Soporte técnico continuo",
        text: "Acompañamos diagnóstico, instalación y mantenimiento preventivo.",
    },
];

export default function AboutPage() {
    return (
        <main className="bg-surface min-h-screen pt-36 pb-20">
            <section className="container mx-auto px-8">
                <span className="inline-flex items-center border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-headline font-bold tracking-widest text-primary uppercase">
                    Acerca de Radiadores Amazona
                </span>

                <h1 className="mt-6 font-headline text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.95]">
                    Expertos en enfriamiento <span className="text-primary">para vehículos</span>
                </h1>

                <p className="mt-6 max-w-3xl text-on-surface-variant text-lg md:text-xl leading-relaxed">
                    Somos una empresa enfocada en soluciones térmicas para autos, camiones y maquinaria.
                    Combinamos conocimiento técnico, fabricación especializada y servicio cercano para apoyar
                    la continuidad operativa de nuestros clientes.
                </p>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {differentiators.map((item) => (
                        <article
                            key={item.title}
                            className="rounded-2xl border border-surface-bright bg-surface-container/80 p-7"
                        >
                            <h2 className="font-headline text-2xl font-black tracking-tight uppercase text-primary">
                                {item.title}
                            </h2>
                            <p className="mt-4 text-on-surface-variant leading-relaxed">{item.text}</p>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}
