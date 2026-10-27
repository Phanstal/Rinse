import { expect, test } from '@playwright/test';

async function openHome(page: import('@playwright/test').Page) {
  await page.goto('/');
  await expect(page.getByText('3 areas ready for care')).toBeVisible();
}

async function openList(page: import('@playwright/test').Page) {
  await page.getByRole('tab', { name: 'List view' }).click();
  await expect(page.locator('.home-list .history-item-button').first()).toBeVisible();
}

test('shows the seeded home with bubbles, summary and controls', async ({ page }) => {
  await openHome(page);
  await expect(page.getByRole('heading', { name: 'Your home, at a glance.' })).toBeVisible();
  await expect(page.locator('.bubble')).toHaveCount(8);
  await expect(page.getByText('Press and hold a bubble when it’s clean')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Bubble view' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Add cleaning item' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cleaning history' })).toBeVisible();
});

test('switches between the bubble field and the full list', async ({ page }) => {
  await openHome(page);
  await openList(page);
  await expect(page.locator('.home-list .history-item-button')).toHaveCount(8);
  await expect(page.getByText('2 days overdue · Every 3 days')).toBeVisible();
  await expect(page.getByText('Due in 29 days · Every 30 days')).toBeVisible();
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
  await expect(page.getByText('2 areas ready for care')).toBeVisible();

  await page.getByRole('button', { name: 'Cleaning history' }).click();
  await expect(page.getByRole('heading', { name: 'Cleaning log' })).toBeVisible();
  await expect(page.locator('.history-row').filter({ hasText: 'Kitchen counter' })).toBeVisible();

  await page.getByRole('button', { name: 'Undo cleaning Kitchen counter' }).click();
  await expect(page.getByText('Cleaning undone')).toBeVisible();
  await expect(page.getByText('No cleaning history yet.')).toBeVisible();
  await page.getByRole('button', { name: 'Back to home' }).click();
  await expect(page.getByText('3 areas ready for care')).toBeVisible();
});

test('cleans a bubble with a long press and adds it to the log', async ({ page }) => {
  await openHome(page);
  const bubble = page.locator('.bubble-position-0');
  const box = await bubble.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(850);
  await page.mouse.up();

  await expect(page.getByText('Cycle reset')).toBeVisible();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByText('2 areas ready for care')).toBeVisible();
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
  await expect(page.getByText('3 areas ready for care')).toBeVisible();

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
  await expect(page.getByText('No areas ready for care')).toBeVisible();
});

test('fits a 360 × 740 Android viewport without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  await expect(page.getByText('3 areas ready for care')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add cleaning item' })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
