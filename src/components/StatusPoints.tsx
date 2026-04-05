import React, { useState } from 'react';

const StatusPoints = ({ player, onBack }: any) => {
  const [points, setPoints] = useState(5); // نقاط مجانية عند البداية
  const [stats, setStats] = useState({ str: 10, agi: 10, vit: 10 });

  const upgrade = (stat: keyof typeof stats) => {
    if (points > 0) {
      setStats({ ...stats, [stat]: stats[stat] + 1 });
      setPoints(points - 1);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', minHeight: '100vh', color: 'white' }}>
      <button onClick={onBack} style={{ color: '#00f2ff', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '30px' }}>← BACK_TO_SYSTEM</button>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ letterSpacing: '5px', fontSize: '24px', margin: 0 }}>STAT_POINTS</h1>
        <p style={{ color: '#00f2ff', fontSize: '12px' }}>AVAILABLE POINTS: {points}</p>
      </div>

      {['str', 'agi', 'vit'].map((s) => (
        <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0c10', padding: '20px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #1a1d23' }}>
          <div>
            <h3 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>{s}</h3>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#00f2ff' }}>{stats[s as keyof typeof stats]}</span>
          </div>
          <button 
            onClick={() => upgrade(s as keyof typeof stats)}
            style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #00f2ff', background: 'transparent', color: '#00f2ff', fontSize: '20px', cursor: 'pointer', display: points > 0 ? 'block' : 'none' }}
          >
            +
          </button>
        </div>
      ))}

      {points === 0 && (
        <p style={{ textAlign: 'center', color: '#444', fontSize: '10px', marginTop: '20px' }}>
          [SYSTEM: NO POINTS REMAINING. LEVEL UP TO EARN MORE]
        </p>
      )}
    </div>
  );
};

export default StatusPoints;