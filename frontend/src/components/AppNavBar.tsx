'use client';

import { usePathname } from 'next/navigation';
import { NavBar } from './NavBar';

export const AppNavBar = () => {
    const pathname = usePathname();

    if (pathname?.startsWith('/auth') || pathname?.startsWith('/dashboard')) {
        return null;
    }

    return <NavBar />;
};
