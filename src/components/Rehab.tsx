import React, { useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  Stethoscope,
  ThermometerSnowflake,
  Flame,
  Activity,
  ShieldAlert,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  HeartPulse,
  Scan,
  Crosshair,
  UserCircle2
} from 'lucide-react';

// ==========================================
// 1. المحرك الصوتي
// ==========================================
const playClick = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'sine'; osc.frequency.setValueAtTime(600, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  osc.start(); osc.stop(ctx.currentTime + 0.1);
};

const playSuccess = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'square'; osc.frequency.setValueAtTime(400, ctx.currentTime); osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
  osc.start(); osc.stop(ctx.currentTime + 0.4);
};

const playScan = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, ctx.currentTime); osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 1.5);
  gain.gain.setValueAtTime(0.05, ctx.currentTime); gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
  osc.start(); osc.stop(ctx.currentTime + 1.5);
};

// ==========================================
// 2. المجسم الطبي (3D Human Scanner)
// ==========================================
const BodyScanner3D = ({ painLevel, isScanning }: { painLevel: number, isScanning: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += isScanning ? 0.1 : 0.01; 
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  // تغيير لون المجسم بناءً على درجة الألم (X-Ray Effect)
  const getBodyColor = () => {
    if (painLevel === 0) return '#0ea5e9'; // أزرق طبيعي
    if (painLevel < 5) return '#eab308'; // أصفر تحذيري
    return '#ef4444'; // أحمر حرج
  };

  return (
    <mesh ref={meshRef}>
      {/* مجسم مجرد يمثل الإنسان (Capsule) */}
      <capsuleGeometry args={[1, 2.5, 4, 16]} />
      <meshStandardMaterial 
        color={getBodyColor()} 
        wireframe={true} 
        emissive={getBodyColor()} 
        emissiveIntensity={isScanning ? 1.5 : 0.5} 
        transparent={true}
        opacity={0.8}
      />
    </mesh>
  );
};

// ==========================================
// 3. التصميمات المفرودة (Responsive)
// ==========================================
const Container = styled(motion.div)`
  padding: 15px; font-family: 'Oxanium', sans-serif; color: #fff; padding-bottom: 100px; max-width: 600px; margin: 0 auto; direction: rtl;
  @media (max-width: 480px) { padding: 10px; }
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #022c22 0%, #020617 100%); border: 1px solid #10b981; padding: 20px; border-radius: 20px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2); position: relative; overflow: hidden;
  @media (max-width: 480px) { padding: 15px; border-radius: 16px; margin-bottom: 15px; }
`;

const Title = styled.h1`
  font-size: 18px; margin: 0; color: #10b981; display: flex; align-items: center; gap: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 900;
  @media (max-width: 480px) { font-size: 15px; gap: 6px; }
`;

const ScannerWrapper = styled.div`
  background: #020617; border: 1px solid #10b981; border-radius: 20px; margin-bottom: 20px; height: 220px; display: flex; justify-content: center; align-items: center; position: relative; box-shadow: inset 0 0 40px rgba(16, 185, 129, 0.1); overflow: hidden;
  @media (max-width: 480px) { height: 180px; border-radius: 16px; }
`;

const ScannerOverlayText = styled.div<{ $color: string }>`
  position: absolute; bottom: 15px; left: 15px; font-size: 10px; font-weight: 900; color: ${(props) => props.$color}; letter-spacing: 2px; font-family: monospace; z-index: 10; display: flex; align-items: center; gap: 6px; text-shadow: 0 0 10px ${(props) => props.$color};
`;

const scanline = keyframes` 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } `;
const ScanlineEffect = styled.div` position: absolute; top: 0; left: 0; width: 100%; height: 5px; background: rgba(16, 185, 129, 0.5); box-shadow: 0 0 15px rgba(16, 185, 129, 0.8); animation: ${scanline} 2s linear infinite; pointer-events: none; z-index: 5; `;

const Card = styled(motion.div)`
  background: linear-gradient(180deg, #0b1120 0%, #020617 100%); border: 1px solid #1e293b; border-radius: 20px; padding: 25px; margin-bottom: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  @media (max-width: 480px) { padding: 15px; border-radius: 16px; }
`;

const StepTitle = styled.h2<{ $color?: string }>`
  font-size: 15px; color: ${(props) => props.$color || '#fff'}; margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #1e293b; padding-bottom: 15px; font-weight: 900;
  @media (max-width: 480px) { font-size: 13px; margin: 0 0 15px 0; padding-bottom: 10px; }
`;

const Grid = styled.div` display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; @media (max-width: 480px) { gap: 8px; } `;

const SelectBtn = styled.button<{ $active: boolean; $color: string }>`
  background: ${(props) => (props.$active ? `${props.$color}15` : '#020617')};
  border: 1px solid ${(props) => (props.$active ? props.$color : '#1e293b')};
  color: ${(props) => (props.$active ? props.$color : '#94a3b8')};
  padding: 15px 10px; border-radius: 14px; font-family: 'Oxanium'; font-size: 12px; font-weight: 900; cursor: pointer; transition: 0.3s; display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center;
  box-shadow: ${(props) => (props.$active ? `0 0 15px ${props.$color}40, inset 0 0 10px ${props.$color}20` : 'none')};
  &:hover { border-color: ${(props) => props.$color}; color: #fff; }
  @media (max-width: 480px) { padding: 12px 8px; font-size: 11px; border-radius: 12px; }
`;

const NextBtn = styled.button<{ $color?: string }>`
  width: 100%; background: ${(props) => props.$color || '#10b981'}; color: #000; border: none; padding: 16px; border-radius: 14px; font-family: 'Oxanium'; font-size: 14px; font-weight: 900; cursor: pointer; margin-top: 20px; display: flex; justify-content: center; align-items: center; gap: 8px; transition: 0.3s; letter-spacing: 1px;
  box-shadow: 0 0 20px ${(props) => props.$color || '#10b981'}60;
  &:hover { filter: brightness(1.2); transform: translateY(-2px); }
  &:disabled { background: #1e293b; color: #64748b; cursor: not-allowed; transform: none; box-shadow: none; }
  @media (max-width: 480px) { padding: 14px; font-size: 13px; border-radius: 12px; margin-top: 15px; }
`;

const ProtocolBox = styled(motion.div)<{ $type: 'ice' | 'heat' | 'rest' | 'active' }>`
  background: ${(props) => props.$type === 'ice' ? 'linear-gradient(90deg, #082f49, #020617)' : props.$type === 'heat' ? 'linear-gradient(90deg, #450a0a, #020617)' : props.$type === 'rest' ? 'linear-gradient(90deg, #2a0808, #020617)' : 'linear-gradient(90deg, #022c22, #020617)'};
  border: 1px solid ${(props) => props.$type === 'ice' ? '#38bdf8' : props.$type === 'heat' ? '#f97316' : props.$type === 'rest' ? '#ef4444' : '#10b981'};
  border-radius: 16px; padding: 20px; margin-bottom: 15px; display: flex; align-items: flex-start; gap: 15px;
  @media (max-width: 480px) { padding: 15px; gap: 10px; border-radius: 14px; }
`;

const ProtocolIcon = styled.div<{ $type: 'ice' | 'heat' | 'rest' | 'active' }>`
  background: rgba(0,0,0,0.5); padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  color: ${(props) => props.$type === 'ice' ? '#38bdf8' : props.$type === 'heat' ? '#f97316' : props.$type === 'rest' ? '#ef4444' : '#10b981'};
  border: 1px solid currentColor; box-shadow: inset 0 0 10px currentColor;
  @media (max-width: 480px) { padding: 10px; border-radius: 10px; svg { width: 20px; height: 20px; } }
`;

// 🚨 Severity Slider (Custom Mobile Design) 🚨
const SeverityContainer = styled.div`
  display: flex; align-items: center; justify-content: space-between; background: #020617; border: 1px solid #1e293b; border-radius: 14px; padding: 10px 15px; margin-top: 15px;
`;
const SeverityBtn = styled.button<{ $color: string }>`
  background: ${(props) => props.$color}20; color: ${(props) => props.$color}; border: 1px solid ${(props) => props.$color}; width: 35px; height: 35px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900; cursor: pointer; transition: 0.2s;
  &:active { transform: scale(0.9); }
`;
const SeverityValue = styled.div<{ $color: string }>`
  font-size: 24px; font-weight: 900; color: ${(props) => props.$color}; text-shadow: 0 0 10px ${(props) => props.$color}; font-family: 'Oxanium'; width: 50px; text-align: center;
`;

// ==========================================
// 4. قاعدة البيانات الطبية
// ==========================================
const LOCATIONS = [
  { id: 'hamstrings', label: 'الخلفية' },
  { id: 'lower_back', label: 'أسفل الظهر' },
  { id: 'adductors', label: 'الضامة' },
  { id: 'anterior_knee', label: 'الركبة من الأمام' },
  { id: 'back_knee', label: 'خلف الركبة' },
  { id: 'shoulder', label: 'الكتف' },
  { id: 'hip_flexor', label: 'ثنيات الحوض' },
];

const SENSATIONS = [
  { id: 'pain', label: 'ألم حاد / وجع', desc: 'وجع يوقفك عن الحركة ويزيد مع الضغط.', color: '#ef4444' },
  { id: 'tightness', label: 'شد عضلي / تيبس', desc: 'تشنج أو تقلص في العضلة وضعف بالمرونة.', color: '#facc15' },
];

// ==========================================
// 5. المكون الرئيسي (Rehab / Clinic)
// ==========================================
const Rehab = () => {
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState('');
  const [sensation, setSensation] = useState('');
  const [severity, setSeverity] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const getSeverityColor = () => {
    if (severity === 0) return '#0ea5e9';
    if (severity < 5) return '#eab308';
    if (severity < 8) return '#f97316';
    return '#ef4444';
  };

  const handleNext = () => {
    playClick();
    if (step === 2) {
      // شاشة الـ Scan 
      setIsScanning(true);
      playScan();
      setTimeout(() => {
        setIsScanning(false);
        playSuccess();
        setStep(3);
      }, 1500);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    playClick(); setStep(1); setLocation(''); setSensation(''); setSeverity(0);
  };

  const adjustSeverity = (amount: number) => {
    playHover();
    setSeverity(prev => Math.min(10, Math.max(0, prev + amount)));
  };

  // 🧠 الذكاء الاصطناعي للبروتوكول
  const generateProtocol = () => {
    let protocol = [];

    if (location === 'lower_back') {
      protocol.push({ type: 'heat', icon: Flame, title: 'بروتوكول الحرارة', desc: 'آلام أسفل الظهر غالباً ناتجة عن تشنج عضلي. استخدم كمادات دافئة لمدة 15-20 دقيقة لفك التشنج.' });
      if (severity > 6) protocol.push({ type: 'rest', icon: ShieldAlert, title: 'تجنب التحميل', desc: 'توقف عن أي تمرين يضع حملاً على العمود الفقري (كالسكوات أو الديدليفت) فوراً.' });
    }
    else if (sensation === 'tightness') {
      protocol.push({ type: 'heat', icon: Flame, title: 'فك الشد (الحرارة)', desc: 'الحرارة توسع الأوعية الدموية وتُرخي الأنسجة. استخدم كمادات دافئة لمدة 15 دقيقة.' });
      protocol.push({ type: 'active', icon: Activity, title: 'إطالات وتدليك', desc: 'قم بإطالات حركية خفيفة واستخدم الـ Foam Roller برفق لفك العقد العضلية.' });
    }
    else if (sensation === 'pain' && severity > 5) {
      protocol.push({ type: 'ice', icon: ThermometerSnowflake, title: 'بروتوكول الثلج (R.I.C.E)', desc: 'الألم الحاد يدل على التهاب أو تمزق ميكروسكوبي. ضع ثلج (ملفوف في فوطة) لمدة 15 دقيقة.' });
      protocol.push({ type: 'rest', icon: ShieldAlert, title: 'الراحة الإجبارية', desc: 'توقف فوراً عن أي تمرين يضع حملاً مباشراً على المنطقة لمدة 48 ساعة.' });
    }
    else {
      protocol.push({ type: 'active', icon: HeartPulse, title: 'التعافي النشط', desc: 'الألم خفيف. تجنب الأوزان الثقيلة اليوم، وقم بتنشيط الدورة الدموية في المنطقة بكارديو خفيف.' });
      protocol.push({ type: 'ice', icon: ThermometerSnowflake, title: 'كمادات باردة (اختياري)', desc: 'يمكنك وضع كمادات باردة بعد التمرين لتقليل أي إجهاد بالمنطقة.' });
    }

    return protocol;
  };

  return (
    <Container initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      
      <Header>
        <Title><Stethoscope size={24} color="#10b981" /> ELITE CLINIC</Title>
        <Activity size={20} color="#10b981" />
      </Header>

      {/* 🚨 رادار الجسم الـ 3D 🚨 */}
      <ScannerWrapper>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <BodyScanner3D painLevel={severity} isScanning={isScanning} />
        </Canvas>
        
        <ScannerOverlayText $color={getSeverityColor()}>
          <Scan size={14} /> 
          {isScanning ? 'ANALYZING TISSUE DAMAGE...' : step === 3 ? 'DIAGNOSTIC COMPLETE' : 'AWAITING INPUT...'}
        </ScannerOverlayText>
        
        {isScanning && <ScanlineEffect />}
      </ScannerWrapper>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <Card key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <StepTitle $color="#38bdf8"><Crosshair size={18} /> ١. أين يقع مركز الألم؟</StepTitle>
            <Grid>
              {LOCATIONS.map((loc) => (
                <SelectBtn key={loc.id} $active={location === loc.id} $color="#38bdf8" onClick={() => { playClick(); setLocation(loc.id); }}>
                  {loc.label}
                </SelectBtn>
              ))}
            </Grid>
            <NextBtn disabled={!location} onClick={handleNext} $color="#38bdf8">تأكيد المنطقة <ChevronRight size={18} /></NextBtn>
          </Card>
        )}

        {step === 2 && !isScanning && (
          <Card key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            
            <StepTitle $color="#facc15"><AlertTriangle size={18} /> ٢. ما هو نوع الإحساس؟</StepTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
              {SENSATIONS.map((sens) => (
                <SelectBtn key={sens.id} $active={sensation === sens.id} $color={sens.color} onClick={() => { playClick(); setSensation(sens.id); }} style={{ flexDirection: 'row', textAlign: 'right' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>{sens.label}</div>
                    <div style={{ fontSize: '10px', color: sensation === sens.id ? sens.color : '#64748b', fontWeight: 'normal' }}>{sens.desc}</div>
                  </div>
                </SelectBtn>
              ))}
            </div>

            <StepTitle $color={getSeverityColor()} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
              <HeartPulse size={18} /> ٣. حدد درجة الألم (0 - 10)
            </StepTitle>
            
            <SeverityContainer>
              <SeverityBtn $color={getSeverityColor()} onClick={() => adjustSeverity(-1)}>-</SeverityBtn>
              <SeverityValue $color={getSeverityColor()}>{severity}</SeverityValue>
              <SeverityBtn $color={getSeverityColor()} onClick={() => adjustSeverity(1)}>+</SeverityBtn>
            </SeverityContainer>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <NextBtn disabled={!sensation || severity === 0} onClick={handleNext} $color="#10b981" style={{ flex: 2, margin: 0 }}>
                تشخيص الحالة <Scan size={16} />
              </NextBtn>
              <NextBtn onClick={() => { playClick(); setStep(1); }} style={{ flex: 1, margin: 0, background: 'transparent', border: '1px solid #334155', color: '#94a3b8', boxShadow: 'none' }}>
                رجوع
              </NextBtn>
            </div>
          </Card>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '20px', background: '#022c22', border: '1px solid #10b981', padding: '15px', borderRadius: '16px' }}>
              <CheckCircle size={35} color="#10b981" style={{ marginBottom: '10px' }} />
              <h2 style={{ margin: 0, color: '#10b981', fontSize: '16px', fontWeight: '900' }}>البروتوكول الطبي جاهز</h2>
              <p style={{ color: '#cbd5e1', fontSize: '11px', marginTop: '5px', marginBottom: 0 }}> بناءً على تحليل منطقة الألم ({LOCATIONS.find((l) => l.id === location)?.label}) </p>
            </div>

            {generateProtocol().map((proto: any, idx: number) => {
              const Icon = proto.icon;
              return (
                <ProtocolBox key={idx} $type={proto.type} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.2 }}>
                  <ProtocolIcon $type={proto.type}><Icon size={24} /></ProtocolIcon>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#fff' }}>{proto.title}</h3>
                    <p style={{ margin: 0, fontSize: '11px', color: '#cbd5e1', lineHeight: '1.5' }}>{proto.desc}</p>
                  </div>
                </ProtocolBox>
              );
            })}

            <div style={{ background: '#2a0808', border: '1px dashed #ef4444', padding: '15px', borderRadius: '14px', marginTop: '20px', fontSize: '11px', color: '#fca5a5', textAlign: 'center', lineHeight: '1.5', fontWeight: 'bold' }}>
              <ShieldAlert size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> <strong>تنبيه طبي:</strong> في حالة استمرار الألم الحاد أو التورم لأكثر من 48 ساعة، يرجى استشارة طبيب مختص فوراً.
            </div>

            <NextBtn onClick={handleReset} style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', boxShadow: 'none' }}>
              <RotateCcw size={16} /> إعادة الفحص لحالة أخرى
            </NextBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default Rehab;