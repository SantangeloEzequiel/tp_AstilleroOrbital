import { ParametricGeometry } from 'three/examples/jsm/Addons.js';
import * as measures from './blueprints/measures.js';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

//-------------------
//  RIEL GEOMETRY
//-------------------
function buildLinesWithFrameWidth(vertex,frameWidth,widthSegments,heightSegments){
    
    const total = vertex.length;
    const geometries = [];

    for (let current = 0;current < total;current++){

     geometries.push(new ParametricGeometry(
        function (u,v,target){
            const t = u * 1.01;
            const line = vertex[current];

            //A y B
            const A = line.v1;
            const B = line.v2;
            //normales
            const dx =  B.x - A.x;
            const dy =  B.y - A.y;

            const nx =   dy /(Math.sqrt(dx * dx + dy * dy));
            const ny = - dx /(Math.sqrt(dx * dx + dy * dy));
            
            //positions
            const x = A.x + dx * t + frameWidth * (v-0.5) * nx;
            const y = A.y + dy * t + frameWidth * (v-0.5) * ny;

            target.set(x,y,0);
        },widthSegments,heightSegments))
    }
    //uv

    return BufferGeometryUtils.mergeGeometries(
            geometries,
            false
        );
}

function buildSquareWithCruces(side_length,espesor,sideSegments,espesorSegments){
    const vertex = [];
    vertex.push(new THREE.Vector2(-side_length/2,-side_length/2));
    vertex.push(new THREE.Vector2(-side_length/2,side_length/2));
    vertex.push(new THREE.Vector2(side_length/2,side_length/2));
    vertex.push(new THREE.Vector2(side_length/2,-side_length/2));

    const lines = [];
    
    for (let i= 0 ; i<4; i++){
        for(let j=0 ; j<i;j++)
            lines.push(new THREE.LineCurve(vertex[i],vertex[j]))
    }
    
    return buildLinesWithFrameWidth(lines,espesor,sideSegments,espesorSegments);
}

function buildRiel(side_length,espesor,sideSegments,espesorSegments){
    //creo las caras
    const faces = [];
    for(let i=0; i<6; i++)
        faces.push(buildSquareWithCruces(side_length,espesor,sideSegments,espesorSegments));
    
    //las roto
    faces[1].rotateY(Math.PI/2);
    faces[2].rotateX(Math.PI/2);
    faces[3].rotateY(Math.PI/2);
    faces[4].rotateX(Math.PI/2);
    //las acomodo
    
    //las acomodo
    faces[0].translate(0,0, side_length/2);
    faces[1].translate( side_length/2,0,0);
    faces[2].translate(0, side_length/2,0);
    faces[3].translate(-side_length/2,0,0);
    faces[4].translate(0,-side_length/2,0);
    faces[5].translate(0,0,-side_length/2);
    
    return BufferGeometryUtils.mergeGeometries(
            faces,
            false
        );
}



//-------------------
//  BUILD RIELS
//-------------------

export function buildRiels(Segments){
    //tendra cierta forma octagonal en los bordes
    const total_width = measures.TOTAL_WIDTH;
    const side_length = measures.RIELS_SIDE;
    const espesor     = measures.RIELS_ESPESOR;

    //utilizo cantidad de segmentos proporcionales al tamaño
    const totalArea = total_width * side_length * espesor * 6;
    const segmentsPerUnit = Math.sqrt(Segments / totalArea);

    const sideSegments = Math.max(1, Math.round(side_length * segmentsPerUnit));
    const espesorSegments = Math.max(1, Math.round(espesor * segmentsPerUnit));
    
    

    //RIEL
    const riel_geometry = buildRiel(side_length,espesor,sideSegments,espesorSegments);
    const material_riel = new THREE.MeshBasicMaterial({
        color: 0x111111,
        side: THREE.DoubleSide});
    const riel_unit = new THREE.Mesh(riel_geometry,material_riel);
    riel_unit.scale.x = 2;

    
    //GROUPING
    const riels = new THREE.Group();
    const rielWidth = 2 * side_length;

    for(let i = 0; i < total_width/rielWidth; i++){
    const aux = riel_unit.clone();

    aux.position.x = -total_width/2 + rielWidth/2 + i*rielWidth;
    aux.position.y = measures.TOTAL_HEIGHT/2 - side_length;

    riels.add(aux);
}
    return riels;
}