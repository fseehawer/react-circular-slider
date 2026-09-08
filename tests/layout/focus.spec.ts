import { expect, test, type Locator, type Page } from '@playwright/test';

async function knobCenter(slider: Locator, framework: string) {
  const knob = framework === 'react' ? slider.locator('circle').last() : slider.locator('g[data-knob]');
  const box = (await knob.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function expectKeyboardFocus(slider: Locator) {
  await expect(slider).toBeFocused();
  await expect(slider).not.toHaveCSS('outline-style', 'none');
  await expect(slider).not.toHaveCSS('outline-width', '0px');
}

async function tabToSlider(page: Page, slider: Locator) {
  for (let index = 0; index < 20; index++) {
    await page.keyboard.press('Tab');
    if (await slider.evaluate(element => element === document.activeElement)) return;
  }
  throw new Error('Slider was not reachable by Tab');
}

for (const framework of ['react', 'angular', 'vue', 'web-component']) {
  test.describe(framework, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(framework === 'react' ? './' : `./${framework}/`);
      await expect(page.getByRole('slider')).toHaveCSS('opacity', '1');
      await page.getByRole('slider').scrollIntoViewIfNeeded();
    });

    for (const pointerType of ['mouse', 'touch', 'pen']) {
      test.describe(pointerType, () => {
        test.use({ hasTouch: pointerType === 'touch' });
        test(`first ${pointerType} drag has no outline, keyboard focus still works`, async ({ page, context }) => {
          const slider = page.getByRole('slider');
          const from = await knobCenter(slider, framework);
          const before = await slider.getAttribute('aria-valuenow');
          const box = (await slider.boundingBox())!;
          const to = { x: box.x + box.width / 2, y: box.y + box.height - 20 };
          const session = await context.newCDPSession(page);
          if (pointerType === 'mouse') {
            await page.mouse.move(from.x, from.y);
            await page.mouse.down();
            await expect(slider).toHaveCSS('outline-style', 'none');
            await page.mouse.move(to.x, to.y, { steps: 6 });
            await page.mouse.up();
          } else if (pointerType === 'touch') {
            await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [from] });
            await expect(slider).toHaveCSS('outline-style', 'none');
            await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [to] });
            await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
          } else {
            await session.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...from, button: 'left', buttons: 1, pointerType });
            await expect(slider).toHaveCSS('outline-style', 'none');
            await session.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...to, buttons: 1, pointerType });
            await session.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...to, button: 'left', buttons: 0, pointerType });
          }
          await expect(slider).toHaveCSS('outline-style', 'none');
          await expect(slider).not.toHaveAttribute('aria-valuenow', before!);
          // React retains its existing touch-focus behavior; pressing a key focuses it here.
          await slider.press('ArrowUp');
          await expectKeyboardFocus(slider);
          await page.keyboard.press('Tab');
          await page.keyboard.press('Shift+Tab');
          await expectKeyboardFocus(slider);
          const again = await knobCenter(slider, framework);
          await page.mouse.click(again.x, again.y);
          await expect(slider).toHaveCSS('outline-style', 'none');
          if (pointerType === 'mouse') await slider.screenshot({ path: `test-results/focus-${framework}-after-drag.png` });
        });
      });
    }

    test('Tab navigation shows focus without any pointer interaction', async ({ page }) => {
      const slider = page.getByRole('slider');
      await tabToSlider(page, slider);
      await expectKeyboardFocus(slider);
      await page.keyboard.press('ArrowUp');
      await expectKeyboardFocus(slider);
    });
  });
}
