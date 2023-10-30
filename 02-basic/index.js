import * as THREE from '../node_modules/three/build/three.module.js';


// 创建场景和物体
const scene = new THREE.Scene();
const box = new THREE.BoxGeometry(10, 10, 10);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

// 创建材质
const mesh = new THREE.Mesh(box, material);
mesh.position.set(0, 10, 0);
scene.add(mesh);

// 透视相机
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
    ); 
camera.position.set(200, 10, 200);
camera.lookAt(mesh.position);
scene.add(camera);

// 渲染器（绘制到画布上）
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);
