import * as THREE from 'three';

//modelos
import { createTieWings as createTieWings_1 } from '../models_code/TIE-Fighter/wings_1.js';
import { createTieWings as createTieWings_2 } from '../models_code/TIE-Fighter/wings_2.js';
import { createTieWings as createTieWings_3 } from '../models_code/TIE-Fighter/wings_3.js';
import { createTieFuselage, DIAMETER_CENTER } from '../models_code/TIE-Fighter/fuselage.js';
import { createTieEngines as createTieEngines_1} from '../models_code/TIE-Fighter/engines_1.js';
import { createTieEngines as createTieEngines_2} from '../models_code/TIE-Fighter/engines_2.js';
import { createTieCockpit as createTieCockpit} from '../models_code/TIE-Fighter/cockpit.js';

//constantes de medida
import * as measures from './TIE-Fighter/blueprints/measures.js';

export function buildShip(wingVariant,engineVariant){
	let ship1_wings1;
	let ship1_wings2;
	let wingOffset;

	switch(wingVariant){
		case 1 : {
			ship1_wings1 = createTieWings_1();
			ship1_wings2 = createTieWings_1();
			wingOffset = measures.FUSELAGE_LENGTH/2;
			ship1_wings2.scale.set(1,1,-1);
			break;
		}
		case 2 : {
			ship1_wings1 = createTieWings_2();
			ship1_wings2 = createTieWings_2();
			wingOffset = (measures.FUSELAGE_LENGTH- measures.WINGS_DEPTH +measures.WINGS_FRAME_DIAMETER)/2;
			ship1_wings2.scale.set(-1,1,1);
			break;
		}
		case 3 : {
			ship1_wings1 = createTieWings_3();
			ship1_wings2 = createTieWings_3();
			wingOffset = (measures.FUSELAGE_LENGTH - measures.WINGS_DEPTH + measures.WINGS_FRAME_DIAMETER)/2;
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
		ship1_engine.position.y = (measures.COCKPIT_DIAMETER + measures.FUSELAGE_DIAMETER_CENTER) / 2 + measures.ENGINES_DEPTHs * 0.65;
		ship1_engine.rotateX(-Math.PI / 2);
	}

	ship1_cockpit.scale.set(1,1,-1);
	ship1_cockpit.position.z = -(measures.COCKPIT_DIAMETER-measures.ENGINES_DEPTH)/2;

	return ship1;
}