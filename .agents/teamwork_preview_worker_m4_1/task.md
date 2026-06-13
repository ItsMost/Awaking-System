# Task for Worker M4: Database Quest Reset

Implement R4: Database Quest Reset.

1. Locate how daily macros log and count are defined/used in `Dashboard.tsx` or in Supabase calls, to find the exact column names in the `elite_players` table.
2. Write `reset_quests.js` at the project root using the Supabase credentials:
   - Supabase URL: `https://koakdlbwsjekmtiunfhr.supabase.co`
   - Supabase Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvYWtkbGJ3c2pla210aXVuZmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNDEyNDUsImV4cCI6MjA4OTcxNzI0NX0.ZTXsET8hhtIebRmXiv1fHELmReGjVJlrq7HdlO9uWMI`
3. The script must connect to Supabase and perform:
   - Delete all rows in `elite_quests` where `type = 'quest'`.
   - Set `monthly_xp = 0` for all players in `elite_players`.
   - Set `cumulative_xp_offset = cumulative_xp` for all players in `elite_players`.
   - Reset daily macros log and count to empty/0 today for all players (using the correct column names found).
4. Run the script: `cmd.exe /c "node reset_quests.js"`.
5. Verify that the script executes successfully and prints the number of affected rows/records.
