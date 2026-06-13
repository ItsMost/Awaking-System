# Original User Request

## Initial Request — 2026-06-05T12:34:29Z

Full removal of the rehab/injury clinic system, adjusting quest EXP values, implementing auto-repair of the negative cumulative XP offset bug, and running a complete reset of quest completion history on Supabase.

Working directory: C:\Users\memob\.gemini\antigravity\scratch\Awaking-System
Integrity mode: development

## Requirements

### R1. Rehab System Removal
- Remove the "CLINIC" tab from the main navigation in [App.tsx](file:///C:/Users/memob/.gemini/antigravity/scratch/Awaking-System/src/App.tsx) and stop importing/rendering the `Rehab` component.
- Delete the unused components: [Rehab.tsx](file:///C:/Users/memob/.gemini/antigravity/scratch/Awaking-System/src/components/Rehab.tsx) and [Gym.tsx](file:///C:/Users/memob/.gemini/antigravity/scratch/Awaking-System/src/components/Gym.tsx).
- In [Dashboard.tsx](file:///C:/Users/memob/.gemini/antigravity/scratch/Awaking-System/src/components/Dashboard.tsx): Remove `INJURED_DAILY_QUESTS` and clean up `DAILY_QUESTS` to use only `NORMAL_DAILY_QUESTS`. Remove `is_injured` from default athlete state. Remove `Practice (Rehab)` from mandatory tasks.
- In [Rank.tsx](file:///C:/Users/memob/.gemini/antigravity/scratch/Awaking-System/src/components/Rank.tsx): Remove `INJURED_DAILY_QUESTS`, `is_injured` checks, the rehab pending requests filter tab (`inboxFilter === 'injury'`), and `[INJURY REPORT]` processing.
- In [Rules.tsx](file:///C:/Users/memob/.gemini/antigravity/scratch/Awaking-System/src/components/Rules.tsx): Remove the clinic/injury rules card (`id: 5`).

### R2. Quest EXP Reward Adjustments
- Update quest EXP rewards across the player dashboard, coach approval panel, and coach undo logic:
  - `Practice` / `Practice (Rehab)` -> **150 EXP** (previously 100/90)
  - `Hydration Target (4L)` -> **50 EXP** (previously 30)
  - `Nutritional Compliance` -> **50 EXP** (previously 30)
  - `Functional Mobility` -> **45 EXP** (previously 35)
  - `Recovery Cooldown` / `Thermal / Cryotherapy` -> **50 EXP** (previously 20)
- Add missing rewards mappings to `QUEST_REWARDS` inside [CoachPanel.tsx](file:///C:/Users/memob/.gemini/antigravity/scratch/Awaking-System/src/components/CoachPanel.tsx) and [Rank.tsx](file:///C:/Users/memob/.gemini/antigravity/scratch/Awaking-System/src/components/Rank.tsx).

### R3. Prevent Negative Overall Leaderboard XP
- If a player's `cumulative_xp_offset > cumulative_xp` (due to coach undo or penalty), automatically cap `cumulative_xp_offset` to equal `cumulative_xp` both client-side and in the database, ensuring leaderboard XP is never negative and immediately moves forward when they earn XP.
- Apply this auto-repair logic in `syncData` of [Dashboard.tsx](file:///C:/Users/memob/.gemini/antigravity/scratch/Awaking-System/src/components/Dashboard.tsx), `fetchAndProcessLeaderboard` and `handleCoachUndo` of [Rank.tsx](file:///C:/Users/memob/.gemini/antigravity/scratch/Awaking-System/src/components/Rank.tsx).

### R4. Database Quest Reset
- Execute a Node.js script `reset_quests.js` to connect to Supabase and:
  - Delete all rows in `elite_quests` where `type = 'quest'` (clears all players' daily quests).
  - Set `monthly_xp = 0` for all players in `elite_players`.
  - Set `cumulative_xp_offset = cumulative_xp` for all players in `elite_players` (resets overall leaderboard to 0).
  - Reset daily macros log and count to empty/0 today for all players.

## Acceptance Criteria

### UI & Navigation
- [ ] No "CLINIC" or rehab tab is visible in the main navigation.
- [ ] No clinic rules card is shown on the Rules page.

### Quest Rewards
- [ ] Completing Practice yields 150 EXP base, Hydration Target yields 50 EXP base, Nutritional Compliance yields 50 EXP base, Functional Mobility yields 45 EXP base, and Recovery Cooldown yields 50 EXP base.
- [ ] Undoing these quests deducts the exact updated EXP values.

### Database State
- [ ] The `elite_quests` table has no quest entries for today.
- [ ] Leaderboard scores display 0 XP for all players immediately upon reset.
