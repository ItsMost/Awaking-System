import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  BookOpen, Shield, Flame,
  Gamepad2, Star,
  Target, Medal, Crown, Activity, Clock,
  Ghost, Stethoscope, Trophy
} from 'lucide-react';

// ==========================================
// التصميمات الفخمة (Styled Components)
// ==========================================
const Container = styled(motion.div)`
  padding: 20px;
  font-family: 'Exo 2', sans-serif;
  color: #fff;
  padding-bottom: 100px;
  max-width: 1000px;
  margin: 0 auto;
  direction: rtl;
`;

const Header = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: radial-gradient(circle at top, rgba(99, 102, 241, 0.15) 0%, rgba(2, 6, 23, 0.8) 100%);
  border: 1px solid rgba(99, 102, 241, 0.3);
  backdrop-filter: blur(12px);
  padding: 35px 20px;
  border-radius: 24px;
  margin-bottom: 35px;
  box-shadow: 0 10px 45px rgba(99, 102, 241, 0.1), inset 0 0 20px rgba(99, 102, 241, 0.05);
  text-align: center;
`;

const Title = styled.h1`
  font-size: 26px;
  margin: 15px 0 5px 0;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 900;
  text-shadow: 0 0 20px rgba(99, 102, 241, 0.6);
`;

const Subtitle = styled.div`
  font-size: 13px;
  color: #818cf8;
  font-weight: bold;
  letter-spacing: 1px;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 25px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const RuleCard = styled(motion.div)<{ $color: string }>`
  background: rgba(29, 15, 58, 0.45);
  backdrop-filter: blur(16px);
  border: 1px solid ${(props) => props.$color}30;
  border-radius: 20px;
  overflow: hidden;
  padding: 24px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2), inset 0 0 15px ${(props) => props.$color}05;
  display: flex;
  flex-direction: column;
  gap: 15px;

  &:hover {
    border-color: ${(props) => props.$color}70;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3), 0 0 25px ${(props) => props.$color}15, inset 0 0 15px ${(props) => props.$color}10;
    transform: translateY(-4px);
  }
`;

const CardHeader = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 12px;
`;

const IconWrapper = styled.div<{ $color: string }>`
  background: ${(props) => props.$color}15;
  color: ${(props) => props.$color};
  padding: 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${(props) => props.$color}30;
  box-shadow: 0 0 15px ${(props) => props.$color}15;
`;

const CardTitle = styled.h2`
  font-size: 17px;
  font-weight: 900;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
`;

const CardBody = styled.div`
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.8;
  text-align: right;
  flex-grow: 1;
`;

const Highlight = styled.span<{ $color: string }>`
  color: ${(props) => props.$color};
  font-weight: 900;
`;

const GridBox = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 8px;
  margin-top: 15px;
`;

const RankItem = styled.div<{ $color: string }>`
  background: #07030f;
  border: 1px solid ${(props) => props.$color}40;
  padding: 10px;
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
    font-size: 13px;
    letter-spacing: 1px;
  }
  
  .rank-desc {
    color: #94a3b8;
    font-size: 9px;
  }
  
  .rank-tax {
    color: #ef4444;
    font-size: 10px;
    font-weight: bold;
    margin-top: 5px;
    background: #2a0808;
    padding: 3px 6px;
    border-radius: 6px;
    border: 1px solid #ef444440;
  }
`;

const InfoPill = styled.div<{ $color: string }>`
  background: ${(props) => props.$color}15;
  border-left: 3px solid ${(props) => props.$color};
  padding: 8px 12px;
  border-radius: 0 8px 8px 0;
  margin-bottom: 8px;
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
          <strong>ساعة الصفر:</strong> ينتهي اليوم تماماً في <strong>12:00 منتصف الليل</strong>. لا توجد فترات سماح. إذا لم توثق مهامك، سيغلق النظام (System Locked) بأثر رجعي.
        </InfoPill>
        <InfoPill $color="#facc15">
          <strong>قاعدة الستريك (Streak):</strong> لا يرتفع العداد إلا بإتمام <strong>3 مهام أساسية</strong> يومياً (التمرين، تغطية البروتين، والمرونة).
        </InfoPill>
        <InfoPill $color="#c084fc">
          <strong>كسر السلسلة:</strong> تفويت مهمة أساسية واحدة يؤدي إلى تصفير الـ Streak فوراً، وتُطبق عليك "ضريبة الرانك".
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
        كل 5 مستويات ترتقي لرتبة جديدة. القمة لا ترحم، وكلما زادت هيبتك، زادت <Highlight $color="#ef4444">"ضريبة التكاسل (Rank Tax)"</Highlight> المخصومة من نقاط حياتك (HP) وذهبك إذا كُسر الستريك.
        <GridBox>
          <RankItem $color="#b45309"><Medal size={16} color="#b45309" /> <span className="rank-name">BRONZE</span> <span className="rank-desc">المستويات 1-4</span> <span className="rank-tax">-10 HP | -50 G</span></RankItem>
          <RankItem $color="#94a3b8"><Medal size={16} color="#94a3b8" /> <span className="rank-name">SILVER</span> <span className="rank-desc">المستويات 5-9</span> <span className="rank-tax">-15 HP | -75 G</span></RankItem>
          <RankItem $color="#eab308"><Medal size={16} color="#eab308" /> <span className="rank-name">GOLD</span> <span className="rank-desc">المستويات 10-14</span> <span className="rank-tax">-20 HP | -100 G</span></RankItem>
          <RankItem $color="#06b6d4"><Target size={16} color="#06b6d4" /> <span className="rank-name">PLATINUM</span> <span className="rank-desc">المستويات 15-19</span> <span className="rank-tax">-25 HP | -125 G</span></RankItem>
          <RankItem $color="#3b82f6"><Shield size={16} color="#3b82f6" /> <span className="rank-name">DIAMOND</span> <span className="rank-desc">المستويات 20-24</span> <span className="rank-tax">-30 HP | -150 G</span></RankItem>
          <RankItem $color="#ef4444"><Flame size={16} color="#ef4444" /> <span className="rank-name">MASTER</span> <span className="rank-desc">المستويات 25-29</span> <span className="rank-tax">-40 HP | -200 G</span></RankItem>
          <RankItem $color="#a855f7"><Crown size={16} color="#a855f7" /> <span className="rank-name">ELITE</span> <span className="rank-desc">المستوى 30+</span> <span className="rank-tax">-50 HP | -250 G</span></RankItem>
        </GridBox>
        <br/>
        <InfoPill $color="#d946ef">
          <strong>مستوى 20 (Diamond):</strong> يفتح ميزة <strong>Evolution</strong> في البروفايل، حيث يتغير شكل الأيقونة لنسخة أكثر فخامة!
        </InfoPill>
      </>
    )
  },
  {
    id: 3,
    title: 'اقتصاد اللعبة (EXP & Gold)',
    icon: Activity,
    color: '#a855f7',
    content: (
      <>
        صعود السلم يتطلب مجهوداً مضاعفاً كلما اقتربت من القمة.
        <br/><br/>
        <InfoPill $color="#a855f7">
          <strong>نظام الـ EXP:</strong> اليوم المثالي يمنحك <strong>215 EXP</strong>. في البداية (من ليفل 1 لـ 2) تحتاج 650 EXP، ويتصاعد تدريجياً حتى يصل إلى <strong>4,000 EXP</strong> للارتقاء لمستوى واحد في المراحل المتقدمة.
        </InfoPill>
        <InfoPill $color="#eab308">
          <strong>مكافآت الترقية:</strong> عند الصعود لمستوى جديد تحصل على <Highlight $color="#eab308">100 Gold</Highlight>. وإذا كان المستوى الجديد يمنحك رتبة جديدة (مثل مستوى 5، 10، 15..)، تتضاعف الجائزة إلى <Highlight $color="#eab308">200 Gold</Highlight>.
        </InfoPill>
      </>
    )
  },
  {
    id: 4,
    title: 'متتبع التغذية (Nutrition Tracker)',
    icon: Flame,
    color: '#f97316',
    content: (
      <>
        العضلات تُبنى في المطبخ قبل الجيم.
        <br/><br/>
        <InfoPill $color="#f97316">
          <strong>هدف البروتين:</strong> يقرأ النظام وزنك من البروفايل ويضع لك تارجت ذكي للبروتين (بين 1.7 جم إلى 2.2 جم لكل كيلو).
        </InfoPill>
        <InfoPill $color="#10b981">
          <strong>قفل المهمة:</strong> مهمة <code>Nutritional Compliance</code> في الشاشة الرئيسية تظل مغلقة ولن تمنحك أي نقاط حتى تملأ عداد البروتين في متتبع التغذية ويتحول للون الأخضر.
        </InfoPill>
        يمكنك إضافة الأطعمة من قاعدة البيانات المُدمجة أو إضافة وجباتك الخاصة يدوياً.
      </>
    )
  },
  {
    id: 5,
    title: 'العيادة وإدارة الإصابات (Rehab Clinic)',
    icon: Stethoscope,
    color: '#ef4444',
    content: (
      <>
        الإصابة ليست عذراً للتوقف، بل فرصة للتعافي بذكاء وبطرق علمية مدروسة.
        <br/><br/>
        <ul style={{ listStyleType: 'circle', paddingRight: '20px' }}>
          <li>استخدم مجسم الـ 3D في العيادة لتحديد مكان الألم وشدته. سيعطيك النظام بروتوكول علاج فوري.</li>
          <li>إذا أبلغت المدرب بالإصابة وتم الموافقة عليها، ستتحول حالتك إلى <Highlight $color="#ef4444">Injured</Highlight>.</li>
          <li>تلقائياً، ستتغير مهامك اليومية من تمارين شاقة إلى <strong>مهام علاج طبيعي (Rehab)</strong>، لتتمكن من الحفاظ على الـ Streak وجمع الـ EXP أثناء فترة التعافي!</li>
        </ul>
      </>
    )
  },
  {
    id: 6,
    title: 'المواسم التنافسية (Seasons & Leaderboard)',
    icon: Trophy,
    color: '#a855f7',
    content: (
      <>
        المجد الحقيقي يكتب في نهاية الشهر.
        <br/><br/>
        <InfoPill $color="#a855f7">
          <strong>بطولة الشهر:</strong> يوجد تصنيف عام يعتمد على خبرتك الكلية (Cumulative XP)، وتصنيف شهري يعتمد على الـ (Monthly XP).
        </InfoPill>
        <InfoPill $color="#eab308">
          <strong>نهاية الموسم (Season Wipe):</strong> في نهاية الشهر، يُتوج الكوتش أبطال الموسم (تاج 👑 دائم بجوار أسمائهم). يتم <strong>تصفير نقاط الشهر</strong> للجميع ليبدأ السباق من جديد، بينما يظل التراكمي ثابتاً لحفظ مستواك الكلي!
        </InfoPill>
      </>
    )
  },
  {
    id: 7,
    title: 'الأرواح السحرية (Mystical Pets)',
    icon: Ghost,
    color: '#10b981',
    content: (
      <>
        في البروفايل الخاص بك، ستجد "الملاذ السحري" حيث يمكنك استدعاء الأرواح المرافقة التي تطفو بجوار اسمك في لوحة الشرف (Leaderboard).
        <br/><br/>
        <ul style={{ listStyleType: 'circle', paddingRight: '20px' }}>
          <li><strong>الطاقة (Energy):</strong> تستهلك الأرواح الطاقة (Hunger). إذا وصلت طاقتها لـ 0%، ستموت مؤقتاً وتتحول للون الرمادي.</li>
          <li><strong>الإنعاش:</strong> يجب إطعام روحك باستخدام <Highlight $color="#eab308">500 Gold</Highlight> لاسترجاع طاقتها بالكامل.</li>
          <li><strong>التحرير والاستبدال:</strong> يمكنك تجهيز الأرواح أو إزالتها نهائياً لتوفير مساحة لروح أقوى أو أندر حصلت عليها من المتجر أو الأنشطة والفعاليات.</li>
        </ul>
      </>
    )
  },
  {
    id: 8,
    title: 'صالة الألعاب العصبية (Elite Arcade)',
    icon: Gamepad2,
    color: '#a855f7',
    content: (
      <>
        اضغط على أيقونة الـ Gamepad 🎮 العائمة لفتح صالة الألعاب المصغرة لاختبار جهازك العصبي وسرعة رد الفعل:
        <br/><br/>
        <ul style={{ listStyleType: 'circle', paddingRight: '20px' }}>
          <li><strong>Reflex Arena (معدل الاستجابة):</strong> يتطلب اجتياز <strong>4 محاولات متتالية</strong>، ويحسب النظام متوسط الزمن لضمان ثبات التركيز قبل تسجيله.</li>
          <li><strong>Finger Sprint:</strong> اختبر سرعة الانقباض العصبي بالنقر بأقصى سرعة ممكنة خلال 10 ثوانٍ.</li>
        </ul>
      </>
    )
  },
  {
    id: 9,
    title: 'ميثاق الشرف (Honor Code)',
    icon: Shield,
    color: '#ef4444',
    content: (
      <>
        <strong>"مَنْ غَشَّنَا فَلَيْسَ مِنَّا"</strong>
        <br/><br/>
        الضغط على المهام التي لا تتطلب صورة (مثل شرب المياه أو النوم) يُظهر <Highlight $color="#ef4444">النافذة الحمراء للقسم</Highlight>. الغش في تسجيل المهام يفقدك احترامك لنفسك قبل أن يكشفك النظام.
        <br/><br/>
        يمتلك الكوتش <strong>Master Override</strong> يسمح له بإلغاء مهامك المكتملة وسحب نقاطك وذهبك إذا ثبت تلاعبك. وفي حال تكرار المخالفة، يتم تفعيل عقوبة تأديبية توقف تقدمك كلياً حتى تنفذها حرفياً.
      </>
    )
  }
];

// ==========================================
// المكون الرئيسي (Rules)
// ==========================================
const Rules = () => {
  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <BookOpen size={40} color="#818cf8" style={{ filter: 'drop-shadow(0 0 10px rgba(129, 140, 248, 0.5))' }} />
        <Title>THE AWAKING MANIFESTO</Title>
        <Subtitle>دستور النخبة وقوانين السيرفر</Subtitle>
      </Header>

      <CardsGrid>
        {RULES_DATA.map((rule) => {
          const Icon = rule.icon;
          return (
            <RuleCard 
              key={rule.id} 
              $color={rule.color}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <CardHeader $color={rule.color}>
                <IconWrapper $color={rule.color}>
                  <Icon size={20} />
                </IconWrapper>
                <CardTitle style={{ color: rule.color }}>{rule.title}</CardTitle>
              </CardHeader>
              <CardBody>
                {rule.content}
              </CardBody>
            </RuleCard>
          );
        })}
      </CardsGrid>

      <div style={{ textAlign: 'center', marginTop: '50px', opacity: 0.6 }}>
        <Star size={30} color="#eab308" style={{ filter: 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.4))' }} />
        <div style={{ fontSize: '12px', marginTop: '12px', letterSpacing: '2px', fontWeight: 'bold', direction: 'ltr', color: '#a5b4fc' }}>
          STAY ELITE. STAY DISCIPLINED.
        </div>
      </div>
    </Container>
  );
};

export default Rules;