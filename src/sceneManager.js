import * as THREE from 'three';
import fondo from '../images/fondo_galaxia.png';

import { createTieWings as createTieWings_1 } from '../models_code/TIE-Fighter/wings_1.js';
import { createTieWings as createTieWings_2 } from '../models_code/TIE-Fighter/wings_2.js';
import { createTieWings as createTieWings_3 } from '../models_code/TIE-Fighter/wings_3.js';
import { createTieFuselage } from '../models_code/TIE-Fighter/fuselage.js';
import { LENGTH } from '../models_code/TIE-Fighter/fuselage.js';
import { DEPTH } from '../models_code/TIE-Fighter/wings_2.js';
import { FRAME_DIAMETER } from '../models_code/TIE-Fighter/wings_2.js';



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


		// SCRIPT

		
		//Ship1
		const ship1_wings1 = createTieWings_1();
		const ship1_wings2 = createTieWings_1();
		const ship1_fuselage = createTieFuselage();

		const ship1 = new THREE.Group;

		ship1.add(ship1_wings1);
		ship1.add(ship1_wings2);
		ship1.add(ship1_fuselage);
		ship1_wings2.scale.set(1,1,-1);
		ship1_wings1.position.x=((LENGTH-2*FRAME_DIAMETER + FRAME_DIAMETER)/2);
		ship1_wings2.position.x=(-(LENGTH-2*FRAME_DIAMETER + FRAME_DIAMETER)/2);
		
		scene.add(ship1);
		
		//Ship2
		const ship2_wings1 = createTieWings_2();
		const ship2_wings2 = createTieWings_2();
		const ship2_fuselage = createTieFuselage();

		const ship2 = new THREE.Group;

		ship2.add(ship2_wings1);
		ship2.add(ship2_wings2);
		ship2.add(ship2_fuselage);
		ship2_wings2.scale.set(-1,1,1);
		ship2_wings1.position.x=((LENGTH-DEPTH + FRAME_DIAMETER)/2);
		ship2_wings2.position.x=(-(LENGTH-DEPTH + FRAME_DIAMETER)/2);
		ship2.translateX(5);

		scene.add(ship2);

		//Ship3
		const ship3_wings1 = createTieWings_3();
		const ship3_wings2 = createTieWings_3();
		const ship3_fuselage = createTieFuselage();

		const ship3 = new THREE.Group;

		ship3.add(ship3_wings1);
		ship3.add(ship3_wings2);
		ship3.add(ship3_fuselage);
		ship3_wings2.scale.set(-1,1,1);
		ship3_wings1.position.x=((LENGTH-DEPTH + FRAME_DIAMETER)/2);
		ship3_wings2.position.x=(-(LENGTH-DEPTH + FRAME_DIAMETER)/2);

		ship3.translateX(-5);
		scene.add(ship3);
		
		}

	
	animate() {
		if (this.background) {
		this.background.position.copy(this.camera.position);
		}
	}
}
