<script setup lang="ts">
import TheWelcome from "../components/TheWelcome.vue";
</script>

<template>
        <main>
                <img class="headerimg" src="../assets/MountainClose.jpg">
                <p :style="{'width' : '60%', 'margin' : 'auto'}">
                Howdy! I'm Inez (she/her) and I like math and music and lots more! Expect updates here soon :3c
                </p>
        </main>
</template>

<style>
.headerimg {
        display: block;
        margin: auto;
        width: 60%;
        height: auto;
}
</style>
