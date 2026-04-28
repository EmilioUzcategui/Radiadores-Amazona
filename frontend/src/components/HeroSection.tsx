'use client';
// App.tsx
import { useEffect } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

export const HeroSection = () => {

    useEffect(() => {
        // 1. Doble seguro: Si no estamos en el navegador, no hagas nada
        if (typeof window === 'undefined') return;

        if (document.querySelector('#n8n-chat')) {
            return;
        }

        // 2. IMPORTACIÓN DINÁMICA: Solo se carga en el cliente
        import('@n8n/chat').then(({ createChat }) => {
            createChat({
                webhookUrl: 'https://n8n.srv1038201.hstgr.cloud/webhook/2fb8489a-b1c4-42a6-aedf-544f0fb1c08f/chat',
                showWelcomeScreen: true,
                initialMessages: [
                    'Hola, bienvenido a Radiadores Amazona.',
                    'Estoy listo para ayudarte con productos, precios y soporte técnico.',
                ],
                i18n: {
                    en: {
                        title: 'Asesor Virtual',
                        subtitle: 'Atención informativa 24/7 para tu operación.',
                        footer: '',
                        getStarted: 'Iniciar chat',
                        inputPlaceholder: 'Escribe tu consulta...',
                        closeButtonTooltip: 'Cerrar chat',
                    },
                },
            });
        }).catch(err => console.error("Error cargando el chat de n8n:", err));

    }, []);
    return (
        <div>
            {/* Hero Section */}
            <header className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-surface">
                <div className="absolute inset-0 z-0">
                    <img alt="Radiador automotriz de alto desempeño instalado en un vehículo"
                        className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
                        data-alt="Sistema de enfriamiento vehicular de alto desempeño"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4MYG-0PAP5UAdUtMeFQH_G9c_OwF0m6QNdcVKixMvpmEN-ABXEEDxeOpDU3Q-Hb9h3j-3zjoz77OxMpXTyF6g-_8_UZfo2FX0ysYsT93-767hlW5_KN2pGl-3xSsCL12cEXz4m_sohZD_A1KWMyCtyAN5GZ9s6DrsGCGxW9HQmMPf598k37fB93SQqKHNBq4e85gGAT3Jzp7_-ypS3_XVLDAq55dZmuKsMGwsl6VHFskViPvMOUm6nAt-KnCIsRttXEmZ5lk_18U" />
                    <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent"></div>
                </div>
                <div className="container mx-auto px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8">
                        <div className="inline-block bg-primary-container/10 border-l-4 border-primary px-4 py-2 mb-8">
                            <span className="text-primary font-headline font-bold tracking-widest text-sm uppercase">SOLO
                                VEHÍCULOS</span>
                        </div>
                        <h1 className="font-headline text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter uppercase mb-8">
                            Radiadores para <br /> Vehículos de <br /> <span className="text-primary">Alto Rendimiento</span>
                        </h1>
                        <p className="text-on-surface-variant text-xl md:text-2xl max-w-2xl font-light leading-relaxed mb-12">
                            Diseñamos y fabricamos radiadores únicamente para vehículos: livianos, pesados y maquinaria móvil.
                            Ingeniería térmica de precisión para rutas exigentes en clima amazónico.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <button
                                className="thermal-gradient text-on-primary-container px-10 py-5 font-headline font-black text-lg tracking-tighter uppercase transition-transform hover:-translate-y-1">
                                Cotizar para mi Vehículo
                            </button>
                            <button
                                className="border border-outline px-10 py-5 font-headline font-black text-lg tracking-tighter uppercase hover:bg-white/5 transition-colors">
                                Ver Catálogo Vehicular
                            </button>
                        </div>
                    </div>
                    <div
                        className="lg:col-span-4 hidden lg:flex flex-col justify-end space-y-8 border-l border-surface-bright pl-8">
                        <div>
                            <span className="block text-primary font-headline text-4xl font-black">2.5k+</span>
                            <span className="text-on-surface-variant text-xs tracking-widest uppercase">Vehículos Atendidos</span>
                        </div>
                        <div>
                            <span className="block text-primary font-headline text-4xl font-black">+30</span>
                            <span className="text-on-surface-variant text-xs tracking-widest uppercase">Modelos Vehiculares</span>
                        </div>
                        <div>
                            <span className="block text-primary font-headline text-4xl font-black">24/7</span>
                            <span className="text-on-surface-variant text-xs tracking-widest uppercase">Soporte Técnico</span>
                        </div>
                    </div>
                </div>
            </header>


        </div>
    );
};
