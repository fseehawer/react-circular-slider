import { build } from 'esbuild';
import { rollup } from 'rollup';
import { dts } from 'rollup-plugin-dts';
import { rm } from 'node:fs/promises';

await rm(new URL('../dist', import.meta.url), { recursive: true, force: true });
// Keep Lit's supported browser and SSR implementations in separate, self-contained bundles.
for (const platform of ['browser', 'node']) {
  await build({
    entryPoints: ['src/index.ts', 'src/register.ts'],
    outdir: platform === 'node' ? 'dist/node' : 'dist',
    bundle: true, splitting: true, format: 'esm', platform, target: 'es2022',
    minify: true, legalComments: 'linked',
  });
}
for (const entry of ['index', 'register']) {
  const bundle = await rollup({
    input: `src/${entry}.ts`, plugins: [dts()],
    external: id => /^(?:lit|@lit|lit-html|lit-element)(?:\/|$)/.test(id) || entry === 'register' && id === './index.js',
  });
  await bundle.write({ file: `dist/${entry}.d.ts`, format: 'es' });
  await bundle.close();
}
