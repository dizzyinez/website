<script setup lang="ts">
import Slider from '@/components/Slider.vue';
import FungiSim from './Fungus/FungiSim.vue'
import { FixedParams } from './Fungus/scripts/FixedParams';
import { ref } from 'vue';

const params = ref(new FixedParams());
const v = ref(1.0);

</script>

<template>
        <div class="fungi">
                <div>
                        <p> Left Click: Draw fungi </p>
                        <p> CTRL + Left Click: Draw Terrain </p>
                        <p> SHFT: invert brush </p>
                        <p> Right Click: Rotate </p>
                        <p> Scroll Wheel: Zoom </p>
                        <br/>
                        <Slider name="Sensitivity of F growth to I" v-model="params.s_I" :min="0" :max="1" :step="0.05" />
                        <Slider name="Half Saturation constant for W" v-model="params.k_W" :min="0" :max="0.5" :step="0.05" />
                        <Slider name="Fungus Death Rate" v-model="params.d_F" :min="0" :max="0.01" :step="0.001" />
                        <Slider name="Accumulation of I due to F death" v-model="params.c_I" :min="0" :max="0.1" :step="0.01" />
                        <Slider name="Degradation rate of I" v-model="params.k_I" :min="0" :max="0.01" :step="0.001" />
                        <Slider name="Leaching rate of I" v-model="params.l_I" :min="0" :max="0.01" :step="0.001" />
                        <Slider name="Sensitivity of F death to I" v-model="params.s_F" :min="0" :max="5" :step="0.1" />
                        <Slider name="Fungus diffusion rate" v-model="params.Diff_F" :min="0" :max="0.05" :step="0.005" />
                        <Slider name="Inhibitor diffusion rate" v-model="params.Diff_I" :min="0" :max="0.01" :step="0.0005" />
                        <Slider name="Inhibitor Convection rate" v-model="params.Conv_I" :min="0" :max="0.01" :step="0.001" />
                        <Slider name="Fungus growth rate" v-model="params.g_F" :min="0" :max="0.05" :step="0.01" />
                        <Slider name="Soil Water" v-model="params.W" :min="0" :max="2" :step="0.1" />
                        <Slider name="Soil Water parameter a" v-model="params.a" :min="0" :max="2" :step="0.5" />
                        <Slider name="Soil Water parameter b" v-model="params.b" :min="0" :max="9" :step="1" />
                </div>
                <div class="canvas">
                        <FungiSim :fixedParams="params" :gridSize="256" />
                </div>
        </div>
</template>

<style>
.fungi {
        display: flex;
        flex-direction: row;
        flex: 1;
        height: 100%;
}

.canvas {
        flex: 1;
}
</style>
