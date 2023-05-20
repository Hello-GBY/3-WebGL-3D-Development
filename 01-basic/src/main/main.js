import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(10, 2, 10);
scene.add(camera);

// 创建几何体
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

// 几何体和材质创建物体
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// 缩放
mesh.scale.set(2, 1, 1);
// 旋转
mesh.rotation.set(Math.PI / 4, 0, 0);

// 初始化渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 通过相机使用渲染器
renderer.render(scene, camera);

// 使用控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

function animate() {
  mesh.position.x += 0.01;
  mesh.rotation.x -= 0.01;

  if (mesh.position.x > 5) mesh.position.x = 0;

  requestAnimationFrame(animate); // 下一帧的时候进行渲染
  renderer.render(scene, camera);
}

animate();

// 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

// 3d物体移动
