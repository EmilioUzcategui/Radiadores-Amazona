'use client';
// App.tsx
import { useEffect } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

const N8N_CHAT_CONTAINER_ID = 'n8n-chat';
const N8N_CHAT_WINDOW_KEY = '__raN8nChatInit__';

export const HeroSection = () => {

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const win = window as Window & { [N8N_CHAT_WINDOW_KEY]?: boolean };
        if (win[N8N_CHAT_WINDOW_KEY]) return;

        if (document.getElementById(N8N_CHAT_CONTAINER_ID)) {
            win[N8N_CHAT_WINDOW_KEY] = true;
            return;
        }

        let isActive = true;
        win[N8N_CHAT_WINDOW_KEY] = true;

        import('@n8n/chat')
            .then(({ createChat }) => {
                if (!isActive) return;
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
            })
            .catch(err => console.error("Error cargando el chat de n8n:", err));

        return () => {
            isActive = false;
            const container = document.getElementById(N8N_CHAT_CONTAINER_ID);
            if (container) container.remove();
            win[N8N_CHAT_WINDOW_KEY] = false;
        };
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

                    </div>

                </div>
            </header>


        </div>
    );
};
