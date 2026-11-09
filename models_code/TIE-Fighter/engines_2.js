import { SCALE_TIE_FIGHTER as SCALE } from '../constants.js';

import * as THREE from 'three';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import * as atlas_uv from './atlas_uv.js'

//P-s5 TWIN ION ENGINE

// (En vez de un hexagono un circulo)

//Medidas
const EXTERIOR_DIAMETER = (65 / 2) * SCALE; // half of cockpit diameter
const DEPTH = 12 * SCALE;

//PROPORTIONS
const CENTER_DIAMETER = EXTERIOR_DIAMETER/2;
const HEXAGON_DIAMETER = CENTER_DIAMETER * (1/2);



//********************* */
// ENGINE BORDER
//******************* */ 
function buildPlaneRingGeometry(exteriorRadius,centerRadius,depth,radialSegments,lengthSegments){
    const geometry = new ParametricGeometry(
        function (u,v,target){
            const phi = 2 * Math.PI * u;
            
            const x = (exteriorRadius-centerRadius) * Math.cos(phi) * v + centerRadius * Math.cos(phi);
            const y = (exteriorRadius-centerRadius) * Math.sin(phi) * v + centerRadius * Math.sin(phi);
            const z = (1-v) * depth;

            return target.set(x,y,z);
        },radialSegments,lengthSegments
    )

    //uv

    return geometry;
}

//********************* */
// ENGINE CENTER
//******************* */ 
function buildEngineCenterGeometry(radius,hexagonRadius,radialSegments,lengthSegments){
    //Esta es un circulo con un agujero en forma de circulo
    const geometry = new ParametricGeometry(
        function (u,v,target){
            const phi = 2 * Math.PI * u;
            const x = (radius-hexagonRadius) * Math.cos(phi) * v + hexagonRadius * Math.cos(phi);
            const y = (radius-hexagonRadius) * Math.sin(phi) * v + hexagonRadius * Math.sin(phi);


            return target.set(x,y,0);
        },radialSegments,lengthSegments
    )

    //uv

    return geometry;
}

//********************* */
//      BASE
//******************* */ 
function buildCircleGeometry(radius,radialSegments,lengthSegments){
    const geometry = new ParametricGeometry(
        function(u,v,target){
            const phi = Math.PI * 2 * u;
            const x = Math.cos(phi) * radius * v;
            const y = Math.sin(phi) * radius * v;
            target.set(x,y,0)
        },radialSegments,lengthSegments
    )
    //uv

    return geometry;
}

//********************* */
// COMPLETE ENGINE
//******************* */ 
export function createTieEngines(){

    //engine border
    const plane_ring_geometry = buildPlaneRingGeometry(EXTERIOR_DIAMETER/2,CENTER_DIAMETER/2,DEPTH,120,120);
    const material_border = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        map: atlas_uv.barrasEstructura
    });

    const engine_border = new THREE.Mesh(plane_ring_geometry, material_border);
    
    //engine center
    const engine_center_geometry = buildEngineCenterGeometry(CENTER_DIAMETER/2,HEXAGON_DIAMETER/2,120,120);
    const material_center = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        map: atlas_uv.piezasRojas
    });
    const engine_center = new THREE.Mesh(engine_center_geometry, material_center);

    //BASE
    const circle_geometry = buildCircleGeometry((EXTERIOR_DIAMETER/2)/2,120,120);
    const material_base = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        map: atlas_uv.panelNegro
    });
    const engine_base = new THREE.Mesh(circle_geometry,material_base);

    //GROUPING
    const engine = new THREE.Group;
    engine.add(engine_border);
    engine.add(engine_center);
    engine.add(engine_base);

    engine_center.translateZ(DEPTH);
    engine_base.translateZ(DEPTH/2);

    
    return engine;
}