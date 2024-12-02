<script setup lang="ts">
import FungiSim from './Fungus/FungiSim.vue'
import { FixedParams } from './Fungus/scripts/FixedParams';

const params = new FixedParams();

</script>

<template>
        <FungiSim :fixedParams="params"/>
</template>

<style>
html,
body {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
}

#app {
        height: 100%;
        width: 100%;
}
</style>
