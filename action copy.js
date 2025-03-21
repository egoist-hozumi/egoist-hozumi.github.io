import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

// Setup scene, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xF0F8FF); // Light blue background

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(5, 10, 7);
light.castShadow = true;
scene.add(light);

// Camera setup
const radius = 25;  // Orbit radius
const height = 30;  // Fixed height
let angle = 0;      // Initial angle
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(radius, 0, height); // Start position
camera.lookAt(0, 0, 0); // Always look at the plate

// Load the main plate
const loader = new STLLoader();
loader.load('plate.stl', function (geometry) {
    geometry.computeBoundingBox();
    const center = new THREE.Vector3();
    geometry.boundingBox.getCenter(center);

    const material = new THREE.MeshStandardMaterial({ color: 0xADD8E6, metalness: 0.3, roughness: 0.3 });
    const plate = new THREE.Mesh(geometry, material);
    plate.position.set(-center.x, -center.y, -center.z);
    
    scene.add(plate);

    // Load STL models without labels
    loadModel('left_up.stl', new THREE.Vector3(-10, 4, 4), -Math.PI / 9);
    loadModel('left_down.stl', new THREE.Vector3(-4, -12, 4), Math.PI / 36);
    loadModel('right_up.stl', new THREE.Vector3(5, 11, 4), Math.PI / 36);
    loadModel('right_down.stl', new THREE.Vector3(11, -6, 4), -Math.PI / 9);

    animate();
});

// Function to load and place STL models (No Labels)
function loadModel(filename, position, rotationZ = 0) {
    loader.load(filename, function (geometry) {
        const material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0.5, roughness: 0.3 });
        const object = new THREE.Mesh(geometry, material);

        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);

        object.position.set(position.x - center.x, position.y - center.y, position.z - center.z);
        object.scale.set(0.5, 0.5, 0.5);
        object.rotation.z = rotationZ;

        scene.add(object);
    });
}

// Function to animate camera in a circular path
function animate() {
    requestAnimationFrame(animate);

    angle += 0.01; // Adjust speed of rotation
    camera.position.x = Math.cos(angle) * radius;
    camera.position.y = Math.sin(angle) * radius;
    camera.position.z = height;  // Keep height fixed

    camera.lookAt(0, 0, 0); // Always look at the plate

    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
});

// Initial render
renderer.render(scene, camera);
