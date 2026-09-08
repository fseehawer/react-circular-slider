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
  await expect(slider).toHaveAttribute('aria-readonly', 'true');
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
  await expect(slider.locator('[data-track]')).toHaveAttribute('pointer-events', 'none');
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

test('gauge reveals only the selected portion of the gradient', async ({ page }) => {
  await page.getByRole('tab', { name: 'Arc Gauge' }).click();
  const slider = page.getByRole('slider', { name: 'Speed', exact: true });
  const progress = slider.locator('.progress');
  for (const value of [0, 80, 160]) {
    await page.getByLabel('Set speed', { exact: true }).fill(String(value));
    await expect(progress).toHaveAttribute('stroke-dashoffset', String(100 * (1 - value / 160)));
    await expect(progress).toHaveAttribute('opacity', value === 0 ? '0' : '1');
    // Sample the painted SVG, so identical track/progress gradients cannot pass unnoticed.
    const pixels = await slider.locator('svg.dial').evaluate(async (element: SVGSVGElement) => {
      const path = element.querySelector<SVGPathElement>('.progress')!;
      const points = [0.125, 0.875].map(fraction => path.getPointAtLength(path.getTotalLength() * fraction));
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = element.viewBox.baseVal.width;
      const context = canvas.getContext('2d')!;
      const image = new Image();
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(element))}`;
      await image.decode();
      context.drawImage(image, 0, 0);
      return points.map(point => Array.from(context.getImageData(Math.round(point.x), Math.round(point.y), 1, 1).data));
    });
    const [low, high] = pixels;
    if (value === 0) expect(low).toEqual([229, 231, 235, 255]);
    else { expect(low[1]).toBeGreaterThan(low[0]); expect(low[3]).toBe(255); }
    if (value < 160) expect(high).toEqual([229, 231, 235, 255]);
    else { expect(high[0]).toBeGreaterThan(high[1]); expect(high[3]).toBe(255); }
  }
  await page.getByLabel('Set speed', { exact: true }).fill('80');
  await expect(progress).toHaveAttribute('stroke-dashoffset', '50');
  await page.screenshot({ path: 'test-results/angular-gauge-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/angular-gauge-mobile.png', fullPage: true });
});

test('knob ring pulses when idle and pauses during dragging', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const slider = page.getByRole('slider', { name: 'Value', exact: true });
  const ring = slider.locator('.knob-ring');
  await expect(ring).toHaveCSS('animation-name', /knob-pulse/);
  await expect(ring).toHaveCSS('animation-duration', '1.5s');
  const initialTransform = await ring.evaluate(element => getComputedStyle(element).transform);
  await expect.poll(() => ring.evaluate(element => getComputedStyle(element).transform)).not.toBe(initialTransform);
  const knob = (await slider.locator('[data-knob]').boundingBox())!;
  await page.mouse.move(knob.x + knob.width / 2, knob.y + knob.height / 2);
  await page.mouse.down();
  await expect(slider).toHaveClass(/is-dragging/);
  await expect(ring).toHaveCSS('animation-play-state', 'paused');
  await page.mouse.up();
  await expect(ring).toHaveCSS('animation-play-state', 'running');
  await page.getByLabel('Read only').check();
  await expect(ring).toHaveCSS('animation-name', 'none');
  await page.getByLabel('Read only').uncheck();
  await page.getByLabel('Disabled', { exact: true }).check();
  await expect(ring).toHaveCSS('animation-name', 'none');
  await page.getByLabel('Disabled', { exact: true }).uncheck();
  await expect(ring).toHaveCSS('animation-name', /knob-pulse/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(ring).toHaveCSS('animation-name', 'none');
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

test('signal forms distinguish user changes, programmatic reset and disabled state', async ({ page }) => {
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
  await expect(slider).toHaveAttribute('aria-disabled', 'true');
  await slider.press('ArrowUp');
  await expect(slider).toHaveAttribute('aria-valuenow', '40');
  await expect(slider).toHaveAttribute('aria-disabled', 'true');
  await page.getByRole('button', { name: 'Enable', exact: true }).click();
  await expect(slider).toHaveAttribute('aria-disabled', 'false');
  await slider.press('ArrowUp');
  await expect(page.getByTestId('form-value')).toHaveText('41');
});

test('templates and mobile layout render without horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('tab', { name: 'Templates' }).click();
  const slider = page.getByRole('slider', { name: 'Battery', exact: true });
  await expect(slider.locator('.battery-value')).toHaveText('65');
  await expect(slider.locator('.battery-unit')).toHaveText('%');
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
  expect(copied).toEqual((await page.locator('.line-content').allTextContents()).map(line => line === ' ' ? '' : line).join('\n'));
  await expect(page.locator('.line-number').first()).toHaveText('1');
  expect(await page.locator('.line-content [class^="hljs-"]').count()).toBeGreaterThan(0);
  await page.getByLabel('Step', { exact: true }).fill('2');
  await expect(page.getByRole('button', { name: 'Copy code', exact: true })).toBeVisible();
});
