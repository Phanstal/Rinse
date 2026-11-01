import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { CleaningItem } from '../../domain/types';
import { bubbleHaptic, playBubblePop } from '../../platform/feedback';

/**
 * Shared long-press-to-clean and tap-to-open behaviour for the bubble and
 * grid views. A quick tap still opens the detail sheet; holding for 650 ms
 * resets the cycle without opening anything.
 */
export function useCleanPress(onOpen: (itemId: string) => void, onClean: (itemId: string) => void) {
  const [pressingId, setPressingId] = useState<string | null>(null);
  const [poppingId, setPoppingId] = useState<string | null>(null);
  const pressTimer = useRef<number | null>(null);
  const popTimer = useRef<number | null>(null);
  const suppressClick = useRef<string | null>(null);

  const clearPressTimer = () => {
    if (pressTimer.current !== null) window.clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  useEffect(
    () => () => {
      clearPressTimer();
      if (popTimer.current !== null) window.clearTimeout(popTimer.current);
    },
    [],
  );

  function startClean(item: CleaningItem, event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    clearPressTimer();
    setPressingId(item.id);
    pressTimer.current = window.setTimeout(() => {
      suppressClick.current = item.id;
      playBubblePop();
      void bubbleHaptic();
      onClean(item.id);
      setPressingId(null);
      pressTimer.current = null;
    }, 650);
  }

  function endPress() {
    clearPressTimer();
    setPressingId(null);
  }

  function handleClick(item: CleaningItem) {
    if (suppressClick.current === item.id) {
      suppressClick.current = null;
      return;
    }
    playBubblePop();
    void bubbleHaptic();
    setPoppingId(item.id);
    if (popTimer.current !== null) window.clearTimeout(popTimer.current);
    popTimer.current = window.setTimeout(() => {
      setPoppingId(null);
      popTimer.current = null;
      onOpen(item.id);
    }, 190);
  }

  return { pressingId, poppingId, startClean, endPress, handleClick };
}
