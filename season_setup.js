import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://koakdlbwsjekmtiunfhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvYWtkbGJ3c2pla210aXVuZmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNDEyNDUsImV4cCI6MjA4OTcxNzI0NX0.ZTXsET8hhtIebRmXiv1fHELmReGjVJlrq7HdlO9uWMI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('🔥 === NEW SEASON SETUP === 🔥\n');

  // ============================
  // 1. CLEAR ALL OLD QUEST SUBMISSIONS
  // ============================
  console.log('--- Step 1: Clearing old quest submissions ---');
  const { data: oldQuests } = await supabase.from('elite_quests').select('id');
  if (oldQuests && oldQuests.length > 0) {
    const { error: delErr } = await supabase
      .from('elite_quests')
      .delete()
      .not('id', 'is', null);  // delete all rows
    if (delErr) {
      console.error('❌ Error deleting quests:', delErr);
    } else {
      console.log(`✅ Deleted ${oldQuests.length} old quest submissions`);
    }
  } else {
    console.log('✅ No old quest submissions to delete');
  }

  // ============================
  // 2. RESET Omar8azaljr streak to 0
  // ============================
  console.log('\n--- Step 2: Fixing Omar8azaljr streak ---');
  const { error: streakErr } = await supabase
    .from('elite_players')
    .update({ streak: 0 })
    .eq('name', 'Omar8azaljr');
  if (streakErr) {
    console.error('❌ Error:', streakErr);
  } else {
    console.log('✅ Omar8azaljr streak reset to 0');
  }

  // ============================
  // 3. RESET monthly_xp for all (just to be safe)
  // ============================
  console.log('\n--- Step 3: Resetting monthly_xp ---');
  const { error: xpErr } = await supabase
    .from('elite_players')
    .update({ monthly_xp: 0 })
    .not('name', 'is', null);
  if (xpErr) {
    console.error('❌ Error:', xpErr);
  } else {
    console.log('✅ All monthly_xp reset to 0');
  }

  // ============================
  // 4. RESET claimed_rewards for Battle Pass
  // ============================
  console.log('\n--- Step 4: Resetting Battle Pass claimed rewards ---');
  const { error: bpErr } = await supabase
    .from('elite_players')
    .update({ claimed_rewards: [] })
    .not('name', 'is', null);
  if (bpErr) {
    console.error('❌ Error:', bpErr);
  } else {
    console.log('✅ All Battle Pass rewards reset');
  }

  // ============================
  // 5. POST NEW SEASON ANNOUNCEMENT
  // ============================
  console.log('\n--- Step 5: Posting Season Announcement ---');
  const announcement = {
    title: '🏆 Season 2 — The Awakening Continues',
    content: `⚡ السيزون الثاني بدأ رسمياً! ⚡

كل الأرقام اتصفرت. مفيش حد قدام حد.
HP رجعت 100 · Gold = 0 · المهام اتفتحت من جديد.

🔥 القواعد واضحة:
• كل يوم عندك مهام — نفذها وارفع إثبات.
• الـ Streak بيديك Multiplier على الـ EXP.
• بطل الشهر = أعلى Monthly XP.

💀 مفيش أعذار. مفيش رجوع.
اللي هيقف... هيتعاقب.

— The System 🖤`,
    type: 'system',
    priority: 1,
  };

  const { error: newsErr } = await supabase
    .from('global_news')
    .insert([announcement]);
  if (newsErr) {
    console.error('❌ Error posting announcement:', newsErr);
  } else {
    console.log('✅ Season 2 announcement posted!');
  }

  // ============================
  // 6. FINAL VERIFICATION
  // ============================
  console.log('\n--- Final Verification ---');
  const { data: players } = await supabase.from('elite_players').select('name, monthly_xp, streak, gold, hp, claimed_rewards');
  players.forEach(p => console.log(`  ${p.name}: monthly_xp=${p.monthly_xp}, streak=${p.streak}, gold=${p.gold}, hp=${p.hp}, rewards=${JSON.stringify(p.claimed_rewards)}`));

  const { data: remainingQuests } = await supabase.from('elite_quests').select('id');
  console.log(`\n  Remaining quest submissions: ${remainingQuests ? remainingQuests.length : 0}`);

  console.log('\n🔥 === SEASON 2 IS LIVE! === 🔥');
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
