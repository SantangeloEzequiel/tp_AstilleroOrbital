import * as THREE from 'three';
import fondo from '../images/fondo_galaxia.png';
import { buildShip} from '../models_code/buildTieFighter.js';
import { buildHangar} from '../models_code/buildHangar.js';
import * as HANGAR_measures from '../models_code/TIE-Fighter-Construction-Facility/blueprints/measures.js';
import * as TIE_measures from '../models_code/TIE-Fighter/blueprints/measures.js';

const SCALE = 0.01; //TIE FIGTHER

//camaras
import { CAMERA } from './cameras.js';


export class SceneManager {

	constructor(scene,cameras) {

		this.scene = scene;
		this.cameras = cameras;
		this.animationDone = false;

		this.wingVariant = 1;
		this.engine = 0;

		const light = new THREE.DirectionalLight(0xffffff, 1);

		light.position.set(1, 1, 1);
		scene.add(light);

		const ambientLight = new THREE.AmbientLight(0xffffff);
		scene.add(ambientLight);

		const grid = new THREE.GridHelper(10, 10);
		scene.add(grid);

		const axes = new THREE.AxesHelper(3);
		scene.add(axes);

		// SCRIPT

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
			planet.position.set(-100, -70 ,300);
		    scene.add(planet);
		
		//HANGAR
		const hangar = buildHangar();
		scene.add(hangar);
		hangar.translateY(HANGAR_measures.TOTAL_HEIGHT/2);


		//SHIP
		const ship = buildShip(1,0)
		scene.add(ship);
		ship.translateY(3);
		
	}

	moveShip(keys) {
    	const speed = 10;
		const rotation_speed = 0.005;
		const ship = this.scene.getObjectByName("ship");

		if(this.animationDone==true){
    		if (keys.w) ship.translateZ(-(speed*SCALE));
    		if (keys.s) ship.translateZ(speed*SCALE);
    		if (keys.a) ship.rotateY((2*Math.PI*rotation_speed));
    		if (keys.d) ship.rotateY(-(2*Math.PI*rotation_speed));
			if (keys.e) ship.rotateZ(-(2*Math.PI*rotation_speed));
			if (keys.q) ship.rotateZ((2*Math.PI*rotation_speed));
			if (keys[' ']) ship.rotateX((2*Math.PI*rotation_speed));
			if (keys['control']) ship.rotateX(-(2*Math.PI*rotation_speed));
		}
	}

	changeWing(wingVariant){
		this.wingVariant = wingVariant;
		this.changeShip();
	}

	changeEngine(engine){
		this.engine = engine;
		this.changeShip();
	}

	changeShip(){
		if (this.animationDone === true) {
    		
			const ship = this.scene.getObjectByName("ship");

    		if (ship) {
    		    // Posición respecto de scene
    		    const position = new THREE.Vector3();
    		    ship.getWorldPosition(position);

    		    // Rotación respecto de scene
    		    const quaternion = new THREE.Quaternion();
    		    ship.getWorldQuaternion(quaternion);

    		    // Elimino la nave anterior
    		    this.scene.remove(ship);

    		    // Creo la nueva nave
    		    const newShip = buildShip(this.wingVariant, this.engine);

				// Transfiero la cámara cockpit
    			const camera = this.cameras[CAMERA.COCKPIT];
    			newShip.add(camera);		
    			camera.position.set(0, 0, 0);
    			camera.rotation.set(0, 0, 0);


    		    newShip.position.copy(position);
    		    newShip.quaternion.copy(quaternion);

    		    newShip.name = "ship";
    		    this.scene.add(newShip);
    		}
		}
	}

	isAnimationDone(isAnimationDone){
		this.animationDone = isAnimationDone;
	}

	
	animate() {
		if (this.background) {
		this.background.position.copy(this.cameras[CAMERA.ORBITAL].position);
		}
	}
}


