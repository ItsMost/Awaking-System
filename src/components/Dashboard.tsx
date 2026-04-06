import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { Toaster, toast } from 'sonner';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Circle,
  AlertTriangle,
  ShieldAlert,
  Camera,
  X,
  Activity,
  Flame,
  Droplet,
  Dumbbell,
  Zap,
  Star,
  Clock,
  Users,
  Wind,
  Loader,
  Footprints,
  StretchHorizontal,
  PlusCircle,
  Box,
  Stethoscope,
  HeartPulse,
  Bandage,
  ClipboardCheck,
  Target,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Lock,
  Scale,
  Bell,
  Database,
  Globe,
  Timer, // 🚨 تم إضافة أيقونة المؤقت للموسم 🚨
  Trophy
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ==========================================
// 1. الأصوات البرمجية
// ==========================================
const playDashSound = (
  type: 'complete' | 'levelUp' | 'error' | 'request' | 'openMobility'
) => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  const now = ctx.currentTime;

  if (type === 'complete') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start();
    osc.stop(now + 0.2);
  } else if (type === 'openMobility' || type === 'request') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start();
    osc.stop(now + 0.2);
  } else if (type === 'levelUp') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.setValueAtTime(600, now + 0.2);
    osc.frequency.setValueAtTime(800, now + 0.4);
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.8);
    osc.start();
    osc.stop(now + 0.8);
  } else {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start();
    osc.stop(now + 0.3);
  }
};

const playHoverSound = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
};

// ==========================================
// 2. التصميمات (Styled Components)
// ==========================================
const Container = styled.div`
  padding: 20px;
  font-family: 'Oxanium', sans-serif;
  color: #fff;
  min-height: 100vh;
  padding-bottom: 100px;
  max-width: 600px;
  margin: 0 auto;
`;

const NewsTickerWrapper = styled.div`
  background: #020617;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
`;

const TickerIcon = styled.div`
  background: #0ea5e920;
  color: #0ea5e9;
  padding: 6px;
  border-radius: 8px;
  margin-right: 10px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const marquee = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
`;

const TickerText = styled.div`
  display: flex;
  gap: 40px;
  white-space: nowrap;
  animation: ${marquee} 15s linear infinite;
  font-size: 13px;
  font-weight: bold;
  color: #94a3b8;
  direction: rtl;
  span { color: #fff; }
  strong { color: #eab308; }
`;

const DateNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 10px 15px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
`;

const NavBtn = styled.button`
  background: none;
  border: none;
  color: #00f2ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  transition: 0.3s;
  &:disabled { color: #334155; cursor: not-allowed; }
  &:hover:not(:disabled) { filter: brightness(1.2); transform: scale(1.1); }
`;

const DateDisplay = styled.div`
  text-align: center;
  .day {
    font-size: 15px;
    font-weight: 900;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .full-date {
    font-size: 10px;
    color: #64748b;
    margin-top: 2px;
  }
`;

// 🚨 تصميمات مركز الموسم (Season Hub) 🚨
const SeasonCard = styled.div`
  background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
  border: 1px solid #38bdf8;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 25px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(56, 189, 248, 0.15);
`;

const SeasonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const SeasonTitleText = styled.h2`
  margin: 0;
  font-size: 15px;
  color: #38bdf8;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  font-weight: 900;
  letter-spacing: 1px;
`;

const CountdownBadge = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
`;

const SeasonLevelInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #94a3b8;
  font-weight: bold;
  margin-bottom: 8px;
  text-transform: uppercase;
`;

const ProgressBarBG = styled.div`
  background: #1e293b;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
`;

const ProgressBarFill = styled.div<{ $progress: number }>`
  background: #38bdf8;
  height: 100%;
  width: ${(props) => props.$progress}%;
  box-shadow: 0 0 10px #38bdf8;
  transition: width 0.5s ease-out;
`;

const PenaltyBanner = styled(motion.div)<{ $isPending: boolean }>`
  background: ${(props) => (props.$isPending ? '#b45309' : '#2a0808')};
  border: 1px dashed ${(props) => (props.$isPending ? '#fcd34d' : '#ef4444')};
  color: ${(props) => (props.$isPending ? '#fef3c7' : '#fca5a5')};
  padding: 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1px;
  margin-bottom: 20px;
  box-shadow: 0 0 15px ${(props) => (props.$isPending ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)')};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #0f172a 0%, #020617 100%);
  border: 1px solid #1e293b;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 25px;
`;

const SectionTitle = styled.h2<{ $color: string }>`
  font-size: 14px;
  color: ${(props) => props.$color};
  letter-spacing: 2px;
  margin: 30px 0 15px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  border-bottom: 1px solid ${(props) => props.$color}40;
  padding-bottom: 8px;
`;

const pulseRed = keyframes`
  0% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.2); }
  50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.5); }
  100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.2); }
`;

const UrgentCard = styled(motion.div)<{ $status: string; $isLocked?: boolean }>`
  background: ${(props) =>
    props.$status === 'completed'
      ? 'rgba(16, 185, 129, 0.1)'
      : 'linear-gradient(90deg, #450a0a 0%, #020617 100%)'};
  border: 2px solid ${(props) => (props.$status === 'completed' ? '#10b981' : '#ef4444')};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 15px;
  cursor: ${(props) => (props.$isLocked ? 'default' : 'pointer')};
  position: relative;
  overflow: hidden;
  opacity: ${(props) => (props.$isLocked && props.$status === 'idle' ? 0.5 : 1)};
  animation: ${(props) => (props.$status === 'idle' && !props.$isLocked ? pulseRed : 'none')} 2s infinite;
  
  &::before {
    content: 'CRITICAL DIRECTIVE';
    position: absolute;
    top: 8px;
    right: 15px;
    font-size: 9px;
    font-weight: 900;
    color: #ef4444;
    letter-spacing: 2px;
  }
`;

const QuestCard = styled(motion.div)<{ $status: string; $isPenalty?: boolean; $isLocked?: boolean }>`
  background: ${(props) =>
    props.$status === 'completed'
      ? 'rgba(16, 185, 129, 0.1)'
      : props.$status === 'pending'
      ? 'rgba(234, 179, 8, 0.1)'
      : props.$isPenalty
      ? '#2a0808'
      : '#0b1120'};
  border: 1px solid ${(props) =>
    props.$status === 'completed'
      ? '#10b981'
      : props.$status === 'pending'
      ? '#eab308'
      : props.$isPenalty
      ? '#ef4444'
      : '#1e293b'};
  border-radius: 16px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: ${(props) => (props.$isLocked ? 'default' : 'pointer')};
  transition: 0.3s;
  opacity: ${(props) => (props.$isLocked && props.$status === 'idle' ? 0.5 : 1)};
  box-shadow: ${(props) =>
    props.$isPenalty && props.$status === 'idle' && !props.$isLocked
      ? '0 0 15px rgba(239,68,68,0.3)'
      : '0 4px 6px rgba(0,0,0,0.2)'};

  &:hover {
    background: ${(props) =>
      props.$status === 'idle' && !props.$isLocked
        ? props.$isPenalty
          ? '#450a0a'
          : '#0f172a'
        : ''};
    transform: ${(props) => (props.$status === 'idle' && !props.$isLocked ? 'translateY(-2px)' : 'none')};
  }
`;

const LeftContent = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
`;

const IconWrapper = styled.div<{ $color: string }>`
  background: ${(props) => props.$color}15;
  border: 1px solid ${(props) => props.$color}40;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const QuestTitle = styled.div<{ $status: string; $isPenalty?: boolean }>`
  font-size: 15px;
  font-weight: bold;
  color: ${(props) =>
    props.$status === 'completed'
      ? '#10b981'
      : props.$status === 'pending'
      ? '#facc15'
      : props.$isPenalty
      ? '#fca5a5'
      : '#fff'};
  text-decoration: ${(props) => (props.$status === 'completed' ? 'line-through' : 'none')};
  line-height: 1.3;
`;

const QuestDesc = styled.div`
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.4;
`;

const Rewards = styled.div`
  display: flex;
  gap: 10px;
  font-size: 11px;
  font-weight: 900;
  margin-top: 4px;
`;

const RightAction = styled.div<{ $type: string; $status: string }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: ${(props) =>
    props.$status === 'completed'
      ? '#10b98120'
      : props.$status === 'pending'
      ? '#facc1520'
      : props.$type === 'request'
      ? '#1e293b'
      : 'transparent'};
  flex-shrink: 0;
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled(motion.div)<{ $color: string }>`
  background: #0b1120;
  border: 2px solid ${(props) => props.$color};
  border-radius: 20px;
  padding: 30px;
  width: 100%;
  max-width: 450px;
  position: relative;
  max-height: 85vh;
  overflow-y: auto;
  
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: ${(props) => props.$color}; border-radius: 5px; }
`;

const UploadBtn = styled.label<{ $hasFile: boolean; $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: ${(props) => (props.$hasFile ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)')};
  border: 2px dashed ${(props) => (props.$hasFile ? '#10b981' : '#334155')};
  border-radius: 12px;
  color: ${(props) => (props.$hasFile ? '#10b981' : '#94a3b8')};
  cursor: pointer;
  margin: 15px 0;
  transition: 0.3s;
  
  &:hover {
    background: rgba(255,255,255,0.1);
    border-color: ${(props) => props.$color};
    color: ${(props) => props.$color};
  }
`;

const ActionBtn = styled.button<{ $color: string; disabled?: boolean }>`
  width: 100%;
  padding: 15px;
  background: ${(props) => (props.disabled ? '#334155' : props.$color)};
  color: ${(props) => (props.disabled ? '#94a3b8' : '#000')};
  border: none;
  border-radius: 10px;
  font-family: 'Oxanium', sans-serif;
  font-size: 14px;
  font-weight: 900;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  transition: 0.3s;
  
  &:hover { filter: brightness(1.2); }
`;

const spin = keyframes` 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } `;
const LoadingSpinner = styled(Loader)` animation: ${spin} 1s linear infinite; `;

const SyncOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(2, 6, 23, 0.9);
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
`;

// ==========================================
// 3. قاعدة بيانات المهام
// ==========================================
const MOBILITY_ROUTINE = [
  {
    id: 'm1',
    area: 'Hips',
    title: '90/90 Hip Rotations',
    desc: 'مجموعتين - ١٠ تكرارات لكل جانب. لفتح الحوض وتحسين الدوران الداخلي والخارجي.',
    icon: StretchHorizontal,
    color: '#38bdf8',
  },
  {
    id: 'm_new1',
    area: 'Hips / Quads',
    title: 'Couch Stretch',
    desc: 'مجموعتين - دقيقة لكل قدم. إطالة عميقة لثنيات الحوض وعضلات الفخذ الأمامية.',
    icon: StretchHorizontal,
    color: '#38bdf8',
  },
  {
    id: 'm_new2',
    area: 'Back / Core',
    title: 'Cat-Cow Mobility',
    desc: 'مجموعتين - ١٥ تكرار. قم بتقويس ظهرك للأعلى (القطة) ثم اخفضه للأسفل ببطء.',
    icon: Zap,
    color: '#a855f7',
  },
  {
    id: 'm4',
    area: 'Back',
    title: 'Thoracic Rotations',
    desc: 'مجموعتين - ١٢ تكرار لكل جانب. لتحسين مرونة فقرات الظهر العلوية والصدر.',
    icon: Zap,
    color: '#a855f7',
  },
  {
    id: 'm5',
    area: 'Shoulder',
    title: 'Wall Angels / Shoulder CARs',
    desc: 'مجموعتين - ١٠ تكرارات. قف ظهرك للحائط وارفع ذراعيك ببطء لزيادة مرونة مفصل الكتف.',
    icon: Dumbbell,
    color: '#10b981',
  },
  {
    id: 'm6',
    area: 'Ankle',
    title: 'Ankle Dorsiflexion (Combat Stretch)',
    desc: 'مجموعتين - دقيقة لكل قدم. ادفع ركبتك للأمام متجاوزة مشط القدم مع ثبات الكعب.',
    icon: Footprints,
    color: '#facc15',
  },
];

const FRIDAY_DIRECTIVES = [
  {
    id: 'fd1',
    title: 'Weekly Volume Compliance',
    desc: 'تأكيد تنفيذ كافة الحصص التدريبية وتطابق الأوزان والعدادات مع الخطة الأسبوعية بدقة.',
    exp: 150,
    gold: 100,
    type: 'request',
    icon: ClipboardCheck,
    color: '#ef4444',
  },
  {
    id: 'fd2',
    title: 'Perfect Microcycle Streak',
    desc: 'الحفاظ على التزام يومي كامل (Streak) بدون انقطاع في المهام من السبت إلى الخميس.',
    exp: 150,
    gold: 100,
    type: 'request',
    icon: Target,
    color: '#ef4444',
  },
];

const SHARED_PRACTICE_ID = 'shared_practice';
const SHARED_HYDRATION = {
  id: 'shared_1',
  title: 'Hydration Target (3L)',
  desc: 'تحقيق معدل استهلاك المياه لضمان ترطيب العضلات وطرد السموم.',
  exp: 30,
  gold: 10,
  type: 'honor',
  icon: Droplet,
  color: '#38bdf8',
};
const SHARED_NUTRITION = {
  id: 'shared_2',
  title: 'Nutritional Compliance',
  desc: 'تحقيق هدف البروتين الصافي لدعم البناء العضلي.',
  exp: 30,
  gold: 10,
  type: 'honor',
  icon: Flame,
  color: '#f97316',
};
const SHARED_MOBILITY = {
  id: 'shared_3',
  title: 'Functional Mobility',
  desc: 'أداء روتين المرونة الوظيفية لضمان صحة وكفاءة المفاصل.',
  exp: 35,
  gold: 15,
  type: 'mobilityRoutine',
  icon: Activity,
  color: '#10b981',
};

const NORMAL_DAILY_QUESTS = [
  {
    id: SHARED_PRACTICE_ID,
    title: 'Practice',
    desc: 'إتمام الحصة التدريبية الأساسية وفقاً للأحمال والأوزان المحددة بالجدول.',
    exp: 100,
    gold: 30,
    type: 'request',
    noImage: true,
    icon: Users,
    color: '#a855f7',
  },
  SHARED_HYDRATION,
  SHARED_NUTRITION,
  SHARED_MOBILITY,
  {
    id: 'dq4',
    title: 'Recovery Cooldown',
    desc: 'خفض معدل ضربات القلب تدريجياً وإطالة الأنسجة بعد التمرين مباشرة.',
    exp: 20,
    gold: 10,
    type: 'request',
    noImage: true,
    icon: Wind,
    color: '#34d399',
  },
];

const INJURED_DAILY_QUESTS = [
  {
    id: SHARED_PRACTICE_ID,
    title: 'Practice (Rehab)',
    desc: 'بديل التمرين الأساسي: إتمام جلسة العلاج الطبيعي والتقويات المخصصة للإصابة.',
    exp: 90,
    gold: 30,
    type: 'request',
    noImage: true,
    icon: Stethoscope,
    color: '#ef4444',
  },
  SHARED_HYDRATION,
  SHARED_NUTRITION,
  SHARED_MOBILITY,
  {
    id: 'iq4',
    title: 'Thermal / Cryotherapy',
    desc: 'تطبيق الكمادات (ثلج أو حرارة) حسب البروتوكول الطبي الموضح في قسم العلاج.',
    exp: 20,
    gold: 10,
    type: 'request',
    noImage: true,
    icon: HeartPulse,
    color: '#f43f5e',
  },
];

const BIWEEKLY_QUESTS = [
  {
    id: 'wq1',
    title: 'Recovery Logistics',
    desc: 'تجهيز وتأمين أدوات الاستشفاء وساعات النوم العميق.',
    exp: 100,
    gold: 50,
    type: 'request',
    icon: Box,
    color: '#eab308',
  },
];

const MONTHLY_QUESTS = [
  {
    id: 'wq2',
    title: 'Supplement Inventory',
    desc: 'جرد وتوفير المكملات الغذائية الأساسية لضمان الاستمرارية.',
    exp: 100,
    gold: 50,
    type: 'request',
    icon: Flame,
    color: '#eab308',
  },
  {
    id: 'wq3',
    title: 'InBody Assessment',
    desc: 'إجراء فحص InBody لقياس نسبة الدهون والعضلات ومتابعة التطور.',
    exp: 75,
    gold: 200,
    type: 'request',
    icon: Scale,
    color: '#06b6d4',
  },
];

const PENALTY_QUEST = {
  id: 'penalty_q',
  title: 'Disciplinary Execution',
  desc: 'تنفيذ العقوبة الإدارية المطلوبة ورفع الإثبات لرفع تجميد النظام.',
  exp: 0,
  gold: 0,
  type: 'request',
  icon: ShieldAlert,
  color: '#ef4444',
  isPenalty: true,
};

// ==========================================
// 4. المكون الرئيسي (Dashboard)
// ==========================================
const Dashboard = ({ player, setPlayer }: any) => {
  const currentPlayer = player || {
    id: 'me',
    name: 'Athlete',
    lvl: 1,
    xp: 0,
    monthlyXp: 0,
    gold: 0,
    hp: 100,
    isInjured: false,
    activePenalty: false,
    weight: 75,
    streak: 0,
    last_active: null,
    last_penalty_check: null,
  };

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
  
  // 🚨 State للعداد التنازلي للموسم 🚨
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  const isFriday = selectedDate.getDay() === 5;
  const DAILY_QUESTS = currentPlayer.isInjured ? INJURED_DAILY_QUESTS : NORMAL_DAILY_QUESTS;
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const isYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return selectedDate.toDateString() === yesterday.toDateString();
  };

  const isLocked = () => {
    if (isToday) return false;
    if (isYesterday()) {
      const now = new Date();
      if (now.getHours() >= 12) return true;
      return false;
    }
    return true;
  };

  const changeDate = (offset: number) => {
    playHoverSound();
    setSelectedDate((prev) => {
      const newD = new Date(prev);
      newD.setDate(newD.getDate() + offset);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (newD > today) return prev;
      return new Date(newD);
    });
  };

  const getLogDate = () => {
    const logDate = new Date(selectedDate);
    const now = new Date();
    logDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    return logDate.toISOString();
  };

  const getDynamicDesc = (quest: any) => {
    if (quest.id === SHARED_NUTRITION.id) {
      const weight = currentPlayer.weight || 75;
      const minProtein = Math.round(weight * 1.7);
      const maxProtein = Math.round(weight * 2.2);
      return `${quest.desc} (هدفك: ${minProtein}g - ${maxProtein}g بروتين بناءً على وزنك).`;
    }
    return quest.desc;
  };

  const calculateStreak = (currentStreak: number, lastActive: string | null) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActive === today) return { streak: currentStreak, last_active: today, changed: false };
    if (lastActive === yesterdayStr) return { streak: currentStreak + 1, last_active: today, changed: true };

    return { streak: 1, last_active: today, changed: true };
  };

  const getDaysDiff = (d1: string, d2: string) => {
    const date1 = new Date(d1);
    date1.setHours(0, 0, 0, 0);
    const date2 = new Date(d2);
    date2.setHours(0, 0, 0, 0);
    return Math.floor((date1.getTime() - date2.getTime()) / (1000 * 3600 * 24));
  };

  // 🚨 حساب الوقت المتبقي لنهاية الموسم (نهاية الشهر) 🚨
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const diff = endOfMonth.getTime() - now.getTime();

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60)
        });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); 
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchRadarNews = async () => {
      try {
        const { data } = await supabase
          .from('global_news')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (data && data.length > 0) {
          const logs = data.map((news) => `🌍 ${news.title}: ${news.content}`);
          setSystemLogs(logs);
        } else {
          setSystemLogs(['📡 لا توجد أخبار على الرادار حالياً...']);
        }
      } catch (e) {}
    };
    fetchRadarNews();
  }, []);

  useEffect(() => {
    const syncData = async () => {
      setIsLoadingSync(true);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const fourteenDaysAgo = new Date(selectedDate);
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const todayStr = new Date().toISOString().split('T')[0];

      try {
        const { data: userData } = await supabase
          .from('shadow_hunters')
          .select('*')
          .eq('name', currentPlayer.name)
          .single();

        if (userData && setPlayer) {
          let fetchedHp = userData.hp ?? 100;
          let fetchedStreak = userData.streak || 0;
          let lastPenaltyCheck = userData.last_penalty_check || userData.last_active || todayStr;
          let lastActiveStr = userData.last_active || todayStr;

          const daysSinceCheck = getDaysDiff(todayStr, lastPenaltyCheck);
          let hpLost = 0;
          let missedDays = 0;

          if (daysSinceCheck > 0) {
            for (let i = 1; i <= daysSinceCheck; i++) {
              const checkDay = new Date();
              checkDay.setDate(checkDay.getDate() - i);
              const checkDayStr = checkDay.toISOString().split('T')[0];
              if (getDaysDiff(checkDayStr, lastActiveStr) > 0) {
                missedDays++;
              }
            }

            if (missedDays > 0) {
              hpLost = missedDays * 10;
              fetchedHp = Math.max(0, fetchedHp - hpLost);
              fetchedStreak = 0;

              setTimeout(() => {
                playDashSound('error');
                toast.error(
                  `🩸 النزيف (HP Bleed): فقدت ${hpLost} HP بسبب غيابك عن المهام!`,
                  {
                    style: { background: '#450a0a', color: '#ef4444', border: '1px solid #ef4444' },
                  }
                );
              }, 1500);
            }

            await supabase
              .from('shadow_hunters')
              .update({
                hp: fetchedHp,
                streak: fetchedStreak,
                last_penalty_check: todayStr,
              })
              .eq('name', currentPlayer.name);
          }

          setPlayer((prev: any) => ({
            ...prev,
            xp: userData.xp,
            monthlyXp: userData.monthly_xp,
            gold: userData.gold,
            lvl: userData.lvl,
            activePenalty: userData.active_penalty,
            isInjured: userData.is_injured ?? prev.isInjured,
            injuryDetails: userData.injury_details ?? prev.injuryDetails,
            weight: userData.weight || prev.weight || 75,
            streak: fetchedStreak,
            last_active: userData.last_active,
            hp: fetchedHp,
          }));
        }

        const { data: requests } = await supabase
          .from('system_requests')
          .select('task_name, status, created_at')
          .eq('hunter_name', currentPlayer.name)
          .gte('created_at', fourteenDaysAgo.toISOString())
          .lte('created_at', endOfDay.toISOString());

        if (requests) {
          const allQuests = [
            ...NORMAL_DAILY_QUESTS,
            ...INJURED_DAILY_QUESTS,
            ...BIWEEKLY_QUESTS,
            ...MONTHLY_QUESTS,
            ...FRIDAY_DIRECTIVES,
            PENALTY_QUEST,
          ];
          const approvedIds: string[] = [];
          const pendingIds: string[] = [];

          requests.forEach((req) => {
            let dateStr = req.created_at;
            if (!dateStr.includes('Z') && !dateStr.includes('+')) dateStr += 'Z';
            const reqDate = new Date(dateStr);

            const isForSelectedDay = reqDate >= startOfDay && reqDate <= endOfDay;
            const isMonthlyTask = MONTHLY_QUESTS.some((q) => q.title === req.task_name);
            const isBiWeeklyTask = BIWEEKLY_QUESTS.some((q) => q.title === req.task_name);

            let isValidForUI = false;
            if (isForSelectedDay) isValidForUI = true;
            if (isMonthlyTask && reqDate >= startOfMonth && reqDate <= endOfDay) isValidForUI = true;
            if (isBiWeeklyTask && reqDate >= fourteenDaysAgo && reqDate <= endOfDay) isValidForUI = true;

            if (isValidForUI) {
              if (req.task_name === 'Practice' || req.task_name === 'Practice (Rehab)') {
                if (req.status === 'approved') approvedIds.push(SHARED_PRACTICE_ID);
                if (req.status === 'pending') pendingIds.push(SHARED_PRACTICE_ID);
              } else if (req.task_name === 'Hydration Target (3L)') {
                if (req.status === 'approved') approvedIds.push(SHARED_HYDRATION.id);
                if (req.status === 'pending') pendingIds.push(SHARED_HYDRATION.id);
              } else if (req.task_name === 'Nutritional Compliance') {
                if (req.status === 'approved') approvedIds.push(SHARED_NUTRITION.id);
                if (req.status === 'pending') pendingIds.push(SHARED_NUTRITION.id);
              } else if (req.task_name === 'Functional Mobility') {
                if (req.status === 'approved') approvedIds.push(SHARED_MOBILITY.id);
                if (req.status === 'pending') pendingIds.push(SHARED_MOBILITY.id);
              } else {
                const matchedQuest = allQuests.find((q) => q.title === req.task_name);
                if (matchedQuest) {
                  if (req.status === 'approved') approvedIds.push(matchedQuest.id);
                  if (req.status === 'pending') pendingIds.push(matchedQuest.id);
                }
              }
            }
          });

          setCompletedQuests(approvedIds);
          setPendingQuests(pendingIds);
        }
      } catch (error) {
        console.error('Sync failed', error);
      }
      setIsLoadingSync(false);
    };
    syncData();
  }, [currentPlayer.name, selectedDate]);

  const handleQuestClick = (quest: any) => {
    if (isProcessing || isLoadingSync) return;

    const status = getStatus(quest.id);

    if (isLocked()) {
      playDashSound('error');
      toast.error('System Locked: Reporting window has expired.', {
        style: { background: '#2a0808', color: '#ef4444', border: '1px solid #ef4444' },
      });
      return;
    }

    if (status === 'completed' || status === 'pending') {
      undoQuest(quest, status);
      return;
    }

    if (quest.type === 'mobilityRoutine') {
      playDashSound('openMobility');
      setShowMobilityModal(true);
    } else if (quest.type === 'honor') {
      playHoverSound();
      setHonorQuestToConfirm(quest);
    } else if (quest.type === 'request') {
      playHoverSound();
      setSelectedQuest(quest);
      setHasFile(false);
    }
  };

  const completeQuest = async (quest: any) => {
    if (completedQuests.includes(quest.id)) return;
    setIsProcessing(true);

    try {
      const { error: insertError } = await supabase
        .from('system_requests')
        .insert([
          {
            hunter_name: currentPlayer.name,
            task_name: quest.title,
            evidence: 'Honor System',
            type: 'quest',
            status: 'approved',
            created_at: getLogDate(),
          },
        ]);

      if (insertError) throw insertError;

      let newXp = (currentPlayer.xp || 0) + quest.exp;
      let newMonthlyXp = (currentPlayer.monthlyXp || 0) + quest.exp;
      let newGold = (currentPlayer.gold || 0) + quest.gold;
      let newLvl = currentPlayer.lvl || 1;
      let leveledUp = false;

      let xpNeeded = Math.min(newLvl * 150 + 500, 4000);
      while (newXp >= xpNeeded) {
        newXp -= xpNeeded;
        newLvl += 1;
        leveledUp = true;
        xpNeeded = Math.min(newLvl * 150 + 500, 4000);
      }

      const streakData = calculateStreak(currentPlayer.streak || 0, currentPlayer.last_active);
      const todayStr = new Date().toISOString().split('T')[0];

      let hpGain = 0;
      if (quest.id === SHARED_HYDRATION.id || quest.id === SHARED_NUTRITION.id) {
        hpGain = 5;
      }
      let newHp = Math.min(100, (currentPlayer.hp || 100) + hpGain);

      const dbUpdates = {
        xp: newXp,
        monthly_xp: newMonthlyXp,
        gold: newGold,
        lvl: newLvl,
        streak: streakData.streak,
        last_active: streakData.last_active,
        last_penalty_check: todayStr,
        hp: newHp,
      };
      const stateUpdates = {
        xp: newXp,
        monthlyXp: newMonthlyXp,
        gold: newGold,
        lvl: newLvl,
        streak: streakData.streak,
        last_active: streakData.last_active,
        hp: newHp,
      };

      const { error: updateError } = await supabase
        .from('shadow_hunters')
        .update(dbUpdates)
        .eq('name', currentPlayer.name);
      if (updateError) throw updateError;

      setCompletedQuests((prev) => [...prev, quest.id]);
      if (setPlayer) setPlayer({ ...currentPlayer, ...stateUpdates });

      playDashSound('complete');
      confetti({ particleCount: 50, spread: 60, colors: [quest.color, '#ffffff'] });

      if (hpGain > 0) {
        toast.success(`+${hpGain} HP Recovery!`, { style: { background: '#022c22', border: '1px solid #10b981', color: '#10b981' } });
      }

      if (leveledUp) {
        setTimeout(() => {
          playDashSound('levelUp');
          toast.success(`LEVEL UP! You are now Level ${newLvl}`, { style: { background: '#020617', border: '2px solid #00f2ff', color: '#00f2ff' } });
          confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
        }, 500);
      } else {
        toast.success(`Directive Completed! +${quest.exp} EXP`, { style: { background: '#020617', border: `1px solid ${quest.color}`, color: quest.color } });
      }
    } catch (err: any) {
      console.error('Critical DB Sync Error:', err);
      toast.error(`[DB ERROR]: ${err.message || JSON.stringify(err)}`, { style: { background: '#2a0808', color: '#ef4444', border: '1px solid #ef4444', padding: '16px', lineHeight: '1.5' } });
    } finally {
      setIsProcessing(false);
    }
  };

  const submitRequest = async () => {
    if (pendingQuests.includes(selectedQuest.id)) return;
    setIsProcessing(true);

    try {
      const { error: insertError } = await supabase
        .from('system_requests')
        .insert([
          {
            hunter_name: currentPlayer.name,
            task_name: selectedQuest.title,
            evidence: selectedQuest.noImage ? 'Action Logged - Awaiting Coach' : hasFile ? '📷 Image Attached' : 'No Evidence',
            type: selectedQuest.isPenalty ? 'penalty' : 'quest',
            status: 'pending',
            created_at: getLogDate(),
          },
        ]);

      if (insertError) throw insertError;

      const streakData = calculateStreak(currentPlayer.streak || 0, currentPlayer.last_active);
      const todayStr = new Date().toISOString().split('T')[0];

      let hpGain = 0;
      if (selectedQuest.id === 'wq1') hpGain = 20;
      let newHp = Math.min(100, (currentPlayer.hp || 100) + hpGain);

      await supabase
        .from('shadow_hunters')
        .update({
          streak: streakData.streak,
          last_active: streakData.last_active,
          last_penalty_check: todayStr,
          hp: newHp,
        })
        .eq('name', currentPlayer.name);
        
      if (setPlayer)
        setPlayer({ ...currentPlayer, streak: streakData.streak, last_active: streakData.last_active, hp: newHp });

      playDashSound('request');
      setPendingQuests((prev) => [...prev, selectedQuest.id]);

      if (hpGain > 0) {
        toast.success(`+${hpGain} HP Recovery!`, { style: { background: '#022c22', border: '1px solid #10b981', color: '#10b981' } });
      }

      if (selectedQuest.noImage)
        toast.success(`[ACTION LOGGED]: Request sent to Coach.`, { style: { background: '#020617', border: '1px solid #10b981', color: '#10b981' } });
      else if (hasFile)
        toast.success(`[EVIDENCE SECURED]: Sent to Coach.`, { style: { background: '#020617', border: '1px solid #10b981', color: '#10b981' } });
      else
        toast.success(`[REQUEST SENT]: Sent to Coach (No Photo).`, { style: { background: '#020617', border: '1px solid #eab308', color: '#eab308' } });
    } catch (err: any) {
      console.error('Critical Submit Error:', err);
      toast.error(`[SUBMIT ERROR]: ${err.message || JSON.stringify(err)}`, { style: { background: '#2a0808', color: '#ef4444', border: '1px solid #ef4444', padding: '16px', lineHeight: '1.5' } });
    }

    setSelectedQuest(null);
    setIsProcessing(false);
  };

  const undoQuest = async (quest: any, status: string) => {
    setIsProcessing(true);

    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const fourteenDaysAgo = new Date(selectedDate);
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      let fromDate = startOfDay;
      if (MONTHLY_QUESTS.some((q) => q.id === quest.id)) fromDate = startOfMonth;
      if (BIWEEKLY_QUESTS.some((q) => q.id === quest.id)) fromDate = fourteenDaysAgo;

      const { error: deleteError } = await supabase
        .from('system_requests')
        .delete()
        .eq('hunter_name', currentPlayer.name)
        .eq('task_name', quest.title)
        .gte('created_at', fromDate.toISOString())
        .lte('created_at', endOfDay.toISOString());

      if (deleteError) throw deleteError;

      playDashSound('error');

      if (status === 'completed') {
        let newXp = (currentPlayer.xp || 0) - quest.exp;
        let newMonthlyXp = (currentPlayer.monthlyXp || 0) - quest.exp;
        let newGold = (currentPlayer.gold || 0) - quest.gold;
        let newLvl = currentPlayer.lvl || 1;

        while (newXp < 0 && newLvl > 1) {
          newLvl -= 1;
          const prevXpNeeded = Math.min(newLvl * 150 + 500, 4000);
          newXp = prevXpNeeded + newXp;
        }
        if (newXp < 0) newXp = 0;
        if (newMonthlyXp < 0) newMonthlyXp = 0;
        if (newGold < 0) newGold = 0;

        const dbUpdates = { xp: newXp, monthly_xp: newMonthlyXp, gold: newGold, lvl: newLvl };
        const stateUpdates = { xp: newXp, monthlyXp: newMonthlyXp, gold: newGold, lvl: newLvl };

        const { error: updateError } = await supabase
          .from('shadow_hunters')
          .update(dbUpdates)
          .eq('name', currentPlayer.name);
        if (updateError) throw updateError;

        setCompletedQuests((prev) => prev.filter((id) => id !== quest.id));
        if (setPlayer) setPlayer({ ...currentPlayer, ...stateUpdates });

        toast.error(`[SYSTEM REVERT]: Record updated. EXP/Gold adjusted.`, { style: { background: '#2a0808', border: '1px solid #ef4444', color: '#ef4444' } });
      } else if (status === 'pending') {
        setPendingQuests((prev) => prev.filter((id) => id !== quest.id));
        toast.error(`[REQUEST CANCELLED]: Coach verification aborted.`, { style: { background: '#2a0808', border: '1px solid #ef4444', color: '#ef4444' } });
      }
    } catch (err: any) {
      console.error('Critical Revert Error:', err);
      toast.error(`[REVERT ERROR]: ${err.message || JSON.stringify(err)}`, { style: { background: '#2a0808', color: '#ef4444', border: '1px solid #ef4444', padding: '16px', lineHeight: '1.5' } });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatus = (id: string) => {
    if (completedQuests.includes(id)) return 'completed';
    if (pendingQuests.includes(id)) return 'pending';
    return 'idle';
  };

  const handleFileUpload = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      setHasFile(true);
      playDashSound('complete');
    }
  };

  const completeMobilityRoutine = () => {
    const mobilityQuest = DAILY_QUESTS.find((q) => q.type === 'mobilityRoutine');
    if (mobilityQuest) {
      setShowMobilityModal(false);
      setTimeout(() => setHonorQuestToConfirm(mobilityQuest), 200);
    }
  };

  const renderRightAction = (status: string, type: string) => {
    if (status === 'completed') return <CheckCircle size={22} color="#10b981" />;
    if (status === 'pending') return <Clock size={22} color="#facc15" />;
    if (isLocked()) return <Lock size={20} color="#334155" />;
    if (type === 'mobilityRoutine') return <PlusCircle size={22} color="#10b981" />;
    if (type === 'request') return <Camera size={20} color="#64748b" />;
    return <Circle size={22} color="#334155" />;
  };

  const isPenaltyPending = pendingQuests.includes('penalty_q');

  // 🚨 بيانات الموسم المحسوبة (Season Hub Variables) 🚨
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' }).toUpperCase();
  const seasonName = `SEASON: ${currentMonthName} WARFARE`; 
  const monthlyXp = currentPlayer.monthlyXp || 0;
  const seasonLevel = Math.floor(monthlyXp / 500) + 1; // ليفل الموسم بيزيد كل 500 نقطة
  const xpInCurrentLevel = monthlyXp % 500;
  const progressPercent = (xpInCurrentLevel / 500) * 100;

  return (
    <Container>
      <Toaster position="top-center" theme="dark" />

      {isLoadingSync && (
        <SyncOverlay>
          <LoadingSpinner size={40} color="#00f2ff" />
          <p style={{ marginTop: 20, fontSize: 14, letterSpacing: 2, color: '#00f2ff', fontWeight: 'bold' }}>
            SYNCING PERFORMANCE DATA...
          </p>
        </SyncOverlay>
      )}

      {systemLogs.length > 0 && (
        <NewsTickerWrapper>
          <TickerIcon>
            <Globe size={18} />
          </TickerIcon>
          <div style={{ overflow: 'hidden', width: '100%' }}>
            <TickerText>
              {systemLogs.map((log, i) => <span key={i}>{log}</span>)}
              {systemLogs.map((log, i) => <span key={'dup' + i}>{log}</span>)}
            </TickerText>
          </div>
        </NewsTickerWrapper>
      )}

      <DateNav>
        <NavBtn onClick={() => changeDate(-1)}>
          <ChevronLeft />
        </NavBtn>
        <DateDisplay>
          <div className="day">
            <Calendar size={14} color="#0ea5e9" />
            {isToday ? 'TODAY' : isYesterday() ? 'YESTERDAY' : selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
          </div>
          <div className="full-date">{selectedDate.toLocaleDateString()}</div>
        </DateDisplay>
        <NavBtn onClick={() => changeDate(1)} disabled={isToday}>
          <ChevronRight />
        </NavBtn>
      </DateNav>

      {/* 🚨 مركز الموسم (Season Hub) 🚨 */}
      <SeasonCard>
        <SeasonHeader>
          <SeasonTitleText>
            <Trophy size={20} color="#38bdf8" /> {seasonName}
          </SeasonTitleText>
          <CountdownBadge>
            <Timer size={14} /> 
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </CountdownBadge>
        </SeasonHeader>
        <SeasonLevelInfo>
          <span>SEASON PASS TIER {seasonLevel}</span>
          <span>{xpInCurrentLevel} / 500 EXP</span>
        </SeasonLevelInfo>
        <ProgressBarBG>
          <ProgressBarFill $progress={progressPercent} />
        </ProgressBarBG>
      </SeasonCard>

      {isLocked() && (
        <div style={{ textAlign: 'center', background: '#2a0808', border: '1px solid #ef4444', padding: '8px', borderRadius: '8px', fontSize: '11px', color: '#fca5a5', marginBottom: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Lock size={14} /> SYSTEM LOCKED: REPORTING WINDOW EXPIRED.
        </div>
      )}

      {currentPlayer.activePenalty && (
        <PenaltyBanner $isPending={isPenaltyPending}>
          {isPenaltyPending ? <Clock size={18} /> : <AlertTriangle size={18} />}
          {isPenaltyPending ? 'DISCIPLINARY PENDING: AWAITING COACH VERIFICATION' : 'SYSTEM PENALTY ACTIVE: EXECUTE DISCIPLINARY DIRECTIVE'}
        </PenaltyBanner>
      )}

      <Header>
        <h1 style={{ margin: 0, fontSize: '24px', color: currentPlayer.isInjured ? '#ef4444' : '#00f2ff', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase' }}>
          {currentPlayer.isInjured ? <Bandage size={28} color="#ef4444" /> : <Activity size={28} color="#00f2ff" />}
          {currentPlayer.isInjured ? 'REHABILITATION MODE' : 'PERFORMANCE HUB'}
        </h1>
        <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', fontWeight: 'bold', textTransform: 'uppercase' }}>
          ELITE ATHLETE<br />DIRECTIVES
        </div>
      </Header>

      {currentPlayer.activePenalty && (
        <>
          <SectionTitle $color="#ef4444">
            <ShieldAlert size={18} /> DISCIPLINARY QUEST
          </SectionTitle>
          <QuestCard
            $status={getStatus(PENALTY_QUEST.id)}
            $isPenalty={true}
            $isLocked={isLocked()}
            onClick={() => handleQuestClick(PENALTY_QUEST)}
            whileTap={{ scale: isLocked() ? 1 : 0.98 }}
          >
            <LeftContent>
              <IconWrapper $color={PENALTY_QUEST.color}>
                <PENALTY_QUEST.icon size={24} color={PENALTY_QUEST.color} />
              </IconWrapper>
              <TextContent>
                <QuestTitle $status={getStatus(PENALTY_QUEST.id)} $isPenalty={true}>
                  {PENALTY_QUEST.title}
                </QuestTitle>
                <QuestDesc>{PENALTY_QUEST.desc}</QuestDesc>
              </TextContent>
            </LeftContent>
            <RightAction $type={PENALTY_QUEST.type} $status={getStatus(PENALTY_QUEST.id)}>
              {renderRightAction(getStatus(PENALTY_QUEST.id), PENALTY_QUEST.type)}
            </RightAction>
          </QuestCard>
        </>
      )}

      {isFriday && (
        <>
          <SectionTitle $color="#ef4444">
            <AlertTriangle size={18} /> FRIDAY CRITICAL DIRECTIVES
          </SectionTitle>
          {FRIDAY_DIRECTIVES.map((quest) => {
            const status = getStatus(quest.id);
            return (
              <UrgentCard key={quest.id} $status={status} $isLocked={isLocked()} onClick={() => handleQuestClick(quest)} whileTap={{ scale: isLocked() ? 1 : 0.98 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <IconWrapper $color={quest.color} style={{ background: status === 'completed' ? '#10b98120' : 'rgba(239, 68, 68, 0.15)' }}>
                    <quest.icon size={24} color={status === 'completed' ? '#10b981' : quest.color} />
                  </IconWrapper>
                  <TextContent style={{ flex: 1 }}>
                    <QuestTitle $status={status} style={{ color: status === 'completed' ? '#10b981' : '#fff' }}>{quest.title}</QuestTitle>
                    <QuestDesc style={{ color: status === 'completed' ? '#10b981' : '#fca5a5' }}>{quest.desc}</QuestDesc>
                    <Rewards>
                      <span style={{ color: status === 'completed' ? '#10b981' : '#ef4444' }}>+{quest.exp} EXP</span>
                      <span style={{ color: '#eab308' }}>+{quest.gold} GOLD</span>
                    </Rewards>
                  </TextContent>
                  <RightAction $type={quest.type} $status={status}>
                    {renderRightAction(status, quest.type)}
                  </RightAction>
                </div>
              </UrgentCard>
            );
          })}
        </>
      )}

      <SectionTitle $color={currentPlayer.isInjured ? '#ef4444' : '#00f2ff'}>
        <Zap size={18} /> DAILY OPERATIONAL TASKS {currentPlayer.isInjured && '(REHAB OVERRIDE)'}
      </SectionTitle>

      {DAILY_QUESTS.map((quest) => {
        const status = getStatus(quest.id);
        const Icon = quest.icon;
        return (
          <QuestCard key={quest.id} $status={status} $isLocked={isLocked()} onClick={() => handleQuestClick(quest)} whileTap={{ scale: isLocked() ? 1 : 0.98 }}>
            <LeftContent>
              <IconWrapper $color={quest.color}>
                <Icon size={24} color={quest.color} />
              </IconWrapper>
              <TextContent>
                <QuestTitle $status={status}>{quest.title}</QuestTitle>
                <QuestDesc>{getDynamicDesc(quest)}</QuestDesc>
                <Rewards>
                  <span style={{ color: '#00f2ff' }}>+{quest.exp} EXP</span>
                  <span style={{ color: '#eab308' }}>+{quest.gold} GOLD</span>
                </Rewards>
              </TextContent>
            </LeftContent>
            <RightAction $type={quest.type} $status={status}>
              {renderRightAction(status, quest.type)}
            </RightAction>
          </QuestCard>
        );
      })}

      <SectionTitle $color="#eab308">
        <Star size={18} /> BI-WEEKLY LOGISTICS (14 DAYS)
      </SectionTitle>
      {BIWEEKLY_QUESTS.map((quest) => {
        const status = getStatus(quest.id);
        const Icon = quest.icon;
        return (
          <QuestCard key={quest.id} $status={status} $isLocked={isLocked()} onClick={() => handleQuestClick(quest)} whileTap={{ scale: isLocked() ? 1 : 0.98 }}>
            <LeftContent>
              <IconWrapper $color={quest.color}>
                <Icon size={24} color={quest.color} />
              </IconWrapper>
              <TextContent>
                <QuestTitle $status={status}>{quest.title}</QuestTitle>
                <QuestDesc>{quest.desc}</QuestDesc>
                <Rewards>
                  <span style={{ color: '#00f2ff' }}>+{quest.exp} EXP</span>
                  <span style={{ color: '#eab308' }}>+{quest.gold} GOLD</span>
                </Rewards>
              </TextContent>
            </LeftContent>
            <RightAction $type={quest.type} $status={status}>
              {renderRightAction(status, quest.type)}
            </RightAction>
          </QuestCard>
        );
      })}

      <SectionTitle $color="#06b6d4">
        <Database size={18} /> MONTHLY CYCLE
      </SectionTitle>
      {MONTHLY_QUESTS.map((quest) => {
        const status = getStatus(quest.id);
        const Icon = quest.icon;
        return (
          <QuestCard key={quest.id} $status={status} $isLocked={isLocked()} onClick={() => handleQuestClick(quest)} whileTap={{ scale: isLocked() ? 1 : 0.98 }}>
            <LeftContent>
              <IconWrapper $color={quest.color}>
                <Icon size={24} color={quest.color} />
              </IconWrapper>
              <TextContent>
                <QuestTitle $status={status}>{quest.title}</QuestTitle>
                <QuestDesc>{quest.desc}</QuestDesc>
                <Rewards>
                  <span style={{ color: '#00f2ff' }}>+{quest.exp} EXP</span>
                  <span style={{ color: '#eab308' }}>+{quest.gold} GOLD</span>
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
        {honorQuestToConfirm && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent $color={honorQuestToConfirm.color} initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <div style={{ textAlign: 'center' }}>
                <ShieldAlert size={50} color="#ef4444" style={{ margin: '0 auto 15px auto' }} />
                <h2 style={{ color: '#ef4444', margin: '0 0 10px 0', fontSize: '24px', fontWeight: '900' }}>"مَنْ غَشَّنَا فَلَيْسَ مِنَّا"</h2>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                  أنت على وشك تأكيد إتمام مهمة <strong style={{ color: honorQuestToConfirm.color }}>{honorQuestToConfirm.title}</strong>.<br />
                  بصفتك رياضي (Elite)، هل أنت متأكد أنك أتممتها بصدق تام؟
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <ActionBtn $color="#334155" onClick={() => setHonorQuestToConfirm(null)}>
                    <X size={18} /> تراجع
                  </ActionBtn>
                  <ActionBtn $color={honorQuestToConfirm.color} disabled={isProcessing} onClick={() => { completeQuest(honorQuestToConfirm); setHonorQuestToConfirm(null); }}>
                    {isProcessing ? <LoadingSpinner size={18} /> : <><CheckCircle size={18} /> متأكد</>}
                  </ActionBtn>
                </div>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMobilityModal && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent $color="#10b981" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              <button onClick={() => setShowMobilityModal(false)} style={{ position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={24} /></button>
              <h3 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 10, textTransform: 'uppercase', marginTop: 0 }}>
                <Activity /> بروتوكول المرونة الوظيفية
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '400px', overflowY: 'auto', paddingRight: 5, direction: 'rtl' }}>
                {MOBILITY_ROUTINE.map((ex) => (
                  <div key={ex.id} style={{ background: '#020617', border: `1px solid ${ex.color}30`, padding: 12, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: `${ex.color}15`, color: ex.color, padding: 8, borderRadius: 8, flexShrink: 0 }}>
                      <ex.icon size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 'bold', color: '#fff' }}>{ex.title}</div>
                      <div style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>{ex.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <ActionBtn $color="#10b981" onClick={completeMobilityRoutine} disabled={isProcessing} style={{ marginTop: 20 }}>
                {isProcessing ? <LoadingSpinner size={18} /> : <><CheckCircle size={18} /> إتمام الجلسة وتوثيق الأداء</>}
              </ActionBtn>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedQuest && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent $color={selectedQuest.color} initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}>
              <button onClick={() => setSelectedQuest(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={24} /></button>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'inline-flex', background: `${selectedQuest.color}20`, padding: '15px', borderRadius: '50%', color: selectedQuest.color, marginBottom: '10px' }}>
                  <selectedQuest.icon size={32} />
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
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{hasFile ? 'EVIDENCE ATTACHED' : 'OPTIONAL: UPLOAD PROOF'}</span>
                  </UploadBtn>
                </div>
              )}

              <ActionBtn $color={selectedQuest.color} onClick={submitRequest} disabled={isProcessing}>
                {isProcessing ? <LoadingSpinner size={20} /> : selectedQuest.noImage ? 'SUBMIT TO COACH' : hasFile ? 'SUBMIT WITH EVIDENCE' : 'SUBMIT REQUEST'}
              </ActionBtn>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default Dashboard;