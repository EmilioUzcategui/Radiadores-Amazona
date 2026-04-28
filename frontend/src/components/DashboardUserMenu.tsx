"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { setAuthToken } from "../../lib/api";
import { useAuthStore } from "@/store/authStore";

type MenuItem = {
    key: string;
    label: string;
    description: string;
    danger?: boolean;
    icon: React.ReactNode;
};

const menuItems: MenuItem[] = [
    {
        key: "profile",
        label: "Mi perfil",
        description: "Datos personales y foto",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
                <path
                    d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2.25c-3.27 0-7.5 1.64-7.5 4.5V21h15v-2.25c0-2.86-4.23-4.5-7.5-4.5Z"
                    fill="currentColor"
                />
            </svg>
        ),
    },
    {
        key: "settings",
        label: "Configuracion",
        description: "Preferencias del sistema",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
                <path
                    d="M19.14 12.94a7.93 7.93 0 0 0 .06-.94 7.93 7.93 0 0 0-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.48 7.48 0 0 0-1.63-.94l-.36-2.54a.51.51 0 0 0-.49-.42h-3.84a.5.5 0 0 0-.49.42l-.36 2.54a7.48 7.48 0 0 0-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.93 7.93 0 0 0-.06.94 7.93 7.93 0 0 0 .06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.5.39 1.04.72 1.63.94l.36 2.54a.5.5 0 0 0 .49.42h3.84a.5.5 0 0 0 .49-.42l.36-2.54c.59-.22 1.13-.55 1.63-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64ZM12 15.6A3.6 3.6 0 1 1 15.6 12 3.6 3.6 0 0 1 12 15.6Z"
                    fill="currentColor"
                />
            </svg>
        ),
    },
    {
        key: "notifications",
        label: "Notificaciones",
        description: "Alertas y recordatorios",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
                <path
                    d="M12 22a2.49 2.49 0 0 0 2.35-1.67h-4.7A2.49 2.49 0 0 0 12 22Zm6-6v-5a6 6 0 1 0-12 0v5L4 18v1h16v-1Z"
                    fill="currentColor"
                />
            </svg>
        ),
    },
    {
        key: "help",
        label: "Ayuda",
        description: "Centro de soporte",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
                <path
                    d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm.13 15.5a1.38 1.38 0 1 1 1.37-1.37 1.38 1.38 0 0 1-1.37 1.37Zm2.17-6.35-.62.64a2.34 2.34 0 0 0-.8 1.71v.25h-1.8v-.4a2.83 2.83 0 0 1 .84-2.01l.85-.87a1.41 1.41 0 0 0 .43-1A1.5 1.5 0 0 0 11.73 8a1.59 1.59 0 0 0-1.55 1.41H8.35A3.34 3.34 0 0 1 11.73 6.3a3.27 3.27 0 0 1 3.27 3.14 2.9 2.9 0 0 1-.7 1.71Z"
                    fill="currentColor"
                />
            </svg>
        ),
    },
    {
        key: "logout",
        label: "Cerrar sesion",
        description: "Salir del panel",
        danger: true,
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
                <path
                    d="M10 17v-2h5v-2h-5V11l-3 3Zm-6 4V3a1 1 0 0 1 1-1h9v2H6v16h8v2H5a1 1 0 0 1-1-1Zm12-4v-2h4V9h-4V7h5a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1Z"
                    fill="currentColor"
                />
            </svg>
        ),
    },
];

export const DashboardUserMenu = () => {
    const router = useRouter();
    const setLogout = useAuthStore((state) => state.setLogout);
    const authUser = useAuthStore((state) => state.user);

    const [isOpen, setIsOpen] = useState(false);
    const [lastAction, setLastAction] = useState("");
    const menuContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (!menuContainerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("mousedown", handleOutsideClick);
        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("mousedown", handleOutsideClick);
            window.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const handleItemClick = (key: string, label: string) => {
        if (key === "logout") {
            setLogout();
            setAuthToken(null);
            setIsOpen(false);
            router.replace("/auth");
            return;
        }

        setLastAction(`Accion mock ejecutada: ${label}`);
        setIsOpen(false);
    };

    return (
        <div ref={menuContainerRef} className="relative self-start sm:self-auto">
            <button
                type="button"
                onClick={() => setIsOpen((previousState) => !previousState)}
                className={`flex items-center gap-3 border bg-surface-container px-3 py-2 transition-colors ${isOpen
                    ? "border-primary/70 shadow-[0_0_0_1px_rgba(255,138,0,0.25)]"
                    : "border-outline-variant hover:border-primary/60"
                    }`}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls="dashboard-user-menu"
            >
                <Image
                    src="/avatar-mock.svg"
                    alt="Foto de perfil del usuario"
                    width={44}
                    height={44}
                    className="w-11 h-11 rounded-full object-cover border border-outline-variant"
                />
                <div className="text-left">
                    <p className="font-headline text-sm font-black uppercase tracking-wider text-on-surface">
                        {authUser ? `${authUser.names} ${authUser.last_names}` : "Usuario"}
                    </p>
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                        {authUser?.email ?? "Sin correo"}
                    </p>
                </div>
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden
                    className={`h-4 w-4 text-primary transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
                >
                    <path d="M12 15.25 6.75 10h10.5Z" fill="currentColor" />
                </svg>
            </button>

            {isOpen && (
                <div
                    id="dashboard-user-menu"
                    role="menu"
                    className="absolute right-0 top-[calc(100%+0.75rem)] w-80 overflow-hidden rounded-xl border border-surface-bright bg-surface-container-high shadow-2xl"
                >
                    <div className="border-b border-surface-bright px-5 py-4 bg-surface-container">
                        <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Cuenta activa</p>
                        <p className="mt-1 font-headline text-lg font-black uppercase tracking-tight text-on-surface">
                            {authUser ? `${authUser.names} ${authUser.last_names}` : "Usuario"}
                        </p>
                    </div>

                    <div className="p-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                role="menuitem"
                                onClick={() => handleItemClick(item.key, item.label)}
                                className={`w-full rounded-lg px-3 py-3 text-left transition-colors ${item.danger
                                    ? "text-[#ff9b94] hover:bg-[#93000a]/20"
                                    : "text-on-surface hover:bg-surface-container-highest"
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <span className={`mt-0.5 ${item.danger ? "text-[#ff9b94]" : "text-primary"}`}>{item.icon}</span>
                                    <span>
                                        <span className="block font-headline text-sm font-black uppercase tracking-wider">
                                            {item.label}
                                        </span>
                                        <span className="block text-xs text-on-surface-variant mt-1">{item.description}</span>
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {lastAction && (
                        <p className="mx-4 mb-4 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
                            {lastAction}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};