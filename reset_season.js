import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://koakdlbwsjekmtiunfhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvYWtkbGJ3c2pla210aXVuZmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNDEyNDUsImV4cCI6MjA4OTcxNzI0NX0.ZTXsET8hhtIebRmXiv1fHELmReGjVJlrq7HdlO9uWMI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('--- NEW SEASON RESET: HP & GOLD ---');

  // 1. Fetch all players first to show before state
  const { data: players, error: fetchErr } = await supabase
    .from('elite_players')
    .select('name, hp, gold');

  if (fetchErr) {
    console.error('❌ Error fetching players:', fetchErr);
    process.exit(1);
  }

  console.log('\nBefore reset:');
  players.forEach(p => console.log(`  ${p.name}: HP=${p.hp}, Gold=${p.gold}`));

  // 2. Reset HP to 100 and Gold to 0 for ALL players
  const { error: updateErr } = await supabase
    .from('elite_players')
    .update({ hp: 100, gold: 0 })
    .not('name', 'is', null);

  if (updateErr) {
    console.error('❌ Error updating players:', updateErr);
    process.exit(1);
  }

  // 3. Verify the reset
  const { data: after, error: afterErr } = await supabase
    .from('elite_players')
    .select('name, hp, gold');

  if (afterErr) {
    console.error('❌ Error verifying:', afterErr);
    process.exit(1);
  }

  console.log('\n✅ After reset:');
  after.forEach(p => console.log(`  ${p.name}: HP=${p.hp}, Gold=${p.gold}`));

  console.log(`\n--- DONE: ${after.length} players reset to HP=100, Gold=0 ---`);
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
