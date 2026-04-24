import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import {
  Zap, X, Activity, Award, Target, Shield, Flame, Camera, Hexagon, Moon, Ghost, Wind, Footprints,
  Lock as LockIcon, Dumbbell, Sword, Skull, Crown, Heart, Droplet, Axe, Anchor, Fingerprint, Cpu,
  Infinity as InfinityIcon, Settings, Unlock, Crosshair, LogOut, Eye, Medal, TrendingUp, Radar, BatteryCharging, ShoppingCart, Trash2
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
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'sine'; osc.frequency.setValueAtTime(600, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  osc.start(); osc.stop(ctx.currentTime + 0.1);
};

const playError = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  osc.start(); osc.stop(ctx.currentTime + 0.2);
};

// ==========================================
// 2. نظام الأرواح السحرية الـ 2D الفخمة
// ==========================================
const PETS_DATABASE = [
  { name: 'Golden Wyvern Core', type: 'wyvern', color: '#eab308' },
  { name: 'Healing Phoenix Ember', type: 'phoenix', color: '#ef4444' },
  { name: 'Shadow Owl Eye', type: 'owl', color: '#a855f7' },
  { name: 'Iron Golem Matrix', type: 'golem', color: '#0ea5e9' },
  { name: 'Frost Wolf Soul', type: 'wolf', color: '#38bdf8' },
  { name: 'Emerald Dragon Scale', type: 'emerald', color: '#10b981' }
];

const AnimatedSpirit = ({ type, color, isDead = false }: { type: string, color: string, isDead?: boolean }) => {
  const displayColor = isDead ? '#475569' : color; 
  return (
    <motion.div
      style={{ width: '100px', height: '100px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', filter: isDead ? 'grayscale(100%)' : 'none', margin: '0 auto 15px auto' }}
      animate={isDead ? { y: 0 } : { y: [-6, 6, -6] }} 
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {!isDead && (
        <motion.div
          style={{ position: 'absolute', width: '100%', height: '100%', background: displayColor, filter: 'blur(25px)', borderRadius: '50%', zIndex: 0 }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1, width: '85%', height: '85%' }}>
        {type === 'wyvern' && (
          <motion.svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', filter: `drop-shadow(0 0 15px ${displayColor})` }} animate={isDead ? {} : { rotateY: 360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}>
            <polygon points="50,5 90,50 50,95 10,50" fill="none" stroke={displayColor} strokeWidth="4" />
            <polygon points="50,15 75,50 50,85 25,50" fill={displayColor} opacity="0.8" />
            <circle cx="50" cy="50" r="10" fill="#fff" />
          </motion.svg>
        )}
        {type === 'phoenix' && (
          <motion.svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', filter: `drop-shadow(0 0 20px ${displayColor})` }} animate={isDead ? {} : { scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
            <path d="M50 10 Q70 40 50 90 Q30 40 50 10" fill={displayColor} opacity="0.9" />
            <path d="M50 30 Q60 50 50 80 Q40 50 50 30" fill={isDead?"#cbd5e1":"#ff7e67"} opacity="0.9" />
            <circle cx="50" cy="65" r="8" fill="#fff" />
          </motion.svg>
        )}
        {type === 'owl' && (
          <motion.svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', filter: `drop-shadow(0 0 25px ${displayColor})` }} animate={isDead ? {} : { rotateZ: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            <circle cx="50" cy="50" r="40" fill="none" stroke={displayColor} strokeWidth="4" strokeDasharray="10 10" />
            <circle cx="50" cy="50" r="30" fill="#1e1b4b" stroke={displayColor} strokeWidth="2" />
            <motion.ellipse cx="50" cy="50" rx="5" ry="20" fill="#fff" animate={isDead ? {} : { ry: [20, 2, 20] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 1] }} />
          </motion.svg>
        )}
        {type === 'golem' && (
          <motion.svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', filter: `drop-shadow(0 0 15px ${displayColor})` }} animate={isDead ? {} : { rotateZ: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
            <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="#334155" stroke={displayColor} strokeWidth="4" />
            <polygon points="50,20 75,35 75,65 50,80 25,65 25,35" fill="none" stroke={displayColor} strokeWidth="2" />
            <rect x="40" y="40" width="20" height="20" fill={displayColor} />
          </motion.svg>
        )}
        {type === 'wolf' && (
          <motion.svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', filter: `drop-shadow(0 0 20px ${displayColor})` }} animate={isDead ? {} : { scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <polygon points="50,10 80,40 50,90 20,40" fill="none" stroke={displayColor} strokeWidth="3" />
            <polygon points="50,20 70,42 50,80 30,42" fill={displayColor} opacity="0.8" />
            <polygon points="50,30 60,45 50,70 40,45" fill="#fff" opacity="0.9" />
          </motion.svg>
        )}
        {type === 'emerald' && (
          <motion.svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', filter: `drop-shadow(0 0 20px ${displayColor})` }} animate={isDead ? {} : { rotateZ: -360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
            <path d="M50 10 C 80 10, 90 50, 50 90 C 10 50, 20 10, 50 10 Z" fill="none" stroke={displayColor} strokeWidth="3" />
            <path d="M50 20 C 70 20, 80 50, 50 80 C 20 50, 30 20, 50 20 Z" fill={displayColor} opacity="0.7" />
            <circle cx="50" cy="50" r="10" fill="#fff" />
          </motion.svg>
        )}
      </div>
    </motion.div>
  );
};

// ==========================================
// 3. نظام الرانكات والكلاسات والحسابات
// ==========================================
const calculateLevelData = (totalXp: number) => {
  let level = 1;
  let currentXp = totalXp;
  let expNeededForNextLevel = 650;
  while (currentXp >= expNeededForNextLevel) { currentXp -= expNeededForNextLevel; level++; expNeededForNextLevel = Math.min(level * 150 + 500, 4000); }
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
  let startRankLvl = nextRankLvl - 5; if (startRankLvl === 0) startRankLvl = 1;
  let totalTierXp = 0; for(let i = startRankLvl; i < nextRankLvl; i++) { totalTierXp += Math.min(i * 150 + 500, 4000); }
  let earnedTierXp = 0; for(let i = startRankLvl; i < lvl; i++) { earnedTierXp += Math.min(i * 150 + 500, 4000); }
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

const getStreakAura = (streak: number) => {
  if (streak >= 30) return { name: 'MONARCH AURA', color: '#a855f7', icon: Crown };
  if (streak >= 15) return { name: 'LIGHTNING AURA', color: '#0ea5e9', icon: Zap };
  if (streak >= 7) return { name: 'TOXIC AURA', color: '#10b981', icon: Activity };
  if (streak >= 1) return { name: 'FLAME AURA', color: '#f97316', icon: Flame };
  return { name: 'NO AURA', color: '#475569', icon: Ghost };
};

// ==========================================
// 4. التصميمات النيون الفخمة
// ==========================================
const Container = styled.div` padding: 15px; font-family: 'Oxanium', sans-serif; color: #fff; padding-bottom: 100px; max-width: 600px; margin: 0 auto; position: relative; `;
const Card = styled.div` background: #0b1120; border: 1px solid #1e293b; border-radius: 16px; padding: 20px; margin-bottom: 20px; display: flex; flex-direction: column; align-items: center; position: relative; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 10; `;

const auraPulse = keyframes` 0% { box-shadow: 0 0 10px currentColor; } 50% { box-shadow: 0 0 25px currentColor; } 100% { box-shadow: 0 0 10px currentColor; } `;
const GlowingCard = styled.div<{ $glowColor: string; $isAura?: boolean }>`
  background: rgba(11, 17, 32, 0.85); backdrop-filter: blur(10px); border: 1px solid ${(props) => props.$glowColor}40; border-radius: 16px; padding: 25px; margin-bottom: 25px; display: flex; flex-direction: column; position: relative; box-shadow: 0 4px 20px rgba(0,0,0,0.5); color: ${(props) => props.$glowColor}; animation: ${(props) => props.$isAura ? auraPulse : 'none'} 3s infinite; z-index: 10;
  &::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, ${(props) => props.$glowColor}, transparent); }
`;

const RankProgressCard = styled.div<{ $color: string; $shadow: string }>` background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.9) 100%); border: 1px solid ${(props) => props.$color}; border-radius: 16px; padding: 20px; margin-bottom: 25px; box-shadow: 0 0 20px ${(props) => props.$shadow}; display: flex; flex-direction: column; z-index: 10; position: relative; backdrop-filter: blur(10px); `;
const CardTitle = styled.div<{ $color: string }>` font-size: 13px; font-weight: 900; letter-spacing: 2px; color: ${(props) => props.$color}; text-transform: uppercase; display: flex; align-items: center; gap: 8px; margin-bottom: 20px; width: 100%; justify-content: center; text-shadow: 0 0 10px ${(props) => props.$color}80; `;

// 🚨 تصميم الملاذ السحري بعد التوسيع وإضافة زر التحرير 🚨
const SanctuaryGrid = styled.div` display: flex; justify-content: center; gap: 20px; width: 100%; flex-wrap: wrap; `;
const PetSlot = styled.div<{ $active: boolean, $color: string }>` 
  background: ${(props) => props.$active ? `linear-gradient(180deg, ${props.$color}15 0%, rgba(15, 23, 42, 0.9) 100%)` : 'rgba(15, 23, 42, 0.8)'}; 
  border: 2px solid ${(props) => props.$active ? props.$color : '#1e293b'}; 
  border-radius: 20px; padding: 20px 15px; width: 165px; display: flex; flex-direction: column; align-items: center; 
  box-shadow: ${(props) => props.$active ? `0 0 25px ${props.$color}40, inset 0 0 15px ${props.$color}20` : 'none'}; 
  transition: 0.3s; position: relative;
`;
const EmptySlot = styled.div` 
  background: rgba(2, 6, 23, 0.6); border: 2px dashed #334155; border-radius: 20px; width: 165px; height: 210px; 
  display: flex; flex-direction: column; align-items: center; justify-content: center; color: #64748b; gap: 10px; 
  transition: 0.3s; cursor: pointer;
  &:hover { border-color: #0ea5e9; color: #0ea5e9; background: rgba(14, 165, 233, 0.1); }
`;

const EquipBtn = styled.button<{ $active: boolean, $color: string }>`
  background: ${(props) => props.$active ? props.$color : 'transparent'};
  color: ${(props) => props.$active ? '#000' : props.$color};
  border: 1px solid ${(props) => props.$color};
  padding: 8px 15px; border-radius: 10px; font-family: 'Oxanium'; font-weight: 900; font-size: 11px; cursor: pointer; width: 100%; margin-top: 10px; transition: 0.3s; letter-spacing: 1px;
  box-shadow: ${(props) => props.$active ? `0 0 15px ${props.$color}80` : 'none'};
`;

// الزرار الأحمر لتحرير الروح من البروفايل
const ReleaseBtn = styled.button`
  background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid #ef4444; 
  padding: 6px 15px; border-radius: 8px; font-family: 'Oxanium'; font-weight: bold; font-size: 10px; cursor: pointer; width: 100%; margin-top: 8px; transition: 0.3s;
  display: flex; align-items: center; justify-content: center; gap: 5px;
  &:hover { background: #ef4444; color: #000; box-shadow: 0 0 15px rgba(239, 68, 68, 0.6); }
`;

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
// 5. Custom Components (Charts)
// ==========================================
const LineChart = ({ data, color }: { data: { label: string, value: number }[], color: string }) => {
  if (!data || data.length === 0) return <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No data available</div>;
  const values = data.map(d => d.value);
  const max = Math.max(...values) + 2; const min = Math.max(0, Math.min(...values) - 2); const range = max - min || 1;
  const width = 300; const height = 100; const paddingX = 20; const paddingY = 20;
  const points = data.map((d, i) => { const x = paddingX + (i / (data.length - 1)) * (width - 2 * paddingX); const y = height - paddingY - ((d.value - min) / range) * (height - 2 * paddingY); return `${x},${y}`; });
  const pathD = `M ${points.join(' L ')}`; const fillD = `${pathD} L ${width - paddingX},${height - paddingY} L ${paddingX},${height - paddingY} Z`;
  return (
    <div style={{ width: '100%', overflowX: 'auto', paddingBottom: 10 }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: '300px', height: '120px', overflow: 'visible' }}>
        <defs><linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.4" /><stop offset="100%" stopColor={color} stopOpacity="0.0" /></linearGradient></defs>
        <path d={fillD} fill="url(#chartGlow)" />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" />
        {data.map((d, i) => {
          const x = paddingX + (i / (data.length - 1)) * (width - 2 * paddingX); const y = height - paddingY - ((d.value - min) / range) * (height - 2 * paddingY);
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

const CustomRadarChart = ({ stats, color }: { stats: { label: string, value: number }[], color: string }) => {
  const size = 260; const center = size / 2; const radius = 80;
  const getPoint = (value: number, index: number, total: number) => { const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total; const x = center + Math.cos(angle) * radius * (value / 10); const y = center + Math.sin(angle) * radius * (value / 10); return { x, y }; };
  const points = stats.map((s, i) => getPoint(s.value, i, stats.length));
  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
      <svg width="100%" height="260px" viewBox={`0 0 ${size} ${size}`} style={{ maxWidth: '300px' }}>
        {[2, 4, 6, 8, 10].map((level) => {
          const webPoints = stats.map((_, i) => getPoint(level, i, stats.length));
          const webPath = `M ${webPoints.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
          return <path key={level} d={webPath} fill="none" stroke="#1e293b" strokeWidth="1" />;
        })}
        {stats.map((_, i) => { const p = getPoint(10, i, stats.length); return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#1e293b" strokeWidth="1" />; })}
        <path d={pathD} fill={`${color}40`} stroke={color} strokeWidth="2" style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
        {stats.map((s, i) => {
          const p = getPoint(s.value, i, stats.length); const labelP = getPoint(12.5, i, stats.length); 
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="#0b1120" stroke={color} strokeWidth="2" />
              <text x={labelP.x} y={labelP.y} fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" fontFamily="Oxanium">{s.label}</text>
              <text x={labelP.x} y={labelP.y + 14} fill="#fff" fontSize="11" fontWeight="900" textAnchor="middle" dominantBaseline="middle" fontFamily="Oxanium">{s.value.toFixed(1)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ==========================================
// 6. المكون الرئيسي (Profile)
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
  const [liveStreak, setLiveStreak] = useState(player?.streak || 0);

  const [gold, setGold] = useState(player?.gold || 0);
  const playerPets = Array.isArray(player?.pets) ? player.pets.filter((p: string) => p && p.trim() !== '') : [];
  const activePetName = player?.active_pet || null;
  const petEnergy = player?.pet_hunger ?? 100;

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
  const auraInfo = getStreakAura(liveStreak);
  const AuraIcon = auraInfo.icon;

  const particlesInit = useCallback(async (engine: any) => { await loadFull(engine); }, []);
  const getParticleConfig = (streak: number): any => {
    let color = "#475569"; let speed = 1; let direction = "none"; let links = false; let particleCount = 0;
    if (streak >= 30) { color = "#a855f7"; speed = 0.5; direction = "top"; particleCount = 40; } 
    else if (streak >= 15) { color = "#0ea5e9"; speed = 3; direction = "none"; links = true; particleCount = 50; } 
    else if (streak >= 7) { color = "#10b981"; speed = 1.5; direction = "top"; particleCount = 30; } 
    else if (streak >= 1) { color = "#f97316"; speed = 2.5; direction = "top"; particleCount = 25; } 
    return {
      fullScreen: { enable: false, zIndex: 0 },
      particles: { number: { value: particleCount }, color: { value: color }, links: { enable: links, color: color, distance: 150, opacity: 0.5, width: 1 }, move: { enable: true, speed: speed, direction: direction, outModes: { default: "out" } }, size: { value: { min: 1, max: 3 } }, opacity: { value: { min: 0.3, max: 0.7 } } },
      interactivity: { events: { onHover: { enable: true, mode: "repulse" }, onClick: { enable: true, mode: "push" } }, modes: { repulse: { distance: 100, duration: 0.4 } } }
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: dbPlayer } = await supabase.from('elite_players').select('*').eq('name', player.name).single();
      if (dbPlayer) {
        setLiveStreak(dbPlayer.streak || 0);
        setGold(dbPlayer.gold || 0);
        let fetchedMacros = dbPlayer.daily_macros || { protein: 0, carbs: 0, fats: 0, calories: 0, log: [] };
        let lastMacroDate = dbPlayer.last_macro_date;
        const todayStr = getSystemDateStr(new Date());
        if (lastMacroDate !== todayStr) {
          fetchedMacros = { protein: 0, carbs: 0, fats: 0, calories: 0, log: [] };
          await supabase.from('elite_players').update({ daily_macros: fetchedMacros, last_macro_date: todayStr }).eq('name', player.name);
          setPlayer((prev: any) => ({ ...prev, daily_macros: fetchedMacros, last_macro_date: todayStr }));
        }
        setEditWeight(dbPlayer.weight || 75);
        setEditFat(dbPlayer.body_fat || 15);
        setEditName(dbPlayer.name);
        setEditIcon(dbPlayer.selected_icon || 'athlete');
        setPlayer((prev: any) => ({ ...prev, pets: dbPlayer.pets, active_pet: dbPlayer.active_pet, pet_hunger: dbPlayer.pet_hunger, gold: dbPlayer.gold }));
      }

      const { data: requests } = await supabase.from('elite_quests').select('created_at, status').eq('player_name', player.name);
      const uniqueActiveDays = new Set(); const counts: Record<string, number> = {};
      if (requests) {
        requests.forEach((req) => {
          if (req.status === 'approved') {
            const dateStr = getSystemDateStr(new Date(req.created_at));
            uniqueActiveDays.add(dateStr); counts[dateStr] = (counts[dateStr] || 0) + 1;
          }
        });
      }
      const diffTime = Math.abs(new Date().getTime() - (dbPlayer?.created_at ? new Date(dbPlayer.created_at).getTime() : new Date().getTime()));
      setAttendanceStats({ attended: uniqueActiveDays.size, total: Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1) });

      const mapArray = [];
      for (let i = 0; i < 91; i++) {
        const d = new Date(); d.setDate(d.getDate() - (90 - i)); 
        const dateStr = getSystemDateStr(d); const count = counts[dateStr] || 0;
        let intensity = 0; if (count === 1 || count === 2) intensity = 1; else if (count === 3) intensity = 2; else if (count >= 4) intensity = 3; 
        mapArray.push({ date: dateStr, intensity, count });
      }
      setHeatmapData(mapArray);

      const currentWeight = dbPlayer?.weight || 75;
      setChartData([{ label: 'Jan', value: currentWeight + 2.5 }, { label: 'Feb', value: currentWeight + 1.2 }, { label: 'Mar', value: currentWeight + 0.8 }, { label: 'Apr', value: currentWeight - 0.5 }, { label: 'May', value: currentWeight - 1.2 }, { label: 'Now', value: currentWeight }]);
    };
    fetchData();
  }, [player.name]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Invalid image.'); return; }
    const loadingToast = toast.loading('Updating avatar...', { style: { background: '#020617', color: '#00f2ff', border: '1px solid #00f2ff' } });
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas'); const MAX_SIZE = 200; let width = img.width; let height = img.height;
        if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
        canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
        const updatedPlayer = { ...player, avatar_url: compressedBase64 };
        setPlayer(updatedPlayer); localStorage.setItem('elite_system_active_session', JSON.stringify(updatedPlayer));
        const { error } = await supabase.from('elite_players').update({ avatar_url: compressedBase64 }).eq('name', player.name);
        toast.dismiss(loadingToast);
        if (error) toast.error('Avatar saved locally only.'); else toast.success('Avatar updated!', { style: { background: '#022c22', color: '#10b981', border: '1px solid #10b981' } });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateStats = async () => {
    setIsSaving(true);
    try {
      const w = parseFloat(String(editWeight)); const f = parseFloat(String(editFat));
      await supabase.from('elite_players').update({ weight: w, body_fat: f }).eq('name', player.name);
      const updatedPlayer = { ...player, weight: w, body_fat: f };
      setPlayer(updatedPlayer); localStorage.setItem('elite_system_active_session', JSON.stringify(updatedPlayer));
      setChartData(prev => { const newChart = [...prev]; newChart[newChart.length - 1] = { label: 'Now', value: w }; return newChart; });
      playClick(); toast.success('Body Composition Updated!', { style: { background: '#022c22', color: '#10b981', border: '1px solid #10b981' } });
    } catch (e) { playError(); toast.error('Update failed.'); }
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
      setPlayer(updatedPlayer); localStorage.setItem('elite_system_active_session', JSON.stringify(updatedPlayer));
      playClick(); toast.success('Profile Settings Saved!'); setShowSettings(false);
    } catch (e) { playError(); toast.error('Failed to save settings.'); }
    setIsSaving(false);
  };

  const handleLogout = () => { playClick(); localStorage.removeItem('elite_system_active_session'); localStorage.removeItem('elite_coach_mode'); window.location.reload(); };

  const equipPet = async (petName: string) => {
    playClick();
    try {
      await supabase.from('elite_players').update({ active_pet: petName }).eq('name', player.name);
      const updatedPlayer = { ...player, active_pet: petName };
      setPlayer(updatedPlayer);
      localStorage.setItem('elite_system_active_session', JSON.stringify(updatedPlayer));
      toast.success(`تم تجهيز ${petName} بنجاح!`);
    } catch (err) {
      toast.error('حدث خطأ أثناء التجهيز.');
    }
  };

  // 🚨 دالة إزالة/تحرير الروح من البروفايل 🚨
  const releasePet = async (petName: string) => {
    if (!window.confirm(`هل أنت متأكد من تحرير روح "${petName}"؟ ستفقده نهائياً لتحرير مساحة لروح جديدة.`)) return;
    playError(); // صوت تحذيري
    try {
      const updatedPets = playerPets.filter((p: string) => p !== petName);
      let updatePayload: any = { pets: updatedPets };
      
      // لو الروح دي كانت هي المتجهزة، شيلها من التجهيز كمان
      if (activePetName === petName) {
        updatePayload.active_pet = null;
      }

      await supabase.from('elite_players').update(updatePayload).eq('name', player.name);
      
      const updatedPlayer = { ...player, ...updatePayload };
      setPlayer(updatedPlayer);
      localStorage.setItem('elite_system_active_session', JSON.stringify(updatedPlayer));
      
      toast.success(`تم تحرير ${petName}. مساحتك أصبحت فارغة.`);
    } catch (e) {
      toast.error('حدث خطأ أثناء إزالة الروح.');
    }
  };

  const feedPet = async () => {
    if (gold < 500) { playError(); toast.error('لا تملك 500 ذهب لشراء كريستالة الطاقة!'); return; }
    playClick();
    try {
      const newGold = gold - 500;
      const newEnergy = Math.min(100, petEnergy + 50);
      
      await supabase.from('elite_economy').insert([{ player_name: player.name, amount: 500, currency: 'gold', operation: 'decrease', reason: '[SHOP PURCHASE] Essence Crystal' }]);
      await supabase.from('elite_players').update({ gold: newGold, pet_hunger: newEnergy }).eq('name', player.name);
      
      setGold(newGold);
      const updatedPlayer = { ...player, gold: newGold, pet_hunger: newEnergy };
      setPlayer(updatedPlayer);
      localStorage.setItem('elite_system_active_session', JSON.stringify(updatedPlayer));
      
      toast.success('تم إنعاش الروح بنجاح!');
    } catch (err) {
      toast.error('حدث خطأ أثناء الشراء.');
    }
  };

  const protMin = Math.round(editWeight * 1.7); const protMax = Math.round(editWeight * 2.2);
  const attRate = attendanceStats.total > 0 ? (attendanceStats.attended / attendanceStats.total) * 100 : 0;
  const radarStats = [ { label: 'القوة', value: Math.min(10, 3 + (lvl / 6)) }, { label: 'الحيوية', value: Math.min(10, 2 + (attRate / 15)) }, { label: 'الرشاقة', value: Math.min(10, 4 + (lvl / 10)) }, { label: 'التعافي', value: Math.min(10, ((player.hp || 100) / 10)) }, { label: 'التركيز', value: Math.min(10, 2 + (liveStreak / 4)) } ];

  return (
    <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Toaster position="top-center" theme="dark" />

      {liveStreak > 0 && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'auto' }}>
          <Particles id="tsparticles-profile" init={particlesInit} options={getParticleConfig(liveStreak)} style={{ width: '100%', height: '100%', position: 'absolute' }} />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} onClick={() => fileInputRef.current?.click()} title="Change Avatar">
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarUpload} />
          <div style={{ position: 'relative', width: 65, height: 65, borderRadius: '16px', border: `2px solid ${auraInfo.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${auraInfo.color}15`, overflow: 'hidden', cursor: 'pointer', boxShadow: `0 0 20px ${auraInfo.color}60` }}>
            {player?.avatar_url ? <img src={player.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getProfileIcon(player, 35)}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }} className="hover:opacity-100"><Camera size={20} color="#fff" /></div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', color: '#fff', textShadow: `0 0 10px ${auraInfo.color}80` }}>{player?.name}</div>
            <div style={{ fontSize: '11px', color: auraInfo.color, fontWeight: '900', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '5px' }}><AuraIcon size={12} /> {auraInfo.name}</div>
          </div>
        </div>
        <button onClick={() => setShowSettings(true)} style={{ background: 'rgba(0, 242, 255, 0.1)', border: '1px solid #00f2ff', color: '#00f2ff', padding: '10px 15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 0 10px rgba(0, 242, 255, 0.2)' }}><Settings size={16} /> EDIT</button>
      </div>

      {/* 🚨 قسم الملاذ السحري بحجم أكبر 🚨 */}
      <SectionLabel style={{ marginTop: 10, color: '#a855f7', textShadow: '0 0 10px rgba(168, 85, 247, 0.4)' }}>
        <Ghost size={14} style={{ display: 'inline', marginBottom: -2 }} /> MYSTICAL SANCTUARY
      </SectionLabel>
      <GlowingCard $glowColor="#a855f7" style={{ padding: '25px', marginBottom: 30 }}>
        <SanctuaryGrid>
          {playerPets.map((petName: string, index: number) => {
            const petData = PETS_DATABASE.find(p => p.name === petName) || { name: petName, type: 'wyvern', color: '#94a3b8' };
            const isActive = activePetName === petName;
            const isDead = isActive && petEnergy <= 0;

            return (
              <PetSlot key={index} $active={isActive} $color={petData.color}>
                {/* استدعاء الـ 2D Spirit */}
                <AnimatedSpirit type={petData.type} color={petData.color} isDead={isDead} />
                
                <div style={{ fontSize: '12px', fontWeight: '900', color: isActive ? petData.color : '#cbd5e1', textAlign: 'center', marginTop: 15, height: 35, letterSpacing: 1 }}>{petData.name}</div>
                
                {isActive && (
                  <div style={{ width: '100%', marginTop: 5 }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: isDead ? '#ef4444' : '#cbd5e1', textAlign: 'right', marginBottom: 4 }}>{petEnergy}% ENERGY</div>
                    <ProgressBarContainer style={{ height: 6 }}>
                      <ProgressBarFill $progress={petEnergy} $color={isDead ? '#ef4444' : petData.color} initial={{ width: 0 }} animate={{ width: `${petEnergy}%` }} />
                    </ProgressBarContainer>
                    {isDead && (
                      <button onClick={feedPet} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', width: '100%', marginTop: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)' }}>
                        <BatteryCharging size={12} /> FEED (500G)
                      </button>
                    )}
                  </div>
                )}

                <EquipBtn $active={isActive} $color={petData.color} onClick={() => !isActive && equipPet(petName)}>
                  {isActive ? 'EQUIPPED' : 'EQUIP FORM'}
                </EquipBtn>

                {/* 🚨 زر الإزالة الجديد 🚨 */}
                <ReleaseBtn onClick={() => releasePet(petName)}>
                  <Trash2 size={12} /> RELEASE
                </ReleaseBtn>
              </PetSlot>
            );
          })}

          {playerPets.length < 2 && Array.from({ length: 2 - playerPets.length }).map((_, index) => (
            <EmptySlot key={`empty-${index}`} onClick={() => window.location.hash = 'shop'}>
              <ShoppingCart size={30} />
              <div style={{ fontSize: '12px', fontWeight: '900', letterSpacing: 2 }}>EMPTY SLOT</div>
              <div style={{ fontSize: '10px' }}>Visit Shop</div>
            </EmptySlot>
          ))}
        </SanctuaryGrid>
      </GlowingCard>

      <RankProgressCard $color={rankInfo.color} $shadow={rankInfo.glow}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', letterSpacing: 1 }}>CURRENT RANK PRESTIGE</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: rankInfo.color, textShadow: `0 0 15px ${rankInfo.glow}`, letterSpacing: 2 }}>{rankInfo.name}</div>
          </div>
          <RankIconObj size={45} color={rankInfo.color} style={{ filter: `drop-shadow(0 0 10px ${rankInfo.glow})` }} />
        </div>
        <ProgressBarContainer style={{ marginTop: 20, marginBottom: 12 }}><ProgressBarFill $progress={rankProgress.percent} $color={rankInfo.color} initial={{ width: 0 }} animate={{ width: `${rankProgress.percent}%` }} transition={{ duration: 1 }} /></ProgressBarContainer>
        <div style={{ fontSize: '12px', color: '#cbd5e1', textAlign: 'right', direction: 'rtl', fontWeight: 'bold' }}>
          {lvl >= 30 ? <span style={{ color: '#a855f7' }}>لقد وصلت إلى قمة الهرم. أنت الأسطورة ELITE 👑</span> : <>أنت الآن <span style={{ color: rankInfo.color }}>{rankInfo.name}</span>، يتبقى لك <span style={{ color: '#0ea5e9' }}>{rankProgress.remainingXp} EXP</span> للوصول إلى <span style={{ color: '#fff' }}>{rankProgress.nextRank}</span>.</>}
        </div>
      </RankProgressCard>

      <GlowingCard $glowColor={userClass.color}>
        <CardTitle $color={userClass.color}><Hexagon size={18} /> AVATAR EVOLUTION (LEVEL 20)</CardTitle>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '25px', width: '100%' }}>
          <div style={{ width: 90, height: 90, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: `linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, ${userClass.color}30 100%)`, border: `1px solid ${userClass.color}`, color: userClass.color, boxShadow: `0 0 25px ${userClass.color}40, inset 0 0 15px ${userClass.color}20`, backdropFilter: 'blur(5px)' }}><BaseIcon size={40} /></div>
          <div style={{ color: '#334155', fontSize: '20px', fontWeight: 'bold' }}>»</div>
          <div style={{ width: 90, height: 90, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: isEvolved ? `linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, ${userClass.color}30 100%)` : 'rgba(15, 23, 42, 0.8)', border: `1px solid ${isEvolved ? userClass.color : '#1e293b'}`, color: isEvolved ? userClass.color : '#334155', boxShadow: isEvolved ? `0 0 25px ${userClass.color}40, inset 0 0 15px ${userClass.color}20` : 'none', transition: '0.3s', backdropFilter: 'blur(5px)' }}>{isEvolved ? <EvolvedIcon size={40} /> : <LockIcon size={24} />}</div>
        </div>
        <ProgressBarContainer><ProgressBarFill $progress={evoProgress} $color={userClass.color} initial={{ width: 0 }} animate={{ width: `${evoProgress}%` }} transition={{ duration: 1 }} /></ProgressBarContainer>
      </GlowingCard>

      <GlowingCard $glowColor={auraInfo.color} $isAura={liveStreak > 0}>
        <HeatmapHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '900', letterSpacing: '1px', color: '#fff' }}><AuraIcon size={16} color={auraInfo.color} /> {auraInfo.name} HEATMAP</div>
          <div style={{ fontSize: '12px', fontWeight: '900', color: auraInfo.color, display: 'flex', alignItems: 'center', gap: '4px' }}>STREAK: {liveStreak} <Flame size={14} color="#ef4444" fill="#ef4444" /></div>
        </HeatmapHeader>
        <HeatmapGrid>{heatmapData.map((d, i) => (<HeatmapCell key={i} $intensity={d.intensity} $baseColor={auraInfo.color} title={`${d.date}: ${d.count} tasks completed`} />))}</HeatmapGrid>
        <LegendGrid>
          <LegendItem>7 STREAK<Activity size={18} color="#10b981" fill="#10b981" style={{ filter: 'drop-shadow(0 0 5px #10b981)' }} /> Toxic</LegendItem>
          <LegendItem>15 STREAK<Zap size={18} color="#0ea5e9" fill="#0ea5e9" style={{ filter: 'drop-shadow(0 0 5px #0ea5e9)' }} /> Spark</LegendItem>
          <LegendItem>30 STREAK<Crown size={18} color="#a855f7" fill="#a855f7" style={{ filter: 'drop-shadow(0 0 5px #a855f7)' }} /> Monarch</LegendItem>
        </LegendGrid>
      </GlowingCard>

      <GlowingCard $glowColor="#a855f7">
        <CardTitle $color="#a855f7" style={{ justifyContent: 'center', marginBottom: '5px' }}><Radar size={18} /> روح الصياد (HUNTER'S SOUL)</CardTitle>
        <div style={{ textAlign: 'center', fontSize: '10px', color: '#cbd5e1', marginBottom: '15px' }}>تحليل القوة الشامل بناءً على إنجازاتك والمستوى</div>
        <CustomRadarChart stats={radarStats} color="#a855f7" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
          {radarStats.map((s, i) => (
            <div key={i} style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.3)', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}><span style={{ color: '#cbd5e1' }}>{s.label}</span><span style={{ color: '#00f2ff', fontWeight: 'bold' }}>{s.value.toFixed(1)}/10</span></div>
          ))}
        </div>
      </GlowingCard>

      <GlowingCard $glowColor="#10b981">
        <CardTitle $color="#10b981" style={{ justifyContent: 'flex-start', marginBottom: '15px' }}><TrendingUp size={18} /> PERFORMANCE ANALYTICS (WEIGHT)</CardTitle>
        <LineChart data={chartData} color="#10b981" />
      </GlowingCard>

      <GlowingCard $glowColor="#f97316">
        <CardTitle $color="#f97316" style={{ justifyContent: 'flex-start', marginBottom: '20px' }}><Flame size={18} /> BODY COMPOSITION</CardTitle>
        <InputGrid>
          <div><InputLabel>WEIGHT (KG)</InputLabel><StyledInput type="number" value={editWeight} onChange={(e) => setEditWeight(e.target.value)} /></div>
          <div><InputLabel>BODY FAT (%)</InputLabel><StyledInput type="number" value={editFat} onChange={(e) => setEditFat(e.target.value)} /></div>
        </InputGrid>
        <UpdateBtn onClick={handleUpdateStats} disabled={isSaving}>{isSaving ? 'UPDATING...' : 'UPDATE STATS'}</UpdateBtn>
        <div style={{ width: '100%', textAlign: 'center', fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', marginTop: '10px' }}>Daily Protein Target: <span style={{ color: '#fff' }}>{protMin}g - {protMax}g</span></div>
      </GlowingCard>

      <SectionLabel>UNLOCKED TITLES</SectionLabel>
      <TitlesContainer>{titles.map((t: string, i: number) => (<TitleBadge key={i}>{t}</TitleBadge>))}</TitlesContainer>

      <Card style={{ marginTop: '30px', background: '#020617', zIndex: 10 }}>
        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '900', letterSpacing: '1px', marginBottom: '15px' }}>TOTAL PRACTICES ATTENDED</div>
        <div style={{ fontSize: '40px', fontWeight: '900', color: '#fff', textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>{attendanceStats.attended} <span style={{ fontSize: '16px', color: '#64748b' }}>/ {attendanceStats.total}</span></div>
      </Card>

      <SignOutBtn onClick={handleLogout}><LogOut size={18} /> SIGN OUT / EXIT GAME</SignOutBtn>

      <AnimatePresence>
        {showSettings && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}>
              <button onClick={() => setShowSettings(false)} style={{ position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={24} /></button>
              <h2 style={{ color: '#00f2ff', margin: '0 0 20px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: 10, textTransform: 'uppercase' }}><Settings size={20} /> SYSTEM SETTINGS</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <InputLabel>HUNTER ALIAS (NAME)</InputLabel>
                  <StyledInput type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '12px', fontSize: '15px', textAlign: 'left' }} />
                </div>
                <div>
                  <InputLabel>SELECT COMBAT CLASS</InputLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
                    {CLASS_MAPPING.map((cls) => {
                      const BaseI = cls.baseIcon; const EvoI = cls.evolvedIcon;
                      return (
                        <div key={cls.id} style={{ background: '#020617', border: `1px solid ${editIcon.includes(cls.id) ? cls.color : '#1e293b'}`, padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: editIcon.includes(cls.id) ? cls.color : '#fff' }}>{cls.name}</span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setEditIcon(cls.id)} style={{ background: editIcon === cls.id ? `${cls.color}20` : 'transparent', border: `1px solid ${editIcon === cls.id ? cls.color : '#334155'}`, padding: '8px', borderRadius: '8px', color: editIcon === cls.id ? cls.color : '#64748b', cursor: 'pointer', transition: '0.2s' }}><BaseI size={18} /></button>
                            <button onClick={() => isEvolved ? setEditIcon(`${cls.id}_evolved`) : toast.error('Evolved Form unlocks at Level 20!')} style={{ background: editIcon === `${cls.id}_evolved` ? `${cls.color}20` : 'transparent', border: `1px solid ${editIcon === `${cls.id}_evolved` ? cls.color : '#334155'}`, padding: '8px', borderRadius: '8px', color: editIcon === `${cls.id}_evolved` ? cls.color : '#64748b', cursor: isEvolved ? 'pointer' : 'not-allowed', opacity: isEvolved ? 1 : 0.3, transition: '0.2s' }} title={isEvolved ? 'Evolved Form' : 'Unlocks at LVL 20'}>{isEvolved ? <EvoI size={18} /> : <LockIcon size={18} />}</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <UpdateBtn onClick={handleSaveSettings} disabled={isSaving} style={{ background: '#00f2ff', color: '#000', borderColor: '#00f2ff', boxShadow: '0 0 15px rgba(0, 242, 255, 0.3)', marginTop: '10px' }}>{isSaving ? 'SYNCING DATA...' : 'SAVE & APPLY'}</UpdateBtn>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default Profile;