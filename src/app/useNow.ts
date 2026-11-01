import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';

function nextMidnightDelay(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}

/**
 * Keeps relative due copy honest while the app stays open. The value refreshes
 * at local midnight and whenever the app comes back to the foreground.
 */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let midnightTimer: number | null = null;
    let cancelled = false;
    let removeAppListener: (() => Promise<void>) | undefined;

    const scheduleMidnight = () => {
      if (midnightTimer !== null) window.clearTimeout(midnightTimer);
      midnightTimer = window.setTimeout(
        () => {
          setNow(new Date());
          scheduleMidnight();
        },
        Math.max(1000, nextMidnightDelay(new Date()) + 100),
      );
    };

    const refresh = () => {
      setNow(new Date());
      scheduleMidnight();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    const onFocus = () => refresh();

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);
    scheduleMidnight();

    if (Capacitor.isNativePlatform()) {
      void CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) refresh();
      }).then((listener) => {
        if (cancelled) void listener.remove();
        else removeAppListener = () => listener.remove();
      });
    }

    return () => {
      cancelled = true;
      if (midnightTimer !== null) window.clearTimeout(midnightTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
      void removeAppListener?.();
    };
  }, []);

  return now;
}
