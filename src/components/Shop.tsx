import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { Toaster, toast } from 'sonner';
import useSound from 'use-sound';
import {
  ShoppingCart,
  Heart,
  ShieldAlert,
  Pizza,
  Coins,
  Zap,
  Crown,
  Wind,
  Footprints,
  Flame,
  Dumbbell,
  X,
  Store,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';

// ==========================================
// 1. المولد الصوتي المدمج
// ==========================================
const playShopSound = (type: 'buy' | 'error' | 'open') => {
  const AudioContext =
    window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  if (type === 'buy') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } else if (type === 'open') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } else {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
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
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
`;

const Title = styled.h1`
  font-size: 24px;
  margin: 0;
  color: #eab308;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 0 10px rgba(234, 179, 8, 0.4);
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const GoldDisplay = styled.div`
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid #eab308;
  color: #facc15;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 20px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 0 15px rgba(234, 179, 8, 0.3);
`;

const SectionTitle = styled.div<{ $isPurple?: boolean }>`
  width: 100%;
  font-size: 14px;
  color: ${(props) => (props.$isPurple ? '#c084fc' : '#eab308')};
  font-weight: bold;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 30px 0 15px 0;
  text-transform: uppercase;
  border-bottom: 1px solid ${(props) =>
    props.$isPurple ? '#581c87' : '#ca8a04'};
  padding-bottom: 10px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
`;

const ItemCard = styled(motion.div)<{ $color: string; $canAfford: boolean }>`
  background: #0b1120;
  border: 1px solid ${(props) => (props.$canAfford ? props.$color : '#334155')};
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: ${(props) =>
    props.$canAfford ? `0 0 15px ${props.$color}20` : 'none'};
  opacity: ${(props) => (props.$canAfford ? 1 : 0.6)};
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${(props) =>
      props.$canAfford ? `0 0 20px ${props.$color}40` : 'none'};
    transform: ${(props) => (props.$canAfford ? 'translateY(-2px)' : 'none')};
  }
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const IconBox = styled.div<{ $color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${(props) => `${props.$color}15`};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.$color};
  border: 1px solid ${(props) => props.$color}50;
`;

const BuyButton = styled(motion.button)<{
  $canAfford: boolean;
  $color: string;
  $isOwned?: boolean;
}>`
  background: ${(props) =>
    props.$isOwned
      ? '#022c22'
      : props.$canAfford
      ? `${props.$color}20`
      : '#0f172a'};
  border: 1px solid ${(props) =>
    props.$isOwned ? '#10b981' : props.$canAfford ? props.$color : '#334155'};
  color: ${(props) =>
    props.$isOwned ? '#10b981' : props.$canAfford ? props.$color : '#64748b'};
  padding: 10px 20px;
  border-radius: 10px;
  font-family: 'Oxanium', sans-serif;
  font-weight: 900;
  font-size: 14px;
  cursor: ${(props) =>
    props.$canAfford && !props.$isOwned ? 'pointer' : 'not-allowed'};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.3s;
  min-width: 90px;
  justify-content: center;

  &:hover {
    background: ${(props) =>
      props.$canAfford && !props.$isOwned
        ? props.$color
        : props.$isOwned
        ? '#022c22'
        : '#0f172a'};
    color: ${(props) =>
      props.$canAfford && !props.$isOwned
        ? '#000'
        : props.$isOwned
        ? '#10b981'
        : '#64748b'};
  }
`;

// Modal Styles
const ModalOverlay = styled(motion.div)`
  position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
  z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px;
`;
const ModalContent = styled(motion.div)`
  background: #0b1120; border: 2px solid #a855f7; border-radius: 20px; padding: 25px;
  width: 100%; max-width: 500px; position: relative; max-height: 85vh; overflow-y: auto;
  box-shadow: 0 0 30px rgba(168, 85, 247, 0.3);
  &::-webkit-scrollbar { width: 5px; } &::-webkit-scrollbar-thumb { background: #a855f7; border-radius: 5px; }
`;
const CloseBtn = styled.button`
  position: absolute; top: 15px; right: 15px; background: none; border: none; color: #94a3b8; cursor: pointer; transition: 0.3s; &:hover { color: #fff; transform: scale(1.1); }
`;

// ==========================================
// 3. قاعدة بيانات المتجر (Items & Athletics Titles)
// ==========================================
const SHOP_ITEMS = [
  {
    id: 'hp_potion',
    name: 'HP Recovery Potion',
    desc: 'Restores 20 Health Points (HP) instantly. No request needed.',
    price: 150,
    icon: Heart,
    color: '#10b981',
    needsRequest: false,
  },
  {
    id: 'cheat_meal',
    name: 'Cheat Meal Pass',
    desc: 'Request a cheat meal. Approval sent to Coach.',
    price: 2500,
    icon: Pizza,
    color: '#f97316',
    needsRequest: true,
  },
  {
    id: 'penalty_pardon',
    name: 'Penalty Pardon',
    desc: 'Clear active penalty. Coach will be notified.',
    price: 800,
    icon: ShieldAlert,
    color: '#ef4444',
    needsRequest: true,
  },
];

// 🚨 ألقاب ألعاب القوى المربوطة بتغيير الألوان 🚨
const ATHLETICS_TITLES = [
  {
    name: 'Air Walker',
    desc: 'Master of Jumps. Grants a majestic Blue aura.',
    price: 3000,
    icon: Wind,
    color: '#38bdf8', // Blue
  },
  {
    name: 'Speed Lightning',
    desc: 'Master of Sprints. Grants an electric Yellow aura.',
    price: 4000,
    icon: Zap,
    color: '#eab308', // Yellow
  },
  {
    name: 'Barbell Titan',
    desc: 'Master of Throws & Strength. Grants a Crimson aura.',
    price: 5000,
    icon: Dumbbell,
    color: '#ef4444', // Red
  },
  {
    name: 'Flame Sprinter',
    desc: 'Unstoppable endurance. Grants a blazing Orange aura.',
    price: 6000,
    icon: Flame,
    color: '#f97316', // Orange
  },
  {
    name: 'Track King',
    desc: 'The Ultimate Athletics Legend. Grants a Golden aura.',
    price: 15000,
    icon: Crown,
    color: '#f59e0b', // Gold
  },
];

// ==========================================
// 4. المكون الرئيسي (Shop)
// ==========================================
const Shop = ({ player, setPlayer }: any) => {
  const currentPlayer = player || {
    name: 'Hunter',
    gold: 0,
    hp: 100,
    activePenalty: false,
    titles: ['Newbie Hunter'],
  };
  const playerTitles = currentPlayer.titles || ['Newbie Hunter'];

  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [playHover] = useSound('/sounds/hover.mp3', { volume: 0.3 });

  // 🛒 شراء الأدوات العادية (جرعة، وجبة، عفو)
  const handleBuyItem = async (item: any) => {
    if (currentPlayer.gold >= item.price) {
      let newGold = currentPlayer.gold - item.price;
      let newHp = currentPlayer.hp ?? 100;
      let newPenaltyStatus = currentPlayer.activePenalty;

      // لو الأداة محتاجة ريكويست للكوتش
      if (item.needsRequest) {
        if (item.id === 'penalty_pardon') {
          if (!newPenaltyStatus) {
            playShopSound('error');
            toast.error(
              '[SYSTEM]: You do not have an active penalty to pardon.',
              {
                style: {
                  background: '#020617',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                },
              }
            );
            return;
          }
          newPenaltyStatus = false;
        }

        try {
          await supabase.from('system_requests').insert([
            {
              hunter_name: currentPlayer.name,
              task_name: `[SHOP ITEM] ${item.name}`,
              evidence: `Paid ${item.price} Gold for this VIP Request.`,
              type: 'shop_order',
              status: 'pending',
            },
          ]);

          playShopSound('buy');
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: [item.color, '#ffffff'],
          });
          toast.success(
            `[REQUEST SENT]: The Coach has been notified of your purchase: ${item.name}`,
            {
              style: {
                background: '#020617',
                border: `1px solid ${item.color}`,
                color: item.color,
                fontWeight: 'bold',
              },
            }
          );

          const dbUpdates = { gold: newGold, active_penalty: newPenaltyStatus };
          await supabase
            .from('shadow_hunters')
            .update(dbUpdates)
            .eq('name', currentPlayer.name);
          if (setPlayer) setPlayer({ ...currentPlayer, ...dbUpdates });
        } catch (err) {
          toast.error('Failed to connect to server.');
        }
      } else {
        // أدوات الاستخدام الفوري (الـ HP Potion)
        if (item.id === 'hp_potion') {
          if (newHp >= 100) {
            playShopSound('error');
            toast.error('[SYSTEM]: Your HP is already full.', {
              style: {
                background: '#020617',
                border: '1px solid #ef4444',
                color: '#ef4444',
              },
            });
            return;
          }
          newHp = Math.min(100, newHp + 20); // ترجع 20 HP
        }

        try {
          const dbUpdates = { gold: newGold, hp: newHp };
          await supabase
            .from('shadow_hunters')
            .update(dbUpdates)
            .eq('name', currentPlayer.name);
          if (setPlayer) setPlayer({ ...currentPlayer, ...dbUpdates });

          playShopSound('buy');
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: [item.color, '#ffffff'],
          });
          toast.success(`[SYSTEM TRANSACTION]: Purchased ${item.name}!`, {
            style: {
              background: '#020617',
              border: `1px solid ${item.color}`,
              color: item.color,
              fontWeight: 'bold',
            },
          });
        } catch (err) {
          toast.error('Failed to update stats.');
        }
      }
    } else {
      playShopSound('error');
      toast.error(`[SYSTEM ERROR]: Insufficient Gold for ${item.name}.`, {
        style: {
          background: '#020617',
          border: '1px solid #ef4444',
          color: '#ef4444',
          fontWeight: 'bold',
        },
      });
    }
  };

  // 👑 شراء الألقاب من داخل الخزنة السرية
  const handleBuyTitle = async (titleItem: any) => {
    if (playerTitles.includes(titleItem.name)) {
      playShopSound('error');
      toast.error(`[SYSTEM]: You already own the ${titleItem.name} title.`, {
        style: {
          background: '#020617',
          border: '1px solid #eab308',
          color: '#eab308',
        },
      });
      return;
    }

    if (currentPlayer.gold >= titleItem.price) {
      let newGold = currentPlayer.gold - titleItem.price;
      // اللقب الجديد بيتحط في أول المصفوفة عشان يتفعل أوتوماتيك ويغير اللون
      let newTitles = [
        titleItem.name,
        ...playerTitles.filter((t: string) => t !== titleItem.name),
      ];

      try {
        await supabase
          .from('shadow_hunters')
          .update({ gold: newGold, titles: newTitles })
          .eq('name', currentPlayer.name);
        if (setPlayer)
          setPlayer({ ...currentPlayer, gold: newGold, titles: newTitles });

        playShopSound('buy');
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: [titleItem.color, '#eab308', '#ffffff'],
        });
        toast.success(
          `[TITLE UNLOCKED]: You are now known as ${titleItem.name}!`,
          {
            style: {
              background: '#020617',
              border: `2px solid ${titleItem.color}`,
              color: titleItem.color,
              fontWeight: 'bold',
              fontSize: '15px',
            },
          }
        );
        setIsTitleModalOpen(false);
      } catch (err) {
        toast.error('Failed to unlock title.');
      }
    } else {
      playShopSound('error');
      toast.error(`[SYSTEM ERROR]: Insufficient Gold for ${titleItem.name}.`, {
        style: {
          background: '#020617',
          border: '1px solid #ef4444',
          color: '#ef4444',
          fontWeight: 'bold',
        },
      });
    }
  };

  return (
    <Container>
      <Toaster position="top-center" theme="dark" />

      <Header>
        <Title>
          <ShoppingCart size={28} color="#eab308" />
          SYSTEM SHOP
        </Title>
        <GoldDisplay>
          <Coins size={24} />
          {currentPlayer.gold}
        </GoldDisplay>
      </Header>

      {/* قسم الأدوات العادية */}
      <SectionTitle>
        <Zap size={18} /> CONSUMABLES & SYSTEM REQUESTS
      </SectionTitle>

      <Grid>
        {SHOP_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const canAfford = currentPlayer.gold >= item.price;

          return (
            <ItemCard
              key={item.id}
              $color={item.color}
              $canAfford={canAfford}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: canAfford ? 1 : 0.6, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => playHover()}
            >
              <ItemInfo>
                <IconBox $color={item.color}>
                  <Icon size={24} />
                </IconBox>
                <div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: '900',
                      color: '#fff',
                      marginBottom: '4px',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#94a3b8',
                      maxWidth: '200px',
                      lineHeight: '1.4',
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              </ItemInfo>

              <BuyButton
                $color={item.color}
                $canAfford={canAfford}
                onClick={() => handleBuyItem(item)}
                whileTap={canAfford ? { scale: 0.95 } : {}}
              >
                {item.price} <Coins size={14} />
              </BuyButton>
            </ItemCard>
          );
        })}
      </Grid>

      {/* قسم الألقاب المجمع */}
      <SectionTitle $isPurple>
        <Crown size={18} /> THE ELITE VAULT
      </SectionTitle>

      <ItemCard
        $color="#a855f7"
        $canAfford={true}
        onClick={() => {
          playShopSound('open');
          setIsTitleModalOpen(true);
        }}
        whileTap={{ scale: 0.98 }}
        style={{
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0b1120 100%)',
          border: '1px solid #a855f7',
        }}
      >
        <ItemInfo>
          <IconBox $color="#a855f7">
            <Store size={24} />
          </IconBox>
          <div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: '900',
                color: '#c084fc',
                marginBottom: '4px',
                letterSpacing: '1px',
              }}
            >
              ATHLETICS TITLES & AURAS
            </div>
            <div
              style={{
                fontSize: '11px',
                color: '#94a3b8',
                maxWidth: '220px',
                lineHeight: '1.4',
              }}
            >
              Browse the vault to unlock legendary track and field titles that
              change your system aura color.
            </div>
          </div>
        </ItemInfo>
        <div
          style={{
            fontSize: '14px',
            fontWeight: '900',
            color: '#a855f7',
            background: '#a855f720',
            padding: '10px 15px',
            borderRadius: '8px',
          }}
        >
          OPEN VAULT
        </div>
      </ItemCard>

      {/* نافذة الألقاب المنبثقة */}
      <AnimatePresence>
        {isTitleModalOpen && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalContent
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <CloseBtn onClick={() => setIsTitleModalOpen(false)}>
                <X size={24} />
              </CloseBtn>

              <h2
                style={{
                  color: '#c084fc',
                  margin: '0 0 20px 0',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textTransform: 'uppercase',
                }}
              >
                <Crown size={24} /> THE ELITE VAULT
              </h2>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px',
                }}
              >
                {ATHLETICS_TITLES.map((titleItem, index) => {
                  const Icon = titleItem.icon;
                  const isOwned = playerTitles.includes(titleItem.name);
                  const canAfford = currentPlayer.gold >= titleItem.price;

                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#020617',
                        padding: '15px',
                        borderRadius: '12px',
                        border: `1px solid ${isOwned ? '#10b981' : '#1e293b'}`,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                        }}
                      >
                        <IconBox
                          $color={isOwned ? '#10b981' : titleItem.color}
                          style={{ width: 45, height: 45 }}
                        >
                          <Icon size={20} />
                        </IconBox>
                        <div>
                          <div
                            style={{
                              fontSize: '15px',
                              fontWeight: 'bold',
                              color: isOwned ? '#10b981' : '#fff',
                            }}
                          >
                            {titleItem.name}
                          </div>
                          <div
                            style={{
                              fontSize: '10px',
                              color: '#64748b',
                              maxWidth: '180px',
                            }}
                          >
                            {titleItem.desc}
                          </div>
                        </div>
                      </div>

                      <BuyButton
                        $color={titleItem.color}
                        $canAfford={canAfford || isOwned}
                        $isOwned={isOwned}
                        onClick={() => handleBuyTitle(titleItem)}
                        whileTap={canAfford && !isOwned ? { scale: 0.95 } : {}}
                      >
                        {isOwned ? (
                          'OWNED'
                        ) : (
                          <>
                            {titleItem.price} <Coins size={14} />
                          </>
                        )}
                      </BuyButton>
                    </div>
                  );
                })}
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default Shop;
