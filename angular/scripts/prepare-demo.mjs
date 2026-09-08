import { cpSync, existsSync, lstatSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspace = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = resolve(workspace, 'demo/node_modules/@fiojs/ng-circular-slider');
if (!existsSync(resolve(workspace, 'demo/node_modules/@angular/core'))) {
  throw new Error('Install the Angular 22 demo dependencies first: npm --prefix angular/demo ci');
}
if (existsSync(target) && lstatSync(target).isSymbolicLink()) {
  throw new Error('Reinstall demo dependencies with install-links=true so it uses its own Angular runtime.');
}
// Copy the APF build into the demo so its peer imports resolve to Angular 22, not the library compiler.
mkdirSync(target, { recursive: true });
cpSync(resolve(workspace, 'dist/ng-circular-slider'), target, { recursive: true });
