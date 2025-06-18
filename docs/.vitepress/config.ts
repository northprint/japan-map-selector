import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Japan Map Selector',
  description: '日本の都道府県・市区町村を選択できるインタラクティブな地図コンポーネント',
  base: '/japan-map-selector/',
  lang: 'ja',
  
  vite: {
    build: {
      rollupOptions: {
        external: ['/dist/index.es.js']
      }
    }
  },
  
  themeConfig: {
    nav: [
      { text: 'ガイド', link: '/guide/getting-started' },
      { text: 'API', link: '/api/core' },
      { text: '例', link: '/examples/basic' },
      { text: 'デモ', link: '/demo' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'はじめに',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'インストール', link: '/guide/installation' },
            { text: '基本的な使い方', link: '/guide/basic-usage' }
          ]
        },
        {
          text: '高度な使い方',
          items: [
            { text: 'カスタマイズ', link: '/guide/customization' },
            { text: 'テーマ', link: '/guide/themes' },
            { text: 'イベント処理', link: '/guide/events' },
            { text: '簡略化レベル', link: '/guide/simplification' },
            { text: 'ディフォルメ機能', link: '/guide/deformation' }
          ]
        },
        {
          text: 'その他',
          items: [
            { text: '出典表示について', link: '/guide/attribution' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API リファレンス',
          items: [
            { text: 'コアクラス', link: '/api/core' },
            { text: 'React コンポーネント', link: '/api/react' },
            { text: 'Svelte コンポーネント', link: '/api/svelte' },
            { text: '型定義', link: '/api/types' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '使用例',
          items: [
            { text: '基本的な例', link: '/examples/basic' },
            { text: 'React での使用', link: '/examples/react' },
            { text: 'Svelte での使用', link: '/examples/svelte' },
            { text: '選択時のアクション', link: '/examples/actions' },
            { text: 'カスタムテーマ', link: '/examples/custom-theme' },
            { text: 'データ可視化', link: '/examples/data-visualization' },
            { text: 'デモの実装方法', link: '/examples/demo-implementation' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/northprint/japan-map-selector' }
    ],

    footer: {
      message: 'MIT License',
      copyright: 'Copyright © 2025'
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          ja: {
            translations: {
              button: {
                buttonText: '検索',
                buttonAriaLabel: '検索'
              },
              modal: {
                noResultsText: '該当する結果が見つかりませんでした',
                resetButtonTitle: 'リセット',
                footer: {
                  selectText: '選択',
                  navigateText: 'ナビゲート'
                }
              }
            }
          }
        }
      }
    }
  }
})