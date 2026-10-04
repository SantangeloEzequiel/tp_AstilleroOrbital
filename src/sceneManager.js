import * as THREE from 'three';
import fondo from '../images/fondo_galaxia.png';

import { createTieWings } from '../models_code/TIE-Fighter/wings.js';


export class SceneManager {

	constructor(scene,camera) {

		this.scene = scene;
		this.camera = camera;

		const light = new THREE.DirectionalLight(0xffffff, 1);

		light.position.set(1, 1, 1);
		scene.add(light);

		const ambientLight = new THREE.AmbientLight(0x666666);
		scene.add(ambientLight);

		const grid = new THREE.GridHelper(10, 10);
		scene.add(grid);

		const axes = new THREE.AxesHelper(3);
		scene.add(axes);

		//FONDO 
		// creo una esfera, la escalo en -1 de alguna coordenada para que la textura se vea de adentro, y le pongo la textura de galaxia

		const background_loader = new THREE.TextureLoader();

		background_loader.load(fondo, (texture) => {
		
			texture.repeat.set(1, 1);

		    const sphere_background = new THREE.SphereGeometry(100, 64, 64);
		
		    const material = new THREE.MeshBasicMaterial({
		        map: texture,
		        side: THREE.BackSide
		    });
		
		    this.background = new THREE.Mesh(sphere_background, material);
		    scene.add(this.background);
		});

		const wings = createTieWings();
		scene.add(wings);
		}

	
	animate() {
		if (this.background) {
		this.background.position.copy(this.camera.position);
		}
	}
}
