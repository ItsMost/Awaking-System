import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Gem, Flame, Zap, Shield, Crown, Package, Clock, Coffee, Target, 
  Activity, Award, Wind, Footprints, Heart, ChevronUp, Lock, Unlock, CheckCircle, 
  AlertTriangle, Star, X, Edit2, Trash2, PlusCircle, Save
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast, Toaster } from 'sonner';

// ==========================================
// 1. المحرك الصوتي المضاد للسبام (Anti-Spam Audio Shield) 🚨
// ==========================================
let sharedAudioCtx: AudioContext | null = null;
let lastPlayTime = 0;

const getAudioContext = () => {
  if (!sharedAudioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) sharedAudioCtx = new Ctx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
};

const canPlay = () => {
  const now = Date.now();
  if (now - lastPlayTime < 50) return false;
  lastPlayTime = now;
  return true;
};

const playClick = () => {
  if (!canPlay()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  osc.start(); osc.stop(ctx.currentTime + 0.1);
};

const playBuy = () => {
  if (!canPlay()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'square'; osc.frequency.setValueAtTime(400, ctx.currentTime); osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1); osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
  osc.start(); osc.stop(ctx.currentTime + 0.5);
};

const playError = () => {
  if (!canPlay()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  osc.start(); osc.stop(ctx.currentTime + 0.3);
};

// ==========================================
// 2. خريطة الأيقونات (Dynamic Icons Map)
// ==========================================
const ICON_MAP: Record<string, any> = {
  Crown, Activity, Zap, Wind, ChevronUp, Target, Heart, Footprints, Clock, Coffee, Shield, Flame, Star, Package, Award
};
const getIcon = (iconName: string) => ICON_MAP[iconName] || Star;

// ==========================================
// 3. التصميمات المفرودة
// ==========================================
const Container = styled(motion.div)` padding: 15px; font-family: 'Oxanium', sans-serif; color: #fff; padding-bottom: 100px; max-width: 600px; margin: 0 auto; position: relative; `;
const Header = styled.div` display: flex; justify-content: space-between; align-items: center; background: linear-gradient(90deg, #1e1b4b 0%, #020617 100%); border: 1px solid #4f46e5; padding: 20px; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 10px 30px rgba(79, 70, 229, 0.2); `;
const Title = styled.h1` font-size: 20px; margin: 0; color: #818cf8; display: flex; align-items: center; gap: 10px; text-transform: uppercase; letter-spacing: 1px; `;
const GoldDisplay = styled.div` background: rgba(0,0,0,0.5); border: 1px solid #eab308; color: #eab308; padding: 8px 15px; border-radius: 12px; font-size: 16px; font-weight: 900; display: flex; align-items: center; gap: 8px; box-shadow: 0 0 15px rgba(234, 179, 8, 0.2); `;
const SectionTitle = styled.h2<{ $color: string }>` font-size: 14px; color: ${(props) => props.$color}; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 2px; display: flex; align-items: center; gap: 8px; border-bottom: 1px dashed ${(props) => props.$color}50; padding-bottom: 10px; position: relative; `;
const ExclusiveCard = styled(motion.div)<{ $soldOut: boolean; $color: string }>` background: ${(props) => props.$soldOut ? '#0f172a' : `linear-gradient(135deg, ${props.$color}20 0%, #020617 100%)`}; border: 2px solid ${(props) => props.$soldOut ? '#334155' : props.$color}; border-radius: 16px; padding: 20px; margin-bottom: 30px; position: relative; overflow: hidden; box-shadow: ${(props) => props.$soldOut ? 'none' : `0 10px 30px ${props.$color}30`}; opacity: ${(props) => props.$soldOut ? 0.7 : 1}; transition: 0.3s; `;
const ExclusiveBadge = styled.div<{ $color: string }>` position: absolute; top: 15px; right: -35px; background: ${(props) => props.$color}; color: #000; padding: 5px 40px; transform: rotate(45deg); font-size: 10px; font-weight: 900; letter-spacing: 1px; box-shadow: 0 2px 10px rgba(0,0,0,0.5); z-index: 10; `;
const ItemGrid = styled.div` display: grid; grid-template-columns: 1fr; gap: 15px; margin-bottom: 30px; `;
const TitlesGrid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 30px; `;
const TitleCard = styled.div<{ $color: string }>` background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center; transition: 0.3s; position: relative; overflow: hidden; &:hover { border-color: ${(props) => props.$color}; background: ${(props) => props.$color}10; transform: translateY(-2px); } `;
const ItemCard = styled.div` background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 20px; display: flex; align-items: center; justify-content: space-between; transition: 0.3s; position: relative; &:hover { border-color: #38bdf8; background: #1e293b; } `;
const ItemInfo = styled.div` display: flex; align-items: center; gap: 15px; `;
const IconWrapper = styled.div<{ $color: string }>` width: 50px; height: 50px; border-radius: 12px; background: ${(props) => props.$color}20; border: 1px solid ${(props) => props.$color}; display: flex; align-items: center; justify-content: center; color: ${(props) => props.$color}; flex-shrink: 0; `;
const BuyBtn = styled.button<{ $affordable: boolean; $color?: string }>` background: ${(props) => props.$affordable ? (props.$color || '#10b981') : '#334155'}; color: ${(props) => props.$affordable ? '#000' : '#94a3b8'}; border: none; padding: 10px 20px; border-radius: 10px; font-family: 'Oxanium'; font-weight: 900; font-size: 14px; cursor: ${(props) => props.$affordable ? 'pointer' : 'not-allowed'}; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; transition: 0.3s; &:hover { filter: ${(props) => props.$affordable ? 'brightness(1.2)' : 'none'}; transform: ${(props) => props.$affordable ? 'translateY(-2px)' : 'none'}; } `;
const BuyButtonSmall = styled.button<{ $affordable: boolean; $color: string }>` background: ${(props) => props.$affordable ? 'transparent' : '#020617'}; color: ${(props) => props.$affordable ? props.$color : '#475569'}; border: 1px solid ${(props) => props.$affordable ? props.$color : '#1e293b'}; width: 100%; padding: 8px; border-radius: 8px; font-family: 'Oxanium'; font-weight: bold; font-size: 12px; cursor: ${(props) => props.$affordable ? 'pointer' : 'not-allowed'}; display: flex; align-items: center; justify-content: center; gap: 5px; transition: 0.3s; z-index: 2; &:hover { background: ${(props) => props.$affordable ? props.$color : '#020617'}; color: ${(props) => props.$affordable ? '#000' : '#475569'}; } `;
const SoldOutOverlay = styled.div` position: absolute; inset: 0; background: rgba(2, 6, 23, 0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 20; backdrop-filter: blur(2px); `;
const SoldOutText = styled.div` font-size: 24px; font-weight: 900; color: #ef4444; letter-spacing: 4px; text-transform: uppercase; border: 2px solid #ef4444; padding: 10px 20px; border-radius: 8px; transform: rotate(-10deg); background: rgba(239, 68, 68, 0.1); `;
const ClaimerText = styled.div` margin-top: 10px; font-size: 11px; color: #94a3b8; font-weight: bold; background: #0f172a; padding: 5px 15px; border-radius: 20px; border: 1px solid #334155; text-align: center; line-height: 1.5; `;
const ModalOverlay = styled(motion.div)` position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(8px); `;
const ModalContent = styled(motion.div)<{ $color?: string }>` background: #0b1120; border: 2px solid ${(props) => props.$color || '#eab308'}; border-radius: 20px; padding: 25px; width: 100%; max-width: 400px; text-align: center; position: relative; box-shadow: 0 0 50px ${(props) => props.$color ? `${props.$color}50` : 'rgba(234, 179, 8, 0.3)'}; max-height: 90vh; overflow-y: auto; `;

// 🚨 Coach Edit Controls 🚨
const CoachActions = styled.div` position: absolute; top: 10px; left: 10px; display: flex; gap: 5px; z-index: 30; `;
const CoachBtn = styled.button<{ $color: string }>` background: #020617; border: 1px solid ${(props) => props.$color}; color: ${(props) => props.$color}; width: 30px; height: 30px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; &:hover { background: ${(props) => props.$color}; color: #000; } `;
const AddItemBtn = styled.button` background: #10b98120; color: #10b981; border: 1px dashed #10b981; width: 100%; padding: 15px; border-radius: 12px; margin-bottom: 20px; font-family: 'Oxanium'; font-weight: bold; font-size: 14px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: 0.3s; &:hover { background: #10b98140; } `;
const EditInput = styled.input` width: 100%; background: #020617; border: 1px solid #334155; color: #fff; padding: 12px; border-radius: 8px; margin-bottom: 10px; font-family: 'Oxanium'; outline: none; &:focus { border-color: #0ea5e9; } `;
const EditSelect = styled.select` width: 100%; background: #020617; border: 1px solid #334155; color: #fff; padding: 12px; border-radius: 8px; margin-bottom: 10px; font-family: 'Oxanium'; outline: none; `;
const EditTextarea = styled.textarea` width: 100%; background: #020617; border: 1px solid #334155; color: #fff; padding: 12px; border-radius: 8px; margin-bottom: 10px; font-family: 'Oxanium'; outline: none; resize: vertical; min-height: 80px; `;

// ==========================================
// 4. المكون الرئيسي (Shop)
// ==========================================
const Shop = ({ player, setPlayer }: any) => {
  const [gold, setGold] = useState(player?.gold || 0);
  const [dbItems, setDbItems] = useState<any[]>([]);
  const [claimsList, setClaimsList] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean, item: any, type: string }>({ show: false, item: null, type: '' });

  // 🚨 Coach Mode State 🚨
  const isCoachMode = localStorage.getItem('elite_coach_mode') === 'true';
  const [editModal, setEditModal] = useState<{ show: boolean, item: any | null }>({ show: false, item: null });
  const [formData, setFormData] = useState({ id: '', name: '', description: '', price: 0, category: 'general', color: '#38bdf8', icon: 'Star', max_stock: '' });

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    setLoading(true);
    try {
      const { data: hunterData } = await supabase.from('shadow_hunters').select('gold').eq('name', player.name).single();
      if (hunterData) {
        setGold(hunterData.gold);
        setPlayer((prev: any) => ({ ...prev, gold: hunterData.gold }));
      }

      // جلب المنتجات من الداتابيز
      const { data: items, error: itemsErr } = await supabase.from('shop_items').select('*').order('created_at', { ascending: true });
      if (itemsErr) throw itemsErr;
      setDbItems(items || []);

      // جلب عمليات الشراء لحساب المخزون
      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      const { data: claims } = await supabase.from('system_requests')
        .select('hunter_name, task_name')
        .like('task_name', '%CLAIM]%')
        .gte('created_at', firstDay);

      setClaimsList(claims || []);

    } catch (err) {
      console.error("Shop Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const executePurchase = async () => {
    const { item, type } = confirmModal;
    setConfirmModal({ show: false, item: null, type: '' });
    
    if (gold < item.price) { playError(); toast.error('NOT ENOUGH GOLD!'); return; }
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();

      let taskName = `[SHOP PURCHASE] ${item.name}`;
      if (item.category === 'exclusive') taskName = `[EXCLUSIVE CLAIM] ${item.name}`;
      if (item.category === 'limited') taskName = `[LIMITED CLAIM] ${item.name}`;
      if (item.category === 'title') taskName = `[TITLE UNLOCKED] ${item.name}`;

      // فحص المخزون
      if (item.category === 'exclusive' || item.category === 'limited') {
        const { data: checkStock } = await supabase.from('system_requests')
          .select('hunter_name').eq('task_name', taskName).gte('created_at', firstDay);
          
        const currentClaimers = checkStock ? checkStock.map(c => c.hunter_name) : [];
        if (item.max_stock && currentClaimers.length >= item.max_stock) {
          playError(); toast.error('Sold Out!'); setIsProcessing(false); return;
        }
        if (currentClaimers.includes(player.name)) {
          playError(); toast.error('You already claimed this!'); setIsProcessing(false); return;
        }
      }

      const newGold = gold - item.price;
      let updatePayload: any = { gold: newGold };
      let newTitles = player.titles || [];

      if (item.category === 'title') {
        newTitles = [item.name, ...newTitles.filter((t: string) => t !== item.name)];
        updatePayload.titles = newTitles;
      }

      const { error: updateError } = await supabase.from('shadow_hunters').update(updatePayload).eq('name', player.name);
      if (updateError) throw updateError;
      
      const { error: reqError } = await supabase.from('system_requests').insert([{
        hunter_name: player.name, task_name: taskName, evidence: `Paid ${item.price} Gold.`, type: 'request', status: 'pending' 
      }]);
      if (reqError) throw reqError;

      playBuy();
      setGold(newGold);
      const updatedPlayer = { ...player, gold: newGold, titles: newTitles };
      setPlayer(updatedPlayer);
      localStorage.setItem('elite_system_active_session', JSON.stringify(updatedPlayer));

      toast.success(`Purchase Successful: ${item.name}!`, { style: { background: '#022c22', color: '#10b981', border: '1px solid #10b981' } });
      fetchShopData(); // Refresh UI to update stock

    } catch (err: any) {
      playError(); toast.error('Transaction Failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerConfirm = (item: any, type: string) => {
    playClick(); setConfirmModal({ show: true, item, type });
  };

  // 🚨 دوال الكوتش (Edit/Delete/Add) 🚨
  const openEditModal = (item?: any) => {
    playClick();
    if (item) {
      setFormData({ id: item.id, name: item.name, description: item.description || '', price: item.price, category: item.category, color: item.color, icon: item.icon, max_stock: item.max_stock ? String(item.max_stock) : '' });
    } else {
      setFormData({ id: '', name: '', description: '', price: 0, category: 'general', color: '#38bdf8', icon: 'Star', max_stock: '' });
    }
    setEditModal({ show: true, item: item || null });
  };

  const handleDeleteItem = async (e: any, id: string) => {
    e.stopPropagation();
    if (!window.confirm('متأكد إنك عايز تمسح المنتج ده نهائياً؟')) return;
    playError();
    try {
      await supabase.from('shop_items').delete().eq('id', id);
      toast.success('تم المسح بنجاح');
      setDbItems(dbItems.filter(i => i.id !== id));
    } catch (err) { toast.error('فشل المسح'); }
  };

  const handleSaveItem = async () => {
    setIsProcessing(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        color: formData.color,
        icon: formData.icon,
        max_stock: formData.max_stock ? Number(formData.max_stock) : null
      };

      if (formData.id) {
        // Update
        await supabase.from('shop_items').update(payload).eq('id', formData.id);
        toast.success('تم التعديل بنجاح');
      } else {
        // Insert
        await supabase.from('shop_items').insert([payload]);
        toast.success('تمت الإضافة بنجاح');
      }
      setEditModal({ show: false, item: null });
      fetchShopData();
    } catch (err) {
      toast.error('حدث خطأ أثناء الحفظ');
    }
    setIsProcessing(false);
  };

  const renderCoachControls = (item: any) => {
    if (!isCoachMode) return null;
    return (
      <CoachActions>
        <CoachBtn $color="#0ea5e9" onClick={(e) => { e.stopPropagation(); openEditModal(item); }}><Edit2 size={14} /></CoachBtn>
        <CoachBtn $color="#ef4444" onClick={(e) => handleDeleteItem(e, item.id)}><Trash2 size={14} /></CoachBtn>
      </CoachActions>
    );
  };

  // تفريغ الداتا حسب الأقسام
  const exclusiveItems = dbItems.filter(i => i.category === 'exclusive');
  const limitedItems = dbItems.filter(i => i.category === 'limited');
  const titleItems = dbItems.filter(i => i.category === 'title');
  const generalItems = dbItems.filter(i => i.category === 'general');

  return (
    <Container initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <Toaster position="top-center" theme="dark" />

      <Header>
        <Title><ShoppingCart size={24} color="#818cf8" /> ELITE VAULT</Title>
        <GoldDisplay><Gem size={18} color="#eab308" /> {gold}</GoldDisplay>
      </Header>

      {isCoachMode && (
        <AddItemBtn onClick={() => openEditModal()}><PlusCircle size={18} /> إضافة عنصر جديد للمتجر</AddItemBtn>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Syncing Vault Data...</div>
      ) : (
        <>
          {/* 1. SEASON EXCLUSIVE */}
          <SectionTitle $color="#eab308"><Flame size={18} /> SEASON EXCLUSIVE</SectionTitle>
          {exclusiveItems.map(item => {
            const itemClaims = claimsList.filter(c => c.task_name === `[EXCLUSIVE CLAIM] ${item.name}`);
            const claimers = itemClaims.map(c => c.hunter_name);
            const isSoldOut = item.max_stock ? claimers.length >= item.max_stock : false;
            const Icon = getIcon(item.icon);

            return (
              <ExclusiveCard key={item.id} $soldOut={isSoldOut} $color={item.color}>
                {renderCoachControls(item)}
                {item.max_stock && <ExclusiveBadge $color={item.color}>{item.max_stock}/{item.max_stock} SERVER</ExclusiveBadge>}
                
                {isSoldOut && (
                  <SoldOutOverlay>
                    <SoldOutText>SOLD OUT</SoldOutText>
                    {claimers.length > 0 && <ClaimerText>Claimed by:<br/>{claimers[0]}</ClaimerText>}
                  </SoldOutOverlay>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: isCoachMode ? 15 : 0 }}>
                  <IconWrapper $color={item.color} style={{ width: 70, height: 70, borderWidth: '2px' }}><Icon size={35} /></IconWrapper>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 5px 0', color: item.color, fontSize: '18px', fontWeight: '900' }}>{item.name}</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>{item.description}</p>
                  </div>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <BuyBtn $affordable={gold >= item.price && !isSoldOut} $color={item.color} disabled={gold < item.price || isSoldOut || isProcessing} onClick={() => triggerConfirm(item, 'exclusive')} style={{ width: '100%', padding: '15px', fontSize: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Gem size={16} /> {item.price} GOLD</span>
                  </BuyBtn>
                </div>
              </ExclusiveCard>
            );
          })}

          {/* 2. LIMITED CLINIC */}
          <SectionTitle $color="#10b981"><Activity size={18} /> ELITE CLINIC (LIMITED)</SectionTitle>
          {limitedItems.map(item => {
            const itemClaims = claimsList.filter(c => c.task_name === `[LIMITED CLAIM] ${item.name}`);
            const claimers = itemClaims.map(c => c.hunter_name);
            const isSoldOut = item.max_stock ? claimers.length >= item.max_stock : false;
            const playerHasIt = claimers.includes(player.name);
            const remaining = item.max_stock ? item.max_stock - claimers.length : '∞';
            const Icon = getIcon(item.icon);

            return (
              <ExclusiveCard key={item.id} $soldOut={isSoldOut || playerHasIt} $color={item.color}>
                {renderCoachControls(item)}
                {item.max_stock && <ExclusiveBadge $color={item.color}>{remaining}/{item.max_stock} SERVER</ExclusiveBadge>}
                
                {(isSoldOut || playerHasIt) && (
                  <SoldOutOverlay>
                    <SoldOutText>{playerHasIt ? 'CLAIMED' : 'SOLD OUT'}</SoldOutText>
                    {!playerHasIt && claimers.length > 0 && <ClaimerText>Claimed by:<br/>{claimers.join(' & ')}</ClaimerText>}
                  </SoldOutOverlay>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: isCoachMode ? 15 : 0 }}>
                  <IconWrapper $color={item.color} style={{ width: 60, height: 60, borderWidth: '2px' }}><Icon size={30} /></IconWrapper>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 5px 0', color: item.color, fontSize: '16px', fontWeight: '900' }}>{item.name}</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>{item.description}</p>
                  </div>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <BuyBtn $affordable={gold >= item.price && !isSoldOut && !playerHasIt} $color={item.color} disabled={gold < item.price || isSoldOut || playerHasIt || isProcessing} onClick={() => triggerConfirm(item, 'limited')} style={{ width: '100%', padding: '12px', fontSize: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Gem size={14} /> {item.price} GOLD</span>
                  </BuyBtn>
                </div>
              </ExclusiveCard>
            );
          })}

          {/* 3. TITLES VAULT */}
          <SectionTitle $color="#f43f5e"><Award size={18} /> ATHLETICS TITLES VAULT</SectionTitle>
          <TitlesGrid>
            {titleItems.map((item) => {
              const hasTitle = player?.titles?.includes(item.name);
              const Icon = getIcon(item.icon);
              return (
                <TitleCard key={item.id} $color={hasTitle ? '#334155' : item.color} style={{ opacity: hasTitle ? 0.5 : 1 }}>
                  {renderCoachControls(item)}
                  <Icon size={24} color={hasTitle ? '#64748b' : item.color} style={{ marginTop: isCoachMode ? 20 : 0 }} />
                  <div style={{ fontSize: '12px', fontWeight: '900', color: hasTitle ? '#94a3b8' : '#fff' }}>{item.name}</div>
                  <BuyButtonSmall $affordable={gold >= item.price && !hasTitle} $color={item.color} disabled={gold < item.price || hasTitle || isProcessing} onClick={() => triggerConfirm(item, 'title')}>
                    {hasTitle ? 'OWNED' : <><Gem size={12} /> {item.price}</>}
                  </BuyButtonSmall>
                </TitleCard>
              );
            })}
          </TitlesGrid>

          {/* 4. GENERAL STORE */}
          <SectionTitle $color="#38bdf8"><Package size={18} /> GENERAL STORE</SectionTitle>
          <ItemGrid>
            {generalItems.map((item) => {
              const Icon = getIcon(item.icon);
              return (
                <ItemCard key={item.id} style={{ flexDirection: isCoachMode ? 'column' : 'row', alignItems: isCoachMode ? 'stretch' : 'center', gap: isCoachMode ? 15 : 0 }}>
                  {renderCoachControls(item)}
                  <ItemInfo style={{ marginTop: isCoachMode ? 25 : 0 }}>
                    <IconWrapper $color={item.color}><Icon size={24} /></IconWrapper>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#fff', fontWeight: '900' }}>{item.name}</h4>
                      <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8' }}>{item.description}</p>
                    </div>
                  </ItemInfo>
                  <BuyBtn $affordable={gold >= item.price} disabled={gold < item.price || isProcessing} onClick={() => triggerConfirm(item, 'general')}>
                    <Gem size={14} /> {item.price}
                  </BuyBtn>
                </ItemCard>
              );
            })}
          </ItemGrid>
        </>
      )}

      {/* 🚨 CONFIRMATION MODAL 🚨 */}
      <AnimatePresence>
        {confirmModal.show && confirmModal.item && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent $color={confirmModal.item.color} initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}>
              <h2 style={{ color: confirmModal.item.color || '#eab308', marginTop: 0, fontSize: '18px', textTransform: 'uppercase' }}>CONFIRM PURCHASE</h2>
              <div style={{ fontSize: '14px', color: '#fff', marginBottom: '20px' }}>
                Are you sure you want to spend <strong style={{ color: '#eab308' }}>{confirmModal.item.price} Gold</strong> to acquire:
                <br/>
                <span style={{ color: confirmModal.item.color || '#38bdf8', fontSize: '18px', fontWeight: '900', display: 'block', marginTop: '10px' }}>{confirmModal.item.name}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={executePurchase} disabled={isProcessing} style={{ flex: 1, background: '#10b981', color: '#000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontFamily: 'Oxanium', cursor: 'pointer' }}>{isProcessing ? 'PROCESSING...' : 'CONFIRM'}</button>
                <button onClick={() => { playClick(); setConfirmModal({ show: false, item: null, type: '' }); }} disabled={isProcessing} style={{ flex: 1, background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontFamily: 'Oxanium', cursor: 'pointer' }}>CANCEL</button>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* 🚨 COACH ADD/EDIT MODAL 🚨 */}
      <AnimatePresence>
        {editModal.show && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ zIndex: 200 }}>
            <ModalContent $color="#0ea5e9" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <button onClick={() => setEditModal({ show: false, item: null })} style={{ position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
              <h2 style={{ color: '#0ea5e9', marginTop: 0, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Edit2 size={18} /> {formData.id ? 'تعديل المنتج' : 'منتج جديد'}
              </h2>

              <div style={{ textAlign: 'right', fontSize: '12px', marginBottom: 5, color: '#94a3b8' }}>القسم</div>
              <EditSelect value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="exclusive">Season Exclusive</option>
                <option value="limited">Elite Clinic (Limited)</option>
                <option value="title">Athletics Title</option>
                <option value="general">General Store</option>
              </EditSelect>

              <div style={{ textAlign: 'right', fontSize: '12px', marginBottom: 5, color: '#94a3b8' }}>اسم المنتج</div>
              <EditInput placeholder="مثال: Speed Demon" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />

              <div style={{ textAlign: 'right', fontSize: '12px', marginBottom: 5, color: '#94a3b8' }}>وصف المنتج</div>
              <EditTextarea placeholder="تفاصيل ومميزات المنتج..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ textAlign: 'right', fontSize: '12px', marginBottom: 5, color: '#94a3b8' }}>السعر (Gold)</div>
                  <EditInput type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div>
                  <div style={{ textAlign: 'right', fontSize: '12px', marginBottom: 5, color: '#94a3b8' }}>الكمية المتاحة (رقم أو سيبه فاضي)</div>
                  <EditInput type="number" placeholder="مثال: 2" value={formData.max_stock} onChange={(e) => setFormData({...formData, max_stock: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ textAlign: 'right', fontSize: '12px', marginBottom: 5, color: '#94a3b8' }}>اسم الأيقونة (إنجليزي)</div>
                  <EditInput placeholder="Star, Zap, Crown..." value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})} />
                </div>
                <div>
                  <div style={{ textAlign: 'right', fontSize: '12px', marginBottom: 5, color: '#94a3b8' }}>اللون (كود HEX)</div>
                  <EditInput placeholder="#38bdf8" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} />
                </div>
              </div>

              <button onClick={handleSaveItem} disabled={isProcessing} style={{ width: '100%', background: '#0ea5e9', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontFamily: 'Oxanium', cursor: 'pointer', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {isProcessing ? 'جاري الحفظ...' : <><Save size={16} /> حفظ التعديلات</>}
              </button>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

    </Container>
  );
};

export default Shop;