import * as THREE from 'three';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import * as atlas_uv from './atlas_uv.js'
import { Group } from 'three/examples/jsm/libs/tween.module.js';

const SCALE = 0.009;
export const LENGTH = 270 * SCALE;
export const DIAMETER_CENTER = 85 * SCALE;
const DIAMETER_EXT = 26 * SCALE;
const DIAMETER_COCKPIT = 56 * SCALE;
    

function buildSphereFlattened(radius, angle, pronunciation=1, length=0, extDiameter, radialSegments, heightSegments){
    const bezier_curve = new THREE.CubicBezierCurve(
        new THREE.Vector2(-(radius+length), extDiameter),
        new THREE.Vector2(-radius * Math.cos(angle),radius * pronunciation + extDiameter),
        new THREE.Vector2( radius * Math.cos(angle),radius * pronunciation + extDiameter),
        new THREE.Vector2(radius + length, extDiameter)
    );

    const sphere_flattened = new ParametricGeometry (
        function(u,v,target){
            const phi = u * 2 * Math.PI
            const point = bezier_curve.getPoint(v);

            const x = point.x;
            const y = point.y * Math.cos(phi);
            const z = point.y * Math.sin(phi);

            target.set(x,y,z);
        },
        radialSegments,heightSegments
    )
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

    return tube;
}

function buildSemiSphere(radius,angle,radialSegments,heightSegments){
    const semi_sphere = new ParametricGeometry(
        function(u,v,target){
            const phi = (u* 2 * Math.PI);
            const tita = v * angle;

            const x = radius * Math.sin(tita) * Math.sin(phi);
            const y = radius * Math.sin(tita) * Math.cos(phi);
            const z = radius * Math.cos(tita); 
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

        const texU = 0.5 + r * Math.sin(phi);
        const texV = 0.5 + r * Math.cos(phi);

        const index = i * (radialSegments + 1) + j;

        uv.setXY(index, texU, texV);
    }
}

uv.needsUpdate = true;

    return semi_sphere;
}

//********************* */
// COMPLETE FUSELAGE
//******************* */ 
export function createTieFuselage(){

    const sphere_flattened = buildSphereFlattened(DIAMETER_CENTER/2, Math.PI/3.5 ,2.6 ,(LENGTH)/3.5 ,DIAMETER_EXT , 64, 64);

    const tube = buildTube((LENGTH - (DIAMETER_CENTER+LENGTH/3.5))/2 , DIAMETER_EXT , 64 , 64);

    const material_sphere = new THREE.MeshBasicMaterial({ 
            map: atlas_uv.panelesCabinaMitades});
    const material_tube = new THREE.MeshBasicMaterial({ 
            map: atlas_uv.soportesBrazo});
    
    const tube1 = new THREE.Mesh(tube, material_tube);
    const tube2 = new THREE.Mesh(tube, material_tube);
    const fuselage_center = new THREE.Mesh(sphere_flattened, material_sphere);

    const fuselage = new THREE.Group;
    
    fuselage.add(fuselage_center);
    fuselage.add(tube1);
    fuselage.add(tube2);

    tube1.translateX((DIAMETER_CENTER)/2+LENGTH/3.5);
    tube2.translateX(-(DIAMETER_CENTER+LENGTH/3.5));

    fuselage.rotateX(Math.PI/2);
    //Hasta aca el fuselaje sin cabina

    //Cabina
    const semi_sphere = buildSemiSphere(DIAMETER_COCKPIT,Math.PI/2,64,64);
    const material_cockpit = new THREE.MeshBasicMaterial({ 
            map: atlas_uv.aroCabinaNegro});

    const cockpit = new THREE.Mesh(semi_sphere,material_cockpit);
    cockpit.rotateX(Math.PI/2);
    fuselage.add(cockpit);
    cockpit.translateZ(DIAMETER_CENTER/2+DIAMETER_COCKPIT/2);

    

    return fuselage;
}