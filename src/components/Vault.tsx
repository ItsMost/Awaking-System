import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { toast, Toaster } from 'sonner';
import { 
  Trophy, Shield, Sword, Gem, Lock, Package, 
  Flame, Crown, Ghost, Wind, Axe, Heart, 
  Clock, Footprints, Info, XCircle, ChevronRight, Dices
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ==========================================
// 1. المحرك الصوتي 
// ==========================================
const playSound = (type: 'open' | 'epic' | 'click' | 'equip' | 'claim' | 'shake') => {
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
  } else if (type === 'shake') {
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(200, now + 0.1);
    gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
    osc.start(); osc.stop(now + 0.1);
  } else {
    osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now); osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
    gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(); osc.stop(now + 0.1);
  }
};

// ==========================================
// 2. مجسم الرياضي الآلي (ثابت)
// ==========================================
const CyberAthlete = () => {
  return (
    <group scale={1.3} position={[0, -0.2, 0]} rotation={[0, -0.2, 0]}>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.3, 0.4, 0.3]} />
        <meshStandardMaterial color="#020617" emissive="#0ea5e9" emissiveIntensity={0.3} wireframe />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.6, 0.9, 0.25]} />
        <meshStandardMaterial color="#020617" emissive="#0ea5e9" emissiveIntensity={0.2} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.6, 0.13]}>
        <circleGeometry args={[0.1, 32]} />
        <meshBasicMaterial color="#00f2ff" />
      </mesh>
      <mesh position={[-0.4, 0.5, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#1e293b" emissive="#38bdf8" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0.4, 0.5, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#1e293b" emissive="#38bdf8" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[-0.18, -0.35, 0]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.18, -0.35, 0]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  );
};

// ==========================================
// 3. قاعدة البيانات
// ==========================================
const ACHIEVEMENTS = [
  { id: 'ach1', name: 'Awakened', desc: 'أول تسجيل دخول للنظام.', color: '#00f2ff', unlocked: true },
  { id: 'ach2', name: 'Iron Will', desc: 'الوصول لستريك 7 أيام.', color: '#10b981', unlocked: true },
  { id: 'ach3', name: 'Monarch', desc: 'الوصول للمستوى 30.', color: '#eab308', unlocked: false },
  { id: 'ach4', name: 'Abyss Walker', desc: 'شراء 5 أرواح من المتجر.', color: '#a855f7', unlocked: false },
  { id: 'ach5', name: 'Legendary Hunter', desc: 'الحصول على عتاد Mythic.', color: '#ec4899', unlocked: false },
];

const PET_MAP: Record<string, any> = {
  'Shadow Owl Eye': { name: 'Shadow Owl', icon: Ghost, color: '#a855f7', statStr: '+5% Void Luck' },
  'Healing Phoenix Ember': { name: 'Phoenix', icon: Flame, color: '#ef4444', statStr: '+5 HP Daily' },
  'Golden Wyvern Scale': { name: 'Wyvern', icon: Crown, color: '#eab308', statStr: '+15% Extra Gold' },
  'Frost Wolf Fang': { name: 'Frost Wolf', icon: Wind, color: '#0ea5e9', statStr: 'Arcade Boost' },
  'Iron Golem Core': { name: 'Iron Golem', icon: Shield, color: '#94a3b8', statStr: 'Penalty Resist' },
  'Obsidian Dragon': { name: 'Obsidian Dragon', icon: Gem, color: '#10b981', statStr: 'Yields Gems 💎' }
};

const GEAR_DATABASE = [
  { id: 'w1', name: 'Iron Sword', type: 'Weapon', rarity: 'Common', color: '#94a3b8', icon: Sword, statStr: '+5 Gold / Quest', bonus: { gold: 5, hp: 0 }, durationDays: 3 },
  { id: 'w2', name: 'Elite Dagger', type: 'Weapon', rarity: 'Rare', color: '#38bdf8', icon: Sword, statStr: '+15 Gold / Quest', bonus: { gold: 15, hp: 0 }, durationDays: 5 },
  { id: 'w3', name: 'Abyssal Cleaver', type: 'Weapon', rarity: 'Mythic', color: '#ec4899', icon: Axe, statStr: '+30 Gold & Crit', bonus: { gold: 30, hp: 0 }, durationDays: 14 },
  
  { id: 'a1', name: 'Leather Vest', type: 'Armor', rarity: 'Common', color: '#94a3b8', icon: Shield, statStr: '+10 Max HP', bonus: { gold: 0, hp: 10 }, durationDays: 3 },
  { id: 'a2', name: 'Vanguard Plate', type: 'Armor', rarity: 'Epic', color: '#facc15', icon: Shield, statStr: '+30 Max HP', bonus: { gold: 0, hp: 30 }, durationDays: 7 },
  { id: 'a3', name: 'Titanium Cuirass', type: 'Armor', rarity: 'Rare', color: '#38bdf8', icon: Shield, statStr: '+20 Max HP', bonus: { gold: 0, hp: 20 }, durationDays: 5 },
  
  { id: 'f1', name: 'Runner Cleats', type: 'Footwear', rarity: 'Common', color: '#94a3b8', icon: Footprints, statStr: 'Minor Agility', bonus: { gold: 0, hp: 0 }, durationDays: 3 },
  { id: 'f2', name: 'Hermes Sneakers', type: 'Footwear', rarity: 'Epic', color: '#facc15', icon: Footprints, statStr: 'Arcade Agility', bonus: { gold: 0, hp: 0 }, durationDays: 7 },
  { id: 'f3', name: 'Shadow Treads', type: 'Footwear', rarity: 'Mythic', color: '#ec4899', icon: Wind, statStr: 'Max Arcade Boost', bonus: { gold: 0, hp: 0 }, durationDays: 14 },
  
  { id: 'p_egg', name: 'Obsidian Egg', type: 'Pet', rarity: 'Mythic', color: '#10b981', icon: Ghost, statStr: 'Unlocks Secret Dragon', bonus: { gold: 0, hp: 0 }, durationDays: 0 },
];

const CHESTS = [
  { id: 'c1', name: 'Standard Chest', price: 500, color: '#94a3b8', rates: { Common: 70, Rare: 25, Epic: 5, Mythic: 0 } },
  { id: 'c2', name: 'Premium Chest', price: 1200, color: '#eab308', rates: { Common: 30, Rare: 50, Epic: 18, Mythic: 2 } },
  { id: 'c3', name: 'Abyssal Relic', price: 3000, color: '#a855f7', rates: { Common: 0, Rare: 30, Epic: 60, Mythic: 10 } },
];

const formatTimeLeft = (expiresAt: number | null) => {
  if (!expiresAt) return '';
  const diff = expiresAt - Date.now();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
};

// ==========================================
// 4. التصميمات
// ==========================================
const Container = styled(motion.div)` padding: 15px; font-family: 'Oxanium', sans-serif; color: #fff; padding-bottom: 100px; max-width: 600px; margin: 0 auto; direction: rtl; `;

const TabsHeader = styled.div` display: flex; gap: 8px; margin-bottom: 20px; background: rgba(2, 6, 23, 0.8); padding: 8px; border-radius: 12px; border: 1px solid #1e293b; `;
const TabBtn = styled.button<{ $active: boolean, $color: string }>` flex: 1; padding: 10px; border-radius: 10px; border: none; font-family: 'Oxanium'; font-weight: bold; font-size: 11px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 5px; background: ${(props) => props.$active ? props.$color : 'transparent'}; color: ${(props) => props.$active ? '#000' : '#94a3b8'}; box-shadow: ${(props) => props.$active ? `0 0 15px ${props.$color}60` : 'none'}; `;

const ArmoryLayout = styled.div` display: grid; grid-template-columns: 90px 1fr 90px; gap: 10px; align-items: center; margin-bottom: 20px; @media (max-width: 480px){ grid-template-columns: 85px 1fr 85px; gap: 8px; }`;
const SideSlots = styled.div` display: flex; flex-direction: column; gap: 15px; `;
const GearSlot = styled.div<{ $color: string, $empty: boolean }>` background: ${(props) => props.$empty ? 'rgba(2, 6, 23, 0.8)' : `linear-gradient(180deg, ${props.$color}20, rgba(2, 6, 23, 0.9))`}; border: 2px dashed ${(props) => props.$empty ? '#334155' : props.$color}; border-radius: 14px; height: 95px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; box-shadow: ${(props) => props.$empty ? 'none' : `inset 0 0 20px ${props.$color}30`}; @media (max-width: 480px){ height: 90px; }`;
const GearLabel = styled.div` position: absolute; top: -8px; background: #0b1120; padding: 2px 6px; font-size: 8px; font-weight: 900; color: #94a3b8; border: 1px solid #334155; border-radius: 6px; text-transform: uppercase; `;
const UnequipBtn = styled.button` position: absolute; top: -5px; right: -5px; background: #ef4444; color: #fff; border: none; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; box-shadow: 0 0 10px rgba(239,68,68,0.5); transition: 0.2s; &:active { transform: scale(0.8); }`;

const Viewer3DContainer = styled.div` width: 100%; height: 220px; display: flex; align-items: center; justify-content: center; position: relative; background: radial-gradient(circle at center, #0f172a, transparent); border-radius: 20px; border: 1px solid #1e293b; box-shadow: inset 0 0 30px rgba(0,0,0,0.5); overflow: hidden; `;

const StatsBtn = styled.button` width: 100%; background: #0f172a; color: #38bdf8; border: 1px solid #1e293b; padding: 12px; border-radius: 12px; font-family: 'Oxanium'; font-size: 13px; font-weight: bold; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 25px; transition: 0.3s; &:hover { background: #1e293b; border-color: #38bdf8; }`;

const GridList = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; `;
const ItemCard = styled(motion.div)<{ $color: string }>` background: rgba(15, 23, 42, 0.9); border: 1px solid ${(props) => props.$color}; border-radius: 12px; padding: 12px; text-align: center; cursor: pointer; transition: 0.3s; box-shadow: inset 0 0 20px ${(props) => props.$color}10; position: relative; &:hover { transform: translateY(-3px); border-color: #fff; } &:active { transform: scale(0.95); }`;
const TimeBadge = styled.div<{ $color: string }>` position: absolute; top: -6px; left: 50%; transform: translateX(-50%); background: #020617; border: 1px solid ${(props) => props.$color}; color: ${(props) => props.$color}; padding: 2px 6px; font-size: 8px; font-weight: 900; border-radius: 6px; display: flex; align-items: center; gap: 3px; white-space: nowrap; `;

const ChestCard = styled.div<{ $color: string }>` background: #0b1120; border: 2px solid ${(props) => props.$color}50; border-radius: 16px; padding: 15px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; transition: 0.3s; &:hover { border-color: ${(props) => props.$color}; box-shadow: 0 0 20px ${(props) => props.$color}30; }`;
const BuyBtn = styled.button<{ $color: string }>` background: ${(props) => props.$color}20; color: ${(props) => props.$color}; border: 1px solid ${(props) => props.$color}; padding: 8px 15px; border-radius: 8px; font-weight: 900; font-family: 'Oxanium'; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: 0.3s; &:hover { background: ${(props) => props.$color}; color: #000; }`;

// 🚨 تصميم الـ Coming Soon 🚨
const ComingSoonWrapper = styled.div` position: relative; width: 100%; min-height: 400px; border-radius: 16px; overflow: hidden; `;
const BlurredContent = styled.div` filter: blur(5px); opacity: 0.5; pointer-events: none; user-select: none; `;
const ComingSoonOverlay = styled.div` position: absolute; inset: 0; z-index: 50; display: flex; alignItems: center; justify-content: center; backdrop-filter: blur(2px); background: rgba(2, 6, 23, 0.4); `;
const ComingSoonBadge = styled.div` background: #0f172a; border: 1px solid #334155; padding: 12px 25px; border-radius: 24px; font-size: 14px; font-weight: 900; color: #94a3b8; display: flex; align-items: center; gap: 8px; letter-spacing: 2px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); `;


// ==========================================
// 5. المكون الرئيسي (Vault)
// ==========================================
const Vault = ({ player, setPlayer }: any) => {
  // 🚨 التاب الافتراضي Trophies 🚨
  const [activeTab, setActiveTab] = useState<'trophies' | 'armory' | 'gacha'>('trophies');
  
  const [gold, setGold] = useState(player?.gold || 0);
  const [inventory, setInventory] = useState<any[]>([]); 
  const [equipped, setEquipped] = useState<{ weapon: any, armor: any, footwear: any, pet: any }>({ 
    weapon: null, armor: null, footwear: null, pet: null 
  });

  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (player) {
       setGold(player.gold || 0);
       const now = Date.now();
       let invChanged = false; let eqChanged = false;

       let currentInv = player.inventory || [];
       const validInv = currentInv.filter((invItem: any) => {
           if (invItem.type === 'Headgear' || invItem.type === 'Artifact') return false;
           return !invItem.expiresAt || invItem.expiresAt > now; 
       }).map((invItem: any) => {
           const dbItem = GEAR_DATABASE.find(g => g.id === invItem.id);
           return { ...(dbItem || invItem), icon: dbItem ? dbItem.icon : Sword, instanceId: invItem.instanceId, expiresAt: invItem.expiresAt };
       });

       if (validInv.length !== currentInv.length) invChanged = true;

       let eq = player.equipped_gear || { weapon: null, armor: null, footwear: null, pet: null };
       let validEq: any = { ...eq };

       if (validEq.headgear) { validEq.headgear = null; eqChanged = true; }
       if (validEq.artifact) { validEq.artifact = null; eqChanged = true; }

       const checkSlot = (slotName: string, FallbackIcon: any) => {
          if (validEq[slotName]) {
             const dbItem = GEAR_DATABASE.find(g => g.id === validEq[slotName].id);
             validEq[slotName] = { ...(dbItem || validEq[slotName]), icon: dbItem ? dbItem.icon : FallbackIcon, instanceId: validEq[slotName].instanceId, expiresAt: validEq[slotName].expiresAt };
             if (validEq[slotName].expiresAt && validEq[slotName].expiresAt < now) { validEq[slotName] = null; eqChanged = true; }
          }
       };

       checkSlot('weapon', Sword); checkSlot('armor', Shield); 
       checkSlot('footwear', Footprints); checkSlot('pet', Ghost); 

       setInventory(validInv); setEquipped(validEq);

       if (invChanged || eqChanged) {
          const updatedPlayer = { ...player, inventory: validInv, equipped_gear: validEq };
          setPlayer(updatedPlayer);
          localStorage.setItem('elite_system_active_session', JSON.stringify(updatedPlayer));
          supabase.from('elite_players').update({ inventory: validInv, equipped_gear: validEq }).eq('name', player.name).then();
       }
    }
  }, [player]);

  const totalStats = useMemo(() => {
    let tGold = 0; let tHp = 0;
    Object.values(equipped).forEach((item: any) => {
      if (item && item.bonus) {
        tGold += item.bonus.gold || 0;
        tHp += item.bonus.hp || 0;
      }
    });
    const activePetStr = player?.active_pet;
    const petInfo = activePetStr ? PET_MAP[activePetStr] : null;
    if (petInfo && petInfo.name === 'Wyvern') tGold += 15; 
    
    return { gold: tGold, hp: tHp };
  }, [equipped, player?.active_pet]);

  const renderSlot = (slotKey: string, label: string, DefaultIcon: any) => {
     const item = (equipped as any)[slotKey];
     const ItemIcon = item?.icon || DefaultIcon;
     return (
        <GearSlot $color={item?.color || '#334155'} $empty={!item}>
          <GearLabel>{label}</GearLabel>
          {item ? (
            <>
              <ItemIcon size={26} color={item.color} style={{ filter: `drop-shadow(0 0 10px ${item.color})` }} />
              <div style={{ fontSize: 10, fontWeight: '900', color: '#fff', marginTop: 5, textAlign: 'center' }}>{item.name}</div>
            </>
          ) : <DefaultIcon size={24} color="#334155" />}
        </GearSlot>
     );
  };

  const renderPetSlot = () => {
    const activePetStr = player?.active_pet;
    const currentPetInfo = activePetStr ? PET_MAP[activePetStr] : null;

    return (
        <GearSlot $color={currentPetInfo ? currentPetInfo.color : '#334155'} $empty={!currentPetInfo}>
          <GearLabel>PET</GearLabel>
          {currentPetInfo ? (
            <>
              <currentPetInfo.icon size={26} color={currentPetInfo.color} style={{ filter: `drop-shadow(0 0 10px ${currentPetInfo.color})` }} />
              <div style={{ fontSize: 10, fontWeight: '900', color: '#fff', marginTop: 5, textAlign: 'center' }}>{currentPetInfo.name}</div>
            </>
          ) : <Ghost size={24} color="#334155" />}
        </GearSlot>
    )
  };

  return (
    <Container initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <Toaster position="top-center" theme="dark" />
      
      {/* 🚨 الترتيب: Trophies الأول 🚨 */}
      <TabsHeader>
        <TabBtn $active={activeTab === 'trophies'} $color="#eab308" onClick={() => { playSound('click'); setActiveTab('trophies'); }}><Trophy size={14}/> TROPHIES</TabBtn>
        <TabBtn $active={activeTab === 'armory'} $color="#0ea5e9" onClick={() => { playSound('click'); setActiveTab('armory'); }}><Shield size={14}/> ARMORY</TabBtn>
        <TabBtn $active={activeTab === 'gacha'} $color="#a855f7" onClick={() => { playSound('click'); setActiveTab('gacha'); }}><Dices size={14}/> THE VOID</TabBtn>
      </TabsHeader>

      <AnimatePresence mode="wait">
        
        {/* 🚨 Trophies Tab (مفتوحة وواضحة بالكامل) 🚨 */}
        {activeTab === 'trophies' && (
          <motion.div key="trophies" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
              {ACHIEVEMENTS.map(ach => (
                <div key={ach.id} style={{ display: 'flex', alignItems: 'center', gap: 15, background: '#0b1120', border: `1px solid ${ach.unlocked ? ach.color : '#1e293b'}`, padding: 15, borderRadius: 12, opacity: ach.unlocked ? 1 : 0.5 }}>
                  <div style={{ background: `${ach.unlocked ? ach.color : '#334155'}20`, padding: 10, borderRadius: '50%' }}>
                    {ach.unlocked ? <Crown size={24} color={ach.color} /> : <Lock size={24} color="#64748b" />}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: '900', color: ach.unlocked ? '#fff' : '#64748b' }}>{ach.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{ach.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 🚨 Armory Tab (مقفولة ومضببة Coming Soon) 🚨 */}
        {activeTab === 'armory' && (
          <motion.div key="armory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ComingSoonWrapper>
              <ComingSoonOverlay>
                 <ComingSoonBadge><Lock size={16} /> COMING SOON</ComingSoonBadge>
              </ComingSoonOverlay>
              
              <BlurredContent>
                <ArmoryLayout>
                  <SideSlots>
                    {renderSlot('weapon', 'Weapon', Sword)}
                    {renderSlot('armor', 'Armor', Shield)}
                  </SideSlots>

                  <Viewer3DContainer>
                    <Canvas camera={{ position: [0, 0.5, 3.5], fov: 45 }}>
                      <ambientLight intensity={0.8} />
                      <spotLight position={[2, 4, 4]} intensity={2} color="#00f2ff" />
                      <pointLight position={[-2, -2, -2]} intensity={1} color="#38bdf8" />
                      <CyberAthlete />
                      <Sparkles count={50} scale={2} size={2} speed={0.4} opacity={0.5} color="#38bdf8" />
                    </Canvas>
                  </Viewer3DContainer>

                  <SideSlots>
                    {renderSlot('footwear', 'Footwear', Footprints)}
                    {renderPetSlot()}
                  </SideSlots>
                </ArmoryLayout>

                <StatsBtn>
                  <Info size={16} /> عرض الأرقام والقدرات الحالية
                </StatsBtn>

                <div style={{ background: '#1e293b', padding: 1, marginBottom: 20, opacity: 0.5 }} />
                
                <GridList>
                  {/* Fake items for the blurred background */}
                  {[1, 2, 3, 4].map(i => (
                     <ItemCard key={i} $color="#334155">
                        <Sword size={24} color="#334155" style={{ margin: '5px auto' }} />
                        <div style={{ fontSize: 10, fontWeight: '900', color: '#334155' }}>LOCKED GEAR</div>
                     </ItemCard>
                  ))}
                </GridList>
              </BlurredContent>
            </ComingSoonWrapper>
          </motion.div>
        )}

        {/* 🚨 The Void Tab (مقفولة ومضببة Coming Soon) 🚨 */}
        {activeTab === 'gacha' && (
          <motion.div key="gacha" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ComingSoonWrapper>
              <ComingSoonOverlay>
                 <ComingSoonBadge><Lock size={16} /> COMING SOON</ComingSoonBadge>
              </ComingSoonOverlay>
              
              <BlurredContent>
                <div style={{ textAlign: 'center', fontSize: 14, color: '#eab308', fontWeight: '900', marginBottom: 20 }}>
                  رصيدك الحالي: {gold} GOLD
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                  {CHESTS.map(chest => (
                    <ChestCard key={chest.id} $color={chest.color}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: '900', color: chest.color, display: 'flex', alignItems: 'center', gap: 5 }}><Package size={18}/> {chest.name}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 5 }}>Mythic Chance: {chest.rates.Mythic}%</div>
                      </div>
                      <BuyBtn $color={chest.color}>
                        {chest.price}G <ChevronRight size={16}/>
                      </BuyBtn>
                    </ChestCard>
                  ))}
                </div>
              </BlurredContent>
            </ComingSoonWrapper>
          </motion.div>
        )}

      </AnimatePresence>
    </Container>
  );
};

export default Vault;