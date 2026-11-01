import type { CSSProperties } from 'react';
import type { CleaningItem } from '../../domain/types';
import { cycleColor, remainingCopy, scatterPosition, statusFor } from '../../domain/rinse';
import { useCleanPress } from './useCleanPress';

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
  const { pressingId, poppingId, startClean, endPress, handleClick } = useCleanPress(
    onOpen,
    onClean,
  );

  return (
    <div className="bubble-field" aria-label="Cleaning cycles">
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
    </div>
  );
}
