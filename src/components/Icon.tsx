import type { ReactNode } from 'react';

export type IconName =
  | 'plus'
  | 'close'
  | 'history'
  | 'settings'
  | 'check'
  | 'back'
  | 'undo'
  | 'bubbles'
  | 'list'
  | 'archive'
  | 'download'
  | 'upload';

const paths: Record<IconName, ReactNode> = {
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  history: (
    <>
      <path d="M4.9 7.5A8 8 0 1 1 4 12" />
      <path d="M4 5v3h3M12 8v4l2.5 1.5" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.42 1.42-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2v-.48A1.7 1.7 0 0 0 12.38 18a1.7 1.7 0 0 0-1.88.34l-.06.06-1.42-1.42.06-.06A1.7 1.7 0 0 0 9.42 15a1.7 1.7 0 0 0-1.56-1.03H7.4v-2h.46A1.7 1.7 0 0 0 9.42 11a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.42-1.42.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 13.41 6.5V6h2v.5A1.7 1.7 0 0 0 16.44 8a1.7 1.7 0 0 0 1.88-.34l.06-.06 1.42 1.42-.06.06A1.7 1.7 0 0 0 19.4 11a1.7 1.7 0 0 0 1.56 1.03h.44v2h-.44A1.7 1.7 0 0 0 19.4 15Z" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  back: <path d="m15 18-6-6 6-6" />,
  undo: (
    <>
      <path d="m9 7-4 4 4 4" />
      <path d="M5 11h8a5 5 0 0 1 5 5" />
    </>
  ),
  bubbles: (
    <>
      <circle cx="9" cy="9" r="3.5" />
      <circle cx="16.5" cy="7" r="2" />
      <circle cx="15.5" cy="15.5" r="3" />
    </>
  ),
  list: (
    <>
      <path d="M9 7h10M9 12h10M9 17h10" />
      <circle cx="5" cy="7" r="0.8" />
      <circle cx="5" cy="12" r="0.8" />
      <circle cx="5" cy="17" r="0.8" />
    </>
  ),
  archive: (
    <>
      <path d="M4 8h16v12H4z" />
      <path d="M3 4h18v4H3zM9 12h6" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11m0 0 4-4m-4 4-4-4" />
      <path d="M5 19h14" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V5m0 0 4 4m-4-4-4 4" />
      <path d="M5 19h14" />
    </>
  ),
};

export function Icon({ name }: { name: IconName }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}
