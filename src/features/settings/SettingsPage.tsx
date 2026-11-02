import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/Icon';

interface SettingsPageProps {
  notifications: boolean;
  onNotificationsChange: (enabled: boolean) => void;
  onBack: () => void;
  onDeleteData: () => void;
  onOpenData: () => void;
}

export function SettingsPage({
  notifications,
  onNotificationsChange,
  onBack,
  onDeleteData,
  onOpenData,
}: SettingsPageProps) {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);
  const deleteTimer = useRef<number | null>(null);

  function cancelDelete() {
    if (deleteTimer.current !== null) window.clearTimeout(deleteTimer.current);
    deleteTimer.current = null;
  }

  useEffect(() => cancelDelete, []);

  function startDelete() {
    cancelDelete();
    deleteTimer.current = window.setTimeout(() => {
      deleteTimer.current = null;
      onDeleteData();
    }, 1200);
  }

  return (
    <section className="settings-page">
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
          <p className="eyebrow">Rinse</p>
          <h1>Settings</h1>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-row">
          <div>
            <strong>Notifications</strong>
            <span>Cleaning cycle reminders</span>
          </div>
          <button
            type="button"
            className={`button switch ${notifications ? 'active' : ''}`}
            role="switch"
            aria-checked={notifications}
            aria-label="Toggle notifications"
            onClick={() => onNotificationsChange(!notifications)}
          >
            <i />
          </button>
        </div>

        <button
          type="button"
          className="button settings-row settings-disclosure"
          onClick={() => setPrivacyOpen(!privacyOpen)}
        >
          <div>
            <strong>Privacy</strong>
            <span>How Rinse handles your data</span>
          </div>
          <b>{privacyOpen ? '−' : '+'}</b>
        </button>
        {privacyOpen && (
          <div className="privacy-copy">
            Rinse stores cleaning items, preferences, and history locally on this device. No account
            is required, and this app does not send your cleaning data to a server.
          </div>
        )}

        <button
          type="button"
          className="button settings-row settings-disclosure"
          onClick={onOpenData}
        >
          <div>
            <strong>Backup &amp; restore</strong>
            <span>Save or move this device’s data</span>
          </div>
          <b>›</b>
        </button>
      </div>

      <div className="danger-zone">
        <p className="eyebrow">Data</p>
        {deleteStep === 0 ? (
          <button
            type="button"
            className="button delete-data-button"
            onClick={() => setDeleteStep(1)}
          >
            Delete cleaning data
          </button>
        ) : (
          <div className="delete-confirm">
            <p>This removes every item and cleaning log entry. This cannot be undone.</p>
            <button
              type="button"
              className="button hold-delete-button"
              onPointerDown={startDelete}
              onPointerUp={cancelDelete}
              onPointerCancel={cancelDelete}
              onPointerLeave={cancelDelete}
              onContextMenu={(event) => event.preventDefault()}
            >
              Hold to permanently delete
            </button>
            <button
              type="button"
              className="button cancel-delete-button"
              onClick={() => {
                cancelDelete();
                setDeleteStep(0);
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
