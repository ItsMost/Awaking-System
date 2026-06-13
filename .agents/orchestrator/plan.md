# Project Implementation Plan: Awaking System Clean-up

This plan decomposes the requirements specified in ORIGINAL_REQUEST.md into verifiable milestones.

## Milestones

### Milestone 1: Exploration & Verification
- **Objectives**: Explore the codebase, check package.json, verify current test suite and build setup.
- **Verification**: Run `npm run build` and `npm run test` (if tests exist) via a worker to establish a baseline.

### Milestone 2: Rehab System Removal (R1)
- **Objectives**:
  - Remove "CLINIC" tab and Rehab component import/rendering in `src/App.tsx`.
  - Delete `src/components/Rehab.tsx` and `src/components/Gym.tsx`.
  - Update `src/components/Dashboard.tsx` (remove `INJURED_DAILY_QUESTS`, use only `NORMAL_DAILY_QUESTS`, remove `is_injured` from default state, remove `Practice (Rehab)`).
  - Update `src/components/Rank.tsx` (remove `INJURED_DAILY_QUESTS`, `is_injured` checks, inboxFilter === 'injury', `[INJURY REPORT]`).
  - Update `src/components/Rules.tsx` (remove card with `id: 5`).
- **Verification**: Compile project and verify that clinic/rehab features are completely removed.

### Milestone 3: Quest EXP Reward Adjustments (R2)
- **Objectives**:
  - Update quest EXP rewards across Dashboard, CoachPanel, and Rank logic.
  - Map new EXP rewards: Practice/Practice (Rehab) -> 150, Hydration -> 50, Nutritional -> 50, Functional Mobility -> 45, Recovery Cooldown/Thermal -> 50.
  - Add missing mappings to `QUEST_REWARDS` in `CoachPanel.tsx` and `Rank.tsx`.
- **Verification**: Verify that quest completion/undo logic awards/deducts correct values.

### Milestone 4: Prevent Negative Overall Leaderboard XP (R3)
- **Objectives**:
  - Implement auto-repair: if `cumulative_xp_offset > cumulative_xp`, cap it to `cumulative_xp`.
  - Implement in Dashboard.tsx (`syncData`), Rank.tsx (`fetchAndProcessLeaderboard` and `handleCoachUndo`).
- **Verification**: Verify that offset is never larger than cumulative_xp and negative overall XP is auto-repaired.

### Milestone 5: Database Quest Reset (R4)
- **Objectives**:
  - Write and execute `reset_quests.js` script connecting to Supabase.
  - Clear daily quests (`type = 'quest'`).
  - Set `monthly_xp = 0` for all players.
  - Set `cumulative_xp_offset = cumulative_xp` for all players.
  - Reset daily macros log and count to empty/0.
- **Verification**: Verify database table states using query/verification scripts.

### Milestone 6: Final Integrated E2E Testing & Audit
- **Objectives**: Run build, verify interface matches expectations, perform Forensic Audit for code integrity.
- **Verification**: Full project build passing, no TypeScript errors, audit passes cleanly.
