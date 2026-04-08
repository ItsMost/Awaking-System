import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Gavel, Radio, CheckCircle, XCircle, 
  Users, Zap, Skull, Send, Key, Loader, Lock, AlertTriangle, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast, Toaster } from 'sonner';

// ==========================================
// التصميمات (Styled Components)
// ==========================================
const Container = styled(motion.div)` padding: 20px; font-family: 'Oxanium', sans-serif; color: #fff; padding-bottom: 100px; max-width: 600px; margin: 0 auto; direction: rtl; `;
const Header = styled.div` display: flex; justify-content: space-between; align-items: center; background: linear-gradient(90deg, #450a0a 0%, #020617 100%); border: 1px solid #ef4444; padding: 20px; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.2); `;
const Title = styled.h1` font-size: 20px; margin: 0; color: #ef4444; display: flex; align-items: center; gap: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; `;

const LoginBox = styled(motion.div)` background: #0b1120; border: 1px solid #ef4444; padding: 30px; border-radius: 16px; text-align: center; margin-top: 50px; box-shadow: 0 0 30px rgba(239, 68, 68, 0.2); `;
const Input = styled.input` width: 100%; background: #020617; border: 1px solid #334155; color: #fff; padding: 15px; border-radius: 10px; margin-bottom: 15px; font-family: 'Oxanium'; font-size: 16px; text-align: center; outline: none; transition: 0.3s; &:focus { border-color: #ef4444; box-shadow: 0 0 15px rgba(239, 68, 68, 0.3); } `;
const Btn = styled.button<{ $color: string }>` width: 100%; background: ${(props) => props.$color}; color: #000; font-weight: 900; font-family: 'Oxanium'; padding: 15px; border: none; border-radius: 10px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 10px; transition: 0.3s; &:hover { filter: brightness(1.2); transform: translateY(-2px); } `;

const TabsWrapper = styled.div` display: flex; gap: 10px; margin-bottom: 20px; `;
const Tab = styled.button<{ $active: boolean, $color: string }>` flex: 1; padding: 12px; background: ${(props) => props.$active ? `${props.$color}20` : '#0f172a'}; border: 1px solid ${(props) => props.$active ? props.$color : '#1e293b'}; color: ${(props) => props.$active ? props.$color : '#94a3b8'}; border-radius: 12px; font-weight: 900; font-family: 'Oxanium'; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; `;

const Card = styled.div<{ $color: string }>` background: #0b1120; border: 1px solid ${(props) => props.$color}50; padding: 20px; border-radius: 16px; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); `;
const Select = styled.select` width: 100%; background: #020617; border: 1px solid #334155; color: #fff; padding: 15px; border-radius: 10px; margin-bottom: 15px; font-family: 'Oxanium'; outline: none; `;
const TextArea = styled.textarea` width: 100%; background: #020617; border: 1px solid #334155; color: #fff; padding: 15px; border-radius: 10px; margin-bottom: 15px; font-family: 'Oxanium'; outline: none; min-height: 100px; resize: vertical; `;

const spin = keyframes` 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } `;
const Spinner = styled(Loader)` animation: ${spin} 1s linear infinite; `;

const ModalOverlay = styled(motion.div)` position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(5px); `;
const ModalContent = styled(motion.div)` background: #0b1120; border: 2px solid #10b981; border-radius: 20px; padding: 25px; width: 100%; max-width: 400px; position: relative; `;

// ==========================================
// المكون الرئيسي (The Punisher Radar)
// ==========================================
const Radar = () => {
  const [isAuthorized, setIsAuthorized] = useState(localStorage.getItem('elite_coach_mode') === 'true');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('punish'); // punish, pending, broadcast
  const [isLoading, setIsLoading] = useState(false);

  // States
  const [players, setPlayers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  
  // Punisher Form
  const [punishData, setPunishData] = useState({ playerName: '', hpDeduct: 10, goldDeduct: 50, reason: '' });
  
  // Broadcast Form
  const [broadcastMsg, setBroadcastMsg] = useState('');

  // Approve Modal
  const [approveModal, setApproveModal] = useState<{ show: boolean, req: any, exp: number, gold: number }>({ show: false, req: null, exp: 100, gold: 30 });

  useEffect(() => {
    if (isAuthorized) {
      fetchPlayers();
      fetchRequests();
    }
  }, [isAuthorized]);

  const fetchPlayers = async () => {
    try { const { data } = await supabase.from('shadow_hunters').select('*'); if (data) setPlayers(data); } catch (e) {}
  };

  const fetchRequests = async () => {
    try { const { data } = await supabase.from('system_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false }); if (data) setRequests(data); } catch (e) {}
  };

  const handleLogin = () => {
    if (password === 'coach2026') {
      localStorage.setItem('elite_coach_mode', 'true');
      setIsAuthorized(true);
      toast.success('ACCESS GRANTED: COMMAND CENTER ONLINE');
    } else {
      toast.error('ACCESS DENIED');
    }
  };

  // 1. تنفيذ العقوبة (The Punisher)
  const executePenalty = async () => {
    if (!punishData.playerName) return toast.error('اختر اللاعب أولاً!');
    if (!window.confirm(`متأكد إنك عايز تعاقب ${punishData.playerName} وتجمد حسابه؟`)) return;

    setIsLoading(true);
    try {
      const targetPlayer = players.find(p => p.name === punishData.playerName);
      if (!targetPlayer) throw new Error("Player not found");

      const newHp = Math.max(0, targetPlayer.hp - punishData.hpDeduct);
      const newGold = Math.max(0, targetPlayer.gold - punishData.goldDeduct);

      // تحديث بيانات اللاعب (تفعيل العقوبة والخصم)
      await supabase.from('shadow_hunters').update({
        hp: newHp,
        gold: newGold,
        active_penalty: true,
        streak: 0 // تصفير الـ Streak كعقاب
      }).eq('name', punishData.playerName);

      // إرسال رسالة الرادار (فضيحة علنية)
      const newsMsg = `⚠️ THE PUNISHER: تمت معاقبة [${punishData.playerName}] - ${punishData.reason || 'للتكاسل ومخالفة القوانين'}.`;
      await supabase.from('global_news').insert([{ title: 'SYSTEM PENALTY', content: newsMsg }]);

      toast.success(`تم تدمير اللاعب ${punishData.playerName} بنجاح!`, { style: { background: '#450a0a', color: '#ef4444' } });
      setPunishData({ ...punishData, reason: '' });
      fetchPlayers();
    } catch (err: any) {
      toast.error(err.message);
    }
    setIsLoading(false);
  };

  // 2. قبول الطلبات (Approve Intel)
  const handleApproveClick = (req: any) => {
    // تحديد مكافأة افتراضية حسب نوع المهمة
    let defExp = 100; let defGold = 30;
    if (req.task_name.includes('InBody')) { defExp = 75; defGold = 200; }
    if (req.task_name.includes('Logistics') || req.task_name.includes('Inventory')) { defExp = 100; defGold = 50; }
    if (req.task_name.includes('Friday')) { defExp = 150; defGold = 100; }
    if (req.type === 'penalty') { defExp = 0; defGold = 0; } // العقوبة مفيهاش مكافأة

    setApproveModal({ show: true, req, exp: defExp, gold: defGold });
  };

  const confirmApprove = async () => {
    const { req, exp, gold } = approveModal;
    setIsLoading(true);
    try {
      const targetPlayer = players.find(p => p.name === req.hunter_name);
      if (targetPlayer) {
        let newXp = (targetPlayer.xp || 0) + Number(exp);
        let newMonthlyXp = (targetPlayer.monthly_xp || 0) + Number(exp);
        let newGold = (targetPlayer.gold || 0) + Number(gold);
        let newLvl = targetPlayer.lvl || 1;

        let xpNeeded = Math.min(newLvl * 150 + 500, 4000);
        while (newXp >= xpNeeded) {
          newXp -= xpNeeded;
          newLvl += 1;
          xpNeeded = Math.min(newLvl * 150 + 500, 4000);
        }

        // لو دي كانت مهمة عقوبة (Penalty)، بنفك التجميد
        let penaltyStatus = targetPlayer.active_penalty;
        if (req.type === 'penalty') penaltyStatus = false;

        await supabase.from('shadow_hunters').update({
          xp: newXp, monthly_xp: newMonthlyXp, gold: newGold, lvl: newLvl, active_penalty: penaltyStatus
        }).eq('name', req.hunter_name);
      }

      await supabase.from('system_requests').update({ status: 'approved' }).eq('id', req.id);
      
      toast.success('تم قبول المهمة ومنح المكافآت!');
      setApproveModal({ show: false, req: null, exp: 0, gold: 0 });
      fetchRequests();
      fetchPlayers();
    } catch (err: any) { toast.error('حدث خطأ أثناء القبول'); }
    setIsLoading(false);
  };

  // 3. رفض الطلبات (Reject Intel)
  const handleReject = async (id: string) => {
    if (!window.confirm('متأكد إنك عايز ترفض وتمسح المهمة دي؟')) return;
    setIsLoading(true);
    try {
      await supabase.from('system_requests').delete().eq('id', id);
      toast.error('تم رفض وحذف المهمة');
      fetchRequests();
    } catch (err) { toast.error('خطأ'); }
    setIsLoading(false);
  };

  // 4. إرسال للرادار (Broadcast)
  const sendBroadcast = async () => {
    if (!broadcastMsg) return;
    setIsLoading(true);
    try {
      await supabase.from('global_news').insert([{ title: 'COACH DIRECTIVE', content: broadcastMsg }]);
      toast.success('تم إرسال التعميم للسيرفر بالكامل!');
      setBroadcastMsg('');
    } catch (err) { toast.error('خطأ في الإرسال'); }
    setIsLoading(false);
  };


  if (!isAuthorized) {
    return (
      <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Toaster position="top-center" theme="dark" />
        <LoginBox>
          <Lock size={50} color="#ef4444" style={{ margin: '0 auto 20px auto' }} />
          <h2 style={{ color: '#ef4444', marginBottom: 20, letterSpacing: 2 }}>RESTRICTED AREA</h2>
          <Input type="password" placeholder="Enter Coach Override Key..." value={password} onChange={(e) => setPassword(e.target.value)} />
          <Btn $color="#ef4444" onClick={handleLogin}><Key size={18} /> INITIATE OVERRIDE</Btn>
        </LoginBox>
      </Container>
    );
  }

  return (
    <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Toaster position="top-center" theme="dark" />

      <Header>
        <Title><ShieldAlert size={24} /> COMMAND CENTER</Title>
        <button onClick={() => { localStorage.removeItem('elite_coach_mode'); setIsAuthorized(false); }} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer' }}>LOCK</button>
      </Header>

      <TabsWrapper>
        <Tab $active={activeTab === 'punish'} $color="#ef4444" onClick={() => setActiveTab('punish')}><Gavel size={16} /> المطرقة</Tab>
        <Tab $active={activeTab === 'pending'} $color="#10b981" onClick={() => setActiveTab('pending')}>
          <CheckCircle size={16} /> الطلبات {requests.length > 0 && <span style={{ background: '#10b981', color: '#000', padding: '2px 6px', borderRadius: '10px', fontSize: 10 }}>{requests.length}</span>}
        </Tab>
        <Tab $active={activeTab === 'broadcast'} $color="#38bdf8" onClick={() => setActiveTab('broadcast')}><Radio size={16} /> الرادار</Tab>
      </TabsWrapper>

      {/* ======================= TAB: THE PUNISHER ======================= */}
      {activeTab === 'punish' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card $color="#ef4444">
            <h3 style={{ color: '#ef4444', marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Skull size={18} /> THE PUNISHER PROTOCOL</h3>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>اختر اللاعب، طبق الخصم، وقم بتجميد حسابه حتى يُنفذ عقوبة (التكفير عن الذنب).</p>
            
            <Select value={punishData.playerName} onChange={(e) => setPunishData({...punishData, playerName: e.target.value})}>
              <option value="">-- حدد الهدف (اللاعب) --</option>
              {players.map(p => <option key={p.id} value={p.name}>{p.name} (HP: {p.hp} | Gold: {p.gold})</option>)}
            </Select>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 15 }}>
              <div>
                <label style={{ fontSize: 11, color: '#fca5a5' }}>خصم HP (النزيف)</label>
                <Input type="number" value={punishData.hpDeduct} onChange={(e) => setPunishData({...punishData, hpDeduct: Number(e.target.value)})} style={{ borderColor: '#ef444450' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#fde047' }}>خصم Gold (الغرامة)</label>
                <Input type="number" value={punishData.goldDeduct} onChange={(e) => setPunishData({...punishData, goldDeduct: Number(e.target.value)})} style={{ borderColor: '#eab30850' }} />
              </div>
            </div>

            <label style={{ fontSize: 11, color: '#cbd5e1' }}>رسالة العقوبة (تظهر في الرادار العام)</label>
            <TextArea placeholder="مثال: تم التجميد لتفويت تمرين الرجل والتهرب من الكارديو..." value={punishData.reason} onChange={(e) => setPunishData({...punishData, reason: e.target.value})} />

            <Btn $color="#ef4444" onClick={executePenalty} disabled={isLoading}>
              {isLoading ? <Spinner size={20} /> : <><Gavel size={20} /> EXECUTE PENALTY & FREEZE</>}
            </Btn>
          </Card>
        </motion.div>
      )}

      {/* ======================= TAB: PENDING INTEL ======================= */}
      {activeTab === 'pending' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}><CheckCircle size={40} style={{ opacity: 0.5, marginBottom: 10 }} /><br/>ALL CLEAR. NO PENDING INTEL.</div>
          ) : (
            requests.map(req => (
              <Card key={req.id} $color={req.type === 'penalty' ? '#ef4444' : '#10b981'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>{req.hunter_name}</div>
                    <div style={{ fontSize: 12, color: req.type === 'penalty' ? '#ef4444' : '#38bdf8', marginTop: 4 }}>{req.task_name} {req.type === 'penalty' && '(عقوبة)'}</div>
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>{new Date(req.created_at).toLocaleString()}</div>
                </div>
                
                <div style={{ background: '#020617', padding: 10, borderRadius: 8, fontSize: 12, color: '#cbd5e1', marginBottom: 15, borderLeft: '3px solid #334155' }}>
                  {req.evidence}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <Btn $color="#10b981" onClick={() => handleApproveClick(req)} disabled={isLoading} style={{ padding: '10px' }}>
                    <CheckCircle size={16} /> قبول
                  </Btn>
                  <Btn $color="#ef4444" onClick={() => handleReject(req.id)} disabled={isLoading} style={{ padding: '10px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}>
                    <XCircle size={16} /> رفض
                  </Btn>
                </div>
              </Card>
            ))
          )}
        </motion.div>
      )}

      {/* ======================= TAB: BROADCAST ======================= */}
      {activeTab === 'broadcast' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card $color="#38bdf8">
            <h3 style={{ color: '#38bdf8', marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Radio size={18} /> SERVER BROADCAST</h3>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>أرسل إشعار أو تحذير ليظهر في شريط الأخبار المتحرك لكل اللاعبين.</p>
            
            <TextArea placeholder="اكتب رسالتك هنا..." value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} />
            
            <Btn $color="#38bdf8" onClick={sendBroadcast} disabled={isLoading}>
              {isLoading ? <Spinner size={20} /> : <><Send size={20} /> TRANSMIT MESSAGE</>}
            </Btn>
          </Card>
        </motion.div>
      )}

      {/* 🚨 MODAL: APPROVE & REWARD 🚨 */}
      <AnimatePresence>
        {approveModal.show && approveModal.req && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              <button onClick={() => setApproveModal({ show: false, req: null, exp: 0, gold: 0 })} style={{ position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
              <h3 style={{ color: '#10b981', marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle size={20} /> تحديد المكافأة</h3>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 15 }}>لاعب: {approveModal.req.hunter_name}<br/>مهمة: {approveModal.req.task_name}</p>
              
              {approveModal.req.type !== 'penalty' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#38bdf8' }}>+ EXP</label>
                    <Input type="number" value={approveModal.exp} onChange={(e) => setApproveModal({...approveModal, exp: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#eab308' }}>+ GOLD</label>
                    <Input type="number" value={approveModal.gold} onChange={(e) => setApproveModal({...approveModal, gold: Number(e.target.value)})} />
                  </div>
                </div>
              ) : (
                <div style={{ padding: 15, background: '#10b98120', color: '#10b981', borderRadius: 8, fontSize: 12, marginBottom: 20, textAlign: 'center' }}>
                  بمجرد القبول، سيتم فك التجميد (System Unfreeze) عن اللاعب ولن يحصل على مكافآت.
                </div>
              )}

              <Btn $color="#10b981" onClick={confirmApprove} disabled={isLoading}>
                {isLoading ? <Spinner size={20} /> : 'CONFIRM & APPROVE'}
              </Btn>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

    </Container>
  );
};

export default Radar;