import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle, XCircle, Globe, Send, Loader, User, Clock, Target, Database, Trash2, Sliders, Calendar, Activity, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

// ==========================================
// 1. القاموس السري للمكافآت (Rewards Dictionary)
// ==========================================
const QUEST_REWARDS: Record<string, { exp: number, gold: number }> = {
  'Practice': { exp: 150, gold: 30 },
  'Hydration Target (4L)': { exp: 50, gold: 10 },
  'Nutritional Compliance': { exp: 50, gold: 10 },
  'Functional Mobility': { exp: 45, gold: 15 },
  'Recovery Cooldown': { exp: 50, gold: 10 },
  'Weekly Volume Compliance': { exp: 250, gold: 100 },
  'Perfect Microcycle Streak': { exp: 250, gold: 100 },
  'Recovery Logistics': { exp: 150, gold: 50 },
  'Supplement Inventory': { exp: 150, gold: 50 },
  'InBody Assessment': { exp: 100, gold: 200 },
  'Disciplinary Execution': { exp: 0, gold: 0 }, 
};

const getReward = (taskName: string) => {
  return QUEST_REWARDS[taskName] || { exp: 50, gold: 20 }; 
};

const getStreakTier = (s: number) => {
  if (s >= 30) return { name: 'VOID QUANTUM 🌌', multiplier: 1.5, nextMilestone: 60, prevMilestone: 30, color: '#f59e0b' };
  if (s >= 14) return { name: 'CYBER TITAN ⚡', multiplier: 1.2, nextMilestone: 30, prevMilestone: 14, color: '#f97316' };
  if (s >= 7) return { name: 'EMERALD SENTINEL 💚', multiplier: 1.1, nextMilestone: 14, prevMilestone: 7, color: '#10b981' };
  return { name: 'EMBER INITIATE 🔥', multiplier: 1.0, nextMilestone: 7, prevMilestone: 0, color: '#f97316' };
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
  return { level };
};

// ==========================================
// 2. التصميمات (Styled Components)
// ==========================================
const Container = styled(motion.div)` padding: 20px; font-family: 'Exo 2', sans-serif; color: #fff; padding-bottom: 100px; max-width: 800px; margin: 0 auto; `;
const Header = styled.div` background: linear-gradient(90deg, #450a0a 0%, #0c0a09 100%); border: 1px solid #ef4444; border-radius: 16px; padding: 25px; margin-bottom: 30px; box-shadow: 0 0 30px rgba(239, 68, 68, 0.2); display: flex; align-items: center; gap: 15px; `;
const Title = styled.h1` margin: 0; color: #ef4444; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; text-shadow: 0 0 15px rgba(239, 68, 68, 0.6); `;
const SectionTitle = styled.h2<{ $color: string }>` font-size: 16px; color: ${(props) => props.$color}; letter-spacing: 2px; margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px; text-transform: uppercase; border-bottom: 1px dashed ${(props) => props.$color}50; padding-bottom: 10px; `;

const BroadcastBox = styled.div` background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; border-radius: 16px; padding: 20px; margin-bottom: 30px; box-shadow: 0 0 20px rgba(245, 158, 11, 0.15); `;
const Input = styled.input` width: 100%; background: #0c0a09; border: 1px solid #334155; color: #fff; padding: 15px; border-radius: 12px; margin-bottom: 15px; font-family: 'Exo 2'; font-size: 14px; outline: none; &:focus { border-color: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.3); } `;
const TextArea = styled.textarea` width: 100%; background: #0c0a09; border: 1px solid #334155; color: #fff; padding: 15px; border-radius: 12px; margin-bottom: 15px; font-family: 'Exo 2'; font-size: 14px; min-height: 100px; resize: vertical; outline: none; &:focus { border-color: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.3); } `;
const SendBtn = styled.button` background: #f59e0b; color: #000; border: none; padding: 15px 25px; border-radius: 12px; font-family: 'Exo 2'; font-weight: 900; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; width: 100%; &:hover { filter: brightness(1.2); box-shadow: 0 0 20px rgba(245, 158, 11, 0.5); } &:disabled { opacity: 0.5; cursor: not-allowed; } `;

// 🚨 تصميمات لستة الأخبار 🚨
const NewsList = styled.div` margin-top: 20px; display: flex; flex-direction: column; gap: 10px; max-height: 200px; overflow-y: auto; padding-right: 5px; `;
const NewsItem = styled.div` background: #0c0a09; border: 1px solid #44403c; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; gap: 15px; `;

const RequestCard = styled(motion.div)` background: #0b1120; border: 1px solid #44403c; border-left: 4px solid #facc15; border-radius: 12px; padding: 20px; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); display: flex; flex-direction: column; gap: 15px; `;
const ReqHeader = styled.div` display: flex; justify-content: space-between; align-items: flex-start; `;
const ReqPlayer = styled.div` font-size: 16px; font-weight: 900; color: #fff; display: flex; align-items: center; gap: 8px; margin-bottom: 5px; `;
const ReqTask = styled.div` font-size: 14px; color: #facc15; font-weight: bold; display: flex; align-items: center; gap: 6px; `;
const ReqTime = styled.div` font-size: 11px; color: #64748b; display: flex; align-items: center; gap: 4px; `;
const ReqEvidence = styled.div` background: #0c0a09; padding: 12px; border-radius: 8px; font-size: 13px; color: #cbd5e1; border: 1px dashed #334155; `;
const ActionRow = styled.div` display: flex; gap: 10px; margin-top: 10px; `;
const ApproveBtn = styled.button` flex: 1; background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; color: #10b981; padding: 12px; border-radius: 8px; font-family: 'Exo 2'; font-weight: bold; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 5px; &:hover { background: #10b981; color: #000; box-shadow: 0 0 15px rgba(16, 185, 129, 0.4); } &:disabled { opacity: 0.5; cursor: not-allowed; } `;
const RejectBtn = styled.button` flex: 1; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; padding: 12px; border-radius: 8px; font-family: 'Exo 2'; font-weight: bold; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 5px; &:hover { background: #ef4444; color: #000; box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); } &:disabled { opacity: 0.5; cursor: not-allowed; } `;

const spin = keyframes` 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } `;
const Spinner = styled(Loader)` animation: ${spin} 1s linear infinite; `;

const SettingsBox = styled.div`
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid #10b981;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.15);
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0c0a09;
  padding: 12px 15px;
  border-radius: 10px;
  border: 1px solid #44403c;
`;

const SwitchLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  direction: rtl;
  text-align: right;
`;

const LabelText = styled.span`
  font-size: 13px;
  font-weight: bold;
  color: #fff;
`;

const LabelSub = styled.span`
  font-size: 10px;
  color: #94a3b8;
`;

const SwitchEl = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  &:checked + span {
    background-color: #10b981;
    &:before {
      transform: translateX(24px);
    }
  }
`;

const SwitchSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #334155;
  transition: .4s;
  border-radius: 34px;
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
`;

const DateInput = styled.input`
  width: 100%;
  background: #0c0a09;
  border: 1px solid #334155;
  color: #fff;
  padding: 15px;
  border-radius: 12px;
  font-family: 'Exo 2';
  font-size: 14px;
  outline: none;
  &:focus {
    border-color: #10b981;
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
  }
`;

const SaveBtn = styled.button`
  background: #10b981;
  color: #000;
  border: none;
  padding: 15px 25px;
  border-radius: 12px;
  font-family: 'Exo 2';
  font-weight: 900;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: 0.3s;
  width: 100%;
  &:hover {
    filter: brightness(1.2);
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ==========================================
// 3. المكون الرئيسي
// ==========================================
const CoachPanel = () => {
  const [pendingReqs, setPendingReqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  
  // 🚨 State جديد للأخبار الحالية 🚨
  const [activeNews, setActiveNews] = useState<any[]>([]);

  const [doubleExpEndDate, setDoubleExpEndDate] = useState('');
  const [isDoubleExpEnabled, setIsDoubleExpEnabled] = useState(false);
  const [isStreakExpEnabled, setIsStreakExpEnabled] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // جلب الطلبات المعلقة
  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('elite_quests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      if (data && !error) setPendingReqs(data);
    } catch (e) {
      console.error(e);
      toast.error('فشل جلب الطلبات');
    }
    setLoading(false);
  };

  // 🚨 دالة جلب الأخبار الحالية 🚨
  const fetchActiveNews = async () => {
    try {
      const { data } = await supabase.from('global_news').select('*').neq('type', 'system_settings').order('created_at', { ascending: false }).limit(10);
      if (data) setActiveNews(data);
    } catch (e) {}
  };

  const fetchSystemSettings = async () => {
    try {
      const { data, error } = await supabase.from('global_news').select('*').eq('type', 'system_settings').maybeSingle();
      if (data && data.content) {
        const parsed = JSON.parse(data.content);
        if (parsed.double_exp_end_date) setDoubleExpEndDate(parsed.double_exp_end_date);
        if (parsed.is_double_exp_enabled !== undefined) setIsDoubleExpEnabled(parsed.is_double_exp_enabled);
        if (parsed.is_streak_exp_enabled !== undefined) setIsStreakExpEnabled(parsed.is_streak_exp_enabled);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchPending();
    fetchActiveNews(); // جلب الأخبار أول ما الصفحة تفتح
    fetchSystemSettings();
  }, []);

  // بث رسالة على الرادار
  const handleBroadcast = async () => {
    if (!broadcastTitle || !broadcastMsg) {
      toast.error('أكمل البيانات أولاً');
      return;
    }
    setSendingBroadcast(true);
    try {
      const { error } = await supabase.from('global_news').insert([{
        title: broadcastTitle,
        content: broadcastMsg,
        type: 'system',
        priority: 1
      }]);
      
      if (error) throw error; 

      toast.success('تم إرسال البث للجميع!', { style: { background: '#0c0a09', color: '#f59e0b', border: '1px solid #f59e0b' }});
      setBroadcastTitle('');
      setBroadcastMsg('');
      fetchActiveNews(); // تحديث اللستة بعد الإرسال
    } catch (e: any) {
      toast.error(`فشل البث: ${e.message}`);
    }
    setSendingBroadcast(false);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const { data: existing } = await supabase.from('global_news').select('id').eq('type', 'system_settings').maybeSingle();
      const payload = {
        title: 'System Settings',
        content: JSON.stringify({
          double_exp_end_date: doubleExpEndDate,
          is_double_exp_enabled: isDoubleExpEnabled,
          is_streak_exp_enabled: isStreakExpEnabled
        }),
        type: 'system_settings',
        priority: 0
      };

      let error = null;
      if (existing) {
        const { error: err } = await supabase.from('global_news').update(payload).eq('id', existing.id);
        error = err;
      } else {
        const { error: err } = await supabase.from('global_news').insert([payload]);
        error = err;
      }

      if (error) throw error;
      toast.success('تم حفظ إعدادات النظام بنجاح!', { style: { background: '#022c22', color: '#10b981', border: '1px solid #10b981' } });
    } catch (e: any) {
      toast.error(`فشل الحفظ: ${e.message}`);
    }
    setSavingSettings(false);
  };

  // 🚨 دالة مسح خبر من الرادار 🚨
  const handleDeleteNews = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من مسح هذا البث من الرادار؟')) return;
    try {
      await supabase.from('global_news').delete().eq('id', id);
      toast.success('تم مسح البث بنجاح!', { style: { background: '#2a0808', color: '#ef4444', border: '1px solid #ef4444' }});
      setActiveNews(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      toast.error('حدث خطأ أثناء المسح');
    }
  };

  // الموافقة على الطلب
  const handleApprove = async (req: any) => {
    setProcessingId(req.id);
    try {
      // 1. جلب بيانات اللاعب الحالية
      const { data: playerData, error: playerErr } = await supabase.from('elite_players').select('cumulative_xp, cumulative_xp_offset, monthly_xp, gold, hp, streak, active_pet, equipped_gear').eq('name', req.player_name).single();
      if (playerErr || !playerData) throw new Error('تعذر إيجاد اللاعب');

      // Fetch system settings
      const { data: settingsRow } = await supabase.from('global_news').select('*').eq('type', 'system_settings').maybeSingle();
      let settings = null;
      if (settingsRow && settingsRow.content) {
        try {
          settings = JSON.parse(settingsRow.content);
        } catch (e) {}
      }

      // Check if double exp is active
      const now = new Date();
      let isDoubleExp = false;
      if (settings) {
        if (settings.is_double_exp_enabled) {
          if (settings.double_exp_end_date) {
            const endDate = new Date(settings.double_exp_end_date);
            endDate.setHours(23, 59, 59, 999);
            if (now <= endDate) isDoubleExp = true;
          } else {
            isDoubleExp = true;
          }
        }
      }

      // 2. حساب المكافآت
      const reward = getReward(req.task_name);
      const isExcluded = ['Recovery Logistics', 'Supplement Inventory', 'InBody Assessment'].includes(req.task_name);
      
      const expMult = isExcluded ? 1 : (isDoubleExp ? 2 : 1);
      const goldMult = isExcluded ? 1 : (isDoubleExp ? 2 : 1);

      const streakTier = getStreakTier(playerData.streak || 0);
      const streakMultiplier = streakTier.multiplier;
      const hasWyvern = playerData.active_pet === 'Golden Wyvern Core';
      const wyvernMultiplier = hasWyvern ? 1.1 : 1.0;

      let bonusGoldFromGear = 0;
      const parseStat = (statStr: string) => {
        if (!statStr) return;
        if (statStr.includes('+5 Gold')) bonusGoldFromGear += 5;
        if (statStr.includes('+10 Gold')) bonusGoldFromGear += 10;
        if (statStr.includes('+15 Gold')) bonusGoldFromGear += 15;
        if (statStr.includes('+20 Gold')) bonusGoldFromGear += 20;
        if (statStr.includes('+30 Gold')) bonusGoldFromGear += 30;
      };
      if (playerData.equipped_gear) {
        const gear = playerData.equipped_gear as any;
        if (gear.weapon) parseStat(gear.weapon.stat);
        if (gear.armor) parseStat(gear.armor.stat);
        if (gear.artifact) parseStat(gear.artifact.stat);
      }

      const isStreakExpEnabled = settings ? settings.is_streak_exp_enabled : true;
      const expStreakMult = isStreakExpEnabled ? streakMultiplier : 1.0;

      const finalExp = Math.round(reward.exp * expMult * expStreakMult);
      const finalGold = Math.round(((reward.gold * goldMult) + (reward.gold > 0 ? bonusGoldFromGear : 0)) * streakMultiplier * wyvernMultiplier);

      let newXp = (playerData.cumulative_xp || 0) + finalExp;
      let newMonthlyXp = (playerData.monthly_xp || 0) + finalExp;
      let newGold = (playerData.gold || 0) + finalGold;

      // 3. حساب لو اللاعب هيلفل عشان نديله بونس (بناءً على التغير في المستوى النشط للموسم)
      const oldActiveXp = (playerData.cumulative_xp || 0) - (playerData.cumulative_xp_offset || 0);
      const newActiveXp = oldActiveXp + finalExp;
      const oldLvl = calculateLevelData(oldActiveXp).level;
      const newLvl = calculateLevelData(newActiveXp).level;
      let bonusGold = 0;
      if (newLvl > oldLvl) {
        const levelsGained = newLvl - oldLvl;
        for(let i=1; i<=levelsGained; i++) {
           let reachedLvl = oldLvl + i;
           if (reachedLvl % 5 === 0) bonusGold += 200;
           else bonusGold += 100;
        }
        newGold += bonusGold;
      }

      // 4. تحديث حالة الطلب
      await supabase.from('elite_quests').update({ status: 'approved' }).eq('id', req.id);

      // 5. إعطاء النقاط للاعب
      await supabase.from('elite_players').update({ cumulative_xp: newXp, monthly_xp: newMonthlyXp, gold: newGold }).eq('name', req.player_name);

      // 6. تسجيل في الاقتصاد
      await supabase.from('elite_economy').insert([{ player_name: req.player_name, amount: finalExp, currency: 'xp', operation: 'increase', reason: `Coach Approved: ${req.task_name}` }]);
      if (finalGold > 0) {
        await supabase.from('elite_economy').insert([{ player_name: req.player_name, amount: finalGold, currency: 'gold', operation: 'increase', reason: `Coach Approved: ${req.task_name}` }]);
      }
      if (bonusGold > 0) {
        await supabase.from('elite_economy').insert([{ player_name: req.player_name, amount: bonusGold, currency: 'gold', operation: 'increase', reason: `Level Up Bonus` }]);
      }

      toast.success(`تمت الموافقة وتم منح ${req.player_name} ${finalExp} XP!`, { style: { background: '#022c22', color: '#10b981', border: '1px solid #10b981' } });
      setPendingReqs(prev => prev.filter(p => p.id !== req.id));

    } catch (e: any) {
      toast.error(e.message || 'حدث خطأ');
    }
    setProcessingId(null);
  };

  // رفض الطلب
  const handleReject = async (req: any) => {
    if (!window.confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
    setProcessingId(req.id);
    try {
      await supabase.from('elite_quests').update({ status: 'rejected' }).eq('id', req.id);
      toast.error('تم رفض الطلب!', { style: { background: '#2a0808', color: '#ef4444', border: '1px solid #ef4444' } });
      setPendingReqs(prev => prev.filter(p => p.id !== req.id));
    } catch (e) {
      toast.error('حدث خطأ أثناء الرفض');
    }
    setProcessingId(null);
  };

  return (
    <Container initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      
      <Header>
        <ShieldAlert size={40} color="#ef4444" />
        <div>
          <Title>COMMAND CENTER</Title>
          <div style={{ fontSize: '12px', color: '#fca5a5', fontWeight: 'bold' }}>COACH OVERRIDE PROTOCOL ACTIVE</div>
        </div>
      </Header>

      {/* بث الرادار */}
      <BroadcastBox>
        <SectionTitle $color="#f59e0b"><Globe size={18} /> GLOBAL RADAR BROADCAST</SectionTitle>
        <Input placeholder="عنوان البث (مثال: تحديث أسبوعي)..." value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} />
        <TextArea placeholder="محتوى الرسالة اللي هتظهر لكل اللاعبين..." value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} />
        <SendBtn disabled={sendingBroadcast} onClick={handleBroadcast}>
          {sendingBroadcast ? <Spinner size={18} /> : <><Send size={18} /> TRANSMIT TO ALL HUNTERS</>}
        </SendBtn>

        {/* 🚨 قسم إدارة الأخبار الحالية ومسحها 🚨 */}
        {activeNews.length > 0 && (
          <div style={{ marginTop: '30px', borderTop: '1px dashed #f59e0b50', paddingTop: '15px' }}>
            <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 'bold', marginBottom: '10px' }}>ACTIVE BROADCASTS (إدارة البث الحالي)</div>
            <NewsList>
              {activeNews.map(news => (
                <NewsItem key={news.id}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{news.title}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{news.content}</div>
                  </div>
                  <button 
                    onClick={() => handleDeleteNews(news.id)}
                    style={{ background: '#2a0808', border: '1px solid #ef4444', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="مسح من الرادار"
                  >
                    <Trash2 size={16} />
                  </button>
                </NewsItem>
              ))}
            </NewsList>
          </div>
        )}
      </BroadcastBox>

      {/* أدوات التحكم وإدارة النظام */}
      <SettingsBox>
        <SectionTitle $color="#10b981"><Sliders size={18} /> SYSTEM CONTROLS & OVERRIDES</SectionTitle>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'right' }}>
            <Calendar size={12} style={{ marginLeft: '4px' }} /> تاريخ انتهاء حدث الـ Double EXP (المزامنة التلقائية)
          </div>
          <DateInput 
            type="date" 
            value={doubleExpEndDate} 
            onChange={(e) => setDoubleExpEndDate(e.target.value)} 
          />
        </div>

        <SwitchContainer>
          <SwitchEl>
            <SwitchInput 
              type="checkbox" 
              checked={isDoubleExpEnabled} 
              onChange={(e) => setIsDoubleExpEnabled(e.target.checked)} 
            />
            <SwitchSlider />
          </SwitchEl>
          <SwitchLabel>
            <LabelText>تفعيل حدث الـ Double EXP الأسبوعي ⚡</LabelText>
            <LabelSub>عند التفعيل يدوياً، يحصل جميع اللاعبين على مضاعفة خبرة وذهب فورية</LabelSub>
          </SwitchLabel>
        </SwitchContainer>

        <SwitchContainer>
          <SwitchEl>
            <SwitchInput 
              type="checkbox" 
              checked={isStreakExpEnabled} 
              onChange={(e) => setIsStreakExpEnabled(e.target.checked)} 
            />
            <SwitchSlider />
          </SwitchEl>
          <SwitchLabel>
            <LabelText>تطبيق مضاعف الستريك على الخبرة (Streak Multiplier for EXP) 🔥</LabelText>
            <LabelSub>عند التشغيل، يتضاعف حافز نقاط الخبرة المكتسبة بناءً على عدد أيام النشاط المتتالية للاعب</LabelSub>
          </SwitchLabel>
        </SwitchContainer>

        <SaveBtn disabled={savingSettings} onClick={handleSaveSettings}>
          {savingSettings ? <Spinner size={18} /> : <><Save size={18} /> حفظ إعدادات النظام</>}
        </SaveBtn>
      </SettingsBox>

      {/* الطلبات المعلقة */}
      <SectionTitle $color="#facc15"><Database size={18} /> PENDING REQUESTS ({pendingReqs.length})</SectionTitle>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}><Spinner size={30} style={{ margin: '0 auto 15px auto' }} /> SYNCING LOGS...</div>
      ) : pendingReqs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#0c0a09', border: '1px dashed #334155', borderRadius: '12px', color: '#64748b', fontWeight: 'bold' }}>
          ALL CLEAR. NO PENDING REQUESTS.
        </div>
      ) : (
        pendingReqs.map(req => (
          <RequestCard key={req.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <ReqHeader>
              <div>
                <ReqPlayer><User size={16} /> {req.player_name}</ReqPlayer>
                <ReqTask><Target size={14} /> {req.task_name}</ReqTask>
              </div>
              <ReqTime><Clock size={12} /> {new Date(req.created_at).toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</ReqTime>
            </ReqHeader>
            
            <ReqEvidence>
              <div style={{ color: '#64748b', fontSize: '10px', marginBottom: '5px', textTransform: 'uppercase' }}>Evidence Provided:</div>
              {req.evidence}
            </ReqEvidence>

            <ActionRow>
              <ApproveBtn disabled={processingId === req.id} onClick={() => handleApprove(req)}>
                {processingId === req.id ? <Spinner size={18} /> : <><CheckCircle size={18} /> APPROVE</>}
              </ApproveBtn>
              <RejectBtn disabled={processingId === req.id} onClick={() => handleReject(req)}>
                {processingId === req.id ? <Spinner size={18} /> : <><XCircle size={18} /> REJECT</>}
              </RejectBtn>
            </ActionRow>
          </RequestCard>
        ))
      )}

    </Container>
  );
};

export default CoachPanel;