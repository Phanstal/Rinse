import type { CSSProperties } from 'react';
import type { CleaningItem } from '../../domain/types';
import { cycleColor, remainingCopy, scatterPosition, statusFor } from '../../domain/rinse';
import { Icon } from '../../components/Icon';
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
  onCreate: () => void;
  showCreate: boolean;
}

export function BubbleField({
  items,
  now,
  onOpen,
  onClean,
  onCreate,
  showCreate,
}: BubbleFieldProps) {
  const { pressingId, poppingId, startClean, endPress, handleClick } = useCleanPress(
    onOpen,
    onClean,
  );
  const offset = showCreate ? 1 : 0;

  return (
    <div className="bubble-field" aria-label="Cleaning cycles">
      <div className="bubble-grid">
        {showCreate && (
          <button
            type="button"
            className="button bubble bubble-position-0 bubble-dark create-bubble"
            style={
              {
                '--bubble-color': cycleColor(0, 1),
                '--delay': '0ms',
                '--x': '50%',
                '--y': '50%',
              } as BubbleStyle
            }
            onClick={onCreate}
            aria-label="Create a cleaning bubble"
          >
            <Icon name="plus" />
            <span>
              Tap to create <br />
              your first <br />
              cleaning bubble
            </span>
          </button>
        )}
        {items.map((item, index) => {
          const position = scatterPosition(index + offset);
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
            `bubble-position-${index + offset}`,
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
