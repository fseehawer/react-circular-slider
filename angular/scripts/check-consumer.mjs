import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspace = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const major = Number(process.argv[2] ?? 22);
assert.ok([20, 21, 22].includes(major), 'Supported consumer versions are 20, 21 and 22');
const consumer = mkdtempSync(join(tmpdir(), `ng-circular-slider-consumer-${major}-`));
const run = (command, args, cwd = consumer) => execFileSync(command, args, {
  cwd, stdio: 'inherit', env: { ...process.env, PATH: `${dirname(process.execPath)}${delimiter}${process.env.PATH}`, NG_BUILD_MAX_WORKERS: '2' },
});
const packed = JSON.parse(execFileSync('npm', ['pack', './dist/ng-circular-slider', '--json', '--pack-destination', consumer], {
  cwd: workspace, encoding: 'utf8',
}));
const dependencies = {
  '@fiojs/ng-circular-slider': `file:${join(consumer, packed[0].filename)}`,
  rxjs: '^7.8.2', tslib: '^2.8.1',
};
for (const name of ['common', 'compiler', 'core', 'forms', 'platform-browser', 'compiler-cli', 'build', 'cli']) {
  dependencies[`@angular/${name}`] = `^${major}.0.0`;
}
dependencies.typescript = major === 22 ? '~6.0.0' : '~5.9.3';
writeFileSync(join(consumer, 'package.json'), JSON.stringify({ private: true, dependencies }, null, 2));
cpSync(join(workspace, 'demo'), join(consumer, 'demo'), { recursive: true });
const config = JSON.parse(readFileSync(join(workspace, 'angular.json'), 'utf8'));
config.projects.demo.architect.build.options.outputPath = { base: 'dist', browser: '' };
if (major === 22) {
  cpSync(join(workspace, 'tests/fixtures/signal-forms.ts'), join(consumer, 'demo/signal-forms.ts'));
  config.projects.signals = structuredClone(config.projects.demo);
  const options = config.projects.signals.architect.build.options;
  options.browser = 'demo/signal-forms.ts';
  const signalTsconfig = JSON.parse(readFileSync(join(consumer, 'demo/tsconfig.app.json'), 'utf8'));
  signalTsconfig.files = ['signal-forms.ts'];
  writeFileSync(join(consumer, 'demo/tsconfig.signals.json'), JSON.stringify(signalTsconfig, null, 2));
  options.tsConfig = 'demo/tsconfig.signals.json';
  options.outputPath = { base: 'dist/signals', browser: '' };
  options.baseHref = '/react-circular-slider/angular/signals/';
  config.projects.signals.architect.serve.options.buildTarget = 'signals:build:development';
}
writeFileSync(join(consumer, 'angular.json'), JSON.stringify(config, null, 2));
const tsconfig = JSON.parse(readFileSync(join(workspace, 'tsconfig.json'), 'utf8'));
delete tsconfig.compilerOptions.paths;
writeFileSync(join(consumer, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund']);
run(process.execPath, [join(consumer, 'node_modules/@angular/cli/bin/ng.js'), 'build', 'demo']);
if (major === 22) {
  run(process.execPath, [join(consumer, 'node_modules/@angular/cli/bin/ng.js'), 'build', 'signals']);
  if (process.argv.includes('--browser')) {
    process.env.SLIDER_CONSUMER_DIR = consumer;
    run(process.execPath, [join(workspace, 'node_modules/@playwright/test/cli.js'), 'test'], workspace);
    process.env.SLIDER_SIGNAL_FORMS = '1';
    run(process.execPath, [join(workspace, 'node_modules/@playwright/test/cli.js'), 'test'], workspace);
  }
}
const manifest = JSON.parse(readFileSync(join(consumer, 'node_modules/@fiojs/ng-circular-slider/package.json'), 'utf8'));
assert.equal(manifest.name, '@fiojs/ng-circular-slider');
assert.equal(manifest.peerDependencies.react, undefined);
console.log(`Angular ${major} installed-package application build passed: ${consumer}`);
