# Model List Cleanup Learning Log

Use this file to keep the workflow self-adjusting over time.

## 2026-05-18 initial build

- Built a server-backed page instead of static-only HTML so prompts are available to the agent without browser storage.
- Main state path: `/home/thoder/.echoagent/workspace/model-cleanup/review-state.json`.
- Initial metadata is heuristic, based on provider/model names and any configured provider catalog fields.
- Follow-up improvement likely needed: replace generic heuristics with measured model performance notes after Kelly reviews the list.
