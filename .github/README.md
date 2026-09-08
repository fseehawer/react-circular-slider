# GitHub Actions & AI Automation

This project uses GitHub Actions for CI/CD and AI-powered automation.

## Workflows

### 1. CI (`ci.yml`)
- **Trigger:** Push to main/master, PRs
- **What:** Builds the library and demo, runs TypeScript checks across Node 20/22/24

### 2. Deploy Demo (`deploy-demo.yml`)
- **Trigger:** Push to main/master, manual
- **What:** Builds the Vite demo app and deploys to GitHub Pages

### 3. Publish to npm (`publish.yml`)
- **Trigger:** GitHub Release published, or manual with version bump selector
- **What:** Builds the library and publishes `@fiojs/react-circular-slider` to npm with provenance

The independent **Publish Angular package** workflow (`publish-angular.yml`) publishes `@fiojs/ng-circular-slider` from `master`. It has its own version bump selector and builds the Angular distribution before publishing. Its publishing token must also allow the Angular package.

### 4. AI Issue Fixer (`ai-fix-issue.yml`)
- **Trigger:** Issue labeled `ai-fix`, or manual with issue number
- **What:** Reads the issue, sends source code + issue context to an AI model, applies suggested fixes, verifies the build, and opens a PR
- **Flow:**
  1. New issue opened → auto-triage adds `ai-fix` label for bugs
  2. AI agent analyzes the issue against the full source code
  3. AI returns file patches → applied to a branch
  4. Build is verified
  5. PR is opened linking to the issue
  6. Bot comments on the issue with status

### 5. AI Code Improvement (`ai-improve.yml`)
- **Trigger:** Weekly (Monday 09:00 UTC), or manual
- **What:** AI reviews the codebase and suggests one focused improvement (performance, a11y, type safety, cleanup)
- **Safeguard:** Skips if there's already an open AI improvement PR

### 6. Auto-Triage (`auto-triage.yml`)
- **Trigger:** New issue opened
- **What:** Analyzes issue title/body and auto-adds labels (`bug`, `enhancement`, `accessibility`, `typescript`, `ai-fix`)

## Setup

### Required Secrets

| Secret | Required For | How to Get |
|--------|-------------|------------|
| `NPM_TOKEN` | npm publish; must allow writing `@fiojs/react-circular-slider` | [npm tokens](https://docs.npmjs.com/creating-and-viewing-access-tokens) |
| `ANTHROPIC_API_KEY` | AI workflows (default) | [Anthropic Console](https://console.anthropic.com/) |
| `OPENAI_API_KEY` | AI workflows (alternative) | [OpenAI Platform](https://platform.openai.com/) |

The publishing npm account must have access to the `fiojs` organization. A token scoped only to the previous `@fseehawer` package cannot publish the new package. The first public release is `@fiojs/react-circular-slider@3.3.8`.

### Repository Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_PROVIDER` | `anthropic` | AI provider: `anthropic` or `openai` |

### GitHub Pages Setup

All four demos are built by `npm run build-demo` on Node 24.15+. React is at the site root, with Angular, Vue, and Web Component demos in their own subdirectories. The Angular 22 Signal Forms demo has its own dependencies under `angular/demo`, separate from the backward-compatible library compiler. CI runs geometry, server-rendering, browser, and installed-consumer checks. See [`FRAMEWORKS.md`](../FRAMEWORKS.md) for installation, development, and independent release commands.

1. Go to **Settings → Pages**
2. Keep **Source** set to **Deploy from a branch**, using `gh-pages` and `/ (root)`, to support the `npm run gh-pages` script.
3. Go to **Settings → Environments → github-pages**. Under **Deployment branches and tags**, choose **Selected branches and tags** and allow the branches `master` and `gh-pages`.

These environment rules also allow the existing GitHub Actions workflow to deploy from `master`. Without them, Pages only accepts deployments from its configured source branch, and the workflow fails even when the script deployment succeeds.

### How to Configure

1. **Add secrets** in your repo: Settings → Secrets and variables → Actions → New repository secret
2. **Add variables** (optional): Settings → Secrets and variables → Actions → Variables tab
3. **Enable GitHub Pages** using the source branch and environment rules above
4. **Push to master** — CI and demo deployment will run automatically

### Manual Triggers

All workflows support `workflow_dispatch` (manual trigger) from the **Actions** tab:

- **AI Issue Fixer**: Enter an issue number to analyze
- **AI Improve**: Run on-demand instead of waiting for the weekly schedule
- **Publish**: Select a version bump type (patch/minor/major)
- **Deploy Demo**: Re-deploy the demo page

## AI Agent Architecture

The AI agent (`.github/scripts/ai-agent.js`) works in two modes:

### Issue Mode
```
Issue opened → Read issue + comments → Bundle source code →
AI analyzes & returns JSON patches → Apply patches → Verify build → Open PR
```

### Improve Mode
```
Weekly schedule → Bundle source code → AI suggests improvement →
Apply patches → Verify build → Open PR
```

The agent supports both Anthropic (Claude) and OpenAI (GPT-4o) as backends, configured via the `AI_PROVIDER` repository variable.
