import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import CircularSlider, { CircularSlider as NamedSlider } from '../dist/index.js';

assert.equal(CircularSlider, NamedSlider);
assert.equal(typeof globalThis.window, 'undefined');
const html = await renderToString(createSSRApp({ render: () => h(CircularSlider, { modelValue: 42, max: 100 }) }));
assert.match(html, /aria-valuenow="42"/);
const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
assert.equal(manifest.name, '@fiojs/vue-circular-slider');
assert.equal(manifest.exports['./style.css'], './dist/style.css');
assert.equal(manifest.peerDependencies.vue, '^3.5.0');
for (const name of await readdir(new URL('../dist/', import.meta.url))) {
  const content = await readFile(new URL(`../dist/${name}`, import.meta.url), 'utf8');
  assert.doesNotMatch(content, /(?:from\s*|import\s*)["'][^"']*(?:\.\.\/|\.css)|@angular|from ["']react["']/);
}
const declarations = await readFile(new URL('../dist/index.d.ts', import.meta.url), 'utf8');
assert.match(declarations, /T extends SliderValue/);
assert.match(declarations, /CircularSliderProps/);
assert.match(await readFile(new URL('../dist/style.css', import.meta.url), 'utf8'), /prefers-reduced-motion/);
console.log('Package checks passed: ESM/default/named exports, bundled types/math, explicit CSS, and Node SSR.');
