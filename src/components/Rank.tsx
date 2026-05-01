import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { Toaster, toast } from 'sonner';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  Trophy, Medal, Shield, User, ChevronUp, Activity, Target, Zap, Crown, Lock, Unlock,
  ShieldAlert, HeartPulse, Scale, Percent, CheckCircle, Clock, X, Database, Dumbbell,
  TrendingUp, CalendarDays, Globe, Moon, Eye, Wind, Footprints, Lock as LockIcon, Gem,
  Coffee, Flame, XCircle, Inbox, Check, FileImage, Sword, Skull, Crosshair, Heart,
  Droplet, Search, Key, Plus, Copy, Trash2, Infinity as InfinityIcon, Axe, Anchor,
  Fingerprint, Hexagon, Cpu, RotateCcw, Ghost, Award, Star, Filter, CheckSquare
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ==========================================
// 1. المحرك الصوتي
// ==========================================
let sharedAudioCtx: AudioContext | null = null;
let lastPlayTime = 0;

const getAudioContext = () => {
  if (!sharedAudioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) sharedAudioCtx = new Ctx();
  }
  if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume();
  return sharedAudioCtx;
};

const canPlay = () => {
  const now = Date.now();
  if (now - lastPlayTime < 50) return false;
  lastPlayTime = now;
  return true;
};

const playClick = () => {
  if (!canPlay()) return;
  const ctx = getAudioContext(); if (!ctx) return;
  const osc = ctx.createOscillator(); const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  osc.start(); osc.stop(ctx.currentTime + 0.1);
};

const playHover = () => {
  if (!canPlay()) return;
  const ctx = getAudioContext(); if (!ctx) return;
  const osc = ctx.createOscillator(); const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'sine'; osc.frequency.setValueAtTime(1200, ctx.currentTime);
  gain.gain.setValueAtTime(0.02, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  osc.start(); osc.stop(ctx.currentTime + 0.05);
};

const playUnlock = () => {
  if (!canPlay()) return;
  const ctx = getAudioContext(); if (!ctx) return;
  const osc = ctx.createOscillator(); const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'square'; osc.frequency.setValueAtTime(400, ctx.currentTime); osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1); osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
  osc.start(); osc.stop(ctx.currentTime + 0.4);
};

// ==========================================
// 2. الثوابت وقواعد البيانات
// ==========================================
const PETS_DATABASE = [
  { name: 'Golden Wyvern Core', type: 'wyvern', color: '#eab308' },
  { name: 'Healing Phoenix Ember', type: 'phoenix', color: '#ef4444' },
  { name: 'Shadow Owl Eye', type: 'owl', color: '#a855f7' },
  { name: 'Iron Golem Matrix', type: 'golem', color: '#0ea5e9' },
  { name: 'Frost Wolf Soul', type: 'wolf', color: '#38bdf8' },
  { name: 'Emerald Dragon Scale', type: 'emerald', color: '#10b981' }
];

const getLocalYYYYMMDD = (date: Date | string) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const calculateLevelData = (totalXp: number) => {
  let level = 1; let currentXp = totalXp; let expNeededForNextLevel = 650;
  while (currentXp >= expNeededForNextLevel) { currentXp -= expNeededForNextLevel; level++; expNeededForNextLevel = Math.min(level * 150 + 500, 4000); }
  return { level, xpInCurrentLevel: currentXp, expNeededForNextLevel };
};

const NORMAL_DAILY_QUESTS = ['Practice', 'Hydration Target (3L)', 'Nutritional Compliance', 'Functional Mobility', 'Recovery Cooldown'];
const INJURED_DAILY_QUESTS = ['Practice (Rehab)', 'Hydration Target (3L)', 'Tissue Repair Nutrition', 'Rehab Mobility Protocol', 'Thermal / Cryotherapy'];
const FRIDAY_DIRECTIVES = ['Weekly Volume Compliance', 'Perfect Microcycle Streak'];
const BIWEEKLY_QUESTS = ['Recovery Logistics'];
const MONTHLY_QUESTS = ['Supplement Inventory', 'InBody Assessment'];

const QUEST_REWARDS: Record<string, { exp: number; gold: number }> = {
  'Practice': { exp: 100, gold: 30 }, 'Practice (Rehab)': { exp: 90, gold: 30 },
  'Hydration Target (3L)': { exp: 30, gold: 10 }, 'Nutritional Compliance': { exp: 30, gold: 10 },
  'Functional Mobility': { exp: 35, gold: 15 }, 'Recovery Cooldown': { exp: 20, gold: 10 },
  'Rehab Mobility Protocol': { exp: 35, gold: 15 }, 'Thermal / Cryotherapy': { exp: 20, gold: 10 },
  'Weekly Volume Compliance': { exp: 150, gold: 100 }, 'Perfect Microcycle Streak': { exp: 150, gold: 100 },
  'Recovery Logistics': { exp: 100, gold: 50 }, 'Supplement Inventory': { exp: 100, gold: 50 },
  'InBody Assessment': { exp: 75, gold: 200 }, 'Disciplinary Execution': { exp: 0, gold: 0 },
};

const getRankInfo = (level: number) => {
  if (level >= 30) return { name: 'ELITE', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' };
  if (level >= 25) return { name: 'MASTER', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' };
  if (level >= 20) return { name: 'DIAMOND', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)' };
  if (level >= 15) return { name: 'PLATINUM', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.2)' };
  if (level >= 10) return { name: 'GOLD', color: '#eab308', glow: 'none' };
  if (level >= 5)  return { name: 'SILVER', color: '#94a3b8', glow: 'none' };
  return { name: 'BRONZE', color: '#b45309', glow: 'none' };
};

const CLASS_MAPPING = [
  { id: 'sword', keys: ['sword', 'combat', 'blade', 'warrior'], name: 'Blade Master', baseIcon: Sword, evolvedIcon: Axe, color: '#00f2ff' },
  { id: 'flame', keys: ['flame', 'fire', 'pyro'], name: 'Pyromancer', baseIcon: Flame, evolvedIcon: Zap, color: '#ef4444' },
  { id: 'zap', keys: ['zap', 'energy', 'lightning', 'thunder'], name: 'Storm Bringer', baseIcon: Zap, evolvedIcon: Flame, color: '#eab308' },
  { id: 'dumbbell', keys: ['dumbbell', 'power', 'barbell', 'strength'], name: 'Titan Lifter', baseIcon: Dumbbell, evolvedIcon: Anchor, color: '#f97316' },
  { id: 'moon', keys: ['moon', 'shadow', 'dark'], name: 'Shadow Assassin', baseIcon: Moon, evolvedIcon: Ghost, color: '#d8b4fe' },
  { id: 'eye', keys: ['eye', 'visionary', 'seer'], name: 'Visionary', baseIcon: Eye, evolvedIcon: Moon, color: '#818cf8' },
  { id: 'shield', keys: ['shield', 'defense', 'tank', 'guardian'], name: 'Iron Guardian', baseIcon: Shield, evolvedIcon: Hexagon, color: '#64748b' },
  { id: 'crown', keys: ['crown', 'royal', 'king', 'monarch'], name: 'Absolute Monarch', baseIcon: Crown, evolvedIcon: Award, color: '#f59e0b' },
  { id: 'skull', keys: ['skull', 'immortal', 'death', 'undead'], name: 'Immortal Lord', baseIcon: Skull, evolvedIcon: InfinityIcon, color: '#a855f7' },
  { id: 'footprints', keys: ['footprints', 'shoe', 'speed', 'runner'], name: 'Speedster', baseIcon: Footprints, evolvedIcon: Wind, color: '#10b981' },
  { id: 'wind', keys: ['wind', 'air', 'breeze'], name: 'Wind Walker', baseIcon: Wind, evolvedIcon: Footprints, color: '#38bdf8' },
  { id: 'target', keys: ['target', 'precision', 'sniper', 'aim'], name: 'Deadeye Sniper', baseIcon: Target, evolvedIcon: Crosshair, color: '#f43f5e' },
  { id: 'axe', keys: ['axe', 'berserker', 'chop'], name: 'Berserker', baseIcon: Axe, evolvedIcon: Sword, color: '#cbd5e1' },
  { id: 'anchor', keys: ['anchor', 'deepsea', 'ocean'], name: 'Deep Sea Titan', baseIcon: Anchor, evolvedIcon: Dumbbell, color: '#0ea5e9' },
  { id: 'fingerprint', keys: ['fingerprint', 'phantom', 'stealth'], name: 'Phantom', baseIcon: Fingerprint, evolvedIcon: Ghost, color: '#14b8a6' },
  { id: 'hexagon', keys: ['hexagon', 'fortress', 'base'], name: 'Fortress', baseIcon: Hexagon, evolvedIcon: Shield, color: '#8b5cf6' },
  { id: 'cpu', keys: ['cpu', 'tech', 'cyber', 'hacker'], name: 'Cyber Hacker', baseIcon: Cpu, evolvedIcon: Fingerprint, color: '#06b6d4' },
  { id: 'infinity', keys: ['infinity', 'limitless', 'eternal'], name: 'Eternal', baseIcon: InfinityIcon, evolvedIcon: Skull, color: '#ec4899' },
  { id: 'heart', keys: ['heart', 'vitality', 'medic', 'life'], name: 'Vitality Monk', baseIcon: Heart, evolvedIcon: Droplet, color: '#f43f5e' },
  { id: 'activity', keys: ['activity', 'athlete', 'pulse', 'sport'], name: 'Elite Athlete', baseIcon: Activity, evolvedIcon: Target, color: '#10b981' },
  { id: 'droplet', keys: ['droplet', 'water', 'blood', 'liquid'], name: 'Blood Medic', baseIcon: Droplet, evolvedIcon: Heart, color: '#60a5fa' },
  { id: 'lock', keys: ['lock', 'gate', 'secure'], name: 'Gate Keeper', baseIcon: LockIcon, evolvedIcon: Unlock, color: '#10b981' },
  { id: 'star', keys: ['star', 'superstar'], name: 'Superstar', baseIcon: Star, evolvedIcon: Crown, color: '#facc15' },
  { id: 'crosshair', keys: ['crosshair', 'lethal'], name: 'Lethal Weapon', baseIcon: Crosshair, evolvedIcon: Target, color: '#ef4444' }
];

const getUserClassInfo = (iconStr: string) => {
  if (!iconStr) return CLASS_MAPPING[0];
  const normalized = String(iconStr).toLowerCase().replace('_evolved', '').trim();
  for (const cls of CLASS_MAPPING) {
    if (cls.id === normalized || cls.keys.some((k) => normalized.includes(k))) return cls;
  }
  return CLASS_MAPPING[0];
};

const getHunterIconOnly = (hunter: any, color: string, size: number = 22) => {
  const iconStr = String(hunter?.selectedIcon || hunter?.selected_icon || hunter?.icon || hunter?.class || (hunter?.titles && hunter.titles[0]) || '').toLowerCase().trim();
  const isEvolved = iconStr.includes('evolved');
  const cls = getUserClassInfo(iconStr);
  const IconComponent = isEvolved ? cls.evolvedIcon : cls.baseIcon;
  return <IconComponent size={size} color={color} />;
};

// ==========================================
// 3. مكونات الـ 3D والـ VFX
// ==========================================
const FloatingCrystal = ({ color }: { color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });
  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[1.8, 0]} />
      <meshStandardMaterial color={color} wireframe emissive={color} emissiveIntensity={0.8} />
    </mesh>
  );
};

const MiniOrb = ({ type, color }: { type: string, color: string }) => {
  if (!type) return null;
  return (
    <motion.div style={{ width: 20, height: 20, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }} animate={{ y: [-2, 2, -2] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
      <motion.div style={{ position: 'absolute', width: '100%', height: '100%', background: color, filter: 'blur(5px)', borderRadius: '50%', zIndex: 0 }} animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        {type === 'wyvern' && <svg viewBox="0 0 100 100"><polygon points="50,5 90,50 50,95 10,50" fill="none" stroke={color} strokeWidth="6" /><circle cx="50" cy="50" r="15" fill="#fff" /></svg>}
        {type === 'phoenix' && <svg viewBox="0 0 100 100"><path d="M50 10 Q70 40 50 90 Q30 40 50 10" fill={color} /><circle cx="50" cy="65" r="12" fill="#fff" /></svg>}
        {type === 'owl' && <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="6" strokeDasharray="10 10" /><ellipse cx="50" cy="50" rx="10" ry="25" fill="#fff" /></svg>}
        {type === 'golem' && <svg viewBox="0 0 100 100"><polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="#334155" stroke={color} strokeWidth="6" /><rect x="35" y="35" width="30" height="30" fill={color} /></svg>}
        {type === 'wolf' && <svg viewBox="0 0 100 100"><polygon points="50,10 80,40 50,90 20,40" fill="none" stroke={color} strokeWidth="6" /><polygon points="50,30 60,45 50,70 40,45" fill="#fff" /></svg>}
        {type === 'emerald' && <svg viewBox="0 0 100 100"><path d="M50 10 C 80 10, 90 50, 50 90 C 10 50, 20 10, 50 10 Z" fill="none" stroke={color} strokeWidth="6" /><circle cx="50" cy="50" r="15" fill="#fff" /></svg>}
      </div>
    </motion.div>
  );
};

// ==========================================
// 4. التصميمات المفرودة (Styled Components)
// ==========================================
const Container = styled(motion.div)` padding: 15px; font-family: 'Oxanium', sans-serif; color: #fff; padding-bottom: 100px; max-width: 600px; margin: 0 auto; position: relative; `;
const TopActions = styled.div` display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 15px; flex-wrap: wrap; `;
const TopBtn = styled.button<{ $active?: boolean; $color?: string }>` background: ${(props) => (props.$active ? `${props.$color}20` : '#0f172a')}; border: 1px solid ${(props) => (props.$active ? props.$color : '#1e293b')}; color: ${(props) => (props.$active ? props.$color : '#94a3b8')}; padding: 10px 15px; border-radius: 12px; display: flex; align-items: center; gap: 8px; font-family: 'Oxanium'; font-weight: 900; font-size: 12px; cursor: pointer; transition: 0.3s; box-shadow: ${(props) => props.$active ? `0 0 15px ${props.$color}40` : '0 4px 10px rgba(0,0,0,0.3)'}; &:hover { background: ${(props) => (props.$active ? `${props.$color}40` : '#1e293b')}; color: ${(props) => props.$color || '#fff'}; } &:disabled { opacity: 0.5; cursor: not-allowed; } `;
const InboxBadge = styled.span` background: #ef4444; color: #fff; padding: 2px 6px; border-radius: 20px; font-size: 10px; font-weight: 900; margin-left: 5px; `;
const TabsGrid = styled.div` display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 25px; `;
const Tab = styled.button<{ $active: boolean; $glowColor?: string }>` padding: 12px; border-radius: 12px; border: none; font-family: 'Oxanium', sans-serif; font-weight: bold; font-size: 13px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; background: ${(props) => (props.$active ? props.$glowColor || '#0ea5e9' : '#0f172a')}; color: ${(props) => (props.$active ? '#000' : '#94a3b8')}; box-shadow: ${(props) => props.$active ? `0 0 20px ${props.$glowColor}60` : 'none'}; `;

// 🚨 تصميم قاعة الأبطال (Top 3) بعد هندسة المسافات 🚨
const HallOfFameContainer = styled.div` display: flex; justify-content: center; align-items: flex-end; min-height: 300px; padding-bottom: 10px; margin-bottom: 30px; position: relative; border-bottom: 1px solid rgba(255,255,255,0.1); `;
const PedestalWrapper = styled(motion.div)<{ $isFirst?: boolean }>` display: flex; flex-direction: column; align-items: center; justify-content: flex-end; width: 32%; position: relative; z-index: ${(props) => props.$isFirst ? 10 : 5}; margin: 0 2px; `;
const PedestalBase = styled.div<{ $color: string; $height: number }>` 
  width: 100%; height: ${(props) => props.$height}px; background: linear-gradient(to top, rgba(2,6,23,0.9), ${(props) => props.$color}40); 
  border: 1px solid ${(props) => props.$color}; border-bottom: none; border-top-left-radius: 10px; border-top-right-radius: 10px; position: relative; 
  box-shadow: inset 0 10px 20px rgba(0,0,0,0.5), 0 -10px 30px ${(props) => props.$color}20; display: flex; justify-content: center; align-items: center; 
  &::after { content: ''; position: absolute; bottom: 0; width: 100%; height: 100%; background: linear-gradient(to top, ${(props) => props.$color}20, transparent); filter: blur(15px); pointer-events: none; } 
`;
const HeroAvatar = styled(motion.div)<{ $color: string, $isFirst: boolean }>` width: ${(props) => props.$isFirst ? '70px' : '55px'}; height: ${(props) => props.$isFirst ? '70px' : '55px'}; border-radius: 50%; border: 3px solid ${(props) => props.$color}; background: rgba(2,6,23,0.9); display: flex; align-items: center; justify-content: center; margin-bottom: 10px; z-index: 10; box-shadow: 0 0 20px ${(props) => props.$color}60, inset 0 0 10px ${(props) => props.$color}40; position: relative; `;
const HeroName = styled.div<{ $color: string }>` font-size: 13px; font-weight: 900; color: ${(props) => props.$color}; text-shadow: 0 0 10px ${(props) => props.$color}; text-align: center; text-transform: uppercase; white-space: nowrap; `;
const HeroLevel = styled.div` font-size: 10px; color: #fff; font-weight: bold; margin-top: 4px; text-align: center; line-height: 1.4; `;
const Crown3D = styled(motion.div)` position: absolute; top: -35px; z-index: 15; filter: drop-shadow(0 0 10px #eab308); `;
const BeamLight = styled.div<{ $color: string }>` position: absolute; bottom: 0; width: 40px; height: 350px; background: linear-gradient(to top, ${(props) => props.$color}40, transparent); filter: blur(20px); pointer-events: none; z-index: 0; `;

const SearchContainer = styled.div` position: relative; margin-bottom: 25px; `;
const SearchIconBox = styled.div` position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #0ea5e9; `;
const SearchInput = styled.input` width: 100%; background: rgba(11, 17, 32, 0.8); border: 1px solid #1e293b; color: #fff; padding: 16px 16px 16px 50px; border-radius: 14px; font-family: 'Oxanium'; font-size: 15px; outline: none; transition: 0.3s; &:focus { border-color: #00f2ff; box-shadow: 0 0 15px rgba(0,242,255,0.2); } &::placeholder { color: #475569; font-weight: bold; } `;

// 🚨 تصميم كروت اللاعبين الـ Epic 2D 🚨
const cardBreathe = keyframes` 0% { box-shadow: 0 4px 10px rgba(0,0,0,0.3); } 50% { box-shadow: 0 4px 20px rgba(255,255,255,0.05); } 100% { box-shadow: 0 4px 10px rgba(0,0,0,0.3); } `;
const PlayerCard = styled(motion.div)<{ $rankColor: string }>` background: linear-gradient(90deg, #0f172a 0%, #020617 100%); border: 1px solid #1e293b; border-left: 4px solid ${(props) => props.$rankColor}; border-radius: 12px; padding: 15px 15px; margin-bottom: 12px; display: flex; align-items: center; cursor: pointer; transition: 0.3s; animation: ${cardBreathe} 4s infinite ease-in-out; &:hover { background: #1e293b; transform: translateX(5px); border-color: ${(props) => props.$rankColor}50; } `;

const RankCol = styled.div` width: 30px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900; color: #64748b; `;
const IconCircle = styled.div<{ $color: string; $classColor: string }>` width: 40px; height: 40px; border-radius: 50%; border: 1px solid ${(props) => props.$color}80; display: flex; align-items: center; justify-content: center; margin: 0 10px; flex-shrink: 0; background: rgba(0, 0, 0, 0.5); box-shadow: inset 0 0 10px ${(props) => props.$classColor}40; `;
const NameCol = styled.div` flex: 1; display: flex; flex-direction: column; justify-content: center; `;
const PlayerNameText = styled.div` font-size: 14px; font-weight: 900; color: #fff; margin-bottom: 2px; display: flex; align-items: center; gap: 6px; text-transform: uppercase; `;
const PlayerTitleText = styled.div<{ $rankColor: string }>` font-size: 9px; color: ${(props) => props.$rankColor}; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; `;
const LevelCol = styled.div` display: flex; flex-direction: column; align-items: flex-end; justify-content: center; `;
const LevelTextVal = styled.div<{ $rankColor: string }>` font-size: 16px; font-weight: 900; color: ${(props) => props.$rankColor}; text-shadow: 0 0 10px ${(props) => props.$rankColor}50; `;
const EXPText = styled.div` font-size: 10px; color: #94a3b8; font-weight: bold; margin-top: 4px; text-align: right; `;

const LoadingSpinner = styled.div` border: 4px solid rgba(14, 165, 233, 0.1); border-left-color: #0ea5e9; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 60px auto; @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } `;

// 🚨 Portal Modals 🚨
const ModalOverlay = styled(motion.div)` position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 999999; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(8px); `;
const ModalContent = styled(motion.div)<{ $isCoach?: boolean; $borderColor?: string; $width?: string }>` background: #0b1120; border: 2px solid ${(props) => props.$borderColor || (props.$isCoach ? '#ef4444' : '#1e293b')}; border-radius: 20px; padding: 25px; width: 100%; max-width: ${(props) => props.$width || '450px'}; position: relative; box-shadow: 0 0 50px ${(props) => props.$isCoach ? 'rgba(239,68,68,0.3)' : 'rgba(0,0,0,0.8)'}; max-height: 90vh; overflow-y: auto; &::-webkit-scrollbar { width: 5px; } &::-webkit-scrollbar-thumb { background: ${(props) => props.$borderColor || '#334155'}; border-radius: 5px; } `;
const CloseBtn = styled.button` position: absolute; top: 15px; right: 15px; background: none; border: none; color: #94a3b8; cursor: pointer; padding: 8px; display: flex; align-items: center; justify-content: center; transition: 0.3s; z-index: 10; &:hover { color: #fff; } `;
const PasswordOverlay = styled(motion.div)` background: #020617; border: 1px solid #ef4444; padding: 25px; border-radius: 12px; display: flex; flex-direction: column; gap: 15px; box-shadow: 0 5px 30px rgba(239,68,68,0.3); width: 100%; max-width: 350px; text-align: center; `;
const PasswordInput = styled.input` background: #0b1120; border: 1px solid #334155; color: #fff; padding: 12px; border-radius: 8px; font-family: 'Oxanium'; font-size: 16px; text-align: center; letter-spacing: 3px; &:focus { outline: none; border-color: #ef4444; } `;

const ProfileHeader = styled.div` display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 25px; margin-top: 10px; `;
const DataGrid = styled.div` display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 15px; width: 100%; `;
const DataBox = styled.div` background: #1e293b50; border: 1px solid #334155; padding: 12px; border-radius: 10px; display: flex; flex-direction: column; gap: 5px; text-align: center; `;
const SectionLabel = styled.div` font-size: 11px; color: #94a3b8; font-weight: 900; letter-spacing: 1px; margin: 25px 0 10px 0; border-bottom: 1px solid #334155; padding-bottom: 5px; display: flex; align-items: center; gap: 5px; text-transform: uppercase; `;
const TaskRow = styled.div<{ $status: string }>` display: flex; justify-content: space-between; align-items: center; background: rgba(2,6,23,0.8); border: 1px solid ${(props) => props.$status === 'approved' ? '#10b981' : props.$status === 'pending' ? '#facc15' : '#ef4444'}; padding: 12px; border-radius: 10px; margin-bottom: 10px; font-size: 12px; transition: 0.3s; box-shadow: ${(props) => props.$status === 'approved' ? 'inset 0 0 15px rgba(16,185,129,0.1)' : 'none'}; `;
const RecordRow = styled.div` display: flex; justify-content: space-between; align-items: center; background: #0f172a; border-left: 3px solid #38bdf8; padding: 12px; border-radius: 8px; margin-bottom: 8px; font-size: 13px; `;
const CoachSection = styled(motion.div)` margin-top: 25px; padding-top: 20px; border-top: 1px dashed #ef4444; `;

const RequestCard = styled.div` background: #0f172a; border: 1px solid #facc15; border-radius: 12px; padding: 15px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 10px; `;
const RequestHeader = styled.div` display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #334155; padding-bottom: 8px; `;
const RequestActions = styled.div` display: flex; gap: 10px; margin-top: 5px; `;
const ActionBtn = styled.button<{ $type: 'approve' | 'reject' | 'primary' }>` flex: 1; padding: 10px; border-radius: 8px; border: none; font-weight: bold; font-family: 'Oxanium'; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; transition: 0.3s; background: ${(props) => props.$type === 'approve' ? '#10b98120' : props.$type === 'primary' ? '#10b981' : '#ef444420'}; color: ${(props) => props.$type === 'approve' ? '#10b981' : props.$type === 'primary' ? '#000' : '#ef4444'}; border: 1px solid ${(props) => props.$type === 'approve' ? '#10b981' : props.$type === 'primary' ? '#10b981' : '#ef4444'}; &:hover { filter: brightness(1.2); } &:disabled { opacity: 0.5; cursor: not-allowed; } `;
const KeyCard = styled.div<{ $isUsed: boolean }>` background: #0f172a; border: 1px solid ${(props) => (props.$isUsed ? '#ef4444' : '#10b981')}; border-radius: 12px; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); `;
const KeyText = styled.div<{ $isUsed: boolean }>` font-family: monospace; font-size: 16px; font-weight: 900; letter-spacing: 2px; color: ${(props) => (props.$isUsed ? '#fca5a5' : '#34d399')}; text-decoration: ${(props) => (props.$isUsed ? 'line-through' : 'none')}; `;

const FilterTabs = styled.div` display: flex; gap: 8px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 5px; &::-webkit-scrollbar { height: 4px; } &::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; } `;
const FilterTab = styled.button<{ $active: boolean; $color: string }>` background: ${(props) => props.$active ? `${props.$color}20` : '#1e293b50'}; border: 1px solid ${(props) => props.$active ? props.$color : '#334155'}; color: ${(props) => props.$active ? props.$color : '#94a3b8'}; padding: 8px 12px; border-radius: 8px; font-family: 'Oxanium'; font-size: 11px; font-weight: bold; cursor: pointer; white-space: nowrap; display: flex; align-items: center; gap: 4px; transition: 0.3s; &:hover { background: ${(props) => props.$color}20; color: ${(props) => props.$color}; } `;
const BulkBtn = styled.button` background: #10b981; color: #000; border: none; padding: 12px; border-radius: 8px; font-family: 'Oxanium'; font-size: 12px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; margin-bottom: 15px; transition: 0.3s; &:hover { filter: brightness(1.2); box-shadow: 0 0 15px rgba(16, 185, 129, 0.4); } &:disabled { background: #334155; color: #94a3b8; cursor: not-allowed; box-shadow: none; } `;

// ==========================================
// 6. المكون الرئيسي (Leaderboard & Coach Mode)
// ==========================================
const Rank = ({ player, setPlayer }: any) => {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<any[]>([]);
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<any[]>([]);
  const [maleLeaderboard, setMaleLeaderboard] = useState<any[]>([]);
  const [femaleLeaderboard, setFemaleLeaderboard] = useState<any[]>([]);
  const [championsHistory, setChampionsHistory] = useState<any[]>([]);

  const [activeBoard, setActiveBoard] = useState<'global' | 'monthly' | 'male' | 'female'>('global');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isCoachMode, setIsCoachMode] = useState(() => localStorage.getItem('elite_coach_mode') === 'true');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState('');

  const [showKeysModal, setShowKeysModal] = useState(false);
  const [accessKeysList, setAccessKeysList] = useState<any[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);

  const [selectedHunter, setSelectedHunter] = useState<any>(null);
  const [hunterTasksData, setHunterTasksData] = useState<any[]>([]);
  const [hunterRecordsData, setHunterRecordsData] = useState<any[]>([]);
  const [loadingHunterData, setLoadingHunterData] = useState(false);
  const [hunterAttendance, setHunterAttendance] = useState({ attended: 0, total: 1, rate: 0 });

  const [showInboxModal, setShowInboxModal] = useState(false);
  const [inboxRequests, setInboxRequests] = useState<any[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [inboxFilter, setInboxFilter] = useState<'all' | 'quest' | 'record' | 'injury'>('all');

  const fetchAndProcessLeaderboard = async () => {
    setLoading(true);
    try {
      const { data: hunters, error } = await supabase.from('elite_players').select('*');
      if (error) throw error;
      
      const { data: champsData } = await supabase.from('season_champions').select('*');
      if (champsData) setChampionsHistory(champsData);

      if (!hunters) {
        setGlobalLeaderboard([]);
        return;
      }

      const processedHunters = hunters.map(h => {
        const levelData = calculateLevelData(h.cumulative_xp || 0);
        const monthlyData = calculateLevelData(h.monthly_xp || 0);
        const rankInfo = getRankInfo(levelData.level);

        return {
          ...h,
          visualLevel: levelData.level,
          visualXp: levelData.xpInCurrentLevel,
          visualNeeded: levelData.expNeededForNextLevel,
          monthlyVisualXp: monthlyData.xpInCurrentLevel,
          rankName: `${rankInfo.name} HUNTER${rankInfo.name === 'ELITE' ? ' 👑' : ''}`,
          rankColor: rankInfo.color,
          rankGlow: rankInfo.glow
        };
      });

      const sortedGlobal = [...processedHunters].sort((a, b) => (b.cumulative_xp || 0) - (a.cumulative_xp || 0));
      setGlobalLeaderboard(sortedGlobal.map((h, i) => ({ ...h, position: i + 1 })));

      const sortedMonthly = [...processedHunters].sort((a, b) => (b.monthly_xp || 0) - (a.monthly_xp || 0));
      setMonthlyLeaderboard(sortedMonthly.map((h, i) => ({ ...h, position: i + 1 })));

      const maleHunters = processedHunters.filter((h) => h.gender === 'Male' || !h.gender);
      const sortedMale = [...maleHunters].sort((a, b) => (b.cumulative_xp || 0) - (a.cumulative_xp || 0));
      setMaleLeaderboard(sortedMale.map((h, i) => ({ ...h, position: i + 1 })));

      const femaleHunters = processedHunters.filter((h) => h.gender === 'Female');
      const sortedFemale = [...femaleHunters].sort((a, b) => (b.cumulative_xp || 0) - (a.cumulative_xp || 0));
      setFemaleLeaderboard(sortedFemale.map((h, i) => ({ ...h, position: i + 1 })));
    } catch (err: any) {
      toast.error('Failed to load rankings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndProcessLeaderboard();
  }, [player?.name]);

  useEffect(() => {
    if (isCoachMode) fetchInboxRequests();
  }, [isCoachMode]);

  const handlePlayerClick = (hunter: any) => {
    playClick();
    setSelectedHunter(hunter);
    fetchHunterDetails(hunter);
  };

  const fetchHunterDetails = async (hunter: any) => {
    setLoadingHunterData(true);
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    try {
      const { data: freshHunter } = await supabase.from('elite_players').select('*').eq('name', hunter.name).single();
      const targetHunter = freshHunter || hunter;
      
      const levelData = calculateLevelData(targetHunter.cumulative_xp || 0);
      targetHunter.visualLevel = levelData.level;
      targetHunter.visualXp = levelData.xpInCurrentLevel;
      targetHunter.visualNeeded = levelData.expNeededForNextLevel;

      const rankInfo = getRankInfo(levelData.level);
      targetHunter.rankColor = rankInfo.color;
      targetHunter.rankName = `${rankInfo.name} HUNTER${rankInfo.name === 'ELITE' ? ' 👑' : ''}`;

      setSelectedHunter((prev: any) => ({ ...prev, ...targetHunter }));

      const { data: tasks } = await supabase
        .from('elite_quests')
        .select('id, task_name, status, created_at')
        .eq('player_name', targetHunter.name)
        .gte('created_at', firstDayOfMonth);
      
      setHunterTasksData(tasks || []);

      const createdDate = targetHunter.created_at ? new Date(targetHunter.created_at) : new Date();
      const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
      const totalDaysSinceStart = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);

      const uniqueActiveDays = new Set();
      if (tasks) {
        tasks.forEach((req) => {
          if (req.status === 'approved') {
              const d = new Date(req.created_at);
              uniqueActiveDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
          }
        });
      }
      const attendedDays = uniqueActiveDays.size;
      const attRate = Math.min(100, Math.round((attendedDays / totalDaysSinceStart) * 100));
      setHunterAttendance({ attended: attendedDays, total: totalDaysSinceStart, rate: attRate });

      const { data: records } = await supabase.from('elite_records').select('*').eq('player_name', targetHunter.name);
      setHunterRecordsData(records || []);
    } catch (error) {}
    setLoadingHunterData(false);
  };

  const fetchInboxRequests = async () => {
    setLoadingInbox(true);
    try {
      const { data } = await supabase.from('elite_quests').select('*').eq('status', 'pending').order('created_at', { ascending: false });
      setInboxRequests(data || []);
    } catch (error) {}
    setLoadingInbox(false);
  };

  const fetchAccessKeys = async () => {
    setLoadingKeys(true);
    try {
      const { data, error } = await supabase.from('access_keys').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setAccessKeysList(data || []);
    } catch (err) { toast.error('Failed to load keys.'); }
    setLoadingKeys(false);
  };

  const generateNewKey = async () => {
    playClick();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newKey = `ELITE-${randomStr}`;
    try {
      const { error } = await supabase.from('access_keys').insert([{ key_code: newKey }]);
      if (error) throw error;
      toast.success(`Key Generated: ${newKey}`, { style: { background: '#022c22', border: '1px solid #10b981', color: '#10b981' } });
      fetchAccessKeys();
    } catch (err) { toast.error('Failed to generate key.'); }
  };

  const deleteKey = async (id: string) => {
    try {
      await supabase.from('access_keys').delete().eq('id', id);
      toast.success('Key Deleted Successfully.');
      setAccessKeysList((prev) => prev.filter((k) => k.id !== id));
    } catch (err) { toast.error('Failed to delete key.'); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text); playClick();
    toast.success('Key Copied to Clipboard!', { style: { background: '#0f172a', border: '1px solid #38bdf8', color: '#38bdf8' } });
  };

  const handlePasswordSubmit = () => {
    if (password.toLowerCase() === 'coach2026') {
      playUnlock();
      setIsCoachMode(true);
      localStorage.setItem('elite_coach_mode', 'true');
      setShowPasswordPrompt(false);
      toast.success('MASTER OVERRIDE GRANTED');
    } else {
      toast.error('INVALID PASSWORD');
    }
  };

  const handleResetMonth = async () => {
    const confirmReset = window.confirm('⚠️ DANGER ZONE: هل أنت متأكد من إنهاء الشهر؟ سيتم تتويج الأبطال للشهر المنتهي وتصفير نقاط الـ Monthly XP لجميع اللاعبين ليبدأ شهر جديد!');
    if (!confirmReset) return;
    
    setIsProcessing(true);
    try {
      const topMale = maleLeaderboard[0];
      const topFemale = femaleLeaderboard[0];
      
      // الحصول على اسم الشهر المنصرم لتتويج الأبطال
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      const lastMonthName = lastMonthDate.toLocaleString('en-US', { month: 'long' }).toUpperCase();
      const seasonName = `SEASON: ${lastMonthName} WARFARE`;
      
      const championsToInsert = [];
      if (topMale && topMale.monthly_xp > 0) {
        championsToInsert.push({ hunter_name: topMale.name, season_name: seasonName, category: 'Male', monthly_xp: topMale.monthly_xp });
      }
      if (topFemale && topFemale.monthly_xp > 0) {
        championsToInsert.push({ hunter_name: topFemale.name, season_name: seasonName, category: 'Female', monthly_xp: topFemale.monthly_xp });
      }

      if (championsToInsert.length > 0) {
        const { error: champError } = await supabase.from('season_champions').insert(championsToInsert);
        if (champError) {
          console.error(champError);
          toast.error("فشل تسجيل الأبطال في قاعدة البيانات.");
        }
      }

      // تصفير النقاط الشهرية لجميع اللاعبين المسجلين (للتأكد أن لا أحد يفوت التصفير)
      const { error: resetError } = await supabase.from('elite_players').update({ monthly_xp: 0 }).not('name', 'is', null);
      if (resetError) throw resetError;

      toast.success(`🏆 تم إنهاء ${seasonName}! تم تتويج الأبطال وتصفير لوحة الشهر للجميع!`, { style: { background: '#022c22', color: '#10b981', border: '1px solid #10b981' } });
      await supabase.from('elite_economy').insert([{ player_name: 'SYSTEM', amount: 0, currency: 'xp', operation: 'increase', reason: 'A NEW MONTH HAS BEGUN! 🏆' }]);
      
      fetchAndProcessLeaderboard();
    } catch (err) { 
      console.error(err);
      toast.error('حدث خطأ أثناء تصفير الشهر.'); 
    }
    setIsProcessing(false);
  };

  const handleCoachUndo = async (taskName: string, isDaily: boolean) => {
    const confirmMsg = window.confirm(`⚠️ هل أنت متأكد من إلغاء مهمة (${taskName}) وخصم نقاطها من اللاعب؟`);
    if (!confirmMsg) return;

    setIsProcessing(true);
    try {
      const now = new Date();
      if (now.getHours() < 12) now.setDate(now.getDate() - 1);
      const gameTodayStr = getLocalYYYYMMDD(now);

      let reqToDelete;
      if (isDaily) {
        reqToDelete = hunterTasksData.find(t => {
          return t.task_name === taskName && getLocalYYYYMMDD(t.created_at) === gameTodayStr && t.status === 'approved';
        });
      } else {
        reqToDelete = hunterTasksData.find(t => t.task_name === taskName && t.status === 'approved');
      }

      if (!reqToDelete) {
        toast.error("لم يتم العثور على سجل المهمة!");
        setIsProcessing(false);
        return;
      }

      const taskKey = Object.keys(QUEST_REWARDS).find(key => taskName.includes(key)) || taskName;
      const reward = QUEST_REWARDS[taskKey] || { exp: 50, gold: 20 };

      let newXp = Math.max(0, (selectedHunter.cumulative_xp || 0) - reward.exp);
      let newMonthlyXp = Math.max(0, (selectedHunter.monthly_xp || 0) - reward.exp);
      let newGold = Math.max(0, (selectedHunter.gold || 0) - reward.gold);

      await supabase.from('elite_quests').delete().eq('id', reqToDelete.id);
      await supabase.from('elite_players').update({ cumulative_xp: newXp, monthly_xp: newMonthlyXp, gold: newGold }).eq('name', selectedHunter.name);
      await supabase.from('elite_economy').insert([{ player_name: selectedHunter.name, amount: reward.exp, currency: 'xp', operation: 'decrease', reason: `Coach Reverted: ${taskName}` }]);

      setHunterTasksData(prev => prev.filter(t => t.id !== reqToDelete.id));
      setSelectedHunter((prev: any) => ({ ...prev, cumulative_xp: newXp, monthly_xp: newMonthlyXp, gold: newGold }));
      
      toast.success("✅ تم الإلغاء وخصم النقاط بنجاح!");
      fetchAndProcessLeaderboard();
    } catch (err) {
      toast.error("حدث خطأ أثناء الإلغاء.");
    }
    setIsProcessing(false);
  };

  const processSingleRequest = async (request: any, action: 'approve' | 'reject') => {
    if (action === 'reject') {
      await supabase.from('elite_quests').delete().eq('id', request.id);
      return;
    } 
    
    await supabase.from('elite_quests').update({ status: 'approved' }).eq('id', request.id);

    if (request.task_name === '[INJURY REPORT]') {
      await supabase.from('elite_players').update({ is_injured: true }).eq('name', request.player_name);
      await supabase.from('elite_quests').delete().eq('id', request.id);
    } else if (request.type === 'record' || request.task_name.startsWith('[NEW PR]')) {
      const { data: hunterData } = await supabase.from('elite_players').select('*').eq('name', request.player_name).single();
      if (hunterData) {
        const newGold = (hunterData.gold || 0) + 200;
        const recordTitle = request.task_name.replace('[NEW PR]', '').trim();
        const achievedPart = request.evidence.split('Achieved')[1];
        const newValue = achievedPart ? parseFloat(achievedPart.trim()) : 0;

        await supabase.from('elite_records').upsert({ player_name: request.player_name, exercise_name: recordTitle, weight_kg: newValue }, { onConflict: 'player_name, exercise_name' });
        await supabase.from('elite_players').update({ gold: newGold }).eq('name', request.player_name);
        await supabase.from('elite_economy').insert([{ player_name: request.player_name, amount: 200, currency: 'gold', operation: 'increase', reason: `New PR: ${recordTitle}` }]);
      }
    } else {
      const { data: hunterData } = await supabase.from('elite_players').select('*').eq('name', request.player_name).single();
      if (hunterData) {
        const taskKey = Object.keys(QUEST_REWARDS).find((key) => request.task_name.includes(key)) || request.task_name;
        const reward = QUEST_REWARDS[taskKey] || { exp: 50, gold: 20 };
        
        let newXp = (hunterData.cumulative_xp || 0) + reward.exp;
        let newMonthlyXp = (hunterData.monthly_xp || 0) + reward.exp;
        let newGold = (hunterData.gold || 0) + reward.gold;
        
        const oldLvlData = calculateLevelData(hunterData.cumulative_xp || 0);
        const newLvlData = calculateLevelData(newXp);
        
        if (newLvlData.level > oldLvlData.level) {
           const levelsGained = newLvlData.level - oldLvlData.level;
           for(let i=1; i<=levelsGained; i++) {
              let currentLevelUp = oldLvlData.level + i;
              if (currentLevelUp % 5 === 0) newGold += 200;
              else newGold += 100;
           }
        }
        
        await supabase.from('elite_players').update({ cumulative_xp: newXp, monthly_xp: newMonthlyXp, gold: newGold }).eq('name', request.player_name);
        await supabase.from('elite_economy').insert([{ player_name: request.player_name, amount: reward.exp, currency: 'xp', operation: 'increase', reason: request.task_name }]);
      }
    }
  };

  const handleRequestAction = async (request: any, action: 'approve' | 'reject') => {
    if (isProcessing) return;
    setIsProcessing(true);
    playClick();
    try {
      await processSingleRequest(request, action);
      if (action === 'reject') {
        toast.error(`Request Rejected`, { style: { background: '#2a0808', color: '#ef4444', border: '1px solid #ef4444' } });
      } else {
        toast.success(`Request Approved: ${request.player_name} rewarded!`, { style: { background: '#022c22', color: '#10b981', border: '1px solid #10b981' } });
      }
      setInboxRequests((prev) => prev.filter((r) => r.id !== request.id));
      fetchAndProcessLeaderboard();
    } catch (err: any) {
      toast.error(`Action failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkApprove = async () => {
    const listToApprove = getFilteredInbox();
    if (listToApprove.length === 0) return;
    
    if (!window.confirm(`⚠️ Are you sure you want to approve all ${listToApprove.length} requests?`)) return;

    setIsProcessing(true);
    playClick();
    const loadingToast = toast.loading(`Approving ${listToApprove.length} requests...`);

    try {
      for (const req of listToApprove) {
        await processSingleRequest(req, 'approve');
      }
      
      const processedIds = listToApprove.map(r => r.id);
      setInboxRequests(prev => prev.filter(r => !processedIds.includes(r.id)));
      fetchAndProcessLeaderboard();
      
      toast.dismiss(loadingToast);
      toast.success(`✅ Successfully approved ${listToApprove.length} requests!`, { style: { background: '#022c22', color: '#10b981', border: '1px solid #10b981' } });
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(`Bulk action failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getFilteredInbox = () => {
    return inboxRequests.filter(req => {
      if (inboxFilter === 'all') return true;
      if (inboxFilter === 'injury') return req.task_name === '[INJURY REPORT]';
      if (inboxFilter === 'record') return req.type === 'record' || req.task_name.startsWith('[NEW PR]');
      if (inboxFilter === 'quest') return req.type !== 'record' && req.task_name !== '[INJURY REPORT]';
      return true;
    });
  };

  let displayBoard = globalLeaderboard;
  if (activeBoard === 'monthly') displayBoard = monthlyLeaderboard;
  if (activeBoard === 'male') displayBoard = maleLeaderboard;
  if (activeBoard === 'female') displayBoard = femaleLeaderboard;
  const filteredBoard = displayBoard.filter((h) => h.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const topThree = filteredBoard.slice(0, 3);
  const others = filteredBoard.slice(3);

  const getPedestalHeight = (index: number) => {
    if (index === 0) return 130;
    if (index === 1) return 90;
    return 60;
  };

  const orderedTopThree = [];
  if (topThree[1]) orderedTopThree.push({ ...topThree[1], index: 1 });
  if (topThree[0]) orderedTopThree.push({ ...topThree[0], index: 0 });
  if (topThree[2]) orderedTopThree.push({ ...topThree[2], index: 2 });

  // 🚨 دالة رسم مهام اللاعب المفتوحة للجميع 🚨
  const renderAllMissions = () => {
    if (!selectedHunter) return null;
    
    const now = new Date();
    if (now.getHours() < 12) {
        now.setDate(now.getDate() - 1);
    }
    const gameTodayStr = getLocalYYYYMMDD(now);
    const isGameFriday = now.getDay() === 5;

    const baseQuests = selectedHunter.is_injured ? INJURED_DAILY_QUESTS : NORMAL_DAILY_QUESTS;

    const getTaskStatus = (taskName: string, isDaily: boolean) => {
      if (isDaily) {
        const todayTask = hunterTasksData.find(t => {
           return t.task_name === taskName && getLocalYYYYMMDD(t.created_at) === gameTodayStr;
        });
        return todayTask ? todayTask.status : 'not_started';
      } else {
        const doneTask = hunterTasksData.find(t => t.task_name === taskName);
        return doneTask ? doneTask.status : 'not_started';
      }
    };

    const renderRow = (questTitle: string, isDaily: boolean) => {
      const status = getTaskStatus(questTitle, isDaily);
      return (
        <TaskRow key={questTitle} $status={status}>
          <span style={{ color: '#fff', fontWeight: 'bold' }}>{questTitle}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {status === 'approved' ? (
                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '900' }}><CheckCircle size={14} /> DONE</span>
              ) : status === 'pending' ? (
                <span style={{ color: '#facc15', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '900' }}><Clock size={14} /> WAITING</span>
              ) : (
                <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '900' }}><XCircle size={14} /> NOT STARTED</span>
              )}
              
              {isCoachMode && status === 'approved' && (
                  <button 
                    onClick={() => handleCoachUndo(questTitle, isDaily)}
                    disabled={isProcessing}
                    style={{ background: '#2a0808', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Undo & Deduct Points"
                  >
                     <RotateCcw size={12} /> UNDO
                  </button>
              )}
          </div>
        </TaskRow>
      );
    };

    return (
      <>
        <div style={{color: '#0ea5e9', fontSize: 10, marginTop: 10, marginBottom: 5, fontWeight: 'bold'}}>DAILY DIRECTIVES (TODAY: {gameTodayStr})</div>
        {baseQuests.map((q) => renderRow(q, true))}

        {isGameFriday && (
          <>
            <div style={{color: '#ef4444', fontSize: 10, marginTop: 10, marginBottom: 5, fontWeight: 'bold'}}>FRIDAY DIRECTIVES</div>
            {FRIDAY_DIRECTIVES.map((q) => renderRow(q, true))}
          </>
        )}

        <div style={{color: '#eab308', fontSize: 10, marginTop: 10, marginBottom: 5, fontWeight: 'bold'}}>BI-WEEKLY & MONTHLY (THIS MONTH)</div>
        {[...BIWEEKLY_QUESTS, ...MONTHLY_QUESTS].map((q) => renderRow(q, false))}
      </>
    );
  };

  // 🚨 إنشاء الـ Portal للشاشات 🚨
  const renderModals = () => {
    if (typeof document === 'undefined') return null;
    return createPortal(
      <>
        <AnimatePresence>
          {showKeysModal && (
            <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ModalContent $isCoach={true} $borderColor="#10b981" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}>
                <CloseBtn onClick={() => setShowKeysModal(false)}><X size={24} /></CloseBtn>
                <h2 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 20px 0' }}><Key size={24} /> ACCESS KEYS MANAGER</h2>
                <ActionBtn $type="primary" onClick={generateNewKey} style={{ marginBottom: '20px' }}><Plus size={18} /> GENERATE NEW KEY</ActionBtn>
                {loadingKeys ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#10b981' }}><LoadingSpinner /></div>
                ) : accessKeysList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', background: '#1e293b30', borderRadius: '12px', color: '#94a3b8' }}>No keys generated yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>
                    {accessKeysList.map((keyData) => (
                      <KeyCard key={keyData.id} $isUsed={keyData.is_used}>
                        <div>
                          <KeyText $isUsed={keyData.is_used}>{keyData.key_code}</KeyText>
                          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>{keyData.is_used ? `Claimed by: ${keyData.used_by}` : 'Status: Unused (Active)'}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => copyToClipboard(keyData.key_code)} style={{ background: '#1e293b', border: 'none', padding: '8px', borderRadius: '8px', color: '#0ea5e9', cursor: 'pointer' }} title="Copy Code"><Copy size={16} /></button>
                          {!keyData.is_used && (
                            <button onClick={() => deleteKey(keyData.id)} style={{ background: '#2a0808', border: 'none', padding: '8px', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }} title="Delete Code"><Trash2 size={16} /></button>
                          )}
                        </div>
                      </KeyCard>
                    ))}
                  </div>
                )}
              </ModalContent>
            </ModalOverlay>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPasswordPrompt && !isCoachMode && (
            <ModalOverlay style={{ zIndex: 200 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PasswordOverlay initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                <button onClick={() => setShowPasswordPrompt(false)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
                <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '900', letterSpacing: 1 }}><LockIcon size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} /> MASTER OVERRIDE</div>
                <PasswordInput type="password" placeholder="ENTER PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()} />
                <button onClick={handlePasswordSubmit} style={{ background: '#ef4444', color: '#000', padding: '10px', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' }}>DECRYPT SYSTEM</button>
              </PasswordOverlay>
            </ModalOverlay>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showInboxModal && (
            <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ModalContent $isCoach={true} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}>
                <CloseBtn onClick={() => setShowInboxModal(false)}><X size={24} /></CloseBtn>
                <h2 style={{ color: '#eab308', display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 20px 0' }}><Inbox size={24} /> PENDING REQUESTS</h2>
                
                <FilterTabs>
                  <FilterTab $active={inboxFilter === 'all'} $color="#eab308" onClick={() => setInboxFilter('all')}><Filter size={12}/> All</FilterTab>
                  <FilterTab $active={inboxFilter === 'quest'} $color="#0ea5e9" onClick={() => setInboxFilter('quest')}><CheckSquare size={12}/> Quests</FilterTab>
                  <FilterTab $active={inboxFilter === 'record'} $color="#a855f7" onClick={() => setInboxFilter('record')}><Trophy size={12}/> PRs</FilterTab>
                  <FilterTab $active={inboxFilter === 'injury'} $color="#ef4444" onClick={() => setInboxFilter('injury')}><HeartPulse size={12}/> Rehab</FilterTab>
                </FilterTabs>

                {loadingInbox ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#eab308' }}><LoadingSpinner /></div>
                ) : getFilteredInbox().length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', background: '#1e293b30', borderRadius: '12px', color: '#94a3b8' }}>No pending requests in this category.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <BulkBtn disabled={isProcessing} onClick={handleBulkApprove}>
                      <CheckCircle size={16} /> APPROVE ALL ({getFilteredInbox().length})
                    </BulkBtn>
                    {getFilteredInbox().map((req) => (
                      <RequestCard key={req.id}>
                        <RequestHeader>
                          <span style={{ fontWeight: '900', color: '#fff' }}>{req.player_name}</span>
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>{new Date(req.created_at).toLocaleDateString()}</span>
                        </RequestHeader>
                        <div style={{ fontSize: '14px', color: req.task_name === '[INJURY REPORT]' ? '#ef4444' : '#38bdf8', fontWeight: 'bold' }}>{req.task_name}</div>
                        <div style={{ fontSize: '12px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 5, background: '#1e293b50', padding: '8px', borderRadius: '6px' }}>
                          {req.evidence?.includes('Image') ? <FileImage size={14} color="#10b981" /> : <Activity size={14} color="#facc15" />} {req.evidence || 'No Evidence Provided'}
                        </div>
                        <RequestActions>
                          <ActionBtn disabled={isProcessing} $type="reject" onClick={() => handleRequestAction(req, 'reject')}><X size={16} /> REJECT</ActionBtn>
                          <ActionBtn disabled={isProcessing} $type="approve" onClick={() => handleRequestAction(req, 'approve')}><Check size={16} /> APPROVE</ActionBtn>
                        </RequestActions>
                      </RequestCard>
                    ))}
                  </div>
                )}
              </ModalContent>
            </ModalOverlay>
          )}
        </AnimatePresence>

        {/* 🚨 بروفايل اللاعب العام 🚨 */}
        <AnimatePresence>
          {selectedHunter && (
            <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ModalContent $width="650px" $borderColor={selectedHunter.rankColor} initial={{ scale: 0.9 }}>
                <CloseBtn onClick={() => setSelectedHunter(null)}><X size={24} /></CloseBtn>

                <ProfileHeader>
                  <IconCircle $color={selectedHunter.rankColor} $classColor={getUserClassInfo(selectedHunter.selectedIcon || selectedHunter.icon).color} style={{ width: 80, height: 80, margin: '0 auto 15px auto', borderWidth: '4px', boxShadow: `0 0 20px ${selectedHunter.rankColor}60` }}>
                    {getHunterIconOnly(selectedHunter, getUserClassInfo(selectedHunter.selectedIcon || selectedHunter.icon).color, 40)}
                  </IconCircle>
                  <h2 style={{ margin: 0, color: selectedHunter.rankColor, textTransform: 'uppercase', fontSize: '22px', letterSpacing: '2px', textShadow: `0 0 10px ${selectedHunter.rankColor}80` }}>{selectedHunter.name}</h2>
                  <div style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: 'bold', marginTop: '5px' }}>{selectedHunter.rankName}</div>
                  
                  {selectedHunter.active_pet && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 15 }}>
                      <MiniOrb type={PETS_DATABASE.find(p => p.name === selectedHunter.active_pet)?.type || 'wyvern'} color={PETS_DATABASE.find(p => p.name === selectedHunter.active_pet)?.color || '#eab308'} />
                    </div>
                  )}
                </ProfileHeader>

                <DataGrid>
                  <DataBox>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>LEVEL</span>
                    <span style={{ fontSize: '18px', color: '#00f2ff', fontWeight: 'bold' }}><ChevronUp size={14} /> {selectedHunter.visualLevel || 1}</span>
                  </DataBox>
                  <DataBox>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>CURRENT EXP</span>
                    <span style={{ fontSize: '18px', color: '#eab308', fontWeight: 'bold' }}>
                      <Zap size={14} /> {selectedHunter.visualXp || 0} / {selectedHunter.visualNeeded}
                    </span>
                  </DataBox>
                </DataGrid>

                <SectionLabel><TrendingUp size={14} /> RECENT RECORDS (PRS)</SectionLabel>
                {loadingHunterData ? (
                  <div style={{ textAlign: 'center', fontSize: '12px', color: '#0ea5e9' }}>Loading records...</div>
                ) : hunterRecordsData.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', padding: '10px' }}>No records logged.</div>
                ) : (
                  <div style={{ maxHeight: '150px', overflowY: 'auto', paddingRight: '5px' }}>
                    {hunterRecordsData.map((r, i) => (
                      <RecordRow key={i}>
                        <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><Dumbbell size={16} color="#0ea5e9" /> {String(r.exercise_name)}</span>
                        <span style={{ color: '#eab308', fontWeight: '900', fontSize: '15px' }}>{String(r.weight_kg || '')} {r.reps ? ` ${String(r.reps)}` : ''}</span>
                      </RecordRow>
                    ))}
                  </div>
                )}

                <SectionLabel><Database size={14} /> PUBLIC MISSIONS LOG</SectionLabel>
                {loadingHunterData ? (
                  <div style={{ textAlign: 'center', fontSize: '12px', color: '#0ea5e9' }}>Loading missions...</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
                    {renderAllMissions()}
                  </div>
                )}

                {/* الكوتش بس اللي بيشوف الحاجات الحساسة */}
                {isCoachMode && (
                  <CoachSection initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h3 style={{ color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 15px 0' }}>
                      <ShieldAlert size={16} /> CLASSIFIED COACH DATA
                    </h3>
                    <DataGrid style={{ marginBottom: '15px' }}>
                      <DataBox>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>HP (HEALTH)</span>
                        <span style={{ fontSize: '18px', color: '#ef4444', fontWeight: 'bold' }}><HeartPulse size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} /> {selectedHunter.hp ?? 100} / 100</span>
                      </DataBox>
                      <DataBox>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>BODY WEIGHT</span>
                        <span style={{ fontSize: '18px', color: '#38bdf8', fontWeight: 'bold' }}><Scale size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} /> {selectedHunter.weight ? `${selectedHunter.weight} KG` : 'N/A'}</span>
                      </DataBox>
                      <DataBox>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>INBODY (FAT %)</span>
                        <span style={{ fontSize: '18px', color: '#facc15', fontWeight: 'bold' }}><Percent size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} /> {selectedHunter.body_fat ? `${selectedHunter.body_fat}%` : 'N/A'}</span>
                      </DataBox>
                      <DataBox>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>ATTENDANCE RATE</span>
                        <span style={{ fontSize: '18px', color: hunterAttendance.rate >= 80 ? '#10b981' : hunterAttendance.rate >= 50 ? '#eab308' : '#ef4444', fontWeight: 'bold' }}><Activity size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} /> {hunterAttendance.rate}% <span style={{ fontSize: 10, color: '#64748b' }}>({hunterAttendance.attended}/{hunterAttendance.total}D)</span></span>
                      </DataBox>
                    </DataGrid>
                  </CoachSection>
                )}
              </ModalContent>
            </ModalOverlay>
          )}
        </AnimatePresence>
      </>,
      document.body
    );
  };

  return (
    <Container initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <Toaster position="top-center" theme="dark" />

      <TopActions>
        <TopBtn $active={isCoachMode} $color="#ef4444" onClick={() => { playClick(); if (!isCoachMode) setShowPasswordPrompt(true); }}>
          {isCoachMode ? <Unlock size={14} /> : <Lock size={14} />} {isCoachMode ? 'MASTER ACTIVE' : 'COACH OVERRIDE'}
        </TopBtn>
        <AnimatePresence>
          {isCoachMode && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <TopBtn $active={true} $color="#10b981" onClick={() => { playClick(); setShowKeysModal(true); fetchAccessKeys(); }}>
                <Key size={14} /> KEYS
              </TopBtn>
              <TopBtn $active={true} $color="#eab308" onClick={() => { playClick(); setShowInboxModal(true); fetchInboxRequests(); }}>
                <Inbox size={14} /> INBOX {inboxRequests.length > 0 && ( <InboxBadge>{inboxRequests.length}</InboxBadge> )}
              </TopBtn>
              <TopBtn $active={true} $color="#f43f5e" onClick={handleResetMonth} disabled={isProcessing}>
                <RotateCcw size={14} /> RESET MONTH
              </TopBtn>
            </motion.div>
          )}
        </AnimatePresence>
      </TopActions>

      <TabsGrid>
        <Tab $active={activeBoard === 'global'} $glowColor="#a855f7" onClick={() => { playClick(); setActiveBoard('global'); }}>الترتيب العام <Globe size={16} /></Tab>
        <Tab $active={activeBoard === 'monthly'} $glowColor="#0ea5e9" onClick={() => { playClick(); setActiveBoard('monthly'); }}>بطل الشهر <Trophy size={16} /></Tab>
        <Tab $active={activeBoard === 'male'} $glowColor="#38bdf8" onClick={() => { playClick(); setActiveBoard('male'); }}>تصنيف الشباب <Sword size={16} /></Tab>
        <Tab $active={activeBoard === 'female'} $glowColor="#ec4899" onClick={() => { playClick(); setActiveBoard('female'); }}>تصنيف البنات <Crown size={16} /></Tab>
      </TabsGrid>

      {!loading && topThree.length > 0 && (
        <HallOfFameContainer>
          {orderedTopThree.map((hunter) => {
            const isFirst = hunter.index === 0;
            const height = getPedestalHeight(hunter.index);
            const pColor = isFirst ? '#eab308' : hunter.index === 1 ? '#94a3b8' : '#b45309';
            const classColor = getUserClassInfo(hunter.selectedIcon || hunter.icon).color;
            
            return (
              <PedestalWrapper key={hunter.name} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: hunter.index * 0.1 }} onClick={() => handlePlayerClick(hunter)} style={{ cursor: 'pointer' }}>
                <div style={{ textAlign: 'center', zIndex: 15, marginBottom: '10px' }}>
                  <HeroAvatar $color={pColor} $isFirst={isFirst} style={{ position: 'relative', top: 0, margin: '0 auto 10px auto' }}>
                    {getHunterIconOnly(hunter, classColor, isFirst ? 35 : 25)}
                  </HeroAvatar>
                  <HeroName $color={pColor}>{hunter.name.split(' ')[0]}</HeroName>
                  <HeroLevel>LVL {hunter.visualLevel} <br/><span style={{color: '#0ea5e9'}}>{activeBoard === 'monthly' ? hunter.monthlyVisualXp : hunter.visualXp} XP</span></HeroLevel>
                  {hunter.active_pet && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                      <MiniOrb type={PETS_DATABASE.find(p => p.name === hunter.active_pet)?.type || 'wyvern'} color={PETS_DATABASE.find(p => p.name === hunter.active_pet)?.color || '#eab308'} />
                    </div>
                  )}
                </div>

                <PedestalBase $color={pColor} $height={height}>
                  <div style={{ fontSize: isFirst ? '40px' : '30px', fontWeight: '900', color: pColor, opacity: 0.5 }}>{hunter.index + 1}</div>
                </PedestalBase>
                
                <BeamLight $color={pColor} />
                {isFirst && (
                  <Crown3D animate={{ y: [-5, 5, -5], rotateY: 360 }} transition={{ y: { duration: 2, repeat: Infinity, ease: "easeInOut" }, rotateY: { duration: 4, repeat: Infinity, ease: "linear" } }}>
                    <Crown size={35} color="#eab308" fill="#ca8a04" />
                  </Crown3D>
                )}
              </PedestalWrapper>
            );
          })}
        </HallOfFameContainer>
      )}

      <SearchContainer>
        <SearchIconBox><Search size={20} /></SearchIconBox>
        <SearchInput type="text" placeholder="ابحث عن لاعب..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </SearchContainer>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeBoard} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {others.length === 0 && topThree.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontStyle: 'italic' }}>لا يوجد لاعبين متاحين</div>
              ) : (
                others.map((hunter) => {
                  const isMe = player?.name === hunter.name;
                  const playerWins = championsHistory.filter(c => c.hunter_name === hunter.name).length;
                  const classColor = getUserClassInfo(hunter.selectedIcon || hunter.icon).color;

                  return (
                    <PlayerCard key={`${hunter.name}-${activeBoard}`} $rankColor={hunter.rankColor} onClick={() => handlePlayerClick(hunter)} whileTap={{ scale: 0.95 }}>
                      <RankCol>{hunter.position}</RankCol>
                      <IconCircle $color={hunter.rankColor} $classColor={classColor}>
                         {getHunterIconOnly(hunter, classColor, 20)}
                      </IconCircle>
                      <NameCol>
                        <PlayerNameText>
                          {hunter.name} {isMe && <span style={{ color: '#0ea5e9', fontSize: 10 }}> (YOU)</span>}
                          {playerWins > 0 && <span style={{ color: '#eab308', fontSize: '11px', textShadow: '0 0 5px rgba(234, 179, 8, 0.5)' }}>👑 x{playerWins}</span>}
                        </PlayerNameText>
                        <PlayerTitleText $rankColor={hunter.rankColor}>{hunter.rankName}</PlayerTitleText>
                      </NameCol>
                      <LevelCol>
                        <LevelTextVal $rankColor={hunter.rankColor}>LVL {hunter.visualLevel}</LevelTextVal>
                        <EXPText>{activeBoard === 'monthly' ? hunter.monthlyVisualXp : hunter.visualXp} XP</EXPText>
                      </LevelCol>
                    </PlayerCard>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
      
      {renderModals()}
    </Container>
  );
};

export default Rank;