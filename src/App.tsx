import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sword, LogOut, CheckSquare, Medal, ShoppingCart, Shield, User,
  Book, Activity, Moon, Eye, Wind, Dumbbell, Zap, Footprints, Lock as LockIcon, Flame,
  Crown, Skull, Target, Heart, Droplet, Axe, Anchor, Fingerprint, Cpu, Infinity as InfinityIcon,
  Hexagon, Globe, Terminal, Power, Bell, X, MessageSquare, WifiOff, Volume2, VolumeX, Package
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Howl, Howler } from 'howler';

import AwakeningScreen from './components/AwakeningScreen';
import Dashboard from './components/Dashboard';
import Rank from './components/Rank';
import Shop from './components/Shop';
import Profile from './components/Profile';
import Records from './components/Records';
import Rules from './components/Rules';
import Rehab from './components/Rehab';
import Vault from './components/Vault'; 
import CoachPanel from './components/CoachPanel'; 
import { supabase } from './lib/supabase';

// ==========================================
// 1. ADVANCED AUDIO ENGINE (Howler + Web Audio)
// ==========================================
const bgmMain = new Howl({ src: ['https://cdn.freesound.org/previews/514/514214_10901551-lq.mp3'], loop: true, volume: 0.15 });
const bgmShop = new Howl({ src: ['https://cdn.freesound.org/previews/612/612085_5674468-lq.mp3'], loop: true, volume: 0.15 });

let currentBGM = bgmMain;
const createAudioContext = () => { const AudioContext = window.AudioContext || (window as any).webkitAudioContext; if (!AudioContext) return null; return new AudioContext(); };
let sharedAudioCtx: AudioContext | null = null;
let lastPlayTime = 0;
const canPlay = () => { const now = Date.now(); if (now - lastPlayTime < 50) return false; lastPlayTime = now; return true; };

const playSound = (type: 'shield' | 'click' | 'startup' | 'boot' | 'glitch' | 'notification' | 'error') => {
  try {
    if (!canPlay()) return;
    if (!sharedAudioCtx) sharedAudioCtx = createAudioContext();
    if (!sharedAudioCtx) return;
    if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume();
    const ctx = sharedAudioCtx; const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination); const now = ctx.currentTime;
    if (type === 'shield') { osc.type = 'square'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(50, now + 0.3); gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3); osc.start(); osc.stop(now + 0.3); } 
    else if (type === 'click') { osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now); osc.frequency.exponentialRampToValueAtTime(1600, now + 0.05); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05); osc.start(); osc.stop(now + 0.05); } 
    else if (type === 'startup') { osc.type = 'triangle'; osc.frequency.setValueAtTime(200, now); osc.frequency.linearRampToValueAtTime(600, now + 0.5); osc.frequency.linearRampToValueAtTime(1000, now + 0.8); gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.3, now + 0.5); gain.gain.linearRampToValueAtTime(0.01, now + 1); osc.start(); osc.stop(now + 1); } 
    else if (type === 'boot') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(50, now); osc.frequency.exponentialRampToValueAtTime(400, now + 1.5); gain.gain.setValueAtTime(0.01, now); gain.gain.linearRampToValueAtTime(0.2, now + 1); gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5); osc.start(); osc.stop(now + 1.5); } 
    else if (type === 'glitch') { osc.type = 'square'; osc.frequency.setValueAtTime(Math.random() * 1000 + 200, now); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1); osc.start(); osc.stop(now + 0.1); } 
    else if (type === 'notification') { osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.setValueAtTime(1200, now + 0.1); gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3); osc.start(); osc.stop(now + 0.3); }
    else if (type === 'error') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(50, now + 0.5); gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5); osc.start(); osc.stop(now + 0.5); }
  } catch (e) {}
};

const playAuraSound = (hunter: any) => {
  try {
    if (!sharedAudioCtx) sharedAudioCtx = createAudioContext();
    if (!sharedAudioCtx) return;
    const iconStr = String(hunter?.selectedIcon || hunter?.selected_icon || hunter?.icon || hunter?.class || '').toLowerCase().trim();
    const ctx = sharedAudioCtx; const osc1 = ctx.createOscillator(); const osc2 = ctx.createOscillator(); const gainNode = ctx.createGain();
    osc1.connect(gainNode); osc2.connect(gainNode); gainNode.connect(ctx.destination);
    if (['sword', 'shield', 'target', 'crosshair', 'axe', 'dumbbell'].some(k => iconStr.includes(k))) { osc1.type = 'sawtooth'; osc2.type = 'square'; osc1.frequency.setValueAtTime(400, ctx.currentTime); osc1.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3); osc2.frequency.setValueAtTime(405, ctx.currentTime); osc2.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.3); gainNode.gain.setValueAtTime(0.3, ctx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3); osc1.start(); osc2.start(); osc1.stop(ctx.currentTime + 0.3); osc2.stop(ctx.currentTime + 0.3); } 
    else if (['flame', 'zap', 'star', 'crown'].some(k => iconStr.includes(k))) { osc1.type = 'square'; osc2.type = 'triangle'; osc1.frequency.setValueAtTime(1000, ctx.currentTime); osc1.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4); osc2.frequency.setValueAtTime(1500, ctx.currentTime); osc2.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.4); gainNode.gain.setValueAtTime(0.2, ctx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4); osc1.start(); osc2.start(); osc1.stop(ctx.currentTime + 0.4); osc2.stop(ctx.currentTime + 0.4); } 
    else { osc1.type = 'sine'; osc2.type = 'sine'; osc1.frequency.setValueAtTime(300, ctx.currentTime); osc1.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5); osc2.frequency.setValueAtTime(600, ctx.currentTime); osc2.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.5); gainNode.gain.setValueAtTime(0.3, ctx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5); osc1.start(); osc2.start(); osc1.stop(ctx.currentTime + 0.5); osc2.stop(ctx.currentTime + 0.5); }
  } catch (e) {}
};

// ==========================================
// 2. EPIC 2D ANIMATED ICONS (أحجام مصغرة للموبايل)
// ==========================================
const EpicNavIcon = ({ id, color, isActive }: { id: string, color: string, isActive: boolean }) => {
  const displayColor = isActive ? color : '#475569';
  const glow = isActive ? `drop-shadow(0 0 8px ${color})` : 'none';

  return (
    <motion.div
      style={{ width: '24px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', filter: glow }}
      animate={isActive ? { y: [-2, 2, -2] } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {id === 'dashboard' && (
        <motion.svg viewBox="0 0 100 100" animate={isActive ? { rotateZ: 180 } : {}} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
           <polygon points="50,10 90,50 50,90 10,50" fill={isActive ? `${color}40` : 'none'} stroke={displayColor} strokeWidth="8" strokeLinejoin="round" />
           <polygon points="50,25 75,50 50,75 25,50" fill={displayColor} />
        </motion.svg>
      )}
      {id === 'vault' && (
        <motion.svg viewBox="0 0 100 100" animate={isActive ? { rotateY: [-20, 20, -20] } : {}} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
          <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill={isActive ? `${color}40` : 'none'} stroke={displayColor} strokeWidth="6" strokeLinejoin="round" />
          <polyline points="10,30 50,50 90,30" fill="none" stroke={displayColor} strokeWidth="6" />
          <line x1="50" y1="50" x2="50" y2="90" stroke={displayColor} strokeWidth="6" />
        </motion.svg>
      )}
      {id === 'records' && (
        <motion.svg viewBox="0 0 100 100" animate={isActive ? { rotateZ: 360 } : {}} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
          <circle cx="50" cy="50" r="40" fill="none" stroke={displayColor} strokeWidth="6" strokeDasharray="15 10" />
          <polygon points="50,20 60,40 80,45 65,60 70,80 50,70 30,80 35,60 20,45 40,40" fill={displayColor} stroke={displayColor} strokeWidth="2" strokeLinejoin="round" />
        </motion.svg>
      )}
      {id === 'shop' && (
         <motion.svg viewBox="0 0 100 100" animate={isActive ? { y: [-3, 3, -3], scale: [1, 1.1, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
            <polygon points="30,20 70,20 90,40 50,90 10,40" fill={isActive ? `${color}40` : 'none'} stroke={displayColor} strokeWidth="6" strokeLinejoin="round" />
            <polyline points="30,20 50,50 70,20" fill="none" stroke={displayColor} strokeWidth="4" />
            <line x1="10" y1="40" x2="90" y2="40" stroke={displayColor} strokeWidth="4" />
         </motion.svg>
      )}
      {id === 'rank' && (
         <motion.svg viewBox="0 0 100 100" animate={isActive ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <path d="M10 20 L50 5 L90 20 L90 50 C90 80 50 95 50 95 C50 95 10 80 10 50 Z" fill={isActive ? `${color}40` : 'none'} stroke={displayColor} strokeWidth="6" strokeLinejoin="round" />
            <path d="M50 5 L50 95" stroke={displayColor} strokeWidth="6" />
            <path d="M20 40 L80 40" stroke={displayColor} strokeWidth="6" />
         </motion.svg>
      )}
      {id === 'profile' && (
         <motion.svg viewBox="0 0 100 100" animate={isActive ? { rotateY: 360 } : {}} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
            <circle cx="50" cy="40" r="25" fill="none" stroke={displayColor} strokeWidth="6" />
            <circle cx="50" cy="40" r="10" fill={displayColor} />
            <path d="M15 90 C15 70 35 65 50 65 C65 65 85 70 85 90" fill="none" stroke={displayColor} strokeWidth="6" strokeLinecap="round" />
         </motion.svg>
      )}
      {id === 'rules' && (
         <motion.svg viewBox="0 0 100 100" animate={isActive ? { y: [-2, 2, -2] } : {}} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <rect x="20" y="15" width="60" height="70" rx="5" fill={isActive ? `${color}40` : 'none'} stroke={displayColor} strokeWidth="6" />
            <line x1="35" y1="35" x2="65" y2="35" stroke={displayColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="35" y1="55" x2="65" y2="55" stroke={displayColor} strokeWidth="6" strokeLinecap="round" />
            <line x1="35" y1="75" x2="50" y2="75" stroke={displayColor} strokeWidth="6" strokeLinecap="round" />
         </motion.svg>
      )}
      {id === 'rehab' && (
         <motion.svg viewBox="0 0 100 100" animate={isActive ? { scale: [1, 1.25, 1] } : {}} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>
            <path d="M50 85 C50 85 10 55 10 30 C10 15 25 5 40 15 C50 25 50 25 50 25 C50 25 50 25 60 15 C75 5 90 15 90 30 C90 55 50 85 50 85 Z" fill={isActive ? `${color}40` : 'none'} stroke={displayColor} strokeWidth="6" strokeLinejoin="round" />
            {isActive && <polyline points="30,45 40,45 50,25 60,65 70,45 80,45" fill="none" stroke="#fff" strokeWidth="4" strokeLinejoin="round" />}
         </motion.svg>
      )}
      {id === 'coach' && (
         <motion.svg viewBox="0 0 100 100" animate={isActive ? { rotateZ: 360 } : {}} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
            <circle cx="50" cy="50" r="40" fill="none" stroke={displayColor} strokeWidth="6" strokeDasharray="20 15" />
            <circle cx="50" cy="50" r="15" fill={displayColor} />
            <line x1="50" y1="50" x2="90" y2="50" stroke={displayColor} strokeWidth="6" strokeLinecap="round" />
         </motion.svg>
      )}
    </motion.div>
  );
};

const getDynamicIcon = (hunter: any, size: number = 24) => {
  const iconStr = String(hunter?.selectedIcon || hunter?.selected_icon || hunter?.icon || hunter?.class || (hunter?.titles && hunter.titles[0]) || '').toLowerCase().trim();
  if (iconStr.includes('moon') || iconStr.includes('shadow')) return <Moon size={size} color="#d8b4fe" />;
  if (iconStr.includes('eye') || iconStr.includes('vision')) return <Eye size={size} color="#818cf8" />;
  if (iconStr.includes('wind') || iconStr.includes('air')) return <Wind size={size} color="#38bdf8" />;
  if (iconStr.includes('barbell') || iconStr.includes('dumbbell')) return <Dumbbell size={size} color="#f97316" />;
  if (iconStr.includes('zap') || iconStr.includes('lightning')) return <Zap size={size} color="#eab308" />;
  if (iconStr.includes('shoe') || iconStr.includes('foot')) return <Footprints size={size} color="#10b981" />;
  if (iconStr.includes('shield') || iconStr.includes('tank')) return <Shield size={size} color="#64748b" />;
  if (iconStr.includes('lock') || iconStr.includes('gate')) return <LockIcon size={size} color="#10b981" />;
  if (iconStr.includes('flame') || iconStr.includes('fire')) return <Flame size={size} color="#ef4444" />;
  if (iconStr.includes('crown') || iconStr.includes('king')) return <Crown size={size} color="#f59e0b" />;
  if (iconStr.includes('skull') || iconStr.includes('death')) return <Skull size={size} color="#a855f7" />;
  if (iconStr.includes('target') || iconStr.includes('crosshair')) return <Target size={size} color="#f43f5e" />;
  if (iconStr.includes('heart')) return <Heart size={size} color="#f43f5e" />;
  if (iconStr.includes('droplet') || iconStr.includes('water')) return <Droplet size={size} color="#60a5fa" />;
  if (iconStr.includes('axe')) return <Axe size={size} color="#cbd5e1" />;
  if (iconStr.includes('anchor')) return <Anchor size={size} color="#0ea5e9" />;
  if (iconStr.includes('fingerprint')) return <Fingerprint size={size} color="#14b8a6" />;
  if (iconStr.includes('hexagon')) return <Hexagon size={size} color="#8b5cf6" />;
  if (iconStr.includes('cpu')) return <Cpu size={size} color="#06b6d4" />;
  if (iconStr.includes('infinity')) return <InfinityIcon size={size} color="#ec4899" />;
  return <Sword size={size} color="#00f2ff" />;
};

const getIconColor = (hunter: any) => {
  const iconStr = String(hunter?.selectedIcon || hunter?.selected_icon || hunter?.icon || hunter?.class || (hunter?.titles && hunter.titles[0]) || '').toLowerCase().trim();
  if (iconStr.includes('moon') || iconStr.includes('shadow')) return '#d8b4fe';
  if (iconStr.includes('eye') || iconStr.includes('vision')) return '#818cf8';
  if (iconStr.includes('wind') || iconStr.includes('air')) return '#38bdf8';
  if (iconStr.includes('barbell') || iconStr.includes('dumbbell')) return '#f97316';
  if (iconStr.includes('zap') || iconStr.includes('lightning')) return '#eab308';
  if (iconStr.includes('shoe') || iconStr.includes('foot')) return '#10b981';
  if (iconStr.includes('shield') || iconStr.includes('tank')) return '#64748b';
  if (iconStr.includes('lock') || iconStr.includes('gate')) return '#10b981';
  if (iconStr.includes('flame') || iconStr.includes('fire')) return '#ef4444';
  if (iconStr.includes('crown') || iconStr.includes('king')) return '#f59e0b';
  if (iconStr.includes('skull') || iconStr.includes('death')) return '#a855f7';
  if (iconStr.includes('target') || iconStr.includes('crosshair')) return '#f43f5e';
  if (iconStr.includes('heart')) return '#f43f5e';
  if (iconStr.includes('droplet') || iconStr.includes('water')) return '#60a5fa';
  if (iconStr.includes('axe')) return '#cbd5e1';
  if (iconStr.includes('anchor')) return '#0ea5e9';
  if (iconStr.includes('fingerprint')) return '#14b8a6';
  if (iconStr.includes('hexagon')) return '#8b5cf6';
  if (iconStr.includes('cpu')) return '#06b6d4';
  if (iconStr.includes('infinity')) return '#ec4899';
  return '#00f2ff';
};

const getStreakColor = (streak: number) => {
  if (streak >= 30) return '#a855f7'; 
  if (streak >= 14) return '#00f2ff'; 
  if (streak >= 7) return '#10b981';  
  return '#f97316';                   
};

const calculateLevelData = (totalXp: number) => {
  let level = 1; let currentXp = totalXp; let expNeededForNextLevel = 650;
  while (currentXp >= expNeededForNextLevel) { currentXp -= expNeededForNextLevel; level++; expNeededForNextLevel = Math.min(level * 150 + 500, 4000); }
  return { level, xpInCurrentLevel: currentXp, expNeededForNextLevel };
};

const PETS_DATABASE = [
  { name: 'Golden Wyvern Core', type: 'wyvern', color: '#eab308' },
  { name: 'Healing Phoenix Ember', type: 'phoenix', color: '#ef4444' },
  { name: 'Shadow Owl Eye', type: 'owl', color: '#a855f7' },
  { name: 'Iron Golem Matrix', type: 'golem', color: '#0ea5e9' },
  { name: 'Frost Wolf Soul', type: 'wolf', color: '#38bdf8' },
  { name: 'Emerald Dragon Scale', type: 'emerald', color: '#10b981' }
];

// 🚨 تصغير الميني أورب 🚨
const MiniOrbWrapper = styled(motion.div)`
  width: 24px; height: 24px; position: relative; display: flex; justify-content: center; align-items: center; margin-left: 8px; flex-shrink: 0;
`;

const MiniOrb = ({ type, color }: { type: string, color: string }) => {
  return (
    <MiniOrbWrapper animate={{ y: [-2, 2, -2], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
      <motion.div style={{ position: 'absolute', width: '100%', height: '100%', background: color, filter: 'blur(8px)', borderRadius: '50%', zIndex: 0 }} animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        {type === 'wyvern' && <svg viewBox="0 0 100 100"><polygon points="50,5 90,50 50,95 10,50" fill="none" stroke={color} strokeWidth="6" /><circle cx="50" cy="50" r="15" fill="#fff" /></svg>}
        {type === 'phoenix' && <svg viewBox="0 0 100 100"><path d="M50 10 Q70 40 50 90 Q30 40 50 10" fill={color} /><circle cx="50" cy="65" r="12" fill="#fff" /></svg>}
        {type === 'owl' && <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="6" strokeDasharray="10 10" /><ellipse cx="50" cy="50" rx="10" ry="25" fill="#fff" /></svg>}
        {type === 'golem' && <svg viewBox="0 0 100 100"><polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="#334155" stroke={color} strokeWidth="6" /><rect x="35" y="35" width="30" height="30" fill={color} /></svg>}
        {type === 'wolf' && <svg viewBox="0 0 100 100"><polygon points="50,10 80,40 50,90 20,40" fill="none" stroke={color} strokeWidth="6" /><polygon points="50,30 60,45 50,70 40,45" fill="#fff" /></svg>}
        {type === 'emerald' && <svg viewBox="0 0 100 100"><path d="M50 10 C 80 10, 90 50, 50 90 C 10 50, 20 10, 50 10 Z" fill="none" stroke={color} strokeWidth="6" /><circle cx="50" cy="50" r="15" fill="#fff" /></svg>}
      </div>
    </MiniOrbWrapper>
  );
};


// ==========================================
// 3. EPIC STYLED COMPONENTS 🎨 (صغيرة ومناسبة للموبايل)
// ==========================================
const panBackground = keyframes` 0% { background-position: 0% 0%; } 100% { background-position: 100% 100%; } `;

const AppContainer = styled.div`
  min-height: 100vh; background: radial-gradient(circle at top right, #0f172a, #020617 70%); color: #fff; font-family: 'Oxanium', sans-serif; overflow-x: hidden; position: relative;
`;

const BackgroundGrid = styled.div`
  position: fixed; inset: 0; background-image: linear-gradient(rgba(0, 242, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 242, 255, 0.03) 1px, transparent 1px); background-size: 40px 40px; animation: ${panBackground} 60s linear infinite; pointer-events: none; z-index: 0;
`;

const ContentWrapper = styled.div` position: relative; z-index: 10; padding-bottom: 50px; `;

const BootScreen = styled(motion.div)` position: fixed; inset: 0; background: #020617; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999; font-family: 'Courier New', Courier, monospace; `;
const scanline = keyframes` 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } `;
const ScanlineEffect = styled.div` position: absolute; top: 0; left: 0; width: 100%; height: 10px; background: rgba(0, 242, 255, 0.3); box-shadow: 0 0 20px rgba(0, 242, 255, 0.5); animation: ${scanline} 3s linear infinite; pointer-events: none; `;

// 🚨 تصغير ה-Status Bar بالكامل 🚨
const StatusBar = styled.div`
  background: rgba(2, 6, 23, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding: 12px 15px; position: sticky; top: 0; z-index: 50; box-shadow: 0 10px 20px rgba(0,0,0,0.5); display: flex; flex-direction: column;
`;

const pulseGlow = keyframes` 0% { box-shadow: 0 0 5px currentColor; } 50% { box-shadow: 0 0 15px currentColor; } 100% { box-shadow: 0 0 5px currentColor; } `;
const shimmer = keyframes` 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } `;

const HPBarContainer = styled.div` display: flex; align-items: center; gap: 8px; margin-bottom: 12px; width: 100%; `;
const HPBarWrapper = styled.div` flex: 1; height: 8px; background: rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden; position: relative; border: 1px solid rgba(255,255,255,0.1); box-shadow: inset 0 0 5px rgba(0,0,0,0.5); `;
const HPBarFill = styled(motion.div)<{ $hp: number; }>` 
  height: 100%; background: ${(props) => props.$hp > 50 ? 'linear-gradient(90deg, #059669, #10b981)' : props.$hp > 20 ? 'linear-gradient(90deg, #d97706, #eab308)' : 'linear-gradient(90deg, #991b1b, #ef4444)'}; width: ${(props) => props.$hp}%; position: relative; overflow: hidden; box-shadow: 0 0 10px ${(props) => props.$hp > 50 ? 'rgba(16, 185, 129, 0.6)' : props.$hp > 20 ? 'rgba(234, 179, 8, 0.6)' : 'rgba(239, 68, 68, 0.6)'};
  &::after { content: ''; position: absolute; top: 0; left: 0; bottom: 0; right: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: ${shimmer} 2s infinite; }
`;
const HPText = styled.span<{ $hp: number }>` font-size: 11px; font-weight: 900; color: ${(props) => props.$hp > 50 ? '#10b981' : props.$hp > 20 ? '#eab308' : '#ef4444'}; text-shadow: 0 0 5px currentColor; `;

const PlayerInfoRow = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 8px; `;
const ClassBadge = styled.div` display: flex; align-items: center; flex: 1; min-width: 0; `;

const rotateHex = keyframes` 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } `;
const breatheGlow = keyframes` 0% { filter: drop-shadow(0 0 5px currentColor); } 50% { filter: drop-shadow(0 0 15px currentColor); } 100% { filter: drop-shadow(0 0 5px currentColor); } `;

// 🚨 تصغير أيقونة الكلاس 🚨
const HexagonBox = styled(motion.button)<{ $color: string; }>` 
  width: 42px; height: 42px; position: relative; display: flex; align-items: center; justify-content: center; background: transparent; border: none; cursor: pointer; outline: none; flex-shrink: 0; color: ${(props) => props.$color}; animation: ${breatheGlow} 3s infinite;
  &::before { content: ''; position: absolute; inset: 0; background: ${(props) => props.$color}15; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); border: 1.5px solid ${(props) => props.$color}; animation: ${rotateHex} 15s linear infinite; transition: 0.3s; }
  &:active { transform: scale(0.95); } 
  svg { position: relative; z-index: 2; filter: drop-shadow(0 0 5px rgba(255,255,255,0.5)); width: 20px; height: 20px; }
`;

const PlayerDetails = styled.div` display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; margin-left: 10px; `;
const PlayerNameRow = styled.div` display: flex; align-items: center; gap: 6px; width: 100%; `;
const SystemLinkText = styled.div` font-size: 8px; color: #00f2ff; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; `;
const NameText = styled.div` font-size: 15px; font-weight: 900; text-transform: uppercase; color: #fff; text-shadow: 0 2px 5px rgba(0,0,0,0.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px; `;
const PlayerTitleText = styled.div` font-size: 10px; color: #94a3b8; font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; `;
const StreakBadge = styled(motion.div)<{ $color: string }>` display: flex; align-items: center; background: linear-gradient(90deg, ${(props) => props.$color}20, transparent); padding: 2px 6px; border-radius: 6px; border-left: 2px solid ${(props) => props.$color}; flex-shrink: 0; svg { width: 10px; height: 10px; } span { font-size: 11px; } `;

const GoldBadge = styled.div` 
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(202, 138, 4, 0.2) 100%); border: 1px solid #eab308; color: #fef08a; padding: 6px 12px; border-radius: 10px; font-weight: 900; display: flex; align-items: center; gap: 5px; flex-shrink: 0; box-shadow: 0 0 10px rgba(234, 179, 8, 0.2);
  img { width: 14px; } span { font-size: 14px; }
`;

const EXPBarContainer = styled.div` display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: bold; `;
const EXPBarWrapper = styled.div` flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden; position: relative; `;
const EXPBarFill = styled(motion.div)<{ $progress: number; }>` height: 100%; background: linear-gradient(90deg, #0284c7, #00f2ff); width: ${(props) => props.$progress}%; position: relative; overflow: hidden; box-shadow: 0 0 10px rgba(0, 242, 255, 0.5); &::after { content: ''; position: absolute; top: 0; left: 0; bottom: 0; right: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: ${shimmer} 2s infinite; } `;

// 🚨 تصغير وتظبيط أزرار الـ Navigation 🚨
const NavigationGrid = styled.div` display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 10px 15px; background: rgba(11, 17, 32, 0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 10px; position: relative; z-index: 40; `;

const NavButton = styled(motion.button)<{ $active: boolean; $color: string; }>`
  background: ${(props) => props.$active ? `linear-gradient(180deg, ${props.$color}20 0%, rgba(2,6,23,0.8) 100%)` : 'rgba(2, 6, 23, 0.6)'};
  border: 1px solid ${(props) => (props.$active ? props.$color : 'rgba(255,255,255,0.05)')};
  color: ${(props) => props.$active ? '#fff' : '#64748b'};
  padding: 8px 4px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; font-family: 'Oxanium', sans-serif; font-size: 9px; font-weight: 900; cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden;
  box-shadow: ${(props) => props.$active ? `0 0 15px ${props.$color}40, inset 0 0 8px ${props.$color}20` : 'none'};
  svg { filter: ${(props) => props.$active ? `drop-shadow(0 0 5px ${props.$color})` : 'none'}; transition: 0.3s; width: 22px; height: 22px; }
  .active-bg { position: absolute; inset: 5px; background: ${(props) => props.$color}; filter: blur(15px); border-radius: 50%; z-index: 0; opacity: 0.2; }
  span { position: relative; z-index: 2; }
  &:hover { color: #fff; border-color: ${(props) => props.$color}; svg { filter: drop-shadow(0 0 5px #fff); } }
`;

const TopRightControls = styled.div` display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 10px; width: 100%; `;
const IconButton = styled.button<{ $hasUnread?: boolean }>` background: rgba(0,0,0,0.5); border: 1px solid #334155; color: ${(props) => props.$hasUnread ? '#00f2ff' : '#94a3b8'}; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; position: relative; box-shadow: ${(props) => props.$hasUnread ? '0 0 10px rgba(0,242,255,0.3)' : 'none'}; &:hover { color: #00f2ff; border-color: #00f2ff; background: rgba(0,242,255,0.1); } svg { width: 16px; height: 16px; } `;
const UnreadDot = styled.div` position: absolute; top: -4px; right: -4px; background: #ef4444; color: #fff; font-size: 9px; font-weight: bold; padding: 2px 4px; border-radius: 10px; box-shadow: 0 0 8px #ef4444; `;
const HeartIcon = ({ size, color }: { size: number; color: string }) => ( <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> );

const ModalOverlay = styled(motion.div)` position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 15px; backdrop-filter: blur(8px); `;
const ModalContent = styled(motion.div)` background: #0b1120; border: 2px solid #00f2ff; border-radius: 16px; padding: 20px; width: 100%; max-width: 400px; position: relative; max-height: 80vh; overflow-y: auto; box-shadow: 0 0 30px rgba(0,242,255,0.2); &::-webkit-scrollbar { width: 4px; } &::-webkit-scrollbar-thumb { background: #00f2ff; border-radius: 4px; } `;
const NotificationCard = styled.div<{ $type: string }>` background: #0f172a; border-left: 3px solid ${(props) => props.$type === 'broadcast' ? '#0ea5e9' : props.$type === 'penalty' ? '#ef4444' : '#10b981'}; padding: 12px; border-radius: 8px; margin-bottom: 10px; display: flex; gap: 10px; `;

// ==========================================
// 4. MAIN APP COMPONENT
// ==========================================
const App = () => {
  const SYSTEM_VERSION = "1.0.2"; // تم التحديث لضمان كسر الكاش

  const [player, setPlayer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBooting, setIsBooting] = useState(false);
  const [bootText, setBootText] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isMusicMuted, setIsMusicMuted] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const bootSequenceText = [ "INITIALIZING NEURAL LINK...", "DECRYPTING HUNTER PROFILE...", "SYNCING WITH ELITE_PLAYERS MAINFRAME...", "CALIBRATING CUMULATIVE EXP MATRIX...", "WELCOME TO THE ELITE SYSTEM." ];
  const isCoachMode = localStorage.getItem('elite_coach_mode') === 'true';

  useEffect(() => {
    const currentVersion = localStorage.getItem('elite_system_version');
    if (currentVersion !== SYSTEM_VERSION) {
      localStorage.setItem('elite_system_version', SYSTEM_VERSION);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for(let registration of registrations) { registration.unregister(); }
        });
      }
      window.location.reload();
    }
  }, []);

  useEffect(() => { Howler.mute(isMusicMuted); }, [isMusicMuted]);

  useEffect(() => {
    const handleOnline = () => { setIsOffline(false); toast.success('SYSTEM ONLINE: Neural Link Restored.', { style: { background: '#022c22', border: '1px solid #10b981', color: '#10b981' } }); };
    const handleOffline = () => { setIsOffline(true); toast.error('SYSTEM OFFLINE: Operating on Local Cache.', { duration: 10000, style: { background: '#2a0808', border: '1px solid #ef4444', color: '#fca5a5' } }); };
    window.addEventListener('online', handleOnline); window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem('elite_system_active_session');
    if (savedData) {
      const parsedData = JSON.parse(savedData); setIsBooting(true); playSound('boot');
      let step = 0; const bootInterval = setInterval(() => { if (step < bootSequenceText.length) { setBootText(bootSequenceText[step]); playSound('glitch'); step++; } else { clearInterval(bootInterval); } }, 400);
      const fetchLatestData = async () => {
        try {
          if (!navigator.onLine) { setPlayer(parsedData); return; }
          const { data, error } = await supabase.from('elite_players').select('*').eq('name', parsedData.name).single();
          if (data && !error) {
            const updatedPlayer = { ...parsedData, ...data }; setPlayer(updatedPlayer); localStorage.setItem('elite_system_active_session', JSON.stringify(updatedPlayer));
            let lastMacroDate = data.last_macro_date; const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
            if (lastMacroDate && lastMacroDate !== todayStr) {
               await supabase.from('player_snapshots').insert([{ player_name: updatedPlayer.name, snapshot_date: lastMacroDate, xp: data.cumulative_xp || data.xp || 0, gold: data.gold || 0, hp: data.hp || 100 }]);
               let fetchedMacros = { protein: 0, carbs: 0, fats: 0, calories: 0, log: [] }; await supabase.from('elite_players').update({ daily_macros: fetchedMacros, last_macro_date: todayStr }).eq('name', updatedPlayer.name);
            }
          } else { setPlayer(parsedData); }
        } catch (err) { console.error("Sync error", err); setPlayer(parsedData); } finally { setTimeout(() => { setIsBooting(false); playSound('startup'); if (!bgmMain.playing()) { bgmMain.play(); } }, 2500); }
      }; fetchLatestData();
    }
  }, []);

  useEffect(() => {
    if (!player || isBooting || isOffline) return;
    const fetchInitialNotifications = async () => {
      try {
        const { data } = await supabase.from('global_news').select('*').order('created_at', { ascending: false }).limit(10);
        if (data) { const formatted = data.map((n: any) => ({ id: n.id, title: n.title, msg: n.content, time: new Date(n.created_at).toLocaleString(), type: 'broadcast', read: true })); setNotifications(formatted); }
      } catch (err) { console.error(err); }
    }; fetchInitialNotifications();
    const newsSub = supabase.channel('public:global_news').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_news' }, payload => { const newNotif = { id: payload.new.id, title: payload.new.title, msg: payload.new.content, time: new Date(payload.new.created_at).toLocaleTimeString(), type: 'broadcast', read: false }; setNotifications(prev => [newNotif, ...prev]); playSound('notification'); toast(payload.new.title, { description: payload.new.content, style: { background: '#020617', border: '1px solid #0ea5e9', color: '#0ea5e9' } }); }).subscribe();
    const questSub = supabase.channel('public:elite_quests').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'elite_quests', filter: `player_name=eq.${player.name}` }, payload => { if (payload.new.status !== payload.old.status) { if (payload.new.status === 'approved') { const newNotif = { id: payload.new.id, title: 'REQUEST APPROVED', msg: `Coach has approved your request: ${payload.new.task_name}. Rewards granted!`, time: new Date().toLocaleTimeString(), type: 'success', read: false }; setNotifications(prev => [newNotif, ...prev]); playSound('startup'); toast.success('REQUEST APPROVED!', { description: payload.new.task_name, style: { background: '#022c22', border: '1px solid #10b981', color: '#10b981' } }); } else if (payload.new.status === 'rejected') { const newNotif = { id: payload.new.id, title: 'REQUEST REJECTED', msg: `Coach rejected your request: ${payload.new.task_name}.`, time: new Date().toLocaleTimeString(), type: 'penalty', read: false }; setNotifications(prev => [newNotif, ...prev]); playSound('error'); toast.error('REQUEST REJECTED', { description: payload.new.task_name, style: { background: '#2a0808', border: '1px solid #ef4444', color: '#ef4444' } }); } } }).subscribe();
    const playerSub = supabase.channel('public:elite_players').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'elite_players', filter: `name=eq.${player.name}` }, payload => { if (payload.new.active_penalty && !payload.old.active_penalty) { playSound('error'); toast.error('SYSTEM PENALTY ACTIVATED', { description: 'The Punisher has frozen your account. Execute Disciplinary Quest.', duration: 8000, style: { background: '#450a0a', border: '2px solid #ef4444', color: '#fca5a5', fontWeight: 'bold' } }); } }).subscribe();
    return () => { supabase.removeChannel(newsSub); supabase.removeChannel(questSub); supabase.removeChannel(playerSub); };
  }, [player, isBooting, isOffline]);

  useEffect(() => { if (player && !isBooting) { localStorage.setItem('elite_system_active_session', JSON.stringify(player)); } }, [player, isBooting]);
  const handleAwaken = (playerData: any) => { setPlayer(playerData); setIsBooting(true); playSound('boot'); setTimeout(() => { setIsBooting(false); playSound('startup'); if (!bgmMain.playing()) { bgmMain.play(); } }, 2000); };
  const handleLogout = () => { playSound('click'); localStorage.removeItem('elite_system_active_session'); localStorage.removeItem('elite_coach_mode'); Howler.stop(); setPlayer(null); };

  const handleTabChange = (tabId: string) => {
    if (tabId === 'rank' || tabId === 'profile') playSound('shield');
    else if (tabId === 'records' || tabId === 'rehab') playAuraSound(player);
    else playSound('click');
    
    if (tabId === 'shop') {
      if (currentBGM !== bgmShop) { currentBGM.fade(0.15, 0, 800); setTimeout(() => { currentBGM.pause(); bgmShop.play(); bgmShop.fade(0, 0.15, 800); currentBGM = bgmShop; }, 800); }
    } else {
      if (currentBGM !== bgmMain) { currentBGM.fade(0.15, 0, 800); setTimeout(() => { currentBGM.pause(); bgmMain.play(); bgmMain.fade(0, 0.15, 800); currentBGM = bgmMain; }, 800); }
    }
    setActiveTab(tabId);
  };

  const openNotificationCenter = () => { playSound('click'); setShowNotifications(true); setNotifications(prev => prev.map(n => ({ ...n, read: true }))); };
  const toggleMute = () => { playSound('click'); setIsMusicMuted(!isMusicMuted); };

  if (!player) return <AwakeningScreen onAwaken={handleAwaken} />;

  if (isBooting) {
    return (
      <BootScreen>
        <ScanlineEffect />
        <Terminal size={50} color="#00f2ff" style={{ marginBottom: 15, filter: 'drop-shadow(0 0 10px #00f2ff)' }} />
        <h2 style={{ color: '#00f2ff', letterSpacing: '2px', textShadow: '0 0 10px #00f2ff', fontSize: 20 }}>SYSTEM BOOT</h2>
        <p style={{ color: '#94a3b8', fontFamily: 'monospace', marginTop: 15, fontSize: 12, textAlign: 'center', padding: '0 20px' }}>{bootText}</p>
        <div style={{ width: '200px', height: '2px', background: '#1e293b', marginTop: 20, position: 'relative', overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2.2, ease: 'easeInOut' }} style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: '#00f2ff', boxShadow: '0 0 10px #00f2ff' }} />
        </div>
      </BootScreen>
    );
  }

  const levelData = calculateLevelData(player.cumulative_xp ?? player.xp ?? 0);
  const currentLvl = levelData.level;
  const currentVisualXp = levelData.xpInCurrentLevel;
  const xpNeededForNextLevel = levelData.expNeededForNextLevel;
  const progressPercent = Math.min(100, (currentVisualXp / xpNeededForNextLevel) * 100);

  const hp = player.hp ?? 100;
  const auraColor = getIconColor(player);
  const currentStreak = player.streak || 0;
  const streakColor = getStreakColor(currentStreak);
  const activePetName = player?.active_pet || null;
  const petData = activePetName ? PETS_DATABASE.find(p => p.name === activePetName) : null;
  const isPetDead = player?.pet_hunger <= 0;

  // 🚨 تم حذف STORE من القائمة 🚨
  const TABS = [
    { id: 'dashboard', label: 'QUESTS', color: '#00f2ff' },
    { id: 'vault', label: 'VAULT', color: '#818cf8' }, 
    { id: 'records', label: 'RECORDS', color: '#facc15' },
    { id: 'shop', label: 'SHOP', color: '#38bdf8' },
    { id: 'rank', label: 'RANK', color: '#a855f7' },
    { id: 'profile', label: 'PROFILE', color: '#ec4899' },
    { id: 'rules', label: 'RULES', color: '#f43f5e' },
    { id: 'rehab', label: 'CLINIC', color: '#10b981' },
    ...(isCoachMode ? [{ id: 'coach', label: 'COMMAND', color: '#ef4444' }] : []),
  ];

  const pageVariants = { initial: { opacity: 0, scale: 0.98, y: 5 }, in: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }, out: { opacity: 0, scale: 0.98, y: -5, transition: { duration: 0.2, ease: 'easeIn' } } };

  return (
    <AppContainer>
      <BackgroundGrid />
      <Toaster position="top-center" theme="dark" />
      
      <AnimatePresence>
        {isOffline && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ background: '#b45309', color: '#fef3c7', padding: '6px', textAlign: 'center', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <WifiOff size={12} /> OFFLINE MODE: Local Cache.
          </motion.div>
        )}
      </AnimatePresence>

      <StatusBar>
        <TopRightControls>
          <IconButton onClick={toggleMute} title={isMusicMuted ? "Unmute Music" : "Mute Music"}>
            {isMusicMuted ? <VolumeX size={16} color="#ef4444" /> : <Volume2 size={16} color="#10b981" />}
          </IconButton>
          <IconButton onClick={openNotificationCenter} $hasUnread={unreadCount > 0} title="Notifications" style={{ display: 'none' }}>
            <Bell size={16} />
            {unreadCount > 0 && <UnreadDot>{unreadCount}</UnreadDot>}
          </IconButton>
          <IconButton onClick={handleLogout} title="System Logout"><Power size={16} /></IconButton>
        </TopRightControls>

        <HPBarContainer>
          <HeartIcon size={14} color={hp > 50 ? '#10b981' : hp > 20 ? '#eab308' : '#ef4444'} />
          <HPBarWrapper>
            <HPBarFill $hp={hp} initial={{ width: 0 }} animate={{ width: `${hp}%` }} transition={{ duration: 1.5, type: 'spring' }} />
          </HPBarWrapper>
          <HPText $hp={hp}>{hp} HP</HPText>
        </HPBarContainer>

        <PlayerInfoRow>
          <ClassBadge>
            <HexagonBox $color={auraColor} onClick={() => playAuraSound(player)} whileTap={{ scale: 0.9 }}>
              {getDynamicIcon(player, 20)}
            </HexagonBox>
            
            {petData && (
              <MiniOrb type={petData.type} color={isPetDead ? '#64748b' : petData.color} />
            )}

            <PlayerDetails>
              <SystemLinkText>System Link Active</SystemLinkText>
              <PlayerNameRow>
                <NameText>LVL {currentLvl} - {player.name}</NameText>
              </PlayerNameRow>
              <PlayerNameRow>
                 <PlayerTitleText>{`[ ${player.titles?.[0] || 'Athlete'} ]`}</PlayerTitleText>
                 {currentStreak >= 3 && (
                  <StreakBadge $color={streakColor} title={`${currentStreak} Days Streak!`} initial={{ scale: 0.8 }} animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    <Flame size={10} color={streakColor} fill={streakColor} style={{ marginRight: '4px', filter: `drop-shadow(0 0 5px ${streakColor})` }} />
                    <span style={{ color: streakColor, fontWeight: '900' }}>{currentStreak}</span>
                  </StreakBadge>
                )}
              </PlayerNameRow>
            </PlayerDetails>
          </ClassBadge>

          <GoldBadge>
            <img src="https://cdn-icons-png.flaticon.com/512/138/138246.png" width="14" alt="gold" style={{ filter: 'brightness(0) saturate(100%) invert(75%) sepia(55%) saturate(1637%) hue-rotate(352deg) brightness(101%) contrast(106%)', dropShadow: '0 0 5px rgba(234, 179, 8, 0.8)' }} />
            <span>{player.gold || 0}</span>
          </GoldBadge>
        </PlayerInfoRow>

        <EXPBarContainer>
          <span style={{ color: '#00f2ff', fontWeight: '900', letterSpacing: '1px' }}>EXP</span>
          <EXPBarWrapper>
            <EXPBarFill $progress={progressPercent} initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
          </EXPBarWrapper>
          <span style={{ color: '#00f2ff', fontWeight: 'bold' }}>{currentVisualXp} / {xpNeededForNextLevel}</span>
        </EXPBarContainer>
      </StatusBar>

      <NavigationGrid>
        {TABS.map((tab) => (
          <NavButton 
            key={tab.id} 
            $active={activeTab === tab.id} 
            $color={tab.color} 
            onClick={() => handleTabChange(tab.id)}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence>
                {activeTab === tab.id && (
                    <motion.div className="active-bg" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 0.2, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.3 }} />
                )}
            </AnimatePresence>
            
            <motion.div style={{ width: '22px', height: '22px', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1, filter: activeTab === tab.id ? `drop-shadow(0 0 5px ${tab.color})` : 'none' }} animate={activeTab === tab.id ? { y: [-2, 2, -2] } : {}} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
              {tab.id === 'dashboard' && <motion.svg viewBox="0 0 100 100" animate={activeTab === tab.id ? { rotateZ: 180 } : {}} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}><polygon points="50,10 90,50 50,90 10,50" fill={activeTab === tab.id ? `${tab.color}40` : 'none'} stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="8" strokeLinejoin="round" /><polygon points="50,25 75,50 50,75 25,50" fill={activeTab === tab.id ? '#fff' : '#64748b'} /></motion.svg>}
              {tab.id === 'vault' && <motion.svg viewBox="0 0 100 100" animate={activeTab === tab.id ? { rotateY: [-20, 20, -20] } : {}} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}><polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill={activeTab === tab.id ? `${tab.color}40` : 'none'} stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="6" strokeLinejoin="round" /><polyline points="10,30 50,50 90,30" fill="none" stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="6" /><line x1="50" y1="50" x2="50" y2="90" stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="6" /></motion.svg>}
              {tab.id === 'records' && <motion.svg viewBox="0 0 100 100" animate={activeTab === tab.id ? { rotateZ: 360 } : {}} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}><circle cx="50" cy="50" r="40" fill="none" stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="6" strokeDasharray="15 10" /><polygon points="50,20 60,40 80,45 65,60 70,80 50,70 30,80 35,60 20,45 40,40" fill={activeTab === tab.id ? '#fff' : '#64748b'} stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="2" strokeLinejoin="round" /></motion.svg>}
              {tab.id === 'shop' && <motion.svg viewBox="0 0 100 100" animate={activeTab === tab.id ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}><polygon points="30,20 70,20 90,40 50,90 10,40" fill={activeTab === tab.id ? `${tab.color}40` : 'none'} stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="6" strokeLinejoin="round" /><polyline points="30,20 50,50 70,20" fill="none" stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="4" /><line x1="10" y1="40" x2="90" y2="40" stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="4" /></motion.svg>}
              {tab.id === 'rank' && <motion.svg viewBox="0 0 100 100" animate={activeTab === tab.id ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}><path d="M10 20 L50 5 L90 20 L90 50 C90 80 50 95 50 95 C50 95 10 80 10 50 Z" fill={activeTab === tab.id ? `${tab.color}40` : 'none'} stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="6" strokeLinejoin="round" /><path d="M50 5 L50 95" stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="6" /><path d="M20 40 L80 40" stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="6" /></motion.svg>}
              {tab.id === 'profile' && <motion.svg viewBox="0 0 100 100" animate={activeTab === tab.id ? { rotateY: 360 } : {}} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}><circle cx="50" cy="40" r="25" fill="none" stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="6" /><circle cx="50" cy="40" r="10" fill={activeTab === tab.id ? '#fff' : '#64748b'} /><path d="M15 90 C15 70 35 65 50 65 C65 65 85 70 85 90" fill="none" stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="6" strokeLinecap="round" /></motion.svg>}
              {tab.id === 'rules' && <motion.svg viewBox="0 0 100 100" animate={activeTab === tab.id ? { y: [-2, 2, -2] } : {}} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}><rect x="20" y="15" width="60" height="70" rx="5" fill={activeTab === tab.id ? `${tab.color}40` : 'none'} stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="6" /><line x1="35" y1="35" x2="65" y2="35" stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="6" strokeLinecap="round" /><line x1="35" y1="55" x2="65" y2="55" stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="6" strokeLinecap="round" /><line x1="35" y1="75" x2="50" y2="75" stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="6" strokeLinecap="round" /></motion.svg>}
              {tab.id === 'rehab' && <motion.svg viewBox="0 0 100 100" animate={activeTab === tab.id ? { scale: [1, 1.25, 1] } : {}} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}><path d="M50 85 C50 85 10 55 10 30 C10 15 25 5 40 15 C50 25 50 25 50 25 C50 25 50 25 60 15 C75 5 90 15 90 30 C90 55 50 85 50 85 Z" fill={activeTab === tab.id ? `${tab.color}40` : 'none'} stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="6" strokeLinejoin="round" />{activeTab === tab.id && <polyline points="30,45 40,45 50,25 60,65 70,45 80,45" fill="none" stroke="#fff" strokeWidth="4" strokeLinejoin="round" />}</motion.svg>}
              {tab.id === 'coach' && <motion.svg viewBox="0 0 100 100" animate={activeTab === tab.id ? { rotateZ: 360 } : {}} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}><circle cx="50" cy="50" r="40" fill="none" stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="6" strokeDasharray="20 15" /><circle cx="50" cy="50" r="15" fill={activeTab === tab.id ? '#fff' : '#64748b'} /><line x1="50" y1="50" x2="90" y2="50" stroke={activeTab === tab.id ? '#fff' : '#64748b'} strokeWidth="6" strokeLinecap="round" /></motion.svg>}
            </motion.div>

            <span>{tab.label}</span>
          </NavButton>
        ))}
      </NavigationGrid>

      <ContentWrapper>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial="initial" animate="in" exit="out" variants={pageVariants}>
            {activeTab === 'dashboard' && <Dashboard player={player} setPlayer={setPlayer} />}
            {activeTab === 'vault' && <Vault player={player} setPlayer={setPlayer} />}
            {activeTab === 'records' && <Records player={player} setPlayer={setPlayer} />}
            {activeTab === 'shop' && <Shop player={player} setPlayer={setPlayer} />}
            {activeTab === 'rank' && <Rank player={player} setPlayer={setPlayer} />}
            {activeTab === 'profile' && <Profile player={player} setPlayer={setPlayer} />}
            {activeTab === 'rules' && <Rules />}
            {activeTab === 'rehab' && <Rehab />}
            {activeTab === 'coach' && <CoachPanel />}
          </motion.div>
        </AnimatePresence>
      </ContentWrapper>
    </AppContainer>
  );
};

export default App;