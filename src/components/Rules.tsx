import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Shield, Heart, Zap, Flame, ShoppingCart, 
  Gamepad2, AlertTriangle, ChevronDown, ChevronUp, Star,
  Target, Crosshair, Droplet, Medal, Crown, Lock, Activity, Clock
} from 'lucide-react';

// ==========================================
// التصميمات المفرودة (Styled Components)
// ==========================================
const Container = styled(motion.div)`
  padding: 20px;
  font-family: 'Oxanium', sans-serif;
  color: #fff;
  padding-bottom: 100px;
  max-width: 600px;
  margin: 0 auto;
  direction: rtl; 
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #1e1b4b 0%, #020617 100%);
  border: 1px solid #6366f1;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 25px;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2);
`;

const Title = styled.h1`
  font-size: 20px;
  margin: 0;
  color: #818cf8;
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 900;
`;

const RuleCard = styled(motion.div)<{ $color: string, $isOpen: boolean }>`
  background: #0f172a;
  border: 1px solid ${(props) => props.$isOpen ? props.$color : '#1e293b'};
  border-radius: 16px;
  margin-bottom: 15px;
  overflow: hidden;
  transition: border-color 0.3s;
  box-shadow: ${(props) => props.$isOpen ? `0 0 20px ${props.$color}20` : 'none'};
`;

const RuleHeader = styled.div<{ $color: string }>`
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background: ${(props) => props.$color}10;
  
  &:hover {
    background: ${(props) => props.$color}20;
  }
`;

const RuleTitle = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
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
  line-height: 1.6;
  text-align: right;

  ul {
    padding-inline-start: 20px;
    margin-top: 10px;
  }

  li {
    margin-bottom: 8px;
  }

  strong {
    color: #fff;
  }
`;

const Highlight = styled.span<{ $color: string }>`
  color: ${(props) => props.$color};
  font-weight: bold;
`;

const RankItem = styled.li<{ $color: string }>`
  background: #020617;
  border: 1px solid ${(props) => props.$color}40;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px !important;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  
  span.rank-name {
    color: ${(props) => props.$color};
    min-width: 90px;
  }
  
  span.rank-desc {
    color: #94a3b8;
    font-size: 11px;
  }
  
  span.rank-tax {
    color: #ef4444;
    font-size: 11px;
    margin-right: auto;
  }
`;

// ==========================================
// بيانات الدستور (Manifesto Data)
// ==========================================
const RULES_DATA = [
  {
    id: 1,
    title: 'تصنيفات النخبة (The Rank System)',
    icon: Crown,
    color: '#eab308',
    content: (
      <>
        يتم ترقيتك لرانك جديد كل 5 مستويات. القمة لا ترحم الضعفاء، وكلما ارتفع رانكك زادت هيبتك، وزادت معها <Highlight $color="#ef4444">"ضريبة التكاسل (High ELO Tax)"</Highlight> التي تدفعها من الـ HP والـ Gold عند تفويت المهام:
        <ul style={{ listStyleType: 'none', padding: 0, marginTop: '15px' }}>
          <RankItem $color="#b45309"><Medal size={16} color="#b45309" /> <span className="rank-name">BRONZE</span> <span className="rank-desc">المستوى 1 إلى 4</span> <span className="rank-tax">ضريبة: -10 HP | -50 G</span></RankItem>
          <RankItem $color="#94a3b8"><Medal size={16} color="#94a3b8" /> <span className="rank-name">SILVER</span> <span className="rank-desc">المستوى 5 إلى 9</span> <span className="rank-tax">ضريبة: -15 HP | -75 G</span></RankItem>
          <RankItem $color="#eab308"><Medal size={16} color="#eab308" /> <span className="rank-name">GOLD</span> <span className="rank-desc">المستوى 10 إلى 14</span> <span className="rank-tax">ضريبة: -20 HP | -100 G</span></RankItem>
          <RankItem $color="#06b6d4"><Target size={16} color="#06b6d4" /> <span className="rank-name">PLATINUM</span> <span className="rank-desc">المستوى 15 إلى 19</span> <span className="rank-tax">ضريبة: -25 HP | -125 G</span></RankItem>
          <RankItem $color="#3b82f6"><Shield size={16} color="#3b82f6" /> <span className="rank-name">DIAMOND</span> <span className="rank-desc">المستوى 20 إلى 24</span> <span className="rank-tax">ضريبة: -30 HP | -150 G</span></RankItem>
          <RankItem $color="#ef4444"><Flame size={16} color="#ef4444" /> <span className="rank-name">MASTER</span> <span className="rank-desc">المستوى 25 إلى 29</span> <span className="rank-tax">ضريبة: -40 HP | -200 G</span></RankItem>
          <RankItem $color="#a855f7"><Crown size={16} color="#a855f7" /> <span className="rank-name">ELITE 👑</span> <span className="rank-desc">المستوى 30+</span> <span className="rank-tax">ضريبة: -50 HP | -250 G</span></RankItem>
        </ul>
        <div style={{ marginTop: '10px' }}>
          * بداية من رانك <Highlight $color="#ef4444">MASTER</Highlight>، سيشع التطبيق بهالة متوهجة تعكس قوتك.<br/>
          * للوصول إلى رانك ELITE، ستحتاج إلى جمع حوالي <strong>100,000 EXP</strong>، وهو ما يعادل تقريباً عاماً كاملاً من التدريب المثالي!
        </div>
      </>
    )
  },
  {
    id: 2,
    title: 'اقتصاد الـ EXP والمستويات',
    icon: Activity,
    color: '#0ea5e9',
    content: (
      <>
        أنت لست مجرد متدرب، أنت <Highlight $color="#0ea5e9">رياضي نخبة (Elite Athlete)</Highlight>.
        <ul>
          <li><strong>حسبة الـ EXP للوحوش:</strong><br/>
            - اليوم المثالي الكامل يمنحك <strong>215 EXP</strong>.<br/>
            - الأسبوع المثالي (متضمناً مهام الجمعة) يمنحك <strong>1,805 EXP</strong>.<br/>
            - الشهر المثالي (متضمناً مهام الشهر واللوجستيات) يمنحك حوالي <strong>7,595 EXP</strong>.
          </li>
          <li><strong>صعوبة المستويات (Leveling):</strong><br/>
            تحتاج مجهوداً مضاعفاً كلما ارتقيت. للانتقال من المستوى 1 إلى 2 ستحتاج 650 EXP فقط، بينما المستويات المتقدمة (فوق المستوى 25) تتطلب <strong>4,000 EXP</strong> كاملة للارتقاء لمستوى واحد!
          </li>
          <li><strong>مكافآت الترقية:</strong> عند الارتقاء لمستوى جديد، تحصل على مكافأة مالية قدرها <Highlight $color="#eab308">100 جولد</Highlight>. وتتضاعف هذه المكافأة لتصبح <Highlight $color="#eab308">200 جولد</Highlight> إذا كان المستوى ينقلك لرانك جديد (مضاعفات الـ 5).</li>
        </ul>
      </>
    )
  },
  {
    id: 3,
    title: 'ساعة الصفر واليوم المثالي (Perfect Day)',
    icon: Clock,
    color: '#34d399',
    content: (
      <>
        الالتزام الصارم هو الفارق الوحيد بين العادي والنخبة.
        <ul>
          <li><strong>فترة السماح:</strong> يبدأ اليوم الجديد في 12:00 منتصف الليل، ولكن النظام يمنحك فترة سماح لتسجيل مهام "أمس" المنسية حتى الساعة <Highlight $color="#34d399">11:59 ظهراً</Highlight> من اليوم التالي.</li>
          <li><strong>ساعة الصفر (12:00 ظهراً):</strong> بمجرد حلول الظهيرة، يتم <Highlight $color="#ef4444">إغلاق النظام (System Locked)</Highlight> ليوم الأمس ولن يمكنك تعديله نهائياً.</li>
          <li><strong>اليوم المثالي:</strong> الـ Streak لا يرتفع إلا إذا أتممت <strong>المهام الأساسية الثلاث</strong> (التمرين، التغذية، المياه). إذا فوتّ مهمة واحدة، <Highlight $color="#ef4444">ينكسر الـ Streak للصفر</Highlight> وتُطبق عليك ضريبة الرانك وتخسر نقاط حياتك (HP)!</li>
        </ul>
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
        لن يمكنك ادعاء إتمام هدف التغذية دون دليل والتزام حقيقي.
        <ul>
          <li><strong>الهدف الذكي:</strong> النظام يحسب هدف البروتين الخاص بك تلقائياً بناءً على وزنك (1.7g إلى 2.2g لكل كيلو).</li>
          <li><strong>قفل المهمة:</strong> مهمة التغذية ستظل <Highlight $color="#f97316">مقفولة (Locked)</Highlight> ولن تعطيك EXP حتى يمتلئ عداد البروتين للون الأخضر.</li>
          <li><strong>قاعدة البيانات الشخصية:</strong> أضف وجباتك يدوياً وسيحفظها النظام للأبد لتجدها في البحث في الأيام القادمة تحت وسم `[وجبتي]`.</li>
        </ul>
      </>
    )
  },
  {
    id: 5,
    title: 'خزنة النخبة والغموض (Elite Vault)',
    icon: Lock,
    color: '#10b981',
    content: (
      <>
        الـ Gold هو ثروتك، ولكن بعض الغنائم تحتاج لما هو أكثر من المال.
        <ul>
          <li><strong>المنتجات الحصرية (Exclusive):</strong> قطع فريدة متوفرة بنسخ محدودة جداً في السيرفر. أول من يدفع، يغلقها على الباقيين!</li>
          <li><strong>نظام الغموض (Mystery Locks):</strong> بعض المنتجات أو الاستشارات <Highlight $color="#10b981">تتطلب رانك معين</Highlight> لشرائها (مثل Diamond أو Platinum).</li>
          <li>إذا كان رانكك أقل من المطلوب، سيظهر لك المنتج بشكل <Highlight $color="#64748b">ضبابي غامض (Blurred)</Highlight> وزر الشراء مغلق بقفل، لتشجيعك على القتال للوصول لهذا الرانك وفتح الغنيمة.</li>
          <li><strong>ألقاب الأبطال (Titles):</strong> اشترِ ألقاباً رياضية مهيبة لتظهر بجانب اسمك في الـ Leaderboard.</li>
        </ul>
      </>
    )
  },
  {
    id: 6,
    title: 'صالة الألعاب (Elite Arcade)',
    icon: Gamepad2,
    color: '#a855f7',
    content: (
      <>
        نحن نقيس التناسق والتركيز، وليس الحظ.
        <ul>
          <li>اضغط على <strong>أيقونة الـ Gamepad 🎮</strong> العائمة لفتح صالة الألعاب.</li>
          <li><strong>Reflex Arena (معدل الاستجابة):</strong> لا تقاس سرعة رد فعلك من محاولة واحدة. يجب عليك اجتياز <Highlight $color="#a855f7">4 محاولات متتالية</Highlight>. النظام سيحسب (المتوسط - Average) لتلك المحاولات لضمان التناسق قبل إرسال نتيجتك.</li>
          <li><strong>Finger Sprint:</strong> اختبر سرعة الانقباض العصبي عبر النقر بأقصى سرعة لمدة 10 ثواني.</li>
          <li>أرقامك تُسجل في Leaderboard عالمي خاص بالألعاب لتحديد أسرع الأعصاب في السيرفر.</li>
        </ul>
      </>
    )
  },
  {
    id: 7,
    title: 'ميثاق الشرف (Honor Code)',
    icon: Shield,
    color: '#ef4444',
    content: (
      <>
        <strong>"مَنْ غَشَّنَا فَلَيْسَ مِنَّا"</strong>
        <ul>
          <li>الضغط على مهام الشرف يظهر لك <Highlight $color="#ef4444">النافذة الحمراء</Highlight>. الغش في تسجيل المهام يُفقدك احترامك لنفسك قبل أن يُفقدك ثقة السيرفر.</li>
          <li>إذا قمت بمخالفة خطيرة أو تكاسلت بشكل مستمر، سيقوم الكوتش بتفعيل <strong>"عقوبة إدارية"</strong> لك، والتي تجمد تقدمك بالكامل.</li>
          <li>لا يتم فك التجميد إلا بتنفيذ عقوبة الكوتش ورفع إثبات موثق.</li>
        </ul>
      </>
    )
  }
];

// ==========================================
// المكون الرئيسي (Rules)
// ==========================================
const Rules = () => {
  const [openId, setOpenId] = useState<number | null>(1);

  const toggleAccordion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <Container
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Header>
        <Title>
          <BookOpen size={24} color="#818cf8" />
          THE AWAKING MANIFESTO
        </Title>
      </Header>

      <div style={{ marginBottom: '20px', fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', textAlign: 'center' }}>
        هذا هو دستور النخبة. هنا تجد كل القوانين والأنظمة التي تحكم سيرفر The Awaking. 
        قراءتك وفهمك لهذه القواعد هو أول خطوة في طريقك للتفوق على البقية.
      </div>

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