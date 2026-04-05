import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import {
  Store as StoreIcon,
  Lock,
  Package,
  Shirt,
  Zap as Lightning,
  Flame,
  Box,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import useSound from 'use-sound';

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

const InfoBox = styled.div`
  background: rgba(0, 242, 255, 0.05);
  border: 1px solid #00f2ff;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 25px;
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.6;
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
`;

const PhysicalCard = styled(motion.div)<{ $color: string }>`
  background: #050a15;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,0.4);
  opacity: 0.85;
  transition: 0.3s;

  &:hover {
    opacity: 1;
    border-color: ${(props) => props.$color};
    box-shadow: 0 0 20px ${(props) => props.$color}20;
  }
`;

const IconContainer = styled.div<{ $color: string }>`
  background: ${(props) => props.$color}15;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  box-shadow: inset 0 0 15px ${(props) => props.$color}20;
`;

const ItemName = styled.h3`
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #fff;
`;

const ItemPrice = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 900;
  color: ${(props) => props.$color};
  margin-bottom: 15px;
`;

const ComingSoonOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  z-index: 10;
`;

const ComingSoonBadge = styled.div`
  background: #000;
  color: #00f2ff;
  border: 2px solid #00f2ff;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 2px;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.4);
  transform: rotate(-10deg);
`;

const PHYSICAL_GEAR = [
  {
    id: 'pg1',
    name: 'Monarch Spikes',
    desc: 'Track & Field Elite Spikes',
    price: 'EGP 1,850',
    color: '#00f2ff',
    icon: Lightning,
  },
  {
    id: 'pg2',
    name: 'Creatine Monohydrate',
    desc: '100% Pure - 60 Servings',
    price: 'EGP 750',
    color: '#a855f7',
    icon: Box,
  },
  {
    id: 'pg3',
    name: 'Shadow Compression',
    desc: 'Performance Shirt',
    price: 'EGP 450',
    color: '#ef4444',
    icon: Shirt,
  },
  {
    id: 'pg4',
    name: 'Recovery Care Package',
    desc: 'Tape, Rollers & Ice Packs',
    price: 'EGP 600',
    color: '#10b981',
    icon: Package,
  },
];

const Store = () => {
  const [playHover] = useSound('/sounds/hover.mp3', { volume: 0.3 });

  const handleInteract = () => {
    toast.error('Store is currently locked. Global shipping coming soon!', {
      style: {
        background: '#0b1120',
        border: '1px solid #00f2ff',
        color: '#00f2ff',
      },
    });
  };

  return (
    <Container>
      <Toaster position="top-center" theme="dark" />
      <Header>
        <h1
          style={{
            margin: 0,
            fontSize: '24px',
            color: '#00f2ff',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <StoreIcon size={28} /> REAL GEAR VAULT
        </h1>
        <div
          style={{
            fontSize: '11px',
            color: '#94a3b8',
            textAlign: 'right',
            fontWeight: 'bold',
          }}
        >
          PHYSICAL E-COMMERCE
          <br />
          MERCHANDISE
        </div>
      </Header>

      <InfoBox>
        <StoreIcon size={20} color="#00f2ff" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ color: '#00f2ff' }}>[ SYSTEM MERCHANT ]:</strong>{' '}
          "أهلاً بك في متجر الظلال الحقيقي. هنا لا نستخدم الذهب الوهمي، بل
          العملات الحقيقية لشراء معدات ومكملات رياضية حقيقية ستصل إلى باب منزلك.
          استعد للإطلاق قريباً!"
        </div>
      </InfoBox>

      <Grid>
        {PHYSICAL_GEAR.map((gear) => (
          <PhysicalCard
            key={gear.id}
            $color={gear.color}
            whileHover={{ translateY: -5 }}
            onClick={handleInteract}
            onMouseEnter={() => playHover()}
          >
            <ComingSoonOverlay>
              <Lock
                size={32}
                color="#94a3b8"
                style={{ marginBottom: '10px' }}
              />
              <ComingSoonBadge>COMING SOON</ComingSoonBadge>
            </ComingSoonOverlay>

            <IconContainer $color={gear.color}>
              <gear.icon size={28} color={gear.color} />
            </IconContainer>
            <ItemName>{gear.name}</ItemName>
            <div
              style={{
                fontSize: '11px',
                color: '#64748b',
                marginBottom: '10px',
              }}
            >
              {gear.desc}
            </div>
            <ItemPrice $color="#10b981">{gear.price}</ItemPrice>
          </PhysicalCard>
        ))}
      </Grid>
    </Container>
  );
};

export default Store;
