
import * as THREE from 'three';

import * as measures from './TIE-Fighter-Construction-Facility/blueprints/measures.js';
import { SCALE_HANGAR } from './constants';
import { SCALE_TIE_FIGHTER } from './constants';

//models
import {buildStructure} from './TIE-Fighter-Construction-Facility/structure.js';
import {buildColumns} from './TIE-Fighter-Construction-Facility/columns.js';
import {buildRiels} from './TIE-Fighter-Construction-Facility/riels.js';

export function buildHangar(){

    const structure = buildStructure(180,180);
    

    const hangar = new THREE.Group();

    hangar.add(structure);

    for(let i = 0 ; i < measures.TOP_RIELS_NUMBER; i++){
        const riel = buildRiels(180);
        const depth = -measures.TOTAL_DEPTH/2+ i * measures.TOTAL_DEPTH/(measures.TOP_RIELS_NUMBER - 1);
        riel.translateZ(depth);
        hangar.add(riel);
    }

    for(let i = 0 ; i < measures.LATERAL_COLUMNS_PER_SIDE; i++){
        const column = buildColumns(180);;
        const depth = -measures.TOTAL_DEPTH/2+ i * measures.TOTAL_DEPTH/(measures.LATERAL_COLUMNS_PER_SIDE - 1);
        column.translateZ(depth);
        
        const column_clone = column.clone();
        column_clone.scale.x = -1;
        column_clone.translateX(measures.TOTAL_WIDTH-measures.COLUMNS_SIDE);

        hangar.add(column);
        hangar.add(column_clone);
    }

    return hangar;
}