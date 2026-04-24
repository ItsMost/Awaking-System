import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Environment, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { toast, Toaster } from 'sonner';
import { 
  Trophy, Shield, Sword, Gem, Lock, Package, 
  Zap, Flame, Droplet, Crown, Hexagon, Crosshair, Ghost, Wind,
  Axe, Heart 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ==========================================
// 1. المحرك الصوتي الفخم
// ==========================================
const playSound = (type: 'open' | 'epic' | 'click' | 'equip' | 'claim') => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination); const now = ctx.currentTime;
  
  if (type === 'open') {
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now); osc.frequency.exponentialRampToValueAtTime(800, now + 1.5);
    gain.gain.setValueAtTime(0.01, now); gain.gain.linearRampToValueAtTime(0.3, now + 1); gain.gain.linearRampToValueAtTime(0.01, now + 1.5);
    osc.start(); osc.stop(now + 1.5);
  } else if (type === 'epic') {
    osc.type = 'square'; osc.frequency.setValueAtTime(400, now); osc.frequency.setValueAtTime(600, now + 0.2); osc.frequency.setValueAtTime(1200, now + 0.5);
    gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 2);
    osc.start(); osc.stop(now + 2);
  } else if (type === 'equip' || type === 'claim') {
    osc.type = 'triangle'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);
    gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(); osc.stop(now + 0.2);
  } else {
    osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now); osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
    gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(); osc.stop(now + 0.1);
  }
};

// ==========================================
// 2. مجسمات الـ 3D (Trophies & LootBox)
// ==========================================
const TrophyModel = ({ type, color }: { type: string, color: string }) => {
  const materialProps = { color, roughness: 0.1, transmission: 0.9, thickness: 1, envMapIntensity: 2, clearcoat: 1 };
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        {type === 'diamond' ? <octahedronGeometry args={[1.5, 0]} /> : 
         type === 'crown' ? <torusGeometry args={[1, 0.4, 16, 32]} /> : 
         <icosahedronGeometry args={[1.2, 1]} />}
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[1, 1.2, 0.5, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
    </Float>
  );
};

const LootBox3D = ({ isOpening }: { isOpening: boolean }) => {
  const boxRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (boxRef.current && isOpening) {
      boxRef.current.position.x = Math.sin(state.clock.elapsedTime * 50) * 0.1;
      boxRef.current.position.y = Math.cos(state.clock.elapsedTime * 40) * 0.1;
    }
  });
  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={boxRef} castShadow rotation={[0.5, -0.5, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshPhysicalMaterial color="#020617" metalness={0.9} roughness={0.1} clearcoat={1} emissive="#a855f7" emissiveIntensity={isOpening ? 2 : 0.2} />
      </mesh>
    </Float>
  );
};

// ==========================================
// 3. قاعدة البيانات الجديدة (Drop Rates System)
// ==========================================
const ACHIEVEMENTS = [
  { id: 'ach1', name: 'Awakened', desc: 'أول تسجيل دخول للنظام.', type: 'diamond', color: '#00f2ff', unlocked: true },
  { id: 'ach2', name: 'Iron Will', desc: 'الوصول لستريك 7 أيام.', type: 'icosahedron', color: '#10b981', unlocked: true },
  { id: 'ach3', name: 'Monarch', desc: 'الوصول للمستوى 30.', type: 'crown', color: '#eab308', unlocked: false },
  { id: 'ach4', name: 'Abyss Walker', desc: 'شراء 5 أرواح من المتجر.', type: 'diamond', color: '#a855f7', unlocked: false },
];

const GEAR_DATABASE = [
  { id: 'w1', name: 'Iron Sword', type: 'Weapon', rarity: 'Common', color: '#94a3b8', icon: Sword, stat: '+5 Gold / Quest', chance: 16 },
  { id: 'w2', name: 'Golden Katana', type: 'Weapon', rarity: 'Rare', color: '#38bdf8', icon: Sword, stat: '+15 Gold / Quest', chance: 10 },
  { id: 'w3', name: 'Bloodthirster', type: 'Weapon', rarity: 'Epic', color: '#ef4444', icon: Droplet, stat: '+2 HP / Quest', chance: 6 },
  { id: 'w4', name: 'Abyssal Cleaver', type: 'Weapon', rarity: 'Mythic', color: '#a855f7', icon: Axe, stat: '+30 Gold / Quest', chance: 1.33 },
  { id: 'a1', name: 'Leather Vest', type: 'Armor', rarity: 'Common', color: '#94a3b8', icon: Shield, stat: '+10 Max HP', chance: 16 },
  { id: 'a2', name: 'Vanguard Plate', type: 'Armor', rarity: 'Rare', color: '#38bdf8', icon: Shield, stat: '+25 Max HP', chance: 10 },
  { id: 'a3', name: 'Aegis Core', type: 'Armor', rarity: 'Epic', color: '#facc15', icon: Hexagon, stat: '+50 Max HP', chance: 6 },
  { id: 'a4', name: 'Phantom Cloak', type: 'Armor', rarity: 'Mythic', color: '#ec4899', icon: Wind, stat: 'Heal 100% on Level Up', chance: 1.33 },
  { id: 'ar1', name: 'Pouch of Wealth', type: 'Consumable', rarity: 'Common', color: '#94a3b8', icon: Package, stat: '+200 Instant Gold', chance: 16 },
  { id: 'ar2', name: 'Vitality Amulet', type: 'Artifact', rarity: 'Rare', color: '#38bdf8', icon: Heart, stat: '+10 HP & +5G / Quest', chance: 10 },
  { id: 'ar3', name: 'Emperor Signet', type: 'Consumable', rarity: 'Epic', color: '#facc15', icon: Crown, stat: 'Unlocks [Emperor] Title', chance: 6 },
  { id: 'ar4', name: 'Obsidian Egg', type: 'Consumable', rarity: 'Mythic', color: '#10b981', icon: Ghost, stat: 'Unlocks Secret Pet', chance: 1.34 },
];

// ==========================================
// 4. التصميمات (Styled Components)
// ==========================================
const Container = styled(motion.div)` padding: 15px; font-family: 'Oxanium', sans-serif; color: #fff; padding-bottom: 100px; max-width: 800px; margin: 0 auto; direction: rtl; @media (max-width: 480px){ padding: 10px; }`;

const TabsHeader = styled.div` display: flex; gap: 10px; margin-bottom: 25px; background: rgba(2, 6, 23, 0.8); padding: 10px; border-radius: 16px; border: 1px solid #1e293b; `;
const TabBtn = styled.button<{ $active: boolean, $color: string }>` flex: 1; padding: 12px; border-radius: 12px; border: none; font-family: 'Oxanium'; font-weight: 900; font-size: 12px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; background: ${(props) => props.$active ? props.$color : 'transparent'}; color: ${(props) => props.$active ? '#000' : '#94a3b8'}; box-shadow: ${(props) => props.$active ? `0 0 20px ${props.$color}60` : 'none'}; @media (max-width: 480px){ font-size: 10px; padding: 10px; }`;

const Viewer3DContainer = styled.div<{ $glow: string }>` width: 100%; height: 300px; background: radial-gradient(circle at center, #0f172a, #020617); border: 1px solid ${(props) => props.$glow}; border-radius: 24px; overflow: hidden; margin-bottom: 20px; box-shadow: inset 0 0 50px rgba(0,0,0,0.8), 0 0 30px ${(props) => props.$glow}40; position: relative; @media (max-width: 480px){ height: 250px; }`;
const ViewerOverlay = styled.div` position: absolute; bottom: 20px; left: 0; width: 100%; text-align: center; pointer-events: none; `;
const ViewerTitle = styled.h2<{ $color: string }>` margin: 0; font-size: 24px; font-weight: 900; color: ${(props) => props.$color}; text-transform: uppercase; letter-spacing: 3px; text-shadow: 0 0 15px ${(props) => props.$color}; @media (max-width: 480px){ font-size: 18px; }`;
const ViewerDesc = styled.p` margin: 5px 0 0 0; font-size: 12px; color: #cbd5e1; `;

const GridList = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; @media (max-width: 480px){ grid-template-columns: repeat(2, 1fr); gap: 10px; }`;
const ItemCard = styled(motion.div)<{ $unlocked: boolean, $color: string }>` background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(2, 6, 23, 0.95)); border: 1px solid ${(props) => props.$unlocked ? props.$color : '#334155'}; border-radius: 16px; padding: 15px; text-align: center; cursor: grab; filter: ${(props) => props.$unlocked ? 'none' : 'grayscale(100%) opacity(0.5)'}; transition: 0.3s; box-shadow: ${(props) => props.$unlocked ? `0 4px 15px ${props.$color}30` : 'none'}; &:hover { transform: ${(props) => props.$unlocked ? 'translateY(-5px)' : 'none'}; border-color: ${(props) => props.$unlocked ? '#fff' : '#334155'}; } &:active { cursor: grabbing; }`;

const GearSlot = styled.div<{ $color: string, $empty: boolean }>` background: ${(props) => props.$empty ? 'rgba(2, 6, 23, 0.8)' : `linear-gradient(180deg, ${props.$color}20, rgba(2, 6, 23, 0.9))`}; border: 2px dashed ${(props) => props.$empty ? '#334155' : props.$color}; border-radius: 20px; height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; box-shadow: ${(props) => props.$empty ? 'none' : `inset 0 0 20px ${props.$color}30, 0 0 20px ${props.$color}40`}; transition: 0.3s; @media (max-width: 480px){ height: 150px; }`;
const GearLabel = styled.div` position: absolute; top: -10px; background: #0b1120; padding: 2px 10px; font-size: 10px; font-weight: 900; color: #94a3b8; border: 1px solid #334155; border-radius: 10px; `;

const LootBoxArea = styled.div` display: flex; flex-direction: column; align-items: center; background: #020617; border: 1px solid #a855f7; border-radius: 24px; padding: 30px; box-shadow: inset 0 0 50px rgba(168, 85, 247, 0.1); `;
const PullBtn = styled.button` background: linear-gradient(90deg, #9333ea, #a855f7); color: #fff; border: none; padding: 15px 40px; border-radius: 12px; font-family: 'Oxanium'; font-size: 16px; font-weight: 900; letter-spacing: 2px; cursor: pointer; transition: 0.3s; margin-top: 20px; box-shadow: 0 0 30px rgba(168, 85, 247, 0.5); display: flex; align-items: center; gap: 10px; &:hover { transform: scale(1.05); filter: brightness(1.2); } &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; } `;

// ==========================================
// 5. المكون الرئيسي (Vault)
// ==========================================
const Vault = ({ player, setPlayer }: any) => {
  const [activeTab, setActiveTab] = useState<'trophies' | 'gear' | 'gacha'>('trophies');
  const [selectedTrophy, setSelectedTrophy] = useState(ACHIEVEMENTS[0]);
  
  const [gold, setGold] = useState(player?.gold || 0);
  const [inventory, setInventory] = useState<any[]>([]); 
  const [equipped, setEquipped] = useState<{ weapon: any, armor: any, artifact: any }>({ weapon: null, armor: null, artifact: null });

  const [isOpening, setIsOpening] = useState(false);
  const [pulledItem, setPulledItem] = useState<any>(null);

  useEffect(() => {
    if (player) {
       setGold(player.gold || 0);
       
       if (player.inventory) {
         const restoredInv = player.inventory.map((invItem: any) => {
           return GEAR_DATABASE.find(g => g.id === invItem.id) || invItem;
         }).filter(Boolean);
         setInventory(restoredInv);
       }

       if (player.equipped_gear) {
         const eq = player.equipped_gear;
         setEquipped({
           weapon: eq.weapon ? GEAR_DATABASE.find(g => g.id === eq.weapon.id) : null,
           armor: eq.armor ? GEAR_DATABASE.find(g => g.id === eq.armor.id) : null,
           artifact: eq.artifact ? GEAR_DATABASE.find(g => g.id === eq.artifact.id) : null,
         });
       }
    }
  }, [player]);

  const handlePull = async () => {
    if (gold < 1000) { toast.error("لا تملك ذهب كافي! (تحتاج 1000G)", { style: { background: '#2a0808', color: '#ef4444', border: '1px solid #ef4444' }}); return; }
    
    playSound('click'); playSound('open');
    const newGold = gold - 1000;
    setGold(newGold);
    setIsOpening(true);
    setPulledItem(null);

    let randomNum = Math.random() * 100;
    let selectedGear = GEAR_DATABASE[0];
    for (let item of GEAR_DATABASE) {
       if (randomNum <= item.chance) { selectedGear = item; break; }
       randomNum -= item.chance;
    }

    try {
      await supabase.from('elite_players').update({ gold: newGold }).eq('name', player.name);
      await supabase.from('elite_economy').insert([{ player_name: player.name, amount: 1000, currency: 'gold', operation: 'decrease', reason: 'Void Gacha Pull' }]);
      setPlayer({ ...player, gold: newGold });
    } catch(e) {}

    setTimeout(() => {
      setIsOpening(false);
      playSound('epic');
      setPulledItem(selectedGear);
      confetti({ particleCount: 300, spread: 150, startVelocity: 40, colors: [selectedGear.color, '#ffffff'] });
    }, 2000);
  };

  const handleClaim = async () => {
    playSound('claim');
    try {
      if (pulledItem.type === 'Consumable') {
        if (pulledItem.id === 'ar1') { 
           const newGold = gold + 200; setGold(newGold);
           await supabase.from('elite_players').update({ gold: newGold }).eq('name', player.name);
           setPlayer({ ...player, gold: newGold });
           toast.success('تمت إضافة 200 ذهب لمحفظتك!', { style: { color: '#eab308' }});
        } 
        else if (pulledItem.id === 'ar3') { 
           const currentTitles = player.titles || [];
           if(!currentTitles.includes('Emperor')) {
              const newTitles = [...currentTitles, 'Emperor'];
              await supabase.from('elite_players').update({ titles: newTitles }).eq('name', player.name);
              setPlayer({ ...player, titles: newTitles });
              toast.success('تم فتح لقب [Emperor]!', { style: { color: '#facc15' }});
           } else {
              toast.info('اللقب مملوك مسبقاً. تم تعويضك بـ 500 ذهب.');
              const newGold = gold + 500; setGold(newGold);
              await supabase.from('elite_players').update({ gold: newGold }).eq('name', player.name);
              setPlayer({ ...player, gold: newGold });
           }
        } 
        else if (pulledItem.id === 'ar4') { 
           const currentPets = player.pets || [];
           if(!currentPets.includes('Obsidian Dragon')) {
              const newPets = [...currentPets, 'Obsidian Dragon'];
              await supabase.from('elite_players').update({ pets: newPets }).eq('name', player.name);
              setPlayer({ ...player, pets: newPets });
              toast.success('تم فتح الروح السرية [Obsidian Dragon]!', { style: { color: '#10b981' }});
           } else {
              toast.info('الروح مملوكة مسبقاً. تم تعويضك بـ 1000 ذهب.');
              const newGold = gold + 1000; setGold(newGold);
              await supabase.from('elite_players').update({ gold: newGold }).eq('name', player.name);
              setPlayer({ ...player, gold: newGold });
           }
        }
      } else {
        const newInv = [...inventory, pulledItem];
        setInventory(newInv);
        await supabase.from('elite_players').update({ inventory: newInv }).eq('name', player.name);
        setPlayer({ ...player, inventory: newInv });
        toast.success(`تمت إضافة ${pulledItem.name} للمخزن!`);
      }
    } catch(e) { toast.error('حدث خطأ أثناء الاستلام.'); }
    setPulledItem(null);
  };

  const handleEquip = async (item: any) => {
    playSound('equip');
    const newEq = { ...equipped };
    if (item.type === 'Weapon') newEq.weapon = item;
    if (item.type === 'Armor') newEq.armor = item;
    if (item.type === 'Artifact') newEq.artifact = item;
    
    setEquipped(newEq);
    try {
       await supabase.from('elite_players').update({ equipped_gear: newEq }).eq('name', player.name);
       setPlayer({ ...player, equipped_gear: newEq });
       toast.success(`تم تجهيز ${item.name}!`, { style: { color: item.color, border: `1px solid ${item.color}`, background: '#020617' }});
    } catch(e) { toast.error('فشل التجهيز.'); }
  };

  const handleDrop = (e: any, targetSlot: string) => {
    e.preventDefault();
    try {
      const itemId = e.dataTransfer.getData('text/plain');
      if (!itemId) return;
      
      const item = inventory.find(i => i.id === itemId) || GEAR_DATABASE.find(i => i.id === itemId);
      if (!item) return;

      let isValid = false;
      if (targetSlot === 'Weapon' && item.type === 'Weapon') isValid = true;
      if (targetSlot === 'Armor' && (item.type === 'Armor' || item.type === 'Shield')) isValid = true;
      if (targetSlot === 'Artifact' && item.type === 'Artifact') isValid = true;

      if (isValid) {
        handleEquip(item);
      } else {
        playSound('click'); 
        toast.error(`❌ لا يمكنك وضع [${item.type}] في خانة [${targetSlot}]`, { style: { background: '#2a0808', color: '#ef4444', border: '1px solid #ef4444' }});
      }
    } catch (err) {}
  };

  return (
    <Container initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <Toaster position="top-center" theme="dark" />
      
      <TabsHeader>
        <TabBtn $active={activeTab === 'trophies'} $color="#eab308" onClick={() => { playSound('click'); setActiveTab('trophies'); }}><Trophy size={16}/> TROPHIES</TabBtn>
        <TabBtn $active={activeTab === 'gear'} $color="#0ea5e9" onClick={() => { playSound('click'); setActiveTab('gear'); }}><Shield size={16}/> ARMORY</TabBtn>
        <TabBtn $active={activeTab === 'gacha'} $color="#a855f7" onClick={() => { playSound('click'); setActiveTab('gacha'); }}><Gem size={16}/> THE VOID</TabBtn>
      </TabsHeader>

      <AnimatePresence mode="wait">
        {activeTab === 'trophies' && (
          <motion.div key="trophies" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Viewer3DContainer $glow={selectedTrophy.unlocked ? selectedTrophy.color : '#334155'}>
              <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} intensity={1} color={selectedTrophy.color} />
                <Environment preset="city" />
                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.5} />
                <TrophyModel type={selectedTrophy.type} color={selectedTrophy.unlocked ? selectedTrophy.color : '#1e293b'} />
                <Sparkles count={50} scale={5} size={2} speed={0.4} opacity={0.2} color={selectedTrophy.color} />
              </Canvas>
              <ViewerOverlay>
                <ViewerTitle $color={selectedTrophy.unlocked ? selectedTrophy.color : '#64748b'}>
                  {selectedTrophy.unlocked ? selectedTrophy.name : 'LOCKED'}
                </ViewerTitle>
                <ViewerDesc>{selectedTrophy.unlocked ? selectedTrophy.desc : 'Keep grinding to reveal this artifact.'}</ViewerDesc>
              </ViewerOverlay>
            </Viewer3DContainer>

            <GridList>
              {ACHIEVEMENTS.map(ach => (
                <ItemCard key={ach.id} $unlocked={ach.unlocked} $color={ach.color} onClick={() => { playSound('click'); setSelectedTrophy(ach); }}>
                  <div style={{ background: `${ach.color}20`, padding: 10, borderRadius: '50%', display: 'inline-block', marginBottom: 10 }}>
                    {ach.unlocked ? <Crown size={24} color={ach.color} /> : <Lock size={24} color="#64748b" />}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 'bold' }}>{ach.name}</div>
                </ItemCard>
              ))}
            </GridList>
          </motion.div>
        )}

        {activeTab === 'gear' && (
          <motion.div key="gear" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 30 }}>
              <GearSlot 
                $color={equipped.weapon?.color || '#334155'} 
                $empty={!equipped.weapon}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 'Weapon')}
              >
                <GearLabel>WEAPON</GearLabel>
                {equipped.weapon ? (
                  <>
                    <equipped.weapon.icon size={40} color={equipped.weapon.color} style={{ filter: `drop-shadow(0 0 10px ${equipped.weapon.color})` }} />
                    <div style={{ fontSize: 11, fontWeight: '900', color: '#fff', marginTop: 15, textAlign: 'center' }}>{equipped.weapon.name}</div>
                    <div style={{ fontSize: 9, color: equipped.weapon.color, background: `${equipped.weapon.color}20`, padding: '2px 6px', borderRadius: 4, marginTop: 5 }}>{equipped.weapon.stat}</div>
                  </>
                ) : <Sword size={30} color="#334155" />}
              </GearSlot>
              
              <GearSlot 
                $color={equipped.armor?.color || '#334155'} 
                $empty={!equipped.armor}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 'Armor')}
              >
                <GearLabel>ARMOR</GearLabel>
                {equipped.armor ? (
                  <>
                    <equipped.armor.icon size={40} color={equipped.armor.color} style={{ filter: `drop-shadow(0 0 10px ${equipped.armor.color})` }} />
                    <div style={{ fontSize: 11, fontWeight: '900', color: '#fff', marginTop: 15, textAlign: 'center' }}>{equipped.armor.name}</div>
                    <div style={{ fontSize: 9, color: equipped.armor.color, background: `${equipped.armor.color}20`, padding: '2px 6px', borderRadius: 4, marginTop: 5 }}>{equipped.armor.stat}</div>
                  </>
                ) : <Shield size={30} color="#334155" />}
              </GearSlot>

              <GearSlot 
                $color={equipped.artifact?.color || '#334155'} 
                $empty={!equipped.artifact}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 'Artifact')}
              >
                <GearLabel>ARTIFACT</GearLabel>
                {equipped.artifact ? (
                  <>
                    <equipped.artifact.icon size={40} color={equipped.artifact.color} style={{ filter: `drop-shadow(0 0 10px ${equipped.artifact.color})` }} />
                    <div style={{ fontSize: 11, fontWeight: '900', color: '#fff', marginTop: 15, textAlign: 'center' }}>{equipped.artifact.name}</div>
                    <div style={{ fontSize: 9, color: equipped.artifact.color, background: `${equipped.artifact.color}20`, padding: '2px 6px', borderRadius: 4, marginTop: 5 }}>{equipped.artifact.stat}</div>
                  </>
                ) : <Hexagon size={30} color="#334155" />}
              </GearSlot>
            </div>

            <h3 style={{ fontSize: 14, color: '#0ea5e9', borderBottom: '1px solid #1e293b', paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}><Package size={16}/> INVENTORY (ARMORY)</h3>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 15, textAlign: 'center' }}>اسحب العتاد إلى الخانة العلوية لتجهيزه (Drag & Drop)</div>
            
            {inventory.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '20px', background: '#0f172a', borderRadius: '16px', border: '1px dashed #1e293b' }}>المخزن فارغ. استخدم صندوق The Void للحصول على عتاد.</div>
            ) : (
              <GridList>
                {inventory.map((item, idx) => {
                  const Icon = item.icon || Sword;
                  return (
                    <ItemCard 
                      key={idx} 
                      $unlocked={true} 
                      $color={item.color} 
                      onClick={() => handleEquip(item)}
                      draggable
                      onDragStart={(e: any) => {
                        e.dataTransfer.setData('text/plain', item.id);
                        e.currentTarget.style.opacity = '0.4';
                        playSound('click');
                      }}
                      onDragEnd={(e: any) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      <Icon size={24} color={item.color} style={{ margin: '0 auto 10px auto', filter: `drop-shadow(0 0 5px ${item.color})` }} />
                      <div style={{ fontSize: 11, fontWeight: '900', color: '#fff' }}>{item.name}</div>
                      <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 4 }}>{item.rarity}</div>
                    </ItemCard>
                  );
                })}
              </GridList>
            )}
          </motion.div>
        )}

        {activeTab === 'gacha' && (
          <motion.div key="gacha" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LootBoxArea>
              <div style={{ width: '100%', height: 250, position: 'relative' }}>
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                  <ambientLight intensity={0.2} />
                  <spotLight position={[0, 5, 5]} intensity={2} color="#a855f7" />
                  <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
                  <LootBox3D isOpening={isOpening} />
                  <Sparkles count={isOpening ? 200 : 20} scale={4} size={isOpening ? 4 : 2} speed={isOpening ? 2 : 0.2} color="#a855f7" />
                </Canvas>
                
                {pulledItem && (
                  <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 12 }} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(2, 6, 23, 0.9)', borderRadius: 20, border: `2px solid ${pulledItem.color}`, boxShadow: `0 0 50px ${pulledItem.color}80` }}>
                    <pulledItem.icon size={60} color={pulledItem.color} style={{ filter: `drop-shadow(0 0 20px ${pulledItem.color})` }} />
                    <h2 style={{ color: '#fff', fontSize: 24, margin: '15px 0 5px 0', textTransform: 'uppercase' }}>{pulledItem.name}</h2>
                    <div style={{ color: pulledItem.color, fontWeight: 'bold', fontSize: 14, letterSpacing: 2, textTransform: 'uppercase' }}>{pulledItem.rarity} {pulledItem.type}</div>
                    <div style={{ background: `${pulledItem.color}20`, padding: '5px 15px', borderRadius: 8, marginTop: 15, color: pulledItem.color, fontWeight: '900' }}>{pulledItem.stat}</div>
                  </motion.div>
                )}
              </div>

              {!pulledItem && (
                <PullBtn onClick={handlePull} disabled={isOpening}>
                  {isOpening ? 'SUMMONING...' : <><Gem size={18} /> SUMMON RELIC (1000G)</>}
                </PullBtn>
              )}
              {pulledItem && (
                <PullBtn onClick={handleClaim} style={{ background: '#1e293b', boxShadow: 'none', color: '#fff' }}>CLAIM REWARD</PullBtn>
              )}
              
              <div style={{ marginTop: 20, fontSize: 12, color: '#94a3b8', fontWeight: 'bold' }}>CURRENT GOLD: <span style={{ color: '#eab308' }}>{gold}</span></div>
            </LootBoxArea>

            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '15px', marginTop: '20px', fontSize: '11px', color: '#94a3b8' }}>
              <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>RNG DROP RATES:</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Common: 48%</span>
                <span style={{ color: '#38bdf8' }}>Rare: 30%</span>
                <span style={{ color: '#facc15' }}>Epic: 18%</span>
                <span style={{ color: '#ec4899' }}>Mythic: 4%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default Vault;