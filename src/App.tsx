import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sword,
  LogOut,
  CheckSquare,
  Medal,
  ShoppingCart,
  Store as Storefront,
  Shield,
  User,
  Book,
  Activity,
  Moon,
  Eye,
  Wind,
  Dumbbell,
  Zap,
  Footprints,
  Lock as LockIcon,
  Flame,
  Crown,
  Skull,
  Target,
  Heart,
  Droplet,
  Axe,
  Anchor,
  Fingerprint,
  Cpu,
  Infinity as InfinityIcon,
  Hexagon,
  Globe,
} from 'lucide-react';

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

// ==========================================
// 1. الأصوات
// ==========================================
const createAudioContext = () => {
  const AudioContext =
    window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return null;
  return new AudioContext();
};

const playSound = (type: 'shield' | 'click' | 'startup') => {
  try {
    const ctx = createAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'shield') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start();
      osc.stop(now + 0.2);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start();
      osc.stop(now + 0.05);
    } else if (type === 'startup') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
      osc.start();
      osc.stop(now + 0.4);
    }
  } catch (e) {}
};

const playAuraSound = (hunter: any) => {
  try {
    const iconStr = String(
      hunter?.selectedIcon ||
        hunter?.selected_icon ||
        hunter?.icon ||
        hunter?.class ||
        ''
    )
      .toLowerCase()
      .trim();
    const ctx = createAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (
      iconStr.includes('sword') ||
      iconStr.includes('shield') ||
      iconStr.includes('target') ||
      iconStr.includes('crosshair') ||
      iconStr.includes('axe') ||
      iconStr.includes('dumbbell')
    ) {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (
      iconStr.includes('flame') ||
      iconStr.includes('zap') ||
      iconStr.includes('star')
    ) {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1500, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {}
};

const getDynamicIcon = (hunter: any, size: number = 24) => {
  const iconStr = String(
    hunter?.selectedIcon ||
      hunter?.selected_icon ||
      hunter?.icon ||
      hunter?.class ||
      (hunter?.titles && hunter.titles[0]) ||
      ''
  )
    .toLowerCase()
    .trim();
  if (iconStr.includes('moon') || iconStr.includes('shadow'))
    return <Moon size={size} color="#d8b4fe" />;
  if (iconStr.includes('eye') || iconStr.includes('vision'))
    return <Eye size={size} color="#818cf8" />;
  if (iconStr.includes('wind') || iconStr.includes('air'))
    return <Wind size={size} color="#38bdf8" />;
  if (iconStr.includes('barbell') || iconStr.includes('dumbbell'))
    return <Dumbbell size={size} color="#f97316" />;
  if (iconStr.includes('zap') || iconStr.includes('lightning'))
    return <Zap size={size} color="#eab308" />;
  if (iconStr.includes('shoe') || iconStr.includes('foot'))
    return <Footprints size={size} color="#10b981" />;
  if (iconStr.includes('shield') || iconStr.includes('tank'))
    return <Shield size={size} color="#64748b" />;
  if (iconStr.includes('lock') || iconStr.includes('gate'))
    return <LockIcon size={size} color="#10b981" />;
  if (iconStr.includes('flame') || iconStr.includes('fire'))
    return <Flame size={size} color="#ef4444" />;
  if (iconStr.includes('crown') || iconStr.includes('king'))
    return <Crown size={size} color="#f59e0b" />;
  if (iconStr.includes('skull') || iconStr.includes('death'))
    return <Skull size={size} color="#a855f7" />;
  if (iconStr.includes('target') || iconStr.includes('crosshair'))
    return <Target size={size} color="#f43f5e" />;
  if (iconStr.includes('heart')) return <Heart size={size} color="#f43f5e" />;
  if (iconStr.includes('droplet') || iconStr.includes('water'))
    return <Droplet size={size} color="#60a5fa" />;
  if (iconStr.includes('axe')) return <Axe size={size} color="#cbd5e1" />;
  if (iconStr.includes('anchor')) return <Anchor size={size} color="#0ea5e9" />;
  if (iconStr.includes('fingerprint'))
    return <Fingerprint size={size} color="#14b8a6" />;
  if (iconStr.includes('hexagon'))
    return <Hexagon size={size} color="#8b5cf6" />;
  if (iconStr.includes('cpu')) return <Cpu size={size} color="#06b6d4" />;
  if (iconStr.includes('infinity'))
    return <InfinityIcon size={size} color="#ec4899" />;
  return <Sword size={size} color="#00f2ff" />;
};

const getIconColor = (hunter: any) => {
  const iconStr = String(
    hunter?.selectedIcon ||
      hunter?.selected_icon ||
      hunter?.icon ||
      hunter?.class ||
      (hunter?.titles && hunter.titles[0]) ||
      ''
  )
    .toLowerCase()
    .trim();
  if (iconStr.includes('moon') || iconStr.includes('shadow')) return '#d8b4fe';
  if (iconStr.includes('eye') || iconStr.includes('vision')) return '#818cf8';
  if (iconStr.includes('wind') || iconStr.includes('air')) return '#38bdf8';
  if (iconStr.includes('barbell') || iconStr.includes('dumbbell'))
    return '#f97316';
  if (iconStr.includes('zap') || iconStr.includes('lightning'))
    return '#eab308';
  if (iconStr.includes('shoe') || iconStr.includes('foot')) return '#10b981';
  if (iconStr.includes('shield') || iconStr.includes('tank')) return '#64748b';
  if (iconStr.includes('lock') || iconStr.includes('gate')) return '#10b981';
  if (iconStr.includes('flame') || iconStr.includes('fire')) return '#ef4444';
  if (iconStr.includes('crown') || iconStr.includes('king')) return '#f59e0b';
  if (iconStr.includes('skull') || iconStr.includes('death')) return '#a855f7';
  if (iconStr.includes('target') || iconStr.includes('crosshair'))
    return '#f43f5e';
  if (iconStr.includes('heart')) return '#f43f5e';
  if (iconStr.includes('droplet') || iconStr.includes('water'))
    return '#60a5fa';
  if (iconStr.includes('axe')) return '#cbd5e1';
  if (iconStr.includes('anchor')) return '#0ea5e9';
  if (iconStr.includes('fingerprint')) return '#14b8a6';
  if (iconStr.includes('hexagon')) return '#8b5cf6';
  if (iconStr.includes('cpu')) return '#06b6d4';
  if (iconStr.includes('infinity')) return '#ec4899';
  return '#00f2ff';
};

const getCumulativeXp = (lvl: number, currentXp: number) => {
  let total = 0;
  for (let i = 1; i < lvl; i++) {
    total += Math.min(i * 150 + 500, 4000);
  }
  return total + currentXp;
};

const getStreakColor = (streak: number) => {
  if (streak >= 14) return '#00f2ff';
  if (streak >= 7) return '#a855f7';
  return '#f97316';
};

const AppContainer = styled.div` min-height: 100vh; background-color: #020617; color: #fff; font-family: 'Oxanium', sans-serif; overflow-x: hidden; `;
const StatusBar = styled.div` background: linear-gradient(180deg, #0f172a 0%, #020617 100%); border-bottom: 1px solid #1e293b; padding: 15px 20px; position: sticky; top: 0; z-index: 50; box-shadow: 0 4px 20px rgba(0,0,0,0.5); `;
const HPBarContainer = styled.div` display: flex; align-items: center; gap: 10px; margin-bottom: 15px; `;
const HPBarWrapper = styled.div` flex: 1; height: 6px; background: #1e293b; border-radius: 10px; overflow: hidden; `;
const HPBarFill = styled(motion.div)<{
  $hp: number;
}>` height: 100%; background: ${(props) =>
  props.$hp > 50
    ? '#10b981'
    : props.$hp > 20
    ? '#eab308'
    : '#ef4444'}; width: ${(props) => props.$hp}%; box-shadow: 0 0 10px ${(
  props
) => (props.$hp > 50 ? '#10b981' : props.$hp > 20 ? '#eab308' : '#ef4444')}; `;
const PlayerInfoRow = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; `;
const ClassBadge = styled.div` display: flex; align-items: center; gap: 15px; `;
const IconBox = styled(motion.button)<{
  $color: string;
}>` width: 50px; height: 50px; border: 1px solid ${(props) =>
  props.$color}; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: ${(
  props
) => props.$color}15; box-shadow: 0 0 15px ${(props) =>
  props.$color}30; cursor: pointer; transition: 0.2s; &:hover { background: ${(
  props
) => props.$color}30; } &:active { transform: scale(0.9); } `;
const PlayerDetails = styled.div` display: flex; flex-direction: column; gap: 3px; `;
const GoldBadge = styled.div` background: #2a1f00; border: 1px solid #eab308; color: #eab308; padding: 8px 15px; border-radius: 8px; font-weight: 900; display: flex; align-items: center; gap: 8px; `;
const EXPBarContainer = styled.div` display: flex; align-items: center; gap: 10px; font-size: 12px; `;
const EXPBarWrapper = styled.div` flex: 1; height: 4px; background: #1e293b; border-radius: 10px; overflow: hidden; `;
const EXPBarFill = styled(motion.div)<{
  $progress: number;
}>` height: 100%; background: #00f2ff; width: ${(props) => props.$progress}%; `;
const NavigationGrid = styled.div` display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 15px; background: #0b1120; border-bottom: 1px solid #1e293b; `;
const NavButton = styled(motion.button)<{
  $active: boolean;
  $color: string;
}>` background: ${(props) =>
  props.$active ? `${props.$color}15` : '#020617'}; border: 1px solid ${(
  props
) => (props.$active ? props.$color : '#1e293b')}; color: ${(props) =>
  props.$active
    ? props.$color
    : '#64748b'}; padding: 15px 5px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; font-family: 'Oxanium', sans-serif; font-size: 10px; font-weight: 900; letter-spacing: 1px; cursor: pointer; transition: all 0.3s ease; box-shadow: ${(
  props
) =>
  props.$active
    ? `0 0 15px ${props.$color}30`
    : 'none'}; &:hover { border-color: ${(props) => props.$color}; color: ${(
  props
) => props.$color}; background: #0f172a; } `;
const LogoutBtn = styled.button` background: none; border: none; color: #ef4444; cursor: pointer; display: flex; align-items: center; gap: 5px; font-family: 'Oxanium', sans-serif; font-size: 12px; font-weight: bold; margin-top: 10px; `;

const HeartIcon = ({ size, color }: { size: number; color: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const App = () => {
  const [player, setPlayer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const savedData = localStorage.getItem('elite_system_active_session');
    if (savedData) {
      setPlayer(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    if (player) {
      localStorage.setItem(
        'elite_system_active_session',
        JSON.stringify(player)
      );
    }
  }, [player]);

  const handleAwaken = (playerData: any) => {
    playSound('startup');
    setPlayer(playerData);
  };

  const handleLogout = () => {
    playSound('click');
    localStorage.removeItem('elite_system_active_session');
    localStorage.removeItem('elite_coach_mode');
    setPlayer(null);
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === 'rank' || tabId === 'profile') playSound('shield');
    else if (tabId === 'records' || tabId === 'rehab') playAuraSound(player);
    else playSound('click');
    setActiveTab(tabId);
  };

  if (!player) return <AwakeningScreen onAwaken={handleAwaken} />;

  const currentLvl = player.lvl || 1;
  const currentXpProgress = player.xp || 0;
  const xpNeededForNext = Math.min(currentLvl * 150 + 500, 4000);
  const xpProgress = Math.min(100, (currentXpProgress / xpNeededForNext) * 100);
  const totalCumulativeXp = getCumulativeXp(currentLvl, currentXpProgress);
  const nextLevelCumulativeTarget = getCumulativeXp(currentLvl + 1, 0);

  const hp = player.hp ?? 100;
  const auraColor = getIconColor(player);
  const currentStreak = player.streak || 0;
  const streakColor = getStreakColor(currentStreak);

  // 🚨 العيادة (CLINIC) بقت أساسية للكل 🚨
  const TABS = [
    { id: 'dashboard', label: 'QUESTS', icon: CheckSquare, color: '#00f2ff' },
    { id: 'radar', label: 'RADAR', icon: Globe, color: '#0ea5e9' },
    { id: 'records', label: 'RECORDS', icon: Medal, color: '#facc15' },
    { id: 'shop', label: 'SHOP', icon: ShoppingCart, color: '#38bdf8' },
    { id: 'store', label: 'STORE', icon: Storefront, color: '#10b981' },
    { id: 'rank', label: 'RANK', icon: Shield, color: '#00f2ff' },
    { id: 'profile', label: 'PROFILE', icon: User, color: '#6366f1' },
    { id: 'rules', label: 'RULES', icon: Book, color: '#f43f5e' },
    { id: 'rehab', label: 'CLINIC', icon: Activity, color: '#10b981' },
  ];

  return (
    <AppContainer>
      <StatusBar>
        <HPBarContainer>
          <HeartIcon
            size={14}
            color={hp > 50 ? '#10b981' : hp > 20 ? '#eab308' : '#ef4444'}
          />
          <HPBarWrapper>
            <HPBarFill
              $hp={hp}
              initial={{ width: 0 }}
              animate={{ width: `${hp}%` }}
              transition={{ duration: 1 }}
            />
          </HPBarWrapper>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: hp > 50 ? '#10b981' : hp > 20 ? '#eab308' : '#ef4444',
            }}
          >
            {hp} / 100
          </span>
        </HPBarContainer>

        <PlayerInfoRow>
          <ClassBadge>
            <IconBox
              $color={auraColor}
              onClick={() => playAuraSound(player)}
              whileTap={{ scale: 0.9 }}
            >
              {getDynamicIcon(player, 26)}
            </IconBox>

            <PlayerDetails>
              <div
                style={{
                  fontSize: '10px',
                  color: '#00f2ff',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                }}
              >
                PLAYER STATUS
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                  }}
                >
                  LVL {currentLvl} - {player.name}
                </div>
                {currentStreak >= 3 && (
                  <motion.div
                    title={`${currentStreak} Days Streak!`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: `${streakColor}15`,
                      padding: '2px 6px',
                      borderRadius: '8px',
                      border: `1px solid ${streakColor}50`,
                    }}
                  >
                    <Flame
                      size={14}
                      color={streakColor}
                      fill={streakColor}
                      style={{ marginRight: '4px' }}
                    />
                    <span
                      style={{
                        fontSize: '12px',
                        color: streakColor,
                        fontWeight: '900',
                      }}
                    >
                      {currentStreak}
                    </span>
                  </motion.div>
                )}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                {`[Class: ${player.titles?.[0] || 'Athlete'}] | Elite`}
              </div>
            </PlayerDetails>
          </ClassBadge>

          <GoldBadge>
            <img
              src="https://cdn-icons-png.flaticon.com/512/138/138246.png"
              width="16"
              alt="gold"
              style={{
                filter:
                  'brightness(0) saturate(100%) invert(75%) sepia(55%) saturate(1637%) hue-rotate(352deg) brightness(101%) contrast(106%)',
              }}
            />
            {player.gold || 0}
          </GoldBadge>
        </PlayerInfoRow>

        <EXPBarContainer>
          <span style={{ color: '#00f2ff', fontWeight: 'bold' }}>EXP</span>
          <EXPBarWrapper>
            <EXPBarFill
              $progress={xpProgress}
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </EXPBarWrapper>
          <span style={{ color: '#00f2ff' }}>
            {totalCumulativeXp} / {nextLevelCumulativeTarget}
          </span>
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
            <tab.icon size={20} />
            {tab.label}
          </NavButton>
        ))}
      </NavigationGrid>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && (
            <Dashboard player={player} setPlayer={setPlayer} />
          )}
          {activeTab === 'radar' && <Radar />}
          {activeTab === 'rank' && (
            <Rank player={player} setPlayer={setPlayer} />
          )}
          {activeTab === 'shop' && (
            <Shop player={player} setPlayer={setPlayer} />
          )}
          {activeTab === 'store' && (
            <Store player={player} setPlayer={setPlayer} />
          )}
          {activeTab === 'profile' && (
            <Profile player={player} setPlayer={setPlayer} />
          )}
          {activeTab === 'records' && (
            <Records player={player} setPlayer={setPlayer} />
          )}
          {activeTab === 'rules' && <Rules />}
          {activeTab === 'rehab' && <Rehab />}
        </motion.div>
      </AnimatePresence>

      <div
        style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}
      >
        <LogoutBtn onClick={handleLogout}>
          <LogOut size={14} /> SYSTEM LOGOUT
        </LogoutBtn>
      </div>
    </AppContainer>
  );
};

export default App;
