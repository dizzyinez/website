<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import * as THREE from 'three'
import Simulation from './Simulation.vue';
import { FixedParams } from './scripts/FixedParams';

let props = defineProps({
        gridSize: { type: Number, default: 128 },
        fixedParams: { type: FixedParams, default: new FixedParams() },
        numShrooms: { type: Number, default: 512 },
        scale: { type: Number, default: 200 },
});

//let renderer = new THREE.WebGLRenderer({
//        preserveDrawingBuffer: true,
//        powerPreference: "high-performance",
//        antialias: true,
//        alpha: true,
//        premultipliedAlpha: false,
//        stencil: false,
//});
//renderer.shadowMap.enabled = true;
//renderer.setClearColor(new THREE.Color(0, 0, 0), 1);

</script>

<template>
        <TresCanvas :shadows=true :stencil=false :premultipliedAlpha=false powerPreference="high-performance"
                :antialias=true>
                <TresPerspectiveCamera :position="[1, 1, 1]" />
                <Simulation :fixedParams="props.fixedParams" :gridSize="gridSize" :numShrooms="numShrooms" :scale="props.scale"/>
        </TresCanvas>
</template>
