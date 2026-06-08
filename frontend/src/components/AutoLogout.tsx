"use client";

import { useEffect, useRef, useCallback } from "react";
import Swal from "../lib/swal";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "next/navigation";

interface Props {
  inactivityMs?: number;
  confirmTimeoutMs?: number;
}

export default function AutoLogout({ inactivityMs = 30000, confirmTimeoutMs = 15000 }: Props) {
  const logout = useAuthStore((s) => s.setLogout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  const inactivityTimer = useRef<number | null>(null);
  const confirmTimer = useRef<number | null>(null);

  const clearRef = (r: React.MutableRefObject<number | null>) => {
    if (r.current) {
      window.clearTimeout(r.current);
      r.current = null;
    }
  };

  const doLogout = useCallback(() => {
    logout();
    router.push("/auth");
  }, [logout, router]);

  const onInactivity = useCallback(() => {
    Swal.fire({
      title: "¿Sigues ahí?",
      html: `Por seguridad, tu sesión se cerrará automáticamente si no respondes.`,
      showCancelButton: true,
      confirmButtonText: "Sí, sigo aquí",
      cancelButtonText: "Cerrar sesión",
      allowOutsideClick: false,
      allowEscapeKey: false,
      buttonsStyling: false,
      didOpen: () => {
        // start auto-logout timer while modal is open
        confirmTimer.current = window.setTimeout(() => {
          Swal.close();
          doLogout();
        }, confirmTimeoutMs);
      },
    }).then((result) => {
      // clear confirm timer
      clearRef(confirmTimer);
      if (result.isConfirmed) {
        // user still active -> restart inactivity timer
        startInactivityTimer();
      } else {
        // user cancelled -> logout
        doLogout();
      }
    });
  }, [confirmTimeoutMs, doLogout]);

  const startInactivityTimer = useCallback(() => {
    clearRef(inactivityTimer);
    inactivityTimer.current = window.setTimeout(() => {
      onInactivity();
    }, inactivityMs);
  }, [inactivityMs, onInactivity]);

  const resetTimer = useCallback(() => {
    startInactivityTimer();
  }, [startInactivityTimer]);

  useEffect(() => {
    // Solo controlamos la inactividad cuando hay una sesión iniciada.
    if (!isAuthenticated) return;

    const events = ["mousemove", "keydown", "click", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, resetTimer));
    startInactivityTimer();

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
      clearRef(inactivityTimer);
      clearRef(confirmTimer);
      // Cerramos el modal "¿Sigues ahí?" si quedó abierto al cerrar sesión.
      Swal.close();
    };
  }, [isAuthenticated, resetTimer, startInactivityTimer]);

  return null;
}
