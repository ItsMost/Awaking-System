import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Zap,
  Wind,
  Star,
  Sword,
  Shield,
  Target,
  Crosshair,
  Skull,
  Moon,
  Eye,
  Crown,
  Heart,
  Activity,
  Droplet,
  User,
  ArrowRight,
  Lock,
  AlertTriangle,
  Loader,
  Dumbbell,
  Footprints,
  Axe,
  Anchor,
  Fingerprint,
  Cpu,
  Infinity as InfinityIcon,
  Hexagon,
  Key,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ==========================================
// 1. المحرك الصوتي المطور
// ==========================================
let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!sharedAudioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) sharedAudioCtx = new Ctx();
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
};

const playAwakeningSound = (
  type: 'typing' | 'error' | 'success' | 'modeSwitch'
) => {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  if (type === 'typing') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } else if (type === 'error') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } else if (type === 'modeSwitch') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } else {
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.setValueAtTime(400, ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.4);
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1);
    osc.start();
    osc.stop(ctx.currentTime + 1);
  }
};

const playSwordSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
};

const playAuraSound = (iconId: string) => {
  if (
    ['Sword', 'Shield', 'Target', 'Crosshair', 'Axe', 'Dumbbell'].includes(
      iconId
    )
  ) {
    playSwordSound();
    return;
  }
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  if (['Flame', 'Zap', 'Star'].includes(iconId)) {
    osc.type = 'square';
    osc.frequency.setValueAtTime(1500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } else if (['Droplet', 'Heart', 'Wind', 'Footprints'].includes(iconId)) {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } else {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.5);
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }
};

// ==========================================
// 2. التصميمات (Styled Components)
// ==========================================
const bgAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Container = styled.div`
  min-height: 100vh; background: linear-gradient(-45deg, #020617, #0f172a, #020617, #1e1b4b); background-size: 400% 400%; animation: ${bgAnimation} 15s ease infinite; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Oxanium', sans-serif; color: #fff; padding: 20px; position: relative; overflow: hidden;
`;

const ParticlesOverlay = styled.div`
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: radial-gradient(rgba(0, 242, 255, 0.15) 1px, transparent 1px); background-size: 30px 30px; opacity: 0.5; pointer-events: none;
`;

const glitch = keyframes`
  0% { text-shadow: 2px 2px #00f2ff, -2px -2px #ef4444; transform: translate(0); }
  20% { text-shadow: -2px 2px #00f2ff, 2px -2px #ef4444; transform: translate(-2px, 2px); }
  40% { text-shadow: 2px -2px #00f2ff, -2px 2px #ef4444; transform: translate(2px, -2px); }
  60% { text-shadow: -2px -2px #00f2ff, 2px 2px #ef4444; transform: translate(-2px, -2px); }
  80% { text-shadow: 2px 2px #00f2ff, -2px -2px #ef4444; transform: translate(2px, 2px); }
  100% { text-shadow: 0px 0px #00f2ff, 0px 0px #ef4444; transform: translate(0); }
`;

const Title = styled.h1`
  font-size: 36px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 10px; text-align: center; position: relative; z-index: 10; text-shadow: 0 0 20px rgba(0, 242, 255, 0.5);
  &.glitching { animation: ${glitch} 0.3s infinite; }
`;

const Subtitle = styled.p`
  font-size: 12px; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px; z-index: 10;
`;

const FormCard = styled(motion.div)`
  background: rgba(11, 17, 32, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(0, 242, 255, 0.2); border-radius: 24px; padding: 35px 30px; width: 100%; max-width: 480px; box-shadow: 0 20px 50px rgba(0,0,0,0.8), inset 0 0 20px rgba(0, 242, 255, 0.05); position: relative; z-index: 10;
`;

const InputGroup = styled.div`
  margin-bottom: 22px; display: flex; flex-direction: column; gap: 8px;
`;

const Label = styled.label<{ $highlight?: boolean }>`
  font-size: 11px; color: ${(props) =>
    props.$highlight
      ? '#eab308'
      : '#cbd5e1'}; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; display: flex; align-items: center; gap: 6px;
`;

const Input = styled.input<{ $isKey?: boolean }>`
  background: rgba(2, 6, 23, 0.8); border: 1px solid ${(props) =>
    props.$isKey ? '#eab308' : '#334155'}; color: ${(props) =>
  props.$isKey
    ? '#eab308'
    : '#fff'}; padding: 16px; border-radius: 12px; font-family: 'Oxanium', sans-serif; font-size: 16px; outline: none; transition: 0.3s; letter-spacing: ${(
  props
) => (props.$isKey ? '3px' : 'normal')}; text-transform: ${(props) =>
  props.$isKey ? 'uppercase' : 'none'};
  &:focus { border-color: ${(props) =>
    props.$isKey ? '#facc15' : '#00f2ff'}; box-shadow: 0 0 20px ${(props) =>
  props.$isKey
    ? 'rgba(234, 179, 8, 0.2)'
    : 'rgba(0, 242, 255, 0.2)'}; background: rgba(2, 6, 23, 1); }
  &::placeholder { color: #475569; font-weight: bold; letter-spacing: normal; text-transform: none; }
`;

const ErrorText = styled.div`
  color: #ef4444; font-size: 12px; font-weight: bold; margin-bottom: 20px; display: flex; align-items: center; gap: 6px; background: rgba(239, 68, 68, 0.1); padding: 10px; border-radius: 8px; border: 1px dashed #ef4444;
`;

const GenderGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
`;

const GenderBtn = styled(motion.button)<{ $selected: boolean; $color: string }>`
  background: ${(props) =>
    props.$selected ? `${props.$color}20` : 'rgba(2, 6, 23, 0.6)'};
  border: 1px solid ${(props) => (props.$selected ? props.$color : '#334155')};
  color: ${(props) => (props.$selected ? props.$color : '#94a3b8')};
  padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Oxanium'; font-weight: bold; font-size: 13px; cursor: pointer; transition: 0.3s;
  &:hover { border-color: ${(props) => props.$color}; color: ${(props) =>
  props.$color}; background: rgba(15, 23, 42, 0.8); }
`;

const IconsGrid = styled.div`
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 10px; max-height: 180px; overflow-y: auto; padding-right: 5px;
  &::-webkit-scrollbar { width: 4px; } &::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
`;

const IconBtn = styled(motion.button)<{ $selected: boolean; $color: string }>`
  background: ${(props) =>
    props.$selected ? `${props.$color}20` : 'rgba(2, 6, 23, 0.6)'};
  border: 1px solid ${(props) => (props.$selected ? props.$color : '#1e293b')};
  color: ${(props) => (props.$selected ? props.$color : '#64748b')};
  padding: 12px 0; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s;
  box-shadow: ${(props) =>
    props.$selected ? `0 0 15px ${props.$color}50` : 'none'};
  &:hover { border-color: ${(props) => props.$color}; color: ${(props) =>
  props.$color}; background: rgba(15, 23, 42, 0.8); }
`;

const spin = keyframes` 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } `;
const LoadingSpinner = styled(Loader)` animation: ${spin} 1s linear infinite; `;

const SubmitBtn = styled(motion.button)<{ disabled?: boolean }>`
  width: 100%; background: ${(props) =>
    props.disabled ? '#334155' : 'linear-gradient(90deg, #0ea5e9, #00f2ff)'};
  color: ${(props) =>
    props.disabled
      ? '#94a3b8'
      : '#000'}; border: none; padding: 20px; border-radius: 14px; font-family: 'Oxanium', sans-serif; font-size: 16px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; cursor: ${(
  props
) =>
  props.disabled
    ? 'not-allowed'
    : 'pointer'}; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 10px; box-shadow: ${(
  props
) =>
  props.disabled
    ? 'none'
    : '0 10px 25px rgba(0, 242, 255, 0.4)'}; transition: 0.3s;
  &:hover { box-shadow: ${(props) =>
    props.disabled
      ? 'none'
      : '0 10px 35px rgba(0, 242, 255, 0.6)'}; filter: brightness(1.1); }
`;

const ToggleModeBtn = styled.button`
  background: none; border: none; color: #94a3b8; font-family: 'Oxanium', sans-serif; font-size: 13px; font-weight: bold; cursor: pointer; margin-top: 25px; width: 100%; text-decoration: underline; transition: 0.3s;
  &:hover { color: #00f2ff; }
`;

// ==========================================
// 3. قاعدة بيانات الأيقونات
// ==========================================
const availableIcons = [
  { id: 'Sword', icon: Sword, color: '#00f2ff' },
  { id: 'Flame', icon: Flame, color: '#ef4444' },
  { id: 'Zap', icon: Zap, color: '#eab308' },
  { id: 'Dumbbell', icon: Dumbbell, color: '#f97316' },
  { id: 'Moon', icon: Moon, color: '#d8b4fe' },
  { id: 'Eye', icon: Eye, color: '#818cf8' },
  { id: 'Shield', icon: Shield, color: '#64748b' },
  { id: 'Crown', icon: Crown, color: '#f59e0b' },
  { id: 'Skull', icon: Skull, color: '#a855f7' },
  { id: 'Footprints', icon: Footprints, color: '#10b981' },
  { id: 'Wind', icon: Wind, color: '#38bdf8' },
  { id: 'Target', icon: Target, color: '#f43f5e' },
  { id: 'Axe', icon: Axe, color: '#cbd5e1' },
  { id: 'Anchor', icon: Anchor, color: '#0ea5e9' },
  { id: 'Fingerprint', icon: Fingerprint, color: '#14b8a6' },
  { id: 'Hexagon', icon: Hexagon, color: '#8b5cf6' },
  { id: 'Cpu', icon: Cpu, color: '#06b6d4' },
  { id: 'Infinity', icon: InfinityIcon, color: '#ec4899' },
  { id: 'Heart', icon: Heart, color: '#f43f5e' },
  { id: 'Activity', icon: Activity, color: '#10b981' },
];

// ==========================================
// 4. المكون الرئيسي
// ==========================================
const AwakeningScreen = ({ onAwaken }: any) => {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [isGlitching, setIsGlitching] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Sword');
  const [accessKey, setAccessKey] = useState('');

  const [gender, setGender] = useState<'Male' | 'Female' | null>(null);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 300);
    }, 6000);
    return () => clearInterval(glitchInterval);
  }, []);

  const toggleMode = () => {
    playAwakeningSound('modeSwitch');
    setMode(mode === 'signup' ? 'login' : 'signup');
    setError('');
  };

  const handleInputChange = (setter: any) => (e: any) => {
    playAwakeningSound('typing');
    setter(e.target.value);
    setError('');
  };

  const handleSubmit = async () => {
    getAudioContext();

    if (!name || name.trim().length < 3) {
      playAwakeningSound('error');
      setError('Hunter Name must be at least 3 characters.');
      return;
    }
    if (!password || password.length < 4) {
      playAwakeningSound('error');
      setError('Password must be at least 4 characters.');
      return;
    }

    if (mode === 'signup') {
      if (!weight || !bodyFat) {
        playAwakeningSound('error');
        setError('Bio Stats (Weight & Body Fat) are required.');
        return;
      }
      if (!gender) {
        playAwakeningSound('error');
        setError('Please identify your Gender.');
        return;
      }
      if (!accessKey || accessKey.trim() === '') {
        playAwakeningSound('error');
        setError('ACCESS KEY REQUIRED to enter the system.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        // 🚨 التأكد من الجدول الجديد (elite_players)
        const { data: existingUser } = await supabase
          .from('elite_players')
          .select('name')
          .ilike('name', name.trim())
          .single();
          
        if (existingUser) {
          playAwakeningSound('error');
          setError('This Hunter Name is already registered! Please Login.');
          setIsLoading(false);
          return;
        }

        const { data: keyData, error: keyError } = await supabase
          .from('access_keys')
          .select('*')
          .eq('key_code', accessKey.trim())
          .single();

        if (keyError || !keyData) {
          playAwakeningSound('error');
          setError('INVALID ACCESS KEY. Intruder detected.');
          setIsLoading(false);
          return;
        }

        if (keyData.is_used) {
          playAwakeningSound('error');
          setError('This Access Key has already been claimed.');
          setIsLoading(false);
          return;
        }

        // 🚨 إدخال الداتا للجدول الجديد
        const { error: insertError } = await supabase
          .from('elite_players')
          .insert([
            {
              name: name.trim(),
              password: password,
              weight: weight,
              body_fat: bodyFat,
              gender: gender, 
              selected_icon: selectedIcon,
              cumulative_xp: 0, 
              monthly_xp: 0,
              gold: 0,
              hp: 100,
              active_penalty: false,
            },
          ]);

        if (insertError) throw insertError;

        await supabase
          .from('access_keys')
          .update({ is_used: true, used_by: name.trim() })
          .eq('key_code', accessKey.trim());

        playAwakeningSound('success');
        onAwaken({
          name: name.trim(),
          password,
          weight,
          body_fat: bodyFat,
          gender,
          selected_icon: selectedIcon,
          isLogin: false,
        });
      } else if (mode === 'login') {
        // 🚨 تسجيل الدخول من الجدول الجديد
        const { data: user, error: fetchError } = await supabase
          .from('elite_players')
          .select('*')
          .ilike('name', name.trim())
          .single();

        if (!user || fetchError) {
          playAwakeningSound('error');
          setError('Hunter not found in the system! Awaken first.');
          setIsLoading(false);
          return;
        }
        if (user.password !== password) {
          playAwakeningSound('error');
          setError('Incorrect Password! Intruder detected.');
          setIsLoading(false);
          return;
        }

        playAwakeningSound('success');
        onAwaken(user); // تمرير كل بيانات اليوزر الجديدة للأبلكيشن
      }
    } catch (err: any) {
      playAwakeningSound('error');
      setError(err.message || 'System Connection Failed. Check your network.');
    }
    setIsLoading(false);
  };

  return (
    <Container>
      <ParticlesOverlay />

      <Title className={isGlitching ? 'glitching' : ''}>
        {mode === 'signup' ? 'System Awakening' : 'System Login'}
      </Title>
      <Subtitle>
        {mode === 'signup'
          ? 'Initiate your athletic journey'
          : 'Resume your progress'}
      </Subtitle>

      <FormCard
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      >
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ErrorText>
                <AlertTriangle size={16} /> {error}
              </ErrorText>
            </motion.div>
          )}
        </AnimatePresence>

        <InputGroup>
          <Label>
            <User size={14} color="#00f2ff" /> Hunter Name
          </Label>
          <Input
            type="text"
            placeholder="Enter your system alias..."
            value={name}
            onChange={handleInputChange(setName)}
          />
        </InputGroup>

        <InputGroup>
          <Label>
            <Lock size={14} color="#00f2ff" /> Secure Password
          </Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={handleInputChange(setPassword)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </InputGroup>

        <AnimatePresence>
          {mode === 'signup' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                }}
              >
                <InputGroup>
                  <Label>Weight (KG)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 75"
                    value={weight}
                    onChange={handleInputChange(setWeight)}
                  />
                </InputGroup>
                <InputGroup>
                  <Label>Body Fat (%)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 15"
                    value={bodyFat}
                    onChange={handleInputChange(setBodyFat)}
                  />
                </InputGroup>
              </div>

              <InputGroup>
                <Label>Identification</Label>
                <GenderGrid>
                  <GenderBtn
                    $selected={gender === 'Male'}
                    $color="#0ea5e9"
                    onClick={() => {
                      playAwakeningSound('typing');
                      setGender('Male');
                    }}
                  >
                    Male
                  </GenderBtn>
                  <GenderBtn
                    $selected={gender === 'Female'}
                    $color="#ec4899"
                    onClick={() => {
                      playAwakeningSound('typing');
                      setGender('Female');
                    }}
                  >
                    Female
                  </GenderBtn>
                </GenderGrid>
              </InputGroup>

              <InputGroup>
                <Label $highlight={true}>
                  <Key size={14} color="#eab308" /> ACCESS KEY (INVITE CODE)
                </Label>
                <Input
                  $isKey={true}
                  type="text"
                  placeholder="Enter 12-digit code"
                  value={accessKey}
                  onChange={handleInputChange(setAccessKey)}
                />
              </InputGroup>

              <InputGroup>
                <Label>Select Your Aura (Icon)</Label>
                <IconsGrid>
                  {availableIcons.map((item) => (
                    <IconBtn
                      key={item.id}
                      $selected={selectedIcon === item.id}
                      $color={item.color}
                      onClick={() => {
                        playAuraSound(item.id);
                        setSelectedIcon(item.id);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <item.icon size={22} />
                    </IconBtn>
                  ))}
                </IconsGrid>
              </InputGroup>
            </motion.div>
          )}
        </AnimatePresence>

        <SubmitBtn
          onClick={handleSubmit}
          disabled={isLoading}
          whileHover={!isLoading ? { scale: 1.02 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
        >
          {isLoading ? (
            <LoadingSpinner size={24} />
          ) : mode === 'signup' ? (
            'AWAKEN'
          ) : (
            'ENTER SYSTEM'
          )}
          {!isLoading && <ArrowRight size={22} />}
        </SubmitBtn>

        <ToggleModeBtn onClick={toggleMode} disabled={isLoading}>
          {mode === 'signup'
            ? 'Already awakened? Access your profile.'
            : 'First time? Initiate Awakening Protocol.'}
        </ToggleModeBtn>
      </FormCard>
    </Container>
  );
};

export default AwakeningScreen;