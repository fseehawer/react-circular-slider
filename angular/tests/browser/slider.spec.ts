import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.goto('./'); });

test('numeric values support keyboard, steps, direction and readonly', async ({ page }) => {
  const slider = page.getByRole('slider', { name: 'Value', exact: true });
  await expect(slider).toHaveAttribute('aria-valuenow', '42');
  await slider.press('ArrowUp');
  await expect(page.getByTestId('range-value')).toHaveText('43');
  await slider.press('End');
  await expect(slider).toHaveAttribute('aria-valuenow', '100');
  await slider.press('Home');
  await slider.press('PageUp');
  await expect(slider).toHaveAttribute('aria-valuenow', '10');
  await page.getByLabel('Maximum', { exact: true }).fill('10');
  await page.getByLabel('Step', { exact: true }).fill('3');
  await slider.press('End');
  await slider.press('ArrowLeft');
  await expect(slider).toHaveAttribute('aria-valuenow', '9');
  await page.getByLabel('Direction').selectOption({ label: 'Counterclockwise' });
  await expect(slider).toHaveAttribute('aria-valuenow', '9');
  await page.getByLabel('Read only').check();
  await slider.press('Home');
  await expect(slider).toHaveAttribute('aria-valuenow', '9');
  await page.getByLabel('Disabled', { exact: true }).check();
  await expect(slider).toHaveAttribute('tabindex', '-1');
});

test('track click and pointer capture update the value and end dragging', async ({ page }) => {
  const slider = page.getByRole('slider', { name: 'Value', exact: true });
  const box = (await slider.boundingBox())!;
  await page.mouse.click(box.x + box.width - 20, box.y + box.height / 2);
  await expect(slider).toHaveAttribute('aria-valuenow', '25');
  await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height - 20, { steps: 10 });
  await expect(slider).toHaveAttribute('aria-valuenow', '50');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height + 100);
  await page.mouse.up();
  await expect(page.locator('.status')).toHaveText('Selected value');
  await page.getByLabel('Track dragging').uncheck();
  await page.mouse.click(box.x + box.width - 20, box.y + box.height / 2);
  await expect(slider).toHaveAttribute('aria-valuenow', '50');
});

test('full-circle dragging clamps at the maximum instead of wrapping', async ({ page }) => {
  const slider = page.getByRole('slider', { name: 'Value', exact: true });
  await slider.press('End');
  const box = (await slider.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 25, box.y + 22);
  await page.mouse.up();
  await expect(slider).toHaveAttribute('aria-valuenow', '100');
});

test('gauge endpoints and gradient agree on green-to-red value order', async ({ page }) => {
  await page.getByRole('tab', { name: 'Arc Gauge' }).click();
  const slider = page.getByRole('slider', { name: 'Speed', exact: true });
  await slider.press('Home');
  await expect(slider).toHaveAttribute('aria-valuenow', '0');
  const start = await slider.locator('[data-knob]').getAttribute('transform');
  await slider.press('End');
  await expect(slider).toHaveAttribute('aria-valuenow', '160');
  expect(await slider.locator('[data-knob]').getAttribute('transform')).not.toEqual(start);
  const gradient = slider.locator('linearGradient').first();
  expect(Number(await gradient.getAttribute('x1'))).toBeLessThan(Number(await gradient.getAttribute('x2')));
  await expect(gradient.locator('stop').first()).toHaveAttribute('stop-color', '#22c55e');
  await expect(gradient.locator('stop').last()).toHaveAttribute('stop-color', '#ef4444');
  await page.getByLabel('Set speed', { exact: true }).fill('40');
  await expect(slider).toHaveAttribute('aria-valuenow', '40');
});

test('custom values use accessible index and value text', async ({ page }) => {
  await page.getByRole('tab', { name: 'Custom Data' }).click();
  const slider = page.getByRole('slider', { name: 'Size', exact: true });
  await expect(slider).toHaveAttribute('aria-valuenow', '2');
  await slider.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuetext', 'L');
  await expect(page.getByTestId('data-value')).toHaveText('L');
  await page.getByRole('combobox').selectOption('XS');
  await expect(slider).toHaveAttribute('aria-valuenow', '0');
});

test('reactive forms distinguish user changes, programmatic reset and disabled state', async ({ page }) => {
  await page.getByRole('tab', { name: 'Forms', exact: true }).click();
  const slider = page.getByRole('slider', { name: 'Volume', exact: true });
  await expect(page.getByTestId('form-dirty')).toHaveText('false');
  await slider.press('ArrowUp');
  await expect(page.getByTestId('form-value')).toHaveText('56');
  await expect(page.getByTestId('form-dirty')).toHaveText('true');
  await slider.press('Tab');
  await expect(page.getByTestId('form-touched')).toHaveText('true');
  await page.getByRole('button', { name: 'Reset to 40' }).click();
  await expect(slider).toHaveAttribute('aria-valuenow', '40');
  await expect(page.getByTestId('form-dirty')).toHaveText('false');
  await page.getByRole('button', { name: 'Disable', exact: true }).click();
  await slider.press('ArrowUp');
  await expect(slider).toHaveAttribute('aria-valuenow', '40');
  await expect(slider).toHaveAttribute('aria-disabled', 'true');
  await page.getByRole('button', { name: 'Enable', exact: true }).click();
  await slider.press('ArrowUp');
  await expect(page.getByTestId('form-value')).toHaveText('41');
});

test('templates and mobile layout render without horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('tab', { name: 'Templates' }).click();
  const slider = page.getByRole('slider', { name: 'Battery', exact: true });
  await expect(slider.locator('.battery-value')).toHaveText('65%');
  await slider.press('ArrowUp');
  await expect(slider.locator('.knob-content')).toHaveText('66');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/angular-mobile.png', fullPage: true });
});

test('desktop demo has no runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.reload();
  await expect(page.getByRole('slider')).toBeVisible();
  await page.screenshot({ path: 'test-results/angular-desktop.png', fullPage: true });
  expect(errors).toEqual([]);
});

test.describe('touch input', () => {
  test.use({ hasTouch: true });
  test('track taps update the value and finish the gesture', async ({ page }) => {
    const slider = page.getByRole('slider', { name: 'Value', exact: true });
    const box = (await slider.boundingBox())!;
    await page.touchscreen.tap(box.x + box.width - 20, box.y + box.height / 2);
    await expect(slider).toHaveAttribute('aria-valuenow', '25');
    await expect(page.locator('.status')).toHaveText('Selected value');
  });
});

test('pen gestures use the same pointer interaction', async ({ page, context }) => {
  const slider = page.getByRole('slider', { name: 'Value', exact: true });
  const box = (await slider.boundingBox())!;
  const session = await context.newCDPSession(page);
  await session.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: box.x + box.width - 20, y: box.y + box.height / 2, button: 'left', buttons: 1, pointerType: 'pen' });
  await session.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: box.x + box.width / 2, y: box.y + box.height - 20, buttons: 1, pointerType: 'pen' });
  await session.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: box.x + box.width / 2, y: box.y + box.height - 20, button: 'left', buttons: 0, pointerType: 'pen' });
  await expect(slider).toHaveAttribute('aria-valuenow', '50');
  await expect(page.locator('.status')).toHaveText('Selected value');
});

test('copy code includes the Angular package import', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: 'Copy code' }).click();
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("from '@fiojs/ng-circular-slider'");
  expect(copied).toEqual(await page.locator('pre.code').innerText());
});
