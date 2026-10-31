import { defineConfig, envField } from "astro/config";
import sitemap from "@astrojs/sitemap";
import astroI18next from "astro-i18next";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "static",
  session: false,
  adapter: cloudflare({
    imageService: "passthrough",
    prerenderEnvironment: "node",
  }),
  site: "https://www.lyvath.dev",
  env: {
    schema: {
      RESEND_API_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },
  integrations: [
    astroI18next({
      defaultLocale: "en",
      locales: ["en", "fr"],
      i18next: {
        debug: false,
        initImmediate: false,
        backend: {
          loadPath: "./src/i18n/{{lng}}.json",
        },
      },
      i18nextPlugins: { fsBackend: "i18next-fs-backend" },
      routes: {
        en: {
          prefixDefaultLocale: true,
        },
        fr: {
          prefixDefaultLocale: false,
        },
      },
    }),
    sitemap(),
  ],
  vite: {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    build: {
      minify: true,
      cssMinify: true,
    },
  },
  compressHTML: true,
});
