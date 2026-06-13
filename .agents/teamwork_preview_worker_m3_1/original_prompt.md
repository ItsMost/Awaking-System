## 2026-06-05T12:45:29Z

Objective:
1. In src/components/Dashboard.tsx:
   - Remove `INJURED_DAILY_QUESTS`.
   - Clean up `DAILY_QUESTS` to use only `NORMAL_DAILY_QUESTS`.
   - Remove `is_injured` from default athlete state.
   - Remove `Practice (Rehab)` from `mandatoryTasks` arrays.
   - Update Quest EXP reward values:
     - `Practice` -> 150 EXP
     - `Hydration Target (4L)` -> 50 EXP
     - `Nutritional Compliance` -> 50 EXP
     - `Functional Mobility` -> 45 EXP
     - `Recovery Cooldown` -> 50 EXP
   - In `syncData`, implement the auto-repair logic: if `cumulative_xp_offset > cumulative_xp`, cap `cumulative_xp_offset` to equal `cumulative_xp` client-side and update it in the database via the Supabase client.
2. In src/components/Rank.tsx:
   - Remove `INJURED_DAILY_QUESTS`.
   - Remove `is_injured` checks, including `baseQuests` selection (just use normal quests).
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

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT
hardcode test results, create dummy/facade implementations, or
circumvent the intended task. A Forensic Auditor will independently
verify your work. Integrity violations WILL be detected and your
work WILL be rejected.

Scope Boundaries:
- Modify only Dashboard.tsx, Rank.tsx, and CoachPanel.tsx.

Output requirements:
- Write a report of changes to: C:\Users\memob\.gemini\antigravity\scratch\Awaking-System\.agents\teamwork_preview_worker_m3_1\changes.md
- Deliver a handoff report at: C:\Users\memob\.gemini\antigravity\scratch\Awaking-System\.agents\teamwork_preview_worker_m3_1\handoff.md
- Message me back once you have completed and written these files.
