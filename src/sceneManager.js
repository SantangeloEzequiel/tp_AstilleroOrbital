import * as THREE from 'three';
import fondo from '../images/fondo_galaxia.png';
import { buildShip} from '../models_code/buildTieFighter.js';
import { buildHangar} from '../models_code/buildHangar.js';

const SCALE = 0.01; //TIE FIGTHER

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
		
		const hangar = buildHangar();
		scene.add(hangar);
		
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


