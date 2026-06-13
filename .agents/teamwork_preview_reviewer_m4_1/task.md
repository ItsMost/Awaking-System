# Task for Reviewer M4: Database Quest Reset Review

Review the database reset execution.
1. Run a query script using Node.js connecting to Supabase to verify:
   - There are 0 rows in `elite_quests` with `type = 'quest'`.
   - For all players in `elite_players`, `monthly_xp` is `0`, `cumulative_xp_offset` equals `cumulative_xp`, `daily_macros` is `{ protein: 0, carbs: 0, fats: 0, calories: 0, log: [] }`, and `last_macro_date` matches today's date (local/server YYYY-MM-DD).
2. Report the findings, and check if everything passes.
