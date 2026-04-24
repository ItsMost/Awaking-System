import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Shield, Heart, Zap, Flame,
  Gamepad2, AlertTriangle, ChevronDown, ChevronUp, Star,
  Target, Droplet, Medal, Crown, Lock, Activity, Clock,
  Gem, Ghost, Stethoscope, Trophy, Fingerprint, Crosshair
} from 'lucide-react';

// ==========================================
// التصميمات المفرودة (Styled Components)
// ==========================================
const Container = styled(motion.div)`
  padding: 15px;
  font-family: 'Oxanium', sans-serif;
  color: #fff;
  padding-bottom: 100px;
  max-width: 700px;
  margin: 0 auto;
  direction: rtl; 
`;

const Header = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: radial-gradient(circle at top, rgba(99, 102, 241, 0.15) 0%, rgba(2, 6, 23, 1) 100%);
  border: 1px solid #6366f1;
  padding: 30px 20px;
  border-radius: 20px;
  margin-bottom: 30px;
  box-shadow: 0 10px 40px rgba(99, 102, 241, 0.1);
  text-align: center;
`;

const Title = styled.h1`
  font-size: 24px;
  margin: 15px 0 5px 0;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 900;
  text-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
`;

const Subtitle = styled.div`
  font-size: 12px;
  color: #818cf8;
  font-weight: bold;
  letter-spacing: 1px;
`;

const RuleCard = styled(motion.div)<{ $color: string, $isOpen: boolean }>`
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid ${(props) => props.$isOpen ? props.$color : '#1e293b'};
  border-radius: 16px;
  margin-bottom: 15px;
  overflow: hidden;
  transition: 0.3s;
  box-shadow: ${(props) => props.$isOpen ? `0 0 20px ${props.$color}20` : 'none'};

  &:hover {
    border-color: ${(props) => props.$color}80;
  }
`;

const RuleHeader = styled.div<{ $color: string }>`
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background: linear-gradient(90deg, ${(props) => props.$color}10 0%, transparent 100%);
`;

const RuleTitle = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 15px;
  font-weight: 900;
  color: ${(props) => props.$color};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const RuleContent = styled(motion.div)`
  padding: 0 20px 20px 20px;
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.8;
  text-align: right;
`;

const Highlight = styled.span<{ $color: string }>`
  color: ${(props) => props.$color};
  font-weight: 900;
`;

const GridBox = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 15px;
`;

const RankItem = styled.div<{ $color: string }>`
  background: #020617;
  border: 1px solid ${(props) => props.$color}40;
  padding: 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  text-align: center;
  box-shadow: inset 0 0 10px ${(props) => props.$color}10;
  
  .rank-name {
    color: ${(props) => props.$color};
    font-weight: 900;
    font-size: 14px;
    letter-spacing: 1px;
  }
  
  .rank-desc {
    color: #94a3b8;
    font-size: 10px;
  }
  
  .rank-tax {
    color: #ef4444;
    font-size: 11px;
    font-weight: bold;
    margin-top: 5px;
    background: #2a0808;
    padding: 3px 8px;
    border-radius: 6px;
    border: 1px solid #ef4444;
  }
`;

const InfoPill = styled.div<{ $color: string }>`
  background: ${(props) => props.$color}15;
  border-left: 3px solid ${(props) => props.$color};
  padding: 10px 15px;
  border-radius: 0 8px 8px 0;
  margin-bottom: 10px;
  font-size: 12px;
  color: #fff;
`;

// ==========================================
// بيانات الدستور (Manifesto Data) الشاملة والصحيحة
// ==========================================
const RULES_DATA = [
  {
    id: 1,
    title: 'ساعة الصفر والانضباط (Zero Hour)',
    icon: Clock,
    color: '#34d399',
    content: (
      <>
        النخبة لا تبحث عن الأعذار. الوقت هنا مقدس والمماطلة لها ثمن.
        <br/><br/>
        <InfoPill $color="#ef4444">
          <strong>ساعة الصفر:</strong> اليوم ينتهي تماماً في <strong>12:00 منتصف الليل</strong>. لا توجد أي فترات سماح لليوم التالي. إذا لم يتم توثيق مهامك قبل هذه اللحظة، سيتم إغلاق النظام (System Locked) بأثر رجعي ولن يمكنك تعديل أي شيء.
        </InfoPill>
        <InfoPill $color="#facc15">
          <strong>قاعدة الستريك (Streak):</strong> الـ Streak يعكس أيام التزامك المتتالية. لا يرتفع العداد إلا بإتمام <strong>3 مهام أساسية</strong> يومياً (التمرين، تغطية البروتين، والمرونة).
        </InfoPill>
        <InfoPill $color="#38bdf8">
          <strong>كسر السلسلة:</strong> تفويت مهمة أساسية واحدة يؤدي إلى تصفير الـ Streak فوراً، وتُطبق عليك "ضريبة الرانك" الموضحة في القسم التالي.
        </InfoPill>
      </>
    )
  },
  {
    id: 2,
    title: 'الرانكات والضريبة (Rank & Tax)',
    icon: Crown,
    color: '#eab308',
    content: (
      <>
        كل 5 مستويات ترتقي إلى رانك جديد. القمة لا ترحم، وكلما زادت هيبتك، زادت <Highlight $color="#ef4444">"ضريبة التكاسل (Rank Tax)"</Highlight> التي يتم خصمها من نقاط حياتك (HP) وذهبك إذا كُسر الستريك.
        <GridBox>
          <RankItem $color="#b45309"><Medal size={20} color="#b45309" /> <span className="rank-name">BRONZE</span> <span className="rank-desc">المستويات 1 - 4</span> <span className="rank-tax">-10 HP | -50 G</span></RankItem>
          <RankItem $color="#94a3b8"><Medal size={20} color="#94a3b8" /> <span className="rank-name">SILVER</span> <span className="rank-desc">المستويات 5 - 9</span> <span className="rank-tax">-15 HP | -75 G</span></RankItem>
          <RankItem $color="#eab308"><Medal size={20} color="#eab308" /> <span className="rank-name">GOLD</span> <span className="rank-desc">المستويات 10 - 14</span> <span className="rank-tax">-20 HP | -100 G</span></RankItem>
          <RankItem $color="#06b6d4"><Target size={20} color="#06b6d4" /> <span className="rank-name">PLATINUM</span> <span className="rank-desc">المستويات 15 - 19</span> <span className="rank-tax">-25 HP | -125 G</span></RankItem>
          <RankItem $color="#3b82f6"><Shield size={20} color="#3b82f6" /> <span className="rank-name">DIAMOND</span> <span className="rank-desc">المستويات 20 - 24</span> <span className="rank-tax">-30 HP | -150 G</span></RankItem>
          <RankItem $color="#ef4444"><Flame size={20} color="#ef4444" /> <span className="rank-name">MASTER</span> <span className="rank-desc">المستويات 25 - 29</span> <span className="rank-tax">-40 HP | -200 G</span></RankItem>
          <RankItem $color="#a855f7"><Crown size={20} color="#a855f7" /> <span className="rank-name">ELITE</span> <span className="rank-desc">المستوى 30+</span> <span className="rank-tax">-50 HP | -250 G</span></RankItem>
        </GridBox>
        <br/>
        <InfoPill $color="#00f2ff">
          <strong>الوصول لمستوى 20 (Diamond):</strong> يفتح لك ميزة <strong>Evolution</strong> (تطور الكلاس) في البروفايل، حيث يتغير شكل الأيقونة الخاصة بك لنسخة أكثر فخامة!
        </InfoPill>
      </>
    )
  },
  {
    id: 3,
    title: 'اقتصاد اللعبة (EXP & Gold)',
    icon: Activity,
    color: '#0ea5e9',
    content: (
      <>
        صعود السلم يتطلب مجهوداً مضاعفاً كلما اقتربت من القمة.
        <br/><br/>
        <InfoPill $color="#0ea5e9">
          <strong>نظام الـ EXP:</strong> اليوم المثالي يمنحك <strong>215 EXP</strong>. في البداية (من ليفل 1 لـ 2) ستحتاج 650 EXP فقط، لكن الصعوبة تتصاعد تدريجياً حتى تصل إلى <strong>4,000 EXP</strong> للارتقاء لمستوى واحد في المراحل المتقدمة.
        </InfoPill>
        <InfoPill $color="#eab308">
          <strong>مكافآت الترقية:</strong> عند الصعود لمستوى جديد تحصل على <Highlight $color="#eab308">100 Gold</Highlight>. إذا كان المستوى الجديد يمنحك رانكاً جديداً (مثل مستوى 5، 10، 15..)، تتضاعف الجائزة إلى <Highlight $color="#eab308">200 Gold</Highlight>.
        </InfoPill>
      </>
    )
  },
  {
    id: 4,
    title: 'عجلة الحظ والعتاد (The Void)',
    icon: Gem,
    color: '#a855f7',
    content: (
      <>
        مكانك لإنفاق الذهب المكتسب! ادفع <Highlight $color="#eab308">1000 Gold</Highlight> لفتح صندوق الـ Void واحصل على غنائم عشوائية بناءً على نظام الاحتمالات (RNG).
        <br/><br/>
        <ul style={{ listStyleType: 'circle' }}>
          <li><Highlight $color="#94a3b8">Common (48%):</Highlight> عتاد أساسي أو أكياس ذهب فورية (+200G).</li>
          <li><Highlight $color="#38bdf8">Rare (30%):</Highlight> عتاد يوفر بونص جيد للذهب ونقاط الحياة.</li>
          <li><Highlight $color="#facc15">Epic (18%):</Highlight> عتاد متقدم وأختام تفتح ألقاباً حصرية بجوار اسمك (مثل Emperor).</li>
          <li><Highlight $color="#ec4899">Mythic (4%):</Highlight> نوادر السيرفر! عباءة الفانتوم (تسترجع 100% من دمك عند الترقية) وبيضة التنين التي تفتح روحاً سحرية فريدة.</li>
        </ul>
        <InfoPill $color="#ef4444">
          <strong>تنبيه الصلاحية (Durability):</strong> الأسلحة والدروع في الـ Armory <strong>مؤقتة</strong> (تستمر لـ 3 أيام، 5 أيام، أسبوع، أو 14 يوم). بعد انتهاء الوقت، تتدمر القطعة وتختفي من مخزنك تلقائياً لضمان عدم وجود لاعب Overpowered بشكل دائم!
        </InfoPill>
      </>
    )
  },
  {
    id: 5,
    title: 'متتبع التغذية (Nutrition Tracker)',
    icon: Flame,
    color: '#f97316',
    content: (
      <>
        العضلات تُبنى في المطبخ قبل الجيم.
        <br/><br/>
        <InfoPill $color="#f97316">
          <strong>هدف البروتين:</strong> النظام يقرأ وزنك من البروفايل ويضع لك تارجت ذكي للبروتين (بين 1.7 جم إلى 2.2 جم لكل كيلو).
        </InfoPill>
        <InfoPill $color="#10b981">
          <strong>قفل المهمة:</strong> مهمة <code>Nutritional Compliance</code> في الشاشة الرئيسية ستظل مغلقة ولن تمنحك أي نقاط حتى تملأ عداد البروتين في متتبع التغذية ويتحول للون الأخضر.
        </InfoPill>
        يمكنك إضافة الأطعمة من قاعدة البيانات المُدمجة، أو إضافة وجباتك الخاصة يدوياً، وسيقوم النظام بحفظها باسم <code>[وجبتي]</code> لتجدها جاهزة في الأيام القادمة.
      </>
    )
  },
  {
    id: 6,
    title: 'العيادة وإدارة الإصابات (Rehab Clinic)',
    icon: Stethoscope,
    color: '#ef4444',
    content: (
      <>
        الإصابة ليست عذراً للتوقف، بل فرصة للتعافي بذكاء.
        <br/><br/>
        <ul style={{ listStyleType: 'circle' }}>
          <li>استخدم مجسم الـ 3D في العيادة لتحديد مكان الألم وشدته. سيعطيك النظام بروتوكول علاج فوري (إطالات، ثلج، راحة).</li>
          <li>إذا أبلغت المدرب (Coach) بالإصابة وتم الموافقة عليها، ستتحول حالتك إلى <Highlight $color="#ef4444">Injured</Highlight>.</li>
          <li>تلقائياً، ستتغير مهام الـ Dashboard الخاصة بك من تمارين شاقة إلى <strong>مهام علاج طبيعي (Rehab)</strong>، لتتمكن من الحفاظ على الـ Streak وجمع الـ EXP أثناء فترة التعافي!</li>
        </ul>
      </>
    )
  },
  {
    id: 7,
    title: 'المواسم التنافسية (Seasons & Leaderboard)',
    icon: Trophy,
    color: '#0ea5e9',
    content: (
      <>
        المجد الحقيقي يكتب في نهاية الشهر.
        <br/><br/>
        <InfoPill $color="#0ea5e9">
          <strong>بطولة الشهر:</strong> يوجد تصنيف عام يعتمد على خبرتك الكلية (Cumulative XP)، وتصنيف شهري يعتمد على الـ (Monthly XP).
        </InfoPill>
        <InfoPill $color="#eab308">
          <strong>نهاية الموسم (Season Wipe):</strong> في نهاية الشهر، يُتوج الكوتش أبطال الموسم (الأول على الرجال والأولى على الفتيات). سيظهر تاج 👑 دائم بجوار أسمائهم. ثم يتم <strong>تصفير نقاط الشهر</strong> للجميع ليبدأ السباق من جديد، بينما يظل التراكمي ثابتاً لحفظ مستواك الكلي!
        </InfoPill>
      </>
    )
  },
  {
    id: 8,
    title: 'الأرواح السحرية (Mystical Pets)',
    icon: Ghost,
    color: '#10b981',
    content: (
      <>
        في البروفايل الخاص بك، ستجد "الملاذ السحري" حيث يمكنك استدعاء الأرواح المرافقة التي تطفو بجوار اسمك في لوحة الشرف (Leaderboard).
        <br/><br/>
        <ul style={{ listStyleType: 'circle' }}>
          <li><strong>الطاقة (Energy):</strong> الأرواح حية وتستهلك الطاقة (Hunger). إذا وصلت طاقتها لـ 0%، ستتحول للون الرمادي (تموت مؤقتاً).</li>
          <li><strong>الإنعاش:</strong> يجب إطعام روحك باستخدام <Highlight $color="#eab308">500 Gold</Highlight> لاسترجاع طاقتها.</li>
          <li><strong>التحرير (Release):</strong> يمكنك تجهيز الأرواح أو إزالتها نهائياً لتوفير مساحة لروح أقوى أو نادرة حصلت عليها من صندوق الـ Void.</li>
        </ul>
      </>
    )
  },
  {
    id: 9,
    title: 'صالة الألعاب العصبية (Elite Arcade)',
    icon: Gamepad2,
    color: '#a855f7',
    content: (
      <>
        اضغط على أيقونة الـ Gamepad 🎮 العائمة لفتح صالة الألعاب المصغرة لاختبار جهازك العصبي:
        <br/><br/>
        <ul style={{ listStyleType: 'circle' }}>
          <li><strong>Reflex Arena (معدل الاستجابة):</strong> لا نعتمد على ضربة حظ! يجب اجتياز <Highlight $color="#a855f7">4 محاولات متتالية</Highlight>، وسيقوم النظام بحساب متوسط الزمن (Average Time) لضمان ثبات تركيزك قبل تسجيله.</li>
          <li><strong>Finger Sprint:</strong> اختبر سرعة الانقباض العصبي بالنقر بأقصى سرعة ممكنة خلال 10 ثوانٍ.</li>
        </ul>
      </>
    )
  },
  {
    id: 10,
    title: 'ميثاق الشرف (Honor Code)',
    icon: Shield,
    color: '#ef4444',
    content: (
      <>
        <strong>"مَنْ غَشَّنَا فَلَيْسَ مِنَّا"</strong>
        <br/><br/>
        الضغط على المهام التي لا تتطلب صورة (مثل شرب المياه أو النوم) يُظهر <Highlight $color="#ef4444">النافذة الحمراء للقسم</Highlight>. الغش في تسجيل المهام يُفقدك احترامك لنفسك قبل أن يكشفك النظام.
        <br/><br/>
        يمتلك الكوتش <strong>Master Override</strong> يسمح له بإلغاء مهامك المكتملة وسحب نقاطك وذهبك إذا ثبت تلاعبك. وإذا تكرر الأمر، سيتم تفعيل `Disciplinary Quest` (عقوبة تأديبية) توقف تقدمك كلياً حتى تنفذها حرفياً.
      </>
    )
  }
];

// ==========================================
// المكون الرئيسي (Rules)
// ==========================================
const Rules = () => {
  const [openId, setOpenId] = useState<number | null>(1);

  const playClickSound = () => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext(); 
    const osc = ctx.createOscillator(); 
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    
    osc.type = 'sine'; 
    osc.frequency.setValueAtTime(600, ctx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime); 
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(); osc.stop(ctx.currentTime + 0.1);
  };

  const toggleAccordion = (id: number) => {
    playClickSound();
    setOpenId(openId === id ? null : id);
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Header>
        <BookOpen size={40} color="#818cf8" style={{ filter: 'drop-shadow(0 0 10px rgba(129, 140, 248, 0.5))' }} />
        <Title>THE AWAKING MANIFESTO</Title>
        <Subtitle>دستور النخبة وقوانين السيرفر</Subtitle>
      </Header>

      {RULES_DATA.map((rule) => {
        const isOpen = openId === rule.id;
        const Icon = rule.icon;

        return (
          <RuleCard key={rule.id} $color={rule.color} $isOpen={isOpen}>
            <RuleHeader $color={rule.color} onClick={() => toggleAccordion(rule.id)}>
              <RuleTitle $color={rule.color}>
                <Icon size={20} />
                {rule.title}
              </RuleTitle>
              {isOpen ? <ChevronUp size={20} color={rule.color} /> : <ChevronDown size={20} color={rule.color} />}
            </RuleHeader>

            <AnimatePresence>
              {isOpen && (
                <RuleContent
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={{ paddingTop: '15px' }}>
                    {rule.content}
                  </div>
                </RuleContent>
              )}
            </AnimatePresence>
          </RuleCard>
        );
      })}

      <div style={{ textAlign: 'center', marginTop: '40px', opacity: 0.5 }}>
        <Star size={30} color="#eab308" />
        <div style={{ fontSize: '11px', marginTop: '10px', letterSpacing: '2px', fontWeight: 'bold', direction: 'ltr' }}>
          STAY ELITE. STAY DISCIPLINED.
        </div>
      </div>

    </Container>
  );
};

export default Rules;