import { useState, type FormEvent } from 'react';
import type { CleaningItem, ItemDraft } from '../../domain/types';
import { intervalCopy, toDateKey, validateDraft } from '../../domain/rinse';
import { Sheet } from '../../components/Sheet';

const PRESETS = [1, 7, 30, 60];

interface ItemEditorProps {
  item?: CleaningItem;
  onClose: () => void;
  onSave: (draft: ItemDraft) => void;
}

function blankDraft(): ItemDraft {
  return { name: '', interval: 1, lastCleaned: toDateKey() };
}

export function ItemEditor({ item, onClose, onSave }: ItemEditorProps) {
  const [form, setForm] = useState<ItemDraft>(
    item
      ? { name: item.name, interval: item.interval, lastCleaned: item.lastCleaned }
      : blankDraft(),
  );
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = validateDraft(form);
    if (message) {
      setError(message);
      return;
    }
    onSave({ ...form, name: form.name.trim() });
  }

  return (
    <Sheet label={item ? 'Edit item' : 'Add item'} onClose={onClose}>
      <form className="editor" onSubmit={submit}>
        <p className="eyebrow">{item ? 'Edit cycle' : 'New cycle'}</p>
        <h2>{item ? 'Keep it current.' : 'What would you like to care for?'}</h2>
        <label>
          <span>Item name</span>
          <input
            type="text"
            required
            autoFocus
            maxLength={80}
            placeholder="e.g. Kitchen counter"
            value={form.name}
            onChange={(event) => {
              setForm({ ...form, name: event.target.value });
              setError(null);
            }}
          />
        </label>
        <label>
          <span>Cleaning interval</span>
          <div className="interval-input">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={365}
              required
              value={form.interval}
              onChange={(event) => {
                setForm({ ...form, interval: Number(event.target.value) });
                setError(null);
              }}
            />
            <b>days</b>
          </div>
          <div className="interval-presets">
            {PRESETS.map((days) => (
              <button
                key={days}
                type="button"
                className={form.interval === days ? 'active' : ''}
                onClick={() => {
                  setForm({ ...form, interval: days });
                  setError(null);
                }}
              >
                {intervalCopy(days)}
              </button>
            ))}
          </div>
        </label>
        <label>
          <span>Last cleaned</span>
          <input
            type="date"
            value={form.lastCleaned}
            max={toDateKey()}
            onChange={(event) => {
              setForm({ ...form, lastCleaned: event.target.value });
              setError(null);
            }}
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button primary-button">
          Save item
        </button>
      </form>
    </Sheet>
  );
}
