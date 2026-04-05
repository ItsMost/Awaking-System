import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import useSound from 'use-sound';
import {
  BookOpen,
  Moon,
  Zap,
  ShieldAlert,
  ChevronDown,
  Flame,
  Droplet,
  Skull,
  Crosshair,
} from 'lucide-react';

// ==========================================
// 1. المولد الصوتي المدمج
// ==========================================
const playLoreSound = (type: 'open' | 'close') => {
  const AudioContext =
    window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  if (type === 'open') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } else {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
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
  margin-bottom: 25px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
`;

const Title = styled.h1`
  font-size: 24px;
  margin: 0;
  color: #a855f7;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 0 10px rgba(168, 85, 247, 0.4);
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const IntroBox = styled.div`
  background: rgba(168, 85, 247, 0.05);
  border: 1px solid #a855f7;
  color: #d8b4fe;
  padding: 15px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 25px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
`;

const CategoryTitle = styled.div<{ $color: string }>`
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 2px;
  color: ${(props) => props.$color};
  text-transform: uppercase;
  margin: 30px 0 15px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid ${(props) => props.$color}40;
  padding-bottom: 8px;
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

const TextParagraph = styled.div`
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.7;
`;

const Highlight = styled.span<{ $color: string }>`
  color: ${(props) => props.$color};
  font-weight: bold;
`;

const WarningBox = styled.div`
  background: #2a0808;
  border: 1px dashed #ef4444;
  border-radius: 8px;
  padding: 15px;
  margin-top: 5px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const WarningText = styled.div`
  font-size: 12px;
  color: #fca5a5;
  line-height: 1.5;
`;

// ==========================================
// 3. قاعدة بيانات التغذية والطب الرياضي (Professional & Scientific)
// ==========================================
const LORE_CATEGORIES = [
  {
    id: 'cat_nutrition',
    title: 'NUTRITION & FUEL (التغذية)',
    color: '#10b981',
    icon: Droplet,
    items: [
      {
        id: 'protein',
        title: 'The Foundation: Protein (البروتين)',
        icon: ShieldAlert,
        color: '#10b981',
        content: `البروتين هو حجر الأساس للبناء العضلي (Muscle Hypertrophy). أثناء التمرين، أنت تقوم بتمزيق الألياف العضلية مجهرياً. البروتين هو العنصر الذي يعيد بناء هذه الألياف لتصبح أكبر وأقوى. تحتاج من 1.6 إلى 2.2 جرام لكل كيلوجرام من وزنك يومياً لتحقيق الاستشفاء الكامل.`,
        warning: `إذا أهملت البروتين، جسدك سيقوم بهدم عضلاتك الحالية للحصول على الأحماض الأمينية (Catabolic State). النتيجة هي ضعف عام، انخفاض في المستوى، وتعب مستمر دون أي تطور بدني ملحوظ.`,
      },
      {
        id: 'carbs',
        title: 'The Fuel: Carbohydrates (الكاربوهيدرات)',
        icon: Flame,
        color: '#f59e0b',
        content: `الكاربوهيدرات هي مصدر الطاقة الأساسي الذي يحرك جسدك. قبل التمرين (Pre-workout): تملأ مخازن الجليكوجين لتعطيك طاقة لانقباضات عضلية قوية. بعد التمرين (Post-workout): ترفع هرمون الإنسولين ليدفع المغذيات داخل الخلايا العضلية ويسرع عملية الاستشفاء.`,
        warning: `دخول التمرين بدون مخزون كافٍ من الكاربوهيدرات سيؤدي إلى هبوط حاد في مستويات الطاقة، دوخة، وضعف في الأداء مما يمنعك من الوصول للحد الأقصى (PRs).`,
      },
      {
        id: 'breakfast',
        title: 'Metabolic Start: Breakfast (الإفطار)',
        icon: Zap,
        color: '#0ea5e9',
        content: `بعد 8 ساعات من النوم، جسدك يحتاج إلى الغذاء. الإفطار يوقف عملية الهدم العضلي، ينشط عملية الأيض (Metabolism)، ويجهز جهازك العصبي ذهنياً وبدنياً لباقي اليوم.`,
        warning: `تخطي الإفطار يرفع هرمون الكورتيزول (هرمون التوتر) لأعلى مستوياته. هذا الهرمون يقلل من كفاءة حرق الدهون ويزيد من احتمالية تكسير البروتين العضلي كمصدر سريع للطاقة.`,
      },
    ],
  },
  {
    id: 'cat_supplements',
    title: 'SPORTS SUPPLEMENTS (المكملات الرياضية)',
    color: '#a855f7',
    icon: BookOpen,
    items: [
      {
        id: 'creatine',
        title: 'Power Output: Creatine (الكرياتين)',
        icon: Zap,
        color: '#a855f7',
        content: `الكرياتين هو المكمل الرياضي الأكثر دراسة علمياً. يعمل على زيادة مخازن الـ ATP (عملة الطاقة الخلوية). النتيجة؟ يمنحك طاقة إضافية لرفع عدة إضافية أو وزن أثقل. كما يزيد من ترطيب الخلية العضلية (Intracellular Hydration) لتتعافى أسرع. (الجرعة الموصى بها: 5 جرام يومياً).`,
        warning: `إهمال شرب الماء (3-4 لتر يومياً) أثناء تناول الكرياتين قد يسبب إجهاداً للكلى وجفافاً يؤدي إلى تقلصات عضلية (Cramps).`,
      },
      {
        id: 'whey',
        title: 'Rapid Recovery: Whey Protein (الواي بروتين)',
        icon: Droplet,
        color: '#38bdf8',
        content: `أسرع وأنقى مصدر للبروتين عالي الامتصاص. يمتص في الجسم خلال 30 دقيقة فقط. ممتاز بعد التمرين مباشرة لبدء عملية الاستشفاء العضلي (Muscle Protein Synthesis)، أو كوجبة سريعة لسد احتياجك اليومي من البروتين.`,
        warning: `الواي بروتين "مكمل غذائي" وليس بديلاً عن الطعام الحقيقي. الاعتماد عليه كلياً وإهمال اللحوم والبيض سيفقدك الفيتامينات والمعادن الضرورية للأداء الرياضي.`,
      },
    ],
  },
  {
    id: 'cat_recovery',
    title: 'RECOVERY & RESTORE (الاستشفاء والنوم)',
    color: '#3b82f6',
    icon: Moon,
    items: [
      {
        id: 'sleep',
        title: 'System Recovery: Sleep (النوم)',
        icon: Moon,
        color: '#3b82f6',
        content: `العضلات تُهدم في التدريب، وتُبنى أثناء النوم. الحصول على 7 إلى 9 ساعات من النوم هو الوقت الوحيد الذي يفرز فيه جسدك هرمون النمو (HGH) وهرمون التستوستيرون بأعلى مستوياته. هو عملية تعافي كاملة للجهاز العصبي المركزي (CNS).`,
        warning: `النوم لأقل من 6 ساعات يدمر تطورك البدني. يضعف الجهاز العصبي (فتنخفض أوزانك)، يبطئ حرق الدهون، ويزيد احتمالية الإصابات بنسبة 70% بسبب إرهاق الجهاز العصبي (CNS Fatigue).`,
      },
    ],
  },
];

// ==========================================
// 4. المكون الرئيسي (Info -> Codex)
// ==========================================
const Info = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [playHover] = useSound('/sounds/hover.mp3', { volume: 0.3 });

  const toggleAccordion = (id: string) => {
    if (expandedId === id) {
      playLoreSound('close');
      setExpandedId(null);
    } else {
      playLoreSound('open');
      setExpandedId(id);
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <BookOpen size={30} color="#a855f7" />
          THE CODEX
        </Title>
        <div
          style={{
            fontSize: '11px',
            color: '#94a3b8',
            textAlign: 'right',
            fontWeight: 'bold',
          }}
        >
          SPORTS SCIENCE
          <br />& NUTRITION
        </div>
      </Header>

      <IntroBox>
        <BookOpen size={20} color="#a855f7" style={{ flexShrink: 0 }} />
        <div>
          <strong>[خبير التغذية الرياضية]:</strong> "المعرفة هي أساس التطور
          الرياضي. لا يمكنك كسر أرقامك القياسية والوصول لأقصى أداء بدني إذا كنت
          لا تعرف كيف تغذي جسدك، كيف تستخدم المكملات بذكاء، أو متى يجب أن ترتاح.
          اقرأ هذه القواعد العلمية جيداً، فإهمالها سيكلفك خسارة مجهودك."
        </div>
      </IntroBox>

      {LORE_CATEGORIES.map((category) => (
        <div key={category.id}>
          <CategoryTitle $color={category.color}>
            <category.icon size={18} /> {category.title}
          </CategoryTitle>

          {category.items.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <Accordion
                key={item.id}
                $expanded={isExpanded}
                $themeColor={item.color}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AccordionHeader
                  onClick={() => {
                    playHover();
                    toggleAccordion(item.id);
                  }}
                >
                  <AccordionTitle $color={item.color}>
                    <item.icon size={18} /> {item.title}
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
                      <TextParagraph>{item.content}</TextParagraph>

                      {item.warning && (
                        <WarningBox>
                          <Skull
                            size={18}
                            color="#ef4444"
                            style={{ flexShrink: 0, marginTop: '2px' }}
                          />
                          <WarningText>
                            <Highlight $color="#ef4444">
                              تحذير طبي (HEALTH RISK):{' '}
                            </Highlight>
                            {item.warning}
                          </WarningText>
                        </WarningBox>
                      )}
                    </ContentArea>
                  )}
                </AnimatePresence>
              </Accordion>
            );
          })}
        </div>
      ))}
    </Container>
  );
};

export default Info;
