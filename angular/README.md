# Angular Workspace

Native Angular implementation of `@fiojs/ng-circular-slider`. The React library at the repository root remains a separate package.

- [Package documentation](projects/ng-circular-slider/README.md)
- [Angular demos](https://fseehawer.github.io/react-circular-slider/angular/)

## Development

Use Node 24.15+ (or Node 22.22.3+) for the Angular 22 Signal Forms demo. The separate Angular 20 library compiler preserves compatibility with Angular 20, 21, and 22; library-only checks also work on Node 20.19+.

From the repository root:

```bash
npm --prefix angular ci
npm --prefix angular run build
npm --prefix angular/demo ci
npm --prefix angular run dev -- --port 5180
```

The demo is served at `http://127.0.0.1:5180/react-circular-slider/angular/`. It uses Angular 22 Signal Forms for every form, without Zone.js, Reactive Forms, or `ngModel`. The demo imports a copy of the built library, never its TypeScript sources; `prepare-demo.mjs` refreshes that copy before development and production builds so peer dependencies resolve to the demo's own Angular runtime. Restart `dev` after changing the library.

## Verification

```bash
npm --prefix angular run build
npm --prefix angular test
npm --prefix angular exec -- playwright install chromium
npm --prefix angular run test:browser
npm --prefix angular run test:pages
npm --prefix angular run test:consumer -- 21
npm --prefix angular run test:consumer -- 22 --browser
```

For a system Chrome install, set `SLIDER_CHROME_PATH` to its executable when running the browser tests. Set `SLIDER_TEST_URL` to test an already running demo, including an installed consumer app. Consumer checks pack the distribution, install it into a temporary Angular app with no source path aliases, and compile that app. Geometry, server rendering, forms, pointer interaction, keyboard behavior, and mobile layout are covered separately.

The Angular 22 consumer also compiles a Signal Forms example. `--browser` runs both the shared demo suite and the Signal Forms integration test against that installed package. Tests cover signal input updates, index and value synchronization, and programmatic form writes without output feedback loops.

## Release

The Angular library has an independent version in `projects/ng-circular-slider/package.json`. Update it before publishing a new release; do not change the React version for an Angular-only release.

```bash
npm --prefix angular run build
npm --prefix angular test
npm --prefix angular run publish:package
```

The `publish:package` script publishes `angular/dist/ng-circular-slider`, not the private workspace. The GitHub Actions **Publish Angular package** workflow can also bump and publish from `master`; its `NPM_TOKEN` needs write access to `@fiojs/ng-circular-slider`.

To deploy both demo sites with the existing repository script, install both workspaces first:

```bash
npm ci
npm --prefix angular ci
npm --prefix angular run build
npm --prefix angular/demo ci
npm run gh-pages
```

`npm run build-demo` builds the React demo first, then adds the Angular demo under `build/angular`, so each deployment retains both sites.
