<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import HelloWorld from "./components/HelloWorld.vue";
</script>

<template>
        <header>
                <!-- <HelloWorld msg="Welcome to Inez's gay little website" /> -->
                <div class="wrapper">
                <nav>
                        <RouterLink to="/">Home</RouterLink>
                        <RouterLink to="/blog">Blog</RouterLink>
                        <!-- <RouterLink to="/test">Test</RouterLink> -->
                        <RouterLink to="/fungi">Fungi</RouterLink>
                </nav>
                </div>
        </header>
        <br />
        <RouterView/>
</template>

<style scoped>
:root {
        flex: 1;
}

header {
        display: block;
        line-height: 1.5;
        max-height: 100vh;
}

.logo {
        display: block;
        margin: 0 auto 2rem;
}

nav {
        width: 100%;
        font-size: 16px;
        text-align: right;
        margin-top: 0.5rem; 
}

nav a.router-link-exact-active {
        color: var(--color-text);
}

nav a.router-link-exact-active:hover {
        background-color: transparent;
}

nav a {
        display: inline-block;
        padding: 0 1rem;
        border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
        border: 0;
}

/*
@media (min-width: 1024px) {
        header {
                display: block;
                place-items: center;
                padding-right: calc(var(--section-gap) / 2);
        }

        .logo {
                margin: 0 2rem 0 0;
        }

        header .wrapper {
                display: flex;
                place-items: flex-start;
                flex-wrap: wrap;
        }

        nav {
                text-align: left;
                margin-left: -1rem;
                font-size: 1rem;

                padding: 1rem 0;
                margin-top: 1rem;
        }
}
*/
</style>
