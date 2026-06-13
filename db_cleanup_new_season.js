import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://koakdlbwsjekmtiunfhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvYWtkbGJ3c2pla210aXVuZmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNDEyNDUsImV4cCI6MjA4OTcxNzI0NX0.ZTXsET8hhtIebRmXiv1fHELmReGjVJlrq7HdlO9uWMI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('--- STARTING NEW SEASON DB CLEANUP ---');

  // 1. Delete non-pet items and Iron Golem Matrix from shop_items
  console.log('Cleaning up shop_items table...');
  const { error: shopDeleteErr } = await supabase
    .from('shop_items')
    .delete()
    .or('category.neq.pet,name.eq.Iron Golem Matrix');

  if (shopDeleteErr) {
    console.error('Error deleting shop items:', shopDeleteErr);
  } else {
    console.log('Successfully cleaned up shop_items table.');
  }

  // 2. Clean up players pets and active_pet
  console.log('Cleaning up players active_pet and pets arrays...');
  const { data: players, error: fetchErr } = await supabase
    .from('elite_players')
    .select('id, name, pets, active_pet');

  if (fetchErr) {
    console.error('Error fetching players:', fetchErr);
    process.exit(1);
  }

  for (const player of players) {
    let needsUpdate = false;
    let newActivePet = player.active_pet;
    let newPets = player.pets;

    if (player.active_pet === 'Iron Golem Matrix') {
      newActivePet = null;
      needsUpdate = true;
      console.log(`Clearing active pet for player ${player.name}`);
    }

    if (Array.isArray(player.pets) && player.pets.includes('Iron Golem Matrix')) {
      newPets = player.pets.filter(p => p !== 'Iron Golem Matrix');
      needsUpdate = true;
      console.log(`Removing Iron Golem Matrix from pets array for player ${player.name}`);
    }

    if (needsUpdate) {
      const { error: updateErr } = await supabase
        .from('elite_players')
        .update({ active_pet: newActivePet, pets: newPets })
        .eq('id', player.id);

      if (updateErr) {
        console.error(`Error updating player ${player.name}:`, updateErr);
      } else {
        console.log(`Successfully updated player ${player.name}`);
      }
    }
  }

  console.log('--- DB CLEANUP DONE ---');
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
