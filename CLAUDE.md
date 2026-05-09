# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**myLMS** is a "Neuro-Cognitive Aware Personalized LMS" being built for an **education hackathon**. The core deliverable is an AI recommendation engine that creates individualized learning plans and tailored course selections based on a learner's neurocognitive profile.

The team is distributed across tools: architecture and research happening in **Antigravity** (Luis's workspace, using Claude Opus), and this workspace (**Siddharth's**) handles technical research and implementation decisions. Coordination happens via shared files in `_workspace/` committed to GitHub.

## Workspace Collaboration Convention

**Always read `_workspace/collaboration_log.md` first** — it tracks what every team member and AI agent has done, decisions made, and open questions. Append your own session work there using the format:

```
### YYYY-MM-DD | [Name] (Agent: [model])
```

Only mark decisions ✅ confirmed after explicit team approval.

Key workspace files:
- `_workspace/collaboration_log.md` — Session log; read first, append your work
- `_workspace/research_analysis.md` — Synthesis of 25+ research papers; the theoretical foundation
- `_workspace/response_to_comments.md` — Detailed answers to open questions on the research

## Confirmed Architecture Decisions

These are team-approved and should not be revisited without instruction:

| # | Decision |
|---|----------|
| 1 | **5-domain cognitive profiling**: Attention/WM, Executive Functions, Memory, Visuospatial, Language — composite z-scores + Latent Cluster Analysis (modeled on Andújar-Castillo et al.) |
| 2 | **Reject MBTI and Learning Styles** as primary classifiers (poor psychometric validity) |
| 3 | **Motivational layer**: CUTRICE framework (Serice's neuro-prism, grounded in SDT) + Ikigai for career-alignment |
| 4 | **ABCD Asset Mapping** philosophy: strengths-first, never deficit-framing |
| 5 | **Two-stage lifecycle**: Discovery (confidence-gated) → Commitment (time-bounded) |
| 6 | **Cold-start flow**: Survey → Video → Handwritten Notes → AI Audio Chat → Optional micro-assessments |
| 7 | **Handwriting pipeline**: Google Vision API → LLM structured scoring |
| 8 | **Recommendation engine**: Contextual bandits + Thompson Sampling for diversity |
| 9 | **Profile evolution**: Informal signals (journals, artifacts, behavioral data) — not traditional tests |
| 10 | **Human coach layer**: Deferred to V2 |

## Technical Platform Options (Pending Decision)

Research done in `~/.claude/plans/we-are-building-an-concurrent-puzzle.md`. Three viable approaches:

- **Option A — Moodle + AI Plugin**: Fastest setup via Docker, built-in AI subsystem (4.5+), 700+ web service functions, create a local plugin + AI Placement for recommendations. Best for hackathon speed.
- **Option B — Wellms (Headless) + Next.js**: API-first Laravel backend, full frontend control, modern stack aligned with AI/ML tooling. Best if the Antigravity architecture favors a custom frontend.
- **Option C — LTI Tool**: Platform-agnostic standalone app, plugs into any LMS via LTI 1.3. Best if portability/interoperability matters to judges.

**Next step**: Wait for architecture decisions from the Antigravity chat before committing to a platform.

## What Can Start Now (Platform-Independent)

Per the plan, these are unblocked:
1. Define **learner profile schema** (cognitive domain scores, goals, pace, motivational profile)
2. Define **course metadata schema** (difficulty, prerequisites, topics, cognitive demand tags, duration)
3. Build **recommendation logic** — Claude API for reasoning about learner-course matches

## System Architecture (V1 — from Antigravity research)

Three-tier flow: **Profile → Path → Delivery** with continuous feedback loop.

- **Layer 1 — Learner Intake**: Cold-start experience collecting multi-modal profile signals
- **Layer 2 — AI Metacognition Analyzer**: Builds cognitive domain scores from inputs
- **Layer 3 — AI Curriculum Architect**: Maps profile to learning path via contextual bandits (RL)
- **Layer 4 — Delivery**: Personalized content with adaptive pacing
- **Layer 5 — Feedback Loop**: Behavioral signals update profile continuously

The ERD and system diagram: `_workspace/Learner Intelligence System architecture and ERD.pdf`

## Open Questions

Check `_workspace/response_to_comments.md` before proposing solutions in these areas:
1. Video library curation — who creates intake videos?
2. Course tagging with cognitive demand profiles — manual or AI-assisted?
3. "Success" definition for RL reward signal
4. Data privacy architecture (FERPA/GDPR compliance)
5. Validation cohort (20–30 pilot learners for pilot study)
