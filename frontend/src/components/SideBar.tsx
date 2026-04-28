'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const SideBar = () => {
	const pathname = usePathname();

	const links = [
		{ href: '/dashboard', label: 'Métricas' },
		{ href: '/dashboard/inventario', label: 'Inventario' },
		{ href: '/dashboard/clientes', label: 'Clientes' },
	];

	const isActiveLink = (href: string) => {
		if (href === '/dashboard') {
			return pathname === href;
		}

		return pathname === href || pathname?.startsWith(`${href}/`);
	};

	return (
		<>
			<div className="md:hidden border border-outline-variant bg-surface-container-low p-3 mb-6">
				<p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-3">Navegación</p>
				<div className="space-y-2">
					{links.map((link) => {
						const isActive = isActiveLink(link.href);

						return (
							<Link
								key={link.href}
								href={link.href}
								className={`flex items-center justify-between px-4 py-3 uppercase tracking-wider font-headline font-bold border transition-colors ${isActive
									? 'border-primary bg-primary-container/20 text-primary'
									: 'border-outline-variant text-on-surface hover:border-primary/70 hover:text-primary'
									}`}
							>
								{link.label}
								<span aria-hidden>→</span>
							</Link>
						);
					})}
				</div>
			</div>

			<aside className="hidden md:flex md:flex-col md:sticky md:top-24 md:h-[calc(100vh-6rem)] border-r border-outline-variant bg-surface-container-low p-6">
				<div className="mb-8">
					<p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">Dashboard</p>
					<h2 className="font-headline text-2xl font-black tracking-tighter uppercase mt-2">Radiadores Amazona</h2>
				</div>

				<nav className="space-y-3">
					{links.map((link) => {
						const isActive = isActiveLink(link.href);

						return (
							<Link
								key={link.href}
								href={link.href}
								className={`w-full block px-4 py-3 uppercase tracking-wider font-headline font-bold border transition-colors ${isActive
									? 'border-primary bg-primary-container/20 text-primary'
									: 'border-outline-variant text-on-surface hover:border-primary/70 hover:text-primary'
									}`}
							>
								{link.label}
							</Link>
						);
					})}
				</nav>
			</aside>
		</>
	);
};

