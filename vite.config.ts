import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // بيحدث الأبلكيشن لوحده لما يلقط نت
      devOptions: {
        enabled: true // عشان يشتغل معاك الأوفلاين وإنت لسه بتبرمج وتجرب
      },
      manifest: {
        name: 'Elite System',
        short_name: 'Elite',
        description: 'Elite Performance Hub & Tracker',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone', // بيخفي شريط المتصفح ويخليه تطبيق كامل
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/138/138246.png', // دي أيقونة التاج مؤقتاً
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/138/138246.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
});