import { expect, test, type Locator } from '@playwright/test';

async function expectCentered(slider: Locator) {
  const value = slider.locator('[data-slider-value]:visible');
  await expect(value).toBeVisible();
  await expect.poll(async () => {
    const dialBox = await slider.boundingBox();
    const valueBox = await value.boundingBox();
    if (!dialBox || !valueBox) return Infinity;
    return Math.max(
      Math.abs(valueBox.x + valueBox.width / 2 - dialBox.x - dialBox.width / 2),
      Math.abs(valueBox.y + valueBox.height / 2 - dialBox.y - dialBox.height / 2),
    );
  }, { message: 'value center must match dial center on both axes' }).toBeLessThan(1);
}

for (const framework of ['react', 'angular', 'vue', 'web-component']) {
  for (const width of [1280, 390]) {
    test(`${framework} values stay centered in every example at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(framework === 'react' ? './' : `./${framework}/`);
      const tabs = await page.getByRole('tab').allTextContents();
      for (const name of tabs) {
        const tab = page.getByRole('tab', { name, exact: true });
        await tab.click();
        await expect(tab).toHaveAttribute('aria-selected', 'true');
        const slider = page.getByRole('slider');
        await expect(slider).toHaveCSS('opacity', '1');
        await expectCentered(slider);
        await slider.screenshot({ path: `test-results/centering-${framework}-${name.trim().toLowerCase().replaceAll(' ', '-')}-${width}.png` });
        for (const key of ['Home', 'ArrowUp', 'End']) {
          await slider.press(key);
          await expectCentered(slider);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    });
  }
}

test('web component affixes and label position never move the number', async ({ page }) => {
  await page.goto('./web-component/');
  const slider = page.getByRole('slider');
  for (const labelBottom of [false, true]) {
    for (const value of [0, 9, 34, 100]) {
      await slider.evaluate(async (element: HTMLElement & { updateComplete: Promise<unknown> }, options) => {
        Object.assign(element, options);
        await element.updateComplete;
      }, { labelBottom, value, label: 'A longer volume label', prependToValue: '$', appendToValue: ' km/h', verticalOffset: '1rem' });
      await expectCentered(slider);
      const labelBox = (await slider.locator('[part="label"]').boundingBox())!;
      const numberBox = (await slider.locator('[data-slider-value]').boundingBox())!;
      if (labelBottom) expect(labelBox.y).toBeGreaterThan(numberBox.y + numberBox.height);
      else expect(labelBox.y + labelBox.height).toBeLessThan(numberBox.y);
    }
  }
});
