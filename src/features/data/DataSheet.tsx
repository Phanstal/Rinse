import { useState } from 'react';
import type { RinseData } from '../../domain/types';
import { createBackup, parseBackup } from '../../domain/backup';
import { toDateKey } from '../../domain/rinse';
import { Sheet } from '../../components/Sheet';
import { Icon } from '../../components/Icon';

interface DataSheetProps {
  data: RinseData;
  onClose: () => void;
  onRestore: (data: RinseData) => void;
}

type ExportState = 'idle' | 'copied' | 'downloaded' | 'failed';

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy path when clipboard permission is unavailable.
  }

  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    // Keep the failure state below when the legacy clipboard is unavailable.
  }
  area.remove();
  return copied;
}

export function DataSheet({ data, onClose, onRestore }: DataSheetProps) {
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [restoring, setRestoring] = useState(false);
  const [backupText, setBackupText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pendingRestore, setPendingRestore] = useState<RinseData | null>(null);

  const backup = createBackup(data);

  async function copyBackup() {
    const copied = await writeClipboard(backup);
    setExportState(copied ? 'copied' : 'failed');
  }

  function downloadBackup() {
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rinse-backup-${toDateKey()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExportState('downloaded');
  }

  function beginRestore() {
    setRestoring(true);
    setError(null);
    setPendingRestore(null);
  }

  function checkBackup() {
    const result = parseBackup(backupText);
    if (!result.ok) {
      setError(result.error);
      setPendingRestore(null);
      return;
    }
    setError(null);
    setPendingRestore(result.data);
  }

  function confirmRestore() {
    if (!pendingRestore) return;
    onRestore(pendingRestore);
  }

  return (
    <Sheet label="Backup and restore" onClose={onClose}>
      <div className="data-sheet">
        <p className="eyebrow">Your data</p>
        <h2>Keep a copy.</h2>
        <p className="data-intro">
          Rinse stores everything on this device. Save a backup before changing phones or clearing
          app data.
        </p>

        <div className="backup-stats" aria-label="Backup contents">
          <div>
            <strong>{data.items.length}</strong>
            <span>{data.items.length === 1 ? 'item' : 'items'}</span>
          </div>
          <div>
            <strong>{data.history.length}</strong>
            <span>{data.history.length === 1 ? 'log entry' : 'log entries'}</span>
          </div>
        </div>

        <div className="backup-actions">
          <button type="button" className="button primary-button" onClick={copyBackup}>
            <Icon name="archive" />
            {exportState === 'copied'
              ? 'Backup copied'
              : exportState === 'failed'
                ? 'Copy failed — try download'
                : 'Copy backup'}
          </button>
          <button type="button" className="button secondary-button" onClick={downloadBackup}>
            <Icon name="download" />
            {exportState === 'downloaded' ? 'Backup downloaded' : 'Download .json'}
          </button>
        </div>

        {!restoring ? (
          <button type="button" className="button data-restore-link" onClick={beginRestore}>
            <Icon name="upload" />
            Restore from a backup
          </button>
        ) : (
          <div className="restore-panel">
            <label>
              <span>Paste backup JSON</span>
              <textarea
                rows={5}
                spellCheck={false}
                placeholder="Paste the contents of a Rinse backup here"
                value={backupText}
                onChange={(event) => {
                  setBackupText(event.target.value);
                  setError(null);
                  setPendingRestore(null);
                }}
              />
            </label>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            {pendingRestore ? (
              <div className="restore-preview" role="status">
                <strong>Ready to restore</strong>
                <p>
                  {pendingRestore.items.length}{' '}
                  {pendingRestore.items.length === 1 ? 'item' : 'items'} and{' '}
                  {pendingRestore.history.length}{' '}
                  {pendingRestore.history.length === 1 ? 'log entry' : 'log entries'}. This replaces
                  the data currently on this device.
                </p>
                <div className="restore-confirm">
                  <button type="button" className="button primary-button" onClick={confirmRestore}>
                    Replace my data
                  </button>
                  <button
                    type="button"
                    className="button data-restore-link"
                    onClick={() => setPendingRestore(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className="button secondary-button" onClick={checkBackup}>
                Check backup
              </button>
            )}
          </div>
        )}

        <p className="data-note">
          The backup includes item names, intervals and cleaning history. It stays on your device
          unless you choose to share it.
        </p>
      </div>
    </Sheet>
  );
}
