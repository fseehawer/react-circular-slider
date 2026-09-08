import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.goto('./'); });

test('host keyboard, bounds, custom data, readonly and disabled', async ({ page }) => {
  const slider = page.getByRole('slider', { name: 'Value', exact: true });
  await expect(slider).toHaveAttribute('aria-valuenow', '42');
  await slider.press('ArrowUp');
  await expect(page.getByTestId('range-value')).toHaveText('43');
  await page.getByLabel('Maximum', { exact: true }).fill('10');
  await page.getByLabel('Step', { exact: true }).fill('3');
  await slider.press('End'); await slider.press('ArrowLeft');
  await expect(slider).toHaveAttribute('aria-valuenow', '9');
  await page.getByLabel('Read only', { exact: true }).check();
  await slider.press('Home');
  await expect(slider).toHaveAttribute('aria-valuenow', '9');
  await page.getByLabel('Disabled', { exact: true }).check();
  await expect(slider).toHaveAttribute('tabindex', '-1');
  await page.getByRole('tab', { name: 'Custom Data' }).click();
  const data = page.getByRole('slider', { name: 'Size', exact: true });
  await expect(data).toHaveAttribute('aria-valuenow', '2');
  await data.press('ArrowUp');
  await expect(data).toHaveAttribute('aria-valuetext', 'L');
});

test('native form initial/user/programmatic/reset/fieldset contract', async ({ page }) => {
  await page.getByRole('tab', { name: 'Forms', exact: true }).click();
  const slider = page.getByRole('slider', { name: 'Volume', exact: true });
  await page.evaluate(() => {
    const slider = document.querySelector('fio-circular-slider')!;
    (window as any).events = [];
    slider.addEventListener('input', event => (window as any).events.push({
      value: new FormData(document.querySelector('form')!).get('volume'), bubbles: event.bubbles, composed: event.composed,
    }));
  });
  await expect(page.getByTestId('form-data')).toHaveText('{"volume":"40"}');
  await slider.press('ArrowUp');
  expect(await page.evaluate(() => (window as any).events)).toEqual([{ value: '41', bubbles: true, composed: true }]);
  expect(await slider.evaluate(element => {
    (element as any).value = 65;
    return new FormData(document.querySelector('form')!).get('volume');
  })).toBe('65');
  await page.getByRole('button', { name: 'Disable', exact: true }).click();
  await expect(slider).toHaveAttribute('aria-disabled', 'true');
  expect(await page.evaluate(() => new FormData(document.querySelector('form')!).has('volume'))).toBe(false);
  await page.getByRole('button', { name: 'Enable', exact: true }).click();
  await page.getByRole('button', { name: 'Reset to 40', exact: true }).click();
  await expect(slider).toHaveAttribute('aria-valuenow', '40');
  expect(await page.evaluate(() => new FormData(document.querySelector('form')!).get('volume'))).toBe('40');
  expect(await page.evaluate(() => (window as any).events.length)).toBe(1);
});

test('pointer capture emits input then one committed change, ring pauses and endpoints clamp', async ({ page }) => {
  const slider = page.getByRole('slider', { name: 'Value', exact: true });
  await slider.evaluate(element => {
    (window as any).events = [];
    for (const type of ['input', 'change']) element.addEventListener(type, () => (window as any).events.push(type));
  });
  const box = (await slider.boundingBox())!;
  await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2);
  await page.mouse.down();
  await expect(slider).toHaveAttribute('aria-valuenow', '25');
  await expect(slider.locator('.knob-ring')).toHaveCSS('animation-play-state', 'paused');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height - 20, { steps: 10 });
  await page.mouse.up();
  await expect(slider).toHaveAttribute('aria-valuenow', '50');
  const events = await page.evaluate(() => (window as any).events as string[]);
  expect(events.filter(value => value === 'change')).toHaveLength(1);
  expect(events.at(-1)).toBe('change');
  await slider.press('End');
  await page.mouse.move(box.x + box.width / 2, box.y + 20); await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 25, box.y + 22); await page.mouse.up();
  await expect(slider).toHaveAttribute('aria-valuenow', '100');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(slider.locator('.knob-ring')).toHaveCSS('animation-name', 'none');
});

test('gauge paints only selected progress, templates and responsive demo remain usable', async ({ page }) => {
  await page.getByRole('tab', { name: 'Arc Gauge' }).click();
  const slider = page.getByRole('slider', { name: 'Speed', exact: true });
  expect(await slider.locator('svg.dial').evaluate(element => Array.from(element.querySelectorAll('*')).every(node => node.namespaceURI === 'http://www.w3.org/2000/svg'))).toBe(true);
  await expect(slider.locator('path.progress')).toHaveAttribute('stroke-dashoffset', '50');
  const pixels = await slider.locator('svg.dial').evaluate(async (element: SVGSVGElement) => {
    const path = element.querySelector<SVGPathElement>('.progress')!;
    const points = [0.125, 0.875].map(fraction => path.getPointAtLength(path.getTotalLength() * fraction));
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 280;
    const context = canvas.getContext('2d')!;
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(element))}`;
    await image.decode(); context.drawImage(image, 0, 0);
    return points.map(point => Array.from(context.getImageData(Math.round(point.x), Math.round(point.y), 1, 1).data));
  });
  expect(pixels[0][1]).toBeGreaterThan(pixels[0][0]);
  expect(pixels[1]).toEqual([229, 231, 235, 255]);
  await page.screenshot({ path: 'test-results/wc-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('tab', { name: 'Templates' }).click();
  const battery = page.getByRole('slider', { name: 'Battery', exact: true });
  await battery.press('ArrowUp');
  await expect(battery.locator('.battery-value')).toHaveText('66%');
  await expect(battery.locator('[slot="knob"]')).toHaveText('66');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'View Code Sample' }).click();
  await expect(page.locator('.code-sample')).toBeVisible();
  await expect(page.locator('.line-number').first()).toHaveText('1');
  expect(await page.locator('[class^="hljs-"]').count()).toBeGreaterThan(0);
  await page.screenshot({ path: 'test-results/wc-mobile.png', fullPage: true });
});

test('validation, restoration, data reordering and text/style injection guards', async ({ page }) => {
  await page.getByRole('tab', { name: 'Forms', exact: true }).click();
  const result = await page.locator('fio-circular-slider').evaluate(async (element: any) => {
    element.value = ''; await element.updateComplete;
    const missing = element.validity.valueMissing;
    element.value = 90; element.setCustomValidity('Check volume');
    const custom = element.validationMessage;
    element.setCustomValidity(''); element.formStateRestoreCallback('{"value":65}', 'restore');
    const restored = element.value;
    element.data = ['S', 'M', 'L']; element.value = 'M'; element.data = ['M', 'L', 'S'];
    const preserved = [element.value, element.dataIndex];
    element.label = '<img src=x onerror=alert(1)>';
    element.trackColor = 'url(https://example.com/tracker)';
    element.valueFontSize = '1rem;position:fixed';
    await element.updateComplete;
    return { missing, custom, restored, preserved, images: element.shadowRoot.querySelectorAll('img').length,
      track: element.shadowRoot.querySelector('[part="track"]').getAttribute('stroke') };
  });
  expect(result).toEqual({ missing: true, custom: 'Check volume', restored: 65, preserved: ['M', 0], images: 0, track: '#e5e7eb' });
});

test('registration is idempotent, supports alternate names, and upgrades standalone HTML', async ({ page }) => {
  const source = new URL(`@fs${process.cwd()}/dist/index.js`, page.url()).href;
  const result = await page.evaluate(async (source) => {
    const module = await import(source);
    const first = module.registerCircularSlider();
    const second = module.registerCircularSlider();
    const alternate = module.registerCircularSlider('fixture-circular-slider');
    const existing = module.registerCircularSlider('fixture-circular-slider');
    const form = document.createElement('form');
    const slider = document.createElement('fixture-circular-slider') as any;
    slider.setAttribute('name', 'fixture'); slider.setAttribute('value', '40'); slider.setAttribute('max', '100');
    form.append(slider); document.body.append(form); await slider.updateComplete;
    const value = new FormData(form).get('fixture');
    const isInstance = slider instanceof module.CircularSliderElement;
    form.remove();
    return { same: first === second, alternate: alternate === existing, value, isInstance };
  }, source);
  expect(result).toEqual({ same: true, alternate: true, value: '40', isInstance: true });
});

test.describe('touch input', () => {
  test.use({ hasTouch: true });
  test('track taps update and commit', async ({ page }) => {
    const slider = page.getByRole('slider', { name: 'Value', exact: true });
    const box = (await slider.boundingBox())!;
    await page.touchscreen.tap(box.x + box.width - 20, box.y + box.height / 2);
    await expect(slider).toHaveAttribute('aria-valuenow', '25');
    await expect(page.locator('.status')).toHaveText('Selected value');
  });
});

test('pen input and noninteractive slot content', async ({ page, context }) => {
  const slider = page.getByRole('slider', { name: 'Value', exact: true });
  const box = (await slider.boundingBox())!;
  const session = await context.newCDPSession(page);
  await session.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: box.x + box.width - 20, y: box.y + box.height / 2, button: 'left', buttons: 1, pointerType: 'pen' });
  await session.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: box.x + box.width / 2, y: box.y + box.height - 20, buttons: 1, pointerType: 'pen' });
  await session.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: box.x + box.width / 2, y: box.y + box.height - 20, button: 'left', buttons: 0, pointerType: 'pen' });
  await expect(slider).toHaveAttribute('aria-valuenow', '50');
  await page.getByRole('tab', { name: 'Templates' }).click();
  const inert = await page.locator('fio-circular-slider').evaluate(element => {
    const button = document.createElement('button'); button.slot = 'label'; button.textContent = 'Not interactive';
    element.append(button); (element as HTMLElement).focus(); button.focus();
    return document.activeElement !== button;
  });
  expect(inert).toBe(true);
});

test('clipboard contains exact numbered source without the line numbers', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: 'Copy code', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Copied', exact: true })).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("from '@fiojs/wc-circular-slider'");
  expect(copied).toEqual((await page.locator('.line-content').allTextContents()).map(line => line === ' ' ? '' : line).join('\n'));
});

test('duplicate data values keep their selected index across renders', async ({ page }) => {
  const result = await page.locator('fio-circular-slider').evaluate(async (element: any) => {
    element.data = ['S', 'M', 'M', 'L']; element.dataIndex = 2;
    await element.updateComplete;
    element.label = 'Duplicate data'; await element.updateComplete;
    return [element.value, element.dataIndex, element.getAttribute('aria-valuenow')];
  });
  expect(result).toEqual(['M', 2, '2']);
});

test('every copied sample is HTML with one module script and no loose JavaScript', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  for (const tab of ['Range', 'Arc Gauge', 'Custom Data', 'Forms', 'Templates']) {
    await page.getByRole('tab', { name: tab, exact: true }).click();
    await page.getByRole('button', { name: 'Copy code', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Copied', exact: true })).toBeVisible();
    const structure = await page.evaluate(async () => {
      const source = await navigator.clipboard.readText();
      const parsed = new DOMParser().parseFromString(source, 'text/html');
      const script = parsed.querySelector('script');
      return {
        startsWithMarkup: source.startsWith('<fio-circular-slider') || source.startsWith('<form'),
        scripts: parsed.querySelectorAll('script').length,
        module: script?.type,
        importInScript: script?.textContent?.includes("from '@fiojs/wc-circular-slider'"),
        looseText: Array.from(parsed.body.childNodes).filter(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()).length,
        source,
      };
    });
    expect(structure.startsWithMarkup).toBe(true);
    expect(structure.scripts).toBe(1);
    expect(structure.module).toBe('module');
    expect(structure.importInScript).toBe(true);
    expect(structure.looseText).toBe(0);
    expect(structure.source).toEqual((await page.locator('.line-content').allTextContents()).map(line => line === ' ' ? '' : line).join('\n'));
  }
});
