const clients = [
    {
        empresa: 'Frigorífico Patagónico',
        contacto: 'Laura Méndez',
        email: 'laura.mendez@fripatag.com',
        estado: 'Activo',
        ultimaGestion: '10/04/2026',
        tone: 'text-primary',
    },
    {
        empresa: 'Constructora Alerce',
        contacto: 'Carlos Ruiz',
        email: 'c.ruiz@alerce.cl',
        estado: 'Seguimiento',
        ultimaGestion: '08/04/2026',
        tone: 'text-amber-300',
    },
    {
        empresa: 'Térmicos del Sur',
        contacto: 'Marta Salinas',
        email: 'marta@termicosdelsur.com',
        estado: 'Inactivo',
        ultimaGestion: '28/03/2026',
        tone: 'text-red-300',
    },
    {
        empresa: 'Logística Boreal',
        contacto: 'Andrés Vidal',
        email: 'andres.vidal@boreal.cl',
        estado: 'Activo',
        ultimaGestion: '11/04/2026',
        tone: 'text-primary',
    },
];

export const ClientsBoard = () => {
    return (
        <section className="space-y-8">
            <header className="border border-outline-variant bg-surface-container-low p-6 md:p-8">
                <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3">Gestión Comercial</p>
                <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter uppercase">Clientes</h1>
                <p className="text-on-surface-variant mt-4 max-w-2xl">
                    Registro mock de clientes para seguimiento de relación, estado y última gestión.
                </p>
            </header>

            <section className="border border-outline-variant bg-surface-container-low overflow-hidden">
                <div className="px-5 md:px-6 py-4 border-b border-outline-variant">
                    <h2 className="font-headline text-2xl font-black tracking-tighter uppercase">Registro de Clientes</h2>
                </div>

                {clients.length === 0 ? (
                    <div className="px-5 md:px-6 py-8 text-sm text-on-surface-variant">
                        Aún no hay clientes registrados en esta vista.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[620px]">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-widest text-on-surface-variant">
                                    <th className="px-5 md:px-6 py-4">Empresa</th>
                                    <th className="px-5 md:px-6 py-4">Contacto</th>
                                    <th className="px-5 md:px-6 py-4">Correo</th>
                                    <th className="px-5 md:px-6 py-4">Estado</th>
                                    <th className="px-5 md:px-6 py-4">Última Gestión</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) => (
                                    <tr key={client.empresa} className="border-t border-outline-variant/60">
                                        <td className="px-5 md:px-6 py-4 text-on-surface">{client.empresa}</td>
                                        <td className="px-5 md:px-6 py-4 text-on-surface-variant">{client.contacto}</td>
                                        <td className="px-5 md:px-6 py-4 text-on-surface-variant">{client.email}</td>
                                        <td className={`px-5 md:px-6 py-4 font-semibold ${client.tone}`}>{client.estado}</td>
                                        <td className="px-5 md:px-6 py-4 text-on-surface-variant">{client.ultimaGestion}</td>
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
