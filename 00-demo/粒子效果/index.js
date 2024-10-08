import * as THREE from "https://esm.sh/three";
import { OrbitControls } from "https://esm.sh/three/examples/jsm/controls/OrbitControls";

let w = window.innerWidth;
let h = window.innerHeight;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, w / h, 0.01, 1000);
camera.position.set(0, 0, 4);
camera.lookAt(new THREE.Vector3());

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  // alpha: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(w, h);
renderer.setClearColor(0x0a0a0f, 1);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const sphereGeometry = new THREE.SphereGeometry(1, 200, 200);

const vertexShader = /* GLSL */ `
// 自定义顶点着色器
// vertex shader
uniform float uTime;
varying vec3 vNormal;
varying vec3 vColor;

//  Simplex 4D Noise 
//  by Ian McEwan, Ashima Arts
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}

vec4 grad4(float j, vec4 ip){
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 

  return p;
}

float snoise(vec4 v){
  const vec2  C = vec2( 0.138196601125010504,  // (5 - sqrt(5))/20  G4
                        0.309016994374947451); // (sqrt(5) - 1)/4   F4
// First corner
  vec4 i  = floor(v + dot(v, C.yyyy) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;

  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;

//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;

  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C 
  vec4 x1 = x0 - i1 + 1.0 * C.xxxx;
  vec4 x2 = x0 - i2 + 2.0 * C.xxxx;
  vec4 x3 = x0 - i3 + 3.0 * C.xxxx;
  vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;

// Permutations
  i = mod(i, 289.0); 
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
// Gradients
// ( 7*7*6 points uniformly over a cube, mapped onto a 4-octahedron.)
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.

  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;
}
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
    
void main() {
    vNormal = normal;
    float noise = snoise(vec4(position * 10.0, uTime * 0.3));
    vColor = hsv2rgb(vec3(noise * 0.1 + 0.04, 0.8, 1.0));
    // float noise = snoise(vec4(position * 10.0, 0.0));
//   float noise = snoise(vec4(position, 0.0)); // 核心控制
  vec3 newPos = position + 0.8 * normal * noise;
  // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
`;

const fragmentShader = /* GLSL */ `
varying vec3 vNormal;
varying vec3 vColor;
  void main() {
    // gl_FragColor = vec4(vec3(1.0), 1.0);
    // gl_FragColor = vec4(vNormal, 1.0);
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

const sphereMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },
  },
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);



const particleGeometry = new THREE.BufferGeometry();

const N = 9000;
const positions = new Float32Array(N * 3);

const inc = Math.PI * (3 - Math.sqrt(5));
const off = 2 / N;
const radius = 2;

// 现成球形粒子
for (let i = 0; i < N; i++) {
  const y = i * off - 1 + off / 2;
  const r = Math.sqrt(1 - y * y);
  const phi = i * inc;

  positions[3 * i] = radius * Math.cos(phi) * r;
  positions[3 * i + 1] = radius * y;
  positions[3 * i + 2] = radius * Math.sin(phi) * r;
}

particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

const particleVertex = /* GLSL */ `
//  C#
  uniform float uTime;

  void main() {
    vec3 newPos = position;
    // newPos.x += 0.1 * sin(newPos.x * 6.0 + uTime);
    // newPos.z += 0.05 * sin(newPos.z * 10.0 + uTime);

    newPos.y += 0.05 * sin(newPos.y * 10.0 + uTime);
    newPos.z += 0.05 * sin(newPos.y * 10.0 + uTime);

    // vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
    gl_PointSize = 4.0 / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const particleFragment = /* GLSL */ `
  void main() {
    // gl_FragColor = vec4(vec3(1.0), 1.0);
    gl_FragColor = vec4(vec3(1.0), 0.6);
  }
`;

const particleMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
  },
  vertexShader: particleVertex,
  fragmentShader: particleFragment,
  transparent: true,
  blending: THREE.AdditiveBlending,
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);


const clock = new THREE.Clock();
function render() {
  const time = clock.getElapsedTime();
  sphereMaterial.uniforms.uTime.value = time;
  particleMaterial.uniforms.uTime.value = time * 2.5 ;
  sphere.rotation.y = time * 0.3;
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();