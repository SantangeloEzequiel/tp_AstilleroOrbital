import * as THREE from 'three';

import * as dat from 'dat.gui';



import { SceneManager } from './sceneManager.js';
import { AnimateScene } from './animateScene.js';

//Defino menu
const params = {
    camaraActual: 'ORBITAL',
	wingVariants: 'GENERIC',
	engineVariants: 'NONE'
	/*
    posicionSobreRecorrido: 0,
    anguloCabina: 0,
    anguloBrazo: 0,
    anguloAntebrazo: 0,
    anguloPala: 0*/
};

//defino las camaras
import { CAMERA } from './cameras.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let cameras = {};
let activeCamera= CAMERA.ORBITAL;

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

//Variantes
let wing1,wing2,wing3;
let engine0,engine1,engine2;


//scene
let scene, renderer, container, sceneManager, animateScene, isAnimating = false;

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
	cameras[CAMERA.ORBITAL].position.set(1, 2, -4);

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

	if (isAnimating) {
        //animateScene.update(timer.getDelta());
    }

	timer.update();

	switch(params.camaraActual){
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


function createMenu() {
	const gui = new dat.GUI({ width: 300 });


	//CAMARAS
    gui.add(params, 'camaraActual', ['ORBITAL', 'COCKPIT','HANGAR'])
        .name('Cámara')
        .onChange((value) => {

            activeCamera = CAMERA[value];

            cameras[activeCamera].aspect =
                container.offsetWidth / container.offsetHeight;

            cameras[activeCamera].updateProjectionMatrix();
        });
	
	//ALAS
	gui.add(params, 'wingVariants', ['GENERIC', 'BOMBER' , 'ESPECIAL'])
        .name('Variantes de Alas')
        .onChange((value) => {
            //sceneManager.c
        });

	//PROPULSORES	
	gui.add(params, 'engineVariants', ['NONE', 'HEXAGONAL' ,'CIRCULAR'])
        .name('Cámara')
        .onChange((value) => {
			 //sceneManager.c
        });
	
	// ANIMATE
	const actions = {
	    animate: () => {
	        isAnimating = !isAnimating;
	    }
	};
	
	const controller = gui.add(actions, 'animate').name('');
	
	// Obtengo el contenedor
	const container = controller.domElement;
	
	// Limpio su contenido
	container.innerHTML = '';
	
	// Creo un botón HTML real
	const button = document.createElement('button');
	
	button.textContent = 'Animate';
	button.style.width = '100%';
	button.style.padding = '5px';
	button.style.backgroundColor = '#444';
	button.style.color = 'white';
	button.style.border = 'none';
	button.style.cursor = 'pointer';
	
	// Evento del botón
	button.addEventListener('click', (event) => {
	    event.stopPropagation();
	
	    isAnimating = !isAnimating;
	
	    button.textContent = isAnimating ? 'Stop' : 'Animate';
	    button.style.backgroundColor = isAnimating ? '#2ecc71' : '#444';
	});
	
	// Lo agrego al menú
	container.appendChild(button);
			/*
	gui.add(params, 'posicionSobreRecorrido', 0, 1).step(0.001);
	gui.add(params, 'anguloCabina', 0, 360).step(0.001);
	gui.add(params, 'anguloBrazo', 0, 90).step(0.001);
	gui.add(params, 'anguloAntebrazo', 0, 90).step(0.001);
	gui.add(params, 'anguloPala', 0, 90).step(0.001);*/
}

setupThreeJs();
sceneManager = new SceneManager(scene,cameras);
animateScene = new AnimateScene(scene,cameras);
createMenu();
animate();
