import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@supabase')) return 'vendor-supabase';
              if (id.includes('lucide-react')) return 'vendor-lucide';
              if (id.includes('react-router-dom') || id.includes('@remix-run')) return 'vendor-router';
              if (id.includes('motion')) return 'vendor-motion';
              if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) return 'vendor-forms';
              if (id.includes('@capacitor')) return 'vendor-capacitor';
              return 'vendor-core';
            }
          },
        },
      },
    },
  };
});
