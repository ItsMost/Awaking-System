# Change Log - Milestone 3 Quest Updates & Rehab Removal

## Modified Files

### 1. `src/components/Dashboard.tsx`
- Removed `INJURED_DAILY_QUESTS` array entirely.
- Simplified `DAILY_QUESTS` definition to use `NORMAL_DAILY_QUESTS` directly: `const DAILY_QUESTS = NORMAL_DAILY_QUESTS;`.
- Removed `is_injured: false` from the default player initialization object.
- Updated Quest EXP rewards in `NORMAL_DAILY_QUESTS` and related shared objects:
  - `Practice` -> 150 EXP
  - `Hydration Target (4L)` -> 50 EXP
  - `Nutritional Compliance` -> 50 EXP
  - `Functional Mobility` -> 45 EXP
  - `Recovery Cooldown` -> 50 EXP
- Removed `'Practice (Rehab)'` from all three `mandatoryTasks` arrays in the file (lines 1055, 1323, 1485).
- Implemented auto-repair logic in `syncData`: checks if `userData.cumulative_xp_offset > userData.cumulative_xp` and, if so, caps it client-side and updates `cumulative_xp_offset` in the database via the Supabase client.

### 2. `src/components/Rank.tsx`
- Removed `INJURED_DAILY_QUESTS` array.
- Updated `QUEST_REWARDS` constant mapping with updated EXP values and added missing mappings for:
  - `Practice`: 150 EXP
  - `Hydration Target (4L)`: 50 EXP
  - `Nutritional Compliance`: 50 EXP
  - `Functional Mobility`: 45 EXP
  - `Recovery Cooldown`: 50 EXP
- Applied auto-repair logic in `fetchAndProcessLeaderboard`: iterates over all fetched hunters and, if `cumulative_xp_offset > cumulative_xp`, caps it client-side and updates in the database.
- Applied auto-repair logic in `handleCoachUndo`: when a coach undoes a task and `cumulative_xp` decreases, caps `cumulative_xp_offset` to `newXp` if it exceeds it, client-side and database-side.
- Removed `[INJURY REPORT]` processing/approval block from `processSingleRequest`.
- Removed `inboxFilter === 'injury'` tab filter option from `getFilteredInbox`.
- Removed the Rehab filter tab from the Pending Requests modal UI.
- Simplified the `baseQuests` selection in Rank profile overlay to just use `NORMAL_DAILY_QUESTS`.
- Removed the injury-specific color checking on the Pending Requests task name UI label.

### 3. `src/components/CoachPanel.tsx`
- Updated `QUEST_REWARDS` mapping with:
  - `Practice`: 150 EXP
  - `Hydration Target (4L)`: 50 EXP
  - `Nutritional Compliance`: 50 EXP
  - `Functional Mobility`: 45 EXP
  - `Recovery Cooldown`: 50 EXP
- Cleaned up the dictionary by removing rehab-related entries (`Practice (Rehab)` and `Thermal / Cryotherapy`).

## Build Verification
- Proactively ran `npm run build`. Compilation succeeded cleanly with no errors, and the output client bundles were correctly generated in the `dist` directory.
