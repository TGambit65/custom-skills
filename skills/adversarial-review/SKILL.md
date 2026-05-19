---
name: adversarial-review
description: Perform forced-skeptical review of an artifact by assuming issues exist and surfacing concrete problems. Use when reviewing code, architecture, specs, prompts, skills, security posture, or implementation quality and a normal “looks good” pass is not enough.
---

# Adversarial Review

Review as if problems are present and your job is to find them.

## Use when
- Reviewing PRs or code changes
- Reviewing specs, prompts, architecture, or skills
- Checking implementation readiness
- Auditing security or reliability decisions

## Rules
- Do not default to "looks good"
- Search for omissions, contradictions, weak assumptions, and drift
- Prefer specific findings over vague concerns
- Rank by severity when possible
- If you truly find nothing material, say what you checked and why confidence is still limited

## Output shape
Use:
1. Severity
2. Exact issue
3. Why it matters
4. Suggested fix

## Prompts to apply internally
- What is missing?
- What breaks under scale, concurrency, or bad input?
- Where could two agents make conflicting decisions?
- What assumptions were smuggled in without proof?
- What would an attacker or cynical reviewer notice first?

Read `references/checklist.md` for a reusable review checklist.
