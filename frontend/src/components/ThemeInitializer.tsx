'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'ra-theme';

type Theme = 'dark' | 'light';

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    if (theme === 'light') {
        root.classList.add('theme-light');
        root.style.colorScheme = 'light';
        return;
    }

    root.classList.remove('theme-light');
    root.style.colorScheme = 'dark';
}

export function ThemeInitializer() {
    useEffect(() => {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        const theme: Theme = stored === 'light' ? 'light' : 'dark';
        applyTheme(theme);
    }, []);

    return null;
}
