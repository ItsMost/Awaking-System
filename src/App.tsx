import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sword, LogOut, CheckSquare, Medal, ShoppingCart, Shield, User,
  Book, Activity, Moon, Eye, Wind, Dumbbell, Zap, Footprints, Lock as LockIcon, Flame,
  Crown, Skull, Target, Heart, Droplet, Axe, Anchor, Fingerprint, Cpu, Infinity as InfinityIcon,
  Hexagon, Globe, Terminal, Power, Bell, X, MessageSquare, WifiOff, Volume2, VolumeX, Package,
  LayoutDashboard, Box, Trophy, Store, Settings, Crosshair, ArrowRight
} from 'lucide-react';
import { toast, Toaster } from 'sonner';


import AwakeningScreen from './components/AwakeningScreen';
import Dashboard from './components/Dashboard';
import Rank from './components/Rank';
import Shop from './components/Shop';
import Profile from './components/Profile';
import Records from './components/Records';
import Rules from './components/Rules';
import Rehab from './components/Rehab';
import CoachPanel from './components/CoachPanel'; 
import { supabase } from './lib/supabase';

// ==========================================
// 1. ADVANCED AUDIO ENGINE (Web Audio Only)
// ==========================================




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
// 2. Utils
// ==========================================
const getDynamicIcon = (hunter: any, size: number = 24) => {
  const iconStr = String(hunter?.selectedIcon || hunter?.selected_icon || hunter?.icon || hunter?.class || (hunter?.titles && hunter.titles[0]) || '').toLowerCase().trim();
  if (iconStr.includes('moon') || iconStr.includes('shadow')) return <Moon size={size} color="#d8b4fe" />;
  if (iconStr.includes('eye') || iconStr.includes('vision')) return <Eye size={size} color="#818cf8" />;
  if (iconStr.includes('wind') || iconStr.includes('air')) return <Wind size={size} color="#eab308" />;
  if (iconStr.includes('barbell') || iconStr.includes('dumbbell')) return <Dumbbell size={size} color="#f97316" />;
  if (iconStr.includes('zap') || iconStr.includes('lightning')) return <Zap size={size} color="#eab308" />;
  if (iconStr.includes('shoe') || iconStr.includes('foot')) return <Footprints size={size} color="#10b981" />;
  if (iconStr.includes('shield') || iconStr.includes('tank')) return <Shield size={size} color="#64748b" />;
  if (iconStr.includes('lock') || iconStr.includes('gate')) return <LockIcon size={size} color="#10b981" />;
  if (iconStr.includes('flame') || iconStr.includes('fire')) return <Flame size={size} color="#ef4444" />;
  if (iconStr.includes('crown') || iconStr.includes('king')) return <Crown size={size} color="#f59e0b" />;
  if (iconStr.includes('skull') || iconStr.includes('death')) return <Skull size={size} color="#f59e0b" />;
  if (iconStr.includes('target') || iconStr.includes('crosshair')) return <Target size={size} color="#f43f5e" />;
  if (iconStr.includes('heart')) return <Heart size={size} color="#f43f5e" />;
  if (iconStr.includes('droplet') || iconStr.includes('water')) return <Droplet size={size} color="#60a5fa" />;
  if (iconStr.includes('axe')) return <Axe size={size} color="#cbd5e1" />;
  if (iconStr.includes('anchor')) return <Anchor size={size} color="#f59e0b" />;
  if (iconStr.includes('fingerprint')) return <Fingerprint size={size} color="#14b8a6" />;
  if (iconStr.includes('hexagon')) return <Hexagon size={size} color="#ea580c" />;
  if (iconStr.includes('cpu')) return <Cpu size={size} color="#06b6d4" />;
  if (iconStr.includes('infinity')) return <InfinityIcon size={size} color="#ec4899" />;
  return <Sword size={size} color="#f97316" />;
};

const getIconColor = (hunter: any) => {
  const iconStr = String(hunter?.selectedIcon || hunter?.selected_icon || hunter?.icon || hunter?.class || (hunter?.titles && hunter.titles[0]) || '').toLowerCase().trim();
  if (iconStr.includes('moon') || iconStr.includes('shadow')) return '#d8b4fe';
  if (iconStr.includes('eye') || iconStr.includes('vision')) return '#818cf8';
  if (iconStr.includes('wind') || iconStr.includes('air')) return '#eab308';
  if (iconStr.includes('barbell') || iconStr.includes('dumbbell')) return '#f97316';
  if (iconStr.includes('zap') || iconStr.includes('lightning')) return '#eab308';
  if (iconStr.includes('shoe') || iconStr.includes('foot')) return '#10b981';
  if (iconStr.includes('shield') || iconStr.includes('tank')) return '#64748b';
  if (iconStr.includes('lock') || iconStr.includes('gate')) return '#10b981';
  if (iconStr.includes('flame') || iconStr.includes('fire')) return '#ef4444';
  if (iconStr.includes('crown') || iconStr.includes('king')) return '#f59e0b';
  if (iconStr.includes('skull') || iconStr.includes('death')) return '#f59e0b';
  if (iconStr.includes('target') || iconStr.includes('crosshair')) return '#f43f5e';
  if (iconStr.includes('heart')) return '#f43f5e';
  if (iconStr.includes('droplet') || iconStr.includes('water')) return '#60a5fa';
  if (iconStr.includes('axe')) return '#cbd5e1';
  if (iconStr.includes('anchor')) return '#f59e0b';
  if (iconStr.includes('fingerprint')) return '#14b8a6';
  if (iconStr.includes('hexagon')) return '#ea580c';
  if (iconStr.includes('cpu')) return '#06b6d4';
  if (iconStr.includes('infinity')) return '#ec4899';
  return '#f97316';
};

const getStreakColor = (streak: number) => {
  if (streak >= 30) return '#f59e0b'; 
  if (streak >= 14) return '#f97316'; 
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
  { name: 'Shadow Owl Eye', type: 'owl', color: '#f59e0b' },
  { name: 'Iron Golem Matrix', type: 'golem', color: '#f59e0b' },
  { name: 'Frost Wolf Soul', type: 'wolf', color: '#eab308' },
  { name: 'Emerald Dragon Scale', type: 'emerald', color: '#10b981' }
];

const MiniOrbWrapper = styled.div`
  width: 24px; height: 24px; position: relative; display: flex; justify-content: center; align-items: center; margin-left: 8px; flex-shrink: 0;
`;

const MiniOrb = ({ type, color }: { type: string, color: string }) => {
  return (
    <MiniOrbWrapper>
      <div style={{ position: 'absolute', width: '100%', height: '100%', background: color, filter: 'blur(5px)', borderRadius: '50%', zIndex: 0, opacity: 0.6 }} />
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



const AppContainer = styled.div`
  min-height: 100vh; background: radial-gradient(circle at top right, #1c1917, #0c0a09 70%); color: #fff; font-family: 'Exo 2', sans-serif; overflow-x: hidden; position: relative;
`;

const BackgroundGrid = styled.div`
  position: fixed; inset: 0; background-image: linear-gradient(rgba(249, 115, 22, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.03) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; z-index: 0;
`;

const ContentWrapper = styled.div` position: relative; padding-bottom: 50px; `;
const BootScreen = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, #0b1528 0%, #0c0a09 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  font-family: 'Exo 2', sans-serif;
  overflow: hidden;
`;

const HUDGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(249, 115, 22, 0.02) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(249, 115, 22, 0.02) 1px, transparent 1px);
  background-size: 30px 30px;
  pointer-events: none;
  opacity: 0.8;
  z-index: 1;
`;

const GlowOrb = styled.div`
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 2;
  filter: blur(40px);
  animation: pulseOrb 3s infinite ease-in-out;
  @keyframes pulseOrb {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.2); opacity: 1; }
  }
`;

const BootLogoContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 5;
  margin-bottom: 30px;
`;

const BootTextVal = styled(motion.p)`
  color: #f97316;
  font-family: 'Exo 2', monospace;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 15px;
  text-shadow: 0 0 10px rgba(249, 115, 22, 0.4);
`;

const ProgressBarContainer = styled.div`
  width: 240px;
  height: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(249, 115, 22, 0.15);
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.1);
  z-index: 5;
`;

const ProgressBarFillVal = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #f97316);
  box-shadow: 0 0 15px #f97316;
  border-radius: 10px;
`;

const scanline = keyframes` 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } `;
const ScanlineEffect = styled.div` position: absolute; top: 0; left: 0; width: 100%; height: 10px; background: rgba(249, 115, 22, 0.15); box-shadow: 0 0 20px rgba(249, 115, 22, 0.3); animation: ${scanline} 3.5s linear infinite; pointer-events: none; z-index: 3; `;

const StatusBar = styled.div`
  background: rgba(2, 6, 23, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding: 12px 15px; position: sticky; top: 0; z-index: 50; box-shadow: 0 10px 20px rgba(0,0,0,0.5); display: flex; flex-direction: column;
`;

const HPBarContainer = styled.div` display: flex; align-items: center; gap: 8px; margin-bottom: 12px; width: 100%; `;
const HPBarWrapper = styled.div` flex: 1; height: 8px; background: rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden; position: relative; border: 1px solid rgba(255,255,255,0.1); box-shadow: inset 0 0 5px rgba(0,0,0,0.5); `;
const HPBarFill = styled(motion.div)<{ $hpPercent: number; $hp: number; }>` 
  height: 100%; background: ${(props) => props.$hp > 50 ? 'linear-gradient(90deg, #059669, #10b981)' : props.$hp > 20 ? 'linear-gradient(90deg, #d97706, #eab308)' : 'linear-gradient(90deg, #991b1b, #ef4444)'}; width: ${(props) => props.$hpPercent}%; position: relative; overflow: hidden; box-shadow: 0 0 10px ${(props) => props.$hp > 50 ? 'rgba(16, 185, 129, 0.6)' : props.$hp > 20 ? 'rgba(234, 179, 8, 0.6)' : 'rgba(239, 68, 68, 0.6)'};
`;
const HPText = styled.span<{ $hp: number }>` font-size: 11px; font-weight: 900; color: ${(props) => props.$hp > 50 ? '#10b981' : props.$hp > 20 ? '#eab308' : '#ef4444'}; text-shadow: 0 0 5px currentColor; `;

const PlayerInfoRow = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 8px; `;
const ClassBadge = styled.div` display: flex; align-items: center; flex: 1; min-width: 0; `;

const HexagonBox = styled.button<{ $color: string; }>` 
  width: 42px; height: 42px; position: relative; display: flex; align-items: center; justify-content: center; background: ${(props) => props.$color}15; border: 1.5px solid ${(props) => props.$color}; border-radius: 8px; cursor: pointer; outline: none; flex-shrink: 0; color: ${(props) => props.$color}; box-shadow: inset 0 0 10px ${(props) => props.$color}40;
  &:active { transform: scale(0.95); } 
  svg { filter: drop-shadow(0 0 2px rgba(255,255,255,0.5)); width: 20px; height: 20px; }
`;

const PlayerDetails = styled.div` display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; margin-left: 10px; `;
const PlayerNameRow = styled.div` display: flex; align-items: center; gap: 6px; width: 100%; `;
const SystemLinkText = styled.div` font-size: 8px; color: #f97316; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; `;
const NameText = styled.div` font-size: 15px; font-weight: 900; text-transform: uppercase; color: #fff; text-shadow: 0 2px 5px rgba(0,0,0,0.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px; `;
const PlayerTitleText = styled.div` font-size: 10px; color: #94a3b8; font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; `;
const StreakBadge = styled(motion.div)<{ $color: string }>` display: flex; align-items: center; background: linear-gradient(135deg, ${(props) => props.$color}15 0%, transparent 100%); border: 1px solid ${(props) => props.$color}; padding: 2px 6px; border-radius: 6px; flex-shrink: 0; box-shadow: 0 0 10px ${(props) => props.$color}30; svg { width: 10px; height: 10px; } span { font-size: 11px; } `;

const GoldBadge = styled.div` 
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(202, 138, 4, 0.2) 100%); border: 1px solid #eab308; color: #fef08a; padding: 6px 12px; border-radius: 10px; font-weight: 900; display: flex; align-items: center; gap: 5px; flex-shrink: 0; box-shadow: 0 0 10px rgba(234, 179, 8, 0.2);
  img { width: 14px; } span { font-size: 14px; }
`;

const EXPBarContainer = styled.div` display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: bold; `;
const EXPBarWrapper = styled.div` flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden; position: relative; `;
const EXPBarFill = styled(motion.div)<{ $progress: number; }>` height: 100%; background: linear-gradient(90deg, #ea580c, #f97316); width: ${(props) => props.$progress}%; position: relative; overflow: hidden; box-shadow: 0 0 10px rgba(249, 115, 22, 0.5); `;

const NavigationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 10px 15px;
  background: rgba(20, 18, 16, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  margin-bottom: 10px;
  position: relative;
  z-index: 40;
`;

const NavButton = styled(motion.button)<{ $active: boolean; $color: string; }>`
  background: ${(props) => props.$active ? `linear-gradient(180deg, ${props.$color}20 0%, rgba(2,6,23,0.8) 100%)` : 'rgba(2, 6, 23, 0.6)'};
  border: 1px solid ${(props) => (props.$active ? props.$color : 'rgba(255,255,255,0.05)')};
  color: ${(props) => props.$active ? '#fff' : '#64748b'};
  padding: 8px 4px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: 'Exo 2', sans-serif;
  font-size: 9px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: ${(props) => props.$active ? `0 0 10px ${props.$color}30` : 'none'};
  svg { filter: ${(props) => props.$active ? `drop-shadow(0 0 2px ${props.$color})` : 'none'}; transition: 0.3s; width: 22px; height: 22px; }
  &:hover { color: #fff; border-color: ${(props) => props.$color}; }
`;

// Winner Modal Premium Styling
const WinnerContent = styled(motion.div)`
  background: linear-gradient(135deg, #1c1917 0%, #1e1b4b 100%);
  border: 2px solid #eab308;
  border-radius: 24px;
  padding: 30px;
  width: 100%;
  max-width: 420px;
  position: relative;
  text-align: center;
  box-shadow: 0 0 45px rgba(234, 179, 8, 0.35), inset 0 0 25px rgba(234, 179, 8, 0.1);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, transparent, #eab308, transparent);
  }
`;

const WinnerTitleText = styled.h2`
  color: #eab308;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 15px 0 5px 0;
  text-shadow: 0 0 15px rgba(234, 179, 8, 0.4);
`;

const WinnerSubtitleText = styled.div`
  font-size: 11px;
  color: #94a3b8;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 20px;
`;

const ChampionBox = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border: 1.5px solid rgba(234, 179, 8, 0.25);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 25px;
  position: relative;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.6);
`;

const ChampName = styled.div`
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 1.5px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
`;

const PrizeText = styled.div`
  font-size: 13px;
  color: #fef08a;
  font-weight: bold;
  margin-top: 8px;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
`;

const ActionBtn = styled.button<{ $color: string }>`
  width: 100%;
  padding: 14px;
  background: ${props => props.$color};
  color: #000;
  border: none;
  border-radius: 12px;
  font-family: 'Exo 2', sans-serif;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 0 12px ${props => props.$color}40;
  
  &:hover {
    filter: brightness(1.2);
    transform: translateY(-2px);
  }
`;

const TopRightControls = styled.div` display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 10px; width: 100%; `;
const IconButton = styled.button<{ $hasUnread?: boolean }>` background: rgba(0,0,0,0.5); border: 1px solid #334155; color: ${(props) => props.$hasUnread ? '#f97316' : '#94a3b8'}; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; position: relative; box-shadow: ${(props) => props.$hasUnread ? '0 0 10px rgba(249, 115, 22,0.3)' : 'none'}; &:hover { color: #f97316; border-color: #f97316; background: rgba(249, 115, 22,0.1); } svg { width: 16px; height: 16px; } `;
const UnreadDot = styled.div` position: absolute; top: -4px; right: -4px; background: #ef4444; color: #fff; font-size: 9px; font-weight: bold; padding: 2px 4px; border-radius: 10px; box-shadow: 0 0 8px #ef4444; `;
const HeartIcon = ({ size, color }: { size: number; color: string }) => ( <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> );

const ModalOverlay = styled(motion.div)` position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 15px; backdrop-filter: blur(8px); `;
const ModalContent = styled(motion.div)` background: #0b1120; border: 2px solid #f97316; border-radius: 16px; padding: 20px; width: 100%; max-width: 400px; position: relative; max-height: 80vh; overflow-y: auto; box-shadow: 0 0 30px rgba(249, 115, 22,0.2); &::-webkit-scrollbar { width: 4px; } &::-webkit-scrollbar-thumb { background: #f97316; border-radius: 4px; } `;
const NotificationCard = styled.div<{ $type: string }>` background: #1c1917; border-left: 3px solid ${(props) => props.$type === 'broadcast' ? '#f59e0b' : props.$type === 'penalty' ? '#ef4444' : '#10b981'}; padding: 12px; border-radius: 8px; margin-bottom: 10px; display: flex; gap: 10px; `;

// ==========================================
// 4. MAIN APP COMPONENT
// ==========================================
const App = () => {
  const SYSTEM_VERSION = "1.0.6"; 

  const [player, setPlayer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBooting, setIsBooting] = useState(false);
  const [bootText, setBootText] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

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
      let step = 0; const bootInterval = setInterval(() => { if (step < bootSequenceText.length) { setBootText(bootSequenceText[step]); step++; } else { clearInterval(bootInterval); } }, 400);
      const fetchLatestData = async () => {
        try {
          if (!navigator.onLine) { setPlayer(parsedData); return; }
          const { data, error } = await supabase.from('elite_players').select('*').eq('name', parsedData.name).single();
          if (data && !error) {
            const updatedPlayer = { ...parsedData, ...data }; setPlayer(updatedPlayer); localStorage.setItem('elite_system_active_session', JSON.stringify(updatedPlayer));
            let lastMacroDate = data.last_macro_date; const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
            if (lastMacroDate && lastMacroDate !== todayStr) {
               // NON-BLOCKING ASYNC: حفظ اللقطة وتحديث الماكروز في الخلفية لتفادي تعطل تشغيل التطبيق
               supabase.from('player_snapshots').insert([{ player_name: updatedPlayer.name, snapshot_date: lastMacroDate, xp: data.cumulative_xp || data.xp || 0, gold: data.gold || 0, hp: data.hp || 100 }]).then(({ error }) => { if (error) console.error("Snapshot error:", error); });
               let fetchedMacros = { protein: 0, carbs: 0, fats: 0, calories: 0, log: [] }; 
               supabase.from('elite_players').update({ daily_macros: fetchedMacros, last_macro_date: todayStr }).eq('name', updatedPlayer.name).then(({ error }) => { if (error) console.error("Macro reset error:", error); });
            }
          } else { setPlayer(parsedData); }
        } catch (err) { console.error("Sync error", err); setPlayer(parsedData); } finally { setTimeout(() => { setIsBooting(false); playSound('startup'); }, 2500); }
      }; fetchLatestData();
    }
  }, []);

  useEffect(() => {
    if (!isBooting && player) {
      const now = new Date();
      const popupStart = new Date('2026-06-05T00:00:00');
      const popupEnd = new Date('2026-06-12T23:59:59');
      if (now >= popupStart && now <= popupEnd) {
        const hasSeen = localStorage.getItem('elite_seen_winner_june_2026');
        if (!hasSeen) {
          setShowWinnerModal(true);
        }
      }
    }
  }, [isBooting, player]);

  useEffect(() => {
    if (!player || isBooting || isOffline) return;
    const fetchInitialNotifications = async () => {
      try {
        const { data } = await supabase.from('global_news').select('*').neq('type', 'system_settings').order('created_at', { ascending: false }).limit(10);
        if (data) { const formatted = data.map((n: any) => ({ id: n.id, title: n.title, msg: n.content, time: new Date(n.created_at).toLocaleString(), type: 'broadcast', read: true })); setNotifications(formatted); }
      } catch (err) { console.error(err); }
    }; fetchInitialNotifications();
    
    // 🚨 الحل الجذري لمشكلة الشاشة البيضاء في الموبايل: إنشاء قنوات فريدة تماماً 🚨
    const uniqueId = Date.now();
    const newsChannelName = `app_news_${uniqueId}`;
    const questsChannelName = `app_quests_${uniqueId}`;
    const playerChannelName = `app_player_${uniqueId}`;

    const newsSub = supabase.channel(newsChannelName).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_news' }, payload => { 
      if (payload.new.type !== 'system_settings') {
        const newNotif = { id: payload.new.id, title: payload.new.title, msg: payload.new.content, time: new Date(payload.new.created_at).toLocaleTimeString(), type: 'broadcast', read: false }; 
        setNotifications(prev => [newNotif, ...prev]); 
        playSound('notification'); 
        toast(payload.new.title, { description: payload.new.content, style: { background: '#0c0a09', border: '1px solid #f59e0b', color: '#f59e0b' } }); 
      }
    }).subscribe();
    
    const questSub = supabase.channel(questsChannelName).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'elite_quests', filter: `player_name=eq.${player.name}` }, payload => { if (payload.new.status !== payload.old.status) { if (payload.new.status === 'approved') { const newNotif = { id: payload.new.id, title: 'REQUEST APPROVED', msg: `Coach has approved your request: ${payload.new.task_name}. Rewards granted!`, time: new Date().toLocaleTimeString(), type: 'success', read: false }; setNotifications(prev => [newNotif, ...prev]); playSound('startup'); toast.success('REQUEST APPROVED!', { description: payload.new.task_name, style: { background: '#022c22', border: '1px solid #10b981', color: '#10b981' } }); } else if (payload.new.status === 'rejected') { const newNotif = { id: payload.new.id, title: 'REQUEST REJECTED', msg: `Coach rejected your request: ${payload.new.task_name}.`, time: new Date().toLocaleTimeString(), type: 'penalty', read: false }; setNotifications(prev => [newNotif, ...prev]); playSound('error'); toast.error('REQUEST REJECTED', { description: payload.new.task_name, style: { background: '#2a0808', border: '1px solid #ef4444', color: '#ef4444' } }); } } }).subscribe();
    
    const playerSub = supabase.channel(playerChannelName).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'elite_players', filter: `name=eq.${player.name}` }, payload => { if (payload.new.active_penalty && !payload.old.active_penalty) { playSound('error'); toast.error('SYSTEM PENALTY ACTIVATED', { description: 'The Punisher has frozen your account. Execute Disciplinary Quest.', duration: 8000, style: { background: '#450a0a', border: '2px solid #ef4444', color: '#fca5a5', fontWeight: 'bold' } }); } }).subscribe();
    
    // 🚨 التأكد من الإغلاق النظيف للقنوات لمنع تراكمها في الخلفية 🚨
    return () => { 
      supabase.removeChannel(newsSub); 
      supabase.removeChannel(questSub); 
      supabase.removeChannel(playerSub); 
    };
  }, [player, isBooting, isOffline]);

  useEffect(() => { if (player && !isBooting) { localStorage.setItem('elite_system_active_session', JSON.stringify(player)); } }, [player, isBooting]);
  const handleAwaken = (playerData: any) => { setPlayer(playerData); setIsBooting(true); playSound('boot'); setTimeout(() => { setIsBooting(false); playSound('startup'); }, 2000); };
  const handleLogout = () => { playSound('click'); localStorage.removeItem('elite_system_active_session'); localStorage.removeItem('elite_coach_mode'); setPlayer(null); };

  const handleTabChange = (tabId: string) => {
    if (tabId === 'rank' || tabId === 'profile') playSound('shield');
    else if (tabId === 'records' || tabId === 'rehab') playAuraSound(player);
    else playSound('click');
    
    
    
    setActiveTab(tabId);
  };

  const openNotificationCenter = () => { playSound('click'); setShowNotifications(true); setNotifications(prev => prev.map(n => ({ ...n, read: true }))); };

  const gearBonuses = React.useMemo(() => {
     let bonusGold = 0; let bonusHp = 0; let bonusMaxHp = 0; let healOnLevelUp = false;
     if (!player) return { bonusGold, bonusHp, bonusMaxHp, healOnLevelUp };
     const equipped = player.equipped_gear;
     if (!equipped) return { bonusGold, bonusHp, bonusMaxHp, healOnLevelUp };
     const parseStat = (statStr: string) => {
       if (!statStr) return;
       if (statStr.includes('+5 Gold')) bonusGold += 5;
       if (statStr.includes('+10 Gold')) bonusGold += 10;
       if (statStr.includes('+15 Gold')) bonusGold += 15;
       if (statStr.includes('+20 Gold')) bonusGold += 20;
       if (statStr.includes('+30 Gold')) bonusGold += 30;
       if (statStr.includes('+2 HP')) bonusHp += 2;
       if (statStr.includes('+10 Max HP')) bonusMaxHp += 10;
       if (statStr.includes('+25 Max HP')) bonusMaxHp += 25;
       if (statStr.includes('+40 Max HP')) bonusMaxHp += 40;
       if (statStr.includes('+50 Max HP')) bonusMaxHp += 50;
       if (statStr.includes('Heal 100% on Level Up')) healOnLevelUp = true;
       if (statStr.includes('+10 HP & +5G')) { bonusMaxHp += 10; bonusGold += 5; }
     };
     if (equipped.weapon) parseStat(equipped.weapon.stat);
     if (equipped.armor) parseStat(equipped.armor.stat);
     if (equipped.artifact) parseStat(equipped.artifact.stat);
     return { bonusGold, bonusHp, bonusMaxHp, healOnLevelUp };
  }, [player?.equipped_gear]);

  if (!player) return <AwakeningScreen onAwaken={handleAwaken} />;

  if (isBooting) {
    return (
      <BootScreen initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.5 } }}>
        <HUDGrid />
        <GlowOrb />
        <ScanlineEffect />
        <BootLogoContainer
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(249, 115, 22, 0.05)', border: '2px solid #f97316', borderRadius: '50%', padding: '20px', boxShadow: '0 0 30px rgba(249, 115, 22, 0.2), inset 0 0 20px rgba(249, 115, 22, 0.1)' }}
          >
            <Terminal size={40} color="#f97316" />
          </motion.div>
          <h2 style={{ color: '#fff', letterSpacing: '4px', marginTop: 20, fontSize: 18, fontWeight: 900, textTransform: 'uppercase', textShadow: '0 0 10px rgba(249, 115, 22, 0.3)' }}>ELITE MAINFRAME</h2>
          <BootTextVal
            key={bootText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {bootText || "INITIALIZING LINK..."}
          </BootTextVal>
        </BootLogoContainer>
        
        <ProgressBarContainer>
          <ProgressBarFillVal 
            initial={{ width: 0 }} 
            animate={{ width: '100%' }} 
            transition={{ duration: 2.2, ease: 'easeInOut' }} 
          />
        </ProgressBarContainer>
      </BootScreen>
    );
  }

  const activeXp = (player.cumulative_xp ?? 0) - (player.cumulative_xp_offset ?? 0);
  const levelData = calculateLevelData(activeXp);
  const currentLvl = levelData.level;
  const currentVisualXp = levelData.xpInCurrentLevel;
  const xpNeededForNextLevel = levelData.expNeededForNextLevel;
  const progressPercent = Math.min(100, (currentVisualXp / xpNeededForNextLevel) * 100);

  const MAX_HP = 100 + gearBonuses.bonusMaxHp;
  const hp = player.hp ?? 100;
  const hpPercent = Math.min(100, (hp / MAX_HP) * 100);

  const auraColor = getIconColor(player);
  const currentStreak = player.streak || 0;
  const streakColor = getStreakColor(currentStreak);
  const activePetName = player?.active_pet || null;
  const petData = activePetName ? PETS_DATABASE.find(p => p.name === activePetName) : null;
  const isPetDead = player?.pet_hunger <= 0;

  const TABS = [
    { id: 'dashboard', label: 'QUESTS', icon: LayoutDashboard, color: '#f97316' },
    { id: 'records', label: 'RECORDS', icon: Trophy, color: '#facc15' },
    { id: 'shop', label: 'SHOP', icon: Store, color: '#eab308' },
    { id: 'rank', label: 'RANK', icon: Target, color: '#f59e0b' },
    { id: 'profile', label: 'PROFILE', icon: User, color: '#ec4899' },
    { id: 'rules', label: 'RULES', icon: Book, color: '#f43f5e' },
    { id: 'rehab', label: 'CLINIC', icon: Activity, color: '#10b981' },
    ...(isCoachMode ? [{ id: 'coach', label: 'COMMAND', icon: Settings, color: '#ef4444' }] : []),
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
          
          <IconButton onClick={openNotificationCenter} $hasUnread={unreadCount > 0} title="Notifications" style={{ display: 'none' }}>
            <Bell size={16} />
            {unreadCount > 0 && <UnreadDot>{unreadCount}</UnreadDot>}
          </IconButton>
          <IconButton onClick={handleLogout} title="System Logout"><Power size={16} /></IconButton>
        </TopRightControls>

        <HPBarContainer>
          <HeartIcon size={14} color={hp > 50 ? '#10b981' : hp > 20 ? '#eab308' : '#ef4444'} />
          <HPBarWrapper>
            <HPBarFill $hpPercent={hpPercent} $hp={hp} initial={{ width: 0 }} animate={{ width: `${hpPercent}%` }} transition={{ duration: 1.5, type: 'spring' }} />
          </HPBarWrapper>
          <HPText $hp={hp}>{hp} / {MAX_HP} HP</HPText>
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
                  <StreakBadge $color={streakColor} title={`${currentStreak} Days Streak!`} whileHover={{ scale: 1.05 }}>
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
          <span style={{ color: '#f97316', fontWeight: '900', letterSpacing: '1px' }}>EXP</span>
          <EXPBarWrapper>
            <EXPBarFill $progress={progressPercent} initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
          </EXPBarWrapper>
          <span style={{ color: '#f97316', fontWeight: 'bold' }}>{currentVisualXp} / {xpNeededForNextLevel}</span>
        </EXPBarContainer>
      </StatusBar>

      <NavigationGrid>
        {TABS.map((tab) => {
          const IconComponent = tab.icon;
          return (
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
              
              <motion.div style={{ width: '22px', height: '22px', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1, filter: activeTab === tab.id ? `drop-shadow(0 0 5px ${tab.color})` : 'none' }}>
                <IconComponent />
              </motion.div>

              <span>{tab.label}</span>
            </NavButton>
          )
        })}
      </NavigationGrid>

      <ContentWrapper>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial="initial" animate="in" exit="out" variants={pageVariants}>
            {activeTab === 'dashboard' && <Dashboard player={player} setPlayer={setPlayer} />}
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

      <AnimatePresence>
        {showWinnerModal && createPortal(
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ zIndex: 10000 }}>
            <WinnerContent initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", damping: 15 }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}>
                  <Trophy size={64} color="#eab308" style={{ filter: 'drop-shadow(0 0 15px rgba(234, 179, 8, 0.6))' }} />
                </motion.div>
              </div>
              <WinnerTitleText>🏆 بطل الشهر الماضي 🏆</WinnerTitleText>
              <WinnerSubtitleText>LAST MONTH'S CHAMPION</WinnerSubtitleText>
              
              <ChampionBox>
                <ChampName>RAYAN</ChampName>
                <PrizeText>
                  <Zap size={14} color="#fef08a" />
                  فاز بـ: EAA + ELECTROLYTES 30 SCOOPS
                </PrizeText>
              </ChampionBox>

              <ActionBtn $color="#eab308" onClick={() => { playSound('click'); localStorage.setItem('elite_seen_winner_june_2026', 'true'); setShowWinnerModal(false); }}>
                المتابعة إلى النظام <ArrowRight size={16} />
              </ActionBtn>
            </WinnerContent>
          </ModalOverlay>,
          document.body
        )}
      </AnimatePresence>
    </AppContainer>
  );
};

export default App;