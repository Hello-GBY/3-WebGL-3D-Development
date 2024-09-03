import * as THREE from "https://esm.sh/three";
import { OrbitControls } from "https://esm.sh/three/examples/jsm/controls/OrbitControls";


const $ = {
    init () {
      this.createScene();
      this.createLights();
      this.createObjects();
      this.helpers();
      this.createCamera();
      this.render();
      this.controls();
      this.tick();
      this.fitView();
    },
    createScene () {
      const canvas = document.getElementById('c');
      const width = window.innerWidth;
      const height = window.innerHeight;
      // 创建3D场景
      const scene = new THREE.Scene();
  
      this.canvas = canvas;
      this.width = width;
      this.height = height;
      this.scene = scene;
    },
    createLights () {
      const { scene } = this;
      // 添加全局光照
      const ambientLight = new THREE.AmbientLight(0xffffff);
      // 添加方向光
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  
      scene.add(ambientLight);
      scene.add(directionalLight);
    },
    createObjects () {
      const { scene } = this;
      // 创建立方体
      const geometry = new THREE.BoxGeometry(2, 2, 2);
  
      // 设置立方体表面颜色
      /* const material = new THREE.MeshLambertMaterial({
        color: '#1890ff',
      }); */
      let faces = [];
  
      for (let i = 0; i < geometry.groups.length; i++) {
        // 重新生成新的材质
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(Math.random() * 0x00ffff),
        });
  
        faces.push(material);
      }
  
      // 生成物体对象
      const mesh = new THREE.Mesh(geometry, faces);
  
      scene.add(mesh);
      this.mesh = mesh;
    },
    helpers () {
      // 辅助坐标系
      const axesHelper = new THREE.AxesHelper(4);
  
      this.scene.add(axesHelper);
  
      // 添加网格平面
      const gridHelper = new THREE.GridHelper(100, 10, 0xcd37aa, 0x4a4a4a);
  
      this.scene.add(gridHelper);
    },
    createCamera () {
      const { scene } = this;
  
      // 创建观察场景的相机
      const size = 4;
      const camera = new THREE.OrthographicCamera(-size, size, size / 2, -size / 2, 0.001, 100); // 正交相机
  
      // 设置相机位置
      camera.position.set(1, 0.5, 2); // 相机默认的坐标是在(0,0,0);
      // 设置相机方向
      camera.lookAt(scene.position); // 将相机朝向场景
      // 将相机添加到场景中
      scene.add(camera);
      this.camera = camera;
    },
    render () {
      // 创建渲染器
      const renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true, // 抗锯齿
      });
  
      renderer.setPixelRatio(window.devicePixelRatio);
      // 设置渲染器大小
      renderer.setSize(this.width, this.height);
      // 执行渲染
      renderer.render(this.scene, this.camera);
      this.renderer = renderer;
    },
    controls () {
      const orbitControls = new OrbitControls(this.camera, this.canvas);
  
      orbitControls.enableDamping = true; // 启用拖拽惯性效果
      this.orbitControls = orbitControls;
    },
    // 更新画布
    tick () {
      const _this = this;
  
      // update objects
      _this.orbitControls.update();
      // _this.mesh.rotation.y += 0.005;
      // 重新渲染整个场景
      _this.renderer.render(_this.scene, _this.camera);
      // 调用下次更新函数
      window.requestAnimationFrame(() => _this.tick());
    },
    // 自适应画布
    fitView () {
      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
  
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      }, false);
    },
  }
  
$.init();

// fitView();