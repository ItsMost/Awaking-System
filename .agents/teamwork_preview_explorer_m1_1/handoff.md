# Handoff Report — Explorer Phase

## 1. Observation
The following file locations, line numbers, and contents were observed in the codebase:
- **`src/App.tsx`**:
  - `import Rehab from './components/Rehab';` on line 22.
  - `{ id: 'rehab', label: 'CLINIC', icon: Activity, color: '#10b981' }` inside `TABS` array on line 664.
  - `else if (tabId === 'records' || tabId === 'rehab') playAuraSound(player);` sound callback on line 560.
  - `{activeTab === 'rehab' && <Rehab />}` conditional page rendering on line 779.
- **`src/components/Dashboard.tsx`**:
  - `NORMAL_DAILY_QUESTS` definition on lines 626-632.
  - `INJURED_DAILY_QUESTS` definition on lines 634-640.
  - `const currentPlayer = player || { ..., is_injured: false, ... };` fallback configuration on line 657.
  - `const DAILY_QUESTS = useMemo(() => currentPlayer.is_injured ? INJURED_DAILY_QUESTS : NORMAL_DAILY_QUESTS, [currentPlayer.is_injured]);` on line 659.
  - `const mandatoryTasks = ['Practice', 'Practice (Rehab)', 'Hydration Target (4L)', 'Nutritional Compliance', 'Functional Mobility'];` on lines 1055, 1323, and 1485.
  - `syncData` effect block starting at line 993.
- **`src/components/Rank.tsx`**:
  - `const NORMAL_DAILY_QUESTS = ['Practice', 'Hydration Target (4L)', 'Nutritional Compliance', 'Functional Mobility', 'Recovery Cooldown'];` on line 93.
  - `const INJURED_DAILY_QUESTS = ['Practice (Rehab)', 'Hydration Target (4L)', 'Tissue Repair Nutrition', 'Rehab Mobility Protocol', 'Thermal / Cryotherapy'];` on line 94.
  - `const QUEST_REWARDS: Record<string, { exp: number; gold: number }> = { ... }` on lines 99-107.
  - `if (request.task_name === '[INJURY REPORT]') { ... }` handler for injury report approval on lines 770-773.
  - `const baseQuests = selectedHunter.is_injured ? INJURED_DAILY_QUESTS : NORMAL_DAILY_QUESTS;` on line 903.
  - `<FilterTab $active={inboxFilter === 'injury'} ...> Rehab</FilterTab>` filter option on line 1027.
- **`src/components/Rules.tsx`**:
  - Rule card with `id: 5` (Rehab Clinic explanation) defined on lines 268-283.
- **`src/components/CoachPanel.tsx`**:
  - `const QUEST_REWARDS: Record<string, { exp: number, gold: number }> = { ... }` defined on lines 11-22.
- **`src/lib/supabase.ts`**:
  - Hardcoded credentials on lines 4-8:
    - `const supabaseUrl = 'https://koakdlbwsjekmtiunfhr.supabase.co';`
    - `const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';`
- **`package.json`**:
  - Script definitions on lines 6-11:
    - `"dev": "vite"`, `"build": "vite build"`, `"lint": "eslint ."`, `"preview": "vite preview"`
  - No `test` script exists.
- **Project Build Status**:
  - Execution of `cmd.exe /c "npm run build"` compiles successfully.
  ```
  vite v8.0.10 building client environment for production...
  transforming...✓ 2829 modules transformed.
  rendering chunks...
  dist/assets/index-DiM2sBqb.js   1,998.90 kB │ gzip: 555.31 kB
  ✓ built in 1.51s
  ```

---

## 2. Logic Chain
1. **R1: Rehab System Removal**:
   - Because `Rehab` is imported on line 22, tabbed on line 664, and rendered on line 779 in `App.tsx`, we must remove these lines to hide and disable the clinic navigation from the user interface.
   - Because `is_injured` triggers the injury quests (`INJURED_DAILY_QUESTS` and `Practice (Rehab)`) inside `Dashboard.tsx` and `Rank.tsx`, removing the checks for `is_injured` and deleting `INJURED_DAILY_QUESTS` guarantees athletes always follow normal directives.
   - Because the rules card with `id: 5` describes the clinic, removing it on lines 268-283 of `Rules.tsx` removes it from the user manual page.
   - Because `Rehab.tsx` and `Gym.tsx` are component files solely used for the injury/rehab system, deleting them completes the removal.
2. **R2: Quest EXP Reward Adjustments**:
   - Because quest rewards are hardcoded separately in `Dashboard.tsx`, `CoachPanel.tsx`, and `Rank.tsx`, updating the constants in all three locations ensures consistency.
   - Because the coach panel handles approvals and undoes, adding the missing daily quests (`Hydration Target (4L)`, `Nutritional Compliance`, `Functional Mobility`) to `QUEST_REWARDS` inside `CoachPanel.tsx` ensures they are correctly calculated during reviews.
3. **R3: Prevent Negative Overall Leaderboard XP**:
   - Because overall XP is calculated as `cumulative_xp - cumulative_xp_offset`, a higher offset results in negative values. Capping the offset client-side during synchronization and server-side in the database ensures overall XP is normalized to a minimum of 0.
   - Applying the cap in `syncData` (`Dashboard.tsx`), `fetchAndProcessLeaderboard` (`Rank.tsx`), and `handleCoachUndo` (`Rank.tsx`) covers all client loading, general leaderboard loading, and coach modification events.
4. **R4: Database Quest Reset**:
   - Because daily quest history is in `elite_quests`, deleting rows with `type = 'quest'` resets the history.
   - Because player points are in `elite_players`, setting `monthly_xp = 0` and `cumulative_xp_offset = cumulative_xp` resets the monthly score and sets the overall leaderboard score to 0.

---

## 3. Caveats
- No test suite exists within the package scripts, so standard automated tests cannot verify changes; verification must be done via a production build compilation and manual browser/database validation.
- PowerShell script execution policy is restricted on the host system, requiring Node scripts and build commands to be run via explicit `cmd.exe /c` execution.

---

## 4. Conclusion
The codebase is fully mapped and has no compilation errors. We have clear, concrete strategies to address requirements R1-R4 safely and effectively. The project is ready for implementation by the next agent.

---

## 5. Verification Method
- **Build Compilation**: Run `cmd.exe /c "npm run build"` to verify the application bundles without TypeScript or bundler errors.
- **Rules Card Verification**: Open `src/components/Rules.tsx` and check that the rule with ID `5` is gone.
- **Quest Reward Mappings**: Open `src/components/Rank.tsx` and `src/components/CoachPanel.tsx` and check that the updated reward values for Practice (150 EXP), Hydration (50 EXP), Nutrition (50 EXP), Mobility (45 EXP), and Recovery (50 EXP) match.
