import { SCALE_TIE_FIGHTER as SCALE } from '../constants.js';


import * as THREE from 'three';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import * as atlas_uv from './atlas_uv.js'


//Medidas
export const LENGTH = 280 * SCALE; //2/3 cockpit - 1/3 tubes
export const DIAMETER_CENTER = 65 * SCALE;
const DIAMETER_EXT = 24 * SCALE;
export const DIAMETER_COCKPIT = 60 * SCALE;
    

function buildSphereFlattened(radius, angle, pronunciation=1, length=0, extDiameter, radialSegments, heightSegments){

    const totalLength = radius + length;
    const maxRadius = radius * pronunciation + extDiameter;

    //la siguiente curva esta hecha a partir de 3 valores, los demas vertices se fueron agregando pragmaticamente
    const catmull_curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-totalLength, extDiameter, 0),
        new THREE.Vector3(-totalLength * 0.85, extDiameter + (maxRadius-extDiameter)*0.25, 0),
        new THREE.Vector3(-totalLength * 0.65, extDiameter + (maxRadius-extDiameter)*0.65, 0),
        new THREE.Vector3(-totalLength * 0.35, maxRadius * 0.95, 0),
        new THREE.Vector3(0, maxRadius, 0),
        new THREE.Vector3(totalLength * 0.35, maxRadius * 0.95, 0),
        new THREE.Vector3(totalLength * 0.65, extDiameter + (maxRadius-extDiameter)*0.65, 0),
        new THREE.Vector3(totalLength * 0.85, extDiameter + (maxRadius-extDiameter)*0.25, 0),
        new THREE.Vector3(totalLength, extDiameter, 0)
    ], false, 'centripetal');

    const sphere_flattened = new ParametricGeometry(
        function(u,v,target){
            const phi = u * 2 * Math.PI;
            const point = catmull_curve.getPoint(v);

            const x = point.x;
            const y = point.y * Math.cos(phi);
            const z = point.y * Math.sin(phi);

            // Plano de corte frontal
            const cuty = - radius * 2;
            target.set(x, Math.max(y, cuty), z);;
        },
        radialSegments,heightSegments
    );

    //UV PLANO

    const uv = sphere_flattened.attributes.uv;

    for (let i = 0; i <= heightSegments; i++) {
        const v = i / heightSegments;

        for (let j = 0; j <= radialSegments; j++) {
            const u = j / radialSegments;

            const texU = v;
            const texV = u;

            const index = i * (radialSegments + 1) + j;

            uv.setXY(index, texU, texV);
        }
    }

    uv.needsUpdate = true;

    return sphere_flattened;
}

function buildTube(length,radius,radialSegments,lengthSegments){

    const tube = new ParametricGeometry(
        function(u,v,target){
            const phi = u * 2 * Math.PI;

            const x = v * length;
            const y = radius *  Math.cos(phi);
            const z = radius *  Math.sin(phi);
            target.set(x,y,z);
        }, radialSegments, lengthSegments
    )

    //UV

    const uv = tube.attributes.uv;

    for (let i = 0; i <= lengthSegments; i++) {
        const v = i / lengthSegments;

        for (let j = 0; j <= radialSegments; j++) {
            const u = j / radialSegments;

            const texU = u;
            const texV = (1 - v) * 2; // Repite dos veces a lo largo

            const index = j * (lengthSegments + 1) + i;

            uv.setXY(index, texU, texV);
        }
    }

    uv.needsUpdate = true;

    return tube;
}

function buildSemiSphere(radius,angle,radialSegments,heightSegments){
    const semi_sphere = new ParametricGeometry(
        function(u,v,target){
            const phi = (u* 2 * Math.PI);
            const tita = v * angle;

            const x = radius * Math.sin(tita) * Math.sin(phi);
            const y = radius * Math.sin(tita) * Math.cos(phi);
            const z = radius * Math.cos(tita) * 0.5; 
            target.set(x,y,z);
        },radialSegments , heightSegments
    )

    // UV circulares
const uv = semi_sphere.attributes.uv;

for (let i = 0; i <= heightSegments; i++) {
    const v = i / heightSegments;

    for (let j = 0; j <= radialSegments; j++) {
        const u = j / radialSegments;
        const phi = u * 2 * Math.PI;

        const r = 0.5 * Math.sin(v * angle) / Math.sin(angle);

        const texV = 0.5 + r * Math.sin(phi);
        const texU = 0.5 + r * Math.cos(phi);

        const index = i * (radialSegments + 1) + j;

        uv.setXY(index, texV, texU);
    }
}

uv.needsUpdate = true;

    return semi_sphere;
}

//********************* */
// COMPLETE FUSELAGE
//******************* */ 
export function createTieFuselage() {

    const radius = DIAMETER_CENTER / 2;

    const tubeLength = LENGTH / 6;
    const sphereLength = LENGTH - 2 * tubeLength;

    const extraLength = sphereLength / 2 - radius;

    const sphere_flattened = buildSphereFlattened(
        radius,
        Math.PI / 3.5,
        2,
        extraLength,
        DIAMETER_EXT,
        64,
        64
    );

    const material_sphere = new THREE.MeshBasicMaterial({
    map: atlas_uv.panelesCabinaMitades});
    const fuselage_center = new THREE.Mesh(sphere_flattened, material_sphere);
    
    
    const tube = buildTube(tubeLength, DIAMETER_EXT, 64, 64);
    atlas_uv.soportesBrazo.wrapT = THREE.RepeatWrapping            
    const material_tube = new THREE.MeshBasicMaterial({ 
            map: atlas_uv.soportesBrazo});
    
    const tube1 = new THREE.Mesh(tube, material_tube);
    const tube2 = new THREE.Mesh(tube, material_tube);
    
    //GROUPING

    const fuselage = new THREE.Group;
    
    fuselage.add(fuselage_center);
    fuselage.add(tube1);
    fuselage.add(tube2);

    tube1.position.x = sphereLength / 2;
    tube2.position.x = -LENGTH / 2;

    fuselage.rotateX(Math.PI/2);
    //Hasta aca el fuselaje sin cabina

    //Cabina
    const semi_sphere = buildSemiSphere(DIAMETER_COCKPIT,Math.PI/2,64,64);
    const material_cockpit = new THREE.MeshBasicMaterial({ 
            map: atlas_uv.aroCabinaNegro});

    const cockpit = new THREE.Mesh(semi_sphere,material_cockpit);
    cockpit.rotateX(Math.PI/2);
    fuselage.add(cockpit);
    cockpit.translateZ(((DIAMETER_CENTER + DIAMETER_COCKPIT)/2));

    

    return fuselage;
}