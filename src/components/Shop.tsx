import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Gem, Flame, Zap, Shield, Crown, Package, Clock, Coffee, Target, 
  Activity, Award, Wind, Footprints, Heart, ChevronUp, Lock, CheckCircle, 
  AlertTriangle, Star, X, Edit2, Trash2, PlusCircle, Save, Medal, Ghost, BatteryCharging
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast, Toaster } from 'sonner';
import confetti from 'canvas-confetti';

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

const playBuy = () => {
  if (!canPlay()) return;
  const ctx = getAudioContext(); if (!ctx) return;
  const osc = ctx.createOscillator(); const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'square'; osc.frequency.setValueAtTime(400, ctx.currentTime); osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1); osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
  osc.start(); osc.stop(ctx.currentTime + 0.5);
};

const playError = () => {
  if (!canPlay()) return;
  const ctx = getAudioContext(); if (!ctx) return;
  const osc = ctx.createOscillator(); const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  osc.start(); osc.stop(ctx.currentTime + 0.3);
};

const playEpicLoot = () => {
  if (!canPlay()) return;
  const ctx = getAudioContext(); if (!ctx) return;
  const osc1 = ctx.createOscillator(); const osc2 = ctx.createOscillator(); const gain = ctx.createGain();
  osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
  osc1.type = 'sine'; osc2.type = 'triangle';
  osc1.frequency.setValueAtTime(400, ctx.currentTime); osc1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.8);
  osc2.frequency.setValueAtTime(600, ctx.currentTime); osc2.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.8);
  gain.gain.setValueAtTime(0, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.2); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.0);
  osc1.start(); osc2.start(); osc1.stop(ctx.currentTime + 2.0); osc2.stop(ctx.currentTime + 2.0);
};

// ==========================================
// 2. الأرواح السحرية (VFX)
// ==========================================
const SpiritWrapper = styled(motion.div)<{ $size: number }>`
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  
  @media (max-width: 480px) {
    width: ${(props) => props.$size * 0.55}px;
    height: ${(props) => props.$size * 0.55}px;
  }
`;

const AnimatedSpirit = ({ type, color, size = 100 }: { type: string, color: string, size?: number }) => {
  return (
    <SpiritWrapper $size={size} animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
      <motion.div
        style={{ position: 'absolute', width: '90%', height: '90%', background: color, filter: 'blur(20px)', borderRadius: '50%', zIndex: 0 }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <div style={{ position: 'relative', zIndex: 1, width: '80%', height: '80%' }}>
        {type === 'wyvern' && (
          <motion.svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', filter: `drop-shadow(0 0 8px ${color})` }} animate={{ rotateY: 360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}>
            <polygon points="50,5 90,50 50,95 10,50" fill="none" stroke={color} strokeWidth="4" />
            <polygon points="50,15 75,50 50,85 25,50" fill={color} opacity="0.8" />
            <circle cx="50" cy="50" r="10" fill="#fff" />
          </motion.svg>
        )}
        {type === 'phoenix' && (
          <motion.svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', filter: `drop-shadow(0 0 10px ${color})` }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
            <path d="M50 10 Q70 40 50 90 Q30 40 50 10" fill={color} opacity="0.9" />
            <path d="M50 30 Q60 50 50 80 Q40 50 50 30" fill="#ff7e67" opacity="0.9" />
            <circle cx="50" cy="65" r="8" fill="#fff" />
          </motion.svg>
        )}
        {type === 'owl' && (
          <motion.svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', filter: `drop-shadow(0 0 15px ${color})` }} animate={{ rotateZ: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="4" strokeDasharray="10 10" />
            <circle cx="50" cy="50" r="30" fill="#1e1b4b" stroke={color} strokeWidth="2" />
            <motion.ellipse cx="50" cy="50" rx="5" ry="20" fill="#fff" animate={{ ry: [20, 2, 20] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 1] }} />
          </motion.svg>
        )}
        {type === 'golem' && (
          <motion.svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', filter: `drop-shadow(0 0 8px ${color})` }} animate={{ rotateZ: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
            <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="#334155" stroke={color} strokeWidth="4" />
            <polygon points="50,20 75,35 75,65 50,80 25,65 25,35" fill="none" stroke={color} strokeWidth="2" />
            <rect x="40" y="40" width="20" height="20" fill={color} />
          </motion.svg>
        )}
        {type === 'wolf' && (
          <motion.svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', filter: `drop-shadow(0 0 10px ${color})` }} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <polygon points="50,10 80,40 50,90 20,40" fill="none" stroke={color} strokeWidth="3" />
            <polygon points="50,20 70,42 50,80 30,42" fill={color} opacity="0.8" />
            <polygon points="50,30 60,45 50,70 40,45" fill="#fff" opacity="0.9" />
          </motion.svg>
        )}
        {type === 'emerald' && (
          <motion.svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', filter: `drop-shadow(0 0 10px ${color})` }} animate={{ rotateZ: -360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
            <path d="M50 10 C 80 10, 90 50, 50 90 C 10 50, 20 10, 50 10 Z" fill="none" stroke={color} strokeWidth="3" />
            <path d="M50 20 C 70 20, 80 50, 50 80 C 20 50, 30 20, 50 20 Z" fill={color} opacity="0.7" />
            <circle cx="50" cy="50" r="10" fill="#fff" />
          </motion.svg>
        )}
      </div>
    </SpiritWrapper>
  );
};

const initializeDefaultItems = async () => {
  const defaults = [
    { name: 'Golden Wyvern Core', description: 'جوهر مالي: يزيد الذهب المكتسب بنسبة 10%.', price: 3000, category: 'pet', color: '#eab308', icon: 'spirit_wyvern', required_rank: 1 },
    { name: 'Healing Phoenix Ember', description: 'جوهر طبي: يعيد 10 HP يومياً عند إكمال المهام.', price: 3000, category: 'pet', color: '#ef4444', icon: 'spirit_phoenix', required_rank: 1 },
    { name: 'Shadow Owl Eye', description: 'جوهر تجاري: يمنحك خصم 10% في المتجر دائماً.', price: 3000, category: 'pet', color: '#a855f7', icon: 'spirit_owl', required_rank: 1 },
    { name: 'Iron Golem Matrix', description: 'جوهر مدافع: يحمي الستريك من الكسر.', price: 3000, category: 'pet', color: '#0ea5e9', icon: 'spirit_golem', required_rank: 1 },
    { name: 'Frost Wolf Soul', description: 'صياد الألعاب: يزيد ذهب الألعاب بنسبة 20%.', price: 3000, category: 'pet', color: '#38bdf8', icon: 'spirit_wolf', required_rank: 1 },
    { name: 'Emerald Dragon Scale', description: 'مخفف الألم: يقلل خسارة الـ HP عند الغياب.', price: 3000, category: 'pet', color: '#10b981', icon: 'spirit_emerald', required_rank: 1 },
    { name: 'Essence Crystal', description: 'يشحن طاقة مرافقك السحري بنسبة 50%.', price: 500, category: 'consumable', color: '#0ea5e9', icon: 'BatteryCharging', required_rank: 1 }
  ];
  
  const { data } = await supabase.from('shop_items').select('name');
  const existingNames = data?.map(d => d.name) || [];
  const missingItems = defaults.filter(item => !existingNames.includes(item.name));
  if (missingItems.length > 0) {
    await supabase.from('shop_items').insert(missingItems);
  }
};

const ICON_MAP: Record<string, any> = { Crown, Activity, Zap, Wind, ChevronUp, Target, Heart, Footprints, Clock, Coffee, Shield, Flame, Star, Package, Award, Ghost, BatteryCharging };

const renderIcon = (iconValue: string, color: string, size: number = 38) => {
  if (iconValue.startsWith('spirit_')) {
    const type = iconValue.replace('spirit_', '');
    return <AnimatedSpirit type={type} color={color} size={size} />;
  }
  if (iconValue.startsWith('/') || iconValue.startsWith('http')) {
    return <img src={iconValue} alt="item" style={{ width: size, height: size, objectFit: 'contain', filter: `drop-shadow(0 0 15px ${color})` }} />;
  }
  const IconComp = ICON_MAP[iconValue] || Star;
  return <IconComp size={size} color={color} />;
};

const getRankInfo = (level: number) => {
  if (level >= 30) return { name: 'ELITE', color: '#a855f7' };
  if (level >= 25) return { name: 'MASTER', color: '#ef4444' };
  if (level >= 20) return { name: 'DIAMOND', color: '#3b82f6' };
  if (level >= 15) return { name: 'PLATINUM', color: '#06b6d4' };
  if (level >= 10) return { name: 'GOLD', color: '#eab308' };
  if (level >= 5)  return { name: 'SILVER', color: '#94a3b8' };
  return { name: 'BRONZE', color: '#b45309' };
};

const calculateLevelData = (totalXp: number) => {
  let level = 1;
  let currentXp = totalXp;
  let expNeededForNextLevel = 650;
  while (currentXp >= expNeededForNextLevel) { currentXp -= expNeededForNextLevel; level++; expNeededForNextLevel = Math.min(level * 150 + 500, 4000); }
  return { level, xpInCurrentLevel: currentXp, expNeededForNextLevel };
};

// ==========================================
// 3. التصميمات المفرودة (Responsive UI)
// ==========================================
const Container = styled(motion.div)` 
  padding: 15px; font-family: 'Oxanium', sans-serif; color: #fff; padding-bottom: 100px; max-width: 800px; margin: 0 auto; position: relative; 
  @media (max-width: 480px) { padding: 10px; }
`;

const Header = styled.div` 
  display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #020617 0%, #1e1b4b 100%); border: 1px solid #6366f1; padding: 20px; border-radius: 20px; margin-bottom: 25px; box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2); position: relative; overflow: hidden; 
  @media (max-width: 480px) { padding: 15px; border-radius: 14px; margin-bottom: 15px; }
`;

const HeaderGlow = styled.div` position: absolute; width: 100px; height: 100px; background: #6366f1; filter: blur(60px); top: -40px; left: -40px; opacity: 0.5; pointer-events: none; `;

const Title = styled.h1` 
  font-size: 20px; margin: 0; color: #e0e7ff; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 1px; font-weight: 900; z-index: 1; 
  @media (max-width: 480px) { font-size: 15px; gap: 6px; }
`;

const GoldDisplay = styled.div` 
  background: rgba(0,0,0,0.6); border: 2px solid #eab308; color: #fde047; padding: 8px 15px; border-radius: 12px; font-size: 16px; font-weight: 900; display: flex; align-items: center; gap: 8px; box-shadow: 0 0 15px rgba(234, 179, 8, 0.3); z-index: 1; backdrop-filter: blur(10px); 
  @media (max-width: 480px) { font-size: 14px; padding: 6px 10px; gap: 5px; border-radius: 8px; border-width: 1px; }
`;

const SectionTitle = styled.h2<{ $color: string }>` 
  font-size: 16px; color: ${(props) => props.$color}; margin: 30px 0 15px 0; text-transform: uppercase; letter-spacing: 2px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid ${(props) => props.$color}40; padding-bottom: 10px; font-weight: 900; text-shadow: 0 0 10px ${(props) => props.$color}80; 
  @media (max-width: 480px) { font-size: 13px; margin: 20px 0 12px 0; letter-spacing: 1px; padding-bottom: 8px; }
`;

// 🚨 تحديث الشبكة عشان تعرض عنصرين جنب بعض في الموبايل 🚨
const ItemGrid = styled.div` 
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; margin-bottom: 30px; 
  @media (max-width: 480px) { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
`;

const cardHover = keyframes` 0% { transform: translateY(0px); box-shadow: 0 5px 20px rgba(0,0,0,0.3); } 100% { transform: translateY(-3px); box-shadow: 0 10px 25px currentColor; } `;

const ExclusiveCard = styled(motion.div)<{ $soldOut: boolean; $color: string }>` 
  background: ${(props) => props.$soldOut ? '#0f172a' : `linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, ${props.$color}15 100%)`}; border: 1px solid ${(props) => props.$soldOut ? '#334155' : props.$color}; border-radius: 16px; padding: 20px; margin-bottom: 0px; position: relative; overflow: hidden; opacity: ${(props) => props.$soldOut ? 0.7 : 1}; transition: all 0.3s ease; color: ${(props) => props.$color}40; 
  display: flex; flex-direction: column; justify-content: space-between;
  &:hover { animation: ${(props) => props.$soldOut ? 'none' : cardHover} 0.4s forwards; border-color: #fff; } 
  @media (max-width: 480px) { padding: 12px 10px; border-radius: 12px; }
`;

const ExclusiveBadge = styled.div<{ $color: string }>` position: absolute; top: 15px; right: -35px; background: ${(props) => props.$color}; color: #000; padding: 4px 40px; transform: rotate(45deg); font-size: 9px; font-weight: 900; letter-spacing: 1px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); z-index: 10; `;

// غلاف للمنتجات العادية عشان يقلب طولي في الموبايل
const NormalItemWrapper = styled.div<{ $isCoachMode: boolean }>`
  display: flex; align-items: center; gap: 15px; margin-top: ${(props) => props.$isCoachMode ? '10px' : '0'};
  @media (max-width: 480px) { flex-direction: column; text-align: center; gap: 8px; margin-top: 5px; }
`;

const IconWrapper = styled.div<{ $color: string }>` 
  width: 55px; height: 55px; border-radius: 15px; background: ${(props) => props.$color}20; border: 1px solid ${(props) => props.$color}; display: flex; align-items: center; justify-content: center; color: ${(props) => props.$color}; flex-shrink: 0; box-shadow: inset 0 0 10px ${(props) => props.$color}40; overflow: hidden; 
  @media (max-width: 480px) { width: 45px; height: 45px; border-radius: 12px; } 
`;

const BuyBtn = styled.button<{ $affordable: boolean; $color?: string }>` 
  background: ${(props) => props.$affordable ? (props.$color || '#10b981') : '#1e293b'}; color: ${(props) => props.$affordable ? '#000' : '#64748b'}; border: ${(props) => props.$affordable ? 'none' : '1px solid #334155'}; padding: 10px 15px; border-radius: 10px; font-family: 'Oxanium'; font-weight: 900; font-size: 13px; cursor: ${(props) => props.$affordable ? 'pointer' : 'not-allowed'}; display: flex; align-items: center; justify-content: center; gap: 6px; transition: 0.3s; width: 100%; letter-spacing: 1px; margin-top: auto;
  &:hover { filter: ${(props) => props.$affordable ? 'brightness(1.2)' : 'none'}; box-shadow: ${(props) => props.$affordable ? `0 0 15px ${props.$color}60` : 'none'}; } 
  @media (max-width: 480px) { padding: 8px; font-size: 10px; border-radius: 8px; gap: 4px; letter-spacing: 0; }
`;

const SoldOutOverlay = styled.div` position: absolute; inset: 0; background: rgba(2, 6, 23, 0.6); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 20; pointer-events: none; `;
const SoldOutText = styled.div` 
  font-size: 20px; font-weight: 900; color: #ef4444; letter-spacing: 2px; text-transform: uppercase; border: 2px solid #ef4444; padding: 6px 15px; border-radius: 10px; transform: rotate(-5deg); background: rgba(239, 68, 68, 0.1); text-shadow: 0 0 10px #ef4444; box-shadow: 0 0 15px rgba(239, 68, 68, 0.2); pointer-events: auto; 
  @media (max-width: 480px) { font-size: 11px; padding: 4px 8px; border-width: 1px; letter-spacing: 0px; text-align: center; }
`;

const ModalOverlay = styled(motion.div)` position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 999999; display: flex; align-items: center; justify-content: center; padding: 15px; backdrop-filter: blur(10px); pointer-events: auto; `;
const ModalContent = styled(motion.div)<{ $color?: string }>` 
  background: linear-gradient(135deg, #0b1120 0%, #020617 100%); border: 1px solid ${(props) => props.$color || '#eab308'}; border-radius: 24px; padding: 35px; width: 100%; max-width: 450px; text-align: center; position: relative; box-shadow: 0 0 60px ${(props) => props.$color ? `${props.$color}50` : 'rgba(234, 179, 8, 0.3)'}; max-height: 90vh; overflow-y: auto; &::-webkit-scrollbar { width: 0px; } 
  @media (max-width: 480px) { padding: 25px 15px; border-radius: 20px; }
`;

const ModalTitle = styled.h2<{ $color?: string }>` color: ${(props) => props.$color || '#eab308'}; margin-top: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; @media (max-width: 480px) { font-size: 16px; } `;
const ModalDesc = styled.div` font-size: 15px; color: #cbd5e1; margin-bottom: 30px; line-height: 1.6; @media (max-width: 480px) { font-size: 13px; margin-bottom: 20px; } `;
const ModalItemName = styled.span<{ $color?: string }>` color: ${(props) => props.$color || '#38bdf8'}; font-size: 22px; font-weight: 900; letter-spacing: 1px; text-shadow: 0 0 15px ${(props) => props.$color || '#38bdf8'}80; @media (max-width: 480px) { font-size: 18px; } `;

const SuccessCardWrapper = styled.div<{ $color: string }>` background: linear-gradient(135deg, ${(props) => props.$color}15, #020617); border: 1px solid ${(props) => props.$color}; border-radius: 20px; padding: 30px 20px; text-align: center; box-shadow: 0 0 50px ${(props) => props.$color}40; max-width: 320px; width: 90vw; @media (max-width: 480px) { padding: 25px 15px; border-radius: 16px; } `;
const SuccessTitle = styled.h1<{ $color: string }>` margin: 0 0 8px 0; color: #fff; font-size: 22px; text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 0 15px ${(props) => props.$color}; @media (max-width: 480px) { font-size: 18px; letter-spacing: 1px; } `;
const SuccessItemName = styled.h2<{ $color: string }>` margin: 0 0 20px 0; color: ${(props) => props.$color}; font-size: 16px; font-weight: bold; @media (max-width: 480px) { font-size: 14px; margin: 0 0 15px 0; } `;

const CoachActions = styled.div` position: absolute; top: 8px; left: 8px; display: flex; gap: 4px; z-index: 30; `;
const CoachBtn = styled.button<{ $color: string }>` background: rgba(2, 6, 23, 0.8); border: 1px solid ${(props) => props.$color}; color: ${(props) => props.$color}; width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; backdrop-filter: blur(5px); &:hover { background: ${(props) => props.$color}; color: #000; box-shadow: 0 0 10px ${(props) => props.$color}; } `;
const AddItemBtn = styled.button` 
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%); color: #10b981; border: 1px dashed #10b981; width: 100%; padding: 15px; border-radius: 12px; margin-bottom: 20px; font-family: 'Oxanium'; font-weight: 900; font-size: 13px; letter-spacing: 1px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: 0.3s; 
  &:hover { background: rgba(16, 185, 129, 0.2); box-shadow: 0 0 15px rgba(16, 185, 129, 0.2); transform: translateY(-2px); } 
  @media (max-width: 480px) { padding: 12px; font-size: 11px; margin-bottom: 15px; }
`;

const EditInput = styled.input` width: 100%; background: rgba(2, 6, 23, 0.8); border: 1px solid #334155; color: #fff; padding: 12px; border-radius: 8px; margin-bottom: 10px; font-family: 'Oxanium'; font-size: 13px; outline: none; transition: 0.3s; &:focus { border-color: #0ea5e9; box-shadow: 0 0 10px rgba(14, 165, 233, 0.3); } @media (max-width: 480px) { padding: 10px; font-size: 11px; } `;
const EditSelect = styled.select` width: 100%; background: rgba(2, 6, 23, 0.8); border: 1px solid #334155; color: #fff; padding: 12px; border-radius: 8px; margin-bottom: 10px; font-family: 'Oxanium'; font-size: 13px; outline: none; cursor: pointer; @media (max-width: 480px) { padding: 10px; font-size: 11px; } `;
const EditTextarea = styled.textarea` width: 100%; background: rgba(2, 6, 23, 0.8); border: 1px solid #334155; color: #fff; padding: 12px; border-radius: 8px; margin-bottom: 10px; font-family: 'Oxanium'; font-size: 13px; outline: none; resize: vertical; min-height: 80px; transition: 0.3s; &:focus { border-color: #0ea5e9; box-shadow: 0 0 10px rgba(14, 165, 233, 0.3); } @media (max-width: 480px) { padding: 10px; font-size: 11px; min-height: 60px; } `;

const LockedOverlay = styled.div` position: absolute; inset: 0; background: rgba(2, 6, 23, 0.5); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 15; border-radius: inherit; pointer-events: none; `;
const LockedText = styled.div<{ $color: string }>` 
  font-size: 12px; font-weight: 900; color: ${(props) => props.$color}; text-transform: uppercase; border: 1px solid ${(props) => props.$color}; padding: 6px 12px; border-radius: 8px; background: rgba(0,0,0,0.8); display: flex; align-items: center; gap: 6px; letter-spacing: 1px; box-shadow: 0 0 15px ${(props) => props.$color}40; pointer-events: auto; 
  @media (max-width: 480px) { font-size: 9px; padding: 4px 6px; flex-direction: column; text-align: center; } 
`;

// 🚨 RTL Direction للموبايل عشان النصوص المتلغبطة 🚨
const PetName = styled.h3<{ $color: string }>` 
  margin: 0; color: ${(props) => props.$color}; font-size: 18px; font-weight: 900; letter-spacing: 1px; 
  @media (max-width: 480px) { font-size: 14px; letter-spacing: 0; } 
`;
const PetDesc = styled.p` 
  margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.5; min-height: 35px; direction: rtl; 
  @media (max-width: 480px) { font-size: 10px; min-height: 35px; line-height: 1.4; text-align: center; } 
`;
const NormalDesc = styled.p`
  margin: 0; font-size: 11px; color: #cbd5e1; line-height: 1.4; direction: rtl; text-align: right;
  @media (max-width: 480px) { font-size: 9px; text-align: center; }
`;

// ==========================================
// 5. المكون الرئيسي (Ultimate Shop)
// ==========================================
const Shop = ({ player, setPlayer }: any) => {
  const levelData = calculateLevelData(player?.cumulative_xp ?? player?.xp ?? 0);
  const currentPlayerLevel = levelData.level;
  
  const [gold, setGold] = useState(player?.gold || 0);
  const [dbItems, setDbItems] = useState<any[]>([]);
  const [claimsList, setClaimsList] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState<{ show: boolean, item: any }>({ show: false, item: null });
  const [successModal, setSuccessModal] = useState<{ show: boolean, item: any }>({ show: false, item: null });
  const [isOpeningBox, setIsOpeningBox] = useState(false);

  const isCoachMode = localStorage.getItem('elite_coach_mode') === 'true';
  const [editModal, setEditModal] = useState<{ show: boolean, item: any | null }>({ show: false, item: null });
  const [formData, setFormData] = useState({ id: '', name: '', description: '', price: 0, category: 'general', color: '#38bdf8', icon: 'Star', max_stock: '', required_rank: 1 });

  useEffect(() => {
    initializeDefaultItems().then(() => fetchShopData());
  }, []);

  const fetchShopData = async () => {
    setLoading(true);
    try {
      const { data: hunterData } = await supabase.from('elite_players').select('gold, pets, active_pet, pet_hunger, titles').eq('name', player.name).single();
      if (hunterData) {
        setGold(hunterData.gold);
        setPlayer((prev: any) => ({ ...prev, gold: hunterData.gold, pets: hunterData.pets, active_pet: hunterData.active_pet, pet_hunger: hunterData.pet_hunger, titles: hunterData.titles }));
      }

      const { data: items } = await supabase.from('shop_items').select('*').order('created_at', { ascending: true });
      if (items) setDbItems(items);

      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      const { data: claims } = await supabase.from('elite_quests')
        .select('player_name, task_name')
        .like('task_name', '%CLAIM]%')
        .gte('created_at', firstDay);

      setClaimsList(claims || []);
    } catch (err) {
      console.error("Shop Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const executePurchase = async () => {
    const { item } = confirmModal;
    setConfirmModal({ show: false, item: null });
    
    if (gold < item.price) { playError(); toast.error('NOT ENOUGH GOLD!'); return; }
    const reqRank = item.required_rank || 1;
    if (currentPlayerLevel < reqRank) { playError(); toast.error('RANK TOO LOW!'); return; }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      let taskName = `[SHOP PURCHASE] ${item.name}`;
      
      if (item.category === 'exclusive') taskName = `[EXCLUSIVE CLAIM] ${item.name}`;
      if (item.category === 'limited') taskName = `[LIMITED CLAIM] ${item.name}`;
      if (item.category === 'title') taskName = `[TITLE UNLOCKED] ${item.name}`;
      if (item.category === 'pet') taskName = `[COMPANION AWAKENED] ${item.name}`;
      if (item.category === 'consumable') taskName = `[ESSENCE PURCHASED] ${item.name}`;

      if (item.category === 'exclusive' || item.category === 'limited') {
        const { data: checkStock } = await supabase.from('elite_quests').select('player_name').eq('task_name', taskName).gte('created_at', firstDay);
        const currentClaimers = checkStock ? checkStock.map(c => c.player_name) : [];
        if (item.max_stock && currentClaimers.length >= item.max_stock) { playError(); toast.error('Sold Out!'); setIsProcessing(false); return; }
        if (currentClaimers.includes(player.name)) { playError(); toast.error('You already claimed this!'); setIsProcessing(false); return; }
      }

      let playerPets = Array.isArray(player.pets) ? player.pets.filter((p: string) => p && p.trim() !== '') : [];
      if (item.category === 'pet') {
        if (playerPets.length >= 2) { playError(); toast.error('الملاذ ممتلئ! حرر روحاً أولاً.'); setIsProcessing(false); return; }
        if (playerPets.includes(item.name)) { playError(); toast.error('تمتلك هذا المرافق بالفعل!'); setIsProcessing(false); return; }
      }

      const newGold = gold - item.price;
      let updatePayload: any = { gold: newGold };
      
      if (item.category === 'title') {
        const currentTitles = player.titles || [];
        updatePayload.titles = Array.from(new Set([item.name, ...currentTitles]));
      }
      
      if (item.category === 'pet') {
        playerPets = [...playerPets, item.name];
        updatePayload.pets = playerPets;
        if (!player.active_pet) { updatePayload.active_pet = item.name; updatePayload.pet_hunger = 100; }
      }

      if (item.category === 'consumable') {
        const currentHunger = player.pet_hunger || 0;
        updatePayload.pet_hunger = Math.min(100, currentHunger + 50); 
      }

      const { error: updateError } = await supabase.from('elite_players').update(updatePayload).eq('name', player.name);
      if (updateError) throw new Error(`Player Update Failed: ${updateError.message}`);
      
      const { error: reqError } = await supabase.from('elite_quests').insert([{
        player_name: player.name, task_name: `[SHOP RECEIPT] ${item.name}`, evidence: `تم الدفع الفوري: ${item.price} Gold.`, type: 'request', status: 'approved' 
      }]);
      if (reqError) throw new Error(`Quest Insert Failed: ${reqError.message}`);

      const { error: ecoError } = await supabase.from('elite_economy').insert([{ player_name: player.name, amount: item.price, currency: 'gold', operation: 'decrease', reason: taskName }]);
      if (ecoError) throw new Error(`Economy Insert Failed: ${ecoError.message}`);

      setGold(newGold);
      const updatedPlayer = { ...player, ...updatePayload };
      setPlayer(updatedPlayer);
      localStorage.setItem('elite_system_active_session', JSON.stringify(updatedPlayer));

      if (item.category === 'pet' || item.category === 'exclusive') {
        setIsOpeningBox(true);
        playEpicLoot();
        setTimeout(() => {
          setIsOpeningBox(false);
          setSuccessModal({ show: true, item });
          confetti({ particleCount: 300, spread: 80, origin: { y: 0.6 }, colors: [item.color, '#FFD700', '#ffffff'], zIndex: 999999 });
        }, 2500);
      } else {
        setSuccessModal({ show: true, item });
        playBuy();
      }

      fetchShopData();
    } catch (err: any) {
      playError(); 
      toast.error(`خطأ: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerConfirm = (item: any) => {
    playClick(); setConfirmModal({ show: true, item });
  };

  const openEditModal = (item?: any) => {
    playClick();
    if (item) {
      setFormData({ id: item.id, name: item.name, description: item.description || '', price: item.price, category: item.category, color: item.color, icon: item.icon, max_stock: item.max_stock ? String(item.max_stock) : '', required_rank: item.required_rank || 1 });
    } else {
      setFormData({ id: '', name: '', description: '', price: 0, category: 'general', color: '#38bdf8', icon: 'Star', max_stock: '', required_rank: 1 });
    }
    setEditModal({ show: true, item: item || null });
  };

  const handleDeleteItem = async (e: any, id: string) => {
    e.stopPropagation();
    if (!window.confirm('متأكد إنك عايز تمسح المنتج ده نهائياً؟')) return;
    playError();
    try {
      await supabase.from('shop_items').delete().eq('id', id);
      toast.success('تم المسح بنجاح');
      setDbItems(dbItems.filter(i => i.id !== id));
    } catch (err) { toast.error('فشل المسح'); }
  };

  const handleSaveItem = async () => {
    setIsProcessing(true);
    try {
      const payload = {
        name: formData.name, description: formData.description, price: Number(formData.price),
        category: formData.category, color: formData.color, icon: formData.icon,
        max_stock: formData.max_stock ? Number(formData.max_stock) : null, required_rank: Number(formData.required_rank)
      };

      if (formData.id) { await supabase.from('shop_items').update(payload).eq('id', formData.id); toast.success('تم التعديل بنجاح'); } 
      else { await supabase.from('shop_items').insert([payload]); toast.success('تمت الإضافة بنجاح'); }
      
      setEditModal({ show: false, item: null });
      fetchShopData();
    } catch (err) { toast.error('حدث خطأ أثناء الحفظ'); }
    setIsProcessing(false);
  };

  const renderCoachControls = (item: any) => {
    if (!isCoachMode) return null;
    return (
      <CoachActions>
        <CoachBtn $color="#0ea5e9" onClick={(e) => { e.stopPropagation(); openEditModal(item); }}><Edit2 size={12} /></CoachBtn>
        <CoachBtn $color="#ef4444" onClick={(e) => handleDeleteItem(e, item.id)}><Trash2 size={12} /></CoachBtn>
      </CoachActions>
    );
  };

  const petsItems = dbItems.filter(i => i.category === 'pet');
  const consumableItems = dbItems.filter(i => i.category === 'consumable');
  const titleItems = dbItems.filter(i => i.category === 'title');

  const renderSection = (title: string, icon: any, items: any[], sectionColor: string) => {
    if (items.length === 0 && !isCoachMode) return null;
    const SectionIcon = icon;

    return (
      <div style={{ marginBottom: '40px' }}>
        <SectionTitle $color={sectionColor}><SectionIcon size={18} /> {title}</SectionTitle>
        <ItemGrid>
          {items.map(item => {
            let playerHasIt = false;
            if (item.category === 'title') playerHasIt = player?.titles?.includes(item.name);
            if (item.category === 'pet') {
              const currentPets = Array.isArray(player?.pets) ? player.pets : [];
              playerHasIt = currentPets.includes(item.name);
            }

            const reqRank = item.required_rank || 1;
            const isRankLocked = currentPlayerLevel < reqRank;
            const rankInfo = getRankInfo(reqRank);

            return (
              <ExclusiveCard key={item.id} $soldOut={playerHasIt} $color={item.color}>
                {renderCoachControls(item)}

                {isRankLocked && !playerHasIt && (
                  <LockedOverlay>
                    <LockedText $color={rankInfo.color}><Lock size={10} /> REQUIRES {rankInfo.name}</LockedText>
                  </LockedOverlay>
                )}

                {item.category === 'pet' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
                    {renderIcon(item.icon, item.color, 110)}
                    <PetName $color={item.color}>{item.name}</PetName>
                    <PetDesc>{item.description}</PetDesc>
                  </div>
                ) : (
                  <NormalItemWrapper $isCoachMode={isCoachMode}>
                    <IconWrapper $color={item.color}>
                      {renderIcon(item.icon, item.color, 24)}
                    </IconWrapper>
                    <div style={{ flex: 1 }}>
                      <PetName $color={item.color} style={{ marginBottom: '4px' }}>{item.name}</PetName>
                      <NormalDesc>{item.description}</NormalDesc>
                    </div>
                  </NormalItemWrapper>
                )}

                <div style={{ marginTop: '15px', position: 'relative', zIndex: 16 }}>
                  {item.category === 'pet' && playerHasIt ? (
                    <SoldOutOverlay style={{ borderRadius: '10px' }}>
                       <SoldOutText>ALREADY OWNED</SoldOutText>
                    </SoldOutOverlay>
                  ) : playerHasIt ? (
                    <BuyBtn $affordable={false} $color={item.color} disabled={true}>ALREADY OWNED</BuyBtn>
                  ) : (
                    <BuyBtn $affordable={gold >= item.price && !isRankLocked} $color={item.color} disabled={gold < item.price || isRankLocked || isProcessing} onClick={() => triggerConfirm(item)}>
                      {isRankLocked ? <><Lock size={12} /> RANK TOO LOW</> : <><Gem size={12} /> {item.price} GOLD</>}
                    </BuyBtn>
                  )}
                </div>
              </ExclusiveCard>
            );
          })}
        </ItemGrid>
      </div>
    );
  };

  const renderModals = () => {
    if (typeof document === 'undefined') return null;
    return createPortal(
      <>
        <AnimatePresence>
          {isOpeningBox && (
            <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ background: 'rgba(0,0,0,0.95)' }}>
              <motion.div animate={{ rotate: [-4, 4, -5, 5, -4, 4, 0], scale: [1, 1.1, 1.15, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.15 }} style={{ textAlign: 'center' }}>
                <svg viewBox="0 0 100 100" style={{ width: '150px', filter: 'drop-shadow(0 0 30px #eab308)', maxWidth: '40vw' }}>
                  <path d="M10 40 L90 40 L85 90 L15 90 Z" fill="#b45309" stroke="#fde047" strokeWidth="4" />
                  <path d="M5 40 Q50 10 95 40 Z" fill="#d97706" stroke="#fde047" strokeWidth="4" />
                  <circle cx="50" cy="40" r="8" fill="#fde047" />
                  <path d="M50 48 L50 60" stroke="#fde047" strokeWidth="4" />
                </svg>
                <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} style={{ color: '#eab308', fontWeight: '900', letterSpacing: '6px', fontSize: '16px', fontFamily: 'Oxanium', marginTop: '15px' }}>
                  UNCOVERING LEGEND...
                </motion.div>
              </motion.div>
            </ModalOverlay>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {confirmModal.show && confirmModal.item && (
            <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ModalContent $color={confirmModal.item.color} initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}>
                <ModalTitle $color={confirmModal.item.color}><Shield size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> SECURITY CHECK</ModalTitle>
                <ModalDesc>
                  Are you sure you want to spend <strong style={{ color: '#eab308', fontSize: '14px' }}>{confirmModal.item.price} Gold</strong> to acquire:
                  <br/><br/>
                  <ModalItemName $color={confirmModal.item.color}>{confirmModal.item.name}</ModalItemName>
                </ModalDesc>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <BuyBtn $affordable={true} $color={confirmModal.item.color} onClick={executePurchase} disabled={isProcessing} style={{ flex: 1, color: '#000' }}>
                    {isProcessing ? 'SYNCING...' : 'CONFIRM'}
                  </BuyBtn>
                  <BuyBtn $affordable={false} onClick={() => { playClick(); setConfirmModal({ show: false, item: null }); }} disabled={isProcessing} style={{ flex: 1, background: 'transparent', color: '#94a3b8' }}>
                    CANCEL
                  </BuyBtn>
                </div>
              </ModalContent>
            </ModalOverlay>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {successModal.show && successModal.item && (
            <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 1.2, opacity: 0 }} transition={{ type: 'spring', damping: 15 }}>
                <SuccessCardWrapper $color={successModal.item.color}>
                  <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                     {successModal.item.category === 'pet' ? (
                         renderIcon(successModal.item.icon, successModal.item.color, 90)
                     ) : (
                         <div style={{ width: 70, height: 70, background: `${successModal.item.color}30`, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${successModal.item.color}`, boxShadow: `inset 0 0 20px ${successModal.item.color}80, 0 0 30px ${successModal.item.color}` }}>
                           {renderIcon(successModal.item.icon, successModal.item.color, 35)}
                         </div>
                     )}
                  </div>
                  <SuccessTitle $color={successModal.item.color}>ITEM ACQUIRED!</SuccessTitle>
                  <SuccessItemName $color={successModal.item.color}>{successModal.item.name}</SuccessItemName>
                  <BuyBtn $affordable={true} $color={successModal.item.color} onClick={() => setSuccessModal({ show: false, item: null })} style={{ color: '#000' }}>AWESOME</BuyBtn>
                </SuccessCardWrapper>
              </motion.div>
            </ModalOverlay>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {editModal.show && (
            <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ModalContent $color="#0ea5e9" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                <button onClick={() => setEditModal({ show: false, item: null })} style={{ position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
                <ModalTitle $color="#0ea5e9" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Edit2 size={16} /> {formData.id ? 'تعديل المنتج' : 'منتج جديد'}
                </ModalTitle>
                <div style={{ textAlign: 'right', fontSize: '10px', marginBottom: 4, color: '#94a3b8' }}>القسم</div>
                <EditSelect value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  <option value="pet">Mystical Companions (Pets)</option>
                  <option value="consumable">Essence & Elixirs (Pet Food)</option>
                  <option value="title">Athletics Title</option>
                </EditSelect>
                <div style={{ textAlign: 'right', fontSize: '10px', marginBottom: 4, color: '#94a3b8' }}>اسم المنتج</div>
                <EditInput placeholder="مثال: Golden Wyvern" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <div style={{ textAlign: 'right', fontSize: '10px', marginBottom: 4, color: '#94a3b8' }}>وصف المنتج</div>
                <EditTextarea placeholder="تفاصيل ومميزات المنتج..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ textAlign: 'right', fontSize: '10px', marginBottom: 4, color: '#94a3b8' }}>السعر (Gold)</div>
                    <EditInput type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ textAlign: 'right', fontSize: '10px', marginBottom: 4, color: '#94a3b8' }}>الأيقونة (spirit_wyvern, spirit_wolf...)</div>
                    <EditInput placeholder="spirit_wyvern" value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ textAlign: 'right', fontSize: '10px', marginBottom: 4, color: '#94a3b8' }}>اللون (HEX)</div>
                    <EditInput placeholder="#eab308" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} />
                  </div>
                </div>
                <BuyBtn $affordable={true} $color="#0ea5e9" onClick={handleSaveItem} disabled={isProcessing} style={{ marginTop: 10, color: '#000' }}>
                  {isProcessing ? 'جاري الحفظ...' : <><Save size={16} /> حفظ التعديلات</>}
                </BuyBtn>
              </ModalContent>
            </ModalOverlay>
          )}
        </AnimatePresence>
      </>,
      document.body
    );
  };

  return (
    <>
      <Container initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
        <Toaster position="top-center" theme="dark" />

        <Header>
          <HeaderGlow />
          <Title><ShoppingCart size={20} color="#818cf8" /> ELITE VAULT</Title>
          <GoldDisplay><Gem size={16} color="#eab308" /> {gold}</GoldDisplay>
        </Header>

        {isCoachMode && (
          <AddItemBtn onClick={() => openEditModal()}><PlusCircle size={16} /> ADD NEW ITEM TO SHOP</AddItemBtn>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px' }}>SYNCING VAULT...</div>
        ) : (
          <>
            {renderSection('MYSTICAL COMPANIONS', Ghost, petsItems, '#a855f7')}
            {renderSection('ESSENCE & ELIXIRS', BatteryCharging, consumableItems, '#f43f5e')}
            {renderSection('TITLES VAULT', Award, titleItems, '#0ea5e9')}
          </>
        )}
      </Container>
      
      {renderModals()}
    </>
  );
};

export default Shop;