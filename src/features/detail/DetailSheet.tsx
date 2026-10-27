import type { CleaningItem } from '../../domain/types';
import { dueCopy, formatDate, intervalCopy, statusFor } from '../../domain/rinse';
import { Sheet } from '../../components/Sheet';
import { Icon } from '../../components/Icon';

interface DetailSheetProps {
  item: CleaningItem;
  now: Date;
  onClose: () => void;
  onClean: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function statusClass(status: string): string {
  return `status-${status.toLowerCase().replaceAll(' ', '-')}`;
}

export function DetailSheet({ item, now, onClose, onClean, onEdit, onDelete }: DetailSheetProps) {
  const status = statusFor(item, now);
  return (
    <Sheet label={`${item.name} details`} onClose={onClose} autoFocusClose>
      <div className="detail-heading">
        <p className="eyebrow">Cleaning item</p>
        <h2>{item.name}</h2>
        <span className={`status-pill ${statusClass(status)}`}>{status}</span>
      </div>
      <div className="detail-grid">
        <div>
          <span>Next cycle</span>
          <strong>{dueCopy(item, now)}</strong>
        </div>
        <div>
          <span>Last cleaned</span>
          <strong>{formatDate(item.lastCleaned)}</strong>
        </div>
        <div>
          <span>Repeats</span>
          <strong>Every {intervalCopy(item.interval)}</strong>
        </div>
      </div>
      <button type="button" className="button primary-button clean-button" onClick={onClean}>
        <Icon name="check" />
        Mark as cleaned
      </button>
      <div className="secondary-actions">
        <button type="button" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="delete-button" onClick={onDelete}>
          Delete
        </button>
      </div>
    </Sheet>
  );
}
