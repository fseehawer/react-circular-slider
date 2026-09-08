import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.goto('./'); });

test('Range model, inputs, keyboard, direction and editing modes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const slider = page.getByRole('slider', { name: 'Value', exact: true });
  await expect(slider).toHaveAttribute('aria-valuenow', '42');
  await slider.press('ArrowRight');
  await expect(page.getByTestId('range-value')).toHaveText('43');
  await page.getByLabel('Maximum', { exact: true }).fill('200');
  await expect(slider).toHaveAttribute('aria-valuenow', '43');
  await page.getByLabel('Step', { exact: true }).fill('5');
  await expect(slider).toHaveAttribute('aria-valuenow', '45');
  await page.getByRole('combobox', { name: 'Direction', exact: true }).selectOption('-1');
  await slider.press('PageUp');
  await expect(slider).toHaveAttribute('aria-valuenow', '95');
  await page.getByLabel('Read only', { exact: true }).check();
  await slider.press('End');
  await expect(slider).toHaveAttribute('aria-valuenow', '95');
  await expect(slider.locator('circle.knob-ring')).toHaveCSS('animation-play-state', 'paused');
  await page.getByLabel('Disabled', { exact: true }).check();
  await expect(slider).toHaveAttribute('tabindex', '-1');
  await expect(slider).toHaveAttribute('aria-disabled', 'true');
  expect(errors).toEqual([]);
});

test('native mouse capture and ring pause during drag', async ({ page }) => {
  const slider = page.getByRole('slider', { name: 'Value', exact: true });
  const dial = (await slider.boundingBox())!;
  const knob = (await slider.locator('[data-knob]').boundingBox())!;
  await page.mouse.move(knob.x + knob.width / 2, knob.y + knob.height / 2);
  await page.mouse.down();
  await expect(page.getByTestId('drag-state')).toHaveText('Dragging');
  await expect(slider.locator('circle.knob-ring')).toHaveCSS('animation-play-state', 'paused');
  await page.mouse.move(dial.x - 70, dial.y + dial.height / 2, { steps: 5 });
  await expect(slider).toHaveAttribute('aria-valuenow', '75');
  await page.mouse.up();
  await expect(page.getByTestId('drag-state')).toHaveText('Selected value');
  await expect(slider.locator('circle.knob-ring')).toHaveCSS('animation-play-state', 'running');
});

test('arc renders colored progress and a neutral unfilled track', async ({ page }) => {
  await page.getByRole('tab', { name: 'Arc Gauge', exact: true }).click();
  const slider = page.getByRole('slider', { name: 'Speed', exact: true });
  await expect(slider).toHaveAttribute('aria-valuenow', '80');
  await expect(slider.locator('mask path')).toHaveAttribute('stroke-dashoffset', '50');
  const samples = await slider.locator('svg.dial').evaluate(async (svg) => {
    const serialized = new XMLSerializer().serializeToString(svg);
    const image = new Image();
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(serialized);
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 280;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0, 280, 280);
    return { filled: [...context.getImageData(20, 140, 1, 1).data], unfilled: [...context.getImageData(260, 140, 1, 1).data] };
  });
  expect(samples.filled[3]).toBeGreaterThan(200);
  expect(samples.filled[1]).toBeGreaterThan(samples.filled[0]);
  expect(samples.unfilled.slice(0, 3)).toEqual([229, 231, 235]);
  await page.screenshot({ path: 'test-results/arc-desktop.png', fullPage: true });
  await page.getByLabel('Set speed', { exact: true }).fill('0');
  await expect(slider).toHaveAttribute('aria-valuenow', '0');
  await page.getByLabel('Set speed', { exact: true }).fill('160');
  await expect(slider.locator('mask path')).toHaveAttribute('stroke-dashoffset', '0');
});

test('custom data, form state, and scoped slot examples are live', async ({ page }) => {
  await page.getByRole('tab', { name: 'Custom Data', exact: true }).click();
  const size = page.getByRole('slider', { name: 'Size', exact: true });
  await expect(size).toHaveAttribute('aria-valuetext', 'M');
  await size.press('ArrowRight');
  await expect(page.getByTestId('data-value')).toHaveText('L');
  await expect(page.getByTestId('data-index')).toHaveText('3');
  await page.getByRole('combobox', { name: 'Size', exact: true }).selectOption('XS');
  await expect(size).toHaveAttribute('aria-valuenow', '0');
  await page.getByRole('tab', { name: 'Forms', exact: true }).click();
  const volume = page.getByRole('slider', { name: 'Volume', exact: true });
  await expect(volume).toHaveAttribute('aria-valuenow', '55');
  await expect(page.getByTestId('form-dirty')).toHaveText('false');
  await volume.press('ArrowUp');
  await volume.press('Tab');
  await expect(page.getByTestId('form-dirty')).toHaveText('true');
  await expect(page.getByTestId('form-touched')).toHaveText('true');
  await page.getByRole('button', { name: 'Reset to 40', exact: true }).click();
  await expect(volume).toHaveAttribute('aria-valuenow', '40');
  await expect(page.getByTestId('form-dirty')).toHaveText('false');
  await expect(page.getByTestId('form-touched')).toHaveText('false');
  await page.getByRole('button', { name: 'Disable', exact: true }).click();
  await expect(volume).toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByTestId('form-status')).toHaveText('DISABLED');
  await page.getByRole('button', { name: 'Enable', exact: true }).click();
  await expect(page.getByTestId('form-status')).toHaveText('VALID');
  await page.getByRole('tab', { name: 'Templates', exact: true }).click();
  const battery = page.getByRole('slider', { name: 'Battery', exact: true });
  await expect(battery.locator('.battery-value')).toHaveText('65');
  await expect(battery.locator('.battery-unit')).toHaveText('%');
  await battery.press('ArrowUp');
  await expect(battery.locator('.fio-cs-knob-content')).toHaveText('66');
});

test('code has highlight, line numbers and a functional clipboard button', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await expect(page.locator('.line-number').first()).toHaveText('1');
  expect(await page.locator('.hljs-keyword').count()).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Copy code', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Copied', exact: true })).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("import '@fiojs/vue-circular-slider/style.css'");
  expect(copied).toContain('v-model="value"');
  expect(copied).toContain('</script>');
});

test('mobile has no page overflow, collapsible code and reduced-motion styling', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('circle.knob-ring')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('#code-sample')).toBeHidden();
  await page.getByRole('button', { name: 'View Code Sample' }).click();
  await expect(page.locator('#code-sample')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hide Code Sample' })).toHaveAttribute('aria-expanded', 'true');
  for (const tab of ['Range', 'Arc Gauge', 'Custom Data', 'Forms', 'Templates']) {
    await page.getByRole('tab', { name: tab, exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const slider = page.getByRole('slider');
    const bounds = (await slider.boundingBox())!;
    expect(bounds.width).toBeGreaterThan(180);
    expect(Math.abs(bounds.width - bounds.height)).toBeLessThan(1);
    const label = (await slider.locator('.fio-cs-labels').boundingBox())!;
    expect(label.x).toBeGreaterThan(bounds.x);
    expect(label.x + label.width).toBeLessThan(bounds.x + bounds.width);
  }
  await page.screenshot({ path: 'test-results/templates-mobile.png', fullPage: true });
});

test('tabs support arrow-key navigation without extra tab stops', async ({ page }) => {
  await page.getByRole('tab', { name: 'Range', exact: true }).press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Arc Gauge', exact: true })).toBeFocused();
  await expect(page.getByRole('slider', { name: 'Speed', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Arc Gauge', exact: true }).press('End');
  await expect(page.getByRole('tab', { name: 'Templates', exact: true })).toBeFocused();
});
