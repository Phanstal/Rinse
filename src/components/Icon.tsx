import type { ReactNode } from 'react';

export type IconName =
  'plus' | 'close' | 'history' | 'check' | 'back' | 'undo' | 'bubbles' | 'list';

const paths: Record<IconName, ReactNode> = {
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  history: (
    <>
      <path d="M4.9 7.5A8 8 0 1 1 4 12" />
      <path d="M4 5v3h3M12 8v4l2.5 1.5" />
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
};

export function Icon({ name }: { name: IconName }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}
