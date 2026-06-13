# Task for Worker M3: Core Dashboard & Rank Logic

Implement the logic updates for R1, R2, and R3.

1. In src/components/Dashboard.tsx:
   - Remove `INJURED_DAILY_QUESTS`.
   - Clean up `DAILY_QUESTS` to use only `NORMAL_DAILY_QUESTS`.
   - Remove `is_injured` from default athlete state.
   - Remove `Practice (Rehab)` from `mandatoryTasks` arrays.
   - In `syncData`, implement the auto-repair logic: if `cumulative_xp_offset > cumulative_xp`, cap `cumulative_xp_offset` to equal `cumulative_xp` client-side and update it in the database via the Supabase client.
   - Update Quest EXP reward values:
     - `Practice` -> 150 EXP
     - `Hydration Target (4L)` -> 50 EXP
     - `Nutritional Compliance` -> 50 EXP
     - `Functional Mobility` -> 45 EXP
     - `Recovery Cooldown` -> 50 EXP

2. In src/components/Rank.tsx:
   - Remove `INJURED_DAILY_QUESTS`.
   - Remove `is_injured` checks, including the `baseQuests` selection (it should just use `NORMAL_DAILY_QUESTS` / normal quests).
   - Remove the rehab pending requests filter tab (`inboxFilter === 'injury'`).
   - Remove the `[INJURY REPORT]` processing/approval code block.
   - Update `QUEST_REWARDS` constant mapping with updated EXP values and add any missing mappings:
     - `Practice`: 150 EXP
     - `Hydration Target (4L)`: 50 EXP
     - `Nutritional Compliance`: 50 EXP
     - `Functional Mobility`: 45 EXP
     - `Recovery Cooldown`: 50 EXP
   - In `fetchAndProcessLeaderboard` and `handleCoachUndo`, apply the auto-repair logic: if `cumulative_xp_offset > cumulative_xp`, cap `cumulative_xp_offset` to equal `cumulative_xp` (both client-side and update in the database).

3. In src/components/CoachPanel.tsx:
   - Update `QUEST_REWARDS` constant mapping with updated EXP values and add any missing mappings:
     - `Practice`: 150 EXP
     - `Hydration Target (4L)`: 50 EXP
     - `Nutritional Compliance`: 50 EXP
     - `Functional Mobility`: 45 EXP
     - `Recovery Cooldown`: 50 EXP

4. Verify compilation succeeds cleanly with `cmd.exe /c "npm run build"`.
