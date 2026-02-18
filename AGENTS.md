# Editor Demo Working Plan

## Goal
Ship a credible editor demo that shows end-to-end value with minimal setup friction.

## Scope for Demo
- Open and render real rich-text content in the editor.
- Support core editing flow: edit content in a single field.
- Keep implementation minimal: one reusable shadcn-style component.
- Keep UX stable on desktop and usable on mobile.

## Non-Goals (for Demo Phase)
- Full plugin ecosystem.
- Deep performance optimization beyond obvious bottlenecks.
- Large-scale permission/role matrix.

## Milestones
1. Baseline
- Define demo scenario and success criteria.
- Confirm data shape and loading path.
- Stand up the editor shell and routing.

2. Core Editing
- Implement content loading into editable state.
- Add editor primitive as a reusable UI component.
- Keep API minimal (`value`, `onChange`, optional `disabled`).

3. Demo Quality
- Provide a minimal one-page demo in Vite + React.
- Document required dependencies clearly for external usage.

4. Hardening
- Test critical paths manually (happy path + key failures).
- Fix highest-impact UX and reliability bugs.
- Prepare short demo script and fallback path.

## Working Rules
- Prioritize visible, demo-relevant outcomes over broad architecture work.
- Keep PRs small and vertical (UI + logic + basic test where possible).
- Do not break existing app flows outside `editor/` scope.
- Document assumptions quickly in commit messages or this file.
- Keep implementation typed (TypeScript, strict mode), including component props and helper types.
- Keep code lean: prefer the smallest clear abstraction, avoid speculative layers, and remove dead code.
- Manage dependencies with npm commands (`npm install`, `npm update`, `npm uninstall`) instead of manually editing `package.json`.
- After dependency or editor behavior changes, run at least `npm run build` before considering work done.
- Prefer explicit compatibility checks when upgrading major versions (verify peer deps and lockfile resolution).

## Definition of Done (Demo)
- A first-time viewer can complete the scripted flow without intervention.
- Component usage and dependency requirements are clear.
- No obvious blocker bugs in the chosen demo path.

## Tracking
- Keep an up-to-date checklist in this file while implementing.
- Mark status with: `[ ]`, `[~]`, `[x]`.

### Current Checklist
- [x] Finalize demo scenario and script.
- [x] Implement baseline editor screen.
- [x] Implement create/edit flow.
- [x] Add one advanced capability.
- [~] Run manual demo rehearsal and polish.
