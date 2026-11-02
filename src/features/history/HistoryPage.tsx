import type { CleaningHistoryEntry } from '../../domain/types';
import { formatDate } from '../../domain/rinse';
import { Icon } from '../../components/Icon';

interface HistoryPageProps {
  entries: CleaningHistoryEntry[];
  onBack: () => void;
  onUndo: (entry: CleaningHistoryEntry) => void;
}

export function HistoryPage({ entries, onBack, onUndo }: HistoryPageProps) {
  return (
    <section className="history-page">
      <div className="history-header">
        <button
          type="button"
          className="button icon-button history-back"
          onClick={onBack}
          aria-label="Back to home"
        >
          <Icon name="back" />
        </button>
        <div>
          <p className="eyebrow">Activity</p>
          <h1>Cleaning log</h1>
        </div>
      </div>

      {entries.length ? (
        <div className="history-list">
          {entries.map((entry) => (
            <article key={entry.id} className="history-row">
              <div className="history-bubble">
                <Icon name="check" />
              </div>
              <div className="history-copy">
                <strong>{entry.name}</strong>
                <span>Cleaned {formatDate(entry.cleanedDate)}</span>
              </div>
              <button
                type="button"
                className="button undo-button"
                onClick={() => onUndo(entry)}
                aria-label={`Undo cleaning ${entry.name}`}
              >
                <Icon name="undo" />
                Undo
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="history-empty">
          <div className="history-empty-mark">
            <Icon name="history" />
          </div>
          <h2>No cleaning history yet.</h2>
          <p>Completed cycles will appear here, ready to undo if needed.</p>
        </div>
      )}
    </section>
  );
}
