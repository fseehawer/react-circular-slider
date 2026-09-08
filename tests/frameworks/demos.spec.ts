import { expect, test, type Locator } from '@playwright/test';

async function pointOnTrack(slider: Locator, fraction: number) {
  return slider.locator('path.progress').evaluate((element: SVGPathElement, progress) => {
    const point = element.getPointAtLength(element.getTotalLength() * progress);
    const screen = new DOMPoint(point.x, point.y).matrixTransform(element.getScreenCTM()!);
    return { x: screen.x, y: screen.y };
  }, fraction);
}

for (const framework of [
  { path: 'vue', title: 'Vue Circular Slider', package: '@fiojs/vue-circular-slider' },
  { path: 'web-component', title: 'Web Component Circular Slider', package: '@fiojs/wc-circular-slider' },
]) {
  test.describe(framework.path, () => {
    test.beforeEach(async ({ page }) => { await page.goto(`./${framework.path}/`); });

    test('numeric values, bounds, steps, direction and interaction locks', async ({ page }) => {
      const slider = page.getByRole('slider', { name: 'Value', exact: true });
      await expect(slider).toHaveAttribute('aria-valuenow', '42');
      await slider.press('ArrowUp');
      await expect(slider).toHaveAttribute('aria-valuenow', '43');
      await slider.press('Home');
      await slider.press('PageUp');
      await expect(slider).toHaveAttribute('aria-valuenow', '10');
      await page.getByLabel('Maximum', { exact: true }).fill('10');
      await page.getByLabel('Step', { exact: true }).fill('3');
      await slider.press('End');
      await expect(slider).toHaveAttribute('aria-valuenow', '10');
      await slider.press('ArrowLeft');
      await expect(slider).toHaveAttribute('aria-valuenow', '9');
      await page.getByRole('combobox', { name: 'Direction', exact: true }).selectOption({ label: 'Counterclockwise' });
      await expect(slider).toHaveAttribute('aria-valuenow', '9');
      await page.getByLabel('Read only', { exact: true }).check();
      await expect(slider).toHaveAttribute('aria-readonly', 'true');
      await slider.press('Home');
      await expect(slider).toHaveAttribute('aria-valuenow', '9');
      await page.getByLabel('Disabled', { exact: true }).check();
      await expect(slider).toHaveAttribute('aria-disabled', 'true');
      await expect(slider).toHaveAttribute('tabindex', '-1');
    });

    test('pointer capture moves progress and clamps at the full-circle endpoint', async ({ page }) => {
      const slider = page.getByRole('slider', { name: 'Value', exact: true });
      const quarter = await pointOnTrack(slider, 0.25);
      const half = await pointOnTrack(slider, 0.5);
      await page.mouse.click(quarter.x, quarter.y);
      await expect(slider).toHaveAttribute('aria-valuenow', '25');
      await page.mouse.move(quarter.x, quarter.y);
      await page.mouse.down();
      await page.mouse.move(half.x, half.y, { steps: 8 });
      await page.mouse.up();
      await expect(slider).toHaveAttribute('aria-valuenow', '50');
      await slider.press('End');
      const start = await pointOnTrack(slider, 0);
      const beyond = await pointOnTrack(slider, 0.025);
      await page.mouse.move(start.x, start.y);
      await page.mouse.down();
      await page.mouse.move(beyond.x, beyond.y);
      await page.mouse.up();
      await expect(slider).toHaveAttribute('aria-valuenow', '100');
    });

    test.describe('touch input', () => {
      test.use({ hasTouch: true });
      test('track taps select a value', async ({ page }) => {
        const slider = page.getByRole('slider', { name: 'Value', exact: true });
        const point = await pointOnTrack(slider, 0.25);
        await page.touchscreen.tap(point.x, point.y);
        await expect(slider).toHaveAttribute('aria-valuenow', '25');
      });
    });

    test('pen gestures use the same captured pointer interaction', async ({ page, context }) => {
      const slider = page.getByRole('slider', { name: 'Value', exact: true });
      const from = await pointOnTrack(slider, 0.25);
      const to = await pointOnTrack(slider, 0.5);
      const session = await context.newCDPSession(page);
      await session.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...from, button: 'left', buttons: 1, pointerType: 'pen' });
      await session.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...to, buttons: 1, pointerType: 'pen' });
      await session.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...to, button: 'left', buttons: 0, pointerType: 'pen' });
      await expect(slider).toHaveAttribute('aria-valuenow', '50');
    });

    test('arc gradient fills from green to red over a neutral remainder', async ({ page }) => {
      await page.getByRole('tab', { name: 'Arc Gauge', exact: true }).click();
      const slider = page.getByRole('slider', { name: 'Speed', exact: true });
      const progress = slider.locator('path.progress[stroke-dashoffset], mask path[stroke-dashoffset]');
      for (const value of [0, 80, 160]) {
        await page.getByLabel('Set speed', { exact: true }).fill(String(value));
        await expect(slider).toHaveAttribute('aria-valuenow', String(value));
        await expect(progress).toHaveAttribute('stroke-dashoffset', String(100 * (1 - value / 160)));
        const pixels = await slider.locator('svg.dial').evaluate(async (element: SVGSVGElement) => {
          const path = element.querySelector<SVGPathElement>('path.progress')!;
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
        const neutral = (pixel: number[]) => Math.max(...pixel.slice(0, 3)) - Math.min(...pixel.slice(0, 3)) < 12;
        expect(low[3]).toBe(255);
        expect(high[3]).toBe(255);
        if (value === 0) expect(neutral(low)).toBe(true);
        else expect(low[1]).toBeGreaterThan(low[0] + 20);
        if (value < 160) expect(neutral(high)).toBe(true);
        else expect(high[0]).toBeGreaterThan(high[1] + 20);
      }
    });

    test('custom data and templates follow the selected value', async ({ page }) => {
      await page.getByRole('tab', { name: 'Custom Data', exact: true }).click();
      const slider = page.getByRole('slider', { name: 'Size', exact: true });
      await expect(slider).toHaveAttribute('aria-valuetext', 'M');
      await page.getByRole('combobox').selectOption('XL');
      await expect(slider).toHaveAttribute('aria-valuenow', '4');
      await slider.press('ArrowLeft');
      await expect(slider).toHaveAttribute('aria-valuetext', 'L');
      await page.getByRole('tab', { name: 'Templates', exact: true }).click();
      const battery = page.getByRole('slider', { name: 'Battery', exact: true });
      await expect(battery).toHaveAttribute('aria-valuenow', '65');
      await battery.press('ArrowUp');
      await expect(battery).toHaveAttribute('aria-valuenow', '66');
      await expect(battery).toContainText('66');
    });

    test('idle pulse respects dragging and reduced-motion preferences', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      const slider = page.getByRole('slider', { name: 'Value', exact: true });
      const ring = slider.locator('circle.knob-ring');
      await expect(ring).toHaveCSS('animation-name', /pulse/);
      const initial = await ring.evaluate(element => getComputedStyle(element).transform);
      await expect.poll(() => ring.evaluate(element => getComputedStyle(element).transform)).not.toBe(initial);
      const knob = (await slider.locator('[data-knob]').first().boundingBox())!;
      await page.mouse.move(knob.x + knob.width / 2, knob.y + knob.height / 2);
      await page.mouse.down();
      await expect(ring).toHaveCSS('animation-play-state', 'paused');
      await page.mouse.up();
      await expect(ring).toHaveCSS('animation-play-state', 'running');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(ring).toHaveCSS('animation-name', 'none');
    });

    test('copy returns usable code without the line numbers', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.getByRole('button', { name: 'Copy code', exact: true }).click();
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied).toContain(framework.package);
      expect(copied).not.toMatch(/^\s*1\s+import/);
    });

    for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
      test(`all examples render at ${viewport.width}px without overflow or runtime errors`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.setViewportSize(viewport);
        await page.reload();
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(framework.title);
        for (const tab of ['Range', 'Arc Gauge', 'Custom Data', 'Forms', 'Templates']) {
          await page.getByRole('tab', { name: tab, exact: true }).click();
          await expect(page.getByRole('slider')).toBeVisible();
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          if (['Range', 'Arc Gauge', 'Forms'].includes(tab)) {
            await page.screenshot({ path: `test-results/${framework.path}-${tab.toLowerCase().replaceAll(' ', '-')}-${viewport.width}.png`, fullPage: true });
          }
        }
        expect(errors).toEqual([]);
      });
    }
  });
}
