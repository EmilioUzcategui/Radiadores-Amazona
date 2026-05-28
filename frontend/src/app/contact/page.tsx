"use client";

import { FormEvent, useState } from "react";

const contactChannels = [
    {
        label: "Línea comercial",
        value: "+58 412-4373856",
        note: "Cotizaciones, disponibilidad y tiempos de entrega.",
    },
    {
        label: "Correo corporativo",
        value: "radiadoresamazona@gmail.com",
        note: "Atención para clientes, distribuidores y alianzas comerciales.",
    },
    {
        label: "Horario de atención",
        value: "Lunes a viernes de 8:00 a.m. a 5:00 p.m. los sábados y domingos de 8:00 a.m. a 1:00 p.m.",
        note: "Pedidos y seguimiento postventa.",
    },
];

export default function ContactPage() {
    const [statusMessage, setStatusMessage] = useState("");

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);
        const name = String(formData.get("name") ?? "").trim();

        setStatusMessage(
            name
                ? `Gracias, ${name}. Recibimos tu solicitud y te contactaremos pronto.`
                : "Recibimos tu solicitud y te contactaremos pronto."
        );

        form.reset();
    };

    return (
        <main className="bg-surface min-h-screen pt-36 pb-20">
            <section className="container mx-auto px-8">
                <span className="inline-flex items-center border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-headline font-bold tracking-widest text-primary uppercase">
                    Contacto
                </span>

                <h1 className="mt-6 font-headline text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.95]">
                    Conversemos sobre tu <span className="text-primary">operación</span>
                </h1>

                <p className="mt-6 max-w-3xl text-on-surface-variant text-lg md:text-xl leading-relaxed">
                    Esta página mantiene un formulario de contacto para pruebas visuales y de
                    experiencia de usuario, sin envío real al backend por ahora.
                </p>

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-5 space-y-5">
                        {contactChannels.map((channel) => (
                            <article key={channel.label} className="glass-panel rounded-2xl border border-surface-bright p-7">
                                <p className="text-xs uppercase tracking-widest text-primary font-headline font-bold">
                                    {channel.label}
                                </p>
                                <p className="mt-3 text-on-surface font-headline text-xl font-black tracking-tight">
                                    {channel.value}
                                </p>
                                <p className="mt-3 text-on-surface-variant leading-relaxed">{channel.note}</p>
                            </article>
                        ))}
                    </div>

                    <div className="lg:col-span-7">
                        <form
                            onSubmit={handleSubmit}
                            className="rounded-2xl border border-surface-bright bg-surface-container/80 p-7 md:p-8"
                        >
                            <p className="text-xs uppercase tracking-widest text-primary font-headline font-bold">
                                Formulario de contacto
                            </p>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="name" className="block text-sm text-on-surface-variant mb-2">
                                        Nombre completo
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        autoComplete="name"
                                        placeholder="Ej: Carlos Mendoza"
                                        className="w-full rounded-xl border border-surface-bright bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/60"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm text-on-surface-variant mb-2">
                                        Correo electrónico
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        placeholder="tuempresa@correo.com"
                                        className="w-full rounded-xl border border-surface-bright bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/60"
                                    />
                                </div>
                            </div>

                            <div className="mt-5">
                                <label htmlFor="phone" className="block text-sm text-on-surface-variant mb-2">
                                    Teléfono
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    placeholder="+58 414-1234567"
                                    className="w-full rounded-xl border border-surface-bright bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/60"
                                />
                            </div>

                            <div className="mt-5">
                                <label htmlFor="message" className="block text-sm text-on-surface-variant mb-2">
                                    Mensaje
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={5}
                                    placeholder="Cuéntanos qué tipo de radiador necesitas"
                                    className="w-full rounded-xl border border-surface-bright bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/60"
                                />
                            </div>

                            <button
                                type="submit"
                                className="mt-6 thermal-gradient text-on-primary-container px-6 py-3 font-headline font-black text-sm tracking-tighter uppercase hover:brightness-105 transition-all"
                            >
                                Enviar solicitud
                            </button>

                            {statusMessage && (
                                <p className="mt-4 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">
                                    {statusMessage}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
}
