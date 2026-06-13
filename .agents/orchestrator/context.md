# Context for Awaking-System Cleanup

## System Overview
The project is a player performance tracking application ("Awaking System") that uses React, TypeScript, Vite, and connects to a Supabase database. It contains athlete and coach interfaces, a dashboard, rules, leaderboard (ranking), and quest completion workflows.

## Key Changes
1. **Rehab System Removal**: The system originally had an injury status (`is_injured`) and a clinic/rehab section. This needs to be completely removed.
2. **EXP Tuning**: Quest reward amounts are being raised. Undo operations must match the updated amounts.
3. **Leaderboard Bug Repair**: Cumulative offset subtraction must not make leaderboard XP negative. Auto-repair client/server offset to match cumulative XP.
4. **Supabase Database Quest Reset**: A cleanup script `reset_quests.js` needs to be created and run.
