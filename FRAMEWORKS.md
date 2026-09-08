# Circular Slider Packages

Each framework has its own native package, public API, distribution, and version. React and Angular are not required by the Vue or Web Component packages.

| Framework | Package | Source | Demo Path |
| --- | --- | --- | --- |
| React | `@fiojs/react-circular-slider` | [README](README.md) | `/react-circular-slider/` |
| Angular | `@fiojs/ng-circular-slider` | [README](angular/projects/ng-circular-slider/README.md) | `/react-circular-slider/angular/` |
| Vue | `@fiojs/vue-circular-slider` | [README](vue/README.md) | `/react-circular-slider/vue/` |
| Web Component | `@fiojs/wc-circular-slider` | [README](web-component/README.md) | `/react-circular-slider/web-component/` |

The new Vue and Web Component packages share DOM-free geometry from `shared/slider-math.ts`. Each build bundles that code into its own distribution; consumers do not need a separate shared package. Existing React and Angular implementations remain independent.

## Setup

Use Node 24.15+ for all build tools, including the Angular 22 demo.

```bash
npm ci
npm --prefix angular ci
npm --prefix angular run build
npm --prefix angular/demo ci
npm --prefix vue ci
npm --prefix web-component ci
```

## Build and Preview

```bash
npm run build
npm run build:angular
npm run build:vue
npm run build:web-component
npm run build-demo
npm exec vite -- preview --config vite.demo.config.js --host 127.0.0.1 --port 5190
```

The combined demo build starts with React, which clears `build`, and then adds the other three sites. Do not run `build-demo:react` alone before deploying: that would remove the other demos. Framework-specific development commands are in each package README.

## Verification

```bash
npx tsc --noEmit
npm run test:shared
npm --prefix angular test
npm --prefix vue test
npm --prefix web-component test
npx playwright install chromium
npm run test:frameworks
npm run test:layout
npm run test:consumers -- --browser
npm --prefix angular run test:browser
npm --prefix angular run test:pages
```

`test:frameworks` builds the Vue and Web Component demos and tests their browser interactions and desktop/mobile layouts. `test:consumers` packs each package, installs the tarballs in an isolated application, checks imports and declarations, and builds a real consumer. Add `--browser` to verify the installed components' behavior. No consumer build can resolve the repository's TypeScript source through aliases.

`test:layout` builds all four demos and verifies that each displayed value stays centered on both axes, including affixes, bottom labels, custom templates, and desktop/mobile viewports.

Set `SLIDER_CHROME_PATH` to a local Chrome executable to use an existing browser. `SLIDER_FRAMEWORK_URL` points the shared browser suite at an already running combined preview; `SLIDER_LAYOUT_URL` does the same for the centering suite.

## Independent Releases

Bump only the package being released. The React version lives in the root `package.json`, Angular in `angular/projects/ng-circular-slider/package.json`, Vue in `vue/package.json`, and the Web Component in `web-component/package.json`. Update the corresponding lockfile after a version change.

```bash
npm run publish:angular
npm run publish:vue
npm run publish:web-component
```

These commands build and publish the selected package publicly. They require an npm account with publishing access to the `fiojs` organization. Publishing a package does not deploy the demo pages.

After reviewing and committing source changes, the existing Pages deployment script rebuilds and commits all demo assets, then pushes the `build` subtree:

```bash
npm run gh-pages
```

Source pushes to `master` also run the configured GitHub Actions deployment. Do not publish from a worktree containing unreviewed changes.
