import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle, XCircle, Globe, Send, Loader, User, Clock, Target, Database } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

// ==========================================
// 1. القاموس السري للمكافآت (Rewards Dictionary)
// ==========================================
// عشان المدرب لما يوافق، السيرفر يعرف يدي اللاعب كام نقطة بالظبط بناءً على اسم المهمة
const QUEST_REWARDS: Record<string, { exp: number, gold: number }> = {
  'Practice': { exp: 100, gold: 30 },
  'Practice (Rehab)': { exp: 90, gold: 30 },
  'Recovery Cooldown': { exp: 20, gold: 10 },
  'Thermal / Cryotherapy': { exp: 20, gold: 10 },
  'Recovery Logistics': { exp: 100, gold: 50 },
  'Supplement Inventory': { exp: 100, gold: 50 },
  'InBody Assessment': { exp: 75, gold: 200 },
  'Weekly Volume Compliance': { exp: 150, gold: 100 },
  'Perfect Microcycle Streak': { exp: 150, gold: 100 },
  'Disciplinary Execution': { exp: 0, gold: 0 }, // عقوبة
};

const getReward = (taskName: string) => {
  return QUEST_REWARDS[taskName] || { exp: 50, gold: 20 }; // مكافأة افتراضية لو المهمة مش في القاموس
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
const Container = styled(motion.div)` padding: 20px; font-family: 'Oxanium', sans-serif; color: #fff; padding-bottom: 100px; max-width: 800px; margin: 0 auto; `;
const Header = styled.div` background: linear-gradient(90deg, #450a0a 0%, #020617 100%); border: 1px solid #ef4444; border-radius: 16px; padding: 25px; margin-bottom: 30px; box-shadow: 0 0 30px rgba(239, 68, 68, 0.2); display: flex; align-items: center; gap: 15px; `;
const Title = styled.h1` margin: 0; color: #ef4444; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; text-shadow: 0 0 15px rgba(239, 68, 68, 0.6); `;
const SectionTitle = styled.h2<{ $color: string }>` font-size: 16px; color: ${(props) => props.$color}; letter-spacing: 2px; margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px; text-transform: uppercase; border-bottom: 1px dashed ${(props) => props.$color}50; padding-bottom: 10px; `;

const BroadcastBox = styled.div` background: rgba(14, 165, 233, 0.1); border: 1px solid #0ea5e9; border-radius: 16px; padding: 20px; margin-bottom: 30px; box-shadow: 0 0 20px rgba(14, 165, 233, 0.15); `;
const Input = styled.input` width: 100%; background: #020617; border: 1px solid #334155; color: #fff; padding: 15px; border-radius: 12px; margin-bottom: 15px; font-family: 'Oxanium'; font-size: 14px; outline: none; &:focus { border-color: #0ea5e9; box-shadow: 0 0 10px rgba(14, 165, 233, 0.3); } `;
const TextArea = styled.textarea` width: 100%; background: #020617; border: 1px solid #334155; color: #fff; padding: 15px; border-radius: 12px; margin-bottom: 15px; font-family: 'Oxanium'; font-size: 14px; min-height: 100px; resize: vertical; outline: none; &:focus { border-color: #0ea5e9; box-shadow: 0 0 10px rgba(14, 165, 233, 0.3); } `;
const SendBtn = styled.button` background: #0ea5e9; color: #000; border: none; padding: 15px 25px; border-radius: 12px; font-family: 'Oxanium'; font-weight: 900; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; width: 100%; &:hover { filter: brightness(1.2); box-shadow: 0 0 20px rgba(14, 165, 233, 0.5); } &:disabled { opacity: 0.5; cursor: not-allowed; } `;

const RequestCard = styled(motion.div)` background: #0b1120; border: 1px solid #1e293b; border-left: 4px solid #facc15; border-radius: 12px; padding: 20px; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); display: flex; flex-direction: column; gap: 15px; `;
const ReqHeader = styled.div` display: flex; justify-content: space-between; align-items: flex-start; `;
const ReqPlayer = styled.div` font-size: 16px; font-weight: 900; color: #fff; display: flex; align-items: center; gap: 8px; margin-bottom: 5px; `;
const ReqTask = styled.div` font-size: 14px; color: #facc15; font-weight: bold; display: flex; align-items: center; gap: 6px; `;
const ReqTime = styled.div` font-size: 11px; color: #64748b; display: flex; align-items: center; gap: 4px; `;
const ReqEvidence = styled.div` background: #020617; padding: 12px; border-radius: 8px; font-size: 13px; color: #cbd5e1; border: 1px dashed #334155; `;
const ActionRow = styled.div` display: flex; gap: 10px; margin-top: 10px; `;
const ApproveBtn = styled.button` flex: 1; background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; color: #10b981; padding: 12px; border-radius: 8px; font-family: 'Oxanium'; font-weight: bold; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 5px; &:hover { background: #10b981; color: #000; box-shadow: 0 0 15px rgba(16, 185, 129, 0.4); } &:disabled { opacity: 0.5; cursor: not-allowed; } `;
const RejectBtn = styled.button` flex: 1; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; padding: 12px; border-radius: 8px; font-family: 'Oxanium'; font-weight: bold; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 5px; &:hover { background: #ef4444; color: #000; box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); } &:disabled { opacity: 0.5; cursor: not-allowed; } `;

const spin = keyframes` 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } `;
const Spinner = styled(Loader)` animation: ${spin} 1s linear infinite; `;

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

  useEffect(() => {
    fetchPending();
  }, []);

  // بث رسالة على الرادار
  const handleBroadcast = async () => {
    if (!broadcastTitle || !broadcastMsg) {
      toast.error('أكمل البيانات أولاً');
      return;
    }
    setSendingBroadcast(true);
    try {
      await supabase.from('global_news').insert([{
        title: broadcastTitle,
        content: broadcastMsg,
        type: 'system',
        priority: 1
      }]);
      toast.success('تم إرسال البث للجميع!', { style: { background: '#020617', color: '#0ea5e9', border: '1px solid #0ea5e9' }});
      setBroadcastTitle('');
      setBroadcastMsg('');
    } catch (e) {
      toast.error('فشل البث');
    }
    setSendingBroadcast(false);
  };

  // الموافقة على الطلب
  const handleApprove = async (req: any) => {
    setProcessingId(req.id);
    try {
      // 1. جلب بيانات اللاعب الحالية
      const { data: playerData, error: playerErr } = await supabase.from('elite_players').select('cumulative_xp, gold, hp').eq('name', req.player_name).single();
      if (playerErr || !playerData) throw new Error('تعذر إيجاد اللاعب');

      // 2. حساب المكافآت
      const reward = getReward(req.task_name);
      let newXp = (playerData.cumulative_xp || 0) + reward.exp;
      let newGold = (playerData.gold || 0) + reward.gold;

      // 3. حساب لو اللاعب هيلفل عشان نديله بونس
      const oldLvl = calculateLevelData(playerData.cumulative_xp || 0).level;
      const newLvl = calculateLevelData(newXp).level;
      let bonusGold = 0;
      if (newLvl > oldLvl) {
        bonusGold = (newLvl - oldLvl) * 100;
        if (newLvl % 5 === 0) bonusGold += 100; // اكسترا للرانكات الكبيرة
        newGold += bonusGold;
      }

      // 4. تحديث حالة الطلب
      await supabase.from('elite_quests').update({ status: 'approved' }).eq('id', req.id);

      // 5. إعطاء النقاط للاعب
      await supabase.from('elite_players').update({ cumulative_xp: newXp, monthly_xp: newXp, gold: newGold }).eq('name', req.player_name);

      // 6. تسجيل في الاقتصاد
      await supabase.from('elite_economy').insert([{ player_name: req.player_name, amount: reward.exp, currency: 'xp', operation: 'increase', reason: `Coach Approved: ${req.task_name}` }]);
      if (reward.gold > 0) {
        await supabase.from('elite_economy').insert([{ player_name: req.player_name, amount: reward.gold, currency: 'gold', operation: 'increase', reason: `Coach Approved: ${req.task_name}` }]);
      }

      toast.success(`تمت الموافقة وتم منح ${req.player_name} ${reward.exp} XP!`, { style: { background: '#022c22', color: '#10b981', border: '1px solid #10b981' } });
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
        <SectionTitle $color="#0ea5e9"><Globe size={18} /> GLOBAL RADAR BROADCAST</SectionTitle>
        <Input placeholder="عنوان البث (مثال: تحديث أسبوعي)..." value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} />
        <TextArea placeholder="محتوى الرسالة اللي هتظهر لكل اللاعبين..." value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} />
        <SendBtn disabled={sendingBroadcast} onClick={handleBroadcast}>
          {sendingBroadcast ? <Spinner size={18} /> : <><Send size={18} /> TRANSMIT TO ALL HUNTERS</>}
        </SendBtn>
      </BroadcastBox>

      {/* الطلبات المعلقة */}
      <SectionTitle $color="#facc15"><Database size={18} /> PENDING REQUESTS ({pendingReqs.length})</SectionTitle>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}><Spinner size={30} style={{ margin: '0 auto 15px auto' }} /> SYNCING LOGS...</div>
      ) : pendingReqs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#020617', border: '1px dashed #334155', borderRadius: '12px', color: '#64748b', fontWeight: 'bold' }}>
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