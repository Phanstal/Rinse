import type { CSSProperties } from 'react';
import type { CleaningItem, HomeMode } from '../../domain/types';
import {
  cycleColor,
  intervalCopy,
  remainingCopy,
  sortItems,
  statusFor,
  summaryCopy,
  visibleItems,
} from '../../domain/rinse';
import { BubbleField } from './BubbleField';
import { GridView } from './GridView';
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

const VIEWS: { mode: HomeMode; label: string; ariaLabel: string }[] = [
  { mode: 'bubbles', label: 'Bubbles', ariaLabel: 'Bubble view' },
  { mode: 'grid', label: 'Grid', ariaLabel: 'Grid view' },
  { mode: 'list', label: 'List', ariaLabel: 'List view' },
];

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
      ) : (
        <>
          <section className="home-card" aria-label="Your cleaning cycles">
            <div className="card-view-switch" role="tablist" aria-label="Home view">
              {VIEWS.map((view) => (
                <button
                  key={view.mode}
                  type="button"
                  className={mode === view.mode ? 'active' : ''}
                  role="tab"
                  aria-selected={mode === view.mode}
                  aria-label={view.ariaLabel}
                  onClick={() => onModeChange(view.mode)}
                >
                  {view.label}
                </button>
              ))}
            </div>

            {mode === 'bubbles' && (
              <BubbleField items={bubbles} now={now} onOpen={onOpenItem} onClean={onCleanItem} />
            )}

            {mode === 'grid' && (
              <GridView items={ranked} now={now} onOpen={onOpenItem} onClean={onCleanItem} />
            )}

            {mode === 'list' && (
              <div className="home-list" aria-label="All cleaning items">
                <div className="history-list all-items-list">
                  {ranked.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      className="history-row history-item-button"
                      aria-label={`${item.name}, ${statusFor(item, now)}`}
                      onClick={() => onOpenItem(item.id)}
                    >
                      <div
                        className="history-cycle-dot"
                        style={
                          {
                            '--bubble-color': cycleColor(index, ranked.length),
                          } as CSSProperties
                        }
                      />
                      <div className="history-copy">
                        <strong>{item.name}</strong>
                        <span>Every {intervalCopy(item.interval)}</span>
                      </div>
                      <span className="list-days">{remainingCopy(item, now)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="hold-hint">Press and hold a bubble when it’s clean</p>
          </section>

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
