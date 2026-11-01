import type { CSSProperties } from 'react';
import type { CleaningItem } from '../../domain/types';
import { cycleColor, remainingCopy, statusFor } from '../../domain/rinse';
import { useCleanPress } from './useCleanPress';

interface GridViewProps {
  items: CleaningItem[];
  now: Date;
  onOpen: (itemId: string) => void;
  onClean: (itemId: string) => void;
}

export function GridView({ items, now, onOpen, onClean }: GridViewProps) {
  const { pressingId, poppingId, startClean, endPress, handleClick } = useCleanPress(
    onOpen,
    onClean,
  );

  return (
    <div className="ordered-grid" aria-label="Cleaning grid">
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          className={[
            'button',
            'grid-item',
            index < 2 ? 'grid-dark' : '',
            pressingId === item.id ? 'is-cleaning' : '',
            poppingId === item.id ? 'is-popping' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={
            {
              '--bubble-color': cycleColor(index, items.length),
            } as CSSProperties
          }
          aria-label={`${item.name}, ${statusFor(item, now)}`}
          onClick={() => handleClick(item)}
          onPointerDown={(event) => startClean(item, event)}
          onPointerUp={endPress}
          onPointerCancel={endPress}
          onContextMenu={(event) => event.preventDefault()}
        >
          <strong>{item.name}</strong>
          <small>{remainingCopy(item, now)}</small>
        </button>
      ))}
    </div>
  );
}
