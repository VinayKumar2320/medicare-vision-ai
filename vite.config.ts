import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 4000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.MAILJET_API_KEY': JSON.stringify(env.MAILJET_API_KEY),
        'process.env.MAILJET_SECRET_KEY': JSON.stringify(env.MAILJET_SECRET_KEY || env.MAILJET_API_KEY),
        'process.env.MAILJET_FROM_EMAIL': JSON.stringify(env.MAILJET_FROM_EMAIL || 'noreply@medicarevisionai.com')
      },
      envPrefix: 'VITE_',
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
