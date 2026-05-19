---
name: model-list-cleanup
description: "Build and run a no-browser-storage webpage for reviewing OpenClaw model catalogs, selecting use/failover models, and collecting action prompts."
---

# Model List Cleanup

Use when cleaning, reviewing, or pruning OpenClaw model configuration with Kelly through an interactive webpage.

## Workflow

1. Look up config schema before reading or changing model config:
   - `agents.defaults.models`
   - `agents.defaults.model`
2. Read the current config with the gateway config tool, or from the local OpenClaw config path if building an offline page.
3. Generate or refresh the review webpage from current config, including:
   - model id and provider
   - what each model is best at
   - three concrete use cases
   - required action prompt when a model checkbox is selected
   - draggable Model Use list
   - draggable Fallback/Failover list capped at 5 models
4. Do not use browser storage. No `localStorage`, `sessionStorage`, IndexedDB, or cookies.
5. Persist review output to a server-side JSON file so the agent can read prompts and act on them.
6. After Kelly saves the page, read the saved JSON and execute the requested model-list actions. Ask only before destructive or externally risky config changes.
7. Validate config changes with schema/config validation before reporting done.

## Local app

Current local implementation:

- Reusable app asset: `assets/model-cleanup-app/`
- Working state directory: `/home/thoder/.echoagent/workspace/model-cleanup/`
- Saved plan: `/home/thoder/.echoagent/workspace/model-cleanup/review-state.json`
- Launch helper: `scripts/launch_model_cleanup.sh`

When sharing the skill, keep `assets/model-cleanup-app/` with it. The helper can run from any checkout by setting `OPENCLAW_CONFIG`, `MODEL_CLEANUP_STATE_DIR`, and `PORT`.

## Self-adjustment rule

After each real run, update `references/learning-log.md` with:

- what confused Kelly or the agent
- any fields that should be added/removed
- which model descriptions were wrong or too generic
- any safer default for use/failover selection
- changes made to the webpage or workflow

Then fold durable improvements back into this skill or the app. Keep the skill lean; put details in references.
