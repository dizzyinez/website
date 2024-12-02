<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import * as THREE from 'three'
import OrbitControls from './OrbitControls.vue';
import Simulation from './Simulation.vue';


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
                <Simulation />
        </TresCanvas>
</template>
