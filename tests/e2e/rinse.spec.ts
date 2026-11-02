import { expect, test } from '@playwright/test';

async function openHome(page: import('@playwright/test').Page) {
  await page.goto('/');
  await expect(page.locator('.bubble')).toHaveCount(8);
}

async function openSettings(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
}

async function openBackup(page: import('@playwright/test').Page) {
  await openSettings(page);
  await page.getByRole('button', { name: /Backup & restore/ }).click();
  await expect(page.getByRole('dialog', { name: 'Backup and restore' })).toBeVisible();
}

async function openList(page: import('@playwright/test').Page) {
  await page.getByRole('tab', { name: 'List view' }).click();
  await expect(page.locator('.home-list .history-item-button').first()).toBeVisible();
}

test('shows the seeded home with bubbles and controls', async ({ page }) => {
  await openHome(page);
  await expect(page.locator('.wordmark')).toHaveText('rinse');
  await expect(page.locator('.bubble')).toHaveCount(8);
  await expect(page.getByText('Press and hold a bubble when it’s clean')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Bubble view' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Add cleaning item' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cleaning history' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
});

test('switches between the bubble and full list views', async ({ page }) => {
  await openHome(page);
  await openList(page);
  await expect(page.locator('.home-list .history-item-button')).toHaveCount(8);
  const kitchenRow = page.locator('.home-list .history-item-button').filter({
    hasText: 'Kitchen counter',
  });
  await expect(kitchenRow.getByText('Every 3 days')).toBeVisible();
  await expect(kitchenRow.locator('.list-days')).toHaveText('2d overdue');
  await expect(
    page
      .locator('.home-list .history-item-button')
      .filter({ hasText: 'Fridge' })
      .locator('.list-days'),
  ).toHaveText('29 days left');

  await page.getByRole('tab', { name: 'Bubble view' }).click();
  await expect(page.locator('.bubble')).toHaveCount(8);
});

test('opens a bubble detail and closes it', async ({ page }) => {
  await openHome(page);
  await page.getByRole('button', { name: 'Kitchen counter, Overdue' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Kitchen counter' })).toBeVisible();
  await expect(dialog.getByText('2 days overdue')).toBeVisible();
  await expect(dialog.getByText('Every 3 days')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Mark as cleaned' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('adds a new cleaning cycle', async ({ page }) => {
  await openHome(page);
  await page.getByRole('button', { name: 'Add cleaning item' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('New cycle', { exact: true })).toBeVisible();
  await dialog.getByPlaceholder('e.g. Kitchen counter').fill('Study desk');
  await dialog.getByRole('button', { name: '7 days' }).click();
  await dialog.getByRole('button', { name: 'Save item' }).click();
  await expect(page.getByText('Item added')).toBeVisible();

  await openList(page);
  await expect(
    page.locator('.history-item-button').filter({ hasText: 'Study desk' }),
  ).toBeVisible();
  await page.locator('.history-item-button').filter({ hasText: 'Study desk' }).click();
  await expect(page.getByRole('dialog').getByText('Every 7 days')).toBeVisible();
});

test('edits the name and interval of an existing item', async ({ page }) => {
  await openHome(page);
  await page.getByRole('button', { name: 'Kitchen counter, Overdue' }).click();
  await page.getByRole('button', { name: 'Edit' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Edit cycle', { exact: true })).toBeVisible();
  await dialog.getByPlaceholder('e.g. Kitchen counter').fill('Kitchen island');
  await dialog.getByRole('button', { name: '7 days' }).click();
  await dialog.getByRole('button', { name: 'Save item' }).click();
  await expect(page.getByText('Changes saved')).toBeVisible();

  await openList(page);
  await expect(
    page.locator('.history-item-button').filter({ hasText: 'Kitchen island' }),
  ).toBeVisible();
  await page.locator('.history-item-button').filter({ hasText: 'Kitchen island' }).click();
  await expect(page.getByRole('dialog').getByText('Every 7 days')).toBeVisible();
});

test('marks a cycle as cleaned, logs it and undoes it', async ({ page }) => {
  await openHome(page);
  await page.getByRole('button', { name: 'Kitchen counter, Overdue' }).click();
  await page.getByRole('button', { name: 'Mark as cleaned' }).click();
  await expect(page.getByText('Cycle reset')).toBeVisible();

  await page.getByRole('button', { name: 'Cleaning history' }).click();
  await expect(page.getByRole('heading', { name: 'Cleaning log' })).toBeVisible();
  await expect(page.locator('.history-row').filter({ hasText: 'Kitchen counter' })).toBeVisible();

  await page.getByRole('button', { name: 'Undo cleaning Kitchen counter' }).click();
  await expect(page.getByText('Cleaning undone')).toBeVisible();
  await expect(page.getByText('No cleaning history yet.')).toBeVisible();
  await page.getByRole('button', { name: 'Back to home' }).click();
  await expect(page.locator('.bubble')).toHaveCount(8);
});

test('cleans a bubble with a long press and adds it to the log', async ({ page }) => {
  await openHome(page);
  const bubble = page.locator('.bubble-position-0');
  const box = await bubble.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();

  await expect(page.getByText('Cycle reset')).toBeVisible();
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.getByRole('button', { name: 'Cleaning history' }).click();
  await expect(page.locator('.history-row').filter({ hasText: 'Kitchen counter' })).toBeVisible();
});

test('deletes an item from the board', async ({ page }) => {
  await openHome(page);
  await page.getByRole('button', { name: 'Kitchen counter, Overdue' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Item removed')).toBeVisible();
  await expect(page.locator('.bubble')).toHaveCount(7);
  await page.getByRole('button', { name: 'Cleaning history' }).click();
  await expect(page.getByRole('heading', { name: 'Cleaning log' })).toBeVisible();
});

test('keeps items and history across a reload', async ({ page }) => {
  await openHome(page);
  await page.getByRole('button', { name: 'Add cleaning item' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByPlaceholder('e.g. Kitchen counter').fill('Hallway');
  await dialog.getByRole('button', { name: '30 days' }).click();
  await dialog.getByRole('button', { name: 'Save item' }).click();
  await expect(page.getByText('Item added')).toBeVisible();
  await page.waitForTimeout(800);
  await page.reload();
  await expect(page.locator('.bubble')).toHaveCount(9);

  await openList(page);
  await expect(page.locator('.history-item-button').filter({ hasText: 'Hallway' })).toBeVisible();
});

test('shows the empty state and can add the first item', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('CapacitorStorage.rinse.items.v1', '[]');
    localStorage.setItem('CapacitorStorage.rinse.history.v1', '[]');
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Start with one small thing.' })).toBeVisible();
  await page.getByRole('button', { name: 'Add your first item' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByPlaceholder('e.g. Kitchen counter').fill('Bedroom');
  await dialog.getByRole('button', { name: 'Save item' }).click();
  await expect(page.getByText('Item added')).toBeVisible();
  await expect(page.locator('.bubble')).toHaveCount(1);
});

test('exports a summary and restores a pasted backup', async ({ page }) => {
  await openHome(page);
  await openBackup(page);

  const dataDialog = page.getByRole('dialog', { name: 'Backup and restore' });
  await expect(dataDialog.locator('.backup-stats strong').first()).toHaveText('8');
  await expect(dataDialog.locator('.backup-stats div').first()).toContainText('items');
  await expect(dataDialog.getByText('Copy backup')).toBeVisible();
  await expect(dataDialog.getByText('Download .json')).toBeVisible();

  await dataDialog.getByRole('button', { name: 'Restore from a backup' }).click();
  await dataDialog.getByPlaceholder('Paste the contents of a Rinse backup here').fill(
    JSON.stringify({
      items: [{ id: 'desk', name: 'Desk', interval: 7, lastCleaned: '2020-01-01' }],
      history: [],
    }),
  );
  await dataDialog.getByRole('button', { name: 'Check backup' }).click();
  await expect(dataDialog.getByText('Ready to restore')).toBeVisible();
  await dataDialog.getByRole('button', { name: 'Replace my data' }).click();
  await expect(page.getByText('Backup restored')).toBeVisible();

  await page.getByRole('button', { name: 'Back to home' }).click();
  await expect(page.locator('.bubble')).toHaveCount(1);
  await expect(page.getByRole('button', { name: /Desk/ })).toBeVisible();
});

test('downloads a portable backup file', async ({ page }) => {
  await openHome(page);
  await openBackup(page);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download .json' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^rinse-backup-\d{4}-\d{2}-\d{2}\.json$/);

  const stream = await download.createReadStream();
  let contents = '';
  for await (const chunk of stream) contents += chunk.toString();
  const payload = JSON.parse(contents) as { format: string; data: { items: unknown[] } };
  expect(payload.format).toBe('rinse-backup');
  expect(payload.data.items).toHaveLength(8);
});

test('refreshes relative dates after the local midnight', async ({ page }) => {
  await page.clock.install({ time: new Date(2026, 9, 27, 23, 59, 30) });
  await page.goto('/');
  await expect(page.locator('.bubble')).toHaveCount(8);
  await page.getByRole('tab', { name: 'List view' }).click();
  const kitchenDays = page
    .locator('.home-list .history-item-button')
    .filter({ hasText: 'Kitchen counter' })
    .locator('.list-days');
  await expect(kitchenDays).toHaveText('2d overdue');

  await page.clock.fastForward(35_000);
  await expect(kitchenDays).toHaveText('3d overdue');
});

test('opens settings, toggles notifications and protects destructive deletion', async ({
  page,
}) => {
  await openHome(page);
  await openSettings(page);

  const notifications = page.getByRole('switch', { name: 'Toggle notifications' });
  await expect(notifications).toHaveAttribute('aria-checked', 'true');
  await notifications.click();
  await expect(notifications).toHaveAttribute('aria-checked', 'false');

  await page.getByRole('button', { name: /Privacy/ }).click();
  await expect(
    page.getByText(/stores cleaning items, preferences, and history locally/),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Delete cleaning data' }).click();
  await expect(page.getByText(/This removes every item and cleaning log entry/)).toBeVisible();
  const hold = page.getByRole('button', { name: 'Hold to permanently delete' });
  const box = await hold.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(1400);
  await page.mouse.up();

  await expect(page.getByText('All cleaning data deleted')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Start with one small thing.' })).toBeVisible();
});

test('fits a 360 × 740 Android viewport without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  await expect(page.locator('.bubble')).toHaveCount(8);
  await expect(page.getByRole('button', { name: 'Add cleaning item' })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
