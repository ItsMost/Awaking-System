import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Package, GripVertical, Crown, ShieldCheck, Info } from 'lucide-react';
// 🚨 تم إزالة DragEndEvent من هنا عشان ميضربش Error في Vite 🚨
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '../lib/supabase';
import { toast, Toaster } from 'sonner';

// ==========================================
// 1. المؤثرات الصوتية
// ==========================================
const playSound = (type: 'pickup' | 'drop') => {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'pickup') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    } else {
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    }
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
};

// ==========================================
// 2. التصميمات
// ==========================================
const Container = styled(motion.div)`
  padding: 20px; font-family: 'Oxanium', sans-serif; color: #fff; padding-bottom: 100px; max-width: 600px; margin: 0 auto;
`;

const Header = styled.div`
  background: linear-gradient(90deg, #1e1b4b 0%, #020617 100%);
  border: 1px solid #6366f1; border-radius: 16px; padding: 25px; margin-bottom: 25px;
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.2); display: flex; align-items: center; gap: 15px;
`;

const InfoBox = styled.div`
  background: rgba(14, 165, 233, 0.1); border: 1px dashed #0ea5e9; border-radius: 12px; padding: 15px; margin-bottom: 25px; display: flex; align-items: flex-start; gap: 10px; font-size: 12px; color: #bae6fd; line-height: 1.5;
`;

const ItemCard = styled.div<{ $isEquipped: boolean; $isDragging: boolean }>`
  background: ${(props) => props.$isEquipped ? 'linear-gradient(90deg, #0f172a 0%, #1e1b4b 100%)' : '#0f172a'};
  border: 2px solid ${(props) => props.$isEquipped ? '#a855f7' : '#1e293b'};
  border-radius: 12px; padding: 15px 20px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;
  box-shadow: ${(props) => props.$isEquipped ? '0 0 20px rgba(168, 85, 247, 0.4)' : '0 4px 6px rgba(0,0,0,0.3)'};
  opacity: ${(props) => props.$isDragging ? 0.5 : 1};
  transform: ${(props) => props.$isDragging ? 'scale(1.05)' : 'scale(1)'};
  transition: box-shadow 0.3s, border-color 0.3s;
  touch-action: none;
`;

const DragHandle = styled.div`
  cursor: grab; color: #64748b; display: flex; align-items: center; justify-content: center; padding: 5px;
  &:active { cursor: grabbing; color: #a855f7; }
`;

// ==========================================
// 3. مكون العنصر القابل للسحب
// ==========================================
const SortableItem = ({ id, title, index }: { id: string, title: string, index: number }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    position: 'relative' as 'relative',
  };

  const isEquipped = index === 0;

  return (
    <div ref={setNodeRef} style={style}>
      <ItemCard $isEquipped={isEquipped} $isDragging={isDragging}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: isEquipped ? '#a855f720' : '#1e293b', padding: '10px', borderRadius: '10px', color: isEquipped ? '#a855f7' : '#94a3b8' }}>
            {isEquipped ? <Crown size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: isEquipped ? '#fff' : '#cbd5e1', letterSpacing: '1px' }}>{title}</div>
            <div style={{ fontSize: '10px', color: isEquipped ? '#a855f7' : '#64748b', fontWeight: '900', marginTop: '4px', textTransform: 'uppercase' }}>
              {isEquipped ? '★ EQUIPPED TITLE' : 'IN INVENTORY'}
            </div>
          </div>
        </div>
        <DragHandle {...attributes} {...listeners}>
          <GripVertical size={24} />
        </DragHandle>
      </ItemCard>
    </div>
  );
};

// ==========================================
// 4. المكون الرئيسي للخزنة
// ==========================================
const Vault = ({ player, setPlayer }: any) => {
  const [titles, setTitles] = useState<string[]>(player?.titles?.length > 0 ? player.titles : ['Athlete']);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = () => {
    playSound('pickup');
  };

  // 🚨 تم استخدام any هنا بدل DragEndEvent عشان نحل المشكلة 🚨
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    playSound('drop');

    if (over && active.id !== over.id) {
      const oldIndex = titles.indexOf(String(active.id));
      const newIndex = titles.indexOf(String(over.id));
      const newArray = arrayMove(titles, oldIndex, newIndex);
      
      setTitles(newArray);
      
      setIsSaving(true);
      try {
        const { error } = await supabase.from('elite_players').update({ titles: newArray }).eq('name', player.name);
        if (error) throw error;
        
        const updatedPlayer = { ...player, titles: newArray };
        setPlayer(updatedPlayer);
        localStorage.setItem('elite_system_active_session', JSON.stringify(updatedPlayer));
        
        toast.success('Inventory Saved! The top title is now equipped.', { style: { background: '#020617', border: '1px solid #a855f7', color: '#a855f7' } });
      } catch (err) {
        toast.error('Failed to save inventory order.');
      }
      setIsSaving(false);
    }
  };

  return (
    <Container initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <Toaster position="top-center" theme="dark" />

      <Header>
        <Package size={40} color="#6366f1" />
        <div>
          <h1 style={{ margin: 0, color: '#818cf8', fontSize: '24px', fontWeight: '900', letterSpacing: '2px' }}>THE VAULT</h1>
          <div style={{ fontSize: '12px', color: '#a5b4fc', fontWeight: 'bold' }}>GEAR & TITLES INVENTORY</div>
        </div>
      </Header>

      <InfoBox>
        <Info size={20} style={{ flexShrink: 0 }} />
        <div>اسحب اللقب (Title) اللي عايز تستخدمه وحطه في <strong>المركز الأول (فوق)</strong> عشان يتم تجهيزه ويظهر تحت اسمك في قاعة الأساطير (Rank).</div>
      </InfoBox>

      {isSaving && <div style={{ textAlign: 'center', fontSize: '12px', color: '#a855f7', marginBottom: '10px' }}>Saving configuration...</div>}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={titles} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {titles.map((title, index) => (
              <SortableItem key={title} id={title} title={title} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

    </Container>
  );
};

export default Vault;