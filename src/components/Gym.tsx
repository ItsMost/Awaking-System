import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { Toaster, toast } from 'sonner';
import useSound from 'use-sound';
import {
  ShieldCheck,
  Activity,
  HeartPulse,
  Zap,
  Crosshair,
  Medal,
  AlertTriangle,
  Info,
  Move3d,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ==========================================
// 1. المولد الصوتي المدمج
// ==========================================
const playPhysioSound = (type: 'open' | 'select' | 'error' | 'switch') => {
  const AudioContext =
    window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  if (type === 'select') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } else if (type === 'error') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } else if (type === 'switch') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } else {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }
};

// ==========================================
// 2. التصميمات
// ==========================================
const Container = styled.div`
  padding: 20px;
  font-family: 'Oxanium', sans-serif;
  color: #fff;
  min-height: 100vh;
  padding-bottom: 100px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #0f172a 0%, #020617 100%);
  border: 1px solid #1e293b;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 20px;
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

// تبويبات التحكم الجديدة (Sub-Tabs)
const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  background: #0b1120;
  padding: 8px;
  border-radius: 12px;
  border: 1px solid #1e293b;
  margin-bottom: 25px;
`;

const TabButton = styled(motion.button)<{ $active: boolean; $color: string }>`
  flex: 1;
  background: ${(props) =>
    props.$active ? `${props.$color}20` : 'transparent'};
  color: ${(props) => (props.$active ? props.$color : '#64748b')};
  border: 1px solid ${(props) =>
    props.$active ? props.$color : 'transparent'};
  padding: 12px;
  border-radius: 8px;
  font-family: 'Oxanium', sans-serif;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    color: ${(props) => props.$color};
  }
`;

const InfoBox = styled.div<{ $borderColor: string; $bgColor: string }>`
  background: ${(props) => props.$bgColor};
  border: 1px solid ${(props) => props.$borderColor};
  color: #e2e8f0;
  padding: 15px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
`;

const Accordion = styled(motion.div)<{
  $expanded: boolean;
  $themeColor: string;
}>`
  background: #0b1120;
  border: 1px solid ${(props) =>
    props.$expanded ? props.$themeColor : '#1e293b'};
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: ${(props) =>
    props.$expanded
      ? `0 0 15px ${props.$themeColor}20`
      : '0 4px 15px rgba(0,0,0,0.3)'};
  transition: all 0.3s ease;
`;

const AccordionHeader = styled.div`
  padding: 18px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const AccordionTitle = styled.div<{ $color: string }>`
  font-size: 15px;
  font-weight: bold;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg { color: ${(props) => props.$color}; }
`;

const ExpandIcon = styled.div<{ $expanded: boolean }>`
  transform: ${(props) => (props.$expanded ? 'rotate(180deg)' : 'rotate(0)')};
  transition: transform 0.3s ease;
  color: #64748b;
`;

const ContentArea = styled(motion.div)`
  padding: 0 20px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const PhysioInput = styled.div`
  background: #020617;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
`;

const SelectLabel = styled.div`
  font-size: 12px;
  font-weight: bold;
  color: #fff;
`;

const GradeInput = styled.input`
  width: 30%;
  background: rgba(0,0,0,0.8);
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 10px;
  border-radius: 6px;
  font-family: 'Oxanium', sans-serif;
  font-size: 16px;
  font-weight: 900;
  text-align: center;
  outline: none;
  &::placeholder { color: rgba(239,68,68,0.2); }
`;

const UpdatePhysioBtn = styled(motion.button)`
  width: 100%;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid #ef4444;
  padding: 12px;
  border-radius: 8px;
  font-family: 'Oxanium', sans-serif;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1px;
  cursor: pointer;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ExerciseList = styled.div<{ $borderColor: string }>`
  background: #020617;
  border: 1px dashed ${(props) => props.$borderColor};
  border-radius: 10px;
  padding: 15px;
  margin-top: 10px;
`;

const ExerciseItem = styled.div<{ $bulletColor: string }>`
  font-size: 13px;
  color: #e2e8f0;
  line-height: 1.6;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  &::before { content: '➔'; color: ${(props) => props.$bulletColor}; }
  &:last-child { margin-bottom: 0; }
`;

const WarningBox = styled.div`
  background: #2a0808;
  border: 2px solid #ef4444;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin-top: 15px;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
`;

// ==========================================
// 3. قاعدة بيانات الموبيليتي
// ==========================================
const MOBILITY_DATA = [
  { id: 'mob_ankle', title: 'ANKLE MOBILITY (الكاحل)' },
  { id: 'mob_hamstring', title: 'HAMSTRING MOBILITY (الخلفية)' },
  { id: 'mob_hip', title: 'HIP MOBILITY (الحوض والهيب)' },
  { id: 'mob_lback', title: 'LOWER BACK MOBILITY (أسفل الظهر)' },
  { id: 'mob_uback', title: 'UPPER BACK MOBILITY (أعلى الظهر)' },
  { id: 'mob_shoulder', title: 'SHOULDER MOBILITY (الكتف)' },
];

const MOBILITY_EXERCISES: Record<string, string[]> = {
  mob_ankle: [
    'Ankle Circles (رسم دوائر بمشط القدم - 10 لكل اتجاه)',
    'Wall Ankle Dorsiflexion (دفع الركبة للحائط مع ثبات الكعب - 10 عدات)',
    'Heel Walks / Toe Walks (مشي على الكعبين ثم الأمشاط - دقيقة)',
    'Ankle Alphabet (كتابة الحروف الأبجدية بمشط القدم)',
    'Deep Squat Hold (الثبات في السكوات العميق لفتح الكاحل - 30 ثانية)',
  ],
  mob_hamstring: [
    'Leg Swings (مرجحة الرجل للأمام والخلف - 15 لكل رجل)',
    'Inchworms / Walkouts (المشي باليدين للأمام والرجوع - 8 عدات)',
    'Dynamic Hurdler Stretch (إطالة الحواجز الحركية - 10 عدات)',
    'Frankensteins (مشي مع لمس مشط القدم باليد العكسية - 20 خطوة)',
    'Elephant Walks (ثني وفرد الركبتين بالتبادل من وضع الانحناء - 20 عدة)',
  ],
  mob_hip: [
    '90/90 Hip Transitions (التبديل بين وضع 90/90 - 10 لكل جهة)',
    "World's Greatest Stretch (الطعن العميق مع دوران الجذع - 5 لكل جهة)",
    'Cossack Squats (السكوات الجانبي العميق - 8 لكل جهة)',
    'Hip CARs (رسم دوائر واسعة ومتحكم بها بمفصل الحوض - 5 لكل رجل)',
    'Butterfly Dynamic Pulses (وضع الفراشة مع نبضات خفيفة - 20 عدة)',
  ],
  mob_lback: [
    'Cat-Camel (تمرين القطة والجمل لتحريك الفقرات - 15 عدة)',
    'Pelvic Tilts (إمالة الحوض للأمام والخلف وأنت مستلقي - 15 عدة)',
    'Scorpion Stretch (استلقاء على البطن وتقاطع القدم للمس اليد العكسية - 10 عدات)',
    'Knee-to-Chest Rocks (سحب الركبتين للصدر والتدحرج الخفيف - 15 ثانية)',
    'Lower Trunk Rotations (دوران الركبتين معاً يميناً ويساراً - 10 لكل جهة)',
  ],
  mob_uback: [
    'Open Book / T-Spine Rotations (الاستلقاء الجانبي وفتح الصدر - 10 لكل جهة)',
    'Thread the Needle (إدخال اليد تحت الجذع ولف الظهر العلوي - 10 لكل جهة)',
    'Wall Angels (تمرير الذراعين على الحائط لفتح الصدر - 12 عدة)',
    'Quadruped Thoracic Rotations (وضع القطة ووضع اليد خلف الرأس والدوران - 10 لكل جهة)',
    'Foam Roller Thoracic Extensions (فرد الظهر العلوي على الفوم رولر - 10 نبضات)',
  ],
  mob_shoulder: [
    'Arm Circles (رسم دوائر صغيرة ثم واسعة بالذراعين - 15 لكل اتجاه)',
    'Band Pass-throughs / Dislocates (تمرير الأستيك من الأمام للخلف - 15 عدة)',
    'Scapular Push-ups (ضغط لتحريك لوحي الظهر فقط بدون ثني الكوع - 15 عدة)',
    'Sleeper Stretch (إطالة الدوران الداخلي للكتف - 20 ثانية لكل ذراع)',
    'No-weight Face Pulls & External Rotations (سحب وفتح الكتف للخارج - 15 عدة)',
  ],
};

// ==========================================
// 4. قاعدة بيانات الإصابات والتأهيل
// ==========================================
const REHAB_DATA = [
  { id: 'ankle', title: 'ANKLE INSTABILITY (كاحل)' },
  { id: 'knee', title: 'KNEE / PATELLAR (ركبة)' },
  { id: 'hamstring', title: 'HAMSTRING COMPLEX (خلفية)' },
  { id: 'hip', title: 'HIP FLEXORS / PSOAS (هيب فليكسور)' },
  { id: 'groin', title: 'GROIN STRAIN (ضمة)' },
  { id: 'l_back', title: 'LOWER BACK / LUMBAR (أسفل الظهر)' },
  { id: 'u_back', title: 'UPPER BACK / THORACIC (أعلى الظهر)' },
];

const REHAB_LIBRARY: Record<string, Record<string, string[]>> = {
  ankle: {
    '1': [
      'Heel Raises (رفع الكعب بوزن الجسم - 3 مجموعات × 15)',
      'Single-leg Balance (توازن على رجل واحدة على الأرض - 30 ثانية)',
      'Towel Scrunches (جمع منشفة بأصابع القدم - 3 × 15)',
      'Banded Plantarflexion (دفع مشط القدم لأسفل بأستيك - 3 × 15)',
      'Marble Pickups (التقاط أشياء صغيرة بأصابع القدم - 3 × 15)',
    ],
    '2': [
      'Isometric Inversion (دفع باطن القدم للداخل ضد حائط/مقاومة ثابتة وثبات 10 ثوان)',
      'Isometric Eversion (دفع باطن القدم للخارج ضد مقاومة ثابتة وثبات 10 ثوان)',
      'Isometric Dorsiflexion (رفع مشط القدم لأعلى ضد مقاومة ثابتة وثبات 10 ثوان)',
      'Unstable Surface Balance (توازن على رجل واحدة فوق مخدة - 30 ثانية)',
      'Calf Stretch with Strap (إطالة السمانة ثابتة بحزام - 30 ثانية)',
    ],
  },
  knee: {
    '1': [
      'Shallow Bodyweight Squats (سكوات جزئي لا يتعدى 45 درجة - 3 × 15)',
      'Low Box Step-ups (صعود درجة سلم منخفضة والنزول ببطء - 3 × 12)',
      'Glute Bridges (رفع الحوض لتقوية المحيط بالركبة - 3 × 15)',
      'High Wall Sits (جلوس على الحائط بزاوية مفتوحة - 30 ثانية)',
      'No-weight Hamstring Curls (ثني الركبة للخلف وأنت واقف بدون وزن - 3 × 15)',
    ],
    '2': [
      'Spanish Squats (سكوات ثابت مع سحب أستيك من خلف الركبة - ثبات 30 ثانية)',
      'Isometric Wall Sit at 90° (جلوس على الحائط بزاوية 90 - ثبات 45 ثانية)',
      'Quad Sets Isometric (شد عضلة الفخذ الأمامية مع فرد الركبة للأخير - ثبات 10 ثوان × 10)',
      'Isometric Straight Leg Raise (رفع الرجل مستقيمة والثبات في الهواء - 10 ثوان × 10)',
      'Isometric Hamstring Digs (الاستلقاء والضغط بالكعب بقوة في الأرض - ثبات 10 ثوان)',
    ],
  },
  hamstring: {
    '1': [
      'Broomstick RDLs (رفعة ميتة رومانية بعصا خفيفة جداً لتعليم الحركة - 3 × 15)',
      'Glute Bridges (تمرين الجسر لتقوية الأرداف لتخفيف الحمل عن الخلفية - 3 × 15)',
      'Eccentric Sliders (استلقاء ودفع الكعب للأمام ببطء شديد على الأرض - 3 × 10)',
      'Standing Banded Leg Curls (ثني الركبة للخلف بأستيك مقاومة خفيف - 3 × 15)',
      'Prone Leg Extensions (الاستلقاء على البطن ورفع الرجل مستقيمة لأعلى - 3 × 15)',
    ],
    '2': [
      'Isometric Heel Digs at 90° (الاستلقاء وثني الركبة 90 والضغط بالكعب في الأرض - ثبات 10 ثوان)',
      'Isometric Heel Digs at 45° (نفس التمرين السابق لكن بزاوية ركبة 45 درجة)',
      'Isometric Glute Bridge Hold (الرفع في تمرين الجسر والثبات في الأعلى - 30 ثانية)',
      'Standing Isometric Curl (محاولة ثني الركبة للخلف ضد جسم ثابت/حائط لا يتحرك - 10 ثوان)',
      'Swiss Ball Static Hold (وضع الكعبين على كرة توازن والثبات والبطن مرفوعة - 30 ثانية)',
    ],
  },
  hip: {
    '1': [
      'Slow Standing High Knees (رفع الركبة لمستوى الحوض ببطء شديد - 3 × 15)',
      'Reverse Lunges (طعن خلفي بوزن الجسم بمدى حركي مريح - 3 × 12)',
      'Glute Bridge March (تمرين الجسر مع رفع رجل واحدة بالتبادل - 3 × 20)',
      'Box Step-ups (صعود درجة مع التركيز على انقباض الحوض - 3 × 12)',
      'Hip Hikes (الوقوف على حافة درجة وإنزال/رفع الحوض في الهواء - 3 × 15)',
    ],
    '2': [
      'Isometric Knee Raises (الوقوف ورفع الركبة والضغط عليها باليدين لأسفل مع المقاومة لأعلى - 10 ثوان)',
      'Supine Isometric Hip Flexion (الاستلقاء ومحاولة سحب الركبة للصدر ضد أستيك صلب لا يتحرك)',
      'Side-lying Clamshell Hold (تمرين الصدفة مع الثبات في أعلى نقطة - 10 ثوان × 10)',
      'Isometric Glute Squeeze (عصر الأرداف بقوة وأنت مستلقي أو جالس - 10 ثوان × 10)',
      'Wall Push Isometric (الاستلقاء الجانبي ودفع الرجل العليا ضد حائط ثابت لفتح الحوض - 10 ثوان)',
    ],
  },
  groin: {
    '1': [
      'Short Copenhagen Planks (بلانك كوبنهاجن معدل والارتكاز على الركبة - 20 ثانية)',
      'Banded Adductions (الوقوف وسحب الرجل للداخل باستخدام أستيك - 3 × 15)',
      'Shallow Side Lunges (طعن جانبي بمدى حركي قصير لا يسبب ألم - 3 × 12)',
      'Light Sumo Squats (سكوات مفتوح بوزن الجسم ببطء - 3 × 15)',
      'Slide Board Adductions (استخدام فوطة لزحلقة الرجل للداخل والخارج ببطء - 3 × 10)',
    ],
    '2': [
      'Isometric Ball Squeezes (Bent Knees) (وضع كرة بين الركبتين وعصرها بقوة - ثبات 10 ثوان × 10)',
      'Isometric Ball Squeezes (Straight Legs) (نفس التمرين السابق لكن بأرجل مفرودة تماماً)',
      'Side-lying Adductor Hold (الاستلقاء الجانبي ورفع الرجل السفلى لأعلى والثبات - 10 ثوان)',
      'Supine Isometric Band Hold (الاستلقاء مع ربط الأرجل بأستيك ومقاومة فتحه للداخل - 20 ثانية)',
      'Seated Isometric Squeeze (الجلوس وعصر القبضتين بين الركبتين بقوة - ثبات 10 ثوان)',
    ],
  },
  l_back: {
    '1': [
      'Bird-Dog (تمرين الكلب والطائر مع التركيز على عدم تقويس الظهر - 3 × 10 لكل جهة)',
      'Deadbug (تمرين الحشرة الميتة لتقوية البطن العميقة - 3 × 12 لكل جهة)',
      'Short Front Planks (بلانك أمامي مع شفط البطن - 3 مجموعات × 20 ثانية)',
      'Modified Side Planks (بلانك جانبي بالارتكاز على الركبة - 3 × 20 ثانية)',
      'Glute Bridges (التركيز على الدفع من الأرداف وليس القطنية - 3 × 15)',
    ],
    '2': [
      'McGill Curl-up Isometric (تمرين ماكجيل لثبات الكور - ثبات 10 ثوان × 5 لكل رجل)',
      'Suitcase Hold Isometric (حمل وزن ثقيل بيد واحدة والوقوف مستقيماً بدون ميل - 30 ثانية لكل جهة)',
      'Pallof Press Hold (دفع أستيك للأمام من الجنب والثبات لمنع الدوران - 15 ثانية لكل جهة)',
      'Supine Hollow Body Hold (الاستلقاء ورفع الكتفين والأرجل قليلاً مع لصق القطنية بالأرض - 20 ثانية)',
      'Prone Superman Hold (الاستلقاء على البطن ورفع الصدر والأرجل قليلاً والثبات - 10 ثوان × 5)',
    ],
  },
  u_back: {
    '1': [
      'Banded Face Pulls (سحب أستيك للوجه لتقوية الخلفيات والترابيس الوسطى - 3 × 15)',
      'Light Dumbbell Rows (تجديف فردي بأوزان خفيفة جداً مع التحكم - 3 × 15)',
      'Scapular Push-ups (من وضع البلانك، تحريك الكتفين للأسفل والأعلى - 3 × 15)',
      'Prone Y-Raises (الاستلقاء على البطن ورفع الذراعين على شكل حرف Y - 3 × 12)',
      'Banded Pull-aparts (مسك أستيك وفتحه للخارج لتقوية لوح الكتف - 3 × 15)',
    ],
    '2': [
      'Isometric Scapular Retraction (الوقوف وعصر لوحي الكتف معاً للخلف بقوة - ثبات 10 ثوان × 10)',
      'Isometric Batwing Hold (الاستلقاء على البطن مع أوزان وعصر الكتفين لأعلى وثبات - 10 ثوان)',
      'Isometric Wall Row Hold (الوقوف ودفع الكوعين للخلف ضد الحائط بقوة - ثبات 10 ثوان)',
      'Plank with Scapular Protraction (بلانك مع دفع الأرض بعيداً لفصل لوحي الكتف - ثبات 30 ثانية)',
      'Wall Push Isometric for Serratus (مواجهة الحائط ودفع اليدين بقوة بدون حركة - ثبات 15 ثانية)',
    ],
  },
};

// ==========================================
// 5. المكون الرئيسي (The Lab)
// ==========================================
const Gym = ({ player, setPlayer }: any) => {
  const currentPlayer = player || { name: 'Hunter', physioStatus: {} };
  const physioStatus = currentPlayer.physioStatus || {};

  const [playHover] = useSound('/sounds/hover.mp3', { volume: 0.3 });

  // حالة التحكم في التبويبات الفرعية
  const [currentView, setCurrentView] = useState<'mobility' | 'rehab'>(
    'mobility'
  );

  const [expandedMobility, setExpandedMobility] = useState<string | null>(null);
  const [expandedRehab, setExpandedRehab] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const handleViewChange = (view: 'mobility' | 'rehab') => {
    if (currentView !== view) {
      playPhysioSound('switch');
      setCurrentView(view);
    }
  };

  const handleInputChange = (id: string, value: string) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleSetPhysio = (jointData: any) => {
    const inputValue = inputs[jointData.id];

    if (!inputValue || isNaN(parseInt(inputValue))) {
      playPhysioSound('error');
      toast.error('أدخل رقم Grade صحيح (1، 2، أو 3).', {
        style: {
          background: '#020617',
          border: '1px solid #ef4444',
          color: '#ef4444',
        },
      });
      return;
    }

    const newGrade = parseInt(inputValue);

    if (newGrade < 1 || newGrade > 3) {
      playPhysioSound('error');
      toast.error('الرقم يجب أن يكون 1 أو 2 أو 3 بناءً على مستوى الألم.', {
        style: {
          background: '#020617',
          border: '1px solid #ef4444',
          color: '#ef4444',
        },
      });
      return;
    }

    if (newGrade === 3) {
      playPhysioSound('error');
    } else {
      playPhysioSound('select');
      confetti({
        particleCount: 50,
        spread: 60,
        colors: ['#ef4444', '#ffffff'],
      });
    }

    const updatedPhysio = { ...physioStatus, [jointData.id]: newGrade };

    if (setPlayer) {
      setPlayer({ ...currentPlayer, physioStatus: updatedPhysio });
    }

    if (newGrade !== 3) {
      toast.success(
        `[PROTOCOL LOADED]: ${jointData.title} set to Grade ${newGrade}.`,
        {
          style: {
            background: '#020617',
            border: '1px solid #ef4444',
            color: '#ef4444',
            fontWeight: 'bold',
          },
        }
      );
    }

    setInputs((prev) => ({ ...prev, [jointData.id]: '' }));
  };

  return (
    <Container>
      <Toaster position="top-center" theme="dark" />

      <Header>
        <Title>
          <Activity size={30} color="#00f2ff" />
          KINETIC LAB
        </Title>
        <div
          style={{
            fontSize: '11px',
            color: '#94a3b8',
            textAlign: 'right',
            fontWeight: 'bold',
          }}
        >
          SPORTS MEDICINE
          <br />& PERFORMANCE
        </div>
      </Header>

      {/* مفاتيح التبديل (Sub-Tabs) لتقليل الـ Scroll */}
      <TabContainer>
        <TabButton
          $active={currentView === 'mobility'}
          $color="#00f2ff"
          onClick={() => handleViewChange('mobility')}
          whileTap={{ scale: 0.95 }}
        >
          <Move3d size={18} /> MOBILITY
        </TabButton>
        <TabButton
          $active={currentView === 'rehab'}
          $color="#ef4444"
          onClick={() => handleViewChange('rehab')}
          whileTap={{ scale: 0.95 }}
        >
          <HeartPulse size={18} /> REHAB
        </TabButton>
      </TabContainer>

      <AnimatePresence mode="wait">
        {/* ========================================================= */}
        {/* 1. عرض الموبيليتي */}
        {/* ========================================================= */}
        {currentView === 'mobility' && (
          <motion.div
            key="mobility-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <InfoBox $borderColor="#00f2ff" $bgColor="rgba(0, 242, 255, 0.05)">
              <Info size={20} color="#00f2ff" style={{ flexShrink: 0 }} />
              <div>
                <strong>[دكتور العلاج الطبيعي]:</strong> "الموبيليتي مش تسخين
                عادي، دي عملية تزييت حرفية للمفاصل وإعادة ضبط للجهاز العصبي.
                إهمالها بيعني تيبس الأربطة، تقليل المدى الحركي (ROM)، وانفجار
                الإصابات. مفصل حر = قوة غاشمة!"
              </div>
            </InfoBox>

            {MOBILITY_DATA.map((mob) => {
              const isExpanded = expandedMobility === mob.id;
              const exercises = MOBILITY_EXERCISES[mob.id];

              return (
                <Accordion
                  key={mob.id}
                  $expanded={isExpanded}
                  $themeColor="#00f2ff"
                >
                  <AccordionHeader
                    onClick={() => {
                      playHover();
                      setExpandedMobility(isExpanded ? null : mob.id);
                    }}
                  >
                    <AccordionTitle $color="#00f2ff">
                      <Crosshair size={16} /> {mob.title}
                    </AccordionTitle>
                    <ExpandIcon $expanded={isExpanded}>
                      <ChevronDown size={18} />
                    </ExpandIcon>
                  </AccordionHeader>
                  <AnimatePresence>
                    {isExpanded && (
                      <ContentArea
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <ExerciseList $borderColor="#00f2ff">
                          {exercises.map((ex, idx) => (
                            <ExerciseItem key={idx} $bulletColor="#00f2ff">
                              {ex}
                            </ExerciseItem>
                          ))}
                        </ExerciseList>
                      </ContentArea>
                    )}
                  </AnimatePresence>
                </Accordion>
              );
            })}
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* 2. عرض التأهيل */}
        {/* ========================================================= */}
        {currentView === 'rehab' && (
          <motion.div
            key="rehab-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <InfoBox $borderColor="#10b981" $bgColor="rgba(16, 185, 129, 0.05)">
              <ShieldCheck
                size={20}
                color="#10b981"
                style={{ flexShrink: 0 }}
              />
              <div>
                <strong>PAIN SCALE CLASSIFICATION (مقياس الألم):</strong>
                <br />
                <span style={{ color: '#10b981' }}>🟢 Grade 1:</span> ألم (1-3).
                حماية وتقويات ديناميكية.
                <br />
                <span style={{ color: '#facc15' }}>🟡 Grade 2:</span> ألم (4-7).
                العلاج بتمارين الانقباض الثابت (Isometrics) للحفاظ على العضلة
                دون تهييج المفصل.
                <br />
                <span style={{ color: '#ef4444' }}>🔴 Grade 3:</span> ألم
                (8-10). تمزق شديد. يُمنع التمرين تماماً.
              </div>
            </InfoBox>

            {REHAB_DATA.map((rehabData) => {
              const isExpanded = expandedRehab === rehabData.id;
              const currentGrade = physioStatus[rehabData.id] || 0;
              const exercises =
                REHAB_LIBRARY[rehabData.id]?.[currentGrade.toString()];

              let statusColor = '#64748b';
              if (currentGrade === 1) statusColor = '#10b981';
              if (currentGrade === 2) statusColor = '#facc15';
              if (currentGrade === 3) statusColor = '#ef4444';

              return (
                <Accordion
                  key={rehabData.id}
                  $expanded={isExpanded}
                  $themeColor="#ef4444"
                >
                  <AccordionHeader
                    onClick={() => {
                      playHover();
                      setExpandedRehab(isExpanded ? null : rehabData.id);
                    }}
                  >
                    <AccordionTitle $color={statusColor}>
                      <Medal size={16} /> {rehabData.title}
                    </AccordionTitle>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: statusColor,
                        }}
                      >
                        {currentGrade > 0
                          ? `Grade ${currentGrade}`
                          : 'No Status'}
                      </div>
                      <ExpandIcon $expanded={isExpanded}>
                        <ChevronDown size={18} />
                      </ExpandIcon>
                    </div>
                  </AccordionHeader>

                  <AnimatePresence>
                    {isExpanded && (
                      <ContentArea
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <PhysioInput>
                          <SelectLabel>
                            حدد مستوى الألم (1 أو 2 أو 3):
                          </SelectLabel>
                          <GradeInput
                            type="number"
                            min="1"
                            max="3"
                            placeholder="e.g. 2"
                            value={inputs[rehabData.id] || ''}
                            onChange={(e) =>
                              handleInputChange(rehabData.id, e.target.value)
                            }
                          />
                        </PhysioInput>

                        <UpdatePhysioBtn
                          onClick={() => handleSetPhysio(rehabData)}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Activity size={14} /> ANALYZE PROTOCOL
                        </UpdatePhysioBtn>

                        {/* تمارين Grade 1 أو 2 */}
                        {(currentGrade === 1 || currentGrade === 2) &&
                          exercises && (
                            <div style={{ marginTop: '10px' }}>
                              <SectionTitleInline>
                                <Medal size={10} color={statusColor} /> التقويات
                                العلاجية - Grade {currentGrade}{' '}
                                {currentGrade === 2 ? '(Isometric Focus)' : ''}
                              </SectionTitleInline>
                              <ExerciseList $borderColor={statusColor}>
                                {exercises.map((ex, idx) => (
                                  <ExerciseItem
                                    key={idx}
                                    $bulletColor={statusColor}
                                  >
                                    {ex}
                                  </ExerciseItem>
                                ))}
                              </ExerciseList>
                            </div>
                          )}

                        {/* تحذير Grade 3 */}
                        {currentGrade === 3 && (
                          <WarningBox>
                            <AlertTriangle
                              size={40}
                              color="#ef4444"
                              style={{ marginBottom: '10px' }}
                            />
                            <h3
                              style={{
                                margin: '0 0 10px 0',
                                color: '#ef4444',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                              }}
                            >
                              🚨 إيقاف فوري 🚨
                            </h3>
                            <p
                              style={{
                                margin: '0',
                                fontSize: '13px',
                                color: '#fca5a5',
                                lineHeight: '1.6',
                              }}
                            >
                              ألم من 8 إلى 10 يعني احتمالية وجود تمزق من الدرجة
                              الثالثة.
                              <br />
                              <br />
                              <strong>
                                يُمنع منعاً باتاً أداء أي تمارين تقوية أو
                                إطالات.
                              </strong>
                              <br />
                              <br />
                              بروتوكول العلاج الحالي: راحة (Rest)، ثلج (Ice)،
                              والتوجه للطبيب للفحص السريري وتجنب عاهة مستديمة.
                            </p>
                          </WarningBox>
                        )}
                      </ContentArea>
                    )}
                  </AnimatePresence>
                </Accordion>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default Gym;
