import { expect, test } from '@playwright/test';

for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
  test(`framework themes and navigation at ${viewport.width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize(viewport);
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('color', 'rgb(8, 126, 164)');
    await expect(page.getByRole('tab', { name: 'Temperature', exact: true })).toHaveCSS('border-bottom-color', 'rgb(8, 126, 164)');
    await expect(page.getByRole('slider')).toBeVisible();
    await expect(page.getByRole('slider')).toHaveCSS('opacity', '1');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/react-${viewport.width}.png`, fullPage: true });
    await expect(page.getByRole('link', { name: 'Angular demos' })).toHaveCount(0);
    await page.goto('./angular/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('color', 'rgb(195, 0, 47)');
    await expect(page.getByRole('tab', { name: 'Range', exact: true })).toHaveCSS('border-bottom-color', 'rgb(195, 0, 47)');
    await expect(page.getByRole('slider')).toBeVisible();
    await expect(page.locator('main')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    if (viewport.width < 768) await page.getByRole('button', { name: 'View Code Sample' }).click();
    await expect(page.getByRole('button', { name: 'Copy code' })).toBeVisible();
    await expect(page.locator('.code-sample')).toHaveCSS('background-color', 'rgb(15, 23, 42)');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/angular-${viewport.width}.png`, fullPage: true });
    await page.getByRole('tab', { name: 'Arc Gauge', exact: true }).click();
    const stops = page.locator('linearGradient').first().locator('stop');
    await expect(stops.first()).toHaveAttribute('stop-color', '#22c55e');
    await expect(stops.last()).toHaveAttribute('stop-color', '#ef4444');
    await page.getByRole('link', { name: 'React demos' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('React Circular Slider');
    expect(errors).toEqual([]);
  });
}
