<script setup lang="ts">
import { extend, useLoop, useTresContext } from '@tresjs/core'
import { inject } from 'vue'
import * as THREE from 'three'
import { brushFragmentShader, displayFragmentShader, genericFragmentShader, genericVertexShader, heightMapStandardVertexShader, heightMapVertexShader, mushroomFragmentShader, mushroomVertexShader, uvFragmentShader } from './scripts/shaders';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { halton } from './scripts/Halton';

extend({ OrbitControls })
let props = defineProps({
        heightTextureSwap: { type: Array<THREE.WebGLRenderTarget<THREE.Texture>>, required: true },
        simTextureSwap: { type: Array<THREE.WebGLRenderTarget<THREE.Texture>>, required: true },
        gridSize: { type: Number, required: true },
        numShrooms: { type: Number, default: 512 },
        scale: { type: Number, default: 200 },
});

const { camera, renderer, scene } = useTresContext();


let displayMaterial = new THREE.MeshStandardMaterial();
displayMaterial.roughness = 0.8;
displayMaterial.color = new THREE.Color(0.5,1,0.5);
displayMaterial.side = THREE.DoubleSide;
displayMaterial.shadowSide = THREE.DoubleSide;

let displayGeometry = new THREE.PlaneGeometry(1, 1, props.gridSize, props.gridSize);
displayGeometry.rotateX(-Math.PI / 2);
displayGeometry.computeVertexNormals();

let displayMesh = new THREE.Mesh(displayGeometry, displayMaterial);
displayMesh.position.y = -0.1;
displayMesh.receiveShadow = true;
displayMesh.castShadow = true;
scene.value.add(displayMesh);

let mushroomMaterial = new THREE.MeshStandardMaterial();
let mushroomShader: THREE.WebGLProgramParametersWithUniforms;
let mushroomDepthShader: THREE.WebGLProgramParametersWithUniforms;
mushroomMaterial.roughness = 0.2;
mushroomMaterial.shadowSide = THREE.DoubleSide;
let applyMushroomVertexInserts = (shader: THREE.WebGLProgramParametersWithUniforms) => {
        shader.uniforms.heightMap = { value: null };
        shader.uniforms.varyingParams = { value: null };

        let token = '#include <common>'
        let insert = /*glsl*/`
        uniform sampler2D heightMap;
        uniform sampler2D varyingParams;
        uniform float numShrooms;
        //uniform sampler2D mushroomPoints;
        `
        shader.vertexShader = shader.vertexShader.replace(token, token + insert);

        token = '#include <begin_vertex>'
        insert = /* glsl */`
        vec2 point = vec2(0.5,0.5);
        #ifdef USE_INSTANCING
                point = vec4( instanceMatrix * vec4(0., 0. , 0., 1.) ).xz;
                point += vec2(0.5, 0.5);
                point.y = 1. - point.y;
        #endif
        float height = texture2D(heightMap, point).r;
        float fungi = texture2D(varyingParams, point).r;
        float scale = 1.;
        if (fungi < 0.09) { fungi = 0.; scale = 0.;};

        transformed *= vec3(scale,fungi,scale);
        transformed += vec3(0,height,0);
        `
        shader.vertexShader = shader.vertexShader.replace(token, token + insert);
}
mushroomMaterial.onBeforeCompile = (shader) => {
        applyMushroomVertexInserts(shader);
        mushroomShader = shader;
}

let mushroomDepthMaterial = new THREE.MeshDepthMaterial();
mushroomDepthMaterial.depthPacking = THREE.RGBADepthPacking;
mushroomDepthMaterial.onBeforeCompile = (shader) => {
        applyMushroomVertexInserts(shader);
        mushroomDepthShader = shader;
        console.log(shader.vertexShader);
};

let mushroomGeometry = new THREE.CylinderGeometry(0.005, 0.008, 0.1, 8);
mushroomGeometry.translate(0, 0.05, 0);

let mushroomMesh = new THREE.InstancedMesh(mushroomGeometry, mushroomMaterial, props.numShrooms);
mushroomMesh.position.y = -0.1;
mushroomMesh.receiveShadow = true;
mushroomMesh.castShadow = true;
mushroomMesh.customDepthMaterial = mushroomDepthMaterial;
const dummy = new THREE.Object3D();
const halton2 = halton(2);
const halton3 = halton(3);
for (let i = 0; i < props.numShrooms; i++) {
        dummy.position.x = halton2.next().value - 0.5;
        dummy.position.z = halton3.next().value - 0.5;
        dummy.updateMatrix();
        mushroomMesh.setMatrixAt(i, dummy.matrix);
}
mushroomMesh.instanceMatrix.needsUpdate = true;
mushroomMesh.computeBoundingSphere();
mushroomMesh.frustumCulled = false;
console.log(props.numShrooms);
console.log(mushroomMesh.count);
scene.value.add(mushroomMesh);
//mushroomMesh.instanceMatrix.setUsage(THREE.StaticReadUsage);

let light = new THREE.DirectionalLight(0xffffff, 0.5);
light.position.set(0, 1, -1);
light.castShadow = true;
light.shadow.camera.left = -0.5;
light.shadow.camera.right = 0.5;
light.shadow.camera.bottom = -0.5;
light.shadow.camera.top = 0.5;
light.shadow.radius = 2;
light.shadow.bias = -0.001;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.visible = true;
light.shadow.camera.far = 5;
scene.value.add(light);
//scene.value.add(new THREE.DirectionalLightHelper(light, 1));

const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.value.add(ambientLight)



///// DRAWING

let mousePickUniforms = { heightMap: { value: props.heightTextureSwap[0].texture } };

//mouse picking
let mousePickMaterial = new THREE.ShaderMaterial({
        uniforms: mousePickUniforms,
        vertexShader: heightMapVertexShader(),
        fragmentShader: uvFragmentShader(),
        transparent: true,
        side: THREE.FrontSide,
});

let mousePickMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, props.gridSize, props.gridSize), mousePickMaterial);
mousePickMesh.rotateX(-Math.PI / 2);
mousePickMesh.position.y = -0.1;

let mousePickScene = new THREE.Scene();
mousePickScene.add(mousePickMesh);

let mousePickRenderTarget = new THREE.WebGLRenderTarget(renderer.value.domElement.width, renderer.value.domElement.height, { format: THREE.RGBAFormat, type: THREE.FloatType });

let brushUniforms = {
        textureSource: { value: new THREE.Texture },
        brushSize: { value: 1 },
        brushStrength: { value: 0.1 },
        scale: { value: props.scale },
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
        brushUniforms.brushSize.value = ev.controlDown ? 15 : 1;
        brushUniforms.scale.value = props.scale;
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
        displayMaterial.displacementMap = props.heightTextureSwap[0].texture;
        //displayMaterial.map = props.simTextureSwap[0].texture;
        displayMaterial.bumpMap = props.heightTextureSwap[0].texture;
        if (mushroomShader) mushroomShader.uniforms["heightMap"].value = props.heightTextureSwap[1].texture;
        if (mushroomShader) mushroomShader.uniforms["varyingParams"].value = props.simTextureSwap[1].texture;
        if (mushroomDepthShader) mushroomDepthShader.uniforms["heightMap"].value = props.heightTextureSwap[1].texture;
        if (mushroomDepthShader) mushroomDepthShader.uniforms["varyingParams"].value = props.simTextureSwap[1].texture;
        //displayUniforms.heightMap = {value: props.heightTextureSwap[0].texture};
        //displayUniforms.textureSource.value = props.simTextureSwap[1].texture;
});

//         <primitive receive-shadow :object="displayMesh" />
// <TresAmbientLight :intensity="0.0" />
// <TresDirectionalLight cast-shadow :position="[0, 2, 1]" :intensity="1" />
</script>

<template>
        <TresOrbitControls v-if="renderer" :args="[camera, renderer?.domElement]" :target="[0, 0, 0]" :zoomSpeed="2"
                :zoom0="0.1" :rotateSpeed="0.5" :maxPolarAngle="Math.PI / 2" :enablePan="false"
                :mouseButtons="{ MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }" />
</template>
