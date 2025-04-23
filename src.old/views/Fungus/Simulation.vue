<script setup lang="ts">
import { provide } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import * as THREE from 'three'
import { genericFragmentShader, genericVertexShader, simulationFragmentShader, uvFragmentShader } from './scripts/shaders';
import Scene from './Scene.vue'
import { FixedParams } from './scripts/FixedParams';

let props = defineProps({
        gridSize: {type: Number, default: 128},
        fixedParams: {type: FixedParams, default: new FixedParams()},
        numShrooms: {type: Number, default: 512},
        scale: { type: Number, default: 200 },
});

let tresContext = useTresContext();
let renderer = tresContext.renderer.value;
const gl = renderer.getContext();
const maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);


let simUniforms = {
        //bgColor: { type: "v4", value: new THREE.Vector4(1, 1, 0, 1), },
        dt: { value: 0.1, },
        varyingParams: { value: new THREE.Texture },
        heightMap: { value: new THREE.Texture },
        NX: { value: props.gridSize },
        NY: { value: props.gridSize },
        scale: { value: props.scale },
        params: { value: props.fixedParams },
};


let simMaterial = new THREE.ShaderMaterial({
        uniforms: simUniforms,
        vertexShader: genericVertexShader(),
        fragmentShader: simulationFragmentShader(),
        transparent: true,
        side: THREE.DoubleSide,
});

let simScene = new THREE.Scene();

let simMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), simMaterial);
simScene.add(simMesh);

let simCamera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1, 10);
simCamera.position.z = 1;

let simTextureOpts = {
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        minFilter: THREE.NearestFilter,
        depthBuffer: false,
};

let simTextureSwap: Array<THREE.WebGLRenderTarget<THREE.Texture>>= [];
simTextureSwap.push(new THREE.WebGLRenderTarget(props.gridSize, props.gridSize, simTextureOpts));
simTextureSwap.push(simTextureSwap[0].clone());

// Zero-flux boundary conditions
simTextureSwap.forEach((tex) => {
        tex.texture.wrapS = THREE.ClampToEdgeWrapping;
        tex.texture.wrapT = THREE.ClampToEdgeWrapping;
});

let heightTextureSwap: Array<THREE.WebGLRenderTarget<THREE.Texture>> = [];
heightTextureSwap.push(new THREE.WebGLRenderTarget(props.gridSize, props.gridSize, simTextureOpts));
heightTextureSwap.push(heightTextureSwap[0].clone());
heightTextureSwap.forEach((tex) => {
        tex.texture.wrapS = THREE.ClampToEdgeWrapping;
        tex.texture.wrapT = THREE.ClampToEdgeWrapping;
        tex.texture.minFilter = THREE.LinearFilter;
});

const { onBeforeRender, render } = useLoop();

onBeforeRender(({ delta }) => {
        renderer.setRenderTarget(simTextureSwap[1]);
        simUniforms.dt.value = Math.min(delta * 50, 0.9);
        simUniforms.varyingParams.value = simTextureSwap[0].texture;
        simUniforms.heightMap.value = heightTextureSwap[0].texture;
        renderer.render(simScene, simCamera);

        //swap textures
        [simTextureSwap[0], simTextureSwap[1]] = [simTextureSwap[1], simTextureSwap[0]];
});

render(({ renderer, scene, camera }) => {
        //uniforms.textureSource.value = simTextureSwap[0].texture;
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
});

//provide('heightTextureSwap', heightTextureSwap);

</script>

<template>
        <Scene :heightTextureSwap="heightTextureSwap" :simTextureSwap="simTextureSwap" :gridSize="gridSize" :numShrooms="numShrooms" :scale="props.scale"/>
</template>
