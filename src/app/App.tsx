import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import type { AppView, CleaningItem, HomeMode, ItemDraft } from '../domain/types';
import { useRinse } from '../features/useRinse';
import { HomeView } from '../features/home/HomeView';
import { DetailSheet } from '../features/detail/DetailSheet';
import { ItemEditor } from '../features/editor/ItemEditor';
import { HistoryPage } from '../features/history/HistoryPage';

export function App() {
  const store = useRinse();
  const [view, setView] = useState<AppView>('home');
  const [homeMode, setHomeMode] = useState<HomeMode>('bubbles');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<'new' | string | null>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | null>(null);
  const navigation = useRef({ view, selectedId, editing });

  useEffect(() => {
    navigation.current = { view, selectedId, editing };
  }, [view, selectedId, editing]);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToast('');
      toastTimer.current = null;
    }, 2200);
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let cancelled = false;
    let remove: (() => Promise<void>) | undefined;
    void CapacitorApp.addListener('backButton', () => {
      const current = navigation.current;
      if (current.editing) {
        setEditing(null);
        return;
      }
      if (current.selectedId) {
        setSelectedId(null);
        return;
      }
      if (current.view === 'history') {
        setView('home');
        return;
      }
      void CapacitorApp.exitApp();
    }).then((listener) => {
      if (cancelled) void listener.remove();
      else remove = () => listener.remove();
    });
    return () => {
      cancelled = true;
      void remove?.();
    };
  }, []);

  const currentItem = selectedId
    ? store.data.items.find((item) => item.id === selectedId)
    : undefined;
  const editingItem =
    editing && editing !== 'new' ? store.data.items.find((item) => item.id === editing) : undefined;

  function openItem(itemId: string) {
    setSelectedId(itemId);
  }

  function openAdd() {
    setSelectedId(null);
    setEditing('new');
  }

  function openEdit(item: CleaningItem) {
    setSelectedId(null);
    setEditing(item.id);
  }

  function cleanItem(itemId: string) {
    store.clean(itemId);
    setSelectedId(null);
    showToast('Cycle reset');
  }

  function saveItem(draft: ItemDraft) {
    if (editing === 'new') {
      store.add(draft);
      showToast('Item added');
    } else if (editing) {
      store.edit(editing, draft);
      showToast('Changes saved');
    }
    setEditing(null);
    setSelectedId(null);
  }

  function deleteItem() {
    if (!currentItem) return;
    store.remove(currentItem.id);
    setSelectedId(null);
    showToast('Item removed');
  }

  function undoCleaning(historyId: string) {
    store.undo(historyId);
    showToast('Cleaning undone');
  }

  function openHistory() {
    setSelectedId(null);
    setEditing(null);
    setView('history');
  }

  if (!store.ready) {
    return (
      <div className="app-shell boot-shell">
        <div className="boot-screen">
          <span className="boot-mark">r</span>
          <p className="wordmark">rinse</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      {view === 'history' ? (
        <HistoryPage
          entries={store.data.history}
          onBack={() => setView('home')}
          onUndo={(entry) => undoCleaning(entry.id)}
        />
      ) : (
        <HomeView
          items={store.data.items}
          now={new Date()}
          mode={homeMode}
          onModeChange={setHomeMode}
          onOpenItem={openItem}
          onCleanItem={cleanItem}
          onOpenHistory={openHistory}
          onAdd={openAdd}
        />
      )}

      {currentItem && (
        <DetailSheet
          item={currentItem}
          now={new Date()}
          onClose={() => setSelectedId(null)}
          onClean={() => cleanItem(currentItem.id)}
          onEdit={() => openEdit(currentItem)}
          onDelete={deleteItem}
        />
      )}

      {editing && (
        <ItemEditor
          key={editing}
          item={editing === 'new' ? undefined : editingItem}
          onClose={() => setEditing(null)}
          onSave={saveItem}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      {store.error && (
        <p className="storage-error" role="alert">
          {store.error}
        </p>
      )}
    </div>
  );
}
