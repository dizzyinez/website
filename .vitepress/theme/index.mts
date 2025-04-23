import DefaultTheme from 'vitepress/theme-without-fonts'
import './custom.css'
import ArticleCard from "./components/ArticleCard.vue"
//import ArticleCard from ".vitepress/theme/components/ArticleCard.vue"
import { Theme } from 'vitepress';
//const components = import.meta.globEager('./components/*.vue');

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        app.component('ArticleCard', ArticleCard);
    }
} satisfies Theme
