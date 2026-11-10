
import * as THREE from 'three';

import * as measures from './TIE-Fighter-Construction-Facility/blueprints/measures.js';
import { SCALE_HANGAR } from './constants';
import { SCALE_TIE_FIGHTER } from './constants';

//models
import {buildStructure} from './TIE-Fighter-Construction-Facility/structure.js';

export function buildHangar(){

    const structure = buildStructure(180,180);

    const hangar = new THREE.Group();
    hangar.add(structure);

    return hangar;
}