import * as THREE from 'three';
import { STLLoader } from 'jsm/loaders/STLLoader.js';
import { GLTFLoader } from 'jsm/loaders/GLTFLoader.js';

// Setup scene and renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xF0F8FF);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// ✅ Single warm directional light at (0, 0, 50)
const warmLight = new THREE.DirectionalLight(0xFFDAB9, 2); // Peach Puff (warm light)
warmLight.position.set(0, 0, 50);
warmLight.castShadow = true;
scene.add(warmLight);

// Camera setup
const radius = 25;
const height = 35;
let angle = 0;
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(radius, 0, height);
camera.lookAt(0, 0, 0);

// Load the plate using STLLoader
const stlLoader = new STLLoader();
stlLoader.load('plate.stl', function (geometry) {
    geometry.computeBoundingBox();
    const center = new THREE.Vector3();
    geometry.boundingBox.getCenter(center);

    const porcelainMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xE0FFFF,
        roughness: 0.1,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transmission: 0.5,
        ior: 1.5
    });

    const plate = new THREE.Mesh(geometry, porcelainMaterial);
    plate.position.set(-center.x, -center.y, -center.z);
    scene.add(plate);

    // Load 4 surrounding GLB models with rotation
    loadGLBModel('left_up.glb', new THREE.Vector3(6, -8, 17.4), -20);   // 20° clockwise
    loadGLBModel('right_down.glb', new THREE.Vector3(10, -6, 17.4), 20); // 20° counterclockwise
    loadGLBModel('left_down.glb', new THREE.Vector3(-16, -2, 17.4), 0);  // No rotation

    animate();
});

// Load GLB models with GLTFLoader (preserve shaders & scale to 4)
const gltfLoader = new GLTFLoader();

function loadGLBModel(filename, position, rotationZDeg = 0) {
    gltfLoader.load(filename, function (gltf) {
        const object = gltf.scene;

        object.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        object.position.copy(position);
        object.scale.set(4, 4, 4);
        object.rotation.set(0, 0, THREE.MathUtils.degToRad(rotationZDeg));

        scene.add(object);
    });
}

// Animate camera around the plate
function animate() {
    requestAnimationFrame(animate);

    angle += 0.03;
    camera.position.x = Math.cos(angle) * radius;
    camera.position.y = Math.sin(angle) * radius;
    camera.position.z = height;

    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

// Responsive resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
});

// Initial render
renderer.render(scene, camera);
