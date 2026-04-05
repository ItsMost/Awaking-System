import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Trophy,
  Zap,
  Info,
  Plus,
  Trash2,
  CalendarDays,
  Target,
  Flame,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast, Toaster } from 'sonner';

// ==========================================
// 1. التصميمات (Styled Components)
// ==========================================
const Container = styled(motion.div)`
  padding: 20px; font-family: 'Oxanium', sans-serif; color: #fff; min-height: 100vh; padding-bottom: 100px; max-width: 600px; margin: 0 auto;
`;

const Header = styled.div`
  display: flex; flex-direction: column; align-items: center; background: linear-gradient(135deg, #0f172a 0%, #020617 100%); border: 1px solid #1e293b; padding: 25px 20px; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center;
`;

const Title = styled.h1`
  margin: 10px 0 5px 0; font-size: 24px; color: #0ea5e9; text-transform: uppercase; letter-spacing: 2px; font-weight: 900;
`;

const Subtitle = styled.p`
  margin: 0; color: #94a3b8; font-size: 12px;
`;

const CoachForm = styled(motion.div)`
  background: #020617; border: 1px dashed #ef4444; border-radius: 16px; padding: 20px; margin-bottom: 25px; display: flex; flex-direction: column; gap: 15px; box-shadow: 0 0 20px rgba(239, 68, 68, 0.1);
`;

const Input = styled.input`
  background: #0f172a; border: 1px solid #334155; color: #fff; padding: 12px 15px; border-radius: 10px; font-family: 'Oxanium'; font-size: 14px; outline: none; transition: 0.3s;
  &:focus { border-color: #0ea5e9; box-shadow: 0 0 10px rgba(14, 165, 233, 0.2); }
`;

const TextArea = styled.textarea`
  background: #0f172a; border: 1px solid #334155; color: #fff; padding: 12px 15px; border-radius: 10px; font-family: 'Oxanium'; font-size: 14px; outline: none; min-height: 100px; resize: vertical; transition: 0.3s; direction: rtl;
  &:focus { border-color: #0ea5e9; box-shadow: 0 0 10px rgba(14, 165, 233, 0.2); }
`;

const Select = styled.select`
  background: #0f172a; border: 1px solid #334155; color: #fff; padding: 12px 15px; border-radius: 10px; font-family: 'Oxanium'; font-size: 14px; outline: none; cursor: pointer;
`;

const ActionBtn = styled.button<{ $color: string }>`
  background: ${(props) =>
    props.$color}; color: #000; border: none; padding: 12px; border-radius: 10px; font-weight: 900; font-family: 'Oxanium'; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.3s; font-size: 14px;
  &:hover { filter: brightness(1.2); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const NewsCard = styled(motion.div)<{ $color: string }>`
  background: #0f172a; border-left: 4px solid ${(props) =>
    props.$color}; border-radius: 12px; padding: 20px; margin-bottom: 15px; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.3); direction: rtl;
`;

const CardHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #1e293b; padding-bottom: 10px;
`;

const Badge = styled.div<{ $color: string }>`
  background: ${(props) => props.$color}20; color: ${(props) =>
  props.$color}; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; display: flex; align-items: center; gap: 5px;
`;

const DateText = styled.div`
  color: #64748b; font-size: 10px; font-weight: bold;
`;

const CardTitle = styled.h3`
  margin: 0 0 8px 0; color: #fff; font-size: 16px; line-height: 1.4;
`;

const CardContent = styled.p`
  margin: 0; color: #cbd5e1; font-size: 13px; line-height: 1.6; white-space: pre-wrap;
`;

const DeleteBtn = styled.button`
  position: absolute; bottom: 15px; left: 15px; background: #2a0808; border: none; color: #ef4444; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s;
  &:hover { background: #ef4444; color: #fff; }
`;

// ==========================================
// 2. فئات الأخبار (Categories)
// ==========================================
const CATEGORIES = [
  { id: 'world_record', label: 'أرقام عالمية', icon: Globe, color: '#0ea5e9' },
  { id: 'tournament', label: 'بطولات قادمة', icon: Trophy, color: '#eab308' },
  { id: 'team_news', label: 'أخبار التيم', icon: Flame, color: '#f97316' },
  { id: 'technique', label: 'توجيهات فنية', icon: Target, color: '#10b981' },
];

// ==========================================
// 3. المكون الرئيسي (Radar)
// ==========================================
const News = () => {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // التأكد لو اللي فاتح ده الكوتش ولا لاعب
  const [isCoachMode] = useState(() => {
    return localStorage.getItem('elite_coach_mode') === 'true';
  });

  // حالة الفورمة
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);

  // جلب الأخبار من الداتابيز
  const fetchNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('global_news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNewsList(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load radar data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // إضافة خبر جديد
  const handleAddNews = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('يرجى كتابة العنوان والتفاصيل!');
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase.from('global_news').insert([
        {
          title: title.trim(),
          content: content.trim(),
          category: category,
        },
      ]);

      if (error) throw error;

      toast.success('تم نشر الخبر بنجاح!', {
        style: {
          background: '#022c22',
          color: '#10b981',
          border: '1px solid #10b981',
        },
      });
      setTitle('');
      setContent('');
      fetchNews(); // تحديث القايمة
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // حذف خبر (للكوتش فقط)
  const handleDeleteNews = async (id: string) => {
    const confirmDelete = window.confirm('هل أنت متأكد من حذف هذا الخبر؟');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('global_news')
        .delete()
        .eq('id', id);
      if (error) throw error;

      toast.success('تم حذف الخبر.', {
        style: {
          background: '#2a0808',
          color: '#ef4444',
          border: '1px solid #ef4444',
        },
      });
      setNewsList((prev) => prev.filter((news) => news.id !== id));
    } catch (err: any) {
      toast.error('Failed to delete news.');
    }
  };

  const getCategoryDetails = (catId: string) => {
    return CATEGORIES.find((c) => c.id === catId) || CATEGORIES[2];
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Toaster position="top-center" theme="dark" />

      <Header>
        <Globe size={40} color="#0ea5e9" style={{ marginBottom: '10px' }} />
        <Title>Global Radar</Title>
        <Subtitle>أحدث الأرقام القياسية وأخبار ألعاب القوى 🌍</Subtitle>
      </Header>

      {/* فورمة الكوتش (بتظهر بس لو إنت عامل Master Active من شاشة الرانك) */}
      <AnimatePresence>
        {isCoachMode && (
          <CoachForm
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <div
              style={{
                color: '#ef4444',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Zap size={14} /> COACH TRANSMISSION
            </div>

            <Input
              placeholder="عنوان الخبر (مثال: رقم عالمي جديد في الـ 100م!)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              dir="rtl"
            />

            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              dir="rtl"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </Select>

            <TextArea
              placeholder="تفاصيل الخبر والأرقام..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <ActionBtn
              $color="#10b981"
              onClick={handleAddNews}
              disabled={isProcessing}
            >
              {isProcessing ? (
                'جاري الإرسال...'
              ) : (
                <>
                  <Plus size={18} /> نشر على الرادار
                </>
              )}
            </ActionBtn>
          </CoachForm>
        )}
      </AnimatePresence>

      {/* عرض الأخبار */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#0ea5e9' }}>
          جاري مسح الرادار... 📡
        </div>
      ) : newsList.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '50px',
            color: '#64748b',
            background: '#0f172a',
            borderRadius: '12px',
          }}
        >
          لا توجد أخبار على الرادار حالياً.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <AnimatePresence>
            {newsList.map((news) => {
              const catDetails = getCategoryDetails(news.category);
              const CatIcon = catDetails.icon;

              return (
                <NewsCard
                  key={news.id}
                  $color={catDetails.color}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <CardHeader>
                    <DateText>
                      {new Date(news.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </DateText>
                    <Badge $color={catDetails.color}>
                      {catDetails.label} <CatIcon size={12} />
                    </Badge>
                  </CardHeader>

                  <CardTitle>{news.title}</CardTitle>
                  <CardContent>{news.content}</CardContent>

                  {isCoachMode && (
                    <DeleteBtn onClick={() => handleDeleteNews(news.id)}>
                      <Trash2 size={16} />
                    </DeleteBtn>
                  )}
                </NewsCard>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </Container>
  );
};

export default News;
