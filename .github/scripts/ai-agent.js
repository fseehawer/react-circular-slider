#!/usr/bin/env node

/**
 * AI-powered GitHub Issue Fixer & Code Improver
 *
 * This script reads GitHub issue context (or improvement prompts),
 * sends the relevant source code to an AI model, and applies the
 * suggested changes as file patches.
 *
 * Supported AI providers (set via AI_PROVIDER env var):
 *   - anthropic  (default) — requires ANTHROPIC_API_KEY
 *   - openai                — requires OPENAI_API_KEY
 *
 * Environment variables:
 *   MODE            — "issue" | "improve"
 *   ISSUE_TITLE     — GitHub issue title   (mode=issue)
 *   ISSUE_BODY      — GitHub issue body    (mode=issue)
 *   ISSUE_NUMBER    — GitHub issue number  (mode=issue)
 *   AI_PROVIDER     — "anthropic" | "openai"
 *   ANTHROPIC_API_KEY / OPENAI_API_KEY
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

// ── Configuration ──────────────────────────────────────────────────────────
const ROOT = process.env.GITHUB_WORKSPACE || path.resolve(__dirname, "../..");
const MODE = process.env.MODE || "issue"; // "issue" | "improve"
const AI_PROVIDER = (process.env.AI_PROVIDER || "anthropic").toLowerCase();

// Source files to include as context (relative to ROOT)
const SOURCE_GLOBS = [
  "src/index.ts",
  "src/CircularSlider/index.tsx",
  "src/Knob/index.tsx",
  "src/Knob/index.css",
  "src/Labels/index.tsx",
  "src/Svg/index.tsx",
  "src/hooks/useEventListener.ts",
  "src/hooks/useIsServer.ts",
  "src/redux/reducer.ts",
  "index.d.ts",
  "package.json",
  "tsconfig.json",
];

// ── Helpers ────────────────────────────────────────────────────────────────

function readSourceFiles() {
  const files = {};
  for (const rel of SOURCE_GLOBS) {
    const abs = path.join(ROOT, rel);
    if (fs.existsSync(abs)) {
      files[rel] = fs.readFileSync(abs, "utf-8");
    }
  }
  return files;
}

function buildFileContext(files) {
  return Object.entries(files)
    .map(([name, content]) => `### ${name}\n\`\`\`\n${content}\n\`\`\``)
    .join("\n\n");
}

function buildIssuePrompt(files) {
  const title = process.env.ISSUE_TITLE || "No title";
  const body = process.env.ISSUE_BODY || "No description";
  const number = process.env.ISSUE_NUMBER || "?";
  const ctx = buildFileContext(files);

  return `You are an expert React/TypeScript engineer. You maintain the open-source package "@fseehawer/react-circular-slider".

A user filed GitHub issue #${number}:

**Title:** ${title}

**Description:**
${body}

---

Here is the full source code of the package:

${ctx}

---

Your task:
1. Analyze the issue carefully.
2. Determine which file(s) need changes to fix it.
3. Output ONLY a JSON array of file patches. Each element must have:
   - "file": relative path (e.g. "src/CircularSlider/index.tsx")
   - "changes": array of { "search": "<exact lines to find>", "replace": "<replacement lines>" }
4. If the issue is a feature request, implement a minimal, backward-compatible version.
5. If you cannot fix the issue (e.g. it's a question, not a bug), return an empty array [].

IMPORTANT:
- The "search" strings must be EXACT substrings of the current file content (including whitespace).
- Keep changes minimal and focused.
- Do NOT change the public API in a breaking way.
- Respond with ONLY valid JSON — no markdown fences, no explanation.`;
}

function buildImprovePrompt(files) {
  const ctx = buildFileContext(files);

  return `You are an expert React/TypeScript engineer reviewing the open-source package "@fseehawer/react-circular-slider".

Here is the full source code:

${ctx}

---

Your task: suggest **one small, high-impact improvement** to the codebase. Pick from:
- Performance optimization
- Accessibility (a11y) improvement
- Bug fix for edge cases
- TypeScript type safety improvement
- Code cleanup / dead code removal

Output ONLY a JSON object with:
- "title": short description of the improvement (max 80 chars)
- "description": 1-3 sentence explanation
- "patches": array of file patches, each with:
  - "file": relative path
  - "changes": array of { "search": "<exact lines to find>", "replace": "<replacement lines>" }

IMPORTANT:
- The "search" strings must be EXACT substrings of the current file content.
- Keep changes minimal, focused, and backward-compatible.
- Respond with ONLY valid JSON — no markdown fences, no explanation.`;
}

// ── AI API Calls ───────────────────────────────────────────────────────────

function callAPI(prompt) {
  if (AI_PROVIDER === "openai") return callOpenAI(prompt);
  return callAnthropic(prompt);
}

function callAnthropic(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const req = https.request(
      {
        hostname: "api.anthropic.com",
        path: "/v1/messages",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (json.error) {
              reject(new Error(`Anthropic API error: ${JSON.stringify(json.error)}`));
              return;
            }
            const text = json.content?.[0]?.text || "";
            resolve(text);
          } catch (e) {
            reject(new Error(`Failed to parse API response: ${e.message}\nRaw: ${data}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function callOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 8192,
      temperature: 0.2,
    });

    const req = https.request(
      {
        hostname: "api.openai.com",
        path: "/v1/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (json.error) {
              reject(new Error(`OpenAI API error: ${JSON.stringify(json.error)}`));
              return;
            }
            const text = json.choices?.[0]?.message?.content || "";
            resolve(text);
          } catch (e) {
            reject(new Error(`Failed to parse API response: ${e.message}\nRaw: ${data}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ── Patch Application ──────────────────────────────────────────────────────

function applyPatches(patches) {
  let applied = 0;
  let skipped = 0;

  for (const patch of patches) {
    const filePath = path.join(ROOT, patch.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠ File not found: ${patch.file} — skipping`);
      skipped++;
      continue;
    }

    let content = fs.readFileSync(filePath, "utf-8");
    let fileChanged = false;

    for (const change of patch.changes) {
      if (content.includes(change.search)) {
        content = content.replace(change.search, change.replace);
        fileChanged = true;
        console.log(`✓ Applied change in ${patch.file}`);
      } else {
        console.warn(`⚠ Search string not found in ${patch.file} — skipping change`);
        skipped++;
      }
    }

    if (fileChanged) {
      fs.writeFileSync(filePath, content, "utf-8");
      applied++;
    }
  }

  return { applied, skipped };
}

function parseAIResponse(text) {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "");
  return JSON.parse(cleaned);
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🤖 AI Code Agent — mode: ${MODE}, provider: ${AI_PROVIDER}`);

  const files = readSourceFiles();
  console.log(`📂 Loaded ${Object.keys(files).length} source files`);

  const prompt = MODE === "improve" ? buildImprovePrompt(files) : buildIssuePrompt(files);
  console.log(`📝 Prompt length: ${prompt.length} chars`);

  console.log("🔮 Calling AI API...");
  const response = await callAPI(prompt);
  console.log(`📨 Response length: ${response.length} chars`);

  // Parse response
  const parsed = parseAIResponse(response);

  if (MODE === "improve") {
    // Improve mode returns { title, description, patches }
    console.log(`\n💡 Improvement: ${parsed.title}`);
    console.log(`   ${parsed.description}`);

    if (!parsed.patches || parsed.patches.length === 0) {
      console.log("No patches suggested.");
      // Write outputs for GitHub Actions
      writeOutput("has_changes", "false");
      return;
    }

    const result = applyPatches(parsed.patches);
    console.log(`\n✅ Applied: ${result.applied}, Skipped: ${result.skipped}`);

    writeOutput("has_changes", result.applied > 0 ? "true" : "false");
    writeOutput("title", parsed.title);
    writeOutput("description", parsed.description);
  } else {
    // Issue mode returns array of patches (or empty)
    if (Array.isArray(parsed) && parsed.length === 0) {
      console.log("AI determined no code changes are needed for this issue.");
      writeOutput("has_changes", "false");
      return;
    }

    const patches = Array.isArray(parsed) ? parsed : parsed.patches || [];
    const result = applyPatches(patches);
    console.log(`\n✅ Applied: ${result.applied}, Skipped: ${result.skipped}`);

    writeOutput("has_changes", result.applied > 0 ? "true" : "false");
  }
}

function writeOutput(name, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    fs.appendFileSync(outputFile, `${name}=${value}\n`);
  }
  // Also log for local testing
  console.log(`OUTPUT: ${name}=${value}`);
}

main().catch((err) => {
  console.error("❌ Fatal error:", err.message);
  process.exit(1);
});
