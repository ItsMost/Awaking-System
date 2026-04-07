import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Shield, Heart, Zap, Flame, ShoppingCart, 
  Gamepad2, AlertTriangle, ChevronDown, ChevronUp, Star,
  Target, Crosshair, Droplet
} from 'lucide-react';

// ==========================================
// التصميمات (Styled Components)
// ==========================================
const Container = styled(motion.div)`
  padding: 20px;
  font-family: 'Oxanium', sans-serif;
  color: #fff;
  padding-bottom: 100px;
  max-width: 600px;
  margin: 0 auto;
  direction: rtl; /* 👈 تم إضافة دعم اللغة العربية بالكامل هنا */
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

// ==========================================
// بيانات الدستور (Manifesto Data)
// ==========================================
const RULES_DATA = [
  {
    id: 1,
    title: 'نظام الحياة (HP) والمستويات',
    icon: Heart,
    color: '#ef4444',
    content: (
      <>
        أنت لست مجرد متدرب، أنت <Highlight $color="#ef4444">رياضي نخبة (Elite Athlete)</Highlight>.
        <ul>
          <li><strong>نقاط الحياة (HP):</strong> تبدأ بـ 100 HP. إذا تجاهلت مهامك ولم تفتح التطبيق، ستعاني من <strong>"النزيف (HP Bleed)"</strong> وتفقد 10 HP عن كل يوم غياب.</li>
          <li><strong>استرجاع الـ HP:</strong> يمكنك تعويض الـ HP المفقود من خلال إتمام مهام التغذية، شرب المياه، والمهام الأسبوعية.</li>
          <li><strong>المستويات (Leveling):</strong> تكتسب EXP من كل مهمة. عند تجميع النقاط المطلوبة، ترتقي للمستوى التالي وتتلقى مكافآت.</li>
          <li><strong>الموسم (Season Pass):</strong> كل 500 EXP تكتسبها شهرياً ترفعك مستوى (Tier) في الـ Season Pass للحصول على جوائز حصرية.</li>
        </ul>
      </>
    )
  },
  {
    id: 2,
    title: 'العمليات والمهام (Directives)',
    icon: Target,
    color: '#0ea5e9',
    content: (
      <>
        الالتزام هو ما يفصل بين العادي والنخبة.
        <ul>
          <li><strong>مهام يومية (Daily):</strong> مهام تتجدد يومياً مثل التمرين، التغذية، والمرونة. بمجرد انتهاء اليوم (12 ظهراً في اليوم التالي)، يتم <Highlight $color="#0ea5e9">قفل النظام (System Locked)</Highlight> ولن تتمكن من تسجيل مهام الأمس.</li>
          <li><strong>مهام الجمعة (Critical):</strong> مهام حاسمة تظهر يوم الجمعة فقط لتقييم الأسبوع بالكامل (الالتزام بالأوزان وتكملة التراكم).</li>
          <li><strong>وضع الإصابة (Rehab Mode):</strong> إذا تعرضت لإصابة وتم تفعيل وضع التأهيل لك من قِبل الكوتش، ستتغير مهامك اليومية تلقائياً لمهام العلاج الطبيعي والكمادات بدلاً من التمرين القاسي.</li>
        </ul>
      </>
    )
  },
  {
    id: 3,
    title: 'متتبع التغذية (Nutrition Tracker)',
    icon: Flame,
    color: '#f97316',
    content: (
      <>
        لن يمكنك ادعاء إتمام هدف التغذية دون دليل. النظام يراقبك.
        <ul>
          <li><strong>الهدف الذكي:</strong> النظام يحسب هدف البروتين الخاص بك تلقائياً بناءً على وزنك (1.7g إلى 2.2g لكل كيلو).</li>
          <li><strong>قفل المهمة:</strong> مهمة التغذية (Claim Mission) ستظل <Highlight $color="#f97316">مقفولة</Highlight> ولن تعطيك EXP حتى يمتلئ عداد البروتين للون الأخضر.</li>
          <li><strong>قاعدة البيانات الشخصية:</strong> يمكنك إضافة وجباتك اليومية يدوياً (كتابة الماكروز والاسم) وسيحفظها النظام للأبد لتجدها في البحث في الأيام القادمة تحت وسم `[وجبتي]`.</li>
          <li><strong>سجل اليوم:</strong> يمكنك مراجعة ما أكلته اليوم وحذف أي وجبة أضفتها بالخطأ ليتم خصمها من العداد تلقائياً.</li>
        </ul>
      </>
    )
  },
  {
    id: 4,
    title: 'خزنة النخبة (Elite Vault)',
    icon: ShoppingCart,
    color: '#eab308',
    content: (
      <>
        الـ Gold الذي تجمعه من المهام له قيمة حقيقية هنا.
        <ul>
          <li><strong>المنتجات الحصرية (Exclusive):</strong> قطع فريدة (مثل تيشيرت الموسم) متوفرة بنسخة واحدة فقط (1/1) في السيرفر. أول شخص يشتريها يغلقها على الباقيين!</li>
          <li><strong>العيادة المحدودة (Limited):</strong> فحوصات مثل InBody متوفرة بعدد محدود جداً كل شهر. الأولوية لمن يجمع الـ Gold أسرع.</li>
          <li><strong>ألقاب الأبطال (Titles):</strong> يمكنك شراء ألقاب رياضية (مثل Speed Demon) لتظهر بجانب اسمك في الـ Leaderboard لفرض هيمنتك.</li>
        </ul>
      </>
    )
  },
  {
    id: 5,
    title: 'صالة الألعاب (Elite Arcade)',
    icon: Gamepad2,
    color: '#a855f7',
    content: (
      <>
        تدريب الـ (CNS) وسرعة استجابة الأعصاب هو ما يكمل قوتك العضلية.
        <ul>
          <li>اضغط على <strong>أيقونة الـ Gamepad 🎮</strong> العائمة لفتح صالة الألعاب المصغرة.</li>
          <li><strong>Reflex Arena:</strong> اختبر سرعة رد فعلك للألوان. يجب أن تدوس فوراً عند ظهور اللون الأخضر. يتم قياسها بالمللي ثانية.</li>
          <li><strong>Finger Sprint:</strong> اختبر سرعة الانقباض العصبي. انقر بأقصى سرعة ممكنة خلال 10 ثواني (CPS Test).</li>
          <li>أرقامك القياسية تُسجل تلقائياً في <Highlight $color="#a855f7">الـ Leaderboard العالمي</Highlight> الخاص بكل لعبة ليتنافس عليها جميع أبطال السيرفر.</li>
        </ul>
      </>
    )
  },
  {
    id: 6,
    title: 'ميثاق الشرف والعقوبات',
    icon: Shield,
    color: '#10b981',
    content: (
      <>
        <strong>"مَنْ غَشَّنَا فَلَيْسَ مِنَّا"</strong>
        <ul>
          <li>نظامنا مبني على الثقة المتبادلة وعقلية البطل الحقيقي. الغش في تسجيل المهام يُفقدك احترامك لنفسك قبل أن يُفقدك ثقة الكوتش.</li>
          <li><strong>نظام العقوبات (Penalties):</strong> إذا قمت بمخالفة خطيرة أو تكاسلت بشكل مستمر، سيقوم الكوتش بتفعيل <strong>"عقوبة إدارية"</strong> لك.</li>
          <li>عند تفعيل العقوبة، ستظهر لك مهمة طارئة باللون الأحمر، ولن يُسمح لك بالتقدم أو المطالبة بالنقاط حتى تقوم بتنفيذ العقوبة ورفع دليل الإثبات للكوتش.</li>
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