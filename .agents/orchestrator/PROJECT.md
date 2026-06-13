# Project: Awaking-System Cleanup

## Architecture
- Frontend: Vite + React + TypeScript + Tailwind CSS. Main entry points: `src/App.tsx`, dashboard component `src/components/Dashboard.tsx`, rank component `src/components/Rank.tsx`, and rules component `src/components/Rules.tsx`.
- Backend: Supabase JS Client for database communication.
- Node scripts: Database cleanup scripts running in Node environment (e.g. `reset_quests.js`).

## Code Layout
- `src/App.tsx`: Main routing and layout.
- `src/components/Dashboard.tsx`: Athlete dashboard, quest status updates, data syncing.
- `src/components/Rank.tsx`: Leaderboard component, coach undo actions.
- `src/components/Rules.tsx`: Static rule cards display.
- `src/components/Rehab.tsx` (To be deleted): Gym/rehab component.
- `src/components/Gym.tsx` (To be deleted): Active exercises components.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Baseline | Codebase exploration and baseline build | None | DONE |
| 2 | UI Components Cleanup | R1 UI: Remove Clinic/Rehab/Gym UI & files, Rules card 5 | M1 | DONE |
| 3 | Core Dashboard & Rank Logic | R1/R2/R3 Logic: Update Dashboard.tsx, Rank.tsx, CoachPanel.tsx | M2 | DONE |
| 4 | Database Quest Reset | R4: Run reset_quests.js database script | M3 | IN_PROGRESS |
| 5 | Verification & Audit | Verify build, run tests, and Forensic Audit | M4 | PLANNED |

## Interface Contracts
- Athlete state does not contain `is_injured`.
- Quest rewards are defined under `QUEST_REWARDS` map in `CoachPanel.tsx`, `Rank.tsx`, and relevant components.
- Cumulative XP calculation: `Overall XP = cumulative_xp - cumulative_xp_offset`. Offset must be capped at `cumulative_xp`.
