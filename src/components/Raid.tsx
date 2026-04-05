import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Skull, Target, Sword, AlertCircle } from 'lucide-react';

const Raid = ({ player, setPlayer, onBack }: any) => {
  // دماء البوس (Kasaka)
  const maxBossHP = 10000;
  const [bossHP, setBossHP] = useState(9600);
  const [isAttacking, setIsAttacking] = useState(false);
  const [playerDamage, setPlayerDamage] = useState(220); // دمجك الحالي زي الصورة

  // قائمة المساهمين (Leaderboard) زي الصورة بالظبط
  const initialContributors = [
    { id: 1, name: 'Most', dmg: playerDamage, rank: 1, isPlayer: true },
    { id: 2, name: 'Mohamed Salah', dmg: 160, rank: 2, isPlayer: false },
    { id: 3, name: 'Mahmoud (Horas)', dmg: 20, rank: 3, isPlayer: false },
    { id: 4, name: 'Most.1', dmg: 0, rank: 4, isPlayer: false },
    { id: 5, name: 'El saeed', dmg: 0, rank: 5, isPlayer: false },
    { id: 6, name: 'Ramez', dmg: 0, rank: 6, isPlayer: false },
    { id: 7, name: '[Coach] most', dmg: 0, rank: 7, isPlayer: false },
    { id: 8, name: 'اباجوره Deep', dmg: 0, rank: 8, isPlayer: false },
    { id: 9, name: 'Rayan', dmg: 0, rank: 9, isPlayer: false },
    { id: 10, name: 'Salah', dmg: 0, rank: 10, isPlayer: false },
    { id: 11, name: 'Lamona 🍋', dmg: 0, rank: 11, isPlayer: false },
  ];

  // تحديث قائمة المساهمين بناءً على دمجك الجديد
  const contributors = initialContributors.map(c => 
    c.isPlayer ? { ...c, dmg: playerDamage } : c
  ).sort((a, b) => b.dmg - a.dmg); // ترتيب تنازلي حسب الدمج

  // دالة ضرب البوس
  const handleAttack = () => {
    if (player.coins >= 10 && bossHP > 0) {
      // خصم 10 جولد كثمن للضربة
      setPlayer({ ...player, coins: player.coins - 10 });
      
      // دمج عشوائي بين 10 و 50
      const damageDealt = Math.floor(Math.random() * 41) + 10;
      
      // أنيميشن الاهتزاز
      setIsAttacking(true);
      setTimeout(() => setIsAttacking(false), 400);

      // تحديث دماء البوس ودمج اللاعب
      setBossHP(prev => Math.max(0, prev - damageDealt));
      setPlayerDamage(prev => prev + damageDealt);
    } else if (player.coins < 10) {
      alert("[SYSTEM]: Not enough Gold to launch an attack. Complete quests to earn Gold.");
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className={isAttacking ? "animate-shake" : ""} style={{ backgroundColor: '#050a15', minHeight: '100vh', padding: '20px', fontFamily: 'Orbitron, sans-serif', color: 'white', paddingBottom: '50px' }}>
      
      {/* زر الرجوع */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ color: '#a855f7', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
          {'<'} SYSTEM DASHBOARD
        </button>
        <div style={{ backgroundColor: '#1a1500', border: '1px solid #ca8a04', padding: '5px 15px', borderRadius: '8px', color: '#eab308', fontSize: '12px', fontWeight: 'bold' }}>
          💰 {player.coins}G
        </div>
      </div>

      {/* --- كارت البوس (BLUE VENOM FANG KASAKA) --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ 
          backgroundColor: '#160b24', 
          border: '2px solid #a855f7', 
          borderRadius: '15px', 
          padding: '30px 20px', 
          textAlign: 'center', 
          marginBottom: '30px',
          boxShadow: '0 0 30px rgba(168, 85, 247, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* خلفية بتأثير الوميض */}
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1] }} 
          transition={{ duration: 3, repeat: Infinity }}
          style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)', zIndex: 0 }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ margin: 0, fontSize: '10px', color: '#d8b4fe', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            GLOBAL SERVER BOSS
          </p>
          <h1 style={{ margin: '15px 0', fontSize: '24px', color: '#fff', letterSpacing: '2px', textShadow: '0 0 15px #a855f7, 0 0 30px #a855f7' }}>
            BLUE VENOM FANG<br/>KASAKA
          </h1>

          {/* شريط دماء البوس */}
          <div style={{ marginTop: '25px', position: 'relative' }}>
            <div style={{ width: '100%', height: '24px', backgroundColor: '#000', border: '2px solid #4c1d95', borderRadius: '12px', overflow: 'hidden' }}>
              <motion.div 
                animate={{ width: `${(bossHP / maxBossHP) * 100}%` }}
                transition={{ duration: 0.5 }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #d946ef, #ef4444)', boxShadow: '0 0 15px #ef4444' }}
              />
            </div>
            <p style={{ margin: 0, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '12px', fontWeight: 'bold', color: '#fff', textShadow: '0 0 5px #000' }}>
              {bossHP.toLocaleString()} / {maxBossHP.toLocaleString()} HP
            </p>
          </div>

          <p style={{ margin: '15px 0 0 0', fontSize: '10px', color: '#94a3b8' }}>Boss Level: 1 | XP Contributions deal damage.</p>

          {/* زرار الهجوم الفعلي */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAttack}
            style={{ marginTop: '20px', padding: '12px 25px', backgroundColor: '#7f1d1d', border: '1px solid #ef4444', color: '#fff', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%' }}
          >
            <Sword size={18} /> STRIKE KASAKA (-10 Gold)
          </motion.button>
        </div>
      </motion.div>

      {/* --- قائمة المساهمين (Leaderboard) --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Target size={18} color="#a855f7" />
        <h2 style={{ fontSize: '12px', margin: 0, color: '#d8b4fe', letterSpacing: '1px', fontWeight: 'bold' }}>TOP CONTRIBUTORS (DAMAGE DEALT)</h2>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {contributors.map((user, index) => {
          const isTop3 = index < 3;
          const rankColor = index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : '#64748b';
          
          return (
            <motion.div 
              key={user.id}
              variants={itemVariants}
              style={{ 
                backgroundColor: user.isPlayer ? '#1e1b4b' : '#0a101f', 
                border: '1px solid',
                borderColor: user.isPlayer ? '#4c1d95' : '#1e293b', 
                padding: '15px', 
                borderRadius: '10px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '14px', fontWeight: '900', color: rankColor }}>
                  #{index + 1}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: user.isPlayer ? '#a855f7' : '#f8fafc' }}>
                  {user.name} {user.isPlayer ? '(YOU)' : ''}
                </span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: isTop3 ? '#d8b4fe' : '#94a3b8' }}>
                {user.dmg} DMG
              </span>
            </motion.div>
          );
        })}
      </motion.div>

    </div>
  );
};

export default Raid;