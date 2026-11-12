import { ParametricGeometry } from 'three/examples/jsm/Addons.js';
import * as measures from './blueprints/measures.js';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

import {WINGS_FRAME_DIAMETER} from '../TIE-Fighter/blueprints/measures.js';


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

//-------------------
//  BUILD RIELS SUPPORT
//-------------------

export function buildRielsSupport(Segments){
    
    const riels_side_length = measures.RIELS_SIDE;
    const wing_espesor = WINGS_FRAME_DIAMETER;
    const support_espesor = measures.SUPPORT_ESPESOR
    const support_radius = measures.SUPPORT_CONECTOR_DIAMETER/2;
    const support_height = measures.SUPPORT_ARM_HEIGHT

    //utilizo cantidad de segmentos proporcionales al tamaño
    const radialSegments = 120;
    const widthSegments = 120;
    const heightSegments = 120;
    const depthSegments = 120;

    //RIEL Suport
    const riel_suport_geometry = buildSemiBoxWithEspesor(riels_side_length,riels_side_length,riels_side_length,support_espesor
        ,widthSegments,heightSegments,depthSegments);
    const material_riel_suport = new THREE.MeshBasicMaterial({
        color: 0x888888,
        side: THREE.DoubleSide});
    const riel_suport = new THREE.Mesh(riel_suport_geometry,material_riel_suport);

    //union
    const union_geometry = buildSphere(support_radius,radialSegments,widthSegments);
    const material_union = new THREE.MeshBasicMaterial({
        color: 0x888888,
        side: THREE.DoubleSide});
    const union = new THREE.Mesh(union_geometry,material_union);
    
    //Wing Suport
    const wing_suport_geometry = buildSemiBoxWithEspesor(wing_espesor+support_espesor,riels_side_length,support_height,support_espesor
        ,widthSegments,heightSegments,depthSegments);
    const material_wing_suport = new THREE.MeshBasicMaterial({
        color: 0x888888,
        side: THREE.DoubleSide});
    const wing_suport = new THREE.Mesh(wing_suport_geometry,material_wing_suport);
    
    //GROUPING
    const suport = new THREE.Group();

    suport.add(riel_suport);
    suport.add(union);
    suport.add(wing_suport);

    riel_suport.scale.y=-1;
    riel_suport.rotateY(Math.PI/2);
    riel_suport.translateY(riels_side_length + support_radius * 0.8);
    wing_suport.translateY(- (support_height + support_radius * 0.8))

    return suport;
}