# Task for Reviewer M3: Core Dashboard & Rank Logic Review

Review the changes made by the worker in Milestone 3.
1. Check that src/components/Dashboard.tsx does not contain INJURED_DAILY_QUESTS, that DAILY_QUESTS is simplified, that is_injured is removed from default state, and Practice (Rehab) is removed from mandatory tasks.
2. Check that src/components/Rank.tsx does not contain INJURED_DAILY_QUESTS, is_injured checks, rehab inbox filter, or [INJURY REPORT] processing.
3. Check quest rewards mappings under `QUEST_REWARDS` in Dashboard.tsx, Rank.tsx, and CoachPanel.tsx. Ensure the rewards are:
   - Practice -> 150 EXP
   - Hydration Target (4L) -> 50 EXP
   - Nutritional Compliance -> 50 EXP
   - Functional Mobility -> 45 EXP
   - Recovery Cooldown -> 50 EXP
4. Check that `syncData` in Dashboard.tsx, `fetchAndProcessLeaderboard` and `handleCoachUndo` in Rank.tsx implement the auto-repair logic capping `cumulative_xp_offset` to `cumulative_xp` client-side and server-side.
5. Run `cmd.exe /c "npm run build"` to verify there are no compilation errors.
