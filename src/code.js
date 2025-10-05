import * as THREE from "https://cdn.skypack.dev/three@0.152.2";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.152.2/examples/jsm/controls/OrbitControls.js";

// --- basic scene ---
const container = document.querySelector('#scene-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 20000);
camera.position.set(300, 140, 300);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
container.append(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
scene.add(new THREE.AmbientLight(0xffffff, 1));

const axes = new THREE.AxesHelper(120);
scene.add(axes);

// --- constants (NMR model) ---
const M0     = 1.0;
const T1     = 1.8;   // seconds (example)
const T2     = 0.35;  // seconds (example); use shorter for T2* if desired
const omega0 = 2 * Math.PI * 30; // rad/s (example 30 Hz precession)
const phi0   = 0;     // initial phase in XY after pulse
const pulseDur = 0.015; // 15 ms "hard" 90° pulse (we’ll just jump state for simplicity)

// --- magnetisation state ---
let t = 0;
let pulsed = false;
let M = new THREE.Vector3(0, 0, M0); // start at equilibrium along +Z

// --- visuals: magnetisation arrow ---
const arrowDir = new THREE.Vector3(0, 0, 1);
const arrow = new THREE.ArrowHelper(arrowDir, new THREE.Vector3(0,0,0), 100, 0x111111, 10, 5);
scene.add(arrow);

// detector cones (just visuals)
function cone(color, pos, rot) {
  const c = new THREE.Mesh(new THREE.ConeGeometry(5, 20, 32), new THREE.MeshBasicMaterial({ color }));
  c.position.copy(pos);
  if (rot) c.rotation.setFromVector3(rot);
  scene.add(c);
}
cone(0xff0000, new THREE.Vector3(100,0,0), new THREE.Vector3(0,0,-Math.PI/2)); // X
cone(0x0088ff, new THREE.Vector3(0,0,100), new THREE.Vector3(Math.PI/2,0,0));   // Y

// --- rolling traces for Sx and Sy ---
const maxSamples = 800;
const xGeom = new THREE.BufferGeometry();
const yGeom = new THREE.BufferGeometry();
const xPositions = new Float32Array(maxSamples * 3);
const yPositions = new Float32Array(maxSamples * 3);
xGeom.setAttribute('position', new THREE.BufferAttribute(xPositions, 3));
yGeom.setAttribute('position', new THREE.BufferAttribute(yPositions, 3));
const xLine = new THREE.Line(xGeom, new THREE.LineBasicMaterial({ color: 0xff0000 }));
const yLine = new THREE.Line(yGeom, new THREE.LineBasicMaterial({ color: 0x0000ff }));
scene.add(xLine, yLine);

let writeIdx = 0;
function pushSample(xVal, yVal) {
  // plot along +X (time) for Sx, along +Z for Sy; scale for visibility
  const scale = 120;      // amplitude scaling
  const step  = 0.5;      // pixel step per sample
  const tx = -maxSamples * step * 0.5 + writeIdx * step;

  // Sx trace in XZ plane at Y=80 (red)
  xPositions[3*writeIdx + 0] = 110 + tx;
  xPositions[3*writeIdx + 1] = 80;
  xPositions[3*writeIdx + 2] = scale * xVal;

  // Sy trace in XY plane at Z=110 (blue)
  yPositions[3*writeIdx + 0] = scale * yVal;
  yPositions[3*writeIdx + 1] = 80;
  yPositions[3*writeIdx + 2] = 110 + tx;

  writeIdx = (writeIdx + 1) % maxSamples;
  xGeom.attributes.position.needsUpdate = true;
  yGeom.attributes.position.needsUpdate = true;
}

// --- helpers ---
const clock = new THREE.Clock();
const dtFixed = 1/240; // physics step
let accumulator = 0;

// optional: simple “apply 90° pulse” shortcut (tip M from +Z to +X)
function apply90PulseX() {
  // After a perfect 90° pulse on y, M rotates from +Z to +X.
  M.set(M0, 0, 0); // start FID in the transverse plane
  pulsed = true;
  t = 0;
}

apply90PulseX();

// --- main loop ---
function stepPhysics(dt) {
  t += dt;

  // Free precession + relaxation closed form (post-90° FID)
  const ex = Math.exp(-t / T2);
  const ez = 1 - Math.exp(-t / T1);

  const Mx = M0 * ex * Math.cos(omega0 * t + phi0);
  const My = M0 * ex * Math.sin(omega0 * t + phi0);
  const Mz = M0 * ez; // recovers to +Z

  // update vector and arrow
  M.set(Mx, My, Mz);
  const dir = new THREE.Vector3(Mx, My, Mz).normalize();
  arrow.setDirection(dir);
  arrow.setLength(100 * Math.min(1, Math.sqrt(Mx*Mx + My*My + Mz*Mz) / M0));

  // sensor signals (projections)
  const Sx = Mx; // detector along X
  const Sy = My; // detector along Y (90° phase)
  pushSample(Sx, Sy);
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

// --- resize ---
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});
