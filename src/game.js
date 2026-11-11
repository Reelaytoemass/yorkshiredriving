import * as THREE from 'three';
import stokesleyMap from './data/stokesley.json';
import './style.css';

const root = document.querySelector('#scene');
const game = document.querySelector('#game');
const startScreen = document.querySelector('#start-screen');
const speedReadout = document.querySelector('#speed');
const distanceReadout = document.querySelector('#distance');
const gearReadout = document.querySelector('#gear');
const driveState = document.querySelector('#drive-state');
const revBar = document.querySelector('#rev-bar');
const roadAlert = document.querySelector('#road-alert');
const locationReadout = document.querySelector('.location-name');
const roadNumber = document.querySelector('#road-number');
const roadType = document.querySelector('#road-type');
const junctionReadout = document.querySelector('#junction-info');
const mapCanvas = document.querySelector('#map-canvas');
const mapContext = mapCanvas.getContext('2d');

const WORLD_SCALE = 1000;
const MAX_SPEED = 82;
const nodes = [
  { id: 'stokesley', name: 'Stokesley', x: 0, z: 0, kind: 'town' },
  { id: 'great-ayton', name: 'Great Ayton', x: -1.3, z: 1.8, kind: 'village' },
  { id: 'roseberry', name: 'Roseberry Topping', x: -3.2, z: 3.2, kind: 'landmark' },
  { id: 'guisborough', name: 'Guisborough', x: -4.7, z: 0.6, kind: 'town' },
  { id: 'middlesbrough', name: 'Middlesbrough', x: -5.6, z: -2.7, kind: 'town' },
  { id: 'castleton', name: 'Castleton', x: -1.9, z: 5.7, kind: 'village' },
  { id: 'whitby', name: 'Whitby', x: 0.4, z: 9.1, kind: 'coast' },
  { id: 'pickering', name: 'Pickering', x: 4.5, z: 8.4, kind: 'town' },
  { id: 'scarborough', name: 'Scarborough', x: 8, z: 10.5, kind: 'coast' },
  { id: 'malton', name: 'Malton', x: 7.4, z: 5.2, kind: 'town' },
  { id: 'york', name: 'York', x: 8.8, z: -8.8, kind: 'town' },
  { id: 'helmsley', name: 'Helmsley', x: 3, z: 4.2, kind: 'town' },
  { id: 'kirkbymoorside', name: 'Kirkbymoorside', x: 5.3, z: 6.3, kind: 'town' },
  { id: 'thirsk', name: 'Thirsk', x: 5.2, z: -1.5, kind: 'town' },
  { id: 'northallerton', name: 'Northallerton', x: 7.3, z: -4.3, kind: 'town' },
  { id: 'easingwold', name: 'Easingwold', x: 7.4, z: -5.8, kind: 'town' },
  { id: 'richmond', name: 'Richmond', x: 3.6, z: -7.3, kind: 'town' },
  { id: 'leyburn', name: 'Leyburn', x: 1, z: -5.2, kind: 'village' },
  { id: 'askrigg', name: 'Askrigg', x: -0.5, z: -8.1, kind: 'village' },
  { id: 'reeth', name: 'Reeth', x: -0.8, z: -9.1, kind: 'village' },
  { id: 'hawes', name: 'Hawes', x: -2.2, z: -11.2, kind: 'village' },
  { id: 'settle', name: 'Settle', x: -4.4, z: -13.2, kind: 'town' },
  { id: 'chop-gate', name: 'Chop Gate', x: 1.6, z: 1.8, kind: 'village' },
  { id: 'great-broughton', name: 'Great Broughton', x: 0.6, z: 0.8, kind: 'village' },
  { id: 'kildale', name: 'Kildale', x: -2.7, z: 4.4, kind: 'village' },
  { id: 'egton', name: 'Egton', x: 1.8, z: 8.2, kind: 'village' },
  { id: 'sutton-bank', name: 'Sutton Bank', x: 4, z: 1.2, kind: 'landmark' },
  { id: 'bedale', name: 'Bedale', x: 4.1, z: -3.2, kind: 'village' },
];

const nodeById = new Map(nodes.map(node => [node.id, node]));
const roads = [
  { from: 'stokesley', to: 'great-ayton', name: 'B1257', type: 'MOOR ROAD', via: [] },
  { from: 'great-ayton', to: 'roseberry', name: 'B1292', type: 'COUNTRY ROAD', via: [] },
  { from: 'roseberry', to: 'guisborough', name: 'A173', type: 'MOOR ROAD', via: [] },
  { from: 'guisborough', to: 'middlesbrough', name: 'A171', type: 'A-ROAD', via: [] },
  { from: 'guisborough', to: 'castleton', name: 'B1366', type: 'MOOR ROAD', via: ['kildale'] },
  { from: 'castleton', to: 'whitby', name: 'A169', type: 'MOOR ROAD', via: [] },
  { from: 'whitby', to: 'pickering', name: 'A169', type: 'MOOR ROAD', via: ['egton'] },
  { from: 'pickering', to: 'scarborough', name: 'A170', type: 'COAST ROAD', via: [] },
  { from: 'pickering', to: 'malton', name: 'A169', type: 'COUNTRY ROAD', via: [] },
  { from: 'malton', to: 'scarborough', name: 'A64', type: 'COAST ROAD', via: [] },
  { from: 'malton', to: 'york', name: 'A64', type: 'A-ROAD', via: [] },
  { from: 'york', to: 'easingwold', name: 'A19', type: 'A-ROAD', via: [] },
  { from: 'easingwold', to: 'thirsk', name: 'A19', type: 'A-ROAD', via: [] },
  { from: 'pickering', to: 'kirkbymoorside', name: 'A170', type: 'COUNTRY ROAD', via: [] },
  { from: 'kirkbymoorside', to: 'helmsley', name: 'A170', type: 'COUNTRY ROAD', via: [] },
  { from: 'helmsley', to: 'thirsk', name: 'A170', type: 'MOOR ROAD', via: ['sutton-bank'] },
  { from: 'thirsk', to: 'northallerton', name: 'A167', type: 'A-ROAD', via: [] },
  { from: 'northallerton', to: 'richmond', name: 'A1', type: 'COUNTRY ROAD', via: [] },
  { from: 'richmond', to: 'leyburn', name: 'A6108', type: 'DALES ROAD', via: [] },
  { from: 'leyburn', to: 'thirsk', name: 'A684', type: 'COUNTRY ROAD', via: ['bedale'] },
  { from: 'richmond', to: 'reeth', name: 'B6270', type: 'DALES ROAD', via: [] },
  { from: 'leyburn', to: 'askrigg', name: 'A684', type: 'DALES ROAD', via: [] },
  { from: 'askrigg', to: 'hawes', name: 'A684', type: 'DALES ROAD', via: [] },
  { from: 'reeth', to: 'hawes', name: 'B6270', type: 'DALES ROAD', via: [] },
  { from: 'hawes', to: 'settle', name: 'B6255', type: 'DALES ROAD', via: [] },
  { from: 'reeth', to: 'castleton', name: 'MOOR ROAD', type: 'MOOR ROAD', via: ['kildale'] },
  { from: 'great-ayton', to: 'chop-gate', name: 'B1257', type: 'MOOR ROAD', via: [] },
  { from: 'chop-gate', to: 'helmsley', name: 'B1257', type: 'MOOR ROAD', via: [] },
  { from: 'stokesley', to: 'great-broughton', name: 'B1257', type: 'COUNTRY ROAD', via: [] },
  { from: 'great-broughton', to: 'chop-gate', name: 'B1257', type: 'COUNTRY ROAD', via: [] },
  { from: 'roseberry', to: 'kildale', name: 'COUNTRY ROAD', type: 'MOOR ROAD', via: [] },
];

const scene = new THREE.Scene();
scene.background = new THREE.Color('#aebdb6');
scene.fog = new THREE.Fog('#aebdb6', 1700, 14000);

const camera = new THREE.PerspectiveCamera(68, 1, 0.1, 24000);
camera.position.set(0, 1.5, -4);

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
  grass: new THREE.MeshStandardMaterial({ color: '#788568', roughness: 1 }),
  verge: new THREE.MeshStandardMaterial({ color: '#858a68', roughness: 1 }),
  tarmac: new THREE.MeshStandardMaterial({ color: '#454a49', roughness: 0.92 }),
  center: new THREE.MeshStandardMaterial({ color: '#eee6c9', roughness: 0.92 }),
  trunk: new THREE.MeshStandardMaterial({ color: '#51483a', roughness: 1 }),
  leaf: new THREE.MeshStandardMaterial({ color: '#536948', roughness: 1 }),
  leafLight: new THREE.MeshStandardMaterial({ color: '#73825a', roughness: 1 }),
  stone: new THREE.MeshStandardMaterial({ color: '#b8af98', roughness: 0.95 }),
  brick: new THREE.MeshStandardMaterial({ color: '#a66f57', roughness: 0.95 }),
  roof: new THREE.MeshStandardMaterial({ color: '#554b44', roughness: 1 }),
  window: new THREE.MeshStandardMaterial({ color: '#44585a', roughness: 0.48, metalness: 0.12 }),
  sign: new THREE.MeshStandardMaterial({ color: '#f0e7ce', roughness: 0.9 }),
  dash: new THREE.MeshStandardMaterial({ color: '#26332e', roughness: 0.76 }),
  wheel: new THREE.MeshStandardMaterial({ color: '#171d1a', roughness: 0.56 }),
};

const ground = new THREE.Mesh(new THREE.PlaneGeometry(40000, 40000), materials.grass);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.25;
ground.receiveShadow = true;
scene.add(ground);

function worldPoint(node) {
  return new THREE.Vector3(node.x * WORLD_SCALE, 0, node.z * WORLD_SCALE);
}

function addStokesleyMap() {
  const campusShape = new THREE.Shape();
  stokesleyMap.school.forEach(([x, z], index) => {
    if (index === 0) campusShape.moveTo(x, -z);
    else campusShape.lineTo(x, -z);
  });
  campusShape.closePath();
  const campusGeometry = new THREE.ShapeGeometry(campusShape);
  campusGeometry.rotateX(-Math.PI / 2);
  campusGeometry.translate(0, -0.16, 0);
  scene.add(new THREE.Mesh(
    campusGeometry,
    new THREE.MeshStandardMaterial({ color: '#758568', roughness: 1, side: THREE.DoubleSide }),
  ));

  const vergePositions = [];
  const roadPositions = [];
  const roadIndices = [];
  const buildingWalls = [[], []];
  const buildingWallIndices = [[], []];
  const roofPositions = [];
  const roofIndices = [];
  const roadWidths = {
    trunk: 10,
    primary: 9,
    secondary: 8,
    tertiary: 7,
    unclassified: 5.8,
    residential: 5.6,
    living_street: 5.2,
    service: 4.5,
  };
  const isSchoolBuilding = (x, z) => {
    let inside = false;
    for (let index = 0, previous = stokesleyMap.school.length - 1; index < stokesleyMap.school.length; previous = index, index += 1) {
      const [x1, z1] = stokesleyMap.school[index];
      const [x2, z2] = stokesleyMap.school[previous];
      if ((z1 > z) !== (z2 > z) && x < (x2 - x1) * (z - z1) / (z2 - z1) + x1) inside = !inside;
    }
    return inside;
  };

  for (const road of stokesleyMap.roads) {
    const width = roadWidths[road.type] ?? 5.5;
    for (let index = 1; index < road.points.length; index += 1) {
      const [x1, z1] = road.points[index - 1];
      const [x2, z2] = road.points[index];
      const dx = x2 - x1;
      const dz = z2 - z1;
      const length = Math.hypot(dx, dz);
      if (length < 0.1) continue;
      const sideX = dz / length;
      const sideZ = -dx / length;
      const appendStrip = (positions, stripWidth) => {
        positions.push(
          x1 - sideX * stripWidth / 2, z1 - sideZ * stripWidth / 2,
          x1 + sideX * stripWidth / 2, z1 + sideZ * stripWidth / 2,
          x2 - sideX * stripWidth / 2, z2 - sideZ * stripWidth / 2,
          x2 + sideX * stripWidth / 2, z2 + sideZ * stripWidth / 2,
        );
      };
      appendStrip(vergePositions, width + 1.6);
      const base = roadPositions.length / 2;
      appendStrip(roadPositions, width);
      roadIndices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
    }
  }

  function addSurface(positions, indices, y, material) {
    if (!positions.length) return;
    const vertices = [];
    for (let index = 0; index < positions.length; index += 2) {
      vertices.push(positions[index], y, positions[index + 1]);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    if (indices) geometry.setIndex(indices);
    geometry.computeVertexNormals();
    scene.add(new THREE.Mesh(geometry, material));
  }

  const stripIndices = Array.from({ length: roadPositions.length / 2 / 4 }, (_, index) => {
    const base = index * 4;
    return [base, base + 2, base + 1, base + 1, base + 2, base + 3];
  }).flat();
  addSurface(vergePositions, stripIndices, -0.07, materials.verge);
  addSurface(roadPositions, roadIndices, -0.025, materials.tarmac);

  for (const building of stokesleyMap.buildings) {
    if (building.points.length < 3) continue;
    const contour = building.points.map(([x, z]) => new THREE.Vector2(x, -z));
    const center = building.points.reduce((result, [x, z]) => [result[0] + x, result[1] + z], [0, 0])
      .map(value => value / building.points.length);
    const belongsToSchool = isSchoolBuilding(center[0], center[1]);
    const wallGroup = belongsToSchool ? 1 : 0;
    const levelCount = Number.parseInt(building.levels, 10);
    const height = THREE.MathUtils.clamp(Number.isFinite(levelCount) ? levelCount * 3 : wallGroup ? 6.5 : 4.6, 3.4, 13);
    const walls = buildingWalls[wallGroup];
    const wallIndices = buildingWallIndices[wallGroup];
    for (let index = 0; index < building.points.length; index += 1) {
      const [x1, z1] = building.points[index];
      const [x2, z2] = building.points[(index + 1) % building.points.length];
      const base = walls.length / 3;
      walls.push(x1, 0, z1, x1, height, z1, x2, height, z2, x2, 0, z2);
      wallIndices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }

    for (const [a, b, c] of THREE.ShapeUtils.triangulateShape(contour, [])) {
      for (const index of [a, b, c]) {
        roofPositions.push(building.points[index][0], height, building.points[index][1]);
      }
      const triangle = roofIndices.length;
      roofIndices.push(triangle, triangle + 1, triangle + 2);
    }
  }

  const addBuildingMesh = (positions, indices, material) => {
    if (!positions.length) return;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    scene.add(new THREE.Mesh(geometry, material));
  };
  addBuildingMesh(buildingWalls[0], buildingWallIndices[0], materials.stone);
  addBuildingMesh(buildingWalls[1], buildingWallIndices[1], materials.brick);
  addBuildingMesh(roofPositions, roofIndices, materials.roof);
}

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
  context.font = `700 ${lines.length > 1 ? 45 : 40}px Manrope, sans-serif`;
  lines.forEach((line, index) => context.fillText(line, canvas.width / 2, canvas.height * (index + 0.5) / lines.length, 470));
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function addRibbon(curve, width, material, height, segments) {
  const positions = [];
  const indices = [];
  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const sideX = tangent.z;
    const sideZ = -tangent.x;
    positions.push(
      point.x - sideX * width / 2, height, point.z - sideZ * width / 2,
      point.x + sideX * width / 2, height, point.z + sideZ * width / 2,
    );
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

function makeHouse(x, z, scale = 1, school = false, rotation = 0) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotation;
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
}

function addRoadsideSign(node, tangent, school = false) {
  const forward = tangent.clone().setY(0).normalize();
  const side = new THREE.Vector3(forward.z, 0, -forward.x);
  const position = worldPoint(node).addScaledVector(side, 13);
  position.y = -0.04;
  const group = new THREE.Group();
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.1, 0.14), materials.trunk);
  post.position.y = 1.05;
  const board = new THREE.Mesh(new THREE.BoxGeometry(school ? 4.3 : 4.1, 0.92, 0.16), materials.sign);
  board.position.y = 2.05;
  const label = school ? 'STOKESLEY SCHOOL' : node.name.toUpperCase();
  const name = new THREE.Mesh(
    new THREE.PlaneGeometry(school ? 4.1 : 3.9, 0.78),
    new THREE.MeshBasicMaterial({ map: makeSignTexture([label], '#314137', '#f0e7ce'), side: THREE.DoubleSide }),
  );
  name.position.set(0, 2.05, 0.1);
  group.add(post, board, name);
  group.position.copy(position);
  group.rotation.y = Math.atan2(forward.x, forward.z);
  scene.add(group);
}

const edges = roads.map((road, index) => {
  const from = nodeById.get(road.from);
  const to = nodeById.get(road.to);
  const points = [from, ...road.via.map(id => nodeById.get(id)), to].map(worldPoint);
  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.24);
  curve.arcLengthDivisions = 360;
  const length = curve.getLength();
  const edge = { ...road, index, a: from.id, b: to.id, curve, length };
  edge.segments = Math.max(24, Math.ceil(length / 8));
  addRibbon(curve, 11.5, materials.verge, -0.075, edge.segments);
  addRibbon(curve, 7.6, materials.tarmac, -0.035, edge.segments);

  const roadsideGeometry = new THREE.BoxGeometry(0.13, 0.025, 3.4);
  const dashCount = Math.max(1, Math.floor(length / 25));
  const dashes = new THREE.InstancedMesh(roadsideGeometry, materials.center, dashCount);
  const matrix = new THREE.Matrix4();
  const direction = new THREE.Vector3(0, 0, 1);
  for (let dash = 0; dash < dashCount; dash += 1) {
    const t = (dash + 0.5) / dashCount;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const visible = Math.hypot(point.x, point.z) > 1100;
    matrix.compose(
      new THREE.Vector3(point.x, -0.01, point.z),
      new THREE.Quaternion().setFromUnitVectors(direction, tangent),
      new THREE.Vector3(visible ? 1 : 0, visible ? 1 : 0, visible ? 1 : 0),
    );
    dashes.setMatrixAt(dash, matrix);
  }
  scene.add(dashes);
  return edge;
});

const connections = new Map(nodes.map(node => [node.id, []]));
for (const edge of edges) {
  connections.get(edge.a).push(edge);
  connections.get(edge.b).push(edge);
}

addStokesleyMap();

function addRoseberryTopping() {
  const base = worldPoint(nodeById.get('roseberry'));
  const hillMaterial = new THREE.MeshStandardMaterial({ color: '#697354', roughness: 1 });
  const rockMaterial = new THREE.MeshStandardMaterial({ color: '#a79b7d', roughness: 1 });
  const hill = new THREE.Mesh(new THREE.ConeGeometry(190, 250, 9), hillMaterial);
  hill.position.set(base.x - 180, 95, base.z + 75);
  hill.scale.set(1.12, 1, 1);
  scene.add(hill);
  const summit = new THREE.Mesh(new THREE.IcosahedronGeometry(38, 1), rockMaterial);
  summit.position.set(base.x - 180, 218, base.z + 75);
  scene.add(summit);
}

function addDistantHills() {
  const hillMaterials = ['#82917b', '#788a76', '#71816f'].map(color => new THREE.MeshStandardMaterial({ color, roughness: 1 }));
  const hills = [
    [-2500, 950, 510, 250, 360], [-1600, 1250, 680, 330, 430], [-500, 1400, 520, 270, 350],
    [800, 1500, 750, 360, 470], [2200, 1250, 620, 320, 420], [3250, 700, 800, 400, 440],
    [-2850, -1000, 700, 350, 390], [3150, -1100, 630, 310, 420], [-1700, -2550, 880, 400, 500],
    [1300, -2700, 760, 360, 430], [2750, -2450, 680, 340, 400],
  ];
  hills.forEach(([x, z, width, height, depth], index) => {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 7), hillMaterials[index % hillMaterials.length]);
    hill.position.set(x, -height * 0.52, z);
    hill.scale.set(width, height, depth);
    scene.add(hill);
  });
}

function addTownScenery(node, index) {
  const center = worldPoint(node);
  const size = node.id === 'stokesley' ? 0 : node.kind === 'town' || node.kind === 'coast' ? 8 : node.kind === 'village' ? 5 : 2;
  for (let building = 0; building < size; building += 1) {
    const angle = building * 2.399 + index * 0.6;
    const radius = 23 + (building * 19 % 62);
    const x = center.x + Math.cos(angle) * radius;
    const z = center.z + Math.sin(angle) * radius;
    if (node.id === 'stokesley' && building === 0) {
      makeHouse(center.x + 23, center.z - 22, 1.22, true, 0.3);
      continue;
    }
    makeHouse(x, z, 0.62 + (building * 17 % 36) / 100, false, angle);
  }

  const tangent = connections.get(node.id)
    .map(edge => edge.curve.getTangentAt(edge.a === node.id ? 0 : 1).multiplyScalar(edge.a === node.id ? 1 : -1))
    .sort((a, b) => Math.abs(a.x) - Math.abs(b.x))[0];
  if (!tangent) return;
  if (node.id === 'stokesley') {
    const signNode = { ...node, x: node.x + 0.065, z: node.z - 0.06 };
    addRoadsideSign(signNode, tangent, true);
  } else if (node.kind !== 'landmark') {
    addRoadsideSign(node, tangent);
  }
}

addDistantHills();
addRoseberryTopping();
nodes.forEach(addTownScenery);

for (const edge of edges) {
  const seed = edge.index * 19 + 7;
  for (let step = 1; step <= Math.floor(edge.length / 125); step += 1) {
    const t = step / (Math.floor(edge.length / 125) + 1);
    const point = edge.curve.getPointAt(t);
    const tangent = edge.curve.getTangentAt(t);
    const side = new THREE.Vector3(tangent.z, 0, -tangent.x);
    for (const sign of [-1, 1]) {
      const distance = 21 + ((step * 29 + seed) % 39);
      if (Math.hypot(point.x, point.z) < 850) continue;
      const x = point.x + side.x * distance * sign;
      const z = point.z + side.z * distance * sign;
      if (edge.type.includes('MOOR') && step % 3 !== 0) {
        const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), materials.leafLight);
        bush.position.set(x, 1.1, z);
        bush.scale.set(2.4, 1.1, 2);
        scene.add(bush);
      } else {
        makeTree(x, z, 0.65 + ((step * 13 + seed) % 48) / 100, step % 3 === 0);
      }
    }
  }
}

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

const state = {
  started: false,
  speed: 0,
  trip: 0,
  offset: 0,
  steer: 0,
  edge: edges.find(edge => edge.a === 'stokesley' && edge.b === 'great-ayton'),
  direction: 1,
  traversal: 0,
  alertTimeout: 0,
  lastHudUpdate: 0,
};
const held = new Set();
const touchHeld = new Set();
const timer = new THREE.Clock();

function showAlert(message) {
  roadAlert.textContent = message;
  roadAlert.classList.add('visible');
  window.clearTimeout(state.alertTimeout);
  state.alertTimeout = window.setTimeout(() => roadAlert.classList.remove('visible'), 2100);
}

function startDrive() {
  if (state.started) return;
  state.started = true;
  startScreen.classList.add('dismissed');
  game.classList.add('driving');
}

document.querySelector('#start-drive').addEventListener('click', startDrive);
window.addEventListener('keydown', event => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
  const key = event.code.startsWith('Key') ? event.code.slice(3).toLowerCase() : event.code.toLowerCase();
  held.add(key);
  if (!state.started && ['enter', 'arrowup', 'w'].includes(event.key.toLowerCase())) startDrive();
});
window.addEventListener('keyup', event => {
  const key = event.code.startsWith('Key') ? event.code.slice(3).toLowerCase() : event.code.toLowerCase();
  held.delete(key);
});
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

function currentPoint() {
  const progress = THREE.MathUtils.clamp(state.traversal / state.edge.length, 0, 1);
  const t = state.direction === 1 ? progress : 1 - progress;
  const point = state.edge.curve.getPointAt(t);
  const tangent = state.edge.curve.getTangentAt(t).multiplyScalar(state.direction).normalize();
  return { point, tangent, t };
}

function turnAngle(incoming, outgoing) {
  const dot = THREE.MathUtils.clamp(incoming.x * outgoing.x + incoming.z * outgoing.z, -1, 1);
  const cross = incoming.z * outgoing.x - incoming.x * outgoing.z;
  return Math.atan2(cross, dot);
}

function outgoingOptions(nodeId, incomingEdge) {
  return connections.get(nodeId).filter(edge => edge !== incomingEdge).map(edge => {
    const direction = edge.a === nodeId ? 1 : -1;
    const tangent = edge.curve.getTangentAt(direction === 1 ? 0 : 1).multiplyScalar(direction).normalize();
    const destination = nodeById.get(direction === 1 ? edge.b : edge.a);
    return { edge, direction, tangent, destination };
  });
}

function nextJunction() {
  const endNodeId = state.direction === 1 ? state.edge.b : state.edge.a;
  const point = currentPoint();
  const distanceToEnd = state.edge.length - state.traversal;
  return { nodeId: endNodeId, point, distance: Math.max(0, distanceToEnd), options: outgoingOptions(endNodeId, state.edge) };
}

function chooseNextRoad(nodeId, incoming, steering) {
  const options = outgoingOptions(nodeId, state.edge);
  if (!options.length) {
    state.edge = edges.find(edge => edge === state.edge);
    state.direction *= -1;
    state.traversal = 0;
    return;
  }
  const choices = options.map(option => ({ ...option, angle: turnAngle(incoming, option.tangent) }));
  let selected;
  if (steering > 0.35) {
    selected = choices.filter(choice => choice.angle > 0.22).sort((a, b) => a.angle - b.angle)[0];
  } else if (steering < -0.35) {
    selected = choices.filter(choice => choice.angle < -0.22).sort((a, b) => b.angle - a.angle)[0];
  }
  selected ??= choices.sort((a, b) => Math.abs(a.angle) - Math.abs(b.angle))[0];
  state.edge = selected.edge;
  state.direction = selected.direction;
  state.traversal = 0;
  if (Math.abs(selected.angle) > 0.3) {
    const turn = selected.angle > 0 ? 'LEFT' : 'RIGHT';
    showAlert(`${turn} TURN · ${selected.destination.name.toUpperCase()}`);
  } else {
    showAlert(`FOLLOW ROAD · ${selected.destination.name.toUpperCase()}`);
  }
}

function drawMap(position, heading) {
  const width = mapCanvas.width;
  const height = mapCanvas.height;
  const padding = 36;
  const minX = Math.min(...nodes.map(node => node.x)) - 1;
  const maxX = Math.max(...nodes.map(node => node.x)) + 1;
  const minZ = Math.min(...nodes.map(node => node.z)) - 1;
  const maxZ = Math.max(...nodes.map(node => node.z)) + 1;
  const scale = Math.min((width - padding * 2) / (maxX - minX), (height - padding * 2) / (maxZ - minZ));
  const offsetX = (width - (maxX - minX) * scale) / 2;
  const offsetY = (height - (maxZ - minZ) * scale) / 2;
  const project = (x, z) => [offsetX + (x - minX) * scale, height - offsetY - (z - minZ) * scale];

  mapContext.clearRect(0, 0, width, height);
  mapContext.lineCap = 'round';
  mapContext.lineJoin = 'round';
  for (const edge of edges) {
    mapContext.beginPath();
    for (let index = 0; index <= 36; index += 1) {
      const point = edge.curve.getPointAt(index / 36);
      const [x, y] = project(point.x / WORLD_SCALE, point.z / WORLD_SCALE);
      if (index === 0) mapContext.moveTo(x, y);
      else mapContext.lineTo(x, y);
    }
    mapContext.strokeStyle = '#6e7c6c';
    mapContext.lineWidth = 5;
    mapContext.stroke();
    mapContext.strokeStyle = '#d1d1b3';
    mapContext.lineWidth = 1.2;
    mapContext.stroke();
  }

  for (const node of nodes) {
    const [x, y] = project(node.x, node.z);
    mapContext.beginPath();
    mapContext.arc(x, y, node.kind === 'town' || node.kind === 'coast' ? 3.2 : 2.2, 0, Math.PI * 2);
    mapContext.fillStyle = node.kind === 'landmark' ? '#d3dd8b' : '#f3efe3';
    mapContext.fill();
    if (node.kind === 'town' || node.kind === 'coast' || node.id === 'great-ayton' || node.id === 'reeth') {
      mapContext.fillStyle = 'rgba(243,239,227,.9)';
      mapContext.font = '500 11px Manrope, sans-serif';
      mapContext.fillText(node.name, x + 5, y - 4);
    }
  }

  const [x, y] = project(position.x / WORLD_SCALE, position.z / WORLD_SCALE);
  mapContext.save();
  mapContext.translate(x, y);
  mapContext.rotate(-heading);
  mapContext.beginPath();
  mapContext.moveTo(0, -7);
  mapContext.lineTo(5, 5);
  mapContext.lineTo(0, 3);
  mapContext.lineTo(-5, 5);
  mapContext.closePath();
  mapContext.fillStyle = '#d3dd8b';
  mapContext.shadowColor = '#1f2922';
  mapContext.shadowBlur = 5;
  mapContext.fill();
  mapContext.restore();
}

function updateHud(position, tangent, steering, now) {
  if (now - state.lastHudUpdate < 0.2) return;
  state.lastHudUpdate = now;
  const nearest = nodes
    .map(node => ({ node, distance: Math.hypot(position.x - node.x * WORLD_SCALE, position.z - node.z * WORLD_SCALE) }))
    .sort((a, b) => a.distance - b.distance)[0];
  locationReadout.textContent = nearest.distance < 700 ? nearest.node.name : 'North York Moors';
  const onSchoolRoad = state.edge.a === 'stokesley' && state.direction === 1 && state.traversal < 1100;
  roadNumber.textContent = onSchoolRoad ? 'STATION RD' : state.edge.name;
  roadType.textContent = onSchoolRoad ? 'LOCAL ROAD' : state.edge.type;
  distanceReadout.textContent = `${state.trip.toFixed(1)} KM`;

  const junction = nextJunction();
  if (junction.distance < 520 && junction.options.length) {
    const left = junction.options.find(option => turnAngle(tangent, option.tangent) > 0.25);
    const right = junction.options.find(option => turnAngle(tangent, option.tangent) < -0.25);
    const choices = [
      left ? `A ${left.destination.name}` : '',
      right ? `D ${right.destination.name}` : '',
    ].filter(Boolean).join('  ·  ');
    junctionReadout.textContent = `${junction.nodeId === 'great-ayton' && junction.distance < 80 ? 'AT ' : ''}${nodeById.get(junction.nodeId).name.toUpperCase()} · ${Math.round(junction.distance)} M${choices ? `  /  ${choices}` : ''}`;
  } else {
    const destination = nodeById.get(junction.nodeId);
    junctionReadout.textContent = `NEXT · ${destination.name.toUpperCase()}  /  A-D AT JUNCTIONS`;
  }
  drawMap(position, Math.atan2(tangent.x, tangent.z));
}

function update(delta) {
  const accelerate = pressed('w', 'arrowup', 'accelerate');
  const brake = pressed('s', 'arrowdown', 'brake', 'space');
  const left = pressed('a', 'arrowleft', 'left');
  const right = pressed('d', 'arrowright', 'right');
  const steering = Number(left) - Number(right);

  if (state.started) {
    if (accelerate) state.speed += 23 * delta;
    else state.speed -= (brake ? 48 : 7) * delta;
    state.speed = THREE.MathUtils.clamp(state.speed, 0, MAX_SPEED);
    state.steer = THREE.MathUtils.damp(state.steer, steering, steering ? 7 : 4, delta);
    state.offset = THREE.MathUtils.damp(state.offset, state.steer * 1.2, steering ? 4 : 2.5, delta);
    const movement = state.speed * WORLD_SCALE / 3600 * delta;
    state.traversal += movement;
    state.trip += movement / WORLD_SCALE;
    if (state.traversal >= state.edge.length) {
      const incoming = currentPoint().tangent;
      const nodeId = state.direction === 1 ? state.edge.b : state.edge.a;
      state.traversal = state.edge.length;
      chooseNextRoad(nodeId, incoming, steering);
    }
  } else {
    state.speed = 0;
  }

  const { point, tangent } = currentPoint();
  const side = new THREE.Vector3(tangent.z, 0, -tangent.x);
  const carPosition = point.clone().addScaledVector(side, state.offset);
  camera.position.set(carPosition.x, 1.5 + Math.min(state.speed / 180, 0.27), carPosition.z);
  camera.rotation.set(0, 0, 0);
  camera.rotation.y = Math.atan2(tangent.x, tangent.z) + Math.PI - state.steer * 0.026;
  camera.rotation.z = -state.steer * Math.min(state.speed / 600, 0.055);
  const bob = Math.sin(state.trip * 26) * Math.min(state.speed / 25000, 0.018);
  camera.position.y += bob;
  steeringWheel.rotation.z = -state.steer * 0.55;

  const speed = Math.round(state.speed);
  speedReadout.textContent = String(speed).padStart(2, '0');
  gearReadout.textContent = !state.started ? 'P' : state.speed < 1 ? '1' : String(Math.min(5, Math.floor(state.speed / 17) + 1));
  driveState.textContent = !state.started ? 'PARKED' : brake ? 'BRAKING' : accelerate ? 'DRIVING' : 'COASTING';
  revBar.style.width = `${Math.max(4, state.speed / MAX_SPEED * 100)}%`;

  if (Math.abs(state.offset) > 3.7 && !roadAlert.classList.contains('visible')) showAlert('EASE BACK ONTO THE ROAD');
  if (state.speed > 68 && !brake && Math.floor(performance.now() / 12000) !== state.lastSpeedAlert) {
    state.lastSpeedAlert = Math.floor(performance.now() / 12000);
    showAlert('EASY NOW — ENJOY THE DRIVE');
  }
  updateHud(carPosition, tangent, steering, performance.now() / 1000);
  renderer.render(scene, camera);
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
