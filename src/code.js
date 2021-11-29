// import \* as THREE from '/Users/TKimhofer/Downloads/three.js-master/build/three.module.js';

// import {
//     BoxBufferGeometry,
//     Color,
//     Mesh,
//     MeshBasicMaterial,
//     PerspectiveCamera,
//     Scene,
//     WebGLRenderer,
//   } from "https://cdn.skypack.dev/three@0.132.2";
  
import * as THREE from "https://cdn.skypack.dev/three@0.132.2";
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.131.1/examples/jsm/controls/OrbitControls'
//import { GUI } from 'three/examples/jsm/libs/dat.gui.module'
//import { GUI } from './jsm/libs/dat.gui.module.js';
  
//   from '/Users/TKimhofer/Downloads/three.js-master/build/three.js';
//   from "https://cdn.skypack.dev/three@0.132.2"; 

// Get a reference to the container element that will hold our scene
// const container = document.querySelector('#scene-container');

scene = new THREE.Scene();
var container, scene, camera, renderer;
var SCREEN_WIDTH = window.innerWidth,
  SCREEN_HEIGHT = window.innerHeight;
var VIEW_ANGLE = 35,
  ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
  NEAR = 0.1,
  FAR = 20000;

camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
camera.position.set(300, 100, 300);
camera.lookAt(scene.position);
scene.add(camera);

renderer = new THREE.WebGLRenderer({antialias: true });
renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
const controls = new OrbitControls(camera, renderer.domElement)

// document.querySelector('#scene-container');
container =  document.querySelector('#scene-container');
// container.appendChild(renderer.domElement);
let light = new THREE.AmbientLight(0xFFFFFF); // soft white light
scene.add(light);

let axes = new THREE.AxesHelper(1000).setColors(0xFF0000, 0x00FF00, 0x0000FF) ;
scene.add(axes);  

// create a geometry
var dir = new THREE.Vector3(0, 0, 1);
let pos = new THREE.Vector3(0, 1, 0);
pos.applyAxisAngle(dir.normalize(), 0)
// pos.applyQuaternion(0)
var arrow1 = new THREE.ArrowHelper(dir, pos, 100, 0x000000, 40);
scene.add(arrow1);
let phi_add=0.2

var geometry1 = new THREE.SphereGeometry(
  100, 100, 100,
  ((Math.PI*2)/360) * 225, 
  Math.PI, // full horizontal circle
  0,
  Math.PI
  //radius: 10
  // widthSegments:100, 
  // heightSegments:100, 
  // phiStart:Math.PI*2, 
  // phiLength:-Math.PI*1, 
  // thetaStart:5.3, 
  // thetaLength:Math.PI
);

var material1 = new THREE.MeshBasicMaterial({ color: 0xdddddd});
const mesh1 = new THREE.Mesh(geometry1, material1);
mesh1.material.side = THREE.DoubleSide;
scene.add(mesh1);


// next, set the renderer to the same size as our container element
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.append(renderer.domElement);

// place detector cones
const det_x_geo = new THREE.ConeGeometry( 5, 20, 32 );
const det_x_mat = new THREE.MeshBasicMaterial( {color: 0xFF0000} );
const det_x = new THREE.Mesh( det_x_geo, det_x_mat );
scene.add( det_x );
det_x.position.set(100, 0, 0);
det_x.rotateZ(-Math.PI/2)

const det_y_geo = new THREE.ConeGeometry( 5, 20, 32 );
const det_y_mat = new THREE.MeshBasicMaterial( {color: 0x00aaFF} );
const det_y = new THREE.Mesh( det_y_geo, det_y_mat );
scene.add( det_y );
det_y.position.set(0, 0, 100);
det_y.rotateX(Math.PI/2)

// place detector signal
var ball_x_mat = new THREE.MeshBasicMaterial({'color': 0xff0000});
var sp_x = new THREE.Mesh(new THREE.SphereGeometry(1, 100, 50), ball_x_mat);
sp_x.position.set(110, 0, 0);
scene.add(sp_x);

var ball_y_mat = new THREE.MeshBasicMaterial({'color': 0x0000ff});
var sp_y = new THREE.Mesh(new THREE.SphereGeometry(1, 100, 50), ball_y_mat);
sp_y.position.set(0, 0, 110);
scene.add(sp_y);

const lxmaterial = new THREE.LineBasicMaterial({color: 0xFF0000});

const lxpoints = [];
lxpoints.push( new THREE.Vector3( 110, 0, 0) );
//lpoints.push( new THREE.Vector3( 0, 100, 0 ) );
const lxgeometry = new THREE.BufferGeometry().setFromPoints( lxpoints );
//const xline = new THREE.Line( lxgeometry, lxmaterial );

const lymaterial = new THREE.LineBasicMaterial({color: 0x0000FF});
const lypoints = [];
lypoints.push( new THREE.Vector3( 0, 0, 110) );
const lygeometry = new THREE.BufferGeometry().setFromPoints( lypoints );
//const yline = new THREE.Line( lygeometry, lymaterial );

var center = new THREE.Vector2(0,0, 0);
var lastPosition = new THREE.Vector3(10, 0, 0); // Store starting position.
var frame = 0;
var maxFrame = 300;

var zdir=0
var zstep =1000
let radius_xy=100
let phi_rad_xy = 0

var time=1
var off_flip=10

const x_points = [];

function animate() {
  requestAnimationFrame(animate);

  if(time <=off_flip ){
    var dir = new THREE.Vector3(0.4, 1*(1-(time/off_flip)), 0);
    arrow1.setDirection(dir);
  }
  time += 1;
  if (time > off_flip+20){
    let time1=time-(off_flip+20)
    zdir += (zstep/Math.PI);
  if(zdir >  Math.PI * 2) zdir = 0;
  if(time >  Math.PI * 2) zdir = 0;

  var per = zdir ;
  var rad = zdir;

  // var x_pos = Math.cos(zdir) * Math.exp(time/20);
  // var y_pos = Math.sin(zdir) * Math.exp(time/20);
  
  var theta=0.4*(Math.PI)
  var omega = 50/1000
  var M =0.2
  // bloch equations 
  var x_pos = M  * Math.cos(omega*time1); //Math.sin(theta) * 
  var y_pos = M  * Math.sin(omega*time1); //* Math.cos(theta)
  var z_pos = M * time1/30 * Math.cos(theta);

  //if (z_pos > 1) time =1
  //var x_pos = M * Math.sin(theta) * Math.cos(omega*time);

  // var y = rad

  // can change the direction
  var dir = new THREE.Vector3(x_pos, z_pos, y_pos);
  arrow1.setDirection(dir);

  let x_pos_comp= x_pos * (1-(z_pos))
  let y_pos_comp= y_pos * (1-(z_pos))
  if (z_pos > 1) x_pos_comp =0
  if (z_pos > 1) y_pos_comp =0
  //console.log(z_pos)

  var sp_x_pos = new THREE.Vector3( 110+(time-(off_flip+20))/10, 200*(x_pos_comp), 0);
  sp_x.position.copy(sp_x_pos);
  lxpoints.push( new THREE.Vector3( 110+(time-(off_flip+20))/10, 200*(x_pos_comp), 0 ) );
  const lxgeometry = new THREE.BufferGeometry().setFromPoints( lxpoints );
  const xline = new THREE.Line( lxgeometry, lxmaterial );
  scene.add( xline );

  let vy = new THREE.Vector3(0 , 200*(y_pos_comp), (110+(time-(off_flip+20))/10))
  lypoints.push( vy);
  const lygeometry = new THREE.BufferGeometry().setFromPoints( lypoints );
  const yline = new THREE.Line( lygeometry, lymaterial );
  scene.add( yline );

  var sp_y_pos = new THREE.Vector3(0, 200*(y_pos_comp), (110+(time-(off_flip+20))/10));
  sp_y.position.copy(sp_y_pos);
  sp_y.rotateY(3);

  // frame += 1;
  // frame %= maxFrame;
  }
  renderer.render(scene, camera);
}

// const gui = new GUI();

// gui.add( effectController, 'focalLength', 1, 135, 0.01 ).onChange( matChanger );
// gui.add( effectController, 'fstop', 1.8, 22, 0.01 ).onChange( matChanger );
// gui.add( effectController, 'focalDepth', 0.1, 100, 0.001 ).onChange( matChanger );
// gui.add( effectController, 'showFocus', true ).onChange( matChanger );
animate();