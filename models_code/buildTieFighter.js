import * as THREE from 'three';
import { SCALE_TIE_FIGHTER as SCALE } from './constants.js';

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

export function buildShip(wingVariant,engineVariant){
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