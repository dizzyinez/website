<script setup lang="ts">
import { defineProps, ref } from 'vue';

let props = defineProps({
        name: { type: String, required: true },
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        step: { type: Number, required: true },
});
const model = defineModel();

</script>

<template>
        <div>
                <div class="slider-component">
                        <p> {{ name }}: {{ modelValue }}</p>
                        <div class="slidecontainer">
                                <input ref="input" type="range" :min="min" :max="max" :step="step" class="slider" v-model="model" />
                        </div>
                </div>
        </div>
</template>


<style scoped>
.slider-component .slidecontainer {
        width: 100%;
}

.slider-component .slidecontainer .slider {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 4px;
        border-radius: 2px;
        background: #c2c2c2;
        outline: none;
        opacity: 0.7;
        -webkit-transition: .2s;
        transition: opacity .2s;
}

.slider-component .slidecontainer .slider:hover {
        opacity: 1;
}

.slider-component .slidecontainer .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        background: hsla(160, 100%, 37%, 1);
        cursor: pointer;
        border-radius: 50%;
}

.slider-component .slidecontainer .slider::-moz-range-thumb {
        width: 18px;
        height: 18px;
        background: hsla(160, 100%, 37%, 1);
        cursor: pointer;
        border-radius: 50%;
}
</style>
