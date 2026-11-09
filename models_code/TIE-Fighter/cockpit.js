//La cabina vista desde adentro

import * as THREE from 'three';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import * as atlas_uv from './atlas_uv.js'



const SCALE = 0.01;
export const DIAMETER_COCKPIT = 65 * SCALE;
const FRAME_WIDTH = 4 * SCALE;



//********************* */
// GLASS SPHERE
//******************* */ 

function buildSphere(radius,radialSegments,BiradialSegments){
    const geometry = new ParametricGeometry(
        function (u,v,target){
            const phi = Math.PI * 2 * u;
            const thita = Math.PI * v;

            const x = radius * Math.sin(thita) * Math.cos(phi);
            const y = radius * Math.sin(thita) * Math.sin(phi);
            const z = radius * Math.cos(thita);

            target.set(x,y,z);
        },radialSegments,BiradialSegments
    )
    //uv
    
    return geometry
}


//********************* */
// WINDOW FRAME
//******************* */

function buildPlaneRing(diameterExt,diameterInt,radialSegments,widthSegments){
    const geometry = new ParametricGeometry(
        function (u,v,target){
            const phi = 2 * Math.PI * u;

            const x = Math.cos(phi) * ((diameterExt - diameterInt) * v + diameterInt);
            const y = Math.sin(phi) * ((diameterExt - diameterInt) * v + diameterInt);

            target.set(x,y,0);
        }, radialSegments, widthSegments
    )

    //uv

    return geometry;
}

function buildHexagon(vertex,frameWidth,widthSegments,heightSegments){
    const geometry = new ParametricGeometry(
        function (u,v,target){
            let current = Math.floor(6*u);
            if(current == 6)
                current = 5;
            let next = current+1;
            if(next == 6)
                next = 0;

            const t = (6 * u - current) * 1.15;

            //A y B
            const A = vertex[current];
            const B = vertex[next];
            //normales
            const dx =  B.x - A.x;
            const dy =  B.y - A.y;

            const nx =   dy /(Math.sqrt(dx * dx + dy * dy));
            const ny = - dx /(Math.sqrt(dx * dx + dy * dy));
            
            //positions
            const x = A.x + dx * t + frameWidth * (v-0.5) * nx;
            const y = A.y + dy * t + frameWidth * (v-0.5) * ny;

            target.set(x,y,0);
        },widthSegments,heightSegments
    )
    //uv
    return geometry;
}

function buildHexagonalArms(vertexExt,vertexInt,frameWidth,length,widthSegments,heightSegments){
    
    const arms = [];
    for(let current = 0; current <6; current ++){
    arms.push(new ParametricGeometry(
        function (u,v,target){
            const A = vertexExt[current];
            const B = vertexInt[current];
            //normales
            const dx =  B.x - A.x;
            const dy =  B.y - A.y;

            const nx =   dy /(Math.sqrt(dx * dx + dy * dy));
            const ny = - dx /(Math.sqrt(dx * dx + dy * dy));
            //posicion
            const x = A.x + dx * u + frameWidth*(v-0.5)*nx;
            const y = A.y + dy * u + frameWidth*(v-0.5)*ny;
            const z = u * length;

            target.set(x,y,z);
        },widthSegments,heightSegments
    ))};
    
    return BufferGeometryUtils.mergeGeometries(
            arms,
            false
        );
}

function buildHexagonWithArms(diameterExt,proportionDiameterInt,frameDiameter,length,radialSegments,widthSegments){
    //los siguientes exagonos son concentricos e inscriptos a la circunsferencia de tal diametro
    //entonces las lineas seran las uniones de los verticies, en orden
    const diameterInt = proportionDiameterInt * diameterExt;
    const vertex_hexagon_ext =[
        new THREE.Vector2( diameterExt   , 0),
        new THREE.Vector2( diameterExt/2 , diameterExt*Math.sqrt(3)/2),
        new THREE.Vector2(-diameterExt/2 , diameterExt*Math.sqrt(3)/2),
        new THREE.Vector2(-diameterExt   , 0),
        new THREE.Vector2(-diameterExt/2 ,-diameterExt*Math.sqrt(3)/2),
        new THREE.Vector2( diameterExt/2 ,-diameterExt*Math.sqrt(3)/2)
    ];
    const vertex_hexagon_int =[
        new THREE.Vector2( diameterInt   , 0),
        new THREE.Vector2( diameterInt/2 , diameterInt*Math.sqrt(3)/2),
        new THREE.Vector2(-diameterInt/2 , diameterInt*Math.sqrt(3)/2),
        new THREE.Vector2(-diameterInt   , 0),
        new THREE.Vector2(-diameterInt/2 ,-diameterInt*Math.sqrt(3)/2),
        new THREE.Vector2( diameterInt/2 ,-diameterInt*Math.sqrt(3)/2)
    ];

    const hexagon = buildHexagon(vertex_hexagon_int,frameDiameter,radialSegments/2,widthSegments/2);
    const hexagonal_arms = buildHexagonalArms(vertex_hexagon_ext,vertex_hexagon_int,frameDiameter,length,radialSegments/2,widthSegments/2);
    hexagon.translate(0,0,length)
    return BufferGeometryUtils.mergeGeometries(
            [hexagon,hexagonal_arms],
            false
        );
}

function buildWindowFrameGeometry(diameter,proportionSphere,proportionCircle,frameWidth,radialSegments,widthSegments){
    const diameter_int = diameter*proportionCircle*proportionSphere;
    const plane_ring = buildPlaneRing(diameter*proportionSphere , diameter_int,
        radialSegments/2,widthSegments/2);

    //La mitad del circulo es el hexagono, y la mitad exterior las lineas
    const hexagon_with_hexagonal_arms = buildHexagonWithArms(diameter_int,1/2,frameWidth,diameter/2,radialSegments/2,widthSegments/2);
    
    return BufferGeometryUtils.mergeGeometries(
            [plane_ring,hexagon_with_hexagonal_arms],
            false
        );
}

//********************* */
// COMPLETE FUSELAGE
//******************* */ 
export function createTieCockpit() {
    //GLASS
    const sphere = buildSphere(DIAMETER_COCKPIT,120,120);
    const material_glass = new THREE.MeshPhysicalMaterial({
    color: 0x111155,
    metalness: 0,
    roughness: 0.05,
    transmission: 0,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
    depthWrite: false
    });
    const glass = new THREE.Mesh(sphere,material_glass);

    //WINDOW FRAME
    const window_frame_geometry = buildWindowFrameGeometry(DIAMETER_COCKPIT,3/4,3/4,FRAME_WIDTH,120,120);
    const material_window_frame = new THREE.MeshBasicMaterial({ 
    color: 0x303236,
    metalness: 0.75,
    roughness: 0.55,
    side: THREE.DoubleSide
    });
    const window_frame = new THREE.Mesh(window_frame_geometry,material_window_frame);
        
    //CONTROLS

    //GRPUPING
    const cockpit = new THREE.Group();
    cockpit.add(glass);
    cockpit.add(window_frame);

    return cockpit;
}