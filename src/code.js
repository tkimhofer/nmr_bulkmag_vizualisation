// src/code.js
import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js';

// --- basic scene ---
const container = document.querySelector('#scene-container');
if (!container) throw new Error('#scene-container not found');

const scene = new THREE.Scene();
THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

const camera = new THREE.PerspectiveCamera(
  35,
  container.clientWidth / container.clientHeight,
  0.1,
  20000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setClearColor(0x202833, 1);

function setRendererSize() {
  const w = container.clientWidth || window.innerWidth;
  const h = container.clientHeight || window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
setRendererSize();

camera.position.set(400, 400, 400);
camera.lookAt(0, 0, 0);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();
new ResizeObserver(setRendererSize).observe(container);

scene.add(new THREE.AmbientLight(0xffffff, 1));
scene.add(new THREE.AxesHelper(120));

const hemiLight = new THREE.HemisphereLight(0xaaaaaa, 0x222222, 0.8);
scene.add(hemiLight);

// --- constants (NMR model) ---
const M0     = 1.0;
const T1     = 1.8;
const T2     = 0.35;
const omega0 = 2 * Math.PI * 30 / 10; // slowed for viz
const phi0   = 0;
const zPlane = 0;

// --- magnetisation state ---
let t = 0;
let M = new THREE.Vector3(0, 0, M0);

// physics timing (single declarations so restart can replace clock)
let clock = new THREE.Clock();
const dtFixed = 1 / 240;
let accumulator = 0;
const timeScale = 0.5; 

// --- arrow ---
function createThickArrow({
  color = 0xffffff,
  shaftRadius = 3,
  shaftLength = 90,   // default/base shaft length
  headLength  = 20,   // default/base head length
  headRadius  = 8,
  radialSegs  = 24,
} = {}) {
  const group = new THREE.Group();

  // Shaft geometry centered on its middle; we’ll position so base is at z=0.
  const shaftGeo = new THREE.CylinderGeometry(shaftRadius, shaftRadius, shaftLength, radialSegs);
  const shaftMat = new THREE.MeshPhongMaterial({ color });
  const shaft = new THREE.Mesh(shaftGeo, shaftMat);
  shaft.position.z = shaftLength / 2; // base at origin
  group.add(shaft);

  // Head geometry; base sits on top of shaft.
  const headGeo = new THREE.ConeGeometry(headRadius, headLength, radialSegs);
  const headMat = new THREE.MeshPhongMaterial({ color });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.z = shaftLength + headLength / 2;
  group.add(head);

  // Store base dimensions for later scaling
  group.userData = {
    shaft,
    head,
    baseShaftLength: shaftLength,
    baseHeadLength: headLength,
  };

  return group;
}

function setThickArrow(group, dir, totalLength, tipRatio = 0.2) {
  const { shaft, head, baseShaftLength, baseHeadLength } = group.userData;

  // Direction: align +Z to dir
  const d = dir.lengthSq() > 1e-12 ? dir.clone().normalize() : new THREE.Vector3(0, 0, 1);
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), d);
  group.setRotationFromQuaternion(quat);

  // Split total length into shaft/head
  const headLen = Math.max(1e-6, totalLength * tipRatio);
  const shaftLen = Math.max(1e-6, totalLength - headLen);

  // Scale geometries along Z (height) by adjusting positions and scales
  const shaftScaleZ = shaftLen / baseShaftLength;
  shaft.scale.set(1, 1, shaftScaleZ);
  shaft.position.z = shaftLen / 2; // base at 0 → center at half length

  const headScaleZ = headLen / baseHeadLength;
  head.scale.set(1, 1, headScaleZ);
  head.position.z = shaftLen + headLen / 2; // sits on top of shaft
}

const arrow = createThickArrow({
  color: 0xffffff,   // change color here
  shaftRadius: 4,    // <-- thicker shaft
  shaftLength: 90,
  headLength: 20,
  headRadius: 10,
});
scene.add(arrow);


// const arrow = new THREE.ArrowHelper(
//   new THREE.Vector3(0, 0, 1),
//   new THREE.Vector3(0, 0, 0),
//   100,
//   // 0x333333,
//   0xffffff,
//   12,
//   6
// );
// scene.add(arrow);

function setArrowFromM(v) {
  const mag = v.length();
  const length = 100 * Math.min(1, mag / M0);  // same visual scale as before
  if (length < 1e-6) {
    // keep previous orientation; just collapse length
    setThickArrow(arrow, new THREE.Vector3(0,0,1), 0.0001);
    return;
  }
  setThickArrow(arrow, v, length, 0.2)
  // if (mag > 1e-9) arrow.setDirection(v.clone().normalize());
  // arrow.setLength(100 * Math.min(1, mag / M0));
}

// detectors
function cone(color, pos, rot) {
  const geo = new THREE.ConeGeometry(5, 20, 32);
  const mat = new THREE.MeshBasicMaterial({ color });
  const c = new THREE.Mesh(geo, mat);
  c.position.copy(pos);
  if (rot) c.rotation.setFromVector3(rot);
  scene.add(c);
}
cone(0xffa500, new THREE.Vector3(130,   0, 0), new THREE.Vector3(0, 0, -Math.PI/2)); // +X
cone(0x00ff00, new THREE.Vector3(  0, 130, 0), new THREE.Vector3(0, 0, 0));           // +Y

// --- rolling traces for Sx and Sy ---
const maxSamples = 800;
const xGeom = new THREE.BufferGeometry();
const yGeom = new THREE.BufferGeometry();
const xPositions = new Float32Array(maxSamples * 3);
const yPositions = new Float32Array(maxSamples * 3);
xGeom.setAttribute('position', new THREE.BufferAttribute(xPositions, 3));
yGeom.setAttribute('position', new THREE.BufferAttribute(yPositions, 3));

xGeom.attributes.position.setUsage(THREE.DynamicDrawUsage);
yGeom.attributes.position.setUsage(THREE.DynamicDrawUsage);
xGeom.setDrawRange(0, 1);
yGeom.setDrawRange(0, 1);

const xLine = new THREE.Line(xGeom, new THREE.LineBasicMaterial({ color: 0xffa500 }));
const yLine = new THREE.Line(yGeom, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
xLine.frustumCulled = false;
yLine.frustumCulled = false;
scene.add(xLine, yLine);

let writeIdx = 0;
function pushSample(xVal, yVal) {
  const scale = 100;   // amplitude scaling
  const step  = 0.5;   // time step per sample
  const tx = -maxSamples * step * 0.5 + writeIdx * step;

  // Sx trace (red)
  xPositions[3*writeIdx + 0] = 340 + tx;     // time → X
  xPositions[3*writeIdx + 1] = scale * xVal; // amp → Y
  xPositions[3*writeIdx + 2] = zPlane;

  // Sy trace (blue)
  yPositions[3*writeIdx + 0] = scale * yVal; // amp → X
  yPositions[3*writeIdx + 1] = 340 + tx;     // time → Y
  yPositions[3*writeIdx + 2] = zPlane;

  writeIdx = (writeIdx + 1) % maxSamples;

  xGeom.attributes.position.needsUpdate = true;
  yGeom.attributes.position.needsUpdate = true;

  const count = Math.min(writeIdx || 1, maxSamples);
  xGeom.setDrawRange(0, count);
  yGeom.setDrawRange(0, count);
  // (No per-frame computeBoundingSphere; done on clear)
}

function clearTraces() {
  xPositions.fill(0);
  yPositions.fill(0);
  writeIdx = 0;
  xGeom.setDrawRange(0, 1);
  yGeom.setDrawRange(0, 1);
  xGeom.attributes.position.needsUpdate = true;
  yGeom.attributes.position.needsUpdate = true;
  xGeom.computeBoundingSphere();
  yGeom.computeBoundingSphere();
}

// --- initial condition (90° pulse along +x) ---
(function apply90PulseX() {
  M.set(M0, 0, 0);
  t = 0;
})();
setArrowFromM(M);
pushSample(M.x, M.y);
renderer.render(scene, camera);

// --- physics step ---
const tHold = 0.20; // keep Mz=0 for a moment to illustrate T2-only then T1
function stepPhysics(dt) {
  t += dt;

  // relaxation
  const ex = Math.exp(-t / T2);
  let Mz = 0;
  if (t >= tHold) {
    const tau = t - tHold;
    Mz = M0 * (1 - Math.exp(-tau / T1));
  }

  const Mx = M0 * ex * Math.cos(omega0 * t + phi0);
  const My = -M0 * ex * Math.sin(omega0 * t + phi0);

  M.set(Mx, My, Mz);
  setArrowFromM(M);

  // sensors read transverse signals
  pushSample(Mx, My);
}

// --- animation loop ---
function animate() {
  requestAnimationFrame(animate);
  accumulator += clock.getDelta() *  timeScale;;
  while (accumulator >= dtFixed) {
    stepPhysics(dtFixed);
    accumulator -= dtFixed;
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();

// --- restart support ---
function restartSimulation() {
  // reset time & integrator
  t = 0;
  accumulator = 0;
  clock = new THREE.Clock(); // fresh elapsed time

  // 90° pulse initial condition
  M.set(M0, 0, 0);

  // clear traces and push the initial sample
  clearTraces();
  pushSample(M.x, M.y);

  // reset arrow
  setArrowFromM(M);
}

document.getElementById('restart-btn')?.addEventListener('click', restartSimulation);

// --- resize ---
window.addEventListener('resize', setRendererSize);
