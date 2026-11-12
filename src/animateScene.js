import { ParametricGeometry } from 'three/examples/jsm/Addons.js';
import * as HANGAR_measures from '../models_code/TIE-Fighter-Construction-Facility/blueprints/measures.js';
import * as TIE_measures from '../models_code/TIE-Fighter/blueprints/measures.js';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

//Models hangar
import {buildStructure} from '../models_code/TIE-Fighter-Construction-Facility/structure.js';
import {buildColumns} from '../models_code/TIE-Fighter-Construction-Facility/columns.js';
import {buildRiels} from '../models_code/TIE-Fighter-Construction-Facility/riels.js';
import {buildRielsSupport} from '../models_code/TIE-Fighter-Construction-Facility/riels_suports.js';
//modelos tie
import { createTieWings as createTieWings_1 } from '../models_code/TIE-Fighter/wings_1.js';
import { createTieWings as createTieWings_2 } from '../models_code/TIE-Fighter/wings_2.js';
import { createTieWings as createTieWings_3 } from '../models_code/TIE-Fighter/wings_3.js';
import { createTieFuselage, DIAMETER_CENTER } from '../models_code/TIE-Fighter/fuselage.js';
import { createTieEngines as createTieEngines_1} from '../models_code/TIE-Fighter/engines_1.js';
import { createTieEngines as createTieEngines_2} from '../models_code/TIE-Fighter/engines_2.js';
import { createTieCockpit as createTieCockpit} from '../models_code/TIE-Fighter/cockpit.js';




export class AnimateScene {
    constructor(scene, cameras) {
        this.scene = scene;
        this.cameras = cameras;

        //BUILD PLATAFORM
        const plataform = new THREE.Group();
        const side_length = 2;
        
        //DOOR
        const door_depth = side_length;
        const door_width = door_depth/2;
        const door_geometry = buildBox(door_width,0.1,door_depth,100,100);
        const door_material = new THREE.MeshBasicMaterial({color: 0x111111, side: THREE.DoubleSide});
        const door_1 = new THREE.Mesh(door_geometry,door_material);
        
        const door_2 = door_1.clone();
        
        door_1.position.x = door_width / 2;
        door_2.position.x = -door_width / 2;
        
        const pivot1 = new THREE.Group();
        const pivot2 = new THREE.Group();

        pivot1.add(door_1);
        pivot2.add(door_2);

        pivot1.position.x = -door_width;
        pivot2.position.x = door_width;

        pivot1.rotation.z =  Math.PI / 4 ;
        pivot2.rotation.z = - Math.PI / 4 ;

        //CONTAINER
        const container_geometry = buildBoxWithoutRoof(side_length,HANGAR_measures.TOTAL_HEIGHT/4,side_length,120,120);
        const container_material = new THREE.MeshBasicMaterial({color: 0x111177, side: THREE.DoubleSide});
        const container = new THREE.Mesh(container_geometry,container_material);
        container.translateY(-HANGAR_measures.TOTAL_HEIGHT/8);



        
        
        
        
        //Grouping
        plataform.add(pivot1);
        plataform.add(pivot2);
        plataform.add(container);
        scene.add(plataform);
    }

    animate() {
        

        // Animaciones de los objetos
        // Ejemplo:
        
        pivot1.rotation.z =  Math.PI / 4 ;
        pivot2.rotation.z = - Math.PI / 4 ;
    }
}


//---------------
//    UTILS
//---------------

function buildPlane(width,heigth,withSegments,heigthSegments){
    const geometry = new ParametricGeometry(
        function (u,v,target){
            const x =(u-0.5) * width;
            const z =(v-0.5) * heigth;
            target.set(x,0,z);
        },withSegments,heigthSegments
    )
    //uv
    return geometry;
}

function buildBox(width, height, depth, widthSegments, heightSegments, depthSegments) {

    const face1 = buildPlane(width, height, widthSegments, heightSegments);
    const face2 = buildPlane(depth, height, depthSegments, heightSegments);
    const face3 = buildPlane(width, height, widthSegments, heightSegments);
    const face4 = buildPlane(depth, height, depthSegments, heightSegments);
    const face5 = buildPlane(width, depth, widthSegments, depthSegments);
    const face6 = buildPlane(width, depth, widthSegments, depthSegments);

 // ROTACIONES

    // Frente (+Z)
    face1.rotateX(-Math.PI / 2);
    // Derecha (+X)
    face2.rotateX(-Math.PI / 2);
    face2.rotateY(Math.PI / 2);
    // Atrás (-Z)
    face3.rotateX(Math.PI / 2);
    // Izquierda (-X)
    face4.rotateX(-Math.PI / 2);
    face4.rotateY(-Math.PI / 2);
    // Arriba (+Y)
    face5.rotateX(Math.PI);

    // Traslaciones
    face1.translate(0, 0, depth / 2);
    face2.translate(width / 2, 0, 0);
    face3.translate(0, 0, -depth / 2);
    face4.translate(-width / 2, 0, 0);
    face5.translate(0, height / 2, 0);
    face6.translate(0, -height / 2, 0);

    return BufferGeometryUtils.mergeGeometries(
        [face1, face2, face3, face4, face5, face6],
        false
    );
}


function buildSemiBoxWithEspesor(width, depth, height, thickness,widthSegments, heightSegments, depthSegments) {
    // Cara superior
    const face1 = buildBox(width, thickness, depth, widthSegments, heightSegments, depthSegments);

    // Caras laterales
    const face2 = buildBox(thickness, height, depth, widthSegments, heightSegments, depthSegments);

    const face3 = buildBox(thickness, height, depth, widthSegments, heightSegments, depthSegments);

    // Cara superior
    face1.translate(0, height - thickness / 2, 0);

    // Caras laterales
    face2.translate(-width / 2 + thickness / 2, height / 2, 0);

    face3.translate(width / 2 - thickness / 2, height / 2, 0);

    return BufferGeometryUtils.mergeGeometries(
        [face1, face2, face3],
        false
    );
}

function buildSphere(radius,radialSegments,widthSegments){
    return new ParametricGeometry(
        function(u,v,target){
            const phi = Math.PI * 2 * u;
            const thita = Math.PI * v;

            const x = Math.sin(thita) * Math.cos(phi) * radius;
            const y = Math.sin(thita) * Math.sin(phi) * radius;
            const z = Math.cos(thita) * radius;
            target.set(x,y,z);
        },radialSegments,widthSegments);
}



function buildBoxWithoutRoof(width, height, depth, widthSegments, heightSegments, depthSegments) {

    const face1 = buildPlane(width, height, widthSegments, heightSegments);
    const face2 = buildPlane(depth, height, depthSegments, heightSegments);
    const face3 = buildPlane(width, height, widthSegments, heightSegments);
    const face4 = buildPlane(depth, height, depthSegments, heightSegments);
    //const face5 = buildPlane(width, depth, widthSegments, depthSegments);
    const face6 = buildPlane(width, depth, widthSegments, depthSegments);

 // ROTACIONES

    // Frente (+Z)
    face1.rotateX(-Math.PI / 2);
    // Derecha (+X)
    face2.rotateX(-Math.PI / 2);
    face2.rotateY(Math.PI / 2);
    // Atrás (-Z)
    face3.rotateX(Math.PI / 2);
    // Izquierda (-X)
    face4.rotateX(-Math.PI / 2);
    face4.rotateY(-Math.PI / 2);
    // Arriba (+Y)
    //face5.rotateX(Math.PI);

    // Traslaciones
    face1.translate(0, 0, depth / 2);
    face2.translate(width / 2, 0, 0);
    face3.translate(0, 0, -depth / 2);
    face4.translate(-width / 2, 0, 0);
    //face5.translate(0, height / 2, 0);
    face6.translate(0, -height / 2, 0);

    return BufferGeometryUtils.mergeGeometries(
        [face1, face2, face3, face4, face6],
        false
    );
}