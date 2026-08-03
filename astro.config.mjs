// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import astroI18next from 'astro-i18next';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';
// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: vercel(),
  site: 'https://code-by-nayru.vercel.app',
  integrations: [
    tailwind(),
    react(),
    astroI18next({
      defaultLocale: 'fr',
      locales: ['fr', 'en'],
      i18next: {
        debug: false,
        initImmediate: false,
        backend: {
          loadPath: './src/i18n/{{lng}}.json',
        },
      },
      i18nextPlugins: { fsBackend: 'i18next-fs-backend' },
      routes: {
        fr: {
          prefixDefaultLocale: true,
        },
        en: {
          prefixDefaultLocale: true,
        },
      },
    })
  ],
  vite: {
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    optimizeDeps: {
      include: ['@astrojs/astro']
    },
    build: {
      minify: true,
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'i18n-vendor': ['i18next', 'i18next-fs-backend']
          }
        }
      }
    }
  },
  compressHTML: true
});
