import * as THREE from 'three';
import fondo from '../images/fondo_galaxia.png';

//modelos
import { createTieWings as createTieWings_1 } from '../models_code/TIE-Fighter/wings_1.js';
import { createTieWings as createTieWings_2 } from '../models_code/TIE-Fighter/wings_2.js';
import { createTieWings as createTieWings_3 } from '../models_code/TIE-Fighter/wings_3.js';
import { createTieFuselage, DIAMETER_CENTER } from '../models_code/TIE-Fighter/fuselage.js';
import { createTieEngines as createTieEngines_1} from '../models_code/TIE-Fighter/engines_1.js';
import { createTieEngines as createTieEngines_2} from '../models_code/TIE-Fighter/engines_2.js';
import { createTieCockpit as createTieCockpit} from '../models_code/TIE-Fighter/cockpit.js';

//constantes de medida
import { DEPTH as ENGINE_DEPTH} from '../models_code/TIE-Fighter/engines_1.js';
import { LENGTH } from '../models_code/TIE-Fighter/fuselage.js';
import { DIAMETER_COCKPIT } from '../models_code/TIE-Fighter/fuselage.js';
import { DEPTH } from '../models_code/TIE-Fighter/wings_2.js';
import { FRAME_DIAMETER } from '../models_code/TIE-Fighter/wings_2.js';

const SCALE = 0.01;

//camaras
import { CAMERA } from './cameras.js';


export class SceneManager {

	constructor(scene,cameras) {

		this.scene = scene;
		this.cameras = cameras;

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

		    const sphere_background = new THREE.SphereGeometry(500, 60, 60);
		
		    const material = new THREE.MeshBasicMaterial({
		        map: texture,
		        side: THREE.BackSide
		    });
		
		    this.background = new THREE.Mesh(sphere_background, material);
		    scene.add(this.background);
		});

		//PLANETA

		 const sphere_planet = new THREE.SphereGeometry(100, 64, 64);
		
		    const material_planet = new THREE.MeshBasicMaterial({
		        color: 0x887755,
		        side: THREE.DoubleSide
		    });
		
		    const planet = new THREE.Mesh(sphere_planet, material_planet);
			planet.position.set(-200,-200,-200);
		    scene.add(planet);

		// SCRIPT
		
		//Hangar
		
		
		
		//NAVES
		/*
		this.ships = [];
		this.ships[0]=buildShip(1,1);
		//anido la camara a ship1
		this.ships[0].add(this.cameras[CAMERA.COCKPIT]);
		scene.add(this.ships[0]);

		this.ships[1]=buildShip(2,0);
		this.ships[2]=buildShip(3,0);

		this.ships[1].position.set(5,0,0);
		this.ships[2].position.set(-5,0,0);

		for(let number in this.ships)
			scene.add(this.ships[number]);*/
	}

	moveShip(keys) {
    	const speed = 10;
		const rotation_speed = 0.005;

    	if (keys.w) this.ships[0].translateZ(-(speed*SCALE));
    	if (keys.s) this.ships[0].translateZ(speed*SCALE);
    	if (keys.a) this.ships[0].rotateY((2*Math.PI*rotation_speed));
    	if (keys.d) this.ships[0].rotateY(-(2*Math.PI*rotation_speed));
		if (keys.e) this.ships[0].rotateZ(-(2*Math.PI*rotation_speed));
		if (keys.q) this.ships[0].rotateZ((2*Math.PI*rotation_speed));
		if (keys[' ']) this.ships[0].rotateX((2*Math.PI*rotation_speed));
		if (keys['control']) this.ships[0].rotateX(-(2*Math.PI*rotation_speed));
	}

	
	animate() {
		if (this.background) {
		this.background.position.copy(this.cameras[CAMERA.ORBITAL].position);
		}
	}
}



function buildShip(wingVariant,engineVariant){
//Ship1

	let ship1_wings1;
	let ship1_wings2;
	let wingOffset;

	switch(wingVariant){
		case 1 : {
			ship1_wings1 = createTieWings_1();
			ship1_wings2 = createTieWings_1();
			wingOffset = (LENGTH-FRAME_DIAMETER)/2;
			ship1_wings2.scale.set(1,1,-1);
			break;
		}
		case 2 : {
			ship1_wings1 = createTieWings_2();
			ship1_wings2 = createTieWings_2();
			wingOffset = (LENGTH-DEPTH+FRAME_DIAMETER)/2;
			ship1_wings2.scale.set(-1,1,1);
			break;
		}
		case 3 : {
			ship1_wings1 = createTieWings_3();
			ship1_wings2 = createTieWings_3();
			wingOffset = (LENGTH-DEPTH+FRAME_DIAMETER)/2;
			ship1_wings2.scale.set(-1,1,1);
			break;
		}
	}

	let ship1_engine;
	switch(engineVariant){
		case 0 : ship1_engine = null;
			break;
		case 1 : ship1_engine = createTieEngines_1();
			break;
		case 2 : ship1_engine = createTieEngines_2();
			break;
	}

	const ship1_fuselage = createTieFuselage();
	const ship1_cockpit = createTieCockpit();
	const ship1 = new THREE.Group;

	ship1.add(ship1_wings1);
	ship1.add(ship1_wings2);
	ship1.add(ship1_fuselage);
	ship1.add(ship1_cockpit);

	ship1_wings1.position.x = wingOffset;
	ship1_wings2.position.x = -wingOffset;

	if (ship1_engine !== null) {
		ship1_fuselage.add(ship1_engine);
		ship1_engine.position.y = (DIAMETER_COCKPIT + DIAMETER_CENTER) / 2 + ENGINE_DEPTH * 0.65;
		ship1_engine.rotateX(-Math.PI / 2);
	}

	ship1_cockpit.scale.set(1,1,-1);
	ship1_cockpit.position.z = -(DIAMETER_COCKPIT-ENGINE_DEPTH)/2;

	return ship1;
}