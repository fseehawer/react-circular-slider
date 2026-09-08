import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { CircularSliderElement, registerCircularSlider } from '@fiojs/wc-circular-slider';

test('root and register imports are safe in plain Node without browser globals', async () => {
  assert.equal(typeof globalThis.window, 'undefined');
  assert.equal(typeof globalThis.document, 'undefined');
  // Lit may provide a Node registry shim, but our entries must not define a component there.
  assert.equal(globalThis.customElements?.get('fio-circular-slider'), undefined);
  assert.equal(typeof CircularSliderElement, 'function');
  assert.equal(registerCircularSlider(), undefined);
  await import('@fiojs/wc-circular-slider/register');
  await import('@fiojs/wc-circular-slider/register');
  assert.equal(globalThis.customElements?.get('fio-circular-slider'), undefined);
});

test('server can instantiate and configure the Lit-provided base class', () => {
  const slider = new CircularSliderElement();
  slider.value = 42;
  slider.max = 100;
  assert.equal(slider.value, 42);
  assert.equal(slider.disabledState, false);
  assert.equal(slider.form, null);
});

test('dist has no source-worktree imports and browser bundles have no bare imports', async () => {
  for (const name of await readdir(new URL('../dist/', import.meta.url))) {
    if (!/\.(?:js|ts)$/.test(name)) continue;
    const source = await readFile(new URL(`../dist/${name}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /(?:\.\.\/)+(?:shared|src|angular)\//);
    if (name.endsWith('.js')) {
      const parsed = ts.createSourceFile(name, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
      for (const statement of parsed.statements) {
        if (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) {
          const specifier = statement.moduleSpecifier;
          if (specifier && ts.isStringLiteral(specifier)) assert.ok(specifier.text.startsWith('./'), specifier.text);
        }
      }
    }
  }
});

test('root and register share one declaration identity with skipLibCheck false', async () => {
  const registration = await readFile(new URL('../dist/register.d.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(registration, /declare class|declare global/);
  const result = spawnSync(process.execPath, [
    fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url)),
    '--noEmit', '--strict', '--skipLibCheck', 'false', '--target', 'ES2022',
    '--module', 'NodeNext', '--moduleResolution', 'NodeNext',
    fileURLToPath(new URL('./fixtures/entry-types.ts', import.meta.url)),
  ], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
