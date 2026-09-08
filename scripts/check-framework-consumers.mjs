import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const consumer = mkdtempSync(join(tmpdir(), 'circular-slider-consumer-'));
const readPackage = folder => JSON.parse(readFileSync(join(root, folder, 'package.json'), 'utf8'));
const vuePackage = readPackage('vue');
const rootPackage = readPackage('.');
const dependencies = { vue: vuePackage.peerDependencies.vue };
for (const folder of ['vue', 'web-component']) {
  const manifest = readPackage(folder);
  const [packed] = JSON.parse(execFileSync('npm', ['pack', '--json', '--pack-destination', consumer], {
    cwd: join(root, folder), encoding: 'utf8',
  }));
  assert.ok(packed.files.some(file => file.path.startsWith('dist/') && file.path.endsWith('.js')));
  assert.ok(packed.files.some(file => file.path.endsWith('.d.ts')));
  assert.ok(!packed.files.some(file => /^(demo|src|node_modules|tests)\//.test(file.path)), 'Only distributions and package docs should ship');
  dependencies[manifest.name] = `file:${join(consumer, packed.filename)}`;
}
const run = (command, args) => execFileSync(command, args, { cwd: consumer, stdio: 'inherit' });
writeFileSync(join(consumer, 'package.json'), JSON.stringify({
  private: true, type: 'module', dependencies,
  devDependencies: {
    vite: vuePackage.devDependencies.vite,
    '@vitejs/plugin-vue': vuePackage.devDependencies['@vitejs/plugin-vue'],
    'vue-tsc': vuePackage.devDependencies['vue-tsc'],
    typescript: rootPackage.devDependencies.typescript,
  },
}, null, 2));
writeFileSync(join(consumer, 'index.html'), '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Installed slider packages</title></head><body><main><div id="app"></div></main><script type="module" src="/main.ts"></script></body></html>');
writeFileSync(join(consumer, 'vite.config.js'), "import { defineConfig } from 'vite'; import vue from '@vitejs/plugin-vue'; export default defineConfig({ plugins: [vue()] });\n");
writeFileSync(join(consumer, 'tsconfig.json'), JSON.stringify({
  compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', strict: true, skipLibCheck: false, lib: ['ES2022', 'DOM', 'DOM.Iterable'], types: ['vite/client'], noEmit: true },
  include: ['*.ts', '*.vue'],
}, null, 2));
writeFileSync(join(consumer, 'main.ts'), `import { createApp } from 'vue';
import App from './App.vue';
import '@fiojs/vue-circular-slider/style.css';
import { CircularSliderElement, registerCircularSlider } from '@fiojs/wc-circular-slider';
import '@fiojs/wc-circular-slider/register';
registerCircularSlider();
createApp(App).mount('#app');
const host = document.createElement('section');
host.innerHTML = '<h2>Native form</h2><form id="native"><fieldset><fio-circular-slider name="volume" value="40" min="0" max="100" label="Native volume" track-draggable></fio-circular-slider></fieldset><button type="reset">Reset native</button></form><output id="native-events">0</output><output id="native-event-value"></output>';
document.querySelector('main')!.append(host);
const slider = host.querySelector('fio-circular-slider') as CircularSliderElement;
let events = 0;
slider.addEventListener('input', () => {
  document.querySelector('#native-events')!.textContent = String(++events);
  document.querySelector('#native-event-value')!.textContent = String(new FormData(host.querySelector('form')!).get('volume'));
});
`);
writeFileSync(join(consumer, 'App.vue'), `<script setup lang="ts">
import { ref } from 'vue';
import { CircularSlider } from '@fiojs/vue-circular-slider';
const volume = ref(40);
const size = ref('M');
const updates = ref(0);
</script>
<template>
  <h1>Installed packages</h1>
  <CircularSlider v-model="volume" :min="0" :max="100" label="Vue volume" :track-draggable="true" @update:model-value="updates++" />
  <output id="vue-value">{{ volume }}</output><output id="vue-events">{{ updates }}</output>
  <button @click="volume = 20">Set Vue to 20</button>
  <CircularSlider v-model="size" :data="['S', 'M', 'L']" label="Vue size" />
</template>
`);
run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund']);
run(process.execPath, ['--input-type=module', '-e', `
  import assert from 'node:assert/strict';
  const vue = await import('@fiojs/vue-circular-slider');
  const wc = await import('@fiojs/wc-circular-slider');
  assert.ok(vue.CircularSlider);
  assert.equal(typeof wc.CircularSliderElement, 'function');
  assert.equal(typeof wc.registerCircularSlider, 'function');
  assert.equal(typeof globalThis.document, 'undefined');
  console.log('Both package roots import without browser globals');
`]);
run(process.execPath, ['node_modules/vue-tsc/bin/vue-tsc.js', '--noEmit']);
run(process.execPath, ['node_modules/vite/bin/vite.js', 'build']);

if (process.argv.includes('--browser')) {
  const { chromium, expect } = await import('@playwright/test');
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '5192', '--strictPort'], { cwd: consumer, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  server.stdout.on('data', chunk => { output += chunk; });
  server.stderr.on('data', chunk => { output += chunk; });
  const serverError = new Promise((_, reject) => server.once('error', reject));
  let browser;
  try {
    await Promise.race([serverError, (async () => {
      for (let attempt = 0; attempt < 100; attempt++) {
        if (server.exitCode !== null) throw new Error(`Consumer preview exited: ${output}`);
        try {
          const response = await fetch('http://127.0.0.1:5192', { signal: AbortSignal.timeout(500) });
          if (response.ok) return;
        } catch {
          // Connection failures are expected while the preview server starts.
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      throw new Error(`Consumer preview timed out: ${output}`);
    })()]);
    browser = await chromium.launch(process.env.SLIDER_CHROME_PATH ? { executablePath: process.env.SLIDER_CHROME_PATH } : {});
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:5192');
    const vue = page.getByRole('slider', { name: 'Vue volume', exact: true });
    await expect(vue).toHaveAttribute('aria-valuenow', '40');
    await expect(page.locator('#vue-events')).toHaveText('0');
    await vue.press('ArrowUp');
    await expect(page.locator('#vue-value')).toHaveText('41');
    await expect(page.locator('#vue-events')).toHaveText('1');
    await page.getByRole('button', { name: 'Set Vue to 20' }).click();
    await expect(vue).toHaveAttribute('aria-valuenow', '20');
    await expect(page.locator('#vue-events')).toHaveText('1');
    const native = page.getByRole('slider', { name: 'Native volume', exact: true });
    const formValue = () => page.locator('#native').evaluate(form => new FormData(form).get('volume'));
    await expect(native).toHaveAttribute('aria-valuenow', '40');
    assert.equal(await formValue(), '40');
    await native.press('ArrowUp');
    assert.equal(await formValue(), '41');
    await expect(page.locator('#native-events')).toHaveText('1');
    await expect(page.locator('#native-event-value')).toHaveText('41');
    await native.evaluate(element => { element.value = 65; });
    await expect(native).toHaveAttribute('aria-valuenow', '65');
    assert.equal(await formValue(), '65');
    await expect(page.locator('#native-events')).toHaveText('1');
    await page.locator('fieldset').evaluate(element => { element.disabled = true; });
    await expect(native).toHaveAttribute('aria-disabled', 'true');
    assert.equal(await formValue(), null);
    await page.locator('fieldset').evaluate(element => { element.disabled = false; });
    await expect(native).toHaveAttribute('aria-disabled', 'false');
    await page.getByRole('button', { name: 'Reset native' }).click();
    await expect(native).toHaveAttribute('aria-valuenow', '40');
    assert.equal(await formValue(), '40');
    await expect(page.locator('#native-events')).toHaveText('1');
    assert.deepEqual(errors, []);
    console.log('Installed Vue v-model and native Web Component form checks passed');
  } finally {
    await browser?.close();
    server.kill();
    if (server.exitCode === null) await new Promise(resolve => server.once('exit', resolve));
  }
}
console.log(`Installed consumer build passed: ${consumer}`);
