import * as THREE from 'three';
import './style.css';

const root = document.querySelector('#scene');
const game = document.querySelector('#game');
const startScreen = document.querySelector('#start-screen');
const speedReadout = document.querySelector('#speed');
const distanceReadout = document.querySelector('#distance');
const gearReadout = document.querySelector('#gear');
const driveState = document.querySelector('#drive-state');
const revBar = document.querySelector('#rev-bar');
const progressBar = document.querySelector('#route-progress');
const roadAlert = document.querySelector('#road-alert');
const journeyLength = 2200;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#aebdb6');
scene.fog = new THREE.Fog('#aebdb6', 130, 760);

const camera = new THREE.PerspectiveCamera(68, 1, 0.1, 1300);
camera.position.set(0, 1.48, -3.2);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
root.append(renderer.domElement);

scene.add(new THREE.HemisphereLight('#e7f2ef', '#65735d', 2.2));
const sun = new THREE.DirectionalLight('#fff0d3', 2.8);
sun.position.set(-80, 120, -30);
scene.add(sun);

const materials = {
  grass: new THREE.MeshStandardMaterial({ color: '#667d51', roughness: 1 }),
  verge: new THREE.MeshStandardMaterial({ color: '#858a5e', roughness: 1 }),
  tarmac: new THREE.MeshStandardMaterial({ color: '#454a49', roughness: 0.92 }),
  edge: new THREE.MeshStandardMaterial({ color: '#d8d1b3', roughness: 0.95 }),
  center: new THREE.MeshStandardMaterial({ color: '#eee6c9', roughness: 0.92 }),
  trunk: new THREE.MeshStandardMaterial({ color: '#51483a', roughness: 1 }),
  leaf: new THREE.MeshStandardMaterial({ color: '#536948', roughness: 1 }),
  leafLight: new THREE.MeshStandardMaterial({ color: '#73825a', roughness: 1 }),
  stone: new THREE.MeshStandardMaterial({ color: '#b8af98', roughness: 0.95 }),
  brick: new THREE.MeshStandardMaterial({ color: '#a66f57', roughness: 0.95 }),
  roof: new THREE.MeshStandardMaterial({ color: '#554b44', roughness: 1 }),
  window: new THREE.MeshStandardMaterial({ color: '#44585a', roughness: 0.48, metalness: 0.12 }),
  wood: new THREE.MeshStandardMaterial({ color: '#756747', roughness: 1 }),
  sign: new THREE.MeshStandardMaterial({ color: '#f0e7ce', roughness: 0.9 }),
  dash: new THREE.MeshStandardMaterial({ color: '#26332e', roughness: 0.76 }),
  wheel: new THREE.MeshStandardMaterial({ color: '#171d1a', roughness: 0.56 }),
};

const cockpit = new THREE.Group();
camera.add(cockpit);
scene.add(camera);
const dashboard = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.24, 0.68), materials.dash);
dashboard.position.set(0, -0.94, -1.73);
cockpit.add(dashboard);
const bonnet = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.11, 0.75), new THREE.MeshStandardMaterial({ color: '#536958', roughness: 0.5, metalness: 0.25 }));
bonnet.position.set(0, -0.87, -2.37);
cockpit.add(bonnet);
const steeringWheel = new THREE.Group();
const wheelRing = new THREE.Mesh(new THREE.TorusGeometry(0.255, 0.027, 9, 40), materials.wheel);
steeringWheel.add(wheelRing);
const wheelHub = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.06, 16), materials.dash);
wheelHub.rotation.x = Math.PI / 2;
steeringWheel.add(wheelHub);
for (const angle of [0, Math.PI * 2 / 3, Math.PI * 4 / 3]) {
  const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.22, 0.035), materials.wheel);
  spoke.position.y = -0.095;
  spoke.rotation.z = angle;
  steeringWheel.add(spoke);
}
steeringWheel.position.set(0, -0.66, -1.38);
cockpit.add(steeringWheel);

function makeSignTexture(lines, foreground, background) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = lines.length > 1 ? 144 : 108;
  const context = canvas.getContext('2d');
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = foreground;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = `700 ${lines.length > 1 ? 47 : 40}px Manrope, sans-serif`;
  lines.forEach((line, index) => context.fillText(line, canvas.width / 2, canvas.height * (index + 0.5) / lines.length, 470));
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function roadCenter(z) {
  return Math.sin(z * 0.0026) * 9 + Math.sin(z * 0.0062 + 0.6) * 2.7 + Math.sin(z * 0.0011) * 3;
}

function roadSlope(z) {
  return (roadCenter(z + 0.5) - roadCenter(z - 0.5));
}

function buildStrip(width, heightAt, material, segments = 720, start = -60, end = 2380) {
  const positions = [];
  const indices = [];
  for (let index = 0; index <= segments; index += 1) {
    const z = start + (end - start) * index / segments;
    const center = roadCenter(z);
    const y = heightAt(z);
    positions.push(center - width / 2, y, z, center + width / 2, y, z);
    if (index < segments) {
      const current = index * 2;
      indices.push(current, current + 2, current + 1, current + 1, current + 2, current + 3);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

buildStrip(1800, () => -0.22, materials.grass, 260);
buildStrip(9.8, () => -0.1, materials.verge);
buildStrip(7.4, () => -0.075, materials.tarmac);

const roadsideGeometry = new THREE.BoxGeometry(0.14, 0.025, 1.7);
const dashes = new THREE.InstancedMesh(roadsideGeometry, materials.center, 264);
const dashMatrix = new THREE.Matrix4();
for (let index = 0; index < 264; index += 1) {
  const z = index * 9.2 - 48;
  dashMatrix.makeTranslation(roadCenter(z), -0.035, z);
  dashes.setMatrixAt(index, dashMatrix);
}
scene.add(dashes);

const hillMaterials = ['#82917b', '#788a76', '#71816f'].map(color => new THREE.MeshStandardMaterial({ color, roughness: 1 }));
for (let ridge = 0; ridge < 3; ridge += 1) {
  const points = [];
  for (let index = 0; index <= 48; index += 1) {
    const x = -620 + index * 26;
    const z = 430 + ridge * 95 + Math.sin(index * 0.42 + ridge) * 15 + Math.sin(index * 0.19) * 24;
    points.push(new THREE.Vector3(x, 0, z));
  }
  const shape = new THREE.Shape();
  shape.moveTo(points[0].x, 0);
  for (const point of points) shape.lineTo(point.x, point.z);
  shape.lineTo(points.at(-1).x, 0);
  shape.closePath();
  const geometry = new THREE.ShapeGeometry(shape, 1);
  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, -0.15 + ridge * 0.08, 0);
  scene.add(new THREE.Mesh(geometry, hillMaterials[ridge]));
}

function makeTree(x, z, scale = 1, light = false) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.scale.setScalar(scale);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.22, 2.1, 6), materials.trunk);
  trunk.position.y = 1.05;
  group.add(trunk);
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), light ? materials.leafLight : materials.leaf);
  crown.position.y = 2.65;
  crown.scale.set(1, 1.27, 0.95);
  group.add(crown);
  const crownTop = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 1), light ? materials.leaf : materials.leafLight);
  crownTop.position.set(0.25, 3.35, 0.04);
  group.add(crownTop);
  scene.add(group);
}

function makeHedge(x, z, width = 8, height = 1.5) {
  const hedge = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), materials.leaf);
  hedge.position.set(x, height / 2, z);
  hedge.scale.set(width / 2, height / 2, 1.5);
  scene.add(hedge);
}

function makeHouse(x, z, scale = 1, school = false) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.scale.setScalar(scale);
  const width = school ? 18 : 8.5;
  const height = school ? 5.2 : 5;
  const depth = school ? 8 : 7;
  const wall = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), school ? materials.brick : materials.stone);
  wall.position.y = height / 2;
  group.add(wall);
  const roofGeometry = new THREE.ConeGeometry(width * 0.76, school ? 2.3 : 3.8, 4);
  roofGeometry.rotateY(Math.PI / 4);
  const roof = new THREE.Mesh(roofGeometry, materials.roof);
  roof.position.set(0, height + (school ? 0.8 : 1.4), 0);
  roof.scale.set(1, 1, depth / width);
  group.add(roof);
  const columns = school ? 6 : 2;
  for (let index = 0; index < columns; index += 1) {
    const window = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.25, 0.09), materials.window);
    window.position.set((index - (columns - 1) / 2) * (school ? 2.55 : 2.7), 2.5, depth / 2 + 0.05);
    group.add(window);
  }
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.2, 0.12), materials.roof);
  door.position.set(school ? 0 : width * 0.25, 1.1, depth / 2 + 0.07);
  group.add(door);
  scene.add(group);
  return group;
}

function makeSchoolSign() {
  const sign = new THREE.Group();
  const postMaterial = new THREE.MeshStandardMaterial({ color: '#47554a', roughness: 1 });
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.1, 0.14), postMaterial);
  post.position.y = 1.05;
  const board = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.82, 0.16), materials.sign);
  board.position.y = 2.03;
  sign.add(post, board);
  const name = new THREE.Mesh(new THREE.PlaneGeometry(3.38, 0.68), new THREE.MeshBasicMaterial({ map: makeSignTexture(['STOKESLEY SCHOOL'], '#314137', '#f0e7ce') }));
  name.position.set(0, 2.03, 0.09);
  sign.add(name);
  sign.position.set(roadCenter(6) - 7.5, -0.05, 6);
  scene.add(sign);
}

makeHouse(roadCenter(-30) + 22, -24, 1.25, true);
makeSchoolSign();
for (let index = 0; index < 64; index += 1) {
  const z = -75 + index * 37 + (index % 3) * 9;
  const side = index % 2 === 0 ? -1 : 1;
  const distance = 15 + (index * 17 % 28);
  const x = roadCenter(z) + side * distance;
  if (index % 4 === 0) makeHouse(x, z, 0.7 + index % 3 * 0.09);
  else if (index % 5 === 0) makeHedge(x, z, 8 + index % 5, 1.4 + index % 4 * 0.14);
  else makeTree(x, z, 0.7 + (index * 13 % 55) / 100, index % 3 === 0);
}

for (let side = -1; side <= 1; side += 2) {
  for (let index = 0; index < 34; index += 1) {
    const z = 90 + index * 63 + (index % 4) * 17;
    const distance = 13 + (index * 19 % 34);
    const x = roadCenter(z) + side * distance;
    if (index % 7 === 0) makeHouse(x, z, 0.8);
    else if (index % 3 === 0) makeHedge(x, z, 11 + index % 7, 1.6);
    else makeTree(x, z, 0.65 + index % 4 * 0.14, index % 2 === 0);
  }
}

const signPostMaterial = new THREE.MeshStandardMaterial({ color: '#f0eee3', roughness: 0.7 });
for (const marker of [390, 870, 1480]) {
  const sign = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 2.5, 7), signPostMaterial);
  post.position.y = 1.25;
  const board = new THREE.Mesh(new THREE.BoxGeometry(3.7, 1.05, 0.16), materials.leaf);
  board.position.y = 2.7;
  sign.add(post, board);
  const destination = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.9), new THREE.MeshBasicMaterial({ map: makeSignTexture(['NORTH YORK', 'MOORS'], '#f3edda', '#536948') }));
  destination.position.set(0, 2.7, 0.09);
  sign.add(destination);
  sign.position.set(roadCenter(marker) - 7.4, -0.02, marker);
  scene.add(sign);
}

const state = { started: false, speed: 0, distance: 0, offset: 0, steer: 0, braking: false, alertTimeout: 0 };
const held = new Set();
const touchHeld = new Set();
const timer = new THREE.Clock();

function showAlert(message) {
  roadAlert.textContent = message;
  roadAlert.classList.add('visible');
  window.clearTimeout(state.alertTimeout);
  state.alertTimeout = window.setTimeout(() => roadAlert.classList.remove('visible'), 1900);
}

function startDrive() {
  state.started = true;
  startScreen.classList.add('dismissed');
  game.classList.add('driving');
}

document.querySelector('#start-drive').addEventListener('click', startDrive);
window.addEventListener('keydown', event => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
  held.add(event.code.toLowerCase());
  if (!state.started && ['enter', 'arrowup', 'w'].includes(event.key.toLowerCase())) startDrive();
});
window.addEventListener('keyup', event => held.delete(event.code.toLowerCase()));
window.addEventListener('blur', () => { held.clear(); touchHeld.clear(); });

for (const button of document.querySelectorAll('[data-control]')) {
  const control = button.dataset.control;
  const release = event => {
    event.preventDefault();
    touchHeld.delete(control);
    button.classList.remove('pressed');
  };
  button.addEventListener('pointerdown', event => {
    event.preventDefault();
    if (!state.started) startDrive();
    touchHeld.add(control);
    button.classList.add('pressed');
    button.setPointerCapture(event.pointerId);
  });
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
}

function pressed(...keys) {
  return keys.some(key => held.has(key) || touchHeld.has(key));
}

function update(delta) {
  const accelerate = pressed('w', 'arrowup', 'accelerate');
  const brake = pressed('s', 'arrowdown', 'brake', 'space');
  const left = pressed('a', 'arrowleft', 'left');
  const right = pressed('d', 'arrowright', 'right');
  const steering = Number(right) - Number(left);
  const offRoad = Math.abs(state.offset) > 2.8;
  if (state.started) {
    if (accelerate) state.speed += (offRoad ? 13 : 21) * delta;
    else state.speed -= (brake ? 44 : 6) * delta;
    state.speed = THREE.MathUtils.clamp(state.speed, 0, offRoad ? 32 : 78);
    state.steer = THREE.MathUtils.damp(state.steer, steering, steering ? 7 : 4, delta);
    state.offset += state.steer * delta * (0.55 + state.speed / 15);
    if (offRoad) state.speed = Math.max(0, state.speed - 11 * delta);
    state.distance = Math.min(journeyLength, state.distance + state.speed / 3.6 * delta);
  } else {
    state.speed = 0;
  }

  const z = state.distance;
  const center = roadCenter(z);
  const heading = Math.atan(roadSlope(z));
  const lateral = state.offset * Math.cos(heading);
  camera.position.set(center + lateral, 1.5 + Math.min(state.speed / 180, 0.27), z - 3.2);
  camera.rotation.set(0, 0, 0);
  camera.rotation.y = heading - Math.PI - state.steer * 0.028;
  camera.rotation.z = -state.steer * Math.min(state.speed / 600, 0.055);
  camera.rotation.x = Math.sin(z * 0.003) * 0.006;
  steeringWheel.rotation.z = -state.steer * 0.55;
  renderer.render(scene, camera);

  const displaySpeed = Math.round(state.speed);
  speedReadout.textContent = String(displaySpeed).padStart(2, '0');
  distanceReadout.textContent = `${(state.distance / 1000).toFixed(1)} KM`;
  gearReadout.textContent = state.speed < 1 ? '1' : String(Math.min(5, Math.floor(state.speed / 16) + 1));
  driveState.textContent = !state.started ? 'PARKED' : brake ? 'BRAKING' : accelerate ? 'DRIVING' : 'COASTING';
  revBar.style.width = `${Math.max(4, state.speed / 78 * 100)}%`;
  progressBar.style.width = `${state.distance / journeyLength * 100}%`;

  const alertVisible = Math.abs(state.offset) > 4.1;
  if (alertVisible && !roadAlert.classList.contains('visible')) showAlert('EASE BACK ONTO THE ROAD');
  if (displaySpeed > 58 && !brake && Math.floor(performance.now() / 12000) !== state.lastSpeedAlert) {
    state.lastSpeedAlert = Math.floor(performance.now() / 12000);
    showAlert('EASY NOW — ENJOY THE DRIVE');
  }
}

function resize() {
  const width = root.clientWidth;
  const height = root.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

window.addEventListener('resize', resize);
resize();

function frame() {
  update(Math.min(timer.getDelta(), 0.05));
  window.requestAnimationFrame(frame);
}

frame();