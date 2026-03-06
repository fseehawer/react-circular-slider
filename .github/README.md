# GitHub Actions & AI Automation

This project uses GitHub Actions for CI/CD and AI-powered automation.

## Workflows

### 1. CI (`ci.yml`)
- **Trigger:** Push to main/master, PRs
- **What:** Builds the library and demo, runs TypeScript checks across Node 18/20/22

### 2. Deploy Demo (`deploy-demo.yml`)
- **Trigger:** Push to main/master, manual
- **What:** Builds the Vite demo app and deploys to GitHub Pages

### 3. Publish to npm (`publish.yml`)
- **Trigger:** GitHub Release published, or manual with version bump selector
- **What:** Builds the library and publishes to npm with provenance

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
| `NPM_TOKEN` | npm publish | [npm tokens](https://docs.npmjs.com/creating-and-viewing-access-tokens) |
| `ANTHROPIC_API_KEY` | AI workflows (default) | [Anthropic Console](https://console.anthropic.com/) |
| `OPENAI_API_KEY` | AI workflows (alternative) | [OpenAI Platform](https://platform.openai.com/) |

### Repository Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_PROVIDER` | `anthropic` | AI provider: `anthropic` or `openai` |

### GitHub Pages Setup

1. Go to **Settings → Pages**
2. Set **Source** to **GitHub Actions**

### How to Configure

1. **Add secrets** in your repo: Settings → Secrets and variables → Actions → New repository secret
2. **Add variables** (optional): Settings → Secrets and variables → Actions → Variables tab
3. **Enable GitHub Pages**: Settings → Pages → Source: GitHub Actions
4. **Push to main** — CI and demo deployment will run automatically

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
