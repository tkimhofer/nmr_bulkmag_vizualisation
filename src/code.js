// src/code.js
import * as THREE from 'three'; // resolved by import map
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js';

// --- basic scene ---
const container = document.querySelector('#scene-container');
if (!container) throw new Error('#scene-container not found');

const scene = new THREE.Scene();

THREE.Object3D.DEFAULT_UP.set(0, 0, 1); // Now Z is 'up'
const camera = new THREE.PerspectiveCamera(
  35,
  container.clientWidth / container.clientHeight,
  0.1,
  20000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setClearColor(0xf7f7f7, 1);

function setRendererSize() {
  const w = container.clientWidth || window.innerWidth;
  const h = container.clientHeight || window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
setRendererSize();

camera.position.set(300, 300, 300);
camera.lookAt(0, 0, 0);

container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

new ResizeObserver(setRendererSize).observe(container);

scene.add(new THREE.AmbientLight(0xffffff, 1));
scene.add(new THREE.AxesHelper(120));

// --- constants (NMR model) ---
const M0     = 1.0;
const T1     = 1.8;
const T2     = 0.35;
const omega0 = 2 * Math.PI * 30/10; // 30 Hz for visualization ... lowering hz for slower movement
const phi0   = 0;
const zPlane = 0; // traces live in horizontal XY at this height

// --- magnetisation state ---
let t = 0;
let M = new THREE.Vector3(0, 0, M0);

// --- magnetisation arrow (use visible color) ---
const arrow = new THREE.ArrowHelper(
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, 0),
  100,
  0x333333,
  12,
  6
);
scene.add(arrow);

// detectors in XY plane (z = zPlane)
function cone(color, pos, rot) {
  const geo = new THREE.ConeGeometry(5, 20, 32);
  const mat = new THREE.MeshBasicMaterial({ color });
  const c = new THREE.Mesh(geo, mat);
  c.position.copy(pos);
  if (rot) c.rotation.setFromVector3(rot);
  scene.add(c);
}
cone(0xff0000, new THREE.Vector3(130,   0, 0), new THREE.Vector3(0, 0, -Math.PI/2)); // +X (red), rotate -90° about Z
cone(0x0088ff, new THREE.Vector3(  0, 130, 0), new THREE.Vector3(0, 0, 0));  


// --- rolling traces for Sx and Sy ---
const maxSamples = 800;
const xGeom = new THREE.BufferGeometry();
const yGeom = new THREE.BufferGeometry();
const xPositions = new Float32Array(maxSamples * 3);
const yPositions = new Float32Array(maxSamples * 3);
xGeom.setAttribute('position', new THREE.BufferAttribute(xPositions, 3));
yGeom.setAttribute('position', new THREE.BufferAttribute(yPositions, 3));

// stream-friendly + visible immediately
xGeom.attributes.position.setUsage(THREE.DynamicDrawUsage);
yGeom.attributes.position.setUsage(THREE.DynamicDrawUsage);
xGeom.setDrawRange(0, 1);
yGeom.setDrawRange(0, 1);

const xLine = new THREE.Line(xGeom, new THREE.LineBasicMaterial({ color: 0xff0000 }));
const yLine = new THREE.Line(yGeom, new THREE.LineBasicMaterial({ color: 0x0000ff }));
xLine.frustumCulled = false;
yLine.frustumCulled = false;
scene.add(xLine, yLine);

let writeIdx = 0;
function pushSample(xVal, yVal) {
  const scale = 100;   // amplitude scaling
  const step  = 0.5;   // time step per sample
  const tx = -maxSamples * step * 0.5 + writeIdx * step;

  // --- Sx trace (red): time along +X, amplitude along +Y, at constant Z ---
  xPositions[3*writeIdx + 0] = 340 + tx;    // X = time
  xPositions[3*writeIdx + 1] = scale * xVal; // Y = amplitude (Sx = Mx)
  xPositions[3*writeIdx + 2] = zPlane;       // Z = constant (horizontal plane)

  // --- Sy trace (blue): time along +Y, amplitude along +X, same Z plane ---
  yPositions[3*writeIdx + 0] = scale * yVal; // X = amplitude (Sy = My)
  yPositions[3*writeIdx + 1] = 340 + tx;     // Y = time
  yPositions[3*writeIdx + 2] = zPlane;       // Z = constant (horizontal plane)

  writeIdx = (writeIdx + 1) % maxSamples;

  xGeom.attributes.position.needsUpdate = true;
  yGeom.attributes.position.needsUpdate = true;

  const count = Math.min(writeIdx || 1, maxSamples);
  xGeom.setDrawRange(0, count);
  yGeom.setDrawRange(0, count);
  xGeom.computeBoundingSphere();
  yGeom.computeBoundingSphere();
}

// --- physics ---
const clock = new THREE.Clock();
const dtFixed = 1 / 240;
let accumulator = 0;

(function apply90PulseX() {
  M.set(M0, 0, 0);
  t = 0;
})();

function drawArrowFromM() {
  const mag = Math.sqrt(M.x*M.x + M.y*M.y + M.z*M.z);
  const dir = mag > 1e-12 ? new THREE.Vector3(M.x, M.y, M.z).divideScalar(mag) : new THREE.Vector3(1,0,0);
  arrow.setDirection(dir);
  // arrow.setLength(100 * Math.min(1, mag / M0));

  arrow.setDirection(new THREE.Vector3(M.x, M.y, 0).normalize());
  arrow.setLength(100 * (Math.hypot(M.x, M.y) / M0));
}

drawArrowFromM(); 
pushSample(M.x, M.y);
renderer.render(scene, camera);


const tHold = 0.02; // holidng xy plane tilt to make shift explicit
function stepPhysics(dt) {
  t += dt;

  // calc spin-lattice and spin-spin relaxation for t
  const ex = Math.exp(-t / T2);
  let   Mz;
    if (t < tHold) {
      Mz = 0;
    } else {
      const τ = t - tHold;
      Mz = M0 * (1 - Math.exp(-τ / T1));
    }
  
  const ez = 1 - Math.exp(-t / T1);

  // calc 
  const Mx = M0 * ex * Math.cos(omega0 * t + phi0);
  const My = - M0 * ex * Math.sin(omega0 * t + phi0);
  // const Mz = M0 * ez;

  M.set(Mx, My, Mz);

  const dir = new THREE.Vector3(Mx, My, Mz).normalize();
  arrow.setDirection(dir);
  arrow.setLength(100 * Math.min(1, Math.sqrt(Mx * Mx + My * My + Mz * Mz) / M0));

  // sensors read transverse signals
  pushSample(Mx, My);
}

function animate() {
  requestAnimationFrame(animate);
  accumulator += clock.getDelta();
  while (accumulator >= dtFixed) {
    stepPhysics(dtFixed);
    accumulator -= dtFixed;
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  setRendererSize();
});
