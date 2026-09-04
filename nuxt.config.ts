// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-10',

  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@nuxt/ui',
  ],

  css: [
    '~/assets/css/main.css',
  ],

  app: {
    head: {
      title: 'Philanthroffee — Order',
      htmlAttrs: { lang: 'id' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Pesan kopi favoritmu di Philanthroffee. Scan, pilih, bayar, selesai.' },
        { property: 'og:title', content: 'Philanthroffee — Order' },
        { property: 'og:description', content: 'Pesan kopi favoritmu di Philanthroffee.' },
        { property: 'og:type', content: 'website' },
        { name: 'theme-color', content: '#1a1a2e' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700&display=swap' },
      ],
    },
  },

  runtimeConfig: {
    // Server-only (private)
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY || '',
    midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',

    // Public (exposed to client)
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
      midtransClientKey: process.env.MIDTRANS_CLIENT_KEY || '',
      midtransSnapUrl: process.env.MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js',
      appUrl: process.env.APP_URL || 'http://localhost:3000',
    },
  },

  devtools: { enabled: true },
})
