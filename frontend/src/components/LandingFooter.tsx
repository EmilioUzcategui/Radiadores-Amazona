import Link from "next/link";

const quickLinks = [
    { href: "/", label: "Inicio" },
    { href: "/products", label: "Productos" },
    { href: "/about", label: "Acerca de" },
    { href: "/contact", label: "Contacto" },
];

export const LandingFooter = () => {
    return (
        <footer className="relative overflow-hidden border-t border-surface-bright bg-surface-container-low py-14">
            <div className="absolute inset-0 radiator-grid opacity-15" />
            <div className="absolute -bottom-20 left-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

            <div className="container mx-auto px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                        <p className="font-headline text-2xl font-black tracking-tighter uppercase text-on-surface">
                            Radiadores Amazona
                        </p>
                        <p className="mt-4 text-on-surface-variant leading-relaxed max-w-sm">
                            Soluciones térmicas para vehículos livianos, pesados y maquinaria en operación exigente.
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-headline font-bold uppercase tracking-widest text-primary">
                            Navegación
                        </p>
                        <ul className="mt-4 space-y-2">
                            {quickLinks.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="font-headline font-bold tracking-tight uppercase text-primary-fixed-dim hover:text-primary transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="text-xs font-headline font-bold uppercase tracking-widest text-primary">
                            Contacto rápido
                        </p>
                        <ul className="mt-4 space-y-2 text-on-surface-variant">
                            <li>+58 412-4373856</li>
                            <li>radiadoresamazona@gmail.com</li>
                            <li>Lunes a viernes de 8:00 a.m. a 5:00 p.m. los sábados y domingos de 8:00 a.m. a 1:00 p.m</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-surface-bright text-sm text-on-surface-variant">
                    © {new Date().getFullYear()} Radiadores Amazona. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
};