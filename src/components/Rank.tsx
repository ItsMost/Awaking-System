import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Medal,
  Shield,
  User,
  ChevronUp,
  Activity,
  Target,
  Zap,
  Crown,
  Lock,
  Unlock,
  ShieldAlert,
  HeartPulse,
  Scale,
  Percent,
  CheckCircle,
  Clock,
  X,
  Database,
  Dumbbell,
  TrendingUp,
  CalendarDays,
  Globe,
  Moon,
  Eye,
  Wind,
  Footprints,
  Lock as LockIcon,
  Gem,
  Coffee,
  Flame,
  XCircle,
  Inbox,
  Check,
  FileImage,
  Sword,
  Skull,
  Crosshair,
  Heart,
  Droplet,
  Search,
  Key,
  Plus,
  Copy,
  Trash2,
  Infinity as InfinityIcon,
  Axe,
  Anchor,
  Fingerprint,
  Hexagon,
  Cpu,
  RotateCcw,
  Ghost,
  Award,
  Star
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast, Toaster } from 'sonner';

// ==========================================
// 1. المحرك الصوتي المضاد للسبام (Anti-Spam Audio Shield) 🚨
// ==========================================
let sharedAudioCtx: AudioContext | null = null;
let lastPlayTime = 0;

const getAudioContext = () => {
  if (!sharedAudioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) sharedAudioCtx = new Ctx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
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
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
  
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
};

const playHover = () => {
  if (!canPlay()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  
  gain.gain.setValueAtTime(0.02, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.05);
};

const playUnlock = () => {
  if (!canPlay()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
  osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.2);
  
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
};

// ==========================================
// 2. Rank System & Class Mapping (نظام الرانكات والكلاسات)
// ==========================================

const getRankInfo = (level: number) => {
  if (level >= 30) return { name: 'ELITE', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.3)' };
  if (level >= 25) return { name: 'MASTER', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)' };
  if (level >= 20) return { name: 'DIAMOND', color: '#3b82f6', glow: 'none' };
  if (level >= 15) return { name: 'PLATINUM', color: '#06b6d4', glow: 'none' };
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
    if (cls.id === normalized || cls.keys.some((k) => normalized.includes(k))) {
      return cls;
    }
  }
  return CLASS_MAPPING[0];
};

// 🚨 التعديل السحري: الأيقونة ترجع بلونها الأصلي اللي اللاعب اختاره 🚨
const getHunterIconOnly = (hunter: any, isRank1: boolean, size: number = 22) => {
  const iconStr = String(
    hunter?.selectedIcon || 
    hunter?.selected_icon || 
    hunter?.icon || 
    hunter?.class || 
    (hunter?.titles && hunter.titles[0]) || 
    ''
  ).toLowerCase().trim();

  const isEvolved = iconStr.includes('evolved');
  const cls = getUserClassInfo(iconStr);
  const IconComponent = isEvolved ? cls.evolvedIcon : cls.baseIcon;
  
  // بنستخدم اللون الأصلي للكلاس (cls.color) عشان نحافظ على الهوية البصرية، والمركز الأول بياخد دهبي
  const finalColor = isRank1 ? '#eab308' : cls.color;

  return <IconComponent size={size} color={finalColor} />;
};

const getIconBorderColor = (hunter: any, isRank1: boolean) => {
  if (isRank1) return '#eab308';
  return getRankInfo(hunter?.lvl || 1).color;
};

const QUEST_REWARDS: Record<string, { exp: number; gold: number }> = {
  Practice: { exp: 100, gold: 30 },
  'Practice (Rehab)': { exp: 90, gold: 30 },
  'Hydration Target (3L)': { exp: 30, gold: 10 },
  'Nutritional Compliance': { exp: 30, gold: 10 },
  'Functional Mobility': { exp: 35, gold: 15 },
  'Recovery Cooldown': { exp: 20, gold: 10 },
  'Rehab Mobility Protocol': { exp: 35, gold: 15 },
  'Thermal / Cryotherapy': { exp: 20, gold: 10 },
  'Weekly Volume Compliance': { exp: 150, gold: 100 },
  'Perfect Microcycle Streak': { exp: 150, gold: 100 },
  'Recovery Logistics': { exp: 100, gold: 50 },
  'Supplement Inventory': { exp: 100, gold: 50 },
  'InBody Assessment': { exp: 75, gold: 200 },
  'Disciplinary Execution': { exp: 0, gold: 0 },
};

const NORMAL_DAILY_QUESTS = ['Practice', 'Hydration Target (3L)', 'Nutritional Compliance', 'Functional Mobility', 'Recovery Cooldown'];
const INJURED_DAILY_QUESTS = ['Practice (Rehab)', 'Hydration Target (3L)', 'Tissue Repair Nutrition', 'Rehab Mobility Protocol', 'Thermal / Cryotherapy'];
const FRIDAY_DIRECTIVES = ['Weekly Volume Compliance', 'Perfect Microcycle Streak'];

const getCumulativeXp = (lvl: number, currentXp: number) => {
  let total = 0;
  for (let i = 1; i < lvl; i++) {
    total += Math.min(i * 150 + 500, 4000);
  }
  return total + currentXp;
};


// ==========================================
// 3. التصميمات المفرودة (Styled Components)
// ==========================================
const Container = styled(motion.div)`
  padding: 15px;
  font-family: 'Oxanium', sans-serif;
  color: #fff;
  padding-bottom: 100px;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
`;

const TopActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const TopBtn = styled.button<{ $active?: boolean; $color?: string }>`
  background: ${(props) => (props.$active ? `${props.$color}20` : '#0f172a')};
  border: 1px solid ${(props) => (props.$active ? props.$color : '#1e293b')};
  color: ${(props) => (props.$active ? props.$color : '#94a3b8')};
  padding: 10px 15px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Oxanium';
  font-weight: 900;
  font-size: 12px;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: ${(props) => props.$active ? `0 0 15px ${props.$color}40` : '0 4px 10px rgba(0,0,0,0.3)'};

  &:hover {
    background: ${(props) => (props.$active ? `${props.$color}40` : '#1e293b')};
    color: ${(props) => props.$color || '#fff'};
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const InboxBadge = styled.span`
  background: #ef4444;
  color: #fff;
  padding: 2px 6px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 900;
  margin-left: 5px;
`;

const TabsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px;
  border-radius: 12px;
  border: none;
  font-family: 'Oxanium', sans-serif;
  font-weight: bold;
  font-size: 13px;
  cursor: pointer;
  transition: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${(props) => (props.$active ? '#0ea5e9' : '#0f172a')};
  color: ${(props) => (props.$active ? '#fff' : '#94a3b8')};
  box-shadow: ${(props) => props.$active ? '0 4px 15px rgba(14, 165, 233, 0.4)' : 'none'};
`;

const BannerWrapper = styled.div`
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 16px;
  padding: 25px 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 30px rgba(0,0,0,0.5);
`;

const BannerIcon = styled.div` margin-bottom: 10px; `;
const BannerTitle = styled.h2` margin: 0; color: #0ea5e9; font-size: 18px; letter-spacing: 2px; text-transform: uppercase; font-weight: 900; text-align: center; `;
const BannerSub = styled.p` margin: 5px 0 0 0; color: #64748b; font-size: 12px; text-align: center; `;
const SearchContainer = styled.div` position: relative; margin-bottom: 25px; `;
const SearchIconBox = styled.div` position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #0ea5e9; `;

const SearchInput = styled.input`
  width: 100%;
  background: rgba(11, 17, 32, 0.8);
  border: 1px solid #1e293b;
  color: #fff;
  padding: 16px 16px 16px 50px;
  border-radius: 14px;
  font-family: 'Oxanium';
  font-size: 15px;
  outline: none;
  transition: 0.3s;

  &:focus { border-color: #00f2ff; box-shadow: 0 0 15px rgba(0,242,255,0.2); }
  &::placeholder { color: #475569; font-weight: bold; }
`;

const PlayerCard = styled(motion.div)<{ $isRank1: boolean; $rankColor: string; $rankGlow: string }>`
  background: #0f172a;
  border-left: 4px solid ${(props) => (props.$isRank1 ? '#eab308' : props.$rankColor)};
  border-radius: 12px;
  padding: 15px 20px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: ${(props) => (props.$rankGlow !== 'none' ? `0 0 15px ${props.$rankGlow}` : '0 4px 6px rgba(0,0,0,0.3)')};

  &:hover {
    background: #1e293b;
    transform: translateX(5px);
  }
`;

const Ribbon = styled.div`
  position: absolute;
  top: 12px;
  right: -35px;
  background: #eab308;
  color: #000;
  padding: 4px 40px;
  transform: rotate(45deg);
  font-size: 10px;
  font-weight: 900;
  box-shadow: 0 2px 10px rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 10;
`;

const RankCol = styled.div<{ $rank: number }>`
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 900;
  color: ${(props) => (props.$rank <= 3 ? '#eab308' : '#64748b')};
`;

const IconCircle = styled.div<{ $color: string; $isRank1: boolean }>`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 2px solid ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 15px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.3);
  box-shadow: ${(props) => (props.$isRank1 ? `0 0 15px ${props.$color}50` : 'none')};
  overflow: hidden;
`;

const NameCol = styled.div` flex: 1; display: flex; flex-direction: column; justify-content: center; `;

const PlayerNameText = styled.div<{ $isRank1: boolean; $rankColor: string }>`
  font-size: 16px;
  font-weight: bold;
  color: ${(props) => (props.$isRank1 ? '#eab308' : '#fff')};
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PlayerTitleText = styled.div<{ $rankColor: string }>`
  font-size: 10px;
  color: ${(props) => props.$rankColor};
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: bold;
`;

const LevelCol = styled.div` display: flex; flex-direction: column; align-items: flex-end; justify-content: center; `;
const LevelTextVal = styled.div<{ $isRank1: boolean; $rankColor: string }>`
  font-size: 18px;
  font-weight: 900;
  color: ${(props) => (props.$isRank1 ? '#eab308' : props.$rankColor)};
  transition: 0.3s;
`;

const HoverStats = styled.div`
  font-size: 10px;
  color: #94a3b8;
  font-weight: bold;
  max-height: 0;
  opacity: 0;
  transition: all 0.3s ease;
  text-align: right;
  ${PlayerCard}:hover & { max-height: 20px; opacity: 1; margin-top: 4px; }
`;

const LoadingSpinner = styled.div` border: 4px solid rgba(14, 165, 233, 0.1); border-left-color: #0ea5e9; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 60px auto; @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } `;
const ModalOverlay = styled(motion.div)` position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(8px); `;
const ModalContent = styled(motion.div)<{ $isCoach?: boolean; $borderColor?: string }>` background: #0b1120; border: 2px solid ${(props) => props.$borderColor || (props.$isCoach ? '#ef4444' : '#1e293b')}; border-radius: 20px; padding: 25px; width: 100%; max-width: 450px; position: relative; box-shadow: 0 0 50px ${(props) => props.$isCoach ? 'rgba(239,68,68,0.3)' : 'rgba(0,0,0,0.8)'}; max-height: 85vh; overflow-y: auto; &::-webkit-scrollbar { width: 5px; } &::-webkit-scrollbar-thumb { background: #334155; border-radius: 5px; } `;
const CloseBtn = styled.button` position: absolute; top: 20px; right: 20px; background: none; border: none; color: #94a3b8; cursor: pointer; padding: 8px; display: flex; align-items: center; justify-content: center; transition: 0.3s; &:hover { color: #fff; } `;
const PasswordOverlay = styled(motion.div)` background: #020617; border: 1px solid #ef4444; padding: 25px; border-radius: 12px; display: flex; flex-direction: column; gap: 15px; box-shadow: 0 5px 30px rgba(239,68,68,0.3); width: 100%; max-width: 350px; text-align: center; `;
const PasswordInput = styled.input` background: #0b1120; border: 1px solid #334155; color: #fff; padding: 12px; border-radius: 8px; font-family: 'Oxanium'; font-size: 16px; text-align: center; letter-spacing: 3px; &:focus { outline: none; border-color: #ef4444; } `;
const CoachSection = styled(motion.div)` margin-top: 25px; padding-top: 20px; border-top: 1px dashed #ef4444; `;
const DataGrid = styled.div` display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 15px; `;
const DataBox = styled.div` background: #1e293b50; border: 1px solid #334155; padding: 12px; border-radius: 10px; display: flex; flex-direction: column; gap: 5px; `;
const TaskRow = styled.div<{ $status: string }>` display: flex; justify-content: space-between; align-items: center; background: #020617; border: 1px solid ${(props) => props.$status === 'approved' ? '#10b981' : props.$status === 'pending' ? '#facc15' : '#ef4444'}; padding: 12px; border-radius: 8px; margin-bottom: 8px; font-size: 12px; `;
const RecordRow = styled.div` display: flex; justify-content: space-between; align-items: center; background: #0f172a; border-left: 3px solid #38bdf8; padding: 12px; border-radius: 6px; margin-bottom: 8px; font-size: 13px; `;
const RequestCard = styled.div` background: #0f172a; border: 1px solid #facc15; border-radius: 12px; padding: 15px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 10px; `;
const RequestHeader = styled.div` display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #334155; padding-bottom: 8px; `;
const RequestActions = styled.div` display: flex; gap: 10px; margin-top: 5px; `;
const ActionBtn = styled.button<{ $type: 'approve' | 'reject' | 'primary' }>` flex: 1; padding: 10px; border-radius: 8px; border: none; font-weight: bold; font-family: 'Oxanium'; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; transition: 0.3s; background: ${(props) => props.$type === 'approve' ? '#10b98120' : props.$type === 'primary' ? '#10b981' : '#ef444420'}; color: ${(props) => props.$type === 'approve' ? '#10b981' : props.$type === 'primary' ? '#000' : '#ef4444'}; border: 1px solid ${(props) => props.$type === 'approve' ? '#10b981' : props.$type === 'primary' ? '#10b981' : '#ef4444'}; &:hover { filter: brightness(1.2); } &:disabled { opacity: 0.5; cursor: not-allowed; } `;
const KeyCard = styled.div<{ $isUsed: boolean }>` background: #0f172a; border: 1px solid ${(props) => (props.$isUsed ? '#ef4444' : '#10b981')}; border-radius: 12px; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); `;
const KeyText = styled.div<{ $isUsed: boolean }>` font-family: monospace; font-size: 16px; font-weight: 900; letter-spacing: 2px; color: ${(props) => (props.$isUsed ? '#fca5a5' : '#34d399')}; text-decoration: ${(props) => (props.$isUsed ? 'line-through' : 'none')}; `;

// ==========================================
// 5. المكون الرئيسي (Leaderboard)
// ==========================================
const Rank = ({ player, setPlayer }: any) => {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<any[]>([]);
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<any[]>([]);
  const [maleLeaderboard, setMaleLeaderboard] = useState<any[]>([]);
  const [femaleLeaderboard, setFemaleLeaderboard] = useState<any[]>([]);
  
  // State للأبطال التاريخيين
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

  const fetchAndProcessLeaderboard = async () => {
    setLoading(true);
    try {
      const { data: hunters, error } = await supabase.from('shadow_hunters').select('*');
      if (error) throw error;
      
      // جلب تاريخ الأبطال من القاعدة
      const { data: champsData } = await supabase.from('season_champions').select('*');
      if (champsData) setChampionsHistory(champsData);

      if (!hunters) {
        setGlobalLeaderboard([]);
        return;
      }

      // 🚨 إضافة تفاصيل الرانك لكل لاعب (عشان نستخدمها في الـ UI) 🚨
      const processedHunters = hunters.map(h => {
        const lvl = h.lvl || 1;
        const rankInfo = getRankInfo(lvl);
        return {
          ...h,
          rankName: `${rankInfo.name} HUNTER${rankInfo.name === 'ELITE' ? ' 👑' : ''}`,
          rankColor: rankInfo.color,
          rankGlow: rankInfo.glow
        };
      });

      const sortedGlobal = [...processedHunters].sort((a, b) => {
        if (b.lvl !== a.lvl) return (b.lvl || 1) - (a.lvl || 1);
        return (b.xp || 0) - (a.xp || 0);
      });
      setGlobalLeaderboard(
        sortedGlobal.map((h, i) => ({
          ...h,
          position: i + 1,
        }))
      );

      const sortedMonthly = [...processedHunters].sort((a, b) => (b.monthly_xp || 0) - (a.monthly_xp || 0));
      setMonthlyLeaderboard(
        sortedMonthly.map((h, i) => ({
          ...h,
          position: i + 1,
        }))
      );

      const maleHunters = processedHunters.filter((h) => h.gender === 'Male' || !h.gender);
      const sortedMale = [...maleHunters].sort((a, b) => {
        if (b.lvl !== a.lvl) return (b.lvl || 1) - (a.lvl || 1);
        return (b.xp || 0) - (a.xp || 0);
      });
      setMaleLeaderboard(
        sortedMale.map((h, i) => ({
          ...h,
          position: i + 1,
        }))
      );

      const femaleHunters = processedHunters.filter((h) => h.gender === 'Female');
      const sortedFemale = [...femaleHunters].sort((a, b) => {
        if (b.lvl !== a.lvl) return (b.lvl || 1) - (a.lvl || 1);
        return (b.xp || 0) - (a.xp || 0);
      });
      setFemaleLeaderboard(
        sortedFemale.map((h, i) => ({
          ...h,
          position: i + 1,
        }))
      );
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
    const today = new Date().toISOString().split('T')[0];

    try {
      const { data: freshHunter } = await supabase
        .from('shadow_hunters')
        .select('*')
        .eq('name', hunter.name)
        .single();
      const targetHunter = freshHunter || hunter;
      
      // التأكد من جلب الرانك جوه المودال كمان
      const rankInfo = getRankInfo(targetHunter.lvl || 1);
      targetHunter.rankColor = rankInfo.color;
      targetHunter.rankName = `${rankInfo.name} HUNTER${rankInfo.name === 'ELITE' ? ' 👑' : ''}`;

      setSelectedHunter((prev: any) => ({ ...prev, ...targetHunter }));

      const { data: tasks } = await supabase
        .from('system_requests')
        .select('task_name, status')
        .eq('hunter_name', targetHunter.name)
        .gte('created_at', today);
      setHunterTasksData(tasks || []);

      const createdDate = targetHunter.created_at ? new Date(targetHunter.created_at) : new Date();
      const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
      const totalDaysSinceStart = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);

      const { data: allApprovedReqs } = await supabase
        .from('system_requests')
        .select('created_at')
        .eq('hunter_name', targetHunter.name)
        .eq('status', 'approved');
        
      const uniqueActiveDays = new Set();
      if (allApprovedReqs) {
        allApprovedReqs.forEach((req) => {
          const d = new Date(req.created_at);
          uniqueActiveDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
        });
      }
      const attendedDays = uniqueActiveDays.size;
      const attRate = Math.min(100, Math.round((attendedDays / totalDaysSinceStart) * 100));
      setHunterAttendance({ attended: attendedDays, total: totalDaysSinceStart, rate: attRate });

      let parsedRecords: any[] = [];
      let rawRecords = targetHunter.records;

      try {
        if (typeof rawRecords === 'string') rawRecords = JSON.parse(rawRecords);
        if (Array.isArray(rawRecords)) {
          parsedRecords = rawRecords.filter((r: any) => r.value > 0 || r.value !== 0).map((r: any) => ({
            exercise: r.title || r.id,
            weight: r.value,
            reps: r.unit || ''
          }));
        } else if (rawRecords && typeof rawRecords === 'object') {
          parsedRecords = Object.entries(rawRecords).map(([key, val]: [string, any]) => {
            if (typeof val === 'object' && val !== null) {
              return { exercise: key, weight: val.weight || val.value || '', reps: val.reps || '' };
            }
            return { exercise: key, weight: String(val), reps: '' };
          });
        }
      } catch (e) {}

      if (parsedRecords.length === 0) {
        let { data: records } = await supabase.from('records').select('*').eq('hunter_name', targetHunter.name);
        if (!records || records.length === 0) {
          const { data: pRecords } = await supabase.from('personal_records').select('*').eq('hunter_name', targetHunter.name);
          records = pRecords;
        }
        if (records) parsedRecords = records;
      }
      setHunterRecordsData(parsedRecords);
    } catch (error) {}
    setLoadingHunterData(false);
  };

  const fetchInboxRequests = async () => {
    setLoadingInbox(true);
    try {
      const { data } = await supabase
        .from('system_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
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

  // 🚨 زرار الـ Reset Month السحري 🚨
  const handleResetMonth = async () => {
    const confirmReset = window.confirm('⚠️ DANGER ZONE: هل أنت متأكد من إنهاء الموسم؟ سيتم تتويج الأبطال الحاليين ثم تصفير النقاط الشهرية لجميع اللاعبين!');
    if (!confirmReset) return;
    
    setIsProcessing(true);
    try {
      const topMale = maleLeaderboard[0];
      const topFemale = femaleLeaderboard[0];
      const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' }).toUpperCase();
      const seasonName = `SEASON: ${currentMonthName} WARFARE`;
      
      const championsToInsert = [];
      if (topMale && topMale.monthly_xp > 0) {
        championsToInsert.push({ hunter_name: topMale.name, season_name: seasonName, category: 'Male', monthly_xp: topMale.monthly_xp });
      }
      if (topFemale && topFemale.monthly_xp > 0) {
        championsToInsert.push({ hunter_name: topFemale.name, season_name: seasonName, category: 'Female', monthly_xp: topFemale.monthly_xp });
      }

      if (championsToInsert.length > 0) {
        const { error: champError } = await supabase.from('season_champions').insert(championsToInsert);
        if (champError) throw champError;
      }

      const { error: resetError } = await supabase.from('shadow_hunters').update({ monthly_xp: 0 }).gte('lvl', 1);
      if (resetError) throw resetError;

      toast.success('🏆 Season Ended! Champions Crowned & Monthly Leaderboard Reset!', { style: { background: '#022c22', color: '#10b981', border: '1px solid #10b981' } });
      await supabase.from('exp_history').insert([{ hunter_name: 'SYSTEM', amount_changed: 0, new_total_xp: 0, operation_type: 'increase', reason: 'A NEW SEASON HAS BEGUN! 🏆' }]);
      
      fetchAndProcessLeaderboard();
    } catch (err) { toast.error('Error ending season.'); }
    setIsProcessing(false);
  };

  const handleRequestAction = async (request: any, action: 'approve' | 'reject') => {
    if (isProcessing) return;
    setIsProcessing(true);
    playClick();
    try {
      if (action === 'reject') {
        await supabase.from('system_requests').delete().eq('id', request.id);
        toast.error(`Request Rejected`, { style: { background: '#2a0808', color: '#ef4444', border: '1px solid #ef4444' } });
      } else if (action === 'approve') {
        const { error: updateError } = await supabase.from('system_requests').update({ status: 'approved' }).eq('id', request.id);
        if (updateError) throw updateError;

        if (request.task_name === '[INJURY REPORT]') {
          await supabase.from('shadow_hunters').update({ is_injured: true, injury_details: request.evidence }).eq('name', request.hunter_name);
          await supabase.from('system_requests').delete().eq('id', request.id);
          toast.success(`${request.hunter_name} moved to Rehab Mode!`, { style: { background: '#022c22', color: '#10b981', border: '1px solid #10b981' } });
        } else if (request.type === 'record' || request.task_name.startsWith('[NEW PR]')) {
          const { data: hunterData } = await supabase.from('shadow_hunters').select('*').eq('name', request.hunter_name).single();
          if (hunterData) {
            const newGold = (hunterData.gold || 0) + 200;
            let currentRecords = hunterData.records;
            if (typeof currentRecords === 'string') currentRecords = JSON.parse(currentRecords);
            let updatedRecords = Array.isArray(currentRecords) ? [...currentRecords] : [];
            const recordTitle = request.task_name.replace('[NEW PR]', '').trim();
            const achievedPart = request.evidence.split('Achieved')[1];
            const newValue = achievedPart ? parseFloat(achievedPart.trim()) : 0;

            let recordFound = false;
            updatedRecords = updatedRecords.map((r) => {
              if (r.title === recordTitle || r.id === recordTitle) { recordFound = true; return { ...r, value: newValue }; }
              return r;
            });
            if (!recordFound && newValue > 0) {
              updatedRecords.push({ id: recordTitle.toLowerCase().replace(/\s/g, '_'), title: recordTitle, value: newValue, unit: '' });
            }

            const { error: hError } = await supabase.from('shadow_hunters').update({ gold: newGold, records: updatedRecords }).eq('name', request.hunter_name);
            if (hError) throw hError;
            await supabase.from('exp_history').insert([{ hunter_name: request.hunter_name, amount_changed: 0, new_total_xp: hunterData.xp, operation_type: 'increase', reason: `New PR: ${recordTitle}` }]);
            toast.success(`Record Approved! ${request.hunter_name} got 200 Gold!`, { style: { background: '#022c22', color: '#10b981', border: '1px solid #10b981' } });
          }
        } else {
          const { data: hunterData } = await supabase.from('shadow_hunters').select('*').eq('name', request.hunter_name).single();
          if (hunterData) {
            const taskKey = Object.keys(QUEST_REWARDS).find((key) => request.task_name.includes(key)) || request.task_name;
            const reward = QUEST_REWARDS[taskKey] || { exp: 50, gold: 20 };
            let newXp = (hunterData.xp || 0) + reward.exp;
            let newMonthlyXp = (hunterData.monthly_xp || 0) + reward.exp;
            let newGold = (hunterData.gold || 0) + reward.gold;
            let newLvl = hunterData.lvl || 1;
            let xpNeeded = Math.min(newLvl * 150 + 500, 4000);
            
            while (newXp >= xpNeeded) {
              newXp -= xpNeeded;
              newLvl += 1;
              xpNeeded = Math.min(newLvl * 150 + 500, 4000);
            }
            
            const { error: hError } = await supabase.from('shadow_hunters').update({ xp: newXp, monthly_xp: newMonthlyXp, gold: newGold, lvl: newLvl }).eq('name', request.hunter_name);
            if (hError) throw hError;
            await supabase.from('exp_history').insert([{ hunter_name: request.hunter_name, amount_changed: reward.exp, new_total_xp: newXp, operation_type: 'increase', reason: request.task_name }]);
          }
          toast.success(`Request Approved: ${request.hunter_name} rewarded!`, { style: { background: '#022c22', color: '#10b981', border: '1px solid #10b981' } });
        }
      }
      setInboxRequests((prev) => prev.filter((r) => r.id !== request.id));
      fetchAndProcessLeaderboard();
    } catch (err: any) {
      toast.error(`Action failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  let displayBoard = globalLeaderboard;
  if (activeBoard === 'monthly') displayBoard = monthlyLeaderboard;
  if (activeBoard === 'male') displayBoard = maleLeaderboard;
  if (activeBoard === 'female') displayBoard = femaleLeaderboard;
  const filteredBoard = displayBoard.filter((h) => h.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getBannerInfo = () => {
    switch (activeBoard) {
      case 'monthly': return { title: 'MONTHLY CHAMPIONS', sub: 'أبطال الشهر الحالي', icon: <Trophy size={32} color="#0ea5e9" /> };
      case 'male': return { title: 'MALE DIVISION', sub: 'تصنيف الشباب العام', icon: <Sword size={32} color="#0ea5e9" /> };
      case 'female': return { title: 'FEMALE DIVISION', sub: 'تصنيف البنات العام', icon: <Crown size={32} color="#ec4899" /> };
      default: return { title: 'ALL-TIME HALL OF FAME', sub: 'الترتيب العام الشامل لجميع اللاعبين', icon: <Globe size={32} color="#0ea5e9" /> };
    }
  };
  const bannerInfo = getBannerInfo();

  const renderAllMissions = () => {
    if (!selectedHunter) return null;
    const isFriday = new Date().getDay() === 5;
    const baseQuests = selectedHunter.is_injured ? INJURED_DAILY_QUESTS : NORMAL_DAILY_QUESTS;
    const allPossibleQuests = isFriday ? [...baseQuests, ...FRIDAY_DIRECTIVES] : baseQuests;

    return allPossibleQuests.map((questTitle, idx) => {
      const dbTask = hunterTasksData.find((t) => t.task_name === questTitle);
      const status = dbTask ? dbTask.status : 'not_started';
      return (
        <TaskRow key={idx} $status={status}>
          <span style={{ color: '#fff', fontWeight: 'bold' }}>{questTitle}</span>
          {status === 'approved' ? (
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '900' }}>
              <CheckCircle size={14} /> DONE
            </span>
          ) : status === 'pending' ? (
            <span style={{ color: '#facc15', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '900' }}>
              <Clock size={14} /> WAITING
            </span>
          ) : (
            <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '900' }}>
              <XCircle size={14} /> NOT STARTED
            </span>
          )}
        </TaskRow>
      );
    });
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
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} style={{ display: 'flex', gap: '10px' }}>
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

      {/* Keys Modal */}
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

      {/* Password Modal */}
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

      {/* Inbox Modal */}
      <AnimatePresence>
        {showInboxModal && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent $isCoach={true} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}>
              <CloseBtn onClick={() => setShowInboxModal(false)}><X size={24} /></CloseBtn>
              <h2 style={{ color: '#eab308', display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 20px 0' }}><Inbox size={24} /> PENDING REQUESTS</h2>
              {loadingInbox ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#eab308' }}><LoadingSpinner /></div>
              ) : inboxRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', background: '#1e293b30', borderRadius: '12px', color: '#94a3b8' }}>No pending requests.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {inboxRequests.map((req) => (
                    <RequestCard key={req.id}>
                      <RequestHeader>
                        <span style={{ fontWeight: '900', color: '#fff' }}>{req.hunter_name}</span>
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

      <TabsGrid>
        <Tab $active={activeBoard === 'global'} onClick={() => { playClick(); setActiveBoard('global'); }}>الترتيب العام <Globe size={16} /></Tab>
        <Tab $active={activeBoard === 'monthly'} onClick={() => { playClick(); setActiveBoard('monthly'); }}>بطل الشهر <Trophy size={16} /></Tab>
        <Tab $active={activeBoard === 'male'} onClick={() => { playClick(); setActiveBoard('male'); }}>تصنيف الشباب <Sword size={16} /></Tab>
        <Tab $active={activeBoard === 'female'} onClick={() => { playClick(); setActiveBoard('female'); }}>تصنيف البنات <Crown size={16} /></Tab>
      </TabsGrid>

      <BannerWrapper>
        <BannerIcon>{bannerInfo.icon}</BannerIcon>
        <BannerTitle>{bannerInfo.title}</BannerTitle>
        <BannerSub>{bannerInfo.sub}</BannerSub>
      </BannerWrapper>

      <SearchContainer>
        <SearchIconBox><Search size={20} /></SearchIconBox>
        <SearchInput type="text" placeholder="Search Hunters by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </SearchContainer>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeBoard} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filteredBoard.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontStyle: 'italic' }}>No hunters found matching "{searchQuery}"</div>
              ) : (
                filteredBoard.map((hunter, index) => {
                  const isMe = player?.name === hunter.name;
                  const isRank1 = hunter.position === 1;
                  const playerWins = championsHistory.filter(c => c.hunter_name === hunter.name).length;

                  return (
                    <PlayerCard 
                      key={`${hunter.name}-${activeBoard}`} 
                      $isRank1={isRank1} 
                      $rankColor={hunter.rankColor} 
                      $rankGlow={hunter.rankGlow}
                      onClick={() => handlePlayerClick(hunter)} 
                      onMouseEnter={playHover} 
                      whileTap={{ scale: 0.95 }}
                    >
                      {isRank1 && <Ribbon>المركز الأول 👑</Ribbon>}
                      <RankCol $rank={hunter.position}>{isRank1 ? <Gem size={24} color="#eab308" fill="#ca8a04" /> : hunter.position}</RankCol>
                      
                      <IconCircle $color={getIconBorderColor(hunter, isRank1)} $isRank1={isRank1}>
                        {getHunterIconOnly(hunter, isRank1, 24)}
                      </IconCircle>
                      
                      <NameCol>
                        <PlayerNameText $isRank1={isRank1} $rankColor={hunter.rankColor}>
                          {hunter.name} {isMe && '(YOU)'}
                          {playerWins > 0 && (
                            <span style={{ color: '#eab308', fontSize: '11px', textShadow: '0 0 5px rgba(234, 179, 8, 0.5)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              👑 x{playerWins}
                            </span>
                          )}
                        </PlayerNameText>
                        <PlayerTitleText $rankColor={hunter.rankColor}>{hunter.rankName}</PlayerTitleText>
                      </NameCol>
                      <LevelCol>
                        <LevelTextVal $isRank1={isRank1} $rankColor={hunter.rankColor}>LVL {hunter.lvl || 1}</LevelTextVal>
                        <HoverStats>{activeBoard === 'monthly' ? hunter.monthly_xp : getCumulativeXp(hunter.lvl || 1, hunter.xp || 0)} EXP</HoverStats>
                      </LevelCol>
                    </PlayerCard>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Hunter Details Modal */}
      <AnimatePresence>
        {selectedHunter && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent $isCoach={isCoachMode} $borderColor={selectedHunter.rankColor} initial={{ scale: 0.9 }}>
              <CloseBtn onClick={() => setSelectedHunter(null)}><X size={24} /></CloseBtn>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <IconCircle $color={selectedHunter.rankColor} $isRank1={false} style={{ width: 80, height: 80, margin: '0 auto 15px auto', borderWidth: '4px' }}>
                  {getHunterIconOnly(selectedHunter, false, 40)}
                </IconCircle>
                <h2 style={{ margin: 0, color: selectedHunter.rankColor, textTransform: 'uppercase' }}>{selectedHunter.name}</h2>
                <div style={{ color: '#64748b', fontSize: '12px' }}>{selectedHunter.rankName}</div>
              </div>

              <DataGrid>
                <DataBox>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>LEVEL</span>
                  <span style={{ fontSize: '18px', color: '#00f2ff', fontWeight: 'bold' }}><ChevronUp size={14} /> {selectedHunter.lvl || 1}</span>
                </DataBox>
                <DataBox>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>TOTAL EXP</span>
                  <span style={{ fontSize: '18px', color: '#eab308', fontWeight: 'bold' }}><Zap size={14} /> {getCumulativeXp(selectedHunter.lvl || 1, selectedHunter.xp || 0)}</span>
                </DataBox>
              </DataGrid>

              <div style={{ fontSize: '11px', color: '#94a3b8', margin: '20px 0 10px 0', borderBottom: '1px solid #334155', paddingBottom: '5px' }}>
                <TrendingUp size={12} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> PERFORMANCE RECORDS
              </div>
              
              {loadingHunterData ? (
                <div style={{ textAlign: 'center', fontSize: '12px', color: '#0ea5e9' }}>Loading records...</div>
              ) : hunterRecordsData.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', padding: '10px' }}>No records logged.</div>
              ) : (
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {hunterRecordsData.map((r, i) => (
                    <RecordRow key={i}>
                      <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}><Dumbbell size={14} color="#0ea5e9" /> {String(r.exercise || r.exercise_name || 'Exercise')}</span>
                      <span style={{ color: '#eab308', fontWeight: '900' }}>{String(r.weight || '')} {r.reps ? ` ${String(r.reps)}` : ''}</span>
                    </RecordRow>
                  ))}
                </div>
              )}

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

                  <div style={{ fontSize: '11px', color: '#94a3b8', margin: '20px 0 10px 0', borderBottom: '1px solid #334155', paddingBottom: '5px' }}>
                    <Database size={12} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> TODAY'S MISSIONS TRACKER
                  </div>

                  {loadingHunterData ? (
                    <div style={{ textAlign: 'center', fontSize: '12px', color: '#ef4444' }}>Loading missions...</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '150px', overflowY: 'auto' }}>
                      {renderAllMissions()}
                    </div>
                  )}
                </CoachSection>
              )}
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default Rank;