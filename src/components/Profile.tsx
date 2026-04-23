import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import {
  Zap, X, Activity, Award, Target, Shield, Flame, Camera, Hexagon, Moon, Ghost, Wind, Footprints,
  Lock as LockIcon, Dumbbell, Sword, Skull, Crown, Heart, Droplet, Axe, Anchor, Fingerprint, Cpu,
  Infinity as InfinityIcon, Settings, Unlock, Crosshair, LogOut, Eye, User, Medal, TrendingUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ==========================================
// 1. الأصوات البرمجية
// ==========================================
const playClick = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
};

const playError = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
};

// ==========================================
// 2. نظام الرانكات والكلاسات والحسابات
// ==========================================
const calculateLevelData = (totalXp: number) => {
  let level = 1;
  let currentXp = totalXp;
  let expNeededForNextLevel = 650;

  while (currentXp >= expNeededForNextLevel) {
    currentXp -= expNeededForNextLevel;
    level++;
    expNeededForNextLevel = Math.min(level * 150 + 500, 4000);
  }

  return { level, xpInCurrentLevel: currentXp, expNeededForNextLevel };
};

const getRankInfo = (level: number) => {
  if (level >= 30) return { name: 'ELITE', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', icon: Crown };
  if (level >= 25) return { name: 'MASTER', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', icon: Flame };
  if (level >= 20) return { name: 'DIAMOND', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', icon: Shield };
  if (level >= 15) return { name: 'PLATINUM', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', icon: Target };
  if (level >= 10) return { name: 'GOLD', color: '#eab308', glow: 'rgba(234, 179, 8, 0.4)', icon: Medal };
  if (level >= 5)  return { name: 'SILVER', color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.4)', icon: Medal };
  return { name: 'BRONZE', color: '#b45309', glow: 'rgba(180, 83, 9, 0.4)', icon: Medal };
};

const getNextRankInfo = (lvl: number, currentXp: number) => {
  if (lvl >= 30) return { nextRank: 'MAXED', remainingXp: 0, percent: 100 };

  let nextRankLvl = 5;
  if (lvl >= 5) nextRankLvl = 10;
  if (lvl >= 10) nextRankLvl = 15;
  if (lvl >= 15) nextRankLvl = 20;
  if (lvl >= 20) nextRankLvl = 25;
  if (lvl >= 25) nextRankLvl = 30;

  let startRankLvl = nextRankLvl - 5;
  if (startRankLvl === 0) startRankLvl = 1;

  let totalTierXp = 0;
  for(let i = startRankLvl; i < nextRankLvl; i++) {
    totalTierXp += Math.min(i * 150 + 500, 4000);
  }

  let earnedTierXp = 0;
  for(let i = startRankLvl; i < lvl; i++) {
    earnedTierXp += Math.min(i * 150 + 500, 4000);
  }
  earnedTierXp += currentXp;

  const remainingXp = totalTierXp - earnedTierXp;
  const percent = Math.min(100, (earnedTierXp / totalTierXp) * 100);
  const nextRankName = getRankInfo(nextRankLvl).name;

  return { nextRank: nextRankName, remainingXp, percent };
};

const CLASS_MAPPING = [
  { id: 'axe', name: 'Berserker', baseIcon: Axe, evolvedIcon: Sword, color: '#cbd5e1' },
  { id: 'sword', name: 'Blade Master', baseIcon: Sword, evolvedIcon: Axe, color: '#00f2ff' },
  { id: 'shadow', name: 'Shadow Assassin', baseIcon: Moon, evolvedIcon: Ghost, color: '#818cf8' },
  { id: 'wind', name: 'Wind Walker', baseIcon: Wind, evolvedIcon: Footprints, color: '#38bdf8' },
  { id: 'dumbbell', name: 'Titan Lifter', baseIcon: Dumbbell, evolvedIcon: Anchor, color: '#f97316' },
  { id: 'zap', name: 'Storm Bringer', baseIcon: Zap, evolvedIcon: Flame, color: '#eab308' },
  { id: 'shield', name: 'Iron Guardian', baseIcon: Shield, evolvedIcon: Hexagon, color: '#64748b' },
  { id: 'target', name: 'Deadeye Sniper', baseIcon: Target, evolvedIcon: Crosshair, color: '#f43f5e' },
  { id: 'droplet', name: 'Blood Medic', baseIcon: Droplet, evolvedIcon: Heart, color: '#ef4444' },
  { id: 'cpu', name: 'Cyber Hacker', baseIcon: Cpu, evolvedIcon: Fingerprint, color: '#06b6d4' },
  { id: 'skull', name: 'Immortal Lord', baseIcon: Skull, evolvedIcon: InfinityIcon, color: '#a855f7' },
  { id: 'crown', name: 'Absolute Monarch', baseIcon: Crown, evolvedIcon: Award, color: '#f59e0b' },
  { id: 'lock', name: 'Gate Keeper', baseIcon: LockIcon, evolvedIcon: Unlock, color: '#10b981' },
  { id: 'flame', name: 'Pyromancer', baseIcon: Flame, evolvedIcon: Zap, color: '#ef4444' },
  { id: 'heart', name: 'Vitality Monk', baseIcon: Heart, evolvedIcon: Droplet, color: '#f43f5e' },
  { id: 'anchor', name: 'Deep Sea Titan', baseIcon: Anchor, evolvedIcon: Dumbbell, color: '#0ea5e9' },
  { id: 'hexagon', name: 'Fortress', baseIcon: Hexagon, evolvedIcon: Shield, color: '#8b5cf6' },
  { id: 'fingerprint', name: 'Phantom', baseIcon: Fingerprint, evolvedIcon: Ghost, color: '#14b8a6' },
  { id: 'infinity', name: 'Eternal', baseIcon: InfinityIcon, evolvedIcon: Skull, color: '#ec4899' },
  { id: 'eye', name: 'Visionary', baseIcon: Eye, evolvedIcon: Moon, color: '#d946ef' },
  { id: 'footprints', name: 'Speedster', baseIcon: Footprints, evolvedIcon: Wind, color: '#10b981' },
  { id: 'athlete', name: 'Elite Athlete', baseIcon: Activity, evolvedIcon: Target, color: '#10b981' },
];

const getUserClassInfo = (iconStr: string) => {
  const normalized = String(iconStr).toLowerCase().replace('_evolved', '').trim();
  let searchId = normalized;
  if (normalized === 'moon') searchId = 'shadow';
  if (normalized === 'shoe') searchId = 'footprints';
  if (normalized === 'barbell') searchId = 'dumbbell';
  if (normalized === 'lightning') searchId = 'zap';
  if (normalized === 'water') searchId = 'droplet';

  const found = CLASS_MAPPING.find((c) => searchId.includes(c.id) || c.id.includes(searchId));
  return found || CLASS_MAPPING[1]; 
};

const getProfileIcon = (hunter: any, size: number = 45) => {
  const iconStr = String(hunter?.selectedIcon || hunter?.selected_icon || hunter?.icon || '').toLowerCase().trim();
  const isEvolved = iconStr.includes('evolved');
  const cls = getUserClassInfo(iconStr);

  if (isEvolved) return <cls.evolvedIcon size={size} color={cls.color} />;
  return <cls.baseIcon size={size} color={cls.color} />;
};

const getSystemDateStr = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 🚨 نظام ألوان الهالة (Streak Aura System) 🚨
const getStreakAura = (streak: number) => {
  if (streak >= 30) return { name: 'MONARCH AURA', color: '#a855f7', icon: Crown };
  if (streak >= 15) return { name: 'LIGHTNING AURA', color: '#0ea5e9', icon: Zap };
  if (streak >= 7) return { name: 'TOXIC AURA', color: '#10b981', icon: Activity };
  if (streak >= 1) return { name: 'FLAME AURA', color: '#f97316', icon: Flame };
  return { name: 'NO AURA', color: '#475569', icon: Ghost };
};

// ==========================================
// 3. التصميمات النيون الفخمة (Styled Components)
// ==========================================
const Container = styled.div` padding: 15px; font-family: 'Oxanium', sans-serif; color: #fff; padding-bottom: 100px; max-width: 600px; margin: 0 auto; position: relative; `;
const Card = styled.div` background: #0b1120; border: 1px solid #1e293b; border-radius: 16px; padding: 20px; margin-bottom: 20px; display: flex; flex-direction: column; align-items: center; position: relative; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 10; `;

const auraPulse = keyframes`
  0% { box-shadow: 0 0 10px currentColor; }
  50% { box-shadow: 0 0 25px currentColor; }
  100% { box-shadow: 0 0 10px currentColor; }
`;

const GlowingCard = styled.div<{ $glowColor: string; $isAura?: boolean }>`
  background: rgba(11, 17, 32, 0.85); 
  backdrop-filter: blur(10px);
  border: 1px solid ${(props) => props.$glowColor}40; 
  border-radius: 16px; 
  padding: 25px; 
  margin-bottom: 25px; 
  display: flex; 
  flex-direction: column; 
  position: relative; 
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  color: ${(props) => props.$glowColor};
  animation: ${(props) => props.$isAura ? auraPulse : 'none'} 3s infinite;
  z-index: 10;

  &::before { 
    content: ''; 
    position: absolute; 
    top: 0; left: 0; 
    width: 100%; height: 2px; 
    background: linear-gradient(90deg, transparent, ${(props) => props.$glowColor}, transparent); 
  }
`;

const RankProgressCard = styled.div<{ $color: string; $shadow: string }>` background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.9) 100%); border: 1px solid ${(props) => props.$color}; border-radius: 16px; padding: 20px; margin-bottom: 25px; box-shadow: 0 0 20px ${(props) => props.$shadow}; display: flex; flex-direction: column; z-index: 10; position: relative; backdrop-filter: blur(10px); `;
const CardTitle = styled.div<{ $color: string }>` font-size: 13px; font-weight: 900; letter-spacing: 2px; color: ${(props) => props.$color}; text-transform: uppercase; display: flex; align-items: center; gap: 8px; margin-bottom: 20px; width: 100%; justify-content: center; text-shadow: 0 0 10px ${(props) => props.$color}80; `;
const EvolutionGrid = styled.div` display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 25px; width: 100%; `;
const EvoBox = styled.div<{ $active: boolean; $color: string }>` width: 90px; height: 90px; border-radius: 20px; display: flex; align-items: center; justify-content: center; position: relative; background: ${(props) => props.$active ? `linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, ${props.$color}30 100%)` : 'rgba(15, 23, 42, 0.8)'}; border: 1px solid ${(props) => (props.$active ? props.$color : '#1e293b')}; color: ${(props) => (props.$active ? props.$color : '#334155')}; box-shadow: ${(props) => props.$active ? `0 0 25px ${props.$color}40, inset 0 0 15px ${props.$color}20` : 'none'}; transition: 0.3s; backdrop-filter: blur(5px); `;
const ProgressBarContainer = styled.div` width: 100%; height: 8px; background: rgba(15, 23, 42, 0.8); border-radius: 10px; overflow: hidden; border: 1px solid #1e293b; `;
const ProgressBarFill = styled(motion.div)<{ $progress: number; $color: string }>` height: 100%; background: ${(props) => props.$color}; width: ${(props) => props.$progress}%; box-shadow: 0 0 15px ${(props) => props.$color}; `;
const HeatmapHeader = styled.div` display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 15px; `;
const HeatmapGrid = styled.div` display: grid; grid-template-rows: repeat(7, 1fr); grid-auto-columns: 1fr; grid-auto-flow: column; gap: 4px; width: 100%; margin-bottom: 25px; background: rgba(15, 23, 42, 0.5); padding: 15px; border-radius: 12px; border: 1px solid #1e293b; overflow-x: auto; `;
const HeatmapCell = styled.div<{ $intensity: number; $baseColor: string }>` width: 100%; min-width: 15px; aspect-ratio: 1; border-radius: 3px; background: ${(props) => props.$intensity === 0 ? '#1e293b' : props.$intensity === 1 ? `${props.$baseColor}40` : props.$intensity === 2 ? `${props.$baseColor}80` : props.$baseColor}; box-shadow: ${(props) => props.$intensity > 1 ? `0 0 ${props.$intensity * 3}px ${props.$baseColor}` : 'none'}; transition: 0.2s; cursor: pointer; &:hover { transform: scale(1.3); z-index: 10; box-shadow: 0 0 10px ${(props) => props.$baseColor}; } `;
const LegendGrid = styled.div` display: flex; justify-content: space-between; width: 100%; padding: 0 10px; `;
const LegendItem = styled.div` display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 10px; color: #94a3b8; font-weight: bold; text-transform: uppercase; `;
const InputGrid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width: 100%; margin-bottom: 20px; `;
const InputLabel = styled.label` font-size: 10px; color: #94a3b8; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; display: block; letter-spacing: 1px; `;
const StyledInput = styled.input` width: 100%; background: #020617; border: 1px solid #1e293b; color: #fff; padding: 15px; border-radius: 12px; font-family: 'Oxanium'; font-size: 18px; font-weight: bold; text-align: center; outline: none; transition: 0.3s; &:focus { border-color: #f97316; box-shadow: 0 0 15px rgba(249, 115, 22, 0.2); } `;
const UpdateBtn = styled.button` width: 100%; background: rgba(249, 115, 22, 0.1); border: 1px solid #f97316; color: #f97316; padding: 15px; border-radius: 12px; font-family: 'Oxanium'; font-size: 12px; font-weight: 900; letter-spacing: 1px; cursor: pointer; transition: 0.3s; margin-bottom: 10px; box-shadow: 0 0 15px rgba(249, 115, 22, 0.1); &:hover { background: #f97316; color: #000; box-shadow: 0 0 20px rgba(249, 115, 22, 0.4); } &:disabled { opacity: 0.5; cursor: not-allowed; } `;
const SectionLabel = styled.div` font-size: 12px; color: #00f2ff; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 15px; width: 100%; text-shadow: 0 0 10px rgba(0, 242, 255, 0.4); position: relative; z-index: 10; `;
const TitlesContainer = styled.div` display: flex; flex-wrap: wrap; gap: 10px; width: 100%; margin-bottom: 30px; position: relative; z-index: 10; `;
const TitleBadge = styled.div` background: rgba(0, 242, 255, 0.1); border: 1px solid #00f2ff; color: #00f2ff; padding: 8px 18px; border-radius: 20px; font-size: 12px; font-weight: bold; box-shadow: 0 0 10px rgba(0, 242, 255, 0.2); backdrop-filter: blur(5px); `;
const SignOutBtn = styled.button` width: 100%; background: rgba(2, 6, 23, 0.8); border: 1px solid #ef4444; color: #ef4444; padding: 18px; border-radius: 16px; font-family: 'Oxanium'; font-size: 14px; font-weight: 900; letter-spacing: 2px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; box-shadow: 0 0 15px rgba(239, 68, 68, 0.1); position: relative; z-index: 10; backdrop-filter: blur(5px); &:hover { background: #ef4444; color: #000; box-shadow: 0 0 25px rgba(239, 68, 68, 0.5); } `;
const ModalOverlay = styled(motion.div)` position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(8px); `;
const ModalContent = styled(motion.div)` background: #0b1120; border: 2px solid #00f2ff; border-radius: 20px; padding: 30px; width: 100%; max-width: 450px; position: relative; max-height: 90vh; overflow-y: auto; box-shadow: 0 0 40px rgba(0, 242, 255, 0.3); &::-webkit-scrollbar { width: 5px; } &::-webkit-scrollbar-thumb { background: #00f2ff; border-radius: 5px; } `;

// ==========================================
// 4. Custom Line Chart Component 📈
// ==========================================
const LineChart = ({ data, color }: { data: { label: string, value: number }[], color: string }) => {
  if (!data || data.length === 0) return <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No data available</div>;
  
  const values = data.map(d => d.value);
  const max = Math.max(...values) + 2; 
  const min = Math.max(0, Math.min(...values) - 2); 
  const range = max - min || 1;
  
  const width = 300;
  const height = 100;
  const paddingX = 20;
  const paddingY = 20;
  
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - ((d.value - min) / range) * (height - 2 * paddingY);
    return `${x},${y}`;
  });
  
  const pathD = `M ${points.join(' L ')}`;
  const fillD = `${pathD} L ${width - paddingX},${height - paddingY} L ${paddingX},${height - paddingY} Z`;

  return (
    <div style={{ width: '100%', overflowX: 'auto', paddingBottom: 10 }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: '300px', height: '120px', overflow: 'visible' }}>
        <defs>
          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={fillD} fill="url(#chartGlow)" />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" />
        {data.map((d, i) => {
          const x = paddingX + (i / (data.length - 1)) * (width - 2 * paddingX);
          const y = height - paddingY - ((d.value - min) / range) * (height - 2 * paddingY);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="3.5" fill="#0b1120" stroke={color} strokeWidth="2" />
              <text x={x} y={y - 8} fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">{d.value}</text>
              <text x={x} y={height} fill="#64748b" fontSize="7" fontWeight="bold" textAnchor="middle">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ==========================================
// 5. المكون الرئيسي (Profile)
// ==========================================
const Profile = ({ player, setPlayer }: any) => {
  const [editWeight, setEditWeight] = useState(player?.weight || 75);
  const [editFat, setEditFat] = useState(player?.body_fat || 15);
  const [isSaving, setIsSaving] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState(player?.name || '');
  const [editIcon, setEditIcon] = useState(player?.selectedIcon || player?.selected_icon || 'athlete');

  const [heatmapData, setHeatmapData] = useState<{ date: string; intensity: number; count: number }[]>([]);
  const [attendanceStats, setAttendanceStats] = useState({ attended: 0, total: 1 });
  const [chartData, setChartData] = useState<{label: string, value: number}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const levelData = calculateLevelData(player?.cumulative_xp ?? player?.xp ?? 0);
  const lvl = levelData.level;
  const currentXp = levelData.xpInCurrentLevel;
  
  const rankInfo = getRankInfo(lvl);
  const rankProgress = getNextRankInfo(lvl, currentXp);
  const RankIconObj = rankInfo.icon;

  const userClass = getUserClassInfo(editIcon);
  const BaseIcon = userClass.baseIcon;
  const EvolvedIcon = userClass.evolvedIcon;
  const isEvolved = lvl >= 20;
  const evoProgress = Math.min(100, (lvl / 20) * 100);

  const titles = player?.titles || ['Awakened', 'Gate Closer'];
  const currentStreak = player?.streak || 0;
  
  const auraInfo = getStreakAura(currentStreak);
  const AuraIcon = auraInfo.icon;

  // 🚨 إعدادات الجزيئات (Particles) الخاصة بالهالة 🚨
  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine);
  }, []);

  const getParticleConfig = (streak: number): any => {
    let color = "#475569";
    let speed = 1;
    let direction = "none";
    let links = false;
    let particleCount = 0;

    if (streak >= 30) { color = "#a855f7"; speed = 0.5; direction = "top"; particleCount = 40; } // Monarch
    else if (streak >= 15) { color = "#0ea5e9"; speed = 3; direction = "none"; links = true; particleCount = 50; } // Lightning
    else if (streak >= 7) { color = "#10b981"; speed = 1.5; direction = "top"; particleCount = 30; } // Toxic
    else if (streak >= 1) { color = "#f97316"; speed = 2.5; direction = "top"; particleCount = 25; } // Flame

    return {
      fullScreen: { enable: false, zIndex: 0 },
      particles: {
        number: { value: particleCount },
        color: { value: color },
        links: { enable: links, color: color, distance: 150, opacity: 0.5, width: 1 },
        move: { enable: true, speed: speed, direction: direction, outModes: { default: "out" } },
        size: { value: { min: 1, max: 3 } },
        opacity: { value: { min: 0.3, max: 0.7 } }
      },
      interactivity: { events: { onHover: { enable: true, mode: "repulse" }, onClick: { enable: true, mode: "push" } }, modes: { repulse: { distance: 100, duration: 0.4 } } }
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: dbPlayer } = await supabase.from('elite_players').select('*').eq('name', player.name).single();
      
      if (dbPlayer) {
        let fetchedMacros = dbPlayer.daily_macros || { protein: 0, carbs: 0, fats: 0, calories: 0, log: [] };
        let lastMacroDate = dbPlayer.last_macro_date;
        const todayStr = getSystemDateStr(new Date());

        if (lastMacroDate !== todayStr) {
          fetchedMacros = { protein: 0, carbs: 0, fats: 0, calories: 0, log: [] };
          await supabase.from('elite_players').update({ 
            daily_macros: fetchedMacros, 
            last_macro_date: todayStr 
          }).eq('name', player.name);
          
          setPlayer((prev: any) => ({ ...prev, daily_macros: fetchedMacros, last_macro_date: todayStr }));
        }

        setEditWeight(dbPlayer.weight || 75);
        setEditFat(dbPlayer.body_fat || 15);
        setEditName(dbPlayer.name);
        setEditIcon(dbPlayer.selected_icon || 'athlete');
      }

      const { data: requests } = await supabase.from('elite_quests').select('created_at, status').eq('player_name', player.name);

      const uniqueActiveDays = new Set();
      const counts: Record<string, number> = {};

      if (requests) {
        requests.forEach((req) => {
          if (req.status === 'approved') {
            const d = new Date(req.created_at);
            const dateStr = getSystemDateStr(d);
            uniqueActiveDays.add(dateStr);
            counts[dateStr] = (counts[dateStr] || 0) + 1;
          }
        });
      }

      const createdDate = dbPlayer?.created_at ? new Date(dbPlayer.created_at) : new Date();
      const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
      const totalDaysSinceStart = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);

      setAttendanceStats({ attended: uniqueActiveDays.size, total: totalDaysSinceStart });

      const mapArray = [];
      for (let i = 0; i < 91; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (90 - i)); 
        const dateStr = getSystemDateStr(d);
        const count = counts[dateStr] || 0;
        
        let intensity = 0;
        if (count === 1 || count === 2) intensity = 1;
        else if (count === 3) intensity = 2;
        else if (count >= 4) intensity = 3; 
        
        mapArray.push({ date: dateStr, intensity, count });
      }
      setHeatmapData(mapArray);

      const currentWeight = dbPlayer?.weight || 75;
      const simulatedHistory = [
        { label: 'Jan', value: currentWeight + 2.5 },
        { label: 'Feb', value: currentWeight + 1.2 },
        { label: 'Mar', value: currentWeight + 0.8 },
        { label: 'Apr', value: currentWeight - 0.5 },
        { label: 'May', value: currentWeight - 1.2 },
        { label: 'Now', value: currentWeight }
      ];
      setChartData(simulatedHistory);
    };
    fetchData();
  }, [player.name]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Invalid image.'); return; }

    const loadingToast = toast.loading('Updating avatar...', { style: { background: '#020617', color: '#00f2ff', border: '1px solid #00f2ff' } });
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 200;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);

        const updatedPlayer = { ...player, avatar_url: compressedBase64 };
        setPlayer(updatedPlayer);
        localStorage.setItem('elite_system_active_session', JSON.stringify(updatedPlayer));

        const { error } = await supabase.from('elite_players').update({ avatar_url: compressedBase64 }).eq('name', player.name);
        toast.dismiss(loadingToast);
        if (error) toast.error('Avatar saved locally only.');
        else toast.success('Avatar updated!', { style: { background: '#022c22', color: '#10b981', border: '1px solid #10b981' } });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateStats = async () => {
    setIsSaving(true);
    try {
      const w = parseFloat(String(editWeight));
      const f = parseFloat(String(editFat));
      await supabase.from('elite_players').update({ weight: w, body_fat: f }).eq('name', player.name);

      const updatedPlayer = { ...player, weight: w, body_fat: f };
      setPlayer(updatedPlayer);
      localStorage.setItem('elite_system_active_session', JSON.stringify(updatedPlayer));

      setChartData(prev => {
        const newChart = [...prev];
        newChart[newChart.length - 1] = { label: 'Now', value: w };
        return newChart;
      });

      playClick();
      toast.success('Body Composition Updated!', { style: { background: '#022c22', color: '#10b981', border: '1px solid #10b981' } });
    } catch (e) {
      playError();
      toast.error('Update failed.');
    }
    setIsSaving(false);
  };

  const handleSaveSettings = async () => {
    if (!editName.trim()) return;
    setIsSaving(true);
    try {
      await supabase.from('elite_players').update({ name: editName.trim(), selected_icon: editIcon }).eq('name', player.name);

      if (editName.trim() !== player.name) {
        await supabase.from('elite_quests').update({ player_name: editName.trim() }).eq('player_name', player.name);
        await supabase.from('elite_economy').update({ player_name: editName.trim() }).eq('player_name', player.name);
        await supabase.from('elite_records').update({ player_name: editName.trim() }).eq('player_name', player.name);
      }

      const updatedPlayer = { ...player, name: editName.trim(), selectedIcon: editIcon };
      setPlayer(updatedPlayer);
      localStorage.setItem('elite_system_active_session', JSON.stringify(updatedPlayer));

      playClick();
      toast.success('Profile Settings Saved!');
      setShowSettings(false);
    } catch (e) {
      playError();
      toast.error('Failed to save settings.');
    }
    setIsSaving(false);
  };

  const handleLogout = () => {
    playClick();
    localStorage.removeItem('elite_system_active_session');
    localStorage.removeItem('elite_coach_mode');
    window.location.reload();
  };

  const protMin = Math.round(editWeight * 1.7);
  const protMax = Math.round(editWeight * 2.2);

  return (
    <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Toaster position="top-center" theme="dark" />

      {/* 🚨 تشغيل جزيئات الهالة (Aura Particles) 🚨 */}
      {currentStreak > 0 && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'auto' }}>
          <Particles id="tsparticles-profile" init={particlesInit} options={getParticleConfig(currentStreak)} style={{ width: '100%', height: '100%', position: 'absolute' }} />
        </div>
      )}

      {/* Profile Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} onClick={() => fileInputRef.current?.click()} title="Change Avatar">
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarUpload} />

          <div style={{ position: 'relative', width: 65, height: 65, borderRadius: '16px', border: `2px solid ${auraInfo.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${auraInfo.color}15`, overflow: 'hidden', cursor: 'pointer', boxShadow: `0 0 20px ${auraInfo.color}60` }}>
            {player?.avatar_url ? (
              <img src={player.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              getProfileIcon(player, 35)
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }} className="hover:opacity-100">
              <Camera size={20} color="#fff" />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', color: '#fff', textShadow: `0 0 10px ${auraInfo.color}80` }}>
              {player?.name}
            </div>
            <div style={{ fontSize: '11px', color: auraInfo.color, fontWeight: '900', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <AuraIcon size={12} /> {auraInfo.name}
            </div>
          </div>
        </div>
        
        <button onClick={() => setShowSettings(true)} style={{ background: 'rgba(0, 242, 255, 0.1)', border: '1px solid #00f2ff', color: '#00f2ff', padding: '10px 15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 0 10px rgba(0, 242, 255, 0.2)' }}>
          <Settings size={16} /> EDIT
        </button>
      </div>

      <RankProgressCard $color={rankInfo.color} $shadow={rankInfo.glow}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', letterSpacing: 1 }}>CURRENT RANK PRESTIGE</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: rankInfo.color, textShadow: `0 0 15px ${rankInfo.glow}`, letterSpacing: 2 }}>{rankInfo.name}</div>
          </div>
          <RankIconObj size={45} color={rankInfo.color} style={{ filter: `drop-shadow(0 0 10px ${rankInfo.glow})` }} />
        </div>
        
        <ProgressBarContainer style={{ marginTop: 20, marginBottom: 12 }}>
          <ProgressBarFill $progress={rankProgress.percent} $color={rankInfo.color} initial={{ width: 0 }} animate={{ width: `${rankProgress.percent}%` }} transition={{ duration: 1 }} />
        </ProgressBarContainer>
        
        <div style={{ fontSize: '12px', color: '#cbd5e1', textAlign: 'right', direction: 'rtl', fontWeight: 'bold' }}>
          {lvl >= 30 ? (
            <span style={{ color: '#a855f7' }}>لقد وصلت إلى قمة الهرم. أنت الأسطورة ELITE 👑</span>
          ) : (
            <>أنت الآن <span style={{ color: rankInfo.color }}>{rankInfo.name}</span>، يتبقى لك <span style={{ color: '#0ea5e9' }}>{rankProgress.remainingXp} EXP</span> للوصول إلى <span style={{ color: '#fff' }}>{rankProgress.nextRank}</span>.</>
          )}
        </div>
      </RankProgressCard>

      <GlowingCard $glowColor={userClass.color}>
        <CardTitle $color={userClass.color}>
          <Hexagon size={18} /> AVATAR EVOLUTION (LEVEL 20)
        </CardTitle>
        <EvolutionGrid>
          <EvoBox $active={true} $color={userClass.color}>
            <BaseIcon size={40} />
          </EvoBox>
          <div style={{ color: '#334155', fontSize: '20px', fontWeight: 'bold' }}>»</div>
          <EvoBox $active={isEvolved} $color={userClass.color}>
            {isEvolved ? <EvolvedIcon size={40} /> : <LockIcon size={24} />}
          </EvoBox>
        </EvolutionGrid>
        <ProgressBarContainer>
          <ProgressBarFill $progress={evoProgress} $color={userClass.color} initial={{ width: 0 }} animate={{ width: `${evoProgress}%` }} transition={{ duration: 1 }} />
        </ProgressBarContainer>
      </GlowingCard>

      <GlowingCard $glowColor={auraInfo.color} $isAura={currentStreak > 0}>
        <HeatmapHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '900', letterSpacing: '1px', color: '#fff' }}>
            <AuraIcon size={16} color={auraInfo.color} /> {auraInfo.name} HEATMAP
          </div>
          <div style={{ fontSize: '12px', fontWeight: '900', color: auraInfo.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
            STREAK: {currentStreak} <Flame size={14} color="#ef4444" fill="#ef4444" />
          </div>
        </HeatmapHeader>

        <HeatmapGrid>
          {heatmapData.map((d, i) => (
            <HeatmapCell key={i} $intensity={d.intensity} $baseColor={auraInfo.color} title={`${d.date}: ${d.count} tasks completed`} />
          ))}
        </HeatmapGrid>

        <LegendGrid>
          <LegendItem>7 STREAK<Activity size={18} color="#10b981" fill="#10b981" style={{ filter: 'drop-shadow(0 0 5px #10b981)' }} /> Toxic</LegendItem>
          <LegendItem>15 STREAK<Zap size={18} color="#0ea5e9" fill="#0ea5e9" style={{ filter: 'drop-shadow(0 0 5px #0ea5e9)' }} /> Spark</LegendItem>
          <LegendItem>30 STREAK<Crown size={18} color="#a855f7" fill="#a855f7" style={{ filter: 'drop-shadow(0 0 5px #a855f7)' }} /> Monarch</LegendItem>
        </LegendGrid>
      </GlowingCard>

      <GlowingCard $glowColor="#10b981">
        <CardTitle $color="#10b981" style={{ justifyContent: 'flex-start', marginBottom: '15px' }}>
          <TrendingUp size={18} /> PERFORMANCE ANALYTICS (WEIGHT)
        </CardTitle>
        <LineChart data={chartData} color="#10b981" />
      </GlowingCard>

      <GlowingCard $glowColor="#a855f7" style={{ alignItems: 'center', textAlign: 'center' }}>
        <Hexagon size={35} color="#a855f7" style={{ marginBottom: '15px', filter: 'drop-shadow(0 0 10px #a855f7)' }} />
        <div style={{ fontSize: '11px', color: '#c084fc', fontWeight: '900', letterSpacing: '2px', marginBottom: '8px' }}>PLAYER CLASS</div>
        <div style={{ fontSize: '26px', fontWeight: '900', color: '#fff', marginBottom: '10px', textShadow: '0 0 15px rgba(255,255,255,0.3)' }}>
          {isEvolved && editIcon.includes('evolved') ? userClass.name : 'None / Base'}
        </div>
        <div style={{ fontSize: '11px', color: '#64748b' }}>
          {isEvolved ? 'Class Unlocked. Equip it in settings.' : 'Reach Level 20 to unlock Class Advancement.'}
        </div>
      </GlowingCard>

      <GlowingCard $glowColor="#f97316">
        <CardTitle $color="#f97316" style={{ justifyContent: 'flex-start', marginBottom: '20px' }}>
          <Flame size={18} /> BODY COMPOSITION
        </CardTitle>
        <InputGrid>
          <div>
            <InputLabel>WEIGHT (KG)</InputLabel>
            <StyledInput type="number" value={editWeight} onChange={(e) => setEditWeight(e.target.value)} />
          </div>
          <div>
            <InputLabel>BODY FAT (%)</InputLabel>
            <StyledInput type="number" value={editFat} onChange={(e) => setEditFat(e.target.value)} />
          </div>
        </InputGrid>
        <UpdateBtn onClick={handleUpdateStats} disabled={isSaving}>
          {isSaving ? 'UPDATING...' : 'UPDATE STATS'}
        </UpdateBtn>
        <div style={{ width: '100%', textAlign: 'center', fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', marginTop: '10px' }}>
          Daily Protein Target: <span style={{ color: '#fff' }}>{protMin}g - {protMax}g</span>
        </div>
      </GlowingCard>

      <SectionLabel>UNLOCKED TITLES</SectionLabel>
      <TitlesContainer>
        {titles.map((t: string, i: number) => (
          <TitleBadge key={i}>{t}</TitleBadge>
        ))}
      </TitlesContainer>

      <Card style={{ marginTop: '30px', background: '#020617', zIndex: 10 }}>
        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '900', letterSpacing: '1px', marginBottom: '15px' }}>TOTAL PRACTICES ATTENDED</div>
        <div style={{ fontSize: '40px', fontWeight: '900', color: '#fff', textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
          {attendanceStats.attended} <span style={{ fontSize: '16px', color: '#64748b' }}>/ {attendanceStats.total}</span>
        </div>
      </Card>

      <SignOutBtn onClick={handleLogout}>
        <LogOut size={18} /> SIGN OUT / EXIT GAME
      </SignOutBtn>

      <AnimatePresence>
        {showSettings && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}>
              <button onClick={() => setShowSettings(false)} style={{ position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={24} /></button>

              <h2 style={{ color: '#00f2ff', margin: '0 0 20px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: 10, textTransform: 'uppercase' }}>
                <Settings size={20} /> SYSTEM SETTINGS
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <InputLabel>HUNTER ALIAS (NAME)</InputLabel>
                  <StyledInput type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '12px', fontSize: '15px', textAlign: 'left' }} />
                </div>

                <div>
                  <InputLabel>SELECT COMBAT CLASS</InputLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
                    {CLASS_MAPPING.map((cls) => {
                      const BaseI = cls.baseIcon;
                      const EvoI = cls.evolvedIcon;
                      return (
                        <div key={cls.id} style={{ background: '#020617', border: `1px solid ${editIcon.includes(cls.id) ? cls.color : '#1e293b'}`, padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: editIcon.includes(cls.id) ? cls.color : '#fff' }}>{cls.name}</span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setEditIcon(cls.id)} style={{ background: editIcon === cls.id ? `${cls.color}20` : 'transparent', border: `1px solid ${editIcon === cls.id ? cls.color : '#334155'}`, padding: '8px', borderRadius: '8px', color: editIcon === cls.id ? cls.color : '#64748b', cursor: 'pointer', transition: '0.2s' }}>
                              <BaseI size={18} />
                            </button>

                            <button onClick={() => isEvolved ? setEditIcon(`${cls.id}_evolved`) : toast.error('Evolved Form unlocks at Level 20!')} style={{ background: editIcon === `${cls.id}_evolved` ? `${cls.color}20` : 'transparent', border: `1px solid ${editIcon === `${cls.id}_evolved` ? cls.color : '#334155'}`, padding: '8px', borderRadius: '8px', color: editIcon === `${cls.id}_evolved` ? cls.color : '#64748b', cursor: isEvolved ? 'pointer' : 'not-allowed', opacity: isEvolved ? 1 : 0.3, transition: '0.2s' }} title={isEvolved ? 'Evolved Form' : 'Unlocks at LVL 20'}>
                              {isEvolved ? <EvoI size={18} /> : <LockIcon size={18} />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <UpdateBtn onClick={handleSaveSettings} disabled={isSaving} style={{ background: '#00f2ff', color: '#000', borderColor: '#00f2ff', boxShadow: '0 0 15px rgba(0, 242, 255, 0.3)', marginTop: '10px' }}>
                  {isSaving ? 'SYNCING DATA...' : 'SAVE & APPLY'}
                </UpdateBtn>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default Profile;