# Codebase Analysis & Strategy Recommendations

This document details the findings from exploring the Awaking System codebase and provides recommended implementation steps for each requirement.

---

## 1. Codebase Exploration Findings

### App.tsx
- **Navigation & Component Imports**:
  - `Rehab` is imported on line 22: `import Rehab from './components/Rehab';`
  - The `"CLINIC"` tab is defined under `const TABS` at line 664: `{ id: 'rehab', label: 'CLINIC', icon: Activity, color: '#10b981' }`
  - Sound effect handler on line 560: `else if (tabId === 'records' || tabId === 'rehab') playAuraSound(player);`
  - Component rendering on line 779: `{activeTab === 'rehab' && <Rehab />}`

### Dashboard.tsx
- **Quest Setup & Constants**:
  - `NORMAL_DAILY_QUESTS` is defined starting on line 626.
  - `INJURED_DAILY_QUESTS` is defined starting on line 634.
  - Quest EXP rewards are currently:
    - `Practice`: 100 EXP (line 627)
    - `Hydration Target (4L)`: 30 EXP (line 622)
    - `Nutritional Compliance`: 30 EXP (line 623)
    - `Functional Mobility`: 35 EXP (line 624)
    - `Recovery Cooldown`: 20 EXP (line 631)
  - `Practice (Rehab)` is listed inside `INJURED_DAILY_QUESTS` with 90 EXP (line 635).
  - `Thermal / Cryotherapy` is listed inside `INJURED_DAILY_QUESTS` with 20 EXP (line 639).
- **Player State & Fallbacks**:
  - Default athlete state fallback is defined on line 657:
    ```typescript
    const currentPlayer = player || { id: 'me', name: 'Athlete', cumulative_xp: 0, monthly_xp: 0, gold: 0, hp: 100, is_injured: false, active_penalty: false, weight: 75, streak: 0, ... };
    ```
  - `DAILY_QUESTS` is memoized on line 659:
    ```typescript
    const DAILY_QUESTS = useMemo(() => currentPlayer.is_injured ? INJURED_DAILY_QUESTS : NORMAL_DAILY_QUESTS, [currentPlayer.is_injured]);
    ```
- **Mandatory Tasks**:
  - Defined in lines 1055, 1323, and 1485:
    ```typescript
    const mandatoryTasks = ['Practice', 'Practice (Rehab)', 'Hydration Target (4L)', 'Nutritional Compliance', 'Functional Mobility'];
    ```
- **Sync / XP Logic**:
  - `syncData` resides at lines 993-1113.
  - Active XP calculations: `(currentPlayer.cumulative_xp ?? 0) - (currentPlayer.cumulative_xp_offset ?? 0)` (lines 858, 1008, 1304).

### Rank.tsx
- **Quest Setup & Constants**:
  - `NORMAL_DAILY_QUESTS` and `INJURED_DAILY_QUESTS` are defined on lines 93 and 94.
  - `QUEST_REWARDS` is defined on lines 99-107.
- **Injury / Rehab UI & Filtering**:
  - Pending requests filter for Rehab (injury) is defined at line 1027:
    ```typescript
    <FilterTab $active={inboxFilter === 'injury'} $color="#ef4444" onClick={() => setInboxFilter('injury')}><HeartPulse size={12}/> Rehab</FilterTab>
    ```
  - Inbox logic filters for `injury` on line 865:
    ```typescript
    if (inboxFilter === 'injury') return req.task_name === '[INJURY REPORT]';
    ```
  - Approving injury reports modifies players to `is_injured: true` on lines 770-773:
    ```typescript
    if (request.task_name === '[INJURY REPORT]') {
      await supabase.from('elite_players').update({ is_injured: true }).eq('name', request.player_name);
      await supabase.from('elite_quests').delete().eq('id', request.id);
    }
    ```
- **Coach Undo & Leaderboard Fetch**:
  - `fetchAndProcessLeaderboard` fetches player data from Supabase and processes them (lines 464-516).
  - `handleCoachUndo` undoes a quest and deducts rewards (lines 715-760).

### Rules.tsx
- The rehab rules card with `id: 5` is defined on lines 268-283.

### CoachPanel.tsx
- `QUEST_REWARDS` mapping is defined on lines 11-22.

### Supabase Connection Configuration
- URL and anon keys are directly hardcoded inside:
  - `src/lib/supabase.ts` (lines 4-8)
  - `query_players.js` (lines 3-4)
- **URL**: `https://koakdlbwsjekmtiunfhr.supabase.co`

### Test Suite Status
- **Build baseline**: The build completes successfully via `cmd.exe /c "npm run build"`.
- **Test suite**: No testing framework or test script is declared in `package.json`.

---

## 2. Implementation Strategies

### Strategy for R1: Rehab System Removal
1. **Remove Imports & Tabs in `App.tsx`**:
   - Delete line 22 (`import Rehab...`).
   - Remove the tab with ID `'rehab'` from `TABS` array (line 664).
   - Update line 560 to remove the check for `tabId === 'rehab'`.
   - Remove the conditional rendering block `{activeTab === 'rehab' && <Rehab />}` on line 779.
2. **Clean up `Dashboard.tsx`**:
   - Delete `INJURED_DAILY_QUESTS` definition (lines 634-640).
   - In `DAILY_QUESTS` declaration (line 659), use only `NORMAL_DAILY_QUESTS`.
   - In lines 657, remove `is_injured: false` from default state player object.
   - Remove `'Practice (Rehab)'` from `mandatoryTasks` lists at lines 1055, 1323, and 1485.
3. **Clean up `Rank.tsx`**:
   - Delete `INJURED_DAILY_QUESTS` definition (line 94).
   - In `baseQuests` selection (line 903), default directly to `NORMAL_DAILY_QUESTS`.
   - Delete the `'injury'` filter tab from UI (line 1027).
   - Delete the `inboxFilter === 'injury'` handling in `getFilteredInbox` (line 865).
   - Delete `[INJURY REPORT]` approval/rejection block in `processSingleRequest` (lines 770-773).
4. **Clean up `Rules.tsx`**:
   - Delete the object with `id: 5` from `RULES_DATA` array.
5. **Delete Files**:
   - Delete `src/components/Rehab.tsx` and `src/components/Gym.tsx`.

### Strategy for R2: Quest EXP Reward Adjustments
1. **Dashboard.tsx**:
   - Update constants `SHARED_HYDRATION` (30 -> 50 EXP), `SHARED_NUTRITION` (30 -> 50 EXP), `SHARED_MOBILITY` (35 -> 45 EXP).
   - In `NORMAL_DAILY_QUESTS`, change `Practice` (100 -> 150 EXP) and `Recovery Cooldown` (20 -> 50 EXP).
2. **CoachPanel.tsx**:
   - Update `QUEST_REWARDS` dictionary to set `Practice` to 150 EXP and `Recovery Cooldown` to 50 EXP.
   - Add missing keys (`Hydration Target (4L)`: 50, `Nutritional Compliance`: 50, `Functional Mobility`: 45) to ensure correct coach validation/reward calculations.
3. **Rank.tsx**:
   - Update `QUEST_REWARDS` dictionary for all respective quests (`Practice` -> 150, `Practice (Rehab)` -> 150, `Hydration Target (4L)` -> 50, `Nutritional Compliance` -> 50, `Functional Mobility` -> 45, `Recovery Cooldown` -> 50, `Rehab Mobility Protocol` -> 45, `Thermal / Cryotherapy` -> 50).

### Strategy for R3: Prevent Negative Overall Leaderboard XP
1. **Dashboard.tsx (`syncData`)**:
   - Directly after fetching `userData` from database, insert a check:
     ```typescript
     let cumulative = userData.cumulative_xp || 0;
     let offset = userData.cumulative_xp_offset || 0;
     if (offset > cumulative) {
       offset = cumulative;
       userData.cumulative_xp_offset = offset;
       await supabase.from('elite_players').update({ cumulative_xp_offset: offset }).eq('name', userData.name);
     }
     ```
2. **Rank.tsx (`fetchAndProcessLeaderboard`)**:
   - In the mapping function over `hunters` array, add the same auto-repair logic to adjust values and issue database update silently.
3. **Rank.tsx (`handleCoachUndo`)**:
   - Prior to calling the player update API in `handleCoachUndo`, calculate if `newXp` is less than the current `cumulative_xp_offset`. If so, set the offset to `newXp` and pass it in the `update` transaction.

### Strategy for R4: Database Quest Reset
1. Create a script named `reset_quests.js` at the project root using the Node Supabase client.
2. The script will perform:
   - Deleting rows in `elite_quests` where `type = 'quest'`.
   - Fetching all players and updating their stats sequentially: set `monthly_xp = 0`, set `cumulative_xp_offset = cumulative_xp`, reset `daily_macros` structure, and set `last_macro_date` to today's local date string format.
3. Execute the script via `node reset_quests.js`.
