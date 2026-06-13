# Task for Worker M2: UI Components Cleanup

Implement the UI cleanups required for R1.
1. In src/App.tsx:
   - Remove import of Rehab component (`import Rehab from './components/Rehab';`).
   - Remove "CLINIC" tab from the `TABS` array.
   - Remove the rendering condition `{activeTab === 'rehab' && <Rehab />}`.
   - Clean up any playAuraSound conditions mentioning 'rehab'.
2. In src/components/Rules.tsx:
   - Remove the rules card with `id: 5` (which describes the Rehab Clinic).
3. Delete the components:
   - src/components/Rehab.tsx
   - src/components/Gym.tsx
4. Verify the build compiles successfully with `cmd.exe /c "npm run build"`.
