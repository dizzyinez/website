<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import * as THREE from 'three'
import Simulation from './Simulation.vue';
import { FixedParams } from './scripts/FixedParams';

let props = defineProps({
        fixedParams: {type: FixedParams, default: new FixedParams()},
});

let renderer = new THREE.WebGLRenderer({
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
        antialias: false,
        alpha: true,
        premultipliedAlpha: false,
        stencil: false,
});

//renderer.autoClear = false;
</script>

<template>
        <TresCanvas :renderer="renderer"> 
        <TresPerspectiveCamera :position="[1,1,1]"/>
                <Simulation :fixedParams="props.fixedParams"/>
        </TresCanvas>
</template>
