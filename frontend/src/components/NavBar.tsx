"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
// 1. Importamos el componente Image de Next.js
import Image from "next/image";

export const NavBar = () => {
    const pathname = usePathname();

    const navItems = [
        { href: "/", label: "HOME" },
        { href: "/products", label: "PRODUCTS" },
        { href: "/about", label: "ABOUT" },
        { href: "/contact", label: "CONTACT" },
    ];

    const isActiveRoute = (href: string) => {
        if (href === "/") {
            return pathname === "/";
        }
        return pathname?.startsWith(href);
    };

    return (
        <div>
            <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-6 max-w-none bg-[#131313] transition-colors duration-300">

                {/* 2. Envolvemos el Logo y el Texto en un Link para volver al Home */}
                <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                    {/* 3. Insertamos el Logo */}
                    <Image
                        src="/logo-empresa.png" // La ruta empieza directamente desde public/
                        alt="Logo Radiadores Amazona"
                        width={80} // Define el ancho en píxeles (ajústalo a tu gusto)
                        height={80} // Define el alto en píxeles
                        className="object-contain" // Evita que la imagen se deforme
                    />
                    <div className="text-2xl font-black tracking-tighter text-white uppercase font-headline">
                        RADIADORES AMAZONA
                    </div>
                </Link>

                <div className="hidden md:flex gap-12 items-center">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`font-headline font-bold tracking-tighter uppercase border-b-2 pb-1 transition-colors ${isActiveRoute(item.href)
                                    ? "text-primary border-primary-container"
                                    : "text-primary-fixed-dim border-transparent hover:text-primary"
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                <Link
                    href="/auth"
                    className="thermal-gradient text-on-primary-container px-6 py-3 font-headline font-black text-sm tracking-tighter uppercase hover:brightness-105 transition-all"
                >
                    Login
                </Link>
            </nav>
        </div>
    );
};