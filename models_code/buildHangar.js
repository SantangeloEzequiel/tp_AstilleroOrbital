import * as THREE from 'three';

import * as measures from './TIE-Fighter-Construction-Facility/blueprints/measures.js';
import * as TIE_measures from './TIE-Fighter/blueprints/measures.js';

import { SCALE_HANGAR } from './constants';
import { SCALE_TIE_FIGHTER } from './constants';

//models
import {buildStructure} from './TIE-Fighter-Construction-Facility/structure.js';
import {buildColumns} from './TIE-Fighter-Construction-Facility/columns.js';
import {buildRiels} from './TIE-Fighter-Construction-Facility/riels.js';
import {buildRielsSupport} from './TIE-Fighter-Construction-Facility/riels_suports.js';
import {buildShip} from './buildTieFighter.js';

export function buildHangar(){

    //LUCES
        const point_light = new THREE.PointLight(
         0xffffff, // color
         20,        // intensidad
         measures.TOTAL_WIDTH/2,       // distancia máxima
         1        // decaimiento
         );
    
        point_light.position.set(0, -0.1, 0);

    const hangar = new THREE.Group();

    const spacing = measures.TOTAL_DEPTH / measures.TOP_RIELS_NUMBER;

    //estructura
    const structure = buildStructure(60,60);
    hangar.add(structure);

    //soportes
    const suport = buildRielsSupport(30);

    const suport_separation = TIE_measures.FUSELAGE_LENGTH;

    //distancia del centro de cada nave al centro del hangar
    const ship_offset = measures.TOTAL_WIDTH / 4;

    //modelo de las naves estacionadas
    const ship = buildShip(1,0);

    //rieles
    for(let i = 0; i < measures.TOP_RIELS_NUMBER; i++){

        const riel = buildRiels(30);

        const depth = -measures.TOTAL_DEPTH/2
                      + (i + 0.5) * spacing;

        riel.translateZ(depth);

        //altura relativa de los soportes
        const suport_height = riel.children[0].position.y - measures.RIELS_SIDE/2 - measures.SUPPORT_CONECTOR_DIAMETER/2 * 0.8;

        //altura del centro de las naves
        const ship_height = suport_height - measures.SUPPORT_CONECTOR_DIAMETER/2 * 0.8 - measures.SUPPORT_ESPESOR - TIE_measures.WINGS_HEIGHT/2;

        //dos posiciones por riel
        for(const side of [-1,1]){

            const ship_center = side * ship_offset;

            //soporte del ala izquierda
            const suport1 = suport.clone();

            suport1.position.set( ship_center - suport_separation/2, suport_height, 0);

            //soporte del ala derecha
            const suport2 = suport.clone();

            suport2.position.set(ship_center + suport_separation/2,suport_height,0);

            riel.add(suport1);
            riel.add(suport2);

            //naves en rieles alternados
            if(i % 2 === 0){

                const ship_clone = ship.clone();

                ship_clone.position.set(
                    ship_center,
                    ship_height,
                    0
                );

                ship_clone.scale.z = -1;

                riel.add(ship_clone);
            }
        }

        hangar.add(riel);
    }

    
        


    //columnas
    for(let i = 0; i < measures.LATERAL_COLUMNS_PER_SIDE; i++){

        const column = buildColumns(30);

        const depth = -measures.TOTAL_DEPTH/2 + (i + 1) * spacing;

        column.translateZ(depth);

        const column_clone = column.clone();

        column_clone.scale.x = -1;
        column_clone.position.x = -column.position.x;

        //luces
        const ligth = point_light.clone();
        ligth.position.x+= measures.COLUMNS_SIDE/2 + 0.01;
        const light_clone = ligth.clone();
        light_clone.position.x+= measures.COLUMNS_SIDE + 0.01;
        if(i % 4 === 0){
            column.add(ligth);
            column_clone.add(light_clone);
        }

        hangar.add(column);
        hangar.add(column_clone);
    }


    //LUCES TECHO

    for(let i=0; i<2; i++){
                const light_clone = point_light.clone();
                light_clone.position.z = (i-0.5) * measures.TOTAL_DEPTH/2.5;
                light_clone.position.y = measures.TOTAL_HEIGHT/4;
                hangar.add(light_clone);
            }

    return hangar;
}