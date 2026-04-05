import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';

// ==========================================
// 1. الأصوات البرمجية
// ==========================================
const playClick = () => {
  const AudioContext =
    window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
};

const playSuccess = () => {
  const AudioContext =
    window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'square';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
};

// ==========================================
// 2. التصميمات
// ==========================================
const Container = styled(motion.div)`
  padding: 20px; font-family: 'Oxanium', sans-serif; color: #fff; padding-bottom: 100px; max-width: 600px; margin: 0 auto; direction: rtl;
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center; background: linear-gradient(90deg, #022c22 0%, #020617 100%); border: 1px solid #10b981; padding: 20px; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2);
`;

const Title = styled.h1`
  font-size: 20px; margin: 0; color: #10b981; display: flex; align-items: center; gap: 10px; text-transform: uppercase; letter-spacing: 1px;
`;

const Card = styled(motion.div)`
  background: #0b1120; border: 1px solid #1e293b; border-radius: 16px; padding: 25px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
`;

const StepTitle = styled.h2`
  font-size: 16px; color: #fff; margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #1e293b; padding-bottom: 15px;
`;

const Grid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
`;

const SelectBtn = styled.button<{ $active: boolean }>`
  background: ${(props) => (props.$active ? '#10b98120' : '#020617')};
  border: 1px solid ${(props) => (props.$active ? '#10b981' : '#1e293b')};
  color: ${(props) => (props.$active ? '#10b981' : '#94a3b8')};
  padding: 15px; border-radius: 12px; font-family: 'Oxanium'; font-size: 14px; font-weight: bold; cursor: pointer; transition: 0.2s; display: flex; flex-direction: column; align-items: center; gap: 8px;
  &:hover { border-color: #10b981; color: #fff; }
`;

const NextBtn = styled.button`
  width: 100%; background: #10b981; color: #000; border: none; padding: 18px; border-radius: 12px; font-family: 'Oxanium'; font-size: 16px; font-weight: 900; cursor: pointer; margin-top: 20px; display: flex; justify-content: center; align-items: center; gap: 10px; transition: 0.3s;
  &:hover { filter: brightness(1.2); transform: translateY(-2px); }
  &:disabled { background: #334155; color: #94a3b8; cursor: not-allowed; transform: none; }
`;

const ProtocolBox = styled(motion.div)<{
  $type: 'ice' | 'heat' | 'rest' | 'active';
}>`
  background: ${(props) =>
    props.$type === 'ice'
      ? '#082f49'
      : props.$type === 'heat'
      ? '#450a0a'
      : props.$type === 'rest'
      ? '#2a0808'
      : '#022c22'};
  border: 1px solid ${(props) =>
    props.$type === 'ice'
      ? '#38bdf8'
      : props.$type === 'heat'
      ? '#f97316'
      : props.$type === 'rest'
      ? '#ef4444'
      : '#10b981'};
  border-radius: 12px; padding: 20px; margin-bottom: 15px; display: flex; align-items: flex-start; gap: 15px;
`;

const ProtocolIcon = styled.div<{ $type: 'ice' | 'heat' | 'rest' | 'active' }>`
  background: rgba(0,0,0,0.3); padding: 12px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
  color: ${(props) =>
    props.$type === 'ice'
      ? '#38bdf8'
      : props.$type === 'heat'
      ? '#f97316'
      : props.$type === 'rest'
      ? '#ef4444'
      : '#10b981'};
`;

// ==========================================
// 3. قاعدة البيانات الطبية
// ==========================================
const LOCATIONS = [
  { id: 'hamstrings', label: 'الخلفية' },
  { id: 'lower_back', label: 'أسفل الظهر' },
  { id: 'adductors', label: 'الضامة' },
  { id: 'anterior_knee', label: 'الركبة من الأمام' },
  { id: 'back_knee', label: 'خلف الركبة' },
  { id: 'shoulder', label: 'الكتف' },
  { id: 'hip_flexor', label: 'ثنيات الحوض (Hip Flexor)' },
];

const SENSATIONS = [
  {
    id: 'pain',
    label: 'ألم حاد / وجع',
    desc: 'وجع بيوقفك عن الحركة أو بيزيد مع الضغط.',
  },
  {
    id: 'tightness',
    label: 'شد عضلي / تيبس',
    desc: 'حاسس إن العضلة قافشة أو مقصّرة ومش مرنة.',
  },
];

// ==========================================
// 4. المكون الرئيسي (Rehab / Clinic)
// ==========================================
const Rehab = () => {
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState('');
  const [sensation, setSensation] = useState('');
  const [severity, setSeverity] = useState(5);

  const handleNext = () => {
    playClick();
    if (step === 3) {
      playSuccess();
    }
    setStep((prev) => prev + 1);
  };

  const handleReset = () => {
    playClick();
    setStep(1);
    setLocation('');
    setSensation('');
    setSeverity(5);
  };

  // 🧠 الذكاء الاصطناعي لتحديد البروتوكول الطبي
  const generateProtocol = () => {
    let protocol = [];

    // 1. قاعدة أسفل الظهر (حرارة دايماً)
    if (location === 'lower_back') {
      protocol.push({
        type: 'heat',
        icon: Flame,
        title: 'بروتوكول الحرارة',
        desc: 'آلام أسفل الظهر غالباً ناتجة عن تشنج عضلي لحماية العمود الفقري. استخدم كمادات مياه دافئة لمدة 15 إلى 20 دقيقة لفك التشنج.',
      });
      if (severity > 6) {
        protocol.push({
          type: 'rest',
          icon: ShieldAlert,
          title: 'تجنب التحميل',
          desc: 'تجنب تمارين الديدليفت، السكوات، أو أي انحناء للأمام بأوزان حتى يختفي الألم تماماً.',
        });
      }
    }
    // 2. قاعدة الشد العضلي (حرارة)
    else if (sensation === 'tightness') {
      protocol.push({
        type: 'heat',
        icon: Flame,
        title: 'بروتوكول فك الشد (الحرارة)',
        desc: 'بما أن الإحساس هو "شد"، فالحرارة ستساعد على توسيع الأوعية الدموية وإرخاء الأنسجة. استخدم كمادات دافئة لمدة 10 إلى 15 دقيقة.',
      });
      protocol.push({
        type: 'active',
        icon: Activity,
        title: 'الإطالة والتدليك',
        desc: 'قم بعمل إطالات حركية خفيفة (Dynamic Stretching) واستخدم الـ Foam Roller برفق على المنطقة لفك العقد العضلية.',
      });
    }
    // 3. قاعدة الألم الحاد (أعلى من 5) -> ثلج
    else if (sensation === 'pain' && severity > 5) {
      protocol.push({
        type: 'ice',
        icon: ThermometerSnowflake,
        title: 'بروتوكول الثلج (R.I.C.E)',
        desc: 'الألم الحاد فوق درجة 5 يدل على وجود التهاب أو تمزق ميكروسكوبي. ضع ثلج (ملفوف في فوطة) لمدة 10 إلى 15 دقيقة لتقليل الالتهاب.',
      });
      protocol.push({
        type: 'rest',
        icon: ShieldAlert,
        title: 'الراحة الإجبارية',
        desc: 'توقف فوراً عن أي تمرين يضع حملاً مباشراً على هذه المنطقة لمدة 48 ساعة لمنع تفاقم الإصابة.',
      });
    }
    // 4. ألم خفيف (5 أو أقل) -> تعافي نشط
    else {
      protocol.push({
        type: 'active',
        icon: HeartPulse,
        title: 'التعافي النشط',
        desc: 'الألم خفيف ومقدور عليه. تجنب الأوزان الثقيلة اليوم، وقم بتنشيط الدورة الدموية في المنطقة بكارديو خفيف أو أوزان خفيفة جداً.',
      });
      protocol.push({
        type: 'ice',
        icon: ThermometerSnowflake,
        title: 'كمادات باردة (اختياري)',
        desc: 'يمكنك وضع كمادات باردة لمدة 10 دقائق بعد التمرين لتقليل أي إجهاد.',
      });
    }

    return protocol;
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Header>
        <Title>
          <Stethoscope size={28} color="#10b981" />
          العيادة الطبية (ELITE CLINIC)
        </Title>
      </Header>

      <AnimatePresence mode="wait">
        {/* الخطوة 1: تحديد المكان */}
        {step === 1 && (
          <Card
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <StepTitle>
              <Activity size={20} color="#38bdf8" /> ١. أين يقع مركز الألم أو
              الشد؟
            </StepTitle>
            <Grid>
              {LOCATIONS.map((loc) => (
                <SelectBtn
                  key={loc.id}
                  $active={location === loc.id}
                  onClick={() => {
                    playClick();
                    setLocation(loc.id);
                  }}
                >
                  {loc.label}
                </SelectBtn>
              ))}
            </Grid>
            <NextBtn disabled={!location} onClick={handleNext}>
              الخطوة التالية
            </NextBtn>
          </Card>
        )}

        {/* الخطوة 2: نوع الإحساس */}
        {step === 2 && (
          <Card
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <StepTitle>
              <AlertTriangle size={20} color="#facc15" /> ٢. ما هو وصف الإحساس؟
            </StepTitle>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
            >
              {SENSATIONS.map((sens) => (
                <SelectBtn
                  key={sens.id}
                  $active={sensation === sens.id}
                  onClick={() => {
                    playClick();
                    setSensation(sens.id);
                  }}
                  style={{
                    flexDirection: 'row',
                    textAlign: 'right',
                    padding: '20px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', marginBottom: '5px' }}>
                      {sens.label}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: sensation === sens.id ? '#34d399' : '#64748b',
                        fontWeight: 'normal',
                      }}
                    >
                      {sens.desc}
                    </div>
                  </div>
                </SelectBtn>
              ))}
            </div>

            <div style={{ marginTop: '30px' }}>
              <StepTitle
                style={{ border: 'none', padding: 0, marginBottom: '10px' }}
              >
                ٣. شدة الألم (١ إلى ١٠):{' '}
                <span
                  style={{
                    color: '#ef4444',
                    fontSize: '24px',
                    marginLeft: '10px',
                  }}
                >
                  {severity}
                </span>
              </StepTitle>
              <input
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#ef4444',
                  direction: 'ltr',
                  height: '6px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
              <NextBtn
                disabled={!sensation}
                onClick={handleNext}
                style={{ flex: 2, margin: 0 }}
              >
                تشخيص الحالة
              </NextBtn>
              <NextBtn
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  margin: 0,
                  background: 'transparent',
                  border: '1px solid #1e293b',
                  color: '#94a3b8',
                }}
              >
                رجوع
              </NextBtn>
            </div>
          </Card>
        )}

        {/* الخطوة 3: النتيجة (البروتوكول) */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <CheckCircle
                size={50}
                color="#10b981"
                style={{ marginBottom: '10px' }}
              />
              <h2 style={{ margin: 0, color: '#fff', fontSize: '22px' }}>
                البروتوكول الطبي الموصى به
              </h2>
              <p
                style={{ color: '#94a3b8', fontSize: '12px', marginTop: '5px' }}
              >
                بناءً على الأعراض المدخلة (ألم بدرجة {severity}/10 في{' '}
                {LOCATIONS.find((l) => l.id === location)?.label})
              </p>
            </div>

            {generateProtocol().map((proto: any, idx: number) => {
              const Icon = proto.icon;
              return (
                <ProtocolBox
                  key={idx}
                  $type={proto.type}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                >
                  <ProtocolIcon $type={proto.type}>
                    <Icon size={28} />
                  </ProtocolIcon>
                  <div>
                    <h3
                      style={{
                        margin: '0 0 5px 0',
                        fontSize: '16px',
                        color: '#fff',
                      }}
                    >
                      {proto.title}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '13px',
                        color: '#cbd5e1',
                        lineHeight: '1.6',
                      }}
                    >
                      {proto.desc}
                    </p>
                  </div>
                </ProtocolBox>
              );
            })}

            <div
              style={{
                background: '#1e1b4b',
                border: '1px dashed #a855f7',
                padding: '15px',
                borderRadius: '12px',
                marginTop: '25px',
                fontSize: '12px',
                color: '#d8b4fe',
                textAlign: 'center',
                lineHeight: '1.5',
              }}
            >
              <strong>ملاحظة هامة:</strong> في حالة استمرار الألم الحاد أو
              التورم لأكثر من 48 ساعة، يرجى التوجه لاستشارة طبيب مختص.
            </div>

            <NextBtn
              onClick={handleReset}
              style={{ background: '#334155', color: '#fff' }}
            >
              <RotateCcw size={18} /> تشخيص حالة أخرى
            </NextBtn>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default Rehab;
