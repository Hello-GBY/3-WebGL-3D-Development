import * as THREE from 'three';
import  * as CSS2D from 'CSS2DRenderer';


let container, camera, scene, renderer;
init();
animate();
function init() {
    // 创建一个容器用来装载 Three.js 界面
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    // 创建一个透视摄像机
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
    camera.position.set( 0, 300, 500 );
    // 创建一个场景
    scene = new THREE.Scene();
    // 添加网格辅助线以便于调试
    const gridHelper = new THREE.GridHelper(2000, 20);
    scene.add(gridHelper);
    // 添加立方体对象到场景中
    const geometry = new THREE.BoxGeometry(10, 10, 1);
    const material = new THREE.MeshBasicMaterial({color: "red"});
    const cube = new THREE.Mesh(geometry, material);
    
     // 设置立方体对象的位置和旋转角度
     cube.position.set(-50,0,-50)
     cube.rotation.x += Math.PI/4;
     cube.rotation.y += Math.PI/4;
     // 添加立方体对象到场景中
     scene.add(cube);
    // 创建一个渲染器，设置其大小并添加到容器中
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
    // 监听窗口变化事件
    window.addEventListener( 'resize', onWindowResize, false );
}
var  fov = 45,//拍摄距离  视野角值越大，场景中的物体越小
    near = 1,//最小范围
    far = 1000;//最大范围
function handleMouseWheel( event ) {
    event.preventDefault();
    //event.stopPropagation();
      if (event.wheelDelta)
          {  //判断浏览器IE，谷歌滑轮事件
              if (event.wheelDelta > 0)
              {   //当滑轮向上滚动时
                  fov -= (near < fov ? 1 : 0);
              }
              else
              {   //当滑轮向下滚动时
                  fov += (fov < far ? 1 : 0);
              }
      }
      //console.info('camera.fov:'+camera.fov);
      //改变fov值，并更新场景的渲染
      camera.fov = fov;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame( animate );
    render();
}
function render() {
    renderer.render( scene, camera );
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
let mouseDown = false;
let mouseX = 0;
let mouseY = 0;
document.addEventListener('mousedown', event => {
  mouseDown = true;
  mouseX = event.clientX;
  mouseY = event.clientY;
});
 document.addEventListener('mouseup', event => {
   mouseDown = false;
 });
 document.addEventListener('wheel', event => {
    handleMouseWheel(event)
})
 document.addEventListener('mousemove', event => {
   if (!mouseDown) return;
   const deltaX = event.clientX - mouseX;
   const deltaY = event.clientY - mouseY;
   mouseX = event.clientX;
   mouseY = event.clientY;
   const deltaRotationQuaternionX = new THREE.Quaternion()
     .setFromEuler(new THREE.Euler(-deltaY * (Math.PI / 180), 0, 0));
   const deltaRotationQuaternionY= new THREE.Quaternion()
     .setFromEuler(new THREE.Euler(0, -deltaX * (Math.PI / 180), 0));
   camera.quaternion.multiplyQuaternions(deltaRotationQuaternionX, camera.quaternion);
   camera.quaternion.multiplyQuaternions(camera.quaternion, deltaRotationQuaternionY);
 });


 // 创建标尺几何体
function createRuler(length, divisions) {
    var vertices = [];
    for (var i = 0; i <= 100; i++) {
        vertices.push(i, 0, 0);
        vertices.push(i, 2, 0);
        // 中间是短的 中间是长的 具体刻度是最长的
    }

    // 创建几何体
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    // 创建材质
    var material = new THREE.LineBasicMaterial({ color: 0xffffff });

    // 创建标尺对象
    var ruler = new THREE.LineSegments(geometry, material);

    // 添加标尺到场景中
    scene.add(ruler);
}
  
  // 调用函数创建标尺
  createRuler(5, 10);