import { ParametricGeometry } from 'three/examples/jsm/Addons.js';
import * as measures from './blueprints/measures.js';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';


//----------
//  PLANE
//----------

function buildPlane(width,heigth,withSegments,heigthSegments){
    const geometry = new ParametricGeometry(
        function (u,v,target){
            const x =(u-0.5) * width;
            const y =(v-0.5) * heigth;
            target.set(x,y,0);
        },withSegments,heigthSegments
    )
    //uv
    return geometry;
}


//----------
//  EXTERIOR
//----------

function getOrtogonalVertex(width,height,proportion){
    return  [
        new THREE.Vector2(width/2, height*proportion/2),
        new THREE.Vector2(width*proportion/2, height/2),

        new THREE.Vector2(-width*proportion/2, height/2),
        new THREE.Vector2(-width/2, height*proportion/2),

        new THREE.Vector2(-width/2, -height*proportion/2),
        new THREE.Vector2(-width*proportion/2, -height/2),

        new THREE.Vector2(width*proportion/2, -height/2),
        new THREE.Vector2(width/2, -height*proportion/2)
    ];
}

function buildOctogonalPlane(width,heigth,proportion,withSegments,heigthSegments){
    //defino los vertices del octagono, con z =0, empezando desde el vertice derecho abaho
    const vertex = getOrtogonalVertex(width,heigth,proportion);

    const geometry = new ParametricGeometry(
        function (u,v,target){
            let side = Math.floor(u*8);
            if (side == 8)
                side = 7;
            let next = side+1;
            if (next == 8)
                next = 0;

            const dx = vertex[next].x - vertex[side].x;
            const dy = vertex[next].y - vertex[side].y;

            const t = 8*u - side;

            const x = (vertex[side].x + t * dx) * v;
            const y = (vertex[side].y + t * dy) * v;

            target.set(x,y,0);
        },withSegments,heigthSegments
    )
    //uv
    return geometry;
}

function buildDiagonalWalls(width,height,depth,proportion,heightSegments,depthSegments){
    const vertices = getOrtogonalVertex(width,height,proportion);

    const diagonal_walls = [];
    for (let i = 0; i < 4; i++) {

        const A = vertices[i * 2];
        const B = vertices[i * 2 + 1];

        const geometry = new ParametricGeometry(
            function(u, v, target) {

                const x = A.x + (B.x - A.x) * u;
                const y = A.y + (B.y - A.y) * u;
                const z = (v - 0.5) * depth;

                target.set(x, y, z);

            },
            heightSegments,
            depthSegments
        );

        diagonal_walls.push(geometry);
    }
    return diagonal_walls;
}


function buildExterior(width,height,depth,proportion,widthSegments,heigthSegments,depthSegments){
    
    const octogonalSegments = Math.max(8 , Math.ceil(widthSegments / 8) * 8);
    
    const dx = width * (1 - proportion) / 2;
    const dy = height * (1 - proportion);

    const back           = buildOctogonalPlane(width,2*height,proportion,octogonalSegments,heigthSegments);
    const wall1          = buildPlane(depth,height,depthSegments,heigthSegments);
    const floor          = buildPlane(width*proportion,depth,widthSegments,depthSegments);
    const roof           = buildPlane(width*proportion,depth,widthSegments,depthSegments);
    const wall2 = wall1.clone();

    wall1.rotateY(Math.PI/2);
    wall2.rotateY(Math.PI/2);
    floor.rotateX(Math.PI/2);
    roof.rotateX(Math.PI/2);
    
    back.translate(0,0,-depth/2-0.001);
    wall1.translate(-width/2 - 0.001,0,0);
    wall2.translate(width/2 + 0.001,0,0);
    floor.translate(0,-height,0);
    roof.translate(0,height,0);

    const diagonal_walls = buildDiagonalWalls(width,height*2,depth,proportion,heigthSegments,depthSegments);

    return BufferGeometryUtils.mergeGeometries(
                [back,wall1,wall2,floor,roof,...diagonal_walls],
                false
            );
}


//----------
//  DOOR
//----------

function buildOctogonalRing(width,heigth,proportion,scaleInternWidth,scaleInternHeight,heightSegments,widthSegments){
    const vertex = getOrtogonalVertex(width,heigth,proportion);

    const geometry = new ParametricGeometry(
        function (u,v,target){
            let side = Math.floor(u*8);
            if (side == 8)
                side = 7;
            let next = side+1;
            if (next == 8)
                next = 0;

            const dx = vertex[next].x - vertex[side].x;
            const dy = vertex[next].y - vertex[side].y;

            const t = 8*u - side;

            const x = vertex[side].x + t * (vertex[next].x - vertex[side].x);
            const y = vertex[side].y + t * (vertex[next].y - vertex[side].y);

            const factorX = scaleInternWidth + (1 - scaleInternWidth) * v;
            const factorY = scaleInternHeight + (1 - scaleInternHeight) * v;

            target.set(x * factorX, y * factorY, 0);
        },widthSegments,heightSegments
    )
    //uv
    return geometry;
}

function buildOctogonalDepth(width,heigth,proportion,depth,heightSegments,widthSegments){
    const vertex = getOrtogonalVertex(width,heigth,proportion);

    const geometry = new ParametricGeometry(
        function (u,v,target){
            let side = Math.floor(u*8);
            if (side == 8)
                side = 7;
            let next = side+1;
            if (next == 8)
                next = 0;

            const dx = vertex[next].x - vertex[side].x;
            const dy = vertex[next].y - vertex[side].y;

            const t = 8*u - side;

            const x = (vertex[side].x + t * dx);
            const y = (vertex[side].y + t * dy);
            const z = (0.5 - v) * depth;
            target.set(x,y,z);
        },widthSegments,heightSegments
    )
    //uv
    return geometry;
}

function buildOctogonalToroid(width,height,proportion,depth,internWidth,heightSegments,widthSegments){
    const octogonalSegments = Math.max(8,Math.ceil(widthSegments / 8) * 8);
    const scaleInternWidth = 1 - 2 * internWidth / width;
    const scaleInternHeight = 1 - 2 * internWidth / (height);
    
    const back = buildOctogonalRing(width,height*2,proportion,scaleInternWidth,scaleInternHeight,heightSegments,octogonalSegments);
    const front = buildOctogonalRing(width,height*2,proportion,scaleInternWidth,scaleInternHeight,heightSegments,octogonalSegments);
    const border_ext = buildOctogonalDepth(width,height*2,proportion,depth,heightSegments,octogonalSegments);
    const border_int = buildOctogonalDepth(width*scaleInternWidth,height*scaleInternHeight*2,proportion,depth,heightSegments,octogonalSegments);

    back.translate(0,0,-depth/2);
    front.translate(0,0,depth/2);

    return BufferGeometryUtils.mergeGeometries(
                [back,front, border_ext, border_int],
                false
            );
}


//-------------------
//  BUILD STRUCTURE
//-------------------

export function buildStructure(Segments){
    //tendra cierta forma octagonal en los bordes
    const width = measures.TOTAL_WIDTH;
    const height = measures.TOTAL_HEIGHT;
    const depth = measures.TOTAL_DEPTH;
    const proportion = measures.TOTAL_PROPORTION;

    //utilizo cantidad de segmentos proporcionales al tamaño
    const totalArea = 4 * (height*width + height*depth + width*depth);
    const segmentsPerUnit = Math.sqrt(Segments / totalArea);

    const widthSegments = Math.max(1, Math.round(width * segmentsPerUnit));
    const heightSegments = Math.max(1, Math.round(height * segmentsPerUnit));
    const depthSegments = Math.max(1, Math.round(depth * segmentsPerUnit));

    //BACK
    const back_geometry = buildPlane(width,height,widthSegments,heightSegments);
    const material_back = new THREE.MeshBasicMaterial({
        color: 0x555577,
        side: THREE.DoubleSide});
    const back = new THREE.Mesh(back_geometry,material_back);

    //LATERAL WALLS
    const walls_geometry = buildPlane(depth,height,depthSegments,heightSegments);
    const material_walls = new THREE.MeshBasicMaterial({
        color: 0x557755,
        side: THREE.DoubleSide});
    const wall1 = new THREE.Mesh(walls_geometry,material_walls);
    const wall2 = wall1.clone();

    wall1.rotateY(Math.PI/2);
    wall2.rotateY(Math.PI/2);
    
    //ROOF
    const roof_geometry = buildPlane(width,depth,widthSegments,depthSegments);
    const material_roof = new THREE.MeshBasicMaterial({
        color: 0x775555,
        side: THREE.DoubleSide});
    const roof = new THREE.Mesh(roof_geometry,material_roof);
    roof.rotateX(Math.PI/2);

    //FLOOR
    const floor_geometry = buildPlane(width,depth,widthSegments,depthSegments);
    const material_floor = new THREE.MeshBasicMaterial({
        color: 0x775555,
        side: THREE.DoubleSide});
    const floor = new THREE.Mesh(floor_geometry,material_floor);
    floor.rotateX(-Math.PI/2);

    //EXTERIOR
    const exterior_geometry = buildExterior(width,height,depth,proportion,widthSegments,heightSegments,depthSegments);
    const material_exterior = new THREE.MeshBasicMaterial({
        color: 0x777777,
        side: THREE.DoubleSide});
    const exterior = new THREE.Mesh(exterior_geometry,material_exterior);

    //FRAME DOOR
    const frame_door_geometry = buildOctogonalToroid(width,height,proportion,measures.DOOR_FRAME_DEPTH,measures.DOOR_FRAME_WIDTH,heightSegments,widthSegments);
    const material_frame_door = new THREE.MeshBasicMaterial({
        color: 0x444477,
        side: THREE.DoubleSide});
    const frame_door = new THREE.Mesh(frame_door_geometry,material_frame_door);
    //DOOR

    //GROUPING
    const structure = new THREE.Group();
    structure.add(back);
    structure.add(wall1);
    structure.add(wall2);
    structure.add(roof);
    structure.add(floor);
    structure.add(exterior);
    structure.add(frame_door);

    back.position.z  = -depth/2;
    wall1.position.x = -width/2;
    wall2.position.x =  width/2;
    floor.position.y = -height/2;
    roof.position.y  =  height/2;
    frame_door.position.z = (depth+measures.DOOR_FRAME_DEPTH)/2;

    return structure;
}