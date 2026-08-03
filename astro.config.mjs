// @ts-check
import { defineConfig } from 'astro/config';
import astroI18next from 'astro-i18next';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: vercel(),
  site: 'https://code-by-nayru.vercel.app',
  integrations: [
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
    build: {
      minify: true,
      cssMinify: true,
    }
  },
  compressHTML: true
});
