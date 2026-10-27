import type { CSSProperties } from 'react';
import type { CleaningItem, HomeMode } from '../../domain/types';
import {
  cycleColor,
  dueCopy,
  intervalCopy,
  sortItems,
  statusFor,
  summaryCopy,
  visibleItems,
} from '../../domain/rinse';
import { BubbleField } from './BubbleField';
import { Icon } from '../../components/Icon';

interface HomeViewProps {
  items: CleaningItem[];
  now: Date;
  mode: HomeMode;
  onModeChange: (mode: HomeMode) => void;
  onOpenItem: (itemId: string) => void;
  onCleanItem: (itemId: string) => void;
  onOpenHistory: () => void;
  onAdd: () => void;
}

function statusClass(status: string): string {
  return `status-${status.toLowerCase().replaceAll(' ', '-')}`;
}

export function HomeView({
  items,
  now,
  mode,
  onModeChange,
  onOpenItem,
  onCleanItem,
  onOpenHistory,
  onAdd,
}: HomeViewProps) {
  const ranked = sortItems(items, now);
  const bubbles = visibleItems(items, now);

  return (
    <>
      <header className="header">
        <div>
          <p className="wordmark">rinse</p>
          <h1>Your home, at a glance.</h1>
          <p className="summary">{summaryCopy(items, now)}</p>
        </div>
        <button
          type="button"
          className="button icon-button subtle-button"
          onClick={onOpenHistory}
          aria-label="Cleaning history"
        >
          <Icon name="history" />
        </button>
      </header>

      {items.length === 0 ? (
        <section className="empty-state">
          <div className="empty-bubbles">
            <i />
            <i />
          </div>
          <h2>Start with one small thing.</h2>
          <p>Add a space or item you want to keep clean.</p>
          <button type="button" className="button primary-button" onClick={onAdd}>
            Add your first item
          </button>
        </section>
      ) : mode === 'bubbles' ? (
        <BubbleField items={bubbles} now={now} onOpen={onOpenItem} onClean={onCleanItem} />
      ) : (
        <section className="home-list" aria-label="All cleaning items">
          <div className="history-list all-items-list">
            {ranked.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className="history-row history-item-button"
                onClick={() => onOpenItem(item.id)}
              >
                <div
                  className="history-cycle-dot"
                  style={{ '--bubble-color': cycleColor(index, ranked.length) } as CSSProperties}
                />
                <div className="history-copy">
                  <strong>{item.name}</strong>
                  <span>
                    {dueCopy(item, now)} · Every {intervalCopy(item.interval)}
                  </span>
                </div>
                <span className={`list-status ${statusClass(statusFor(item, now))}`}>
                  {statusFor(item, now)}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {items.length > 0 && (
        <>
          <div className="mode-banner" role="tablist" aria-label="Home view">
            <button
              type="button"
              className={mode === 'bubbles' ? 'active' : ''}
              role="tab"
              aria-selected={mode === 'bubbles'}
              aria-label="Bubble view"
              title="Bubble view"
              onClick={() => onModeChange('bubbles')}
            >
              <Icon name="bubbles" />
            </button>
            <button
              type="button"
              className={mode === 'list' ? 'active' : ''}
              role="tab"
              aria-selected={mode === 'list'}
              aria-label="List view"
              title="List view"
              onClick={() => onModeChange('list')}
            >
              <Icon name="list" />
            </button>
          </div>
          <button
            type="button"
            className="button add-button"
            aria-label="Add cleaning item"
            onClick={onAdd}
          >
            <Icon name="plus" />
          </button>
        </>
      )}
    </>
  );
}
