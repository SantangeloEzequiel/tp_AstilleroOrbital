import * as THREE from 'three';

import { SceneManager } from './sceneManager.js';


//defino las camaras
import { CAMERA } from './cameras.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let cameras = {};
let activeCamera= CAMERA.COCKPIT;

//controles
let controls_orbital;
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
	e: false,
	q: false,
	' ': false,
	control: false
};
window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key in keys) keys[key] = true;
});
window.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    if (key in keys) keys[key] = false;
});

//scene
let scene, renderer, container, sceneManager;

function setupThreeJs() {
	container = document.getElementById('container3D');

	renderer = new THREE.WebGLRenderer();
	scene = new THREE.Scene();

	container.appendChild(renderer.domElement);
	
	//Creo las camaras
	for (let i in CAMERA) {
    	cameras[CAMERA[i]] = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,1000);
	}
	//Camara orbital
	controls_orbital = new OrbitControls(cameras[CAMERA.ORBITAL], renderer.domElement);
	cameras[CAMERA.ORBITAL].position.set(5, 5, 10);

	controls_orbital.target.set(0, 0, 0);
	controls_orbital.enableDamping = false;
	

	window.addEventListener('resize', onResize);
	onResize();
}

function onResize() {
	cameras[activeCamera].aspect = container.offsetWidth / container.offsetHeight;
	cameras[activeCamera].updateProjectionMatrix();

	renderer.setSize(container.offsetWidth, container.offsetHeight);
}

import { Timer } from 'three/addons/misc/Timer.js';
const timer = new Timer();

function animate() {
	requestAnimationFrame(animate);
	sceneManager.animate();

	//ANIMATE SCRIPT
	timer.update();

	switch(activeCamera){
		case 'COCKPIT' :{
			sceneManager.moveShip(keys);
			break;
		}
		case 'ORBITAL':{
			controls_orbital.update();
			break;
		}
	}
	renderer.render(scene, cameras[activeCamera]);
}

setupThreeJs();
sceneManager = new SceneManager(scene,cameras);
animate();
