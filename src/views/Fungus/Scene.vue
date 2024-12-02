<script setup lang="ts">
import { extend, useLoop, useTresContext } from '@tresjs/core'
import { inject } from 'vue'
import * as THREE from 'three'
import { brushFragmentShader, displayFragmentShader, genericFragmentShader, genericVertexShader, heightMapVertexShader, uvFragmentShader } from './scripts/shaders';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

extend({ OrbitControls })
let props = defineProps({
        heightTextureSwap: { type: Array<THREE.WebGLRenderTarget<THREE.Texture>>, required: true },
        simTextureSwap: { type: Array<THREE.WebGLRenderTarget<THREE.Texture>>, required: true },
        gridSize: { type: Number, required: true },
});

//i should probably use props but typescript is annoying and i don't know how to use it fully so whatever
//let heightTexture = inject<THREE.WebGLRenderTarget<THREE.Texture>>('heightTexture') as THREE.WebGLRenderTarget<THREE.Texture>;

const { camera, renderer, scene } = useTresContext();

let displayUniforms = {
        dt: { value: 0.1, },
        textureSource: { value: new THREE.Texture },
        //heightTexture: { value: heightTexture.texture },
        //heightTexture: { value: new THREE.Texture },
        heightMap: { value: props.heightTextureSwap[0].texture },
};

let displayMaterial = new THREE.ShaderMaterial({
        uniforms: displayUniforms,
        vertexShader: heightMapVertexShader(),
        fragmentShader: displayFragmentShader(),
        transparent: true,
        side: THREE.DoubleSide,
});


let displayMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, props.gridSize, props.gridSize), displayMaterial);
displayMesh.rotateX(-Math.PI / 2);
displayMesh.position.y = -0.2;
scene.value.add(displayMesh);

///// DRAWING

//mouse picking
let mousePickMaterial = new THREE.ShaderMaterial({
        uniforms: displayUniforms,
        vertexShader: heightMapVertexShader(),
        fragmentShader: uvFragmentShader(),
        transparent: true,
        side: THREE.FrontSide,
});

let mousePickMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, props.gridSize, props.gridSize), mousePickMaterial);
mousePickMesh.rotateX(-Math.PI / 2);
mousePickMesh.position.y = -0.2;

let mousePickScene = new THREE.Scene();
mousePickScene.add(mousePickMesh);

let mousePickRenderTarget = new THREE.WebGLRenderTarget(renderer.value.domElement.width, renderer.value.domElement.height, { format: THREE.RGBAFormat, type: THREE.FloatType });

let brushUniforms = {
        textureSource: { value: new THREE.Texture },
        brushSize: { value: 1 },
        brushStrength: { value: 0.1 },
        scale: { value: 1 },
        max: { value: 1 },
        min: { value: 0 },
        mask: { value: new THREE.Vector4(1, 1, 1, 1) },
        brushCoords: { value: new THREE.Vector2(0, 0) },
}

let brushMaterial = new THREE.ShaderMaterial({
        uniforms: brushUniforms,
        vertexShader: genericVertexShader(),
        fragmentShader: brushFragmentShader(),
        transparent: false,
        side: THREE.FrontSide,
});

let brushScene = new THREE.Scene();

let brushMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), brushMaterial);
brushScene.add(brushMesh);

let brushCamera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1, 10);
brushCamera.position.z = 1;

interface DrawMouseEvent {
        buttons: number;
        x: number;
        y: number;
        shiftDown: boolean;
        controlDown: boolean;
};

let drawingHandler = (ev: DrawMouseEvent) => {
        if (ev.buttons != 1) { return; }

        //resize if needed
        if (renderer.value.domElement.width != mousePickRenderTarget.width || renderer.value.domElement.height != mousePickRenderTarget.height) {
                //mousePickRenderTarget.dispose();
                mousePickRenderTarget = new THREE.WebGLRenderTarget(renderer.value.domElement.width, renderer.value.domElement.height, { format: THREE.RGBAFormat, type: THREE.FloatType });
        }

        //render the terrain with uv coordinates and color pick from the mouse to get the uv under the mouse
        renderer.value.setRenderTarget(mousePickRenderTarget);
        renderer.value.clearColor();
        renderer.value.render(mousePickScene, camera.value!);
        const read = new Float32Array(4);
        renderer.value.readRenderTargetPixels(mousePickRenderTarget, ev.x, mousePickRenderTarget.height - ev.y, 1, 1, read);

        //make sure we actually hit something
        if (read[3] < 0.01) { return; }

        //// brush that shit
        const texSwap = ev.controlDown ? props.heightTextureSwap : props.simTextureSwap;
        brushUniforms.textureSource.value = texSwap[0].texture;
        brushUniforms.mask.value = new THREE.Vector4(1, 0, 0, 1);
        brushUniforms.brushStrength.value = (ev.controlDown ? 0.01 : 0.07) * (ev.shiftDown ? -1 : 1);
        brushUniforms.brushSize.value = ev.controlDown ? 50 : 7;
        brushUniforms.scale.value = 200;
        brushUniforms.brushCoords.value = new THREE.Vector2(read[0], read[1]);
        renderer.value.setRenderTarget(texSwap[1]);
        renderer.value.render(brushScene, brushCamera);
        [texSwap[0], texSwap[1]] = [texSwap[1], texSwap[0]];
};

let drawMouseEvent: DrawMouseEvent = {
        buttons: 0,
        x: 0,
        y: 0,
        shiftDown: false,
        controlDown: false,
};

renderer.value.domElement.addEventListener("mousedown", (ev: MouseEvent) => {
        drawMouseEvent.buttons = ev.buttons; //need to add one because for some reason this doesn't register the left click even though this is literally the left click event but whatever
        drawMouseEvent.x = ev.offsetX;
        drawMouseEvent.y = ev.offsetY;
        drawMouseEvent.shiftDown = ev.shiftKey;
        drawMouseEvent.controlDown = ev.ctrlKey;
});
renderer.value.domElement.addEventListener("mousemove", (ev: MouseEvent) => {
        drawMouseEvent.buttons = ev.buttons; //need to add one because for some reason this doesn't register the left click even though this is literally the left click event but whatever
        drawMouseEvent.x = ev.offsetX;
        drawMouseEvent.y = ev.offsetY;
        drawMouseEvent.shiftDown = ev.shiftKey;
        drawMouseEvent.controlDown = ev.ctrlKey;
});
renderer.value.domElement.addEventListener("mouseup", (ev: MouseEvent) => { drawMouseEvent.buttons = ev.buttons; });

const { onBeforeRender } = useLoop();
onBeforeRender(({ delta }) => {
        drawingHandler(drawMouseEvent);
        displayUniforms.heightMap.value = props.heightTextureSwap[0].texture;
        displayUniforms.textureSource.value = props.simTextureSwap[1].texture;
});

</script>

<template>
        <primitive :object="displayMesh" />
        <TresAmbientLight :intensity="1" />
        <TresOrbitControls v-if="renderer" :args="[camera, renderer?.domElement]" :target="[0,0,0]" :zoomSpeed="2" :zoom0="0.1"
                :rotateSpeed="0.5" :maxPolarAngle="Math.PI / 2" :enablePan="false"
                :mouseButtons="{ MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }" />
</template>
