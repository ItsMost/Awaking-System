import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Gem,
  Flame,
  Zap,
  Shield,
  Crown,
  Package,
  Clock,
  Coffee,
  Target,
  Activity,
  Award,
  Wind,
  Footprints,
  Heart,
  ChevronUp,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  Star,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast, Toaster } from 'sonner';

// ==========================================
// 1. المحرك الصوتي المضاد للسبام (Anti-Spam Audio Shield) 🚨
// ==========================================
let sharedAudioCtx: AudioContext | null = null;
let lastPlayTime = 0; // 👈 السر هنا: تسجيل وقت آخر تشغيل للصوت

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

// دالة الحماية: تمنع تشغيل أكثر من صوت في نفس الـ 50 ملي ثانية
const canPlay = () => {
  const now = Date.now();
  if (now - lastPlayTime < 50) return false;
  lastPlayTime = now;
  return true;
};

const playClick = () => {
  if (!canPlay()) return; // 👈 تفعيل الدرع
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

const playBuy = () => {
  if (!canPlay()) return; // 👈 تفعيل الدرع
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
  gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
};

const playError = () => {
  if (!canPlay()) return; // 👈 تفعيل الدرع
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
  
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
};

// ==========================================
// 2. بيانات المتجر (Shop Data)
// ==========================================
const EXCLUSIVE_ITEM = {
  id: 'exclusive_season_1',
  name: 'ELITE PUMP COVER (SEASON 1)',
  desc: 'تيشيرت النخبة الحصري للموسم الأول. قطعة واحدة فقط في السيرفر بأكمله!',
  price: 5000,
  icon: Crown,
  color: '#eab308'
};

const LIMITED_INBODY = {
  id: 'inbody_test',
  name: 'PREMIUM INBODY TEST',
  desc: 'تقييم دقيق لنسبة الدهون والعضلات. متاح مرتين فقط في السيرفر كل شهر!',
  price: 1500,
  icon: Activity,
  color: '#10b981',
  maxStock: 2
};

const ATHLETICS_TITLES = [
  { id: 'title_speed_demon', name: 'Speed Demon', price: 1000, color: '#38bdf8', icon: Zap },
  { id: 'title_iron_lungs', name: 'Iron Lungs', price: 1200, color: '#cbd5e1', icon: Wind },
  { id: 'title_gravity_defier', name: 'Gravity Defier', price: 1500, color: '#a855f7', icon: ChevronUp },
  { id: 'title_track_titan', name: 'Track Titan', price: 1800, color: '#f97316', icon: Target },
  { id: 'title_endurance_beast', name: 'Endurance Beast', price: 2000, color: '#ef4444', icon: Heart },
  { id: 'title_sprint_assassin', name: 'Sprint Assassin', price: 2500, color: '#10b981', icon: Footprints },
];

const GENERAL_ITEMS = [
  {
    id: 'pause_token',
    name: 'PAUSE TOKEN',
    desc: 'احمِ الـ Streak الخاص بك من الضياع في يوم طارئ لا تستطيع فيه التدريب.',
    price: 500,
    icon: Clock,
    color: '#38bdf8'
  },
  {
    id: 'protein_snack',
    name: 'PROTEIN SNACK / DRINK',
    desc: 'سناك صحي أو مشروب طاقة مجاني من بار الجيم.',
    price: 800,
    icon: Coffee,
    color: '#f97316'
  }
];

// ==========================================
// 3. التصميمات المفرودة
// ==========================================
const Container = styled(motion.div)`
  padding: 15px;
  font-family: 'Oxanium', sans-serif;
  color: #fff;
  padding-bottom: 100px;
  max-width: 600px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #1e1b4b 0%, #020617 100%);
  border: 1px solid #4f46e5;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 25px;
  box-shadow: 0 10px 30px rgba(79, 70, 229, 0.2);
`;

const Title = styled.h1`
  font-size: 20px;
  margin: 0;
  color: #818cf8;
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const GoldDisplay = styled.div`
  background: rgba(0,0,0,0.5);
  border: 1px solid #eab308;
  color: #eab308;
  padding: 8px 15px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 0 15px rgba(234, 179, 8, 0.2);
`;

const SectionTitle = styled.h2<{ $color: string }>`
  font-size: 14px;
  color: ${(props) => props.$color};
  margin: 0 0 15px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px dashed ${(props) => props.$color}50;
  padding-bottom: 10px;
`;

const ExclusiveCard = styled(motion.div)<{ $soldOut: boolean; $color: string }>`
  background: ${(props) => props.$soldOut ? '#0f172a' : `linear-gradient(135deg, ${props.$color}20 0%, #020617 100%)`};
  border: 2px solid ${(props) => props.$soldOut ? '#334155' : props.$color};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
  box-shadow: ${(props) => props.$soldOut ? 'none' : `0 10px 30px ${props.$color}30`};
  opacity: ${(props) => props.$soldOut ? 0.7 : 1};
  transition: 0.3s;
`;

const ExclusiveBadge = styled.div<{ $color: string }>`
  position: absolute;
  top: 15px;
  right: -35px;
  background: ${(props) => props.$color};
  color: #000;
  padding: 5px 40px;
  transform: rotate(45deg);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.5);
  z-index: 10;
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  margin-bottom: 30px;
`;

const TitlesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 30px;
`;

const TitleCard = styled.div<{ $color: string }>`
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  transition: 0.3s;

  &:hover {
    border-color: ${(props) => props.$color};
    background: ${(props) => props.$color}10;
    transform: translateY(-2px);
  }
`;

const ItemCard = styled.div`
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: 0.3s;

  &:hover {
    border-color: #38bdf8;
    background: #1e293b;
  }
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const IconWrapper = styled.div<{ $color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${(props) => props.$color}20;
  border: 1px solid ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.$color};
`;

const BuyBtn = styled.button<{ $affordable: boolean; $color?: string }>`
  background: ${(props) => props.$affordable ? (props.$color || '#10b981') : '#334155'};
  color: ${(props) => props.$affordable ? '#000' : '#94a3b8'};
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-family: 'Oxanium';
  font-weight: 900;
  font-size: 14px;
  cursor: ${(props) => props.$affordable ? 'pointer' : 'not-allowed'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: 0.3s;

  &:hover {
    filter: ${(props) => props.$affordable ? 'brightness(1.2)' : 'none'};
    transform: ${(props) => props.$affordable ? 'translateY(-2px)' : 'none'};
  }
`;

const BuyButtonSmall = styled.button<{ $affordable: boolean; $color: string }>`
  background: ${(props) => props.$affordable ? 'transparent' : '#020617'};
  color: ${(props) => props.$affordable ? props.$color : '#475569'};
  border: 1px solid ${(props) => props.$affordable ? props.$color : '#1e293b'};
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  font-family: 'Oxanium';
  font-weight: bold;
  font-size: 12px;
  cursor: ${(props) => props.$affordable ? 'pointer' : 'not-allowed'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: 0.3s;

  &:hover {
    background: ${(props) => props.$affordable ? props.$color : '#020617'};
    color: ${(props) => props.$affordable ? '#000' : '#475569'};
  }
`;

const SoldOutOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(2, 6, 23, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  backdrop-filter: blur(2px);
`;

const SoldOutText = styled.div`
  font-size: 24px;
  font-weight: 900;
  color: #ef4444;
  letter-spacing: 4px;
  text-transform: uppercase;
  border: 2px solid #ef4444;
  padding: 10px 20px;
  border-radius: 8px;
  transform: rotate(-10deg);
  background: rgba(239, 68, 68, 0.1);
`;

const ClaimerText = styled.div`
  margin-top: 10px;
  font-size: 11px;
  color: #94a3b8;
  font-weight: bold;
  background: #0f172a;
  padding: 5px 15px;
  border-radius: 20px;
  border: 1px solid #334155;
  text-align: center;
  line-height: 1.5;
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.9);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(8px);
`;

const ModalContent = styled(motion.div)<{ $color?: string }>`
  background: #0b1120;
  border: 2px solid ${(props) => props.$color || '#eab308'};
  border-radius: 20px;
  padding: 25px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  position: relative;
  box-shadow: 0 0 50px ${(props) => props.$color ? `${props.$color}50` : 'rgba(234, 179, 8, 0.3)'};
`;

// ==========================================
// 4. المكون الرئيسي (Shop)
// ==========================================
const Shop = ({ player, setPlayer }: any) => {
  const [gold, setGold] = useState(player?.gold || 0);
  
  const [exclusiveClaimer, setExclusiveClaimer] = useState('');
  const [inbodyClaimers, setInbodyClaimers] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean, item: any, type: string }>({ show: false, item: null, type: '' });

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    setLoading(true);
    try {
      const { data: hunterData } = await supabase
        .from('shadow_hunters')
        .select('gold')
        .eq('name', player.name)
        .single();
        
      if (hunterData) {
        setGold(hunterData.gold);
        setPlayer((prev: any) => ({ ...prev, gold: hunterData.gold }));
      }

      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();

      const { data: claims } = await supabase
        .from('system_requests')
        .select('hunter_name, task_name')
        .in('task_name', ['[EXCLUSIVE CLAIM] SEASON 1 REWARD', '[LIMITED CLAIM] FREE INBODY TEST'])
        .gte('created_at', firstDay);

      if (claims) {
        const exc = claims.find(c => c.task_name === '[EXCLUSIVE CLAIM] SEASON 1 REWARD');
        setExclusiveClaimer(exc ? exc.hunter_name : '');

        const inbodyList = claims.filter(c => c.task_name === '[LIMITED CLAIM] FREE INBODY TEST').map(c => c.hunter_name);
        setInbodyClaimers(inbodyList);
      }

    } catch (err) {
      console.error("Shop Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const executePurchase = async () => {
    const { item, type } = confirmModal;
    setConfirmModal({ show: false, item: null, type: '' });
    
    if (gold < item.price) {
      playError();
      toast.error('NOT ENOUGH GOLD!');
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();

      if (type === 'exclusive') {
        const { data: checkExc } = await supabase
          .from('system_requests')
          .select('hunter_name')
          .eq('task_name', '[EXCLUSIVE CLAIM] SEASON 1 REWARD')
          .gte('created_at', firstDay);
          
        if (checkExc && checkExc.length > 0) {
          playError();
          toast.error('Too late! Someone just bought it!');
          setExclusiveClaimer(checkExc[0].hunter_name);
          setIsProcessing(false);
          return;
        }
      }

      if (type === 'inbody') {
        const { data: checkInb } = await supabase
          .from('system_requests')
          .select('hunter_name')
          .eq('task_name', '[LIMITED CLAIM] FREE INBODY TEST')
          .gte('created_at', firstDay);
          
        if (checkInb && checkInb.length >= LIMITED_INBODY.maxStock) {
          playError();
          toast.error('InBody Stock is completely sold out for this month!');
          setInbodyClaimers(checkInb.map(c => c.hunter_name));
          setIsProcessing(false);
          return;
        }
        if (checkInb && checkInb.map(c => c.hunter_name).includes(player.name)) {
          playError();
          toast.error('You already claimed an InBody test this month!');
          setIsProcessing(false);
          return;
        }
      }

      const newGold = gold - item.price;

      let updatePayload: any = { gold: newGold };
      let newTitles = player.titles || [];

      if (type === 'title') {
        newTitles = [item.name, ...newTitles.filter((t: string) => t !== item.name)];
        updatePayload.titles = newTitles;
      }

      const { error: updateError } = await supabase
        .from('shadow_hunters')
        .update(updatePayload)
        .eq('name', player.name);
        
      if (updateError) throw updateError;

      let taskName = `[SHOP PURCHASE] ${item.name}`;
      if (type === 'exclusive') taskName = '[EXCLUSIVE CLAIM] SEASON 1 REWARD';
      if (type === 'inbody') taskName = '[LIMITED CLAIM] FREE INBODY TEST';
      if (type === 'title') taskName = `[TITLE UNLOCKED] ${item.name}`;
      
      const { error: reqError } = await supabase
        .from('system_requests')
        .insert([{
          hunter_name: player.name,
          task_name: taskName,
          evidence: `Paid ${item.price} Gold.`,
          type: 'request',
          status: 'pending' 
        }]);
        
      if (reqError) throw reqError;

      playBuy();
      setGold(newGold);
      const updatedPlayer = { ...player, gold: newGold, titles: newTitles };
      setPlayer(updatedPlayer);
      localStorage.setItem('elite_system_active_session', JSON.stringify(updatedPlayer));

      if (type === 'exclusive') setExclusiveClaimer(player.name);
      if (type === 'inbody') setInbodyClaimers([...inbodyClaimers, player.name]);

      toast.success(`Purchase Successful: ${item.name}! Request sent to Coach.`, {
        style: { background: '#022c22', color: '#10b981', border: '1px solid #10b981' }
      });

    } catch (err: any) {
      playError();
      toast.error('Transaction Failed. Try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerConfirm = (item: any, type: string) => {
    playClick();
    setConfirmModal({ show: true, item, type });
  };

  const isExclusiveSoldOut = exclusiveClaimer !== '';
  const inbodyRemaining = LIMITED_INBODY.maxStock - inbodyClaimers.length;
  const isInbodySoldOut = inbodyRemaining <= 0;
  const playerHasInbody = inbodyClaimers.includes(player.name);

  return (
    <Container initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <Toaster position="top-center" theme="dark" />

      <Header>
        <Title>
          <ShoppingCart size={24} color="#818cf8" />
          ELITE VAULT
        </Title>
        <GoldDisplay>
          <Gem size={18} color="#eab308" />
          {gold}
        </GoldDisplay>
      </Header>

      {/* 1. SEASON EXCLUSIVE */}
      <SectionTitle $color="#eab308">
        <Flame size={18} /> SEASON EXCLUSIVE (1/1)
      </SectionTitle>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Syncing Vault Data...</div>
      ) : (
        <ExclusiveCard $soldOut={isExclusiveSoldOut} $color={EXCLUSIVE_ITEM.color}>
          <ExclusiveBadge $color={EXCLUSIVE_ITEM.color}>1/1 SERVER</ExclusiveBadge>
          
          {isExclusiveSoldOut && (
            <SoldOutOverlay>
              <SoldOutText>SOLD OUT</SoldOutText>
              <ClaimerText>Claimed by:<br/>{exclusiveClaimer}</ClaimerText>
            </SoldOutOverlay>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <IconWrapper $color={EXCLUSIVE_ITEM.color} style={{ width: 70, height: 70, borderWidth: '2px' }}>
              <EXCLUSIVE_ITEM.icon size={35} />
            </IconWrapper>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 5px 0', color: EXCLUSIVE_ITEM.color, fontSize: '18px', fontWeight: '900' }}>
                {EXCLUSIVE_ITEM.name}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                {EXCLUSIVE_ITEM.desc}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <BuyBtn 
              $affordable={gold >= EXCLUSIVE_ITEM.price && !isExclusiveSoldOut} 
              $color={EXCLUSIVE_ITEM.color}
              disabled={gold < EXCLUSIVE_ITEM.price || isExclusiveSoldOut || isProcessing}
              onClick={() => triggerConfirm(EXCLUSIVE_ITEM, 'exclusive')}
              style={{ width: '100%', padding: '15px', fontSize: '16px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Gem size={16} /> {EXCLUSIVE_ITEM.price} GOLD
              </span>
            </BuyBtn>
          </div>
        </ExclusiveCard>
      )}

      {/* 2. LIMITED CLINIC (INBODY) */}
      <SectionTitle $color="#10b981">
        <Activity size={18} /> ELITE CLINIC (LIMITED)
      </SectionTitle>

      {!loading && (
        <ExclusiveCard $soldOut={isInbodySoldOut || playerHasInbody} $color={LIMITED_INBODY.color}>
          <ExclusiveBadge $color={LIMITED_INBODY.color}>{inbodyRemaining}/2 SERVER</ExclusiveBadge>
          
          {(isInbodySoldOut || playerHasInbody) && (
            <SoldOutOverlay>
              <SoldOutText>{playerHasInbody ? 'CLAIMED' : 'SOLD OUT'}</SoldOutText>
              {!playerHasInbody && inbodyClaimers.length > 0 && (
                 <ClaimerText>Claimed by:<br/>{inbodyClaimers.join(' & ')}</ClaimerText>
              )}
            </SoldOutOverlay>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <IconWrapper $color={LIMITED_INBODY.color} style={{ width: 60, height: 60, borderWidth: '2px' }}>
              <LIMITED_INBODY.icon size={30} />
            </IconWrapper>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 5px 0', color: LIMITED_INBODY.color, fontSize: '16px', fontWeight: '900' }}>
                {LIMITED_INBODY.name}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                {LIMITED_INBODY.desc}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <BuyBtn 
              $affordable={gold >= LIMITED_INBODY.price && !isInbodySoldOut && !playerHasInbody} 
              $color={LIMITED_INBODY.color}
              disabled={gold < LIMITED_INBODY.price || isInbodySoldOut || playerHasInbody || isProcessing}
              onClick={() => triggerConfirm(LIMITED_INBODY, 'inbody')}
              style={{ width: '100%', padding: '12px', fontSize: '14px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Gem size={14} /> {LIMITED_INBODY.price} GOLD
              </span>
            </BuyBtn>
          </div>
        </ExclusiveCard>
      )}

      {/* 3. TITLES VAULT */}
      <SectionTitle $color="#f43f5e">
        <Award size={18} /> ATHLETICS TITLES VAULT
      </SectionTitle>

      <TitlesGrid>
        {ATHLETICS_TITLES.map((titleItem) => {
          const hasTitle = player?.titles?.includes(titleItem.name);
          return (
            <TitleCard key={titleItem.id} $color={hasTitle ? '#334155' : titleItem.color} style={{ opacity: hasTitle ? 0.5 : 1 }}>
              <titleItem.icon size={24} color={hasTitle ? '#64748b' : titleItem.color} />
              <div style={{ fontSize: '12px', fontWeight: '900', color: hasTitle ? '#94a3b8' : '#fff' }}>{titleItem.name}</div>
              <BuyButtonSmall 
                $affordable={gold >= titleItem.price && !hasTitle} 
                $color={titleItem.color}
                disabled={gold < titleItem.price || hasTitle || isProcessing}
                onClick={() => triggerConfirm(titleItem, 'title')}
              >
                {hasTitle ? 'OWNED' : <><Gem size={12} /> {titleItem.price}</>}
              </BuyButtonSmall>
            </TitleCard>
          );
        })}
      </TitlesGrid>

      {/* 4. GENERAL STORE */}
      <SectionTitle $color="#38bdf8">
        <Package size={18} /> GENERAL STORE
      </SectionTitle>

      <ItemGrid>
        {GENERAL_ITEMS.map((item) => (
          <ItemCard key={item.id}>
            <ItemInfo>
              <IconWrapper $color={item.color}>
                <item.icon size={24} />
              </IconWrapper>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#fff', fontWeight: '900' }}>{item.name}</h4>
                <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8' }}>{item.desc}</p>
              </div>
            </ItemInfo>
            <BuyBtn 
              $affordable={gold >= item.price} 
              disabled={gold < item.price || isProcessing}
              onClick={() => triggerConfirm(item, 'general')}
            >
              <Gem size={14} />
              {item.price}
            </BuyBtn>
          </ItemCard>
        ))}
      </ItemGrid>

      {/* 🚨 CONFIRMATION MODAL 🚨 */}
      <AnimatePresence>
        {confirmModal.show && confirmModal.item && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent $color={confirmModal.item.color} initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}>
              <h2 style={{ color: confirmModal.item.color || '#eab308', marginTop: 0, fontSize: '18px', textTransform: 'uppercase' }}>CONFIRM PURCHASE</h2>
              <div style={{ fontSize: '14px', color: '#fff', marginBottom: '20px' }}>
                Are you sure you want to spend <strong style={{ color: '#eab308' }}>{confirmModal.item.price} Gold</strong> to acquire:
                <br/>
                <span style={{ color: confirmModal.item.color || '#38bdf8', fontSize: '18px', fontWeight: '900', display: 'block', marginTop: '10px' }}>
                  {confirmModal.item.name}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={executePurchase} 
                  disabled={isProcessing}
                  style={{ flex: 1, background: '#10b981', color: '#000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontFamily: 'Oxanium', cursor: 'pointer' }}
                >
                  {isProcessing ? 'PROCESSING...' : 'CONFIRM'}
                </button>
                <button 
                  onClick={() => { playClick(); setConfirmModal({ show: false, item: null, type: '' }); }} 
                  disabled={isProcessing}
                  style={{ flex: 1, background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontFamily: 'Oxanium', cursor: 'pointer' }}
                >
                  CANCEL
                </button>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

    </Container>
  );
};

export default Shop;