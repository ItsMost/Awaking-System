import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import {
  Target,
  Shield,
  Medal,
  Activity,
  Flame,
  AlertTriangle,
  ChevronLeft,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';

// ==========================================
// 1. التصميمات (Styled Components)
// ==========================================
const Container = styled(motion.div)`
  padding: 20px;
  font-family: 'Oxanium', 'Cairo', sans-serif; /* دمج خط أجنبي مع عربي */
  color: #fff;
  padding-bottom: 100px;
  max-width: 800px;
  margin: 0 auto;
  direction: rtl; /* 🚨 إجبار الواجهة تكون من اليمين لليسار 🚨 */
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
  border: 1px solid #1e293b;
  padding: 30px 20px;
  border-radius: 20px;
  margin-bottom: 30px;
  box-shadow: 0 10px 40px rgba(0, 242, 255, 0.05);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #0f172a, #00f2ff, #0f172a);
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 900;
  color: #00f2ff;
  text-transform: uppercase;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 2px 15px rgba(0, 242, 255, 0.4);
`;

const Subtitle = styled.p`
  margin: 10px 0 0 0;
  color: #94a3b8;
  font-size: 13px;
  text-align: center;
  max-width: 80%;
  line-height: 1.6;
`;

const RuleCard = styled(motion.div)<{ $color: string }>`
  background: linear-gradient(180deg, #0b1120 0%, #020617 100%);
  border: 1px solid #1e293b;
  border-right: 4px solid ${(props) => props.$color};
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
  transition: 0.3s;

  &:hover {
    border-color: ${(props) => props.$color};
    box-shadow: 0 5px 25px ${(props) => props.$color}30;
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #1e293b;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 900;
    color: ${(props) => props.$color};
    letter-spacing: 1px;
  }
`;

const IconBox = styled.div<{ $color: string }>`
  background: ${(props) => props.$color}15;
  padding: 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RulesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const RuleItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
  color: #cbd5e1;
  line-height: 1.8;
`;

const Bullet = styled.div<{ $color: string }>`
  margin-top: 6px;
  color: ${(props) => props.$color};
  flex-shrink: 0;
`;

// 🚨 هذا المكون السحري هو الذي يمنع تكسر النصوص بين العربي والإنجليزي 🚨
const Highlight = styled.span<{ $color?: string }>`
  background: ${(props) => props.$color || '#1e293b'};
  color: ${(props) => (props.$color ? '#fff' : '#00f2ff')};
  padding: 2px 8px;
  border-radius: 6px;
  font-family: 'Oxanium', monospace;
  font-weight: 900;
  font-size: 12px;
  margin: 0 4px;
  display: inline-block; /* يمنع الكلمة من الانقسام */
  direction: ltr; /* يجبر النص الداخلي إنه يكون إنجليزي سليم */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
`;

// ==========================================
// 2. المكون الرئيسي (Rules Page)
// ==========================================
const Rules = () => {
  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Header>
        <Title>
          <Shield size={32} /> قوانين النظام
        </Title>
        <Subtitle>
          هذا النظام مصمم للمحترفين فقط. الالتزام بالقواعد أدناه هو طريقك الوحيد
          للوصول للقمة. الانضباط ليس خياراً، بل أسلوب حياة.
        </Subtitle>
      </Header>

      {/* 🟢 قسم المهام اليومية 🟢 */}
      <RuleCard
        $color="#00f2ff"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <CardHeader $color="#00f2ff">
          <IconBox $color="#00f2ff">
            <Target size={24} color="#00f2ff" />
          </IconBox>
          <h2>المهام اليومية (Quests)</h2>
        </CardHeader>
        <RulesList>
          <RuleItem>
            <Bullet $color="#00f2ff">
              <ChevronLeft size={16} />
            </Bullet>
            <div>
              تُقسم المهام إلى <Highlight>Core Quests</Highlight> (يومية) و
              <Highlight $color="#ef4444">Directives</Highlight> (تضاف أيام
              الجمعة فقط لمراجعة التزامك الأسبوعي).
            </div>
          </RuleItem>
          <RuleItem>
            <Bullet $color="#00f2ff">
              <ChevronLeft size={16} />
            </Bullet>
            <div>
              عند إكمالك لأي مهمة تتطلب دليلاً، تتحول حالتها إلى{' '}
              <Highlight $color="#facc15">PENDING</Highlight> ولن تحصل على نقاط{' '}
              <Highlight>EXP</Highlight> أو{' '}
              <Highlight $color="#eab308">GOLD</Highlight> إلا بعد مراجعتها
              وموافقة الكوتش <Highlight $color="#10b981">APPROVE</Highlight>.
            </div>
          </RuleItem>
          <RuleItem>
            <Bullet $color="#00f2ff">
              <ChevronLeft size={16} />
            </Bullet>
            <div>
              نافذة تسجيل المهام مفتوحة حتى{' '}
              <Highlight $color="#ef4444">الساعة 12 ظهراً</Highlight> من اليوم
              التالي. بعد هذا الوقت، يتم غلق النظام ولن يُسمح بتعديل أو إكمال
              مهام الأمس.
            </div>
          </RuleItem>
        </RulesList>
      </RuleCard>

      {/* 🟡 قسم نظام الرانك والخبرة 🟡 */}
      <RuleCard
        $color="#eab308"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CardHeader $color="#eab308">
          <IconBox $color="#eab308">
            <Zap size={24} color="#eab308" />
          </IconBox>
          <h2>نظام الرانك والـ EXP</h2>
        </CardHeader>
        <RulesList>
          <RuleItem>
            <Bullet $color="#eab308">
              <ChevronLeft size={16} />
            </Bullet>
            <div>
              يتم حساب المستوى الخاص بك بناءً على نقاط الخبرة{' '}
              <Highlight>EXP</Highlight>. الحد الأقصى المطلوب للمستوى يتزايد
              تدريجياً بحد أقصى <Highlight>4000 EXP</Highlight> في المستويات
              العليا.
            </div>
          </RuleItem>
          <RuleItem>
            <Bullet $color="#eab308">
              <ChevronLeft size={16} />
            </Bullet>
            <div>
              الرانك الخاص بك <Highlight>(E, D, C, B, A, S)</Highlight> ليس
              ثابتاً! يتحدد بدمج المستوى الخاص بك مع ترتيبك{' '}
              <Highlight>Position</Highlight> بين باقي اللاعبين في السيرفر.
            </div>
          </RuleItem>
          <RuleItem>
            <Bullet $color="#eab308">
              <ChevronLeft size={16} />
            </Bullet>
            <div>
              للوصول للرتبة الأسطورية{' '}
              <Highlight $color="#ef4444">S-Class</Highlight>، يجب أن تتخطى
              المستوى <Highlight>50</Highlight> وأن تكون حصرياً في{' '}
              <Highlight $color="#eab308">المركز الأول عالمياً</Highlight>.
            </div>
          </RuleItem>
          <RuleItem>
            <Bullet $color="#eab308">
              <ChevronLeft size={16} />
            </Bullet>
            <div>
              يوجد ترتيب منفصل لبطل الشهر <Highlight>Monthly MVP</Highlight>{' '}
              يعتمد فقط على النقاط المكتسبة خلال الشهر الحالي، مما يعطي فرصة
              متساوية للجميع للمنافسة.
            </div>
          </RuleItem>
        </RulesList>
      </RuleCard>

      {/* 🔴 قسم الأرقام القياسية 🔴 */}
      <RuleCard
        $color="#ef4444"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <CardHeader $color="#ef4444">
          <IconBox $color="#ef4444">
            <Medal size={24} color="#ef4444" />
          </IconBox>
          <h2>الأرقام القياسية (Records)</h2>
        </CardHeader>
        <RulesList>
          <RuleItem>
            <Bullet $color="#ef4444">
              <ChevronLeft size={16} />
            </Bullet>
            <div>
              أول إدخال لأي رقم قياسي يعتبر{' '}
              <Highlight $color="#10b981">Baseline</Highlight> ويُحفظ مباشرة في
              النظام دون الحاجة لموافقة.
            </div>
          </RuleItem>
          <RuleItem>
            <Bullet $color="#ef4444">
              <ChevronLeft size={16} />
            </Bullet>
            <div>
              لكسر رقم قياسي في سباقات السرعة (Sprints)، يجب أن يكون الرقم
              الجديد أقل من الرقم القديم بـ <Highlight>0.04 ثانية</Highlight>{' '}
              على الأقل.
            </div>
          </RuleItem>
          <RuleItem>
            <Bullet $color="#ef4444">
              <ChevronLeft size={16} />
            </Bullet>
            <div>
              أي محاولة لكسر رقم قياسي تذهب مباشرة إلى{' '}
              <Highlight $color="#facc15">Pending Requests</Highlight> ولن يتم
              اعتمادها إلا بعد رفع الدليل وموافقة الكوتش.
            </div>
          </RuleItem>
        </RulesList>
      </RuleCard>

      {/* 🟢 قسم الإصابات 🟢 */}
      <RuleCard
        $color="#10b981"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <CardHeader $color="#10b981">
          <IconBox $color="#10b981">
            <Activity size={24} color="#10b981" />
          </IconBox>
          <h2>البروتوكول الطبي (Rehab Mode)</h2>
        </CardHeader>
        <RulesList>
          <RuleItem>
            <Bullet $color="#10b981">
              <ChevronLeft size={16} />
            </Bullet>
            <div>
              في حالة تعرضك لإصابة، لا تتوقف. استخدم زرار الإبلاغ عن إصابة وسيتم
              إرسال <Highlight $color="#ef4444">Injury Report</Highlight> مفصل
              للكوتش.
            </div>
          </RuleItem>
          <RuleItem>
            <Bullet $color="#10b981">
              <ChevronLeft size={16} />
            </Bullet>
            <div>
              بمجرد موافقة الكوتش، يتحول حسابك إلى{' '}
              <Highlight $color="#10b981">Rehab Mode</Highlight> وتتغير مهامك
              اليومية لتشمل جلسات العلاج الطبيعي، الاستشفاء، وتغذية الأنسجة.
            </div>
          </RuleItem>
          <RuleItem>
            <Bullet $color="#10b981">
              <ChevronLeft size={16} />
            </Bullet>
            <div>
              بمجرد شعورك بالتعافي، يمكنك إيقاف هذا الوضع يدوياً والعودة لنظام
              الأداء العالي بضغطة زر.
            </div>
          </RuleItem>
        </RulesList>
      </RuleCard>

      <div
        style={{
          textAlign: 'center',
          marginTop: '30px',
          color: '#64748b',
          fontSize: '12px',
          letterSpacing: '2px',
          fontWeight: 'bold',
        }}
      >
        STAY DISCIPLINED. SURPASS YOUR LIMITS.
      </div>
    </Container>
  );
};

export default Rules;
