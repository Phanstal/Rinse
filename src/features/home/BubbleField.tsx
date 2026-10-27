import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type { CleaningItem } from '../../domain/types';
import { cycleColor, remainingCopy, scatterPosition, statusFor } from '../../domain/rinse';
import { bubbleHaptic, playBubblePop } from '../../platform/feedback';

type BubbleStyle = CSSProperties & {
  '--bubble-color': string;
  '--delay': string;
  '--x': string;
  '--y': string;
};

interface BubbleFieldProps {
  items: CleaningItem[];
  now: Date;
  onOpen: (itemId: string) => void;
  onClean: (itemId: string) => void;
}

export function BubbleField({ items, now, onOpen, onClean }: BubbleFieldProps) {
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

  return (
    <section className="bubble-field" aria-label="Cleaning cycles">
      <div className="bubble-grid">
        {items.map((item, index) => {
          const position = scatterPosition(index);
          const style: BubbleStyle = {
            '--bubble-color': cycleColor(index, items.length),
            '--delay': `${index * 35}ms`,
            '--x': `${position.x}%`,
            '--y': `${position.y}%`,
          };
          const status = statusFor(item, now);
          const classes = [
            'button',
            'bubble',
            `bubble-position-${index}`,
            index === 0 ? 'bubble-dark' : 'bubble-light',
            pressingId === item.id ? 'is-cleaning' : '',
            poppingId === item.id ? 'is-popping' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={item.id}
              type="button"
              className={classes}
              style={style}
              aria-label={`${item.name}, ${status}`}
              onClick={() => handleClick(item)}
              onPointerDown={(event) => startClean(item, event)}
              onPointerUp={endPress}
              onPointerCancel={endPress}
              onContextMenu={(event) => event.preventDefault()}
            >
              <span>{item.name}</span>
              <small>{remainingCopy(item, now)}</small>
            </button>
          );
        })}
      </div>
      <p className="hold-hint">Press and hold a bubble when it’s clean</p>
    </section>
  );
}
