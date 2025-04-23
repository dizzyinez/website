import { defineConfig } from 'vitepress'
//import eslint from 'vite-plugin-eslint';
import { getSidebar } from 'vitepress-plugin-auto-sidebar';

// https://vitepress.dev/reference/site-config
export default defineConfig({
        title: "inez's little website",
        description: "personal website of dizzyinez",
        themeConfig: {
                // https://vitepress.dev/reference/default-theme-config
                nav: [
                        { text: 'Home', link: '/' },
                        { text: 'Blog', link: '/blog/favorie-albums-of-2024' },
                ],
                //outline: false,

                sidebar: getSidebar({ contentRoot: '/', contentDirs: ['blog'], collapsed: false, collapsible: false, useFrontmatter: true, ignoreIndexItem: true}),

                socialLinks: [
                        { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
                ]
        },
        markdown: {
                math: true
        },
        locales: {
                root: {
                        label: 'English',
                        lang: 'en'
                },
                jp: {
                        label: '日本語',
                        lang: 'jp',
                        title: 'イネーズの小さいサイト',
                        themeConfig: {
                                nav: [
                                        { text: 'ホーム', link: '/jp/' },
                                        { text: 'ブログ', link: '/jp/blog/' },
                                ],
                        }
                },
        },
        //plugins: [eslint()],
})
