import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Radio, Send, Trash2, ShieldAlert, Terminal, MessageSquare, Clock, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast, Toaster } from 'sonner';

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
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
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
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  osc.start(); osc.stop(ctx.currentTime + 0.1);
};

const playBroadcast = () => {
  if (!canPlay()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'square'; osc.frequency.setValueAtTime(300, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
  gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
  osc.start(); osc.stop(ctx.currentTime + 0.5);
};

// ==========================================
// 2. التصميمات والأنيميشن
// ==========================================
const Container = styled(motion.div)` padding: 15px; font-family: 'Oxanium', sans-serif; color: #fff; padding-bottom: 100px; max-width: 600px; margin: 0 auto; position: relative; `;
const Header = styled.div` display: flex; justify-content: space-between; align-items: center; background: linear-gradient(90deg, #0f172a 0%, #020617 100%); border: 1px solid #0ea5e9; padding: 20px; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 10px 30px rgba(14, 165, 233, 0.2); `;
const Title = styled.h1` font-size: 20px; margin: 0; color: #0ea5e9; display: flex; align-items: center; gap: 10px; text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 0 10px rgba(14, 165, 233, 0.5); `;

const LockedOverlay = styled.div` background: #020617; border: 1px solid #ef4444; padding: 40px 20px; border-radius: 16px; text-align: center; color: #ef4444; box-shadow: 0 0 30px rgba(239, 68, 68, 0.2); margin-top: 50px; `;

const sweep = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.4); }
  70% { box-shadow: 0 0 0 20px rgba(14, 165, 233, 0); }
  100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
`;

const RadarAnimationBox = styled.div`
  width: 120px; height: 120px; border-radius: 50%; background: #0f172a; border: 2px solid #0ea5e9; margin: 0 auto 30px auto; position: relative; overflow: hidden; animation: ${pulse} 2s infinite; display: flex; align-items: center; justify-content: center;
  &::after {
    content: ''; position: absolute; top: 50%; left: 50%; width: 50%; height: 2px; background: linear-gradient(90deg, #0ea5e9, transparent); transform-origin: 0% 50%; animation: ${sweep} 3s linear infinite; box-shadow: 0 0 15px #0ea5e9;
  }
`;

const FormCard = styled.div` background: #0b1120; border: 1px solid #1e293b; border-radius: 16px; padding: 20px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); `;
const InputLabel = styled.div` font-size: 11px; color: #0ea5e9; font-weight: 900; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px; display: flex; align-items: center; gap: 6px; `;
const StyledInput = styled.input` width: 100%; background: #020617; border: 1px solid #334155; color: #fff; padding: 15px; border-radius: 12px; font-family: 'Oxanium'; font-size: 14px; outline: none; transition: 0.3s; margin-bottom: 15px; &:focus { border-color: #0ea5e9; box-shadow: 0 0 15px rgba(14, 165, 233, 0.2); } `;
const StyledTextarea = styled.textarea` width: 100%; background: #020617; border: 1px solid #334155; color: #fff; padding: 15px; border-radius: 12px; font-family: 'Oxanium'; font-size: 14px; outline: none; transition: 0.3s; margin-bottom: 20px; resize: vertical; min-height: 100px; &:focus { border-color: #0ea5e9; box-shadow: 0 0 15px rgba(14, 165, 233, 0.2); } `;

const SendBtn = styled.button<{ disabled: boolean }>`
  width: 100%; background: ${(props) => props.disabled ? '#334155' : '#0ea5e9'}; color: ${(props) => props.disabled ? '#94a3b8' : '#000'}; border: none; padding: 16px; border-radius: 12px; font-family: 'Oxanium'; font-size: 14px; font-weight: 900; letter-spacing: 2px; cursor: ${(props) => props.disabled ? 'not-allowed' : 'pointer'}; display: flex; justify-content: center; align-items: center; gap: 10px; transition: 0.3s;
  &:hover { filter: ${(props) => props.disabled ? 'none' : 'brightness(1.2)'}; box-shadow: ${(props) => props.disabled ? 'none' : '0 0 20px rgba(14, 165, 233, 0.4)'}; }
`;

const SectionTitle = styled.h2` font-size: 14px; color: #94a3b8; margin: 30px 0 15px 0; text-transform: uppercase; letter-spacing: 2px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #1e293b; padding-bottom: 10px; `;

const LogCard = styled(motion.div)` background: #0f172a; border-left: 3px solid #0ea5e9; border-radius: 8px; padding: 15px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-start; gap: 15px; `;
const LogTitle = styled.div` font-size: 14px; font-weight: bold; color: #fff; margin-bottom: 4px; `;
const LogContent = styled.div` font-size: 12px; color: #cbd5e1; line-height: 1.4; margin-bottom: 8px; direction: rtl; text-align: right; `;
const LogDate = styled.div` font-size: 10px; color: #64748b; display: flex; align-items: center; gap: 4px; `;
const DeleteBtn = styled.button` background: #2a0808; border: 1px solid #ef4444; color: #ef4444; padding: 8px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s; flex-shrink: 0; &:hover { background: #ef4444; color: #000; } `;

// ==========================================
// 3. المكون الرئيسي (Radar)
// ==========================================
const Radar = () => {
  const isCoachMode = localStorage.getItem('elite_coach_mode') === 'true';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isCoachMode) fetchLogs();
  }, [isCoachMode]);

  const fetchLogs = async () => {
    try {
      const { data } = await supabase.from('global_news').select('*').order('created_at', { ascending: false }).limit(20);
      setLogs(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBroadcast = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and Message are required!');
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase.from('global_news').insert([{
        title: title.trim(),
        content: content.trim()
      }]);

      if (error) throw error;

      playBroadcast();
      toast.success('BROADCAST TRANSMITTED!', { style: { background: '#022c22', border: '1px solid #10b981', color: '#10b981' } });
      setTitle('');
      setContent('');
      fetchLogs();
    } catch (err: any) {
      toast.error('Transmission Failed.');
    }
    setIsProcessing(false);
  };

  const handleDelete = async (id: string) => {
    playClick();
    if (!window.confirm('Delete this broadcast from the server?')) return;
    try {
      await supabase.from('global_news').delete().eq('id', id);
      setLogs(prev => prev.filter(log => log.id !== id));
      toast.success('Broadcast Deleted.');
    } catch (err) {
      toast.error('Failed to delete.');
    }
  };

  if (!isCoachMode) {
    return (
      <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <LockedOverlay>
          <ShieldAlert size={60} style={{ margin: '0 auto 20px auto' }} />
          <h2 style={{ margin: 0, fontSize: '20px', letterSpacing: '2px' }}>ACCESS DENIED</h2>
          <p style={{ fontSize: '12px', color: '#fca5a5', marginTop: '10px' }}>COACH OVERRIDE REQUIRED TO ACCESS RADAR COMMAND CENTER.</p>
        </LockedOverlay>
      </Container>
    );
  }

  return (
    <Container initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <Toaster position="top-center" theme="dark" />

      <Header>
        <Title><Globe size={24} /> COMMAND RADAR</Title>
        <Radio size={24} color="#0ea5e9" className="animate-pulse" />
      </Header>

      <RadarAnimationBox>
        <Globe size={40} color="rgba(14, 165, 233, 0.3)" />
      </RadarAnimationBox>

      <FormCard>
        <InputLabel><Terminal size={14} /> Transmission Title (العنوان)</InputLabel>
        <StyledInput 
          type="text" 
          placeholder="e.g. تحديث هام, رسالة اليوم..." 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />

        <InputLabel><MessageSquare size={14} /> Transmission Payload (الرسالة)</InputLabel>
        <StyledTextarea 
          placeholder="اكتب رسالتك هنا... ستصل كإشعار فوري لجميع اللاعبين." 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          style={{ direction: 'rtl' }}
        />

        <SendBtn disabled={isProcessing || !title.trim() || !content.trim()} onClick={handleBroadcast}>
          {isProcessing ? 'TRANSMITTING...' : 'SEND GLOBAL BROADCAST'} <Send size={18} />
        </SendBtn>
      </FormCard>

      <SectionTitle><Radio size={16} /> TRANSMISSION HISTORY</SectionTitle>
      
      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '12px', background: '#0f172a', borderRadius: '12px' }}>
          No broadcasts transmitted yet.
        </div>
      ) : (
        <AnimatePresence>
          {logs.map((log) => (
            <LogCard key={log.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div style={{ flex: 1 }}>
                <LogTitle>{log.title}</LogTitle>
                <LogContent>{log.content}</LogContent>
                <LogDate><Clock size={12} /> {new Date(log.created_at).toLocaleString()}</LogDate>
              </div>
              <DeleteBtn onClick={() => handleDelete(log.id)} title="Delete Broadcast">
                <Trash2 size={16} />
              </DeleteBtn>
            </LogCard>
          ))}
        </AnimatePresence>
      )}

    </Container>
  );
};

export default Radar;