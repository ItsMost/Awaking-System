import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { Toaster, toast } from 'sonner';
import confetti from 'canvas-confetti';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  CheckCircle, Circle, AlertTriangle, ShieldAlert, Camera, X, Activity, Flame, Droplet,
  Dumbbell, Zap, Star, Clock, Users, Wind, Loader, Footprints, StretchHorizontal,
  PlusCircle, Box, Stethoscope, HeartPulse, Bandage, ClipboardCheck, Target,
  ChevronLeft, ChevronRight, Calendar, Lock, Scale, Bell, Database, Globe, Timer,
  Trophy, Utensils, Search, Plus, PieChart, RotateCcw, List, Trash2, Gamepad2, MousePointerClick,
  Crown, Shield, Scan, Crosshair, FileImage, XCircle, Inbox, Check, Key, Copy, Filter, CheckSquare, Percent
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ==========================================
// 1. المحرك الصوتي (Audio Engine)
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

const playDashSound = (type: 'complete' | 'levelUp' | 'error' | 'request' | 'openMobility' | 'gameClick') => {
  try {
    if (!canPlay()) return;
    const ctx = getAudioContext(); if (!ctx) return;
    const osc = ctx.createOscillator(); const gainNode = ctx.createGain();
    osc.connect(gainNode); gainNode.connect(ctx.destination); const now = ctx.currentTime;

    if (type === 'complete') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      gainNode.gain.setValueAtTime(0.2, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(); osc.stop(now + 0.2);
    } else if (type === 'openMobility' || type === 'request') {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);
      gainNode.gain.setValueAtTime(0.2, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(); osc.stop(now + 0.2);
    } else if (type === 'levelUp') {
      osc.type = 'square'; osc.frequency.setValueAtTime(400, now); osc.frequency.setValueAtTime(600, now + 0.2); osc.frequency.setValueAtTime(800, now + 0.4);
      gainNode.gain.setValueAtTime(0.3, now); gainNode.gain.linearRampToValueAtTime(0.01, now + 1.5);
      osc.start(); osc.stop(now + 1.5);
    } else if (type === 'gameClick') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(1000, now); osc.frequency.exponentialRampToValueAtTime(500, now + 0.1);
      gainNode.gain.setValueAtTime(0.1, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(); osc.stop(now + 0.1);
    } else {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
      gainNode.gain.setValueAtTime(0.3, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(); osc.stop(now + 0.3);
    }
  } catch (error) {}
};

const playHoverSound = () => {
  try {
    if (!canPlay()) return;
    const ctx = getAudioContext(); if (!ctx) return;
    const osc = ctx.createOscillator(); const gainNode = ctx.createGain();
    osc.connect(gainNode); gainNode.connect(ctx.destination);
    osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(); osc.stop(ctx.currentTime + 0.1);
  } catch (error) {}
};

const playScan = () => {
  const ctx = getAudioContext(); if (!ctx) return;
  const osc = ctx.createOscillator(); const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, ctx.currentTime); osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 1.5);
  gain.gain.setValueAtTime(0.05, ctx.currentTime); gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
  osc.start(); osc.stop(ctx.currentTime + 1.5);
};

// ==========================================
// 2. Rank System & Utils
// ==========================================
const getRankInfo = (level: number) => {
  if (level >= 30) return { name: 'ELITE', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' };
  if (level >= 25) return { name: 'MASTER', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' };
  if (level >= 20) return { name: 'DIAMOND', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' };
  if (level >= 15) return { name: 'PLATINUM', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' };
  if (level >= 10) return { name: 'GOLD', color: '#eab308', glow: 'rgba(234, 179, 8, 0.4)' };
  if (level >= 5)  return { name: 'SILVER', color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.4)' };
  return { name: 'BRONZE', color: '#b45309', glow: 'rgba(180, 83, 9, 0.4)' };
};

const getPenaltyStats = (level: number) => {
  if (level >= 30) return { hp: 50, gold: 250 };
  if (level >= 25) return { hp: 40, gold: 200 };
  if (level >= 20) return { hp: 30, gold: 150 };
  if (level >= 15) return { hp: 25, gold: 125 };
  if (level >= 10) return { hp: 20, gold: 100 };
  if (level >= 5)  return { hp: 15, gold: 75 };
  return { hp: 10, gold: 50 };
};

const calculateLevelData = (totalXp: number) => {
  let level = 1; let currentXp = totalXp; let expNeededForNextLevel = 650;
  while (currentXp >= expNeededForNextLevel) { currentXp -= expNeededForNextLevel; level++; expNeededForNextLevel = Math.min(level * 150 + 500, 4000); }
  return { level, xpInCurrentLevel: currentXp, expNeededForNextLevel };
};

const getSystemDateStr = (date: Date) => { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; };

// ==========================================
// 3. Components (2D VFX & 3D Scanner)
// ==========================================
const AnimatedCoin = React.memo(() => (
  <motion.div style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 4 }} animate={{ rotateY: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
    <svg viewBox="0 0 100 100" width="16" height="16" style={{ filter: 'drop-shadow(0 0 5px #eab308)' }}>
      <circle cx="50" cy="50" r="45" fill="#facc15" stroke="#ca8a04" strokeWidth="5" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="#ca8a04" strokeWidth="2" strokeDasharray="5 5" />
      <polygon points="40,30 60,30 60,70 40,70" fill="#ca8a04" opacity="0.5" />
    </svg>
  </motion.div>
));

const AnimatedExpStar = React.memo(() => (
  <motion.div style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 4 }} animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
    <svg viewBox="0 0 100 100" width="16" height="16" style={{ filter: 'drop-shadow(0 0 5px #00f2ff)' }}>
      <polygon points="50,10 61,39 92,39 67,58 76,88 50,70 24,88 33,58 8,39 39,39" fill="#00f2ff" stroke="#0284c7" strokeWidth="4" />
      <circle cx="50" cy="50" r="10" fill="#fff" opacity="0.8" />
    </svg>
  </motion.div>
));

const BodyScanner3D = React.memo(({ painLevel, isScanning }: { painLevel: number, isScanning: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += isScanning ? 0.1 : 0.01; 
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const getBodyColor = () => {
    if (painLevel === 0) return '#0ea5e9';
    if (painLevel < 5) return '#eab308';
    return '#ef4444';
  };

  return (
    <mesh ref={meshRef}>
      <capsuleGeometry args={[1, 2.5, 4, 16]} />
      <meshStandardMaterial color={getBodyColor()} wireframe={true} emissive={getBodyColor()} emissiveIntensity={isScanning ? 1.5 : 0.5} transparent={true} opacity={0.8} />
    </mesh>
  );
});

// ==========================================
// 4. Styled Components (Responsive)
// ==========================================
const Container = styled(motion.div)` padding: 15px; font-family: 'Oxanium', sans-serif; color: #fff; padding-bottom: 100px; max-width: 600px; margin: 0 auto; position: relative; overflow-x: hidden; @media (max-width: 480px) { padding: 10px; }`;
const NewsTickerWrapper = styled.div` background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 10px; margin-bottom: 20px; display: flex; align-items: center; overflow: hidden; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.5); @media (max-width: 480px) { margin-bottom: 15px; }`;
const TickerIcon = styled.div` background: #0ea5e920; color: #0ea5e9; padding: 6px; border-radius: 8px; margin-right: 10px; z-index: 2; display: flex; align-items: center; justify-content: center; `;
const marquee = keyframes` 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } `;
const TickerText = styled.div` display: flex; gap: 40px; white-space: nowrap; animation: ${marquee} 9s linear infinite; font-size: 13px; font-weight: bold; color: #94a3b8; direction: rtl; span { color: #fff; } strong { color: #eab308; } `;

const DateNav = styled.div` display: flex; align-items: center; justify-content: space-between; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 10px 15px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); @media (max-width: 480px) { padding: 8px 12px; margin-bottom: 15px; }`;
const NavBtn = styled.button` background: none; border: none; color: #00f2ff; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 5px; transition: 0.3s; &:disabled { color: #334155; cursor: not-allowed; } &:hover:not(:disabled) { filter: brightness(1.2); transform: scale(1.1); } `;
const DateDisplay = styled.div` text-align: center; .day { font-size: 15px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; justify-content: center; gap: 6px; @media (max-width: 480px) { font-size: 13px; } } .full-date { font-size: 10px; color: #ef4444; margin-top: 2px; font-weight: bold; @media (max-width: 480px) { font-size: 9px; } } `;

const SeasonCard = styled.div` background: linear-gradient(135deg, #0f172a 0%, #020617 100%); border: 1px solid #38bdf8; border-radius: 16px; padding: 20px; margin-bottom: 25px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(56, 189, 248, 0.15); @media (max-width: 480px) { padding: 15px; margin-bottom: 20px; border-radius: 14px; }`;
const SeasonHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; `;
const SeasonTitleText = styled.h2` margin: 0; font-size: 15px; color: #38bdf8; display: flex; align-items: center; gap: 8px; text-transform: uppercase; font-weight: 900; letter-spacing: 1px; @media (max-width: 480px) { font-size: 13px; }`;
const CountdownBadge = styled.div` background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; padding: 5px 10px; border-radius: 8px; font-size: 11px; font-weight: 900; display: flex; align-items: center; gap: 5px; box-shadow: 0 0 10px rgba(239, 68, 68, 0.2); @media (max-width: 480px) { font-size: 9px; padding: 4px 8px; }`;
const SeasonLevelInfo = styled.div` display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; @media (max-width: 480px) { font-size: 10px; }`;
const ProgressBarBG = styled.div` background: #1e293b; height: 8px; border-radius: 4px; overflow: hidden; width: 100%; `;
const ProgressBarFill = styled.div<{ $progress: number; $color?: string }>` background: ${(props) => props.$color || '#38bdf8'}; height: 100%; width: ${(props) => props.$progress}%; box-shadow: 0 0 10px ${(props) => props.$color || '#38bdf8'}; transition: width 0.5s ease-out; `;

const PenaltyBanner = styled(motion.div)<{ $isPending: boolean }>` background: ${(props) => (props.$isPending ? '#b45309' : '#2a0808')}; border: 1px dashed ${(props) => (props.$isPending ? '#fcd34d' : '#ef4444')}; color: ${(props) => (props.$isPending ? '#fef3c7' : '#fca5a5')}; padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 12px; font-weight: 900; letter-spacing: 1px; margin-bottom: 20px; box-shadow: 0 0 15px ${(props) => (props.$isPending ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)')}; @media (max-width: 480px) { font-size: 10px; padding: 10px; text-align: center; }`;

const DynamicHeader = styled.div<{ $color: string; $shadow: string }>` display: flex; justify-content: space-between; align-items: center; background: linear-gradient(90deg, #0f172a 0%, #020617 100%); border: 1px solid ${(props) => props.$color}; padding: 20px; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 0 20px ${(props) => props.$shadow}; transition: all 0.5s ease; @media (max-width: 480px) { padding: 15px; margin-bottom: 20px; border-radius: 14px; }`;
const SectionTitle = styled.h2<{ $color: string }>` font-size: 14px; color: ${(props) => props.$color}; letter-spacing: 2px; margin: 30px 0 15px 0; display: flex; align-items: center; gap: 8px; text-transform: uppercase; border-bottom: 1px solid ${(props) => props.$color}40; padding-bottom: 8px; @media (max-width: 480px) { font-size: 12px; margin: 20px 0 10px 0; }`;

const pulseHologram = keyframes` 0% { box-shadow: 0 0 15px rgba(0, 242, 255, 0.1), inset 0 0 20px rgba(0, 242, 255, 0.05); } 50% { box-shadow: 0 0 30px rgba(0, 242, 255, 0.3), inset 0 0 40px rgba(0, 242, 255, 0.1); } 100% { box-shadow: 0 0 15px rgba(0, 242, 255, 0.1), inset 0 0 20px rgba(0, 242, 255, 0.05); } `;

const QuestCard = styled(motion.div)<{ $status: string; $isPenalty?: boolean; $isLocked?: boolean; $glowColor: string }>`
  background: ${(props) => props.$status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : props.$status === 'pending' ? 'rgba(234, 179, 8, 0.1)' : props.$isPenalty ? '#2a0808' : 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(2, 6, 23, 0.8))'}; 
  border: 1px solid ${(props) => props.$status === 'completed' ? '#10b981' : props.$status === 'pending' ? '#eab308' : props.$isPenalty ? '#ef4444' : props.$glowColor}; 
  border-radius: 16px; padding: 15px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; cursor: ${(props) => (props.$isLocked ? 'default' : 'pointer')}; transition: all 0.3s ease; opacity: ${(props) => (props.$isLocked && props.$status === 'idle' ? 0.5 : 1)}; 
  animation: ${(props) => props.$status === 'idle' && !props.$isLocked && !props.$isPenalty ? pulseHologram : 'none'} 4s infinite;
  &:hover { background: ${(props) => props.$status === 'idle' && !props.$isLocked ? props.$isPenalty ? '#450a0a' : 'rgba(15, 23, 42, 1)' : ''}; transform: ${(props) => (props.$status === 'idle' && !props.$isLocked ? 'translateY(-3px) scale(1.02)' : 'none')}; border-color: ${(props) => props.$status === 'idle' && !props.$isLocked ? '#fff' : ''}; }
  @media (max-width: 480px) { padding: 12px; margin-bottom: 12px; border-radius: 12px; }
`;

const UrgentCard = styled(QuestCard)` border-width: 2px; background: ${(props) => props.$status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'linear-gradient(90deg, #450a0a 0%, #020617 100%)'}; &::before { content: 'CRITICAL DIRECTIVE'; position: absolute; top: 8px; right: 15px; font-size: 9px; font-weight: 900; color: #ef4444; letter-spacing: 2px; @media (max-width: 480px) { font-size: 8px; top: 6px; right: 10px; } } `;

const LeftContent = styled.div` display: flex; align-items: center; gap: 15px; flex: 1; @media (max-width: 480px) { gap: 10px; }`;
const IconWrapper = styled.div<{ $color: string }>` background: ${(props) => props.$color}15; border: 1px solid ${(props) => props.$color}40; width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: inset 0 0 15px ${(props) => props.$color}20; @media (max-width: 480px) { width: 40px; height: 40px; border-radius: 10px; svg { width: 20px; height: 20px; } } `;
const TextContent = styled.div` display: flex; flex-direction: column; gap: 4px; flex: 1; `;
const QuestTitle = styled.div<{ $status: string; $isPenalty?: boolean }>` font-size: 15px; font-weight: 900; color: ${(props) => props.$status === 'completed' ? '#10b981' : props.$status === 'pending' ? '#facc15' : props.$isPenalty ? '#fca5a5' : '#fff'}; text-decoration: ${(props) => (props.$status === 'completed' ? 'line-through' : 'none')}; line-height: 1.3; text-shadow: ${(props) => props.$status === 'idle' && !props.$isPenalty ? '0 0 10px rgba(255,255,255,0.3)' : 'none'}; @media (max-width: 480px) { font-size: 13px; } `;
const QuestDesc = styled.div` font-size: 11px; color: #94a3b8; line-height: 1.5; @media (max-width: 480px) { font-size: 10px; line-height: 1.3; }`;
const Rewards = styled.div` display: flex; align-items: center; gap: 15px; font-size: 11px; font-weight: 900; margin-top: 4px; @media (max-width: 480px) { font-size: 10px; gap: 10px; }`;
const RightAction = styled.div<{ $type: string; $status: string }>` width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: ${(props) => props.$status === 'completed' ? '#10b98120' : props.$status === 'pending' ? '#facc1520' : props.$type === 'request' ? '#1e293b' : 'rgba(255,255,255,0.05)'}; border: 1px solid ${(props) => props.$status === 'completed' ? '#10b981' : props.$status === 'pending' ? '#facc15' : '#334155'}; flex-shrink: 0; transition: 0.3s; box-shadow: ${(props) => props.$status === 'idle' ? '0 0 10px rgba(255,255,255,0.05)' : 'none'}; @media (max-width: 480px) { width: 35px; height: 35px; border-radius: 10px; svg { width: 18px; height: 18px; } } `;

const ModalOverlay = styled(motion.div)` position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; `;
const ModalContent = styled(motion.div)<{ $color: string; $width?: string }>` background: #0b1120; border: 2px solid ${(props) => props.$color}; border-radius: 20px; padding: 30px; width: 100%; max-width: ${(props) => props.$width || '450px'}; position: relative; max-height: 85vh; overflow-y: auto; box-shadow: 0 0 50px ${(props) => props.$color}40; &::-webkit-scrollbar { width: 5px; } &::-webkit-scrollbar-thumb { background: ${(props) => props.$color}; border-radius: 5px; } @media (max-width: 480px) { padding: 20px; border-radius: 16px; }`;
const HonorModalContent = styled(ModalContent)` box-shadow: 0 0 50px rgba(239, 68, 68, 0.4); text-align: center; border: 2px solid #ef4444; `;
const UploadBtn = styled.label<{ $hasFile: boolean; $color: string }>` display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px; background: ${(props) => (props.$hasFile ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)')}; border: 2px dashed ${(props) => (props.$hasFile ? '#10b981' : '#334155')}; border-radius: 12px; color: ${(props) => (props.$hasFile ? '#10b981' : '#94a3b8')}; cursor: pointer; margin: 15px 0; transition: 0.3s; &:hover { background: rgba(255,255,255,0.1); border-color: ${(props) => props.$color}; color: ${(props) => props.$color}; } @media (max-width: 480px) { padding: 15px; margin: 10px 0; }`;
const ActionBtn = styled.button<{ $color: string; disabled?: boolean }>` width: 100%; padding: 15px; background: ${(props) => (props.disabled ? '#334155' : props.$color)}; color: ${(props) => (props.disabled ? '#94a3b8' : '#000')}; border: none; border-radius: 10px; font-family: 'Oxanium', sans-serif; font-size: 14px; font-weight: 900; cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')}; margin-top: 10px; display: flex; justify-content: center; align-items: center; gap: 10px; transition: 0.3s; box-shadow: 0 0 15px ${(props) => props.$color}60; &:hover { filter: brightness(1.2); transform: translateY(-2px); } @media (max-width: 480px) { padding: 12px; font-size: 13px; }`;

const spin = keyframes` 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } `;
const LoadingSpinner = styled(Loader)` animation: ${spin} 1s linear infinite; `;
const SyncOverlay = styled.div` position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(2, 6, 23, 0.9); z-index: 200; display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(4px); `;

const MacroGrid = styled.div` display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; @media (max-width: 480px) { gap: 6px; }`;
const MacroBox = styled.div` background: #020617; border: 1px solid #1e293b; padding: 10px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; text-align: center; @media (max-width: 480px) { padding: 8px 4px; }`;
const MacroLabel = styled.div<{ $color: string }>` font-size: 10px; font-weight: 900; color: ${(props) => props.$color}; text-transform: uppercase; @media (max-width: 480px) { font-size: 8px; }`;
const MacroValue = styled.div` font-size: 14px; font-weight: bold; color: #fff; @media (max-width: 480px) { font-size: 12px; }`;
const NutriTabs = styled.div` display: flex; gap: 10px; margin-bottom: 15px; `;
const NutriTab = styled.button<{ $active: boolean }>` flex: 1; padding: 10px; border-radius: 8px; border: none; font-weight: bold; font-family: 'Oxanium'; cursor: pointer; transition: 0.3s; background: ${(props) => props.$active ? '#f97316' : '#1e293b'}; color: ${(props) => props.$active ? '#000' : '#94a3b8'}; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; @media (max-width: 480px) { font-size: 10px; padding: 8px; }`;
const FoodSearchInput = styled.input` width: 100%; background: #020617; border: 1px solid #334155; padding: 12px 15px; border-radius: 8px; color: #fff; font-family: 'Oxanium'; margin-bottom: 15px; outline: none; &:focus { border-color: #f97316; } @media (max-width: 480px) { padding: 10px 12px; font-size: 13px; }`;
const FoodList = styled.div` max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 5px; direction: rtl; `;
const FoodItem = styled.div` background: #1e293b50; border: 1px solid #334155; padding: 10px 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; transition: 0.3s; @media (max-width: 480px) { padding: 8px 10px; }`;
const ManualInputGrid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; `;
const ResetMacrosBtn = styled.button` background: #2a0808; color: #ef4444; border: 1px solid #ef4444; padding: 8px 15px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: bold; width: 100%; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 5px; transition: 0.3s; &:hover { background: #450a0a; } @media (max-width: 480px) { font-size: 11px; }`;

const GameFAB = styled(motion.button)` position: fixed; bottom: 80px; right: 20px; width: 55px; height: 55px; border-radius: 50%; background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%); border: 2px solid #d8b4fe; color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); cursor: pointer; z-index: 90; transition: 0.3s; &:hover { transform: scale(1.1); box-shadow: 0 0 30px rgba(168, 85, 247, 0.6); } @media (max-width: 480px) { width: 45px; height: 45px; svg { width: 20px; height: 20px; } } `;
const GameArea = styled.div<{ $state: string }>` width: 100%; height: 250px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: ${(props) => props.$state === 'result_final' ? 'default' : 'pointer'}; user-select: none; transition: background 0.1s; background: ${(props) => props.$state === 'waiting' ? '#ef4444' : props.$state === 'ready' ? '#10b981' : props.$state === 'early' ? '#b45309' : (props.$state === 'result' || props.$state === 'result_final') ? '#0ea5e9' : '#1e293b' }; box-shadow: inset 0 0 50px rgba(0,0,0,0.5); border: 4px solid rgba(255,255,255,0.1); @media (max-width: 480px) { height: 200px; }`;
const GameText = styled.div` font-size: 24px; font-weight: 900; text-transform: uppercase; color: #fff; letter-spacing: 2px; text-align: center; text-shadow: 0 2px 10px rgba(0,0,0,0.5); @media (max-width: 480px) { font-size: 18px; }`;
const GameSubText = styled.div` font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 10px; font-weight: bold; `;
const GameSelectorBtn = styled.button<{ $active: boolean, $color: string }>` flex: 1; padding: 10px; background: ${(props) => props.$active ? `${props.$color}20` : 'transparent'}; border: 1px solid ${(props) => props.$active ? props.$color : '#334155'}; color: ${(props) => props.$active ? props.$color : '#94a3b8'}; border-radius: 8px; font-family: 'Oxanium'; font-weight: bold; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 5px; @media (max-width: 480px) { font-size: 11px; padding: 8px; }`;

const LevelUpOverlay = styled(motion.div)` position: fixed; inset: 0; background: rgba(0, 0, 0, 0.9); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(15px); `;
const LevelUpCard = styled(motion.div)<{ $color: string }>` background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(2, 6, 23, 0.95)); border: 2px solid ${(props) => props.$color}; border-radius: 24px; padding: 40px; width: 100%; max-width: 400px; text-align: center; position: relative; box-shadow: 0 0 50px ${(props) => props.$color}80, inset 0 0 20px ${(props) => props.$color}40; @media (max-width: 480px) { padding: 30px 20px; border-radius: 20px; }`;
const LevelUpTitle = styled.h1<{ $color: string }>` font-size: 36px; font-weight: 900; color: #fff; margin: 0 0 10px 0; text-transform: uppercase; text-shadow: 0 0 15px ${(props) => props.$color}; letter-spacing: 4px; @media (max-width: 480px) { font-size: 26px; letter-spacing: 2px; }`;
const LevelUpDesc = styled.p` font-size: 16px; color: #cbd5e1; margin: 0 0 30px 0; @media (max-width: 480px) { font-size: 14px; margin-bottom: 20px; }`;
const LevelUpRewardBox = styled.div<{ $color: string }>` background: rgba(255,255,255,0.05); border: 1px solid ${(props) => props.$color}50; border-radius: 12px; padding: 15px; margin-bottom: 20px; display: flex; justify-content: center; align-items: center; gap: 15px; font-size: 20px; font-weight: 900; color: #eab308; @media (max-width: 480px) { font-size: 16px; padding: 12px; gap: 10px; }`;

// ==========================================
// 4. الثوابت وقواعد البيانات (Constants & Arrays)
// ==========================================
const LOCAL_FOOD_DB = [
  { name: 'صدور دجاج مطهية (100ج)', protein: 31, carbs: 0, fats: 3, calories: 165 },
  { name: 'واي بروتين (1 سكوب)', protein: 25, carbs: 2, fats: 1, calories: 120 },
  { name: 'بيضة مسلوقة (1 حبة)', protein: 6, carbs: 1, fats: 5, calories: 70 },
  { name: 'أرز أبيض مطهي (100ج)', protein: 2, carbs: 28, fats: 0, calories: 130 },
  { name: 'شوفان (50ج)', protein: 7, carbs: 33, fats: 3, calories: 190 },
  { name: 'لحم بقري مفروم (100ج)', protein: 26, carbs: 0, fats: 15, calories: 250 },
  { name: 'تونة مصفاة (100ج)', protein: 25, carbs: 0, fats: 1, calories: 110 },
  { name: 'حليب كامل الدسم (1 كوب)', protein: 8, carbs: 12, fats: 8, calories: 150 },
  { name: 'موز (1 حبة متوسطة)', protein: 1, carbs: 27, fats: 0, calories: 105 },
  { name: 'زبدة فول سوداني (1 ملعقة)', protein: 4, carbs: 3, fats: 8, calories: 95 },
  { name: 'فول مدمس (100ج)', protein: 8, carbs: 18, fats: 1, calories: 110 },
  { name: 'فلافل / طعمية (1 حبة)', protein: 2, carbs: 5, fats: 4, calories: 60 },
  { name: 'كشري مصري (100ج)', protein: 5, carbs: 25, fats: 4, calories: 150 },
  { name: 'خبز بلدي (1 رغيف)', protein: 9, carbs: 50, fats: 1, calories: 250 },
  { name: 'جبنة قريش (100ج)', protein: 11, carbs: 3, fats: 4, calories: 90 },
  { name: 'جبنة رومي (1 شريحة)', protein: 7, carbs: 1, fats: 8, calories: 110 },
  { name: 'زبادي سادة (1 كوب)', protein: 5, carbs: 6, fats: 3, calories: 70 },
  { name: 'زبادي يوناني (1 كوب)', protein: 10, carbs: 4, fats: 0, calories: 60 },
  { name: 'عدس أصفر مطهي (100ج)', protein: 9, carbs: 20, fats: 0, calories: 116 },
  { name: 'كبدة إسكندراني (100ج)', protein: 26, carbs: 4, fats: 8, calories: 190 },
  { name: 'كفتة مشوية (100ج)', protein: 18, carbs: 3, fats: 15, calories: 220 },
  { name: 'سمك بلطي مشوي (100ج)', protein: 20, carbs: 0, fats: 2, calories: 100 },
  { name: 'سمك مقلي (100ج)', protein: 18, carbs: 5, fats: 12, calories: 200 },
  { name: 'جمبري مشوي (100ج)', protein: 24, carbs: 0, fats: 1, calories: 105 },
  { name: 'بطاطس مسلوقة (100ج)', protein: 2, carbs: 20, fats: 0, calories: 87 },
  { name: 'بطاطس مقلية (100ج)', protein: 3, carbs: 41, fats: 15, calories: 312 },
  { name: 'بطاطا حلوة مشوية (100ج)', protein: 2, carbs: 21, fats: 0, calories: 90 },
  { name: 'محشي ورق عنب (100ج)', protein: 3, carbs: 25, fats: 7, calories: 170 },
  { name: 'محشي كرنب (100ج)', protein: 2, carbs: 22, fats: 6, calories: 150 },
  { name: 'مكرونة بالبشاميل (100ج)', protein: 8, carbs: 15, fats: 9, calories: 170 },
  { name: 'شاورما دجاج (100ج)', protein: 22, carbs: 5, fats: 8, calories: 180 },
  { name: 'شاورما لحم (100ج)', protein: 20, carbs: 6, fats: 12, calories: 210 },
  { name: 'حواوشي (1 رغيف)', protein: 15, carbs: 30, fats: 20, calories: 350 },
  { name: 'مسقعة (100ج)', protein: 2, carbs: 10, fats: 8, calories: 120 },
  { name: 'ملوخية (1 طبق)', protein: 3, carbs: 8, fats: 5, calories: 90 },
  { name: 'سبانخ مطبوخة (100ج)', protein: 3, carbs: 4, fats: 2, calories: 45 },
  { name: 'بامية مطبوخة (100ج)', protein: 2, carbs: 7, fats: 3, calories: 60 },
  { name: 'صدر ديك رومي (100ج)', protein: 29, carbs: 0, fats: 1, calories: 135 },
  { name: 'حمص الشام (100ج)', protein: 9, carbs: 27, fats: 2, calories: 164 },
  { name: 'بابا غنوج (1 ملعقة)', protein: 1, carbs: 3, fats: 4, calories: 45 },
  { name: 'لب أبيض / قرع (30ج)', protein: 9, carbs: 4, fats: 14, calories: 170 },
  { name: 'لب سوري / دوار شمس (30ج)', protein: 6, carbs: 6, fats: 15, calories: 175 },
  { name: 'سوداني (30ج)', protein: 7, carbs: 5, fats: 14, calories: 160 },
  { name: 'لوز نيء (30ج)', protein: 6, carbs: 6, fats: 14, calories: 164 },
  { name: 'كاجو (30ج)', protein: 5, carbs: 9, fats: 12, calories: 157 },
  { name: 'بسبوسة (1 قطعة)', protein: 3, carbs: 45, fats: 10, calories: 280 },
  { name: 'كنافة بالمكسرات (1 قطعة)', protein: 5, carbs: 50, fats: 18, calories: 380 },
  { name: 'جلاش باللحمة (1 قطعة)', protein: 10, carbs: 25, fats: 12, calories: 250 },
  { name: 'سجق إسكندراني (100ج)', protein: 14, carbs: 3, fats: 25, calories: 290 },
  { name: 'طحينة (1 ملعقة)', protein: 3, carbs: 3, fats: 8, calories: 90 },
  { name: 'جبنة بيضاء كاملة (100ج)', protein: 12, carbs: 3, fats: 20, calories: 240 },
  { name: 'زيت زيتون (1 ملعقة)', protein: 0, carbs: 0, fats: 14, calories: 120 },
  { name: 'تفاح (1 حبة)', protein: 0, carbs: 25, fats: 0, calories: 95 },
  { name: 'برتقال (1 حبة)', protein: 1, carbs: 15, fats: 0, calories: 60 },
  { name: 'بطيخ مشوي (100ج)', protein: 1, carbs: 20, fats: 0, calories: 85 },
  { name: 'خبز فينو (1 رغيف صغير)', protein: 4, carbs: 25, fats: 2, calories: 130 },
  { name: 'لحم ضأن (100ج)', protein: 25, carbs: 0, fats: 21, calories: 294 },
  { name: 'بط مطهي (100ج)', protein: 19, carbs: 0, fats: 28, calories: 337 },
  { name: 'حمام محشي (1 حبة)', protein: 25, carbs: 40, fats: 15, calories: 400 },
  { name: 'عسل نحل (1 ملعقة)', protein: 0, carbs: 17, fats: 0, calories: 64 },
];

const BIWEEKLY_QUESTS = [
  { id: 'wq1', title: 'Recovery Logistics', desc: 'تجهيز وتأمين أدوات الاستشفاء وساعات النوم العميق.', exp: 100, gold: 50, type: 'request', icon: Box, color: '#eab308' },
];

const MONTHLY_QUESTS = [
  { id: 'wq2', title: 'Supplement Inventory', desc: 'جرد وتوفير المكملات الغذائية الأساسية لضمان الاستمرارية.', exp: 100, gold: 50, type: 'request', icon: Flame, color: '#eab308' },
  { id: 'wq3', title: 'InBody Assessment', desc: 'إجراء فحص InBody لقياس نسبة الدهون والعضلات ومتابعة التطور.', exp: 75, gold: 200, type: 'request', icon: Scale, color: '#06b6d4' },
];

const MOBILITY_ROUTINE = [
  { id: 'm1', area: 'Hips', title: '90/90 Hip Rotations', desc: 'مجموعتين - ١٠ تكرارات لكل جانب. لفتح الحوض وتحسين الدوران الداخلي والخارجي.', icon: StretchHorizontal, color: '#38bdf8' },
  { id: 'm_new1', area: 'Hips / Quads', title: 'Couch Stretch', desc: 'مجموعتين - دقيقة لكل قدم. إطالة عميقة لثنيات الحوض وعضلات الفخذ الأمامية.', icon: StretchHorizontal, color: '#38bdf8' },
  { id: 'm_new2', area: 'Back / Core', title: 'Cat-Cow Mobility', desc: 'مجموعتين - ١٥ تكرار. قم بتقويس ظهرك للأعلى (القطة) ثم اخفضه للأسفل ببطء.', icon: Zap, color: '#a855f7' },
  { id: 'm4', area: 'Back', title: 'Thoracic Rotations', desc: 'مجموعتين - ١٢ تكرار لكل جانب. لتحسين مرونة فقرات الظهر العلوية والصدر.', icon: Zap, color: '#a855f7' },
  { id: 'm5', area: 'Shoulder', title: 'Wall Angels / Shoulder CARs', desc: 'مجموعتين - ١٠ تكرارات. قف ظهرك للحائط وارفع ذراعيك ببطء لزيادة مرونة مفصل الكتف.', icon: Dumbbell, color: '#10b981' },
  { id: 'm6', area: 'Ankle', title: 'Ankle Dorsiflexion (Combat Stretch)', desc: 'مجموعتين - دقيقة لكل قدم. ادفع ركبتك للأمام متجاوزة مشط القدم مع ثبات الكعب.', icon: Footprints, color: '#facc15' },
];

const FRIDAY_DIRECTIVES = [
  { id: 'fd1', title: 'Weekly Volume Compliance', desc: 'تأكيد تنفيذ كافة الحصص التدريبية وتطابق الأوزان والعدادات مع الخطة الأسبوعية بدقة.', exp: 150, gold: 100, type: 'request', icon: ClipboardCheck, color: '#ef4444' },
  { id: 'fd2', title: 'Perfect Microcycle Streak', desc: 'الحفاظ على التزام يومي كامل (Streak) بدون انقطاع في المهام من السبت إلى الخميس.', exp: 150, gold: 100, type: 'request', icon: Target, color: '#ef4444' },
];

const SHARED_PRACTICE_ID = 'shared_practice';
const SHARED_HYDRATION = { id: 'shared_1', title: 'Hydration Target (3L)', desc: 'تحقيق معدل استهلاك المياه لضمان ترطيب العضلات وطرد السموم.', exp: 30, gold: 10, type: 'honor', icon: Droplet, color: '#38bdf8' };
const SHARED_NUTRITION = { id: 'shared_2', title: 'Nutritional Compliance', desc: 'تتبع السعرات والماكروز لتحقيق هدف البروتين الصافي لبناء العضلات.', exp: 30, gold: 10, type: 'nutrition', icon: Flame, color: '#f97316' };
const SHARED_MOBILITY = { id: 'shared_3', title: 'Functional Mobility', desc: 'أداء روتين المرونة الوظيفية لضمان صحة وكفاءة المفاصل.', exp: 35, gold: 15, type: 'mobilityRoutine', icon: Activity, color: '#10b981' };

const NORMAL_DAILY_QUESTS = [
  { id: SHARED_PRACTICE_ID, title: 'Practice', desc: 'إتمام الحصة التدريبية الأساسية وفقاً للأحمال والأوزان المحددة بالجدول.', exp: 100, gold: 30, type: 'request', noImage: true, icon: Users, color: '#a855f7' },
  SHARED_HYDRATION,
  SHARED_NUTRITION,
  SHARED_MOBILITY,
  { id: 'dq4', title: 'Recovery Cooldown', desc: 'خفض معدل ضربات القلب تدريجياً وإطالة الأنسجة بعد التمرين مباشرة.', exp: 20, gold: 10, type: 'request', noImage: true, icon: Wind, color: '#34d399' },
];

const INJURED_DAILY_QUESTS = [
  { id: SHARED_PRACTICE_ID, title: 'Practice (Rehab)', desc: 'بديل التمرين الأساسي: إتمام جلسة العلاج الطبيعي والتقويات المخصصة للإصابة.', exp: 90, gold: 30, type: 'request', noImage: true, icon: Stethoscope, color: '#ef4444' },
  SHARED_HYDRATION,
  SHARED_NUTRITION,
  SHARED_MOBILITY,
  { id: 'iq4', title: 'Thermal / Cryotherapy', desc: 'تطبيق الكمادات (ثلج أو حرارة) حسب البروتوكول الطبي الموضح في قسم العلاج.', exp: 20, gold: 10, type: 'request', noImage: true, icon: HeartPulse, color: '#f43f5e' },
];

const PENALTY_QUEST = { id: 'penalty_q', title: 'Disciplinary Execution', desc: 'تنفيذ العقوبة الإدارية المطلوبة ورفع الإثبات لرفع تجميد النظام.', exp: 0, gold: 0, type: 'request', icon: ShieldAlert, color: '#ef4444', isPenalty: true };

// ==========================================
// 5. MAIN DASHBOARD COMPONENT (Optimized)
// ==========================================
const Dashboard = ({ player, setPlayer }: any) => {
  const currentPlayer = player || { id: 'me', name: 'Athlete', cumulative_xp: 0, monthly_xp: 0, gold: 0, hp: 100, is_injured: false, active_penalty: false, weight: 75, streak: 0, last_active: null, last_penalty_check: null };

  const DAILY_QUESTS = useMemo(() => currentPlayer.is_injured ? INJURED_DAILY_QUESTS : NORMAL_DAILY_QUESTS, [currentPlayer.is_injured]);

  const prevLevelRef = useRef<number | null>(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [pendingQuests, setPendingQuests] = useState<string[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<any>(null);
  const [honorQuestToConfirm, setHonorQuestToConfirm] = useState<any>(null);

  const [showMobilityModal, setShowMobilityModal] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingSync, setIsLoadingSync] = useState(true);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  const [timeOffset, setTimeOffset] = useState<number>(0);

  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [dailyMacros, setDailyMacros] = useState({ protein: 0, carbs: 0, fats: 0, calories: 0, log: [] as any[] });
  const [customFoods, setCustomFoods] = useState<any[]>([]); 
  const [activeNutriTab, setActiveNutriTab] = useState('search');
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [manualFood, setManualFood] = useState({ name: '', protein: '', carbs: '', fats: '', calories: '' });

  const [showGameModal, setShowGameModal] = useState(false);
  const [gameTab, setGameTab] = useState<'play' | 'leaderboard'>('play');
  const [activeGame, setActiveGame] = useState<'reaction' | 'sprint'>('reaction');
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'ready' | 'result' | 'early' | 'result_final'>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [gameTimeoutId, setGameTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [reactionLeaderboard, setReactionLeaderboard] = useState<any[]>([]);
  const [reactionAttempt, setReactionAttempt] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [sprintState, setSprintState] = useState<'idle' | 'playing' | 'result'>('idle');
  const [sprintScore, setSprintScore] = useState(0);
  const [sprintTimeLeft, setSprintTimeLeft] = useState(10);
  const [sprintLeaderboard, setSprintLeaderboard] = useState<any[]>([]);

  const [levelUpData, setLevelUpData] = useState<{ show: boolean, newLevel: number, bonusGold: number, color: string } | null>(null);

  const levelData = useMemo(() => calculateLevelData(currentPlayer.cumulative_xp ?? currentPlayer.xp ?? 0), [currentPlayer.cumulative_xp, currentPlayer.xp]);
  const currentVisualLvl = levelData.level;
  const rankInfo = useMemo(() => getRankInfo(currentVisualLvl), [currentVisualLvl]);

  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const { data, error } = await supabase.rpc('get_server_time');
        if (data && !error) {
          const serverTime = new Date(data).getTime();
          const localTime = new Date().getTime();
          setTimeOffset(serverTime - localTime);
        }
      } catch (err) {}
    };
    fetchServerTime();
  }, []);

  const getRealTime = useCallback(() => new Date(Date.now() + timeOffset), [timeOffset]);

  const realNow = getRealTime();
  const isFriday = selectedDate.getDay() === 5;
  const todayStr = getSystemDateStr(realNow);
  const selStr = getSystemDateStr(selectedDate);
  
  const isToday = selStr === todayStr;
  const isLocked = useCallback(() => !isToday, [isToday]);

  const changeDate = useCallback((offset: number) => {
    playHoverSound();
    setSelectedDate((prev) => {
      const newD = new Date(prev); newD.setDate(newD.getDate() + offset);
      const today = getRealTime(); 
      today.setHours(23, 59, 59, 999);
      if (newD > today) return prev;
      return new Date(newD);
    });
  }, [getRealTime]);

  const getLogDate = useCallback(() => {
    const logDate = new Date(selectedDate); 
    const now = getRealTime();
    logDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    return logDate.toISOString();
  }, [selectedDate, getRealTime]);

  const getDynamicDesc = useCallback((quest: any) => {
    if (quest.id === SHARED_NUTRITION.id) {
      const weight = currentPlayer.weight || 75;
      const minProtein = Math.round(weight * 1.7);
      const maxProtein = Math.round(weight * 2.2);
      return `${quest.desc} (هدفك: ${minProtein}g - ${maxProtein}g بروتين).`;
    }
    return quest.desc;
  }, [currentPlayer.weight]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = getRealTime();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const diff = endOfMonth.getTime() - now.getTime();
      if (diff > 0) {
        setTimeLeft({ days: Math.floor(diff / (1000 * 60 * 60 * 24)), hours: Math.floor((diff / (1000 * 60 * 60)) % 24), minutes: Math.floor((diff / 1000 / 60) % 60) });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); 
    return () => clearInterval(timer);
  }, [timeOffset, getRealTime]);

  useEffect(() => {
    const fetchRadarNews = async () => {
      try {
        const { data } = await supabase.from('global_news').select('*').order('created_at', { ascending: false }).limit(5);
        if (data && data.length > 0) setSystemLogs(data.map((news) => `🌍 ${news.title}: ${news.content}`));
        else setSystemLogs(['📡 Scanning for Command Transmissions... No active broadcasts.']);
      } catch (e) {}
    };
    fetchRadarNews();

    const newsSub = supabase.channel('public:global_news').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_news' }, payload => {
        setSystemLogs(prev => [`🌍 ${payload.new.title}: ${payload.new.content}`, ...prev.slice(0, 4)]);
        toast.info(payload.new.title, { description: payload.new.content, style: { background: '#020617', border: '1px solid #0ea5e9', color: '#0ea5e9' } });
      }).subscribe();

    return () => { supabase.removeChannel(newsSub); };
  }, []);

  useEffect(() => {
    const syncData = async () => {
      setIsLoadingSync(true);
      try {
        const { data: userData } = await supabase.from('elite_players').select('*').eq('name', currentPlayer.name).single();

        if (userData && setPlayer) {
          const fetchedLvl = calculateLevelData(userData.cumulative_xp || userData.xp || 0).level;
          if (prevLevelRef.current !== null && fetchedLvl > prevLevelRef.current) {
            playDashSound('levelUp');
            const newRankInfo = getRankInfo(fetchedLvl);
            setLevelUpData({ show: true, newLevel: fetchedLvl, bonusGold: 0, color: newRankInfo.color });
            confetti({ particleCount: 300, spread: 150, startVelocity: 40, origin: { y: 0.6 }, colors: [newRankInfo.color, '#ffffff', '#eab308'] });
            setTimeout(() => setLevelUpData(null), 5000);
          }
          prevLevelRef.current = fetchedLvl;

          let fetchedHp = userData.hp ?? 100;
          let fetchedGold = userData.gold || 0;
          let fetchedStreak = userData.streak || 0;
          let lastPenaltyCheck = userData.last_penalty_check || todayStr;

          let fetchedCustomFoods = userData.custom_foods || [];
          setCustomFoods(fetchedCustomFoods);

          let fetchedMacros = userData.daily_macros || { protein: 0, carbs: 0, fats: 0, calories: 0, log: [] };
          let lastMacroDate = userData.last_macro_date; 

          if (lastMacroDate !== todayStr) {
             fetchedMacros = { protein: 0, carbs: 0, fats: 0, calories: 0, log: [] };
             await supabase.from('elite_players').update({ daily_macros: fetchedMacros, last_macro_date: todayStr }).eq('name', currentPlayer.name);
          }
          setDailyMacros(fetchedMacros);

          let checkDate = new Date(lastPenaltyCheck); checkDate.setDate(checkDate.getDate() + 1);
          const yesterdayObj = new Date(realNow); yesterdayObj.setDate(yesterdayObj.getDate() - 1);
          
          let applyPenalty = false; let daysMissedCount = 0; let hpPenaltyAmount = 0;

          while (checkDate <= yesterdayObj) {
            const checkStr = getSystemDateStr(checkDate);
            const dayStart = new Date(checkDate); dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(checkDate); dayEnd.setHours(23, 59, 59, 999);

            const { data: dayReqs } = await supabase.from('elite_quests').select('task_name, status').eq('player_name', currentPlayer.name).gte('created_at', dayStart.toISOString()).lte('created_at', dayEnd.toISOString());
            const mandatoryTasks = ['Practice', 'Practice (Rehab)', 'Hydration Target (3L)', 'Nutritional Compliance', 'Functional Mobility'];
            const completedMandatory = dayReqs ? dayReqs.filter(r => mandatoryTasks.includes(r.task_name) && r.status === 'approved').map(r => r.task_name) : [];
            const missedTasksCount = mandatoryTasks.length - completedMandatory.length;
            if (missedTasksCount > 0) hpPenaltyAmount += (missedTasksCount * 15);
            if (completedMandatory.length < 3) { fetchedStreak = 0; applyPenalty = true; daysMissedCount++; }
            lastPenaltyCheck = checkStr; checkDate.setDate(checkDate.getDate() + 1);
          }

          if (applyPenalty || hpPenaltyAmount > 0) {
            const penaltyStats = getPenaltyStats(calculateLevelData(userData.cumulative_xp || userData.xp || 0).level);
            const goldLost = applyPenalty ? (daysMissedCount * penaltyStats.gold) : 0;
            fetchedHp = Math.max(0, fetchedHp - hpPenaltyAmount); fetchedGold = Math.max(0, fetchedGold - goldLost);
            await supabase.from('elite_players').update({ hp: fetchedHp, gold: fetchedGold, streak: fetchedStreak, last_penalty_check: lastPenaltyCheck }).eq('name', currentPlayer.name);
            if (hpPenaltyAmount > 0) toast.error(`🩸 تم خصم ${hpPenaltyAmount} HP لعدم استكمال مهام الأيام السابقة.`, { duration: 6000, style: { background: '#2a0808', color: '#ef4444', border: '1px solid #ef4444'} });
            if (applyPenalty) toast.error(`💔 تم كسر الـ Streak وخصم ${goldLost} Gold بسبب التقصير!`, { duration: 6000, style: { background: '#450a0a', color: '#fca5a5', border: '1px solid #ef4444'} });
          } else if (lastPenaltyCheck !== userData.last_penalty_check) {
            await supabase.from('elite_players').update({ last_penalty_check: lastPenaltyCheck }).eq('name', currentPlayer.name);
          }

          setPlayer({ ...currentPlayer, ...userData, hp: fetchedHp, gold: fetchedGold, streak: fetchedStreak, custom_foods: fetchedCustomFoods });
        }

        const fetchStart = new Date(selectedDate); fetchStart.setDate(fetchStart.getDate() - 30); 
        const { data: reqs } = await supabase.from('elite_quests').select('*').eq('player_name', currentPlayer.name).gte('created_at', fetchStart.toISOString());
        if (reqs) {
          const startOfDay = new Date(selectedDate); startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(selectedDate); endOfDay.setHours(23, 59, 59, 999);
          const validReqs = reqs.filter(r => {
              if (['Recovery Logistics', 'Supplement Inventory', 'InBody Assessment'].includes(r.task_name)) return true; 
              const taskTime = new Date(r.created_at).getTime(); return taskTime >= startOfDay.getTime() && taskTime <= endOfDay.getTime();
          });
          setCompletedQuests(validReqs.filter(r => r.status === 'approved').map(r => r.task_name));
          setPendingQuests(validReqs.filter(r => r.status === 'pending').map(r => r.task_name));
        }
      } catch (e) {}
      setIsLoadingSync(false);
    };
    syncData();
  }, [selStr, timeOffset]);

  const fetchGameLeaderboards = async () => {
    try {
      const { data: reactData } = await supabase.from('reaction_scores').select('*').order('best_time', { ascending: true }).limit(10);
      if (reactData) setReactionLeaderboard(reactData);
      const { data: sprintData } = await supabase.from('finger_sprint_scores').select('*').order('best_score', { ascending: false }).limit(10);
      if (sprintData) setSprintLeaderboard(sprintData);
    } catch (e) {}
  };

  const handleOpenGame = () => { playHoverSound(); setGameState('idle'); setSprintState('idle'); setReactionTime(null); setSprintScore(0); setReactionAttempt(0); setReactionTimes([]); setGameTab('play'); setShowGameModal(true); };
  const startReactionGame = () => { setGameState('waiting'); setReactionTime(null); const delay = Math.floor(Math.random() * 3000) + 1500; const id = setTimeout(() => { setGameState('ready'); setGameStartTime(Date.now()); playDashSound('gameClick'); }, delay); setGameTimeoutId(id); };

  const handleReactionClick = async () => {
    if (gameState === 'result_final') return; 
    if (gameState === 'idle' || gameState === 'result' || gameState === 'early') { startReactionGame(); } 
    else if (gameState === 'waiting') { playDashSound('error'); if (gameTimeoutId) clearTimeout(gameTimeoutId); setGameState('early'); } 
    else if (gameState === 'ready') {
      playDashSound('complete'); const time = Date.now() - gameStartTime; const newTimes = [...reactionTimes, time]; setReactionTimes(newTimes); const newAttempt = reactionAttempt + 1; setReactionAttempt(newAttempt);
      if (newAttempt < 4) { setReactionTime(time); setGameState('result'); } else {
        const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / 4); setReactionTime(avg); setGameState('result_final');
        try {
          const { data: existing } = await supabase.from('reaction_scores').select('best_time').eq('hunter_name', currentPlayer.name).single();
          if (!existing || avg < existing.best_time) {
            await supabase.from('reaction_scores').upsert({ hunter_name: currentPlayer.name, best_time: avg }, { onConflict: 'hunter_name' });
            if (!existing) toast.success(`New Average: ${avg}ms!`, { style: { background: '#022c22', border: '1px solid #10b981', color: '#10b981' }});
            else toast.success(`New Personal Best! Beat previous by ${existing.best_time - avg}ms!`, { style: { background: '#020617', border: '1px solid #00f2ff', color: '#00f2ff' }});
          }
        } catch (e) {}
      }
    }
  };

  const resetReaction = (e: any) => { e.stopPropagation(); setReactionAttempt(0); setReactionTimes([]); setGameState('idle'); };

  useEffect(() => {
    if (sprintState === 'playing' && sprintTimeLeft > 0) { const timer = setTimeout(() => setSprintTimeLeft(sprintTimeLeft - 1), 1000); return () => clearTimeout(timer); } 
    else if (sprintState === 'playing' && sprintTimeLeft === 0) endSprintGame();
  }, [sprintState, sprintTimeLeft]);

  const endSprintGame = async () => {
    setSprintState('result'); playDashSound('complete');
    try {
      const { data: existing } = await supabase.from('finger_sprint_scores').select('best_score').eq('hunter_name', currentPlayer.name).single();
      if (!existing || sprintScore > existing.best_score) {
        await supabase.from('finger_sprint_scores').upsert({ hunter_name: currentPlayer.name, best_score: sprintScore }, { onConflict: 'hunter_name' });
        if (!existing) toast.success(`New Score: ${sprintScore} Taps!`, { style: { background: '#022c22', border: '1px solid #10b981', color: '#10b981' }});
        else toast.success(`New Personal Best! Beat previous by ${sprintScore - existing.best_score} taps!`, { style: { background: '#020617', border: '1px solid #00f2ff', color: '#00f2ff' }});
      }
    } catch (e) {}
  };

  const handleSprintClick = () => {
    if (sprintState === 'idle' || sprintState === 'result') { setSprintState('playing'); setSprintScore(0); setSprintTimeLeft(10); playDashSound('gameClick'); } 
    else if (sprintState === 'playing') setSprintScore(prev => prev + 1);
  };

  const getStatus = useCallback((title: string) => {
    if (completedQuests.includes(title)) return 'completed';
    if (pendingQuests.includes(title)) return 'pending';
    return 'idle';
  }, [completedQuests, pendingQuests]);

  const handleQuestClick = useCallback((quest: any) => {
    if (isProcessing || isLoadingSync) return;
    if (isLocked()) { playDashSound('error'); toast.error('🔒 SYSTEM LOCKED - المهام أُغلقت في منتصف الليل. لا يمكن التعديل بأثر رجعي.', { style: { background: '#2a0808', color: '#ef4444', border: '1px solid #ef4444' } }); return; }
    
    const status = getStatus(quest.title);
    if (status === 'completed' || status === 'pending') { undoQuest(quest, status); return; }

    if (quest.type === 'nutrition') { playDashSound('openMobility'); setShowNutritionModal(true); }
    else if (quest.type === 'mobilityRoutine') { playDashSound('openMobility'); setShowMobilityModal(true); }
    else if (quest.type === 'honor') { playHoverSound(); setHonorQuestToConfirm(quest); }
    else if (quest.type === 'request') { playHoverSound(); setSelectedQuest(quest); setHasFile(false); }
  }, [isProcessing, isLoadingSync, isLocked, getStatus]);

  // 🚨 Optimistic Macro Add (تحديث سريع للشاشة وإرسال للسيرفر في الخلفية) 🚨
  const handleAddMacros = useCallback((food: any) => {
    playDashSound('request');
    const eatenItem = { ...food, logId: Date.now() };
    
    setDailyMacros(prev => {
      const updatedLog = [...(prev.log || []), eatenItem];
      const newMacros = {
        protein: prev.protein + Number(food.protein || 0), carbs: prev.carbs + Number(food.carbs || 0),
        fats: prev.fats + Number(food.fats || 0), calories: prev.calories + Number(food.calories || 0), log: updatedLog
      };
      
      // إرسال للسيرفر في الخلفية
      supabase.from('elite_players').update({ daily_macros: newMacros }).eq('name', currentPlayer.name).catch(e => console.error(e));
      
      return newMacros;
    });

    toast.success(`تمت إضافة ${food.name} بنجاح!`, { style: { background: '#020617', border: '1px solid #f97316', color: '#f97316' }});
  }, [currentPlayer.name]);

  const handleRemoveConsumedFood = useCallback((itemToRemove: any) => {
    playDashSound('error');
    
    setDailyMacros(prev => {
      const updatedLog = prev.log.filter((item: any) => item.logId !== itemToRemove.logId);
      const newMacros = {
        protein: Math.max(0, prev.protein - Number(itemToRemove.protein || 0)), carbs: Math.max(0, prev.carbs - Number(itemToRemove.carbs || 0)),
        fats: Math.max(0, prev.fats - Number(itemToRemove.fats || 0)), calories: Math.max(0, prev.calories - Number(itemToRemove.calories || 0)), log: updatedLog
      };
      
      supabase.from('elite_players').update({ daily_macros: newMacros }).eq('name', currentPlayer.name).catch(e => console.error(e));
      return newMacros;
    });

    toast.error(`تم مسح ${itemToRemove.name}`, { style: { background: '#2a0808', color: '#ef4444', border: '1px solid #ef4444' }});
  }, [currentPlayer.name]);

  const handleAddCustomFood = () => {
    if (!manualFood.name || manualFood.name.trim() === '') { playDashSound('error'); toast.error('يجب كتابة اسم الوجبة أولاً!'); return; }
    if (!manualFood.protein && !manualFood.carbs && !manualFood.fats && !manualFood.calories) { playDashSound('error'); toast.error('أدخل الماكروز الخاصة بالوجبة!'); return; }

    const newFood = { name: manualFood.name.trim(), protein: Number(manualFood.protein || 0), carbs: Number(manualFood.carbs || 0), fats: Number(manualFood.fats || 0), calories: Number(manualFood.calories || 0), isCustom: true };
    handleAddMacros(newFood);
    
    setCustomFoods(prev => {
      const updatedCustomFoods = [newFood, ...prev];
      supabase.from('elite_players').update({ custom_foods: updatedCustomFoods }).eq('name', currentPlayer.name).catch(e => console.error(e));
      return updatedCustomFoods;
    });
    setManualFood({ name: '', protein: '', carbs: '', fats: '', calories: '' });
  };

  const handleResetMacros = () => {
    playDashSound('error');
    const reset = { protein: 0, carbs: 0, fats: 0, calories: 0, log: [] };
    setDailyMacros(reset);
    supabase.from('elite_players').update({ daily_macros: reset }).eq('name', currentPlayer.name).catch(e => console.error(e));
    toast.error('تم تصفير عداد الوجبات بنجاح!', { style: { background: '#2a0808', color: '#ef4444', border: '1px solid #ef4444' }});
  };

  // 🚨 Optimistic Quest Complete 🚨
  const completeQuest = async (quest: any) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    // تحديث الشاشة فوراً (Optimistic UI)
    setCompletedQuests(prev => [...prev, quest.title]);
    
    try {
      const { error: questError } = await supabase.from('elite_quests').insert([{ player_name: currentPlayer.name, task_name: quest.title, evidence: 'Honor System', type: 'quest', status: 'approved', created_at: getLogDate() }]);
      if (questError) throw new Error("السيرفر مشغول، يرجى المحاولة مرة أخرى!");
      
      let newXp = (currentPlayer.cumulative_xp ?? currentPlayer.xp ?? 0) + quest.exp;
      const currentMonthlyXp = currentPlayer.monthly_xp || 0;
      let newMonthlyXp = currentMonthlyXp + quest.exp;
      let newGold = (currentPlayer.gold || 0) + quest.gold;
      
      const oldLevelData = calculateLevelData(currentPlayer.cumulative_xp ?? currentPlayer.xp ?? 0);
      const newLevelData = calculateLevelData(newXp);
      
      let leveledUp = false; let levelGoldBonus = 0;
      if (newLevelData.level > oldLevelData.level) {
        leveledUp = true;
        const levelsGained = newLevelData.level - oldLevelData.level;
        for(let i=1; i<=levelsGained; i++) { let reachedLvl = oldLevelData.level + i; if (reachedLvl % 5 === 0) levelGoldBonus += 200; else levelGoldBonus += 100; }
      }
      
      newGold += levelGoldBonus;
      const isRecoveryTask = [SHARED_HYDRATION.title, SHARED_NUTRITION.title, SHARED_MOBILITY.title, 'Recovery Cooldown'].includes(quest.title);
      let newHp = Math.min(100, (currentPlayer.hp || 100) + (isRecoveryTask ? 5 : 0));
      
      const dbUpdates = { cumulative_xp: newXp, monthly_xp: newMonthlyXp, gold: newGold, hp: newHp };
      await supabase.from('elite_players').update(dbUpdates).eq('name', currentPlayer.name);
      await supabase.from('elite_economy').insert([{ player_name: currentPlayer.name, amount: quest.exp, currency: 'xp', operation: 'increase', reason: quest.title }]);
      if (levelGoldBonus > 0) await supabase.from('elite_economy').insert([{ player_name: currentPlayer.name, amount: levelGoldBonus, currency: 'gold', operation: 'increase', reason: 'Level Up Bonus' }]);
      
      setPlayer((prev: any) => ({ ...prev, ...dbUpdates })); 
      
      if (leveledUp) {
        playDashSound('levelUp');
        const newRankInfo = getRankInfo(newLevelData.level);
        setLevelUpData({ show: true, newLevel: newLevelData.level, bonusGold: levelGoldBonus, color: newRankInfo.color });
        confetti({ particleCount: 300, spread: 150, startVelocity: 40, origin: { y: 0.6 }, colors: [newRankInfo.color, '#ffffff', '#eab308'] });
        setTimeout(() => setLevelUpData(null), 5000); 
      } else {
        playDashSound('complete'); 
        // 🚨 Confetti خفيف لكل مهمة عادية 🚨
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: [quest.color, '#ffffff'] });
        toast.success(`Completed! +${quest.exp} EXP`);
        if (isRecoveryTask) toast.success(`+5 HP Restored 🩸`, { style: { background: '#022c22', color: '#10b981', border: '1px solid #10b981' } });
      }
    } catch (err: any) { 
      playDashSound('error');
      // التراجع عن التحديث لو السيرفر فشل
      setCompletedQuests(prev => prev.filter(t => t !== quest.title));
      toast.error(err.message, { style: { background: '#2a0808', color: '#ef4444', border: '1px solid #ef4444' } }); 
    } finally {
      setIsProcessing(false);
    }
  };

  const submitRequest = async () => {
    setIsProcessing(true);
    setPendingQuests(prev => [...prev, selectedQuest.title]); // Optimistic Update

    try {
      const { error: reqError } = await supabase.from('elite_quests').insert([{ player_name: currentPlayer.name, task_name: selectedQuest.title, evidence: selectedQuest.noImage ? 'Awaiting Coach' : hasFile ? '📷 Attached' : 'No Evidence', type: selectedQuest.isPenalty ? 'penalty' : 'quest', status: 'pending', created_at: getLogDate() }]);
      if (reqError) throw new Error("تعذر إرسال الطلب، السيرفر مشغول.");
      
      let newHp = Math.min(100, (currentPlayer.hp || 100) + (selectedQuest.id === 'wq1' ? 20 : 0));
      await supabase.from('elite_players').update({ hp: newHp }).eq('name', currentPlayer.name);
      
      setPlayer((prev: any) => ({ ...prev, hp: newHp }));
      playDashSound('request'); toast.success(`Request Sent to Coach Radar!`);
    } catch (err: any) { 
      playDashSound('error');
      setPendingQuests(prev => prev.filter(t => t !== selectedQuest.title)); // Rollback
      toast.error(err.message, { style: { background: '#2a0808', color: '#ef4444', border: '1px solid #ef4444' } }); 
    } finally {
      setSelectedQuest(null); setIsProcessing(false);
    }
  };

  const undoQuest = async (quest: any, status: string) => {
    setIsProcessing(true);
    
    // Optimistic UI Removal
    if (status === 'completed') setCompletedQuests(prev => prev.filter(t => t !== quest.title));
    else setPendingQuests(prev => prev.filter(t => t !== quest.title));

    try {
      const startOfDay = new Date(selectedDate); startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate); endOfDay.setHours(23, 59, 59, 999);

      const { data: existingReqs } = await supabase.from('elite_quests').select('id').eq('player_name', currentPlayer.name).eq('task_name', quest.title).gte('created_at', startOfDay.toISOString()).lte('created_at', endOfDay.toISOString());

      if (!existingReqs || existingReqs.length === 0) {
        toast.error('المهمة دي ملغية بالفعل!'); setIsProcessing(false); return;
      }

      await supabase.from('elite_quests').delete().eq('id', existingReqs[0].id);

      if (status === 'completed') {
        let newXp = Math.max(0, (currentPlayer.cumulative_xp ?? currentPlayer.xp ?? 0) - quest.exp);
        let newMonthlyXp = Math.max(0, (currentPlayer.monthly_xp || 0) - quest.exp);
        let newGold = Math.max(0, (currentPlayer.gold || 0) - quest.gold);
        const isRecoveryTask = [SHARED_HYDRATION.title, SHARED_NUTRITION.title, SHARED_MOBILITY.title, 'Recovery Cooldown'].includes(quest.title);
        let newHp = Math.max(0, (currentPlayer.hp || 100) - (isRecoveryTask ? 5 : 0));

        await supabase.from('elite_players').update({ cumulative_xp: newXp, monthly_xp: newMonthlyXp, gold: newGold, hp: newHp }).eq('name', currentPlayer.name);
        await supabase.from('elite_economy').insert([{ player_name: currentPlayer.name, amount: quest.exp, currency: 'xp', operation: 'decrease', reason: `Player Reverted: ${quest.title}` }]);

        setPlayer((prev: any) => ({ ...prev, cumulative_xp: newXp, monthly_xp: newMonthlyXp, gold: newGold, hp: newHp }));
      }
      playDashSound('error'); toast.error('Reverted.');
    } catch (err: any) { toast.error(err.message); }
    setIsProcessing(false);
  };

  const handleFileUpload = (e: any) => { if (e.target.files && e.target.files.length > 0) { setHasFile(true); playDashSound('complete'); } };
  const completeMobilityRoutine = () => { const mobilityQuest = DAILY_QUESTS.find((q) => q.type === 'mobilityRoutine'); if (mobilityQuest) { setShowMobilityModal(false); setTimeout(() => setHonorQuestToConfirm(mobilityQuest), 200); } };

  const renderRightAction = (status: string, type: string) => {
    if (status === 'completed') return <CheckCircle size={22} color="#10b981" />;
    if (status === 'pending') return <Clock size={22} color="#facc15" />;
    if (isLocked()) return <Lock size={20} color="#334155" />;
    if (type === 'mobilityRoutine' || type === 'nutrition') return <PlusCircle size={22} color={type === 'nutrition' ? '#f97316' : '#10b981'} />;
    if (type === 'request') return <Camera size={20} color="#64748b" />;
    return <Circle size={22} color="#334155" />;
  };

  const isPenaltyPending = pendingQuests.includes(PENALTY_QUEST.title);
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' }).toUpperCase();
  const seasonName = `SEASON: ${currentMonthName} WARFARE`; 
  
  const actualMonthlyXp = currentPlayer.monthly_xp || 0;
  const seasonLevel = Math.floor(actualMonthlyXp / 500) + 1; 
  const xpInCurrentLevel = actualMonthlyXp % 500;
  const progressPercent = (xpInCurrentLevel / 500) * 100;

  const targetProtein = Math.round((currentPlayer.weight || 75) * 1.7);
  const maxProtein = Math.round((currentPlayer.weight || 75) * 2.2);
  const isProteinMet = dailyMacros.protein >= targetProtein;
  const proteinProgress = Math.min(100, (dailyMacros.protein / targetProtein) * 100);

  const allSearchableFoods = useMemo(() => [...customFoods, ...LOCAL_FOOD_DB], [customFoods]);
  const consumedLog = dailyMacros.log || [];

  return (
    <Container initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <Toaster position="top-center" theme="dark" />
      
      <NewsTickerWrapper>
        <TickerIcon><Globe size={18} /></TickerIcon>
        <TickerText>
          {systemLogs.length > 0 ? systemLogs.map((log, i) => <span key={i}>{log}</span>) : <span>📡 Scanning for Command Transmissions... No active broadcasts.</span>}
        </TickerText>
      </NewsTickerWrapper>

      <DynamicHeader $color={rankInfo.color} $shadow={rankInfo.glow}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', color: rankInfo.color, display: 'flex', alignItems: 'center', gap: 10 }}><Activity color={rankInfo.color} /> PERFORMANCE HUB</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>RANK: <span style={{ color: rankInfo.color, fontWeight: '900' }}>{rankInfo.name}</span></div>
        </div>
        <div style={{ textAlign: 'right' }}>
           <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}>🔥 STREAK: <span style={{ color: '#fff' }}>{currentPlayer.streak}</span></div>
           <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: 'bold' }}>❤️ HP: <span style={{ color: '#fff' }}>{currentPlayer.hp}</span></div>
        </div>
      </DynamicHeader>

      <DateNav>
        <NavBtn onClick={() => changeDate(-1)}><ChevronLeft /></NavBtn>
        <DateDisplay>
          <div className="day">{isToday ? 'TODAY' : selStr}</div>
          <div className="full-date">{isLocked() ? '🔒 SYSTEM LOCKED' : '🔓 OPEN'}</div>
        </DateDisplay>
        <NavBtn onClick={() => changeDate(1)} disabled={isToday}><ChevronRight /></NavBtn>
      </DateNav>

      {isLocked() && (
        <div style={{ textAlign: 'center', background: '#2a0808', border: '1px solid #ef4444', padding: '12px', borderRadius: '12px', color: '#fca5a5', marginBottom: '20px', fontSize: '12px', fontWeight: 'bold' }}>
          <Lock size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} /> SYSTEM LOCKED: المهام أُغلقت في منتصف الليل. لا يمكن التعديل بأثر رجعي.
        </div>
      )}

      {currentPlayer.active_penalty && (
        <PenaltyBanner $isPending={isPenaltyPending}>
          {isPenaltyPending ? <Clock size={18} /> : <AlertTriangle size={18} />}
          {isPenaltyPending ? 'DISCIPLINARY PENDING: AWAITING COACH VERIFICATION' : 'SYSTEM PENALTY ACTIVE: EXECUTE DISCIPLINARY DIRECTIVE'}
        </PenaltyBanner>
      )}

      <SeasonCard>
        <SeasonHeader>
          <SeasonTitleText><Trophy size={20} color="#38bdf8" /> {seasonName}</SeasonTitleText>
          <CountdownBadge><Timer size={14} /> {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m</CountdownBadge>
        </SeasonHeader>
        <SeasonLevelInfo><span>SEASON PASS TIER {seasonLevel}</span><span>{xpInCurrentLevel} / 500 EXP</span></SeasonLevelInfo>
        <ProgressBarBG><ProgressBarFill $progress={progressPercent} /></ProgressBarBG>
      </SeasonCard>

      {currentPlayer.active_penalty && (
        <>
          <SectionTitle $color="#ef4444"><ShieldAlert size={18} /> DISCIPLINARY QUEST</SectionTitle>
          <QuestCard $status={getStatus(PENALTY_QUEST.title)} $isPenalty={true} $isLocked={isLocked()} $glowColor="#ef4444" onClick={() => handleQuestClick(PENALTY_QUEST)} whileTap={{ scale: isLocked() ? 1 : 0.98 }}>
            <LeftContent>
              <IconWrapper $color={PENALTY_QUEST.color}><PENALTY_QUEST.icon size={24} color={PENALTY_QUEST.color} /></IconWrapper>
              <TextContent>
                <QuestTitle $status={getStatus(PENALTY_QUEST.title)} $isPenalty={true}>{PENALTY_QUEST.title}</QuestTitle>
                <QuestDesc>{PENALTY_QUEST.desc}</QuestDesc>
              </TextContent>
            </LeftContent>
            <RightAction $type={PENALTY_QUEST.type} $status={getStatus(PENALTY_QUEST.title)}>
              {renderRightAction(getStatus(PENALTY_QUEST.title), PENALTY_QUEST.type)}
            </RightAction>
          </QuestCard>
        </>
      )}

      <SectionTitle $color={rankInfo.color}><Zap size={16} /> DAILY DIRECTIVES</SectionTitle>
      {DAILY_QUESTS.map((quest) => {
        const status = getStatus(quest.title); 
        return (
          <QuestCard key={quest.id} $status={status} $isLocked={isLocked()} $glowColor={quest.color} onClick={() => !isLocked() && handleQuestClick(quest)}>
            <LeftContent>
              <IconWrapper $color={quest.color}><quest.icon size={24} color={quest.color} /></IconWrapper>
              <TextContent>
                <QuestTitle $status={status}>{quest.title}</QuestTitle>
                <QuestDesc>{getDynamicDesc(quest)}</QuestDesc>
                <Rewards>
                   <span style={{ color: '#00f2ff', display: 'flex', alignItems: 'center' }}><AnimatedExpStar /> +{quest.exp} XP</span> 
                   <span style={{ color: '#eab308', display: 'flex', alignItems: 'center' }}><AnimatedCoin /> +{quest.gold} GOLD</span>
                </Rewards>
              </TextContent>
            </LeftContent>
            <RightAction $type={quest.type} $status={status}>
               {renderRightAction(status, quest.type)}
            </RightAction>
          </QuestCard>
        );
      })}

      {isFriday && (
        <>
          <SectionTitle $color="#ef4444"><AlertTriangle size={18} /> FRIDAY CRITICAL DIRECTIVES</SectionTitle>
          {FRIDAY_DIRECTIVES.map((quest) => {
            const status = getStatus(quest.title);
            return (
              <UrgentCard key={quest.id} $status={status} $isLocked={isLocked()} $glowColor="#ef4444" onClick={() => handleQuestClick(quest)} whileTap={{ scale: isLocked() ? 1 : 0.98 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <IconWrapper $color={quest.color} style={{ background: status === 'completed' ? '#10b98120' : 'rgba(239, 68, 68, 0.15)' }}>
                    <quest.icon size={24} color={status === 'completed' ? '#10b981' : quest.color} />
                  </IconWrapper>
                  <TextContent style={{ flex: 1 }}>
                    <QuestTitle $status={status} style={{ color: status === 'completed' ? '#10b981' : '#fff' }}>{quest.title}</QuestTitle>
                    <QuestDesc style={{ color: status === 'completed' ? '#10b981' : '#fca5a5' }}>{quest.desc}</QuestDesc>
                    <Rewards>
                      <span style={{ color: status === 'completed' ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center' }}><AnimatedExpStar /> +{quest.exp} XP</span>
                      <span style={{ color: '#eab308', display: 'flex', alignItems: 'center' }}><AnimatedCoin /> +{quest.gold} GOLD</span>
                    </Rewards>
                  </TextContent>
                  <RightAction $type={quest.type} $status={status}>{renderRightAction(status, quest.type)}</RightAction>
                </div>
              </UrgentCard>
            );
          })}
        </>
      )}

      <SectionTitle $color="#eab308"><Star size={18} /> BI-WEEKLY LOGISTICS (14 DAYS)</SectionTitle>
      {BIWEEKLY_QUESTS.map((quest) => {
        const status = getStatus(quest.title);
        return (
          <QuestCard key={quest.id} $status={status} $isLocked={isLocked()} $glowColor={quest.color} onClick={() => !isLocked() && handleQuestClick(quest)}>
            <LeftContent>
              <IconWrapper $color={quest.color}><quest.icon size={24} color={quest.color} /></IconWrapper>
              <TextContent>
                <QuestTitle $status={status}>{quest.title}</QuestTitle>
                <QuestDesc>{quest.desc}</QuestDesc>
                <Rewards>
                   <span style={{ color: '#00f2ff', display: 'flex', alignItems: 'center' }}><AnimatedExpStar /> +{quest.exp} XP</span> 
                   <span style={{ color: '#eab308', display: 'flex', alignItems: 'center' }}><AnimatedCoin /> +{quest.gold} GOLD</span>
                </Rewards>
              </TextContent>
            </LeftContent>
            <RightAction $type={quest.type} $status={status}>
               {renderRightAction(status, quest.type)}
            </RightAction>
          </QuestCard>
        );
      })}

      <SectionTitle $color="#06b6d4"><Database size={18} /> MONTHLY CYCLE</SectionTitle>
      {MONTHLY_QUESTS.map((quest) => {
        const status = getStatus(quest.title);
        return (
          <QuestCard key={quest.id} $status={status} $isLocked={isLocked()} $glowColor={quest.color} onClick={() => handleQuestClick(quest)}>
            <LeftContent>
              <IconWrapper $color={quest.color}><quest.icon size={24} color={quest.color} /></IconWrapper>
              <TextContent>
                <QuestTitle $status={status}>{quest.title}</QuestTitle>
                <QuestDesc>{quest.desc}</QuestDesc>
                <Rewards>
                   <span style={{ color: '#00f2ff', display: 'flex', alignItems: 'center' }}><AnimatedExpStar /> +{quest.exp} XP</span> 
                   <span style={{ color: '#eab308', display: 'flex', alignItems: 'center' }}><AnimatedCoin /> +{quest.gold} GOLD</span>
                </Rewards>
              </TextContent>
            </LeftContent>
            <RightAction $type={quest.type} $status={status}>
               {renderRightAction(status, quest.type)}
            </RightAction>
          </QuestCard>
        );
      })}

      <AnimatePresence>
        {showGameModal && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ zIndex: 300 }}>
            <ModalContent $color={activeGame === 'reaction' ? '#a855f7' : '#0ea5e9'} initial={{ scale: 0.9 }}>
              <button onClick={() => setShowGameModal(false)} style={{ position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={24} /></button>
              <h2 style={{ color: activeGame === 'reaction' ? '#a855f7' : '#0ea5e9', fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8 }}><Gamepad2 size={20} /> ELITE ARCADE</h2>
              
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <GameSelectorBtn $active={activeGame === 'reaction'} $color="#a855f7" onClick={() => { setActiveGame('reaction'); setGameTab('play'); }}><Zap size={14} /> Reflex</GameSelectorBtn>
                <GameSelectorBtn $active={activeGame === 'sprint'} $color="#0ea5e9" onClick={() => { setActiveGame('sprint'); setGameTab('play'); }}><MousePointerClick size={14} /> Sprint</GameSelectorBtn>
              </div>

              <NutriTabs style={{ marginBottom: 20 }}>
                <NutriTab type="button" $active={gameTab === 'play'} onClick={(e) => { e.preventDefault(); playHoverSound(); setGameTab('play'); }}>Play <Gamepad2 size={14} style={{ verticalAlign: 'middle' }} /></NutriTab>
                <NutriTab type="button" $active={gameTab === 'leaderboard'} onClick={(e) => { e.preventDefault(); playHoverSound(); fetchGameLeaderboards(); setGameTab('leaderboard'); }}>Leaderboard <Trophy size={14} style={{ verticalAlign: 'middle' }} /></NutriTab>
              </NutriTabs>

              {activeGame === 'reaction' && gameTab === 'play' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ textAlign: 'center', marginBottom: 10, fontSize: 12, color: '#a855f7', fontWeight: 'bold' }}>
                    {reactionAttempt < 4 ? `Attempt: ${reactionAttempt + 1} / 4` : `Perfect!`}
                  </div>
                  <GameArea $state={gameState} onClick={handleReactionClick}>
                    {gameState === 'idle' && <GameText>CLICK TO START</GameText>}
                    {gameState === 'waiting' && <GameText>WAIT...</GameText>}
                    {gameState === 'ready' && <GameText style={{ color: '#000' }}>CLICK NOW!</GameText>}
                    {gameState === 'result' && <GameText>{reactionTime} ms</GameText>}
                    {gameState === 'result_final' && (
                      <>
                        <GameText style={{ color: '#eab308' }}>{reactionTime} ms</GameText>
                        <GameSubText style={{ color: '#eab308' }}>AVERAGE SCORE!</GameSubText>
                        <button onClick={resetReaction} style={{ marginTop: 15, background: '#a855f7', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', zIndex: 10 }}>TRY AGAIN</button>
                      </>
                    )}
                    {gameState === 'early' && <GameText>TOO EARLY!</GameText>}
                  </GameArea>
                </motion.div>
              )}

              {activeGame === 'sprint' && gameTab === 'play' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <GameArea $state={sprintState === 'playing' ? 'ready' : sprintState === 'result' ? 'result' : 'idle'} onClick={handleSprintClick}>
                    {sprintState === 'idle' && <GameText>CLICK TO START</GameText>}
                    {sprintState === 'playing' && <GameText style={{ fontSize: 40, color: '#000' }}>{sprintScore}</GameText>}
                    {sprintState === 'result' && <GameText style={{ fontSize: 36 }}>{sprintScore} Taps</GameText>}
                  </GameArea>
                </motion.div>
              )}

              {gameTab === 'leaderboard' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {activeGame === 'reaction' && (
                    <>
                      <div style={{ textAlign: 'center', marginBottom: 10, color: '#a855f7', fontWeight: 'bold', fontSize: 12 }}>Top 10 Fastest Reflexes</div>
                      {reactionLeaderboard.length === 0 ? (
                         <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '12px', background: '#1e293b50', borderRadius: '12px' }}>No scores yet. Be the first!</div>
                      ) : (
                        <FoodList style={{ maxHeight: '250px' }}>
                          {reactionLeaderboard.map((score, idx) => (
                            <FoodItem key={score.id} style={{ borderColor: idx === 0 ? '#a855f7' : '#334155', background: idx === 0 ? 'rgba(168, 85, 247, 0.1)' : '#1e293b50' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ fontSize: '16px', fontWeight: '900', color: idx === 0 ? '#a855f7' : '#94a3b8', width: '20px' }}>#{idx + 1}</div>
                                <div style={{ fontSize: '13px', fontWeight: 'bold', color: idx === 0 ? '#a855f7' : '#fff' }}>{score.hunter_name}</div>
                              </div>
                              <div style={{ fontSize: '16px', fontWeight: '900', color: '#00f2ff', display: 'flex', alignItems: 'center', gap: 5 }}><Zap size={14} color="#00f2ff" /> {score.best_time} ms</div>
                            </FoodItem>
                          ))}
                        </FoodList>
                      )}
                    </>
                  )}
                  {activeGame === 'sprint' && (
                    <>
                      <div style={{ textAlign: 'center', marginBottom: 10, color: '#0ea5e9', fontWeight: 'bold', fontSize: 12 }}>Top 10 Fastest Fingers (10s)</div>
                      {sprintLeaderboard.length === 0 ? (
                         <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '12px', background: '#1e293b50', borderRadius: '12px' }}>No scores yet. Be the first!</div>
                      ) : (
                        <FoodList style={{ maxHeight: '250px' }}>
                          {sprintLeaderboard.map((score, idx) => (
                            <FoodItem key={score.id} style={{ borderColor: idx === 0 ? '#0ea5e9' : '#334155', background: idx === 0 ? 'rgba(14, 165, 233, 0.1)' : '#1e293b50' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ fontSize: '16px', fontWeight: '900', color: idx === 0 ? '#0ea5e9' : '#94a3b8', width: '20px' }}>#{idx + 1}</div>
                                <div style={{ fontSize: '13px', fontWeight: 'bold', color: idx === 0 ? '#0ea5e9' : '#fff' }}>{score.hunter_name}</div>
                              </div>
                              <div style={{ fontSize: '16px', fontWeight: '900', color: '#10b981', display: 'flex', alignItems: 'center', gap: 5 }}><Target size={14} color="#10b981" /> {score.best_score} Taps</div>
                            </FoodItem>
                          ))}
                        </FoodList>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      <GameFAB 
        onClick={() => { playHoverSound(); setShowGameModal(true); }}
        animate={{ y: [-5, 5, -5] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        <Gamepad2 size={28} />
      </GameFAB>

      <AnimatePresence>
        {showNutritionModal && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent $color="#f97316" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}>
              <button onClick={() => setShowNutritionModal(false)} style={{ position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={24} /></button>
              
              <h2 style={{ color: '#f97316', margin: '0 0 20px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
                <PieChart size={20} /> LIVE NUTRITION TRACKER
              </h2>

              <MacroGrid>
                <MacroBox style={{ borderColor: isProteinMet ? '#10b981' : '#38bdf8', boxShadow: isProteinMet ? '0 0 10px rgba(16,185,129,0.2)' : 'none' }}>
                  <MacroLabel $color={isProteinMet ? '#10b981' : '#38bdf8'}>PROTEIN</MacroLabel>
                  <MacroValue>{dailyMacros.protein}g</MacroValue>
                </MacroBox>
                <MacroBox>
                  <MacroLabel $color="#eab308">CARBS</MacroLabel>
                  <MacroValue>{dailyMacros.carbs}g</MacroValue>
                </MacroBox>
                <MacroBox>
                  <MacroLabel $color="#ef4444">Fats</MacroLabel>
                  <MacroValue>{dailyMacros.fats}g</MacroValue>
                </MacroBox>
                <MacroBox>
                  <MacroLabel $color="#a855f7">KCAL</MacroLabel>
                  <MacroValue>{dailyMacros.calories}</MacroValue>
                </MacroBox>
              </MacroGrid>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '5px', fontWeight: 'bold' }}>
                  <span>PROTEIN GOAL: {targetProtein}g - {maxProtein}g</span>
                  <span style={{ color: isProteinMet ? '#10b981' : '#38bdf8' }}>{Math.round(proteinProgress)}%</span>
                </div>
                <ProgressBarBG>
                  <ProgressBarFill $progress={proteinProgress} style={{ background: isProteinMet ? '#10b981' : '#38bdf8', boxShadow: `0 0 10px ${isProteinMet ? '#10b981' : '#38bdf8'}` }} />
                </ProgressBarBG>
              </div>

              <ResetMacrosBtn type="button" onClick={handleResetMacros}>
                <RotateCcw size={14} /> تصفير عداد الماكروز بالكامل
              </ResetMacrosBtn>

              <NutriTabs>
                <NutriTab type="button" $active={activeNutriTab === 'search'} onClick={(e) => { e.preventDefault(); playHoverSound(); setActiveNutriTab('search'); }}>البحث <Search size={14} style={{ verticalAlign: 'middle' }} /></NutriTab>
                <NutriTab type="button" $active={activeNutriTab === 'manual'} onClick={(e) => { e.preventDefault(); playHoverSound(); setActiveNutriTab('manual'); }}>إضافة <Plus size={14} style={{ verticalAlign: 'middle' }} /></NutriTab>
                <NutriTab type="button" $active={activeNutriTab === 'log'} onClick={(e) => { e.preventDefault(); playHoverSound(); setActiveNutriTab('log'); }}>وجبات اليوم <List size={14} style={{ verticalAlign: 'middle' }} /></NutriTab>
              </NutriTabs>

              {activeNutriTab === 'search' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <FoodSearchInput type="text" placeholder="ابحث عن وجبتك..." value={foodSearchQuery} onChange={(e) => setFoodSearchQuery(e.target.value)} />
                  <FoodList>
                    {allSearchableFoods.filter(f => f.name.includes(foodSearchQuery)).map((food, idx) => (
                      <FoodItem key={idx}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 'bold', color: food.isCustom ? '#00f2ff' : '#fff' }}>
                            {food.name} {food.isCustom && <span style={{fontSize: 10, background: '#00f2ff20', padding: '2px 6px', borderRadius: 4, marginRight: 5}}>وجبتي</span>}
                          </div>
                          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>P:{food.protein} | C:{food.carbs} | f:{food.fats} | {food.calories}kcal</div>
                        </div>
                        <button type="button" onClick={() => handleAddMacros(food)} style={{ background: '#f97316', border: 'none', padding: '6px 12px', borderRadius: '6px', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}><Plus size={14} /></button>
                      </FoodItem>
                    ))}
                    {allSearchableFoods.filter(f => f.name.includes(foodSearchQuery)).length === 0 && (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '12px' }}>لم يتم العثور على الوجبة. استخدم الإضافة اليدوية.</div>
                    )}
                  </FoodList>
                </motion.div>
              )}

              {activeNutriTab === 'manual' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <FoodSearchInput type="text" placeholder="اسم الوجبة (مثال: وجبة بعد التمرين)..." value={manualFood.name} onChange={(e) => setManualFood({...manualFood, name: e.target.value})} />
                  <ManualInputGrid>
                    <FoodSearchInput type="number" placeholder="Protein (g)" value={manualFood.protein} onChange={(e) => setManualFood({...manualFood, protein: e.target.value})} style={{ marginBottom: 0 }} />
                    <FoodSearchInput type="number" placeholder="Carbs (g)" value={manualFood.carbs} onChange={(e) => setManualFood({...manualFood, carbs: e.target.value})} style={{ marginBottom: 0 }} />
                    <FoodSearchInput type="number" placeholder="Fats (g)" value={manualFood.fats} onChange={(e) => setManualFood({...manualFood, fats: e.target.value})} style={{ marginBottom: 0 }} />
                    <FoodSearchInput type="number" placeholder="Calories" value={manualFood.calories} onChange={(e) => setManualFood({...manualFood, calories: e.target.value})} style={{ marginBottom: 0 }} />
                  </ManualInputGrid>
                  <ActionBtn type="button" $color="#f97316" onClick={(e) => { e.preventDefault(); handleAddCustomFood(); }}>إضافة وحفظ الوجبة <Plus size={16} /></ActionBtn>
                </motion.div>
              )}

              {activeNutriTab === 'log' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {consumedLog.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '12px', background: '#1e293b50', borderRadius: '12px' }}>لم تقم بإضافة أي وجبات اليوم بعد.</div>
                  ) : (
                    <FoodList>
                      {consumedLog.map((item: any, idx: number) => (
                        <FoodItem key={idx} style={{ borderColor: '#ef444450' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{item.name}</div>
                            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>P:{item.protein} | C:{item.carbs} | f:{item.fats} | {item.calories}kcal</div>
                          </div>
                          <button type="button" onClick={() => handleRemoveConsumedFood(item)} style={{ background: '#2a0808', border: '1px solid #ef4444', padding: '6px', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }} title="مسح الوجبة"><Trash2 size={16} /></button>
                        </FoodItem>
                      ))}
                    </FoodList>
                  )}
                </motion.div>
              )}

              <div style={{ borderTop: '1px dashed #334155', marginTop: '20px', paddingTop: '20px' }}>
                <ActionBtn type="button" $color="#10b981" disabled={!isProteinMet || isProcessing} onClick={(e) => { e.preventDefault(); setShowNutritionModal(false); completeQuest(SHARED_NUTRITION); }}>
                  {isProcessing ? <LoadingSpinner size={18} /> : !isProteinMet ? <><Lock size={18} /> MISSION LOCKED (REACH PROTEIN GOAL)</> : <><CheckCircle size={18} /> CLAIM MISSION (+30 EXP)</>}
                </ActionBtn>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {honorQuestToConfirm && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HonorModalContent $color={honorQuestToConfirm.color} initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <div style={{ textAlign: 'center' }}>
                <ShieldAlert size={60} color="#ef4444" style={{ margin: '0 auto 15px auto', filter: 'drop-shadow(0 0 10px rgba(239,68,68,0.8))' }} />
                <h2 style={{ color: '#ef4444', margin: '0 0 10px 0', fontSize: '28px', fontWeight: '900', letterSpacing: '2px' }}>"مَنْ غَشَّنَا فَلَيْسَ مِنَّا"</h2>
                <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.6', margin: '20px 0', fontWeight: 'bold' }}>
                  أنت على وشك تأكيد إتمام مهمة <strong style={{ color: honorQuestToConfirm.color, fontSize: '18px' }}>{honorQuestToConfirm.title}</strong>.<br /><br />
                  بصفتك رياضي (Elite)، هل أنت متأكد أنك أتممتها بصدق تام؟
                </p>
                <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                  <ActionBtn type="button" $color="#334155" onClick={() => setHonorQuestToConfirm(null)} style={{ flex: 1 }}><X size={18} /> تراجع</ActionBtn>
                  <ActionBtn type="button" $color={honorQuestToConfirm.color} disabled={isProcessing} onClick={() => { completeQuest(honorQuestToConfirm); setHonorQuestToConfirm(null); }} style={{ flex: 1, background: honorQuestToConfirm.color, color: '#000' }}>
                    {isProcessing ? <LoadingSpinner size={18} /> : <><CheckCircle size={18} /> أؤكد ذلك</>}
                  </ActionBtn>
                </div>
              </div>
            </HonorModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedQuest && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent $color={selectedQuest.color} initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}>
              <button type="button" onClick={() => setSelectedQuest(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={24} /></button>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'inline-flex', background: `${selectedQuest.color}20`, padding: '15px', borderRadius: '50%', color: selectedQuest.color, marginBottom: '10px', boxShadow: `0 0 20px ${selectedQuest.color}40` }}>
                  <selectedQuest.icon size={40} />
                </div>
                <h2 style={{ margin: '0', fontSize: '20px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>{selectedQuest.title}</h2>
                <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                  {selectedQuest.noImage ? 'هذه المهمة تتطلب مراجعة من المشرف الرياضي (Coach) لتأكيد الحضور.' : 'يرجى إرفاق دليل إتمام المهمة لمراجعته.'}
                </p>
              </div>

              {!selectedQuest.noImage && (
                <div>
                  <input type="file" id="quest-evidence" accept="image/*,video/*" capture="environment" style={{ display: 'none' }} onChange={handleFileUpload} />
                  <UploadBtn htmlFor="quest-evidence" $hasFile={hasFile} $color={selectedQuest.color}>
                    {hasFile ? <CheckCircle size={32} /> : <Camera size={32} />}
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{hasFile ? 'EVIDENCE ATTACHED' : 'UPLOAD PROOF'}</span>
                  </UploadBtn>
                </div>
              )}

              <ActionBtn type="button" $color={selectedQuest.color} onClick={submitRequest} disabled={isProcessing}>
                {isProcessing ? <LoadingSpinner size={20} /> : selectedQuest.noImage ? 'SUBMIT TO COACH' : hasFile ? 'SUBMIT WITH EVIDENCE' : 'SUBMIT REQUEST'}
              </ActionBtn>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMobilityModal && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent $color="#10b981" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              <button type="button" onClick={() => setShowMobilityModal(false)} style={{ position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={24} /></button>
              <h3 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 10, textTransform: 'uppercase', marginTop: 0 }}>
                <Activity /> بروتوكول المرونة الوظيفية
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '400px', overflowY: 'auto', paddingRight: 5, direction: 'rtl' }}>
                {MOBILITY_ROUTINE.map((ex) => (
                  <div key={ex.id} style={{ background: '#020617', border: `1px solid ${ex.color}30`, padding: 12, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: `${ex.color}15`, color: ex.color, padding: 8, borderRadius: 8, flexShrink: 0 }}><ex.icon size={18} /></div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 'bold', color: '#fff' }}>{ex.title}</div>
                      <div style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>{ex.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <ActionBtn type="button" $color="#10b981" onClick={completeMobilityRoutine} disabled={isProcessing} style={{ marginTop: 20 }}>
                {isProcessing ? <LoadingSpinner size={18} /> : <><CheckCircle size={18} /> إتمام الجلسة وتوثيق الأداء</>}
              </ActionBtn>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* 🚨 شاشة Level Up الفخمة (3D Shield & Confetti) 🚨 */}
      <AnimatePresence>
        {levelUpData && levelUpData.show && (
          <LevelUpOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LevelUpCard $color={levelUpData.color} initial={{ scale: 0.5, rotateY: -90, opacity: 0 }} animate={{ scale: 1, rotateY: 0, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }} transition={{ type: 'spring', damping: 15, stiffness: 100 }}>
              <motion.div initial={{ y: -20 }} animate={{ y: [0, -15, 0], rotateY: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <Shield size={100} color={levelUpData.color} style={{ margin: '0 auto 20px auto', filter: `drop-shadow(0 0 30px ${levelUpData.color})` }} />
              </motion.div>
              
              <LevelUpTitle $color={levelUpData.color}>RANK ASCENDED</LevelUpTitle>
              <LevelUpDesc>Your power grows exponentially.</LevelUpDesc>
              
              <div style={{ fontSize: '70px', fontWeight: '900', color: levelUpData.color, textShadow: `0 0 40px ${levelUpData.color}`, marginBottom: '20px', fontFamily: 'Oxanium' }}>
                {levelUpData.newLevel}
              </div>

              {levelUpData.bonusGold > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <LevelUpRewardBox $color={levelUpData.color}>
                    <AnimatedCoin />
                    +{levelUpData.bonusGold} GOLD
                  </LevelUpRewardBox>
                </motion.div>
              )}

              <ActionBtn type="button" $color={levelUpData.color} onClick={() => setLevelUpData(null)}>ACCEPT POWER</ActionBtn>
            </LevelUpCard>
          </LevelUpOverlay>
        )}
      </AnimatePresence>

      {isLoadingSync && <SyncOverlay><Loader size={40} className="animate-spin" /></SyncOverlay>}
    </Container>
  );
};

export default Dashboard;