import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sword, LogOut, CheckSquare, Medal, ShoppingCart, Store as Storefront, Shield, User,
  Book, Activity, Moon, Eye, Wind, Dumbbell, Zap, Footprints, Lock as LockIcon, Flame,
  Crown, Skull, Target, Heart, Droplet, Axe, Anchor, Fingerprint, Cpu, Infinity as InfinityIcon,
  Hexagon, Globe, Terminal, Power, Bell, X, MessageSquare, WifiOff, Volume2, VolumeX
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Howl, Howler } from 'howler';

import AwakeningScreen from './components/AwakeningScreen';
import Dashboard from './components/Dashboard';
import Rank from './components/Rank';
import Shop from './components/Shop';
import Store from './components/Store';
import Profile from './components/Profile';
import Records from './components/Records';
import Rules from './components/Rules';
import Rehab from './components/Rehab';
import Radar from './components/Radar';
import { supabase } from './lib/supabase';

// ==========================================
// 1. ADVANCED AUDIO ENGINE (Howler + Web Audio)
// ==========================================
const bgmMain = new Howl({
  src: ['https://actions.google.com/sounds/v1/science_fiction/dark_ambient_loop.ogg'],
  loop: true,
  volume: 0.15,
});

const bgmShop = new Howl({
  src: ['https://actions.google.com/sounds/v1/science_fiction/cyberpunk_city.ogg'],
  loop: true,
  volume: 0.15,
});

let currentBGM = bgmMain;

const createAudioContext = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return null;
  return new AudioContext();
};

let sharedAudioCtx: AudioContext | null = null;
let lastPlayTime = 0;

const canPlay = () => {
  const now = Date.now();
  if (now - lastPlayTime < 50) return false;
  lastPlayTime = now;
  return true;
};

const playSound = (type: 'shield' | 'click' | 'startup' | 'boot' | 'glitch' | 'notification') => {
  try {
    if (!canPlay()) return;
    if (!sharedAudioCtx) sharedAudioCtx = createAudioContext();
    if (!sharedAudioCtx) return;
    if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume();
    
    const ctx = sharedAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'shield') {
      osc.type = 'square'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
      gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(); osc.stop(now + 0.3);
    } else if (type === 'click') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now); osc.frequency.exponentialRampToValueAtTime(1600, now + 0.05);
      gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(); osc.stop(now + 0.05);
    } else if (type === 'startup') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(200, now); osc.frequency.linearRampToValueAtTime(600, now + 0.5); osc.frequency.linearRampToValueAtTime(1000, now + 0.8);
      gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.3, now + 0.5); gain.gain.linearRampToValueAtTime(0.01, now + 1);
      osc.start(); osc.stop(now + 1);
    } else if (type === 'boot') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(50, now); osc.frequency.exponentialRampToValueAtTime(400, now + 1.5);
      gain.gain.setValueAtTime(0.01, now); gain.gain.linearRampToValueAtTime(0.2, now + 1); gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
      osc.start(); osc.stop(now + 1.5);
    } else if (type === 'glitch') {
      osc.type = 'square'; osc.frequency.setValueAtTime(Math.random() * 1000 + 200, now);
      gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(); osc.stop(now + 0.1);
    } else if (type === 'notification') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.setValueAtTime(1200, now + 0.1);
      gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(); osc.stop(now + 0.3);
    }
  } catch (e) {}
};

const playAuraSound = (hunter: any) => {
  try {
    if (!sharedAudioCtx) sharedAudioCtx = createAudioContext();
    if (!sharedAudioCtx) return;
    const iconStr = String(hunter?.selectedIcon || hunter?.selected_icon || hunter?.icon || hunter?.class || '').toLowerCase().trim();
    const ctx = sharedAudioCtx;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (['sword', 'shield', 'target', 'crosshair', 'axe', 'dumbbell'].some(k => iconStr.includes(k))) {
      osc1.type = 'sawtooth'; osc2.type = 'square';
      osc1.frequency.setValueAtTime(400, ctx.currentTime); osc1.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
      osc2.frequency.setValueAtTime(405, ctx.currentTime); osc2.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc1.start(); osc2.start(); osc1.stop(ctx.currentTime + 0.3); osc2.stop(ctx.currentTime + 0.3);
    } else if (['flame', 'zap', 'star', 'crown'].some(k => iconStr.includes(k))) {
      osc1.type = 'square'; osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(1000, ctx.currentTime); osc1.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4);
      osc2.frequency.setValueAtTime(1500, ctx.currentTime); osc2.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.4);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc1.start(); osc2.start(); osc1.stop(ctx.currentTime + 0.4); osc2.stop(ctx.currentTime + 0.4);
    } else {
      osc1.type = 'sine'; osc2.type = 'sine';
      osc1.frequency.setValueAtTime(300, ctx.currentTime); osc1.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
      osc2.frequency.setValueAtTime(600, ctx.currentTime); osc2.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.5);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc1.start(); osc2.start(); osc1.stop(ctx.currentTime + 0.5); osc2.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {}
};

// ==========================================
// 2. ICONS & SYSTEM UTILS
// ==========================================
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

// ==========================================
// 3. EPIC STYLED COMPONENTS 🎨
// ==========================================
const panBackground = keyframes`
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: radial-gradient(circle at top right, #0f172a, #020617 70%);
  color: #fff;
  font-family: 'Oxanium', sans-serif;
  overflow-x: hidden;
  position: relative;
`;

const BackgroundGrid = styled.div`
  position: fixed;
  inset: 0;
  background-image: 
    linear-gradient(rgba(0, 242, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 242, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: ${panBackground} 60s linear infinite;
  pointer-events: none;
  z-index: 0;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 10;
  padding-bottom: 50px;
`;

const BootScreen = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: #020617;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  font-family: 'Courier New', Courier, monospace;
`;

const scanline = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
`;

const ScanlineEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 10px;
  background: rgba(0, 242, 255, 0.3);
  box-shadow: 0 0 20px rgba(0, 242, 255, 0.5);
  animation: ${scanline} 3s linear infinite;
  pointer-events: none;
`;

const StatusBar = styled.div`
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 20px;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
`;

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 5px currentColor; }
  50% { box-shadow: 0 0 15px currentColor; }
  100% { box-shadow: 0 0 5px currentColor; }
`;

const HPBarContainer = styled.div` display: flex; align-items: center; gap: 12px; margin-bottom: 20px; width: 100%; `;
const HPBarWrapper = styled.div` flex: 1; height: 8px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; position: relative; border: 1px solid rgba(255,255,255,0.1); `;
const HPBarFill = styled(motion.div)<{ $hp: number; }>` 
  height: 100%; 
  background: ${(props) => props.$hp > 50 ? 'linear-gradient(90deg, #059669, #10b981)' : props.$hp > 20 ? 'linear-gradient(90deg, #d97706, #eab308)' : 'linear-gradient(90deg, #991b1b, #ef4444)'}; 
  width: ${(props) => props.$hp}%; 
  color: ${(props) => props.$hp > 50 ? '#10b981' : props.$hp > 20 ? '#eab308' : '#ef4444'};
  animation: ${pulseGlow} 2s infinite;
`;

const PlayerInfoRow = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; `;
const ClassBadge = styled.div` display: flex; align-items: center; gap: 15px; `;

const rotateHex = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const HexagonBox = styled(motion.button)<{ $color: string; }>` 
  width: 55px; 
  height: 55px; 
  position: relative;
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background: transparent;
  border: none;
  cursor: pointer; 
  outline: none;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${(props) => props.$color}20;
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    border: 2px solid ${(props) => props.$color};
    animation: ${rotateHex} 10s linear infinite;
    box-shadow: 0 0 20px ${(props) => props.$color}40;
    transition: 0.3s;
  }
  
  &:active { transform: scale(0.9); } 
  svg { position: relative; z-index: 2; }
`;

const PlayerDetails = styled.div` display: flex; flex-direction: column; gap: 4px; `;
const GoldBadge = styled.div` 
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(202, 138, 4, 0.2) 100%); 
  border: 1px solid #eab308; 
  color: #fef08a; 
  padding: 10px 18px; 
  border-radius: 12px; 
  font-weight: 900; 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  box-shadow: 0 0 20px rgba(234, 179, 8, 0.2);
  text-shadow: 0 0 10px rgba(234, 179, 8, 0.8);
`;

const EXPBarContainer = styled.div` display: flex; align-items: center; gap: 12px; font-size: 13px; font-weight: bold; `;
const EXPBarWrapper = styled.div` flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; position: relative; `;
const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;
const EXPBarFill = styled(motion.div)<{ $progress: number; }>` 
  height: 100%; 
  background: linear-gradient(90deg, #0284c7, #00f2ff); 
  width: ${(props) => props.$progress}%; 
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.5);

  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; bottom: 0; right: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: ${shimmer} 2s infinite;
  }
`;

const NavigationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 15px;
  background: rgba(11, 17, 32, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  margin-bottom: 15px;
  position: relative;
  z-index: 40;
`;

const NavButton = styled(motion.button)<{ $active: boolean; $color: string; }>`
  background: ${(props) => props.$active ? `${props.$color}15` : 'rgba(2, 6, 23, 0.6)'};
  border: 1px solid ${(props) => (props.$active ? props.$color : 'rgba(255,255,255,0.05)')};
  color: ${(props) => props.$active ? props.$color : '#64748b'};
  padding: 15px 5px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Oxanium', sans-serif;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${(props) => props.$active ? `0 0 15px ${props.$color}30, inset 0 0 10px ${props.$color}10` : 'none'};
  
  &:hover {
    border-color: ${(props) => props.$color};
    color: ${(props) => props.$color};
    background: rgba(255,255,255,0.05);
  }
`;

// 🚨 تحديث ترتيب أزرار الكنترول عشان ميبقاش فوق ה-HP 🚨
const TopRightControls = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-bottom: 15px;
  width: 100%;
`;

const IconButton = styled.button<{ $hasUnread?: boolean }>`
  background: rgba(0,0,0,0.5);
  border: 1px solid #334155;
  color: ${(props) => props.$hasUnread ? '#00f2ff' : '#94a3b8'};
  width: 40px; height: 40px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: 0.3s;
  position: relative;
  box-shadow: ${(props) => props.$hasUnread ? '0 0 15px rgba(0,242,255,0.3)' : 'none'};
  
  &:hover { color: #00f2ff; border-color: #00f2ff; background: rgba(0,242,255,0.1); }
`;

const UnreadDot = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  box-shadow: 0 0 10px #ef4444;
`;

const HeartIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
);

const ModalOverlay = styled(motion.div)`
  position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(8px);
`;

const ModalContent = styled(motion.div)`
  background: #0b1120; border: 2px solid #00f2ff; border-radius: 20px; padding: 25px; width: 100%; max-width: 450px; position: relative; max-height: 80vh; overflow-y: auto; box-shadow: 0 0 40px rgba(0,242,255,0.2);
  &::-webkit-scrollbar { width: 5px; } &::-webkit-scrollbar-thumb { background: #00f2ff; border-radius: 5px; }
`;

const NotificationCard = styled.div<{ $type: string }>`
  background: #0f172a; border-left: 4px solid ${(props) => props.$type === 'broadcast' ? '#0ea5e9' : props.$type === 'penalty' ? '#ef4444' : '#10b981'}; padding: 15px; border-radius: 8px; margin-bottom: 12px; display: flex; gap: 12px;
`;

// ==========================================
// 4. MAIN APP COMPONENT
// ==========================================
const App = () => {
  const [player, setPlayer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBooting, setIsBooting] = useState(false);
  const [bootText, setBootText] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // 🚨 BGM Controls 🚨
  const [isMusicMuted, setIsMusicMuted] = useState(false);

  // 🚨 Notifications State 🚨
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const bootSequenceText = [
    "INITIALIZING NEURAL LINK...",
    "DECRYPTING HUNTER PROFILE...",
    "SYNCING WITH ELITE_PLAYERS MAINFRAME...",
    "CALIBRATING CUMULATIVE EXP MATRIX...",
    "WELCOME TO THE ELITE SYSTEM."
  ];

  useEffect(() => {
    Howler.mute(isMusicMuted);
  }, [isMusicMuted]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('SYSTEM ONLINE: Neural Link Restored.', { style: { background: '#022c22', border: '1px solid #10b981', color: '#10b981' } });
    };
    const handleOffline = () => {
      setIsOffline(true);
      toast.error('SYSTEM OFFLINE: Operating on Local Cache.', { duration: 10000, style: { background: '#2a0808', border: '1px solid #ef4444', color: '#fca5a5' } });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem('elite_system_active_session');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setIsBooting(true);
      playSound('boot');
      
      let step = 0;
      const bootInterval = setInterval(() => {
        if (step < bootSequenceText.length) {
          setBootText(bootSequenceText[step]);
          playSound('glitch');
          step++;
        } else {
          clearInterval(bootInterval);
        }
      }, 400);

      const fetchLatestData = async () => {
        try {
          if (!navigator.onLine) {
            setPlayer(parsedData);
            return;
          }
          const { data, error } = await supabase.from('elite_players').select('*').eq('name', parsedData.name).single();
          if (data && !error) {
            const updatedPlayer = { ...parsedData, ...data };
            setPlayer(updatedPlayer);
            localStorage.setItem('elite_system_active_session', JSON.stringify(updatedPlayer));

            let lastMacroDate = data.last_macro_date;
            const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
            if (lastMacroDate && lastMacroDate !== todayStr) {
               await supabase.from('player_snapshots').insert([{
                 player_name: updatedPlayer.name,
                 snapshot_date: lastMacroDate,
                 xp: data.cumulative_xp || data.xp || 0,
                 gold: data.gold || 0,
                 hp: data.hp || 100
               }]);
               
               let fetchedMacros = { protein: 0, carbs: 0, fats: 0, calories: 0, log: [] };
               await supabase.from('elite_players').update({ 
                 daily_macros: fetchedMacros, 
                 last_macro_date: todayStr 
               }).eq('name', updatedPlayer.name);
            }

          } else {
            setPlayer(parsedData);
          }
        } catch (err) { 
          console.error("Sync error", err);
          setPlayer(parsedData);
        } finally {
          setTimeout(() => {
            setIsBooting(false);
            playSound('startup');
            
            if (!bgmMain.playing()) {
              bgmMain.play();
            }
          }, 2500); 
        }
      };
      
      fetchLatestData();
    }
  }, []);

  // REAL-TIME SUBSCRIPTIONS
  useEffect(() => {
    if (!player || isBooting || isOffline) return;

    const fetchInitialNotifications = async () => {
      try {
        const { data } = await supabase.from('global_news').select('*').order('created_at', { ascending: false }).limit(10);
        if (data) {
          const formatted = data.map((n: any) => ({
            id: n.id, title: n.title, msg: n.content, time: new Date(n.created_at).toLocaleString(), type: 'broadcast', read: true
          }));
          setNotifications(formatted);
        }
      } catch (err) { console.error(err); }
    };
    fetchInitialNotifications();

    const newsSub = supabase.channel('public:global_news')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_news' }, payload => {
        const newNotif = { 
          id: payload.new.id, title: payload.new.title, msg: payload.new.content, 
          time: new Date(payload.new.created_at).toLocaleTimeString(), type: 'broadcast', read: false 
        };
        setNotifications(prev => [newNotif, ...prev]);
        playSound('notification');
        toast(payload.new.title, { description: payload.new.content, style: { background: '#020617', border: '1px solid #0ea5e9', color: '#0ea5e9' } });
      }).subscribe();

    const questSub = supabase.channel('public:elite_quests')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'elite_quests', filter: `player_name=eq.${player.name}` }, payload => {
        if (payload.new.status !== payload.old.status) {
          if (payload.new.status === 'approved') {
            const newNotif = { 
              id: payload.new.id, title: 'REQUEST APPROVED', msg: `Coach has approved your request: ${payload.new.task_name}. Rewards granted!`, 
              time: new Date().toLocaleTimeString(), type: 'success', read: false 
            };
            setNotifications(prev => [newNotif, ...prev]);
            playSound('startup');
            toast.success('REQUEST APPROVED!', { description: payload.new.task_name, style: { background: '#022c22', border: '1px solid #10b981', color: '#10b981' } });
          } else if (payload.new.status === 'rejected') {
            const newNotif = { 
              id: payload.new.id, title: 'REQUEST REJECTED', msg: `Coach rejected your request: ${payload.new.task_name}.`, 
              time: new Date().toLocaleTimeString(), type: 'penalty', read: false 
            };
            setNotifications(prev => [newNotif, ...prev]);
            playSound('error');
            toast.error('REQUEST REJECTED', { description: payload.new.task_name, style: { background: '#2a0808', border: '1px solid #ef4444', color: '#ef4444' } });
          }
        }
      }).subscribe();

    const playerSub = supabase.channel('public:elite_players')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'elite_players', filter: `name=eq.${player.name}` }, payload => {
        if (payload.new.active_penalty && !payload.old.active_penalty) {
          playSound('error');
          toast.error('SYSTEM PENALTY ACTIVATED', { description: 'The Punisher has frozen your account. Execute Disciplinary Quest.', duration: 8000, style: { background: '#450a0a', border: '2px solid #ef4444', color: '#fca5a5', fontWeight: 'bold' } });
        }
      }).subscribe();

    return () => {
      supabase.removeChannel(newsSub);
      supabase.removeChannel(questSub);
      supabase.removeChannel(playerSub);
    };
  }, [player, isBooting, isOffline]);

  useEffect(() => {
    if (player && !isBooting) {
      localStorage.setItem('elite_system_active_session', JSON.stringify(player));
    }
  }, [player, isBooting]);

  const handleAwaken = (playerData: any) => {
    setPlayer(playerData);
    setIsBooting(true);
    playSound('boot');
    setTimeout(() => {
      setIsBooting(false);
      playSound('startup');
      if (!bgmMain.playing()) {
        bgmMain.play();
      }
    }, 2000);
  };

  const handleLogout = () => {
    playSound('click');
    localStorage.removeItem('elite_system_active_session');
    localStorage.removeItem('elite_coach_mode');
    Howler.stop(); 
    setPlayer(null);
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === 'rank' || tabId === 'profile') playSound('shield');
    else if (tabId === 'records' || tabId === 'rehab') playAuraSound(player);
    else playSound('click');
    
    if (tabId === 'shop' || tabId === 'store') {
      if (currentBGM !== bgmShop) {
        currentBGM.fade(0.15, 0, 800);
        setTimeout(() => {
          currentBGM.pause();
          bgmShop.play();
          bgmShop.fade(0, 0.15, 800);
          currentBGM = bgmShop;
        }, 800);
      }
    } else {
      if (currentBGM !== bgmMain) {
        currentBGM.fade(0.15, 0, 800);
        setTimeout(() => {
          currentBGM.pause();
          bgmMain.play();
          bgmMain.fade(0, 0.15, 800);
          currentBGM = bgmMain;
        }, 800);
      }
    }

    setActiveTab(tabId);
  };

  const openNotificationCenter = () => {
    playSound('click');
    setShowNotifications(true);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleMute = () => {
    playSound('click');
    setIsMusicMuted(!isMusicMuted);
  };

  if (!player) return <AwakeningScreen onAwaken={handleAwaken} />;

  if (isBooting) {
    return (
      <BootScreen>
        <ScanlineEffect />
        <Terminal size={60} color="#00f2ff" style={{ marginBottom: 20, filter: 'drop-shadow(0 0 10px #00f2ff)' }} />
        <h2 style={{ color: '#00f2ff', letterSpacing: '4px', textShadow: '0 0 10px #00f2ff' }}>SYSTEM BOOT</h2>
        <p style={{ color: '#94a3b8', fontFamily: 'monospace', marginTop: 20 }}>{bootText}</p>
        <div style={{ width: '250px', height: '2px', background: '#1e293b', marginTop: 20, position: 'relative', overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: '100%' }} 
            transition={{ duration: 2.2, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: '#00f2ff', boxShadow: '0 0 10px #00f2ff' }}
          />
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

  const TABS = [
    { id: 'dashboard', label: 'QUESTS', icon: CheckSquare, color: '#00f2ff' },
    { id: 'radar', label: 'RADAR', icon: Globe, color: '#0ea5e9' },
    { id: 'records', label: 'RECORDS', icon: Medal, color: '#facc15' },
    { id: 'shop', label: 'SHOP', icon: ShoppingCart, color: '#38bdf8' },
    { id: 'store', label: 'STORE', icon: Storefront, color: '#10b981' },
    { id: 'rank', label: 'RANK', icon: Shield, color: '#a855f7' },
    { id: 'profile', label: 'PROFILE', icon: User, color: '#ec4899' },
    { id: 'rules', label: 'RULES', icon: Book, color: '#f43f5e' },
    { id: 'rehab', label: 'CLINIC', icon: Activity, color: '#10b981' },
  ];

  const pageVariants = {
    initial: { opacity: 0, scale: 0.98, y: 10 },
    in: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    out: { opacity: 0, scale: 0.98, y: -10, transition: { duration: 0.3, ease: 'easeIn' } }
  };

  return (
    <AppContainer>
      <BackgroundGrid />
      <Toaster position="top-center" theme="dark" />
      
      <AnimatePresence>
        {isOffline && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ background: '#b45309', color: '#fef3c7', padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <WifiOff size={14} /> OFFLINE MODE: Using Local Cache. Some features may be restricted.
          </motion.div>
        )}
      </AnimatePresence>

      <StatusBar>
        {/* 🚨 أزرار التحكم بقت في سطر لوحدها فوق عشان متداريش على ה-HP 🚨 */}
        <TopRightControls>
          <IconButton onClick={toggleMute} title={isMusicMuted ? "Unmute Music" : "Mute Music"}>
            {isMusicMuted ? <VolumeX size={18} color="#ef4444" /> : <Volume2 size={18} color="#10b981" />}
          </IconButton>

          <IconButton onClick={openNotificationCenter} $hasUnread={unreadCount > 0} title="Notifications" style={{ display: 'none' }}>
            <Bell size={18} />
            {unreadCount > 0 && <UnreadDot>{unreadCount}</UnreadDot>}
          </IconButton>
          <IconButton onClick={handleLogout} title="System Logout"><Power size={18} /></IconButton>
        </TopRightControls>

        <HPBarContainer>
          <HeartIcon size={16} color={hp > 50 ? '#10b981' : hp > 20 ? '#eab308' : '#ef4444'} />
          <HPBarWrapper>
            <HPBarFill $hp={hp} initial={{ width: 0 }} animate={{ width: `${hp}%` }} transition={{ duration: 1.5, type: 'spring' }} />
          </HPBarWrapper>
          <span style={{ fontSize: '14px', fontWeight: '900', color: hp > 50 ? '#10b981' : hp > 20 ? '#eab308' : '#ef4444', textShadow: '0 0 10px currentColor' }}>{hp} HP</span>
        </HPBarContainer>

        <PlayerInfoRow>
          <ClassBadge>
            <HexagonBox $color={auraColor} onClick={() => playAuraSound(player)} whileTap={{ scale: 0.9 }}>
              {getDynamicIcon(player, 28)}
            </HexagonBox>
            <PlayerDetails>
              <div style={{ fontSize: '10px', color: '#00f2ff', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>System Link Active</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>LVL {currentLvl} - {player.name}</div>
                {currentStreak >= 3 && (
                  <motion.div title={`${currentStreak} Days Streak!`} initial={{ scale: 0.8 }} animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ display: 'flex', alignItems: 'center', background: `linear-gradient(90deg, ${streakColor}20, transparent)`, padding: '4px 8px', borderRadius: '8px', borderLeft: `2px solid ${streakColor}` }}>
                    <Flame size={14} color={streakColor} fill={streakColor} style={{ marginRight: '6px', filter: `drop-shadow(0 0 5px ${streakColor})` }} />
                    <span style={{ fontSize: '13px', color: streakColor, fontWeight: '900' }}>{currentStreak}</span>
                  </motion.div>
                )}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>{`[ ${player.titles?.[0] || 'Athlete'} ] • Elite Division`}</div>
            </PlayerDetails>
          </ClassBadge>

          <GoldBadge>
            <img src="https://cdn-icons-png.flaticon.com/512/138/138246.png" width="20" alt="gold" style={{ filter: 'brightness(0) saturate(100%) invert(75%) sepia(55%) saturate(1637%) hue-rotate(352deg) brightness(101%) contrast(106%)', dropShadow: '0 0 5px rgba(234, 179, 8, 0.8)' }} />
            <span style={{ fontSize: '18px' }}>{player.gold || 0}</span>
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
            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <div style={{ marginTop: 4 }}>{tab.label}</div>
          </NavButton>
        ))}
      </NavigationGrid>

      <ContentWrapper>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial="initial" animate="in" exit="out" variants={pageVariants}>
            {activeTab === 'dashboard' && <Dashboard player={player} setPlayer={setPlayer} />}
            {activeTab === 'radar' && <Radar />}
            {activeTab === 'rank' && <Rank player={player} setPlayer={setPlayer} />}
            {activeTab === 'shop' && <Shop player={player} setPlayer={setPlayer} />}
            {activeTab === 'store' && <Store player={player} setPlayer={setPlayer} />}
            {activeTab === 'profile' && <Profile player={player} setPlayer={setPlayer} />}
            {activeTab === 'records' && <Records player={player} setPlayer={setPlayer} />}
            {activeTab === 'rules' && <Rules />}
            {activeTab === 'rehab' && <Rehab />}
          </motion.div>
        </AnimatePresence>
      </ContentWrapper>

      {/* 🚨 Notification Center Modal 🚨 */}
      <AnimatePresence>
        {showNotifications && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}>
              <button onClick={() => setShowNotifications(false)} style={{ position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={24} /></button>
              
              <h2 style={{ color: '#00f2ff', margin: '0 0 20px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: 10, textTransform: 'uppercase' }}>
                <Bell size={20} /> COMM CENTER
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {notifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '12px' }}>No messages in the communication log.</div>
                ) : (
                  notifications.map((n, idx) => (
                    <NotificationCard key={idx} $type={n.type} as={motion.div} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                      <div style={{ flexShrink: 0, background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {n.type === 'broadcast' ? <MessageSquare size={18} color="#0ea5e9" /> : n.type === 'penalty' ? <ShieldAlert size={18} color="#ef4444" /> : <CheckCircle size={18} color="#10b981" />}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>{n.title}</div>
                        <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4', marginBottom: '6px' }}>{n.msg}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>{n.time}</div>
                      </div>
                    </NotificationCard>
                  ))
                )}
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

    </AppContainer>
  );
};

export default App;