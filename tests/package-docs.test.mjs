import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const packages = [
  { folder: '', name: '@fiojs/react-circular-slider', demo: '' },
  { folder: 'angular/projects/ng-circular-slider/', name: '@fiojs/ng-circular-slider', demo: 'angular/' },
  { folder: 'vue/', name: '@fiojs/vue-circular-slider', demo: 'vue/' },
  { folder: 'web-component/', name: '@fiojs/wc-circular-slider', demo: 'web-component/' },
];

for (const { folder, name, demo } of packages) {
  test(`${name} links to its own demo and installs the correct package`, async () => {
    const directory = new URL(folder, root);
    const manifest = JSON.parse(await readFile(new URL('package.json', directory), 'utf8'));
    const readme = await readFile(new URL('README.md', directory), 'utf8');
    const homepage = `https://fseehawer.github.io/react-circular-slider/${demo}`;
    assert.equal(manifest.name, name);
    assert.equal(manifest.homepage, homepage);
    assert.ok(readme.slice(0, 1200).includes(`](${homepage})`), 'Put the live demo link near the top');
    assert.ok(readme.includes(`npm install ${name}`));
    const examplePackages = [...readme.matchAll(/\b(?:from\s*|import\s*|npm install\s*)['"]?(@fiojs\/[\w-]+)/g)].map(match => match[1]);
    assert.ok(examplePackages.length > 0);
    assert.ok(examplePackages.every(example => example === name), 'Examples must use this framework package');
    if (folder === 'vue/') {
      const visibleText = readme.replace(/\]\([^)]*\)/g, ']');
      assert.doesNotMatch(visibleText, /react-circular-slider|\bReact\b|\bAngular\b/);
    }
  });
}
