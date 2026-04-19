import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { Toaster, toast } from 'sonner';
import { Medal, Clock, ShieldAlert, Zap, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';

// ==========================================
// 1. المولد الصوتي المدمج
// ==========================================
const playRecordSound = (type: 'open' | 'submit' | 'error' | 'limitBroken') => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  if (type === 'submit') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } else if (type === 'limitBroken') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.setValueAtTime(600, ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.4);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1);
    osc.start();
    osc.stop(ctx.currentTime + 1);
  } else if (type === 'error') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.4);
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } else {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
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
  gainNode.gain.setValueAtTime(0.05, ctx.currentTime); 
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
};

// ==========================================
// 2. التصميمات الأنيقة
// ==========================================
const Container = styled.div`
  padding: 20px;
  font-family: 'Oxanium', sans-serif;
  color: #fff;
  min-height: 100vh;
  padding-bottom: 80px;
  max-width: 600px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #0f172a 0%, #020617 100%);
  border: 1px solid #1e293b;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
`;

const Title = styled.h1`
  font-size: 24px;
  margin: 0;
  color: #00f2ff;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 0 10px rgba(0, 242, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.3), inset 0 0 10px rgba(239, 68, 68, 0.1); }
  50% { box-shadow: 0 0 30px rgba(239, 68, 68, 0.6), inset 0 0 20px rgba(239, 68, 68, 0.2); }
  100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.3), inset 0 0 10px rgba(239, 68, 68, 0.1); }
`;

const LimitBrokenBanner = styled(motion.div)`
  background: #0a0505;
  border: 2px solid #ef4444;
  border-radius: 16px;
  padding: 30px 20px;
  margin-bottom: 30px;
  text-align: center;
  animation: ${glowAnimation} 2s infinite;
  position: relative;
  overflow: hidden;
`;

const LimitTitle = styled.h2`
  font-size: 32px;
  font-weight: 900;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 5px;
  margin: 0 0 10px 0;
  text-shadow: 0 0 15px #ef4444, 0 0 30px #ef4444, 0 0 45px #ef4444;
`;

const LimitSub = styled.div`
  font-size: 13px;
  color: #fca5a5;
  font-weight: bold;
  letter-spacing: 2px;
  margin-bottom: 20px;
  text-transform: uppercase;
`;

const RewardRow = styled.div`
  font-size: 18px;
  font-weight: 900;
  color: #eab308;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  text-shadow: 0 0 10px rgba(234, 179, 8, 0.5);
`;

const ClaimBtn = styled.button`
  background: #ef4444;
  color: #000;
  border: none;
  padding: 12px 40px;
  border-radius: 8px;
  font-family: 'Oxanium', sans-serif;
  font-weight: 900;
  font-size: 16px;
  letter-spacing: 2px;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    background: #fff;
    color: #ef4444;
    box-shadow: 0 0 20px #ef4444;
    transform: scale(1.05);
  }
`;

const CategoryHeader = styled.div<{ $color: string }>`
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 2px;
  color: ${(props) => props.$color};
  text-transform: uppercase;
  margin: 30px 0 15px 0;
  padding-left: 5px;
`;

const ListItem = styled(motion.div)`
  background: #0b1120;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  transition: all 0.3s ease;

  &:hover {
    border-color: #334155;
    background: #0f172a;
  }
`;

const TopRow = styled.div` display: flex; justify-content: space-between; align-items: center; `;
const ItemTitle = styled.div` font-size: 15px; font-weight: bold; color: #f8fafc; `;
const ItemValue = styled.div` font-size: 14px; font-weight: 900; color: #00f2ff; text-shadow: 0 0 8px rgba(0, 242, 255, 0.4); `;
const BottomRow = styled.div` display: flex; gap: 12px; align-items: center; `;
const InputField = styled.input`
  flex: 1; background: #020617; border: 1px solid #1e293b; color: #fff; padding: 12px 15px; border-radius: 8px; font-family: 'Oxanium', sans-serif; font-size: 14px; text-align: center; outline: none; transition: 0.3s;
  &::placeholder { color: #475569; font-weight: bold; }
  &:focus { border-color: #00f2ff; box-shadow: 0 0 10px rgba(0, 242, 255, 0.2); }
`;
const UpdateBtn = styled(motion.button)<{ $btnBg: string; $btnColor: string }>`
  background: ${(props) => props.$btnBg}; color: ${(props) =>
  props.$btnColor}; border: 1px solid rgba(255,255,255,0.05); padding: 12px 20px; border-radius: 8px; font-family: 'Oxanium', sans-serif; font-size: 12px; font-weight: 900; letter-spacing: 1px; cursor: pointer; transition: 0.3s;
  &:hover { filter: brightness(1.2); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const PendingList = styled.div` margin-top: 40px; background: #0f172a; border: 1px dashed #eab308; border-radius: 16px; padding: 20px; `;

// ==========================================
// 3. قاعدة البيانات
// ==========================================
const DEFAULT_RECORDS = [
  { id: '20m', title: '20m Sprint', value: 0, unit: 'sec', type: 'sprint', category: 'SPRINTS' },
  { id: '30m', title: '30m Sprint', value: 0, unit: 'sec', type: 'sprint', category: 'SPRINTS' },
  { id: '40m', title: '40m Sprint', value: 0, unit: 'sec', type: 'sprint', category: 'SPRINTS' },
  { id: '60m', title: '60m Sprint', value: 0, unit: 'sec', type: 'sprint', category: 'SPRINTS' },
  { id: '100m', title: '100m Sprint', value: 0, unit: 'sec', type: 'sprint', category: 'SPRINTS' },
  { id: '150m', title: '150m Sprint', value: 0, unit: 'sec', type: 'sprint', category: 'SPRINTS' },
  { id: '200m', title: '200m Sprint', value: 0, unit: 'sec', type: 'sprint', category: 'SPRINTS' },
  { id: '300m', title: '300m Sprint', value: 0, unit: 'sec', type: 'sprint', category: 'SPRINTS' },
  { id: '400m', title: '400m Sprint', value: 0, unit: 'sec', type: 'sprint', category: 'SPRINTS' },
  { id: 'lj', title: 'Long Jump', value: 0, unit: 'm', type: 'distance', category: 'JUMPS & EXPLOSIVENESS' },
  { id: 'tj', title: 'Triple Jump', value: 0, unit: 'm', type: 'distance', category: 'JUMPS & EXPLOSIVENESS' },
  { id: 'slj', title: 'Standing Long Jump', value: 0, unit: 'm', type: 'distance', category: 'JUMPS & EXPLOSIVENESS' },
  { id: 'bench', title: 'Bench Press', value: 0, unit: 'KG', type: 'weight', category: 'STRENGTH & POWER' },
  { id: 'deadlift', title: 'Deadlift', value: 0, unit: 'KG', type: 'weight', category: 'STRENGTH & POWER' },
  { id: 'squat', title: 'Squat', value: 0, unit: 'KG', type: 'weight', category: 'STRENGTH & POWER' },
  // 🚨 تم إضافة Power Clean بناءً على طلبك 🚨
  { id: 'clean', title: 'Power Clean', value: 0, unit: 'KG', type: 'weight', category: 'STRENGTH & POWER' },
];

const CATEGORY_STYLES: Record<string, { headerColor: string; btnBg: string; btnColor: string }> = {
  SPRINTS: { headerColor: '#0ea5e9', btnBg: '#4c0519', btnColor: '#fda4af' },
  'JUMPS & EXPLOSIVENESS': { headerColor: '#c084fc', btnBg: '#2e1065', btnColor: '#d8b4fe' },
  'STRENGTH & POWER': { headerColor: '#f43f5e', btnBg: '#3f1900', btnColor: '#fde047' },
};

// ==========================================
// 4. المكون الرئيسي (Records)
// ==========================================
const Records = ({ player, setPlayer }: any) => {
  const currentPlayer = player || { name: 'Hunter', records: DEFAULT_RECORDS, pendingRecords: [] };

  const [records, setRecords] = useState<any[]>(DEFAULT_RECORDS);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [approvedPRs, setApprovedPRs] = useState<any[]>([]);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const syncRecordsData = async () => {
      try {
        // 1. استدعاء خطوط الأساس من الجدول الجديد
        const { data: dbRecords } = await supabase
          .from('elite_records')
          .select('*')
          .eq('player_name', currentPlayer.name);

        let syncedRecords = [...DEFAULT_RECORDS];

        if (dbRecords && dbRecords.length > 0) {
          syncedRecords = DEFAULT_RECORDS.map((defaultRec) => {
            const existingRec = dbRecords.find((r: any) => r.exercise_name === defaultRec.title);
            return existingRec ? { ...defaultRec, value: Number(existingRec.weight_kg) } : defaultRec;
          });
        }
        setRecords(syncedRecords);

        // 2. استدعاء الطلبات والجوائز من جدول الطلبات الجديد
        const { data: requests } = await supabase
          .from('elite_quests')
          .select('*')
          .eq('player_name', currentPlayer.name)
          .eq('type', 'record');

        if (requests) {
          const pending = requests
            .filter((r) => r.status === 'pending')
            .map((req) => {
              let oldV: string | number = 0;
              let newV: string | number = req.evidence;
              if (req.evidence && req.evidence.includes('➡️ Achieved')) {
                const parts = req.evidence.split('➡️ Achieved');
                oldV = parts[0].replace('Beat', '').trim();
                newV = parts[1].trim();
              }
              return {
                id: req.id,
                title: req.task_name.replace('[NEW PR] ', ''),
                oldValue: oldV,
                newValue: newV,
                date: new Date(req.created_at).toLocaleDateString(),
              };
            });
          setPendingRequests(pending);

          const approved = requests.filter((r) => r.status === 'approved');
          if (approved.length > 0) {
            setApprovedPRs(approved);
          }
        }
      } catch (err) {
        console.error('Sync failed', err);
      }
    };
    syncRecordsData();
  }, [currentPlayer.name]);

  const handleInputChange = (id: string, value: string) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  // 🚨 دالة استلام الجايزة وتحديث الفلوس 🚨
  const handleClaimPR = async (prId: string) => {
    playRecordSound('limitBroken');
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.4 },
      colors: ['#ef4444', '#ffffff', '#eab308'],
    });

    // 1. مسح الإشعار من الداتابيز عشان ميظهرش تاني
    await supabase.from('elite_quests').delete().eq('id', prId);
    setApprovedPRs((prev) => prev.filter((p) => p.id !== prId));

    // 2. تحديث فلوس اللاعب في الواجهة فوراً
    if (setPlayer) {
      const { data: pData } = await supabase.from('elite_players').select('gold').eq('name', currentPlayer.name).single();
      if (pData) {
        const updatedPlayer = { ...currentPlayer, gold: pData.gold };
        setPlayer(updatedPlayer);
        localStorage.setItem('elite_system_active_session', JSON.stringify(updatedPlayer));
      }
    }
  };

  const handleUpdate = async (record: any) => {
    if (isProcessing) return;
    const inputValue = inputs[record.id];

    if (!inputValue || isNaN(parseFloat(inputValue))) {
      playRecordSound('error');
      toast.error('Please enter a valid number.', {
        style: { background: '#020617', border: '1px solid #ef4444', color: '#ef4444' },
      });
      return;
    }

    setIsProcessing(true);
    const newValue = parseFloat(inputValue);
    const isBaseline = record.value === 0;

    if (isBaseline) {
      playRecordSound('submit');
      confetti({ particleCount: 80, spread: 60, colors: ['#00f2ff', '#facc15', '#ffffff'] });

      const updatedRecords = records.map((r) =>
        r.id === record.id ? { ...r, value: newValue } : r
      );
      setRecords(updatedRecords);

      try {
        await supabase.from('elite_records').upsert({
          player_name: currentPlayer.name,
          exercise_name: record.title,
          weight_kg: newValue
        }, { onConflict: 'player_name, exercise_name' });
        
        toast.success(`[BASELINE SET]: ${record.title} initialized at ${newValue} ${record.unit}!`, {
          style: { background: '#020617', border: '1px solid #10b981', color: '#10b981', fontWeight: 'bold' },
        });
      } catch (err) {
        console.error('Failed to save baseline', err);
      }

      setInputs((prev) => ({ ...prev, [record.id]: '' }));
      setIsProcessing(false);
      return;
    }

    if (record.type === 'sprint') {
      const difference = record.value - newValue;
      if (difference < 0.04) {
        playRecordSound('error');
        const targetToBeat = (record.value - 0.04).toFixed(2);
        toast.error(`[SYSTEM REJECTED]: You must beat the record by at least 0.04s. Target: ${targetToBeat}s or lower.`, {
          duration: 5000,
          style: { background: '#000', border: '2px solid #ef4444', color: '#ef4444', fontWeight: 'bold' },
        });
        setIsProcessing(false);
        return;
      }
    } else {
      if (newValue <= record.value) {
        playRecordSound('error');
        toast.error(`[SYSTEM REJECTED]: New record must be higher than ${record.value} ${record.unit}.`, {
          style: { background: '#000', border: '1px solid #ef4444', color: '#ef4444' },
        });
        setIsProcessing(false);
        return;
      }
    }

    playRecordSound('submit');
    confetti({ particleCount: 50, spread: 50, colors: ['#eab308', '#ffffff'] });

    const newRequest = {
      id: Date.now(),
      recordId: record.id,
      title: record.title,
      oldValue: record.value,
      newValue: newValue,
      unit: record.unit,
      status: 'pending',
      date: new Date().toLocaleDateString(),
    };
    const updatedPending = [...pendingRequests, newRequest];
    setPendingRequests(updatedPending);

    try {
      await supabase.from('elite_quests').insert([
        {
          player_name: currentPlayer.name,
          task_name: `[NEW PR] ${record.title}`,
          evidence: `Beat ${record.value}${record.unit} ➡️ Achieved ${newValue}${record.unit}`,
          type: 'record',
          status: 'pending',
        },
      ]);
      toast.success('[RECORD BROKEN]: Verification Request sent to Coach.', {
        style: { background: '#020617', border: '1px solid #eab308', color: '#eab308', fontWeight: 'bold' },
      });
    } catch (err) {
      console.error('Failed to send request', err);
    }

    setInputs((prev) => ({ ...prev, [record.id]: '' }));
    setIsProcessing(false);
  };

  const groupedRecords = records.reduce((acc, record) => {
    if (!acc[record.category]) acc[record.category] = [];
    acc[record.category].push(record);
    return acc;
  }, {});

  return (
    <Container>
      <Toaster position="top-center" theme="dark" />

      {/* 🚨 إشعار كسر الرقم القياسي 🚨 */}
      <AnimatePresence>
        {approvedPRs.map((pr) => (
          <LimitBrokenBanner
            key={pr.id}
            initial={{ scale: 0.8, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.3 } }}
          >
            <div style={{ position: 'absolute', top: 10, left: 10, opacity: 0.5 }}><Zap size={40} color="#ef4444" /></div>
            <div style={{ position: 'absolute', bottom: 10, right: 10, opacity: 0.5 }}><Zap size={40} color="#ef4444" /></div>

            <LimitTitle>LIMIT BROKEN</LimitTitle>
            <LimitSub>NEW PERSONAL RECORD SET: {pr.task_name.replace('[NEW PR]', '')}</LimitSub>

            <RewardRow>
              <span>+0 EXP</span>
              <span>+200 Gold</span>
            </RewardRow>

            <ClaimBtn onClick={() => handleClaimPR(pr.id)}>
              CLAIM REWARD
            </ClaimBtn>
          </LimitBrokenBanner>
        ))}
      </AnimatePresence>

      <Header>
        <Title>
          <Medal size={28} color="#00f2ff" />
          HALL OF RECORDS
        </Title>
        <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'right', fontWeight: 'bold', letterSpacing: '1px' }}>
          TRACK YOUR LIMITS.
        </div>
      </Header>

      {Object.keys(groupedRecords).map((categoryName) => {
        const style = CATEGORY_STYLES[categoryName] || CATEGORY_STYLES['SPRINTS'];
        return (
          <div key={categoryName}>
            <CategoryHeader $color={style.headerColor}>
              {categoryName}
            </CategoryHeader>
            {groupedRecords[categoryName].map((record: any, index: number) => {
              const isBaseline = record.value === 0;
              return (
                <ListItem
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onMouseEnter={() => playHoverSound()}
                >
                  <TopRow>
                    <ItemTitle>{record.title}</ItemTitle>
                    <ItemValue>
                      {isBaseline ? 'No Record' : `${record.value} ${record.unit}`}
                    </ItemValue>
                  </TopRow>
                  <BottomRow>
                    <InputField
                      type="number"
                      step="0.01"
                      placeholder={`New PR (${record.unit})`}
                      value={inputs[record.id] || ''}
                      onChange={(e) => handleInputChange(record.id, e.target.value)}
                    />
                    <UpdateBtn
                      $btnBg={style.btnBg}
                      $btnColor={style.btnColor}
                      onClick={() => handleUpdate(record)}
                      whileTap={{ scale: 0.95 }}
                      disabled={isProcessing}
                    >
                      UPDATE
                    </UpdateBtn>
                  </BottomRow>
                </ListItem>
              );
            })}
          </div>
        );
      })}

      {pendingRequests.length > 0 && (
        <PendingList>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#eab308', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '1px' }}>
            <Clock size={16} /> AWAITING MONARCH APPROVAL
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingRequests.map((req) => (
              <div key={req.id} style={{ background: '#020617', border: '1px solid #1e293b', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{req.title}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Submitted: {req.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', textDecoration: 'line-through' }}>
                    {req.oldValue === 0 || String(req.oldValue).startsWith('0') ? '---' : req.oldValue}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#eab308', textShadow: '0 0 5px rgba(234, 179, 8, 0.3)' }}>
                    {req.newValue}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PendingList>
      )}
    </Container>
  );
};

export default Records;