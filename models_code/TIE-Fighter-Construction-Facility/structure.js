import { ParametricGeometry } from 'three/examples/jsm/Addons.js';
import * as measures from './blueprints/measures.js';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

import * as texture_uv from './texture_uv.js'
import * as normal_texture_uv from './normal_texture_uv.js'


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

//Esta funcion fue hecha con IA
function buildFloorWithHoles(width, depth, holes) {
    const xLimits = [-width / 2, width / 2];
    const zLimits = [-depth / 2, depth / 2];

    for (const hole of holes) {
        xLimits.push(hole.x - hole.width / 2);
        xLimits.push(hole.x + hole.width / 2);

        zLimits.push(hole.z - hole.depth / 2);
        zLimits.push(hole.z + hole.depth / 2);
    }

    const xs = [...new Set(xLimits)].sort((a, b) => a - b);
    const zs = [...new Set(zLimits)].sort((a, b) => a - b);

    const geometries = [];

    for (let i = 0; i < xs.length - 1; i++) {
        for (let j = 0; j < zs.length - 1; j++) {

            const x0 = xs[i];
            const x1 = xs[i + 1];

            const z0 = zs[j];
            const z1 = zs[j + 1];

            const centerX = (x0 + x1) / 2;
            const centerZ = (z0 + z1) / 2;

            const insideHole = holes.some(hole =>
                centerX > hole.x - hole.width / 2 &&
                centerX < hole.x + hole.width / 2 &&
                centerZ > hole.z - hole.depth / 2 &&
                centerZ < hole.z + hole.depth / 2
            );

            if (insideHole) continue;

            const geometry = buildPlane(
                x1 - x0,
                z1 - z0,
                1,
                1
            );
            geometry.rotateX(-Math.PI / 2);
            geometry.translate(centerX, 0, centerZ);

            geometries.push(geometry);
        }
    }

    const geometry = BufferGeometryUtils.mergeGeometries(
        geometries,
        false
    );

    //UV
    const position = geometry.attributes.position;
    const uv = geometry.attributes.uv;

    for (let i = 0; i < position.count; i++) {

        const x = position.getX(i);
        const z = position.getZ(i);

        const u = (x + width / 2) / width;
        const v = (depth / 2 - z) / depth;

        uv.setXY(i, u, v);
    }

    uv.needsUpdate = true;

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
    
    //UV
    const position = geometry.attributes.position;
    const uv = geometry.attributes.uv;

    for(let i = 0; i < position.count; i++){

        const x = position.getX(i);
        const y = position.getY(i);

        uv.setXY(
            i,
            (x + width/2) / width,
            (y + heigth/2) / heigth
        );
    }

    uv.needsUpdate = true;
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

        //UV
        const uv = geometry.attributes.uv;

        for(let j = 0; j < uv.count; j++){
        
            const u = uv.getX(j);
            const v = uv.getY(j);
        
            uv.setXY(j, v, u);
        }

        uv.needsUpdate = true;
        diagonal_walls.push(geometry);
    }

    
    return diagonal_walls;
}


function buildExterior(width,height,depth,proportion,proportion_exterior_heigth,widthSegments,heigthSegments,depthSegments){
    
    const octogonalSegments = Math.max(8 , Math.ceil(widthSegments / 8) * 8);
    
    const dx = width * (1 - proportion) / 2;
    const dy = height * (1 - proportion);

    const back           = buildOctogonalPlane(width,proportion_exterior_heigth*height,proportion,octogonalSegments,heigthSegments);
    const wall1          = buildPlane(depth,height * proportion_exterior_heigth * proportion,depthSegments,heigthSegments);
    const floor          = buildPlane(width*proportion,depth,widthSegments,depthSegments);
    const roof           = buildPlane(width*proportion,depth,widthSegments,depthSegments);
    const wall2 = wall1.clone();

    wall1.rotateY(Math.PI/2);
    wall2.rotateY(Math.PI/2);
    floor.rotateX(Math.PI/2);
    roof.rotateX(Math.PI/2);
    
    back.translate(0,0,-depth/2-0.01);
    wall1.translate(-width/2 - 0.01,0,0);
    wall2.translate(width/2 + 0.01,0,0);
    floor.translate(0,-height*proportion_exterior_heigth/2,0);
    roof.translate(0,height*proportion_exterior_heigth/2,0);

    const diagonal_walls = buildDiagonalWalls(width,height * proportion_exterior_heigth,depth,proportion,heigthSegments,depthSegments);

        //UV
        const tile_width = 80;
        const tile_height = 40;

        const exterior_height = height * proportion_exterior_heigth;

        const diagonal_length = Math.hypot(
            width * (1 - proportion) / 2,
            exterior_height * (1 - proportion) / 2
        );

        //Intercambio UV del techo y piso
        for(const geometry of [roof, floor]){
        
            const uv = geometry.attributes.uv;
        
            for(let i = 0; i < uv.count; i++){
            
                const u = uv.getX(i);
                const v = uv.getY(i);
            
                uv.setXY(i, v, u);
            }
        
            uv.needsUpdate = true;
        }

        //Dimensiones reales de cada cara
        const faces = [
            [back, width, exterior_height],
            [wall1, depth, exterior_height * proportion],
            [wall2, depth, exterior_height * proportion],
            [floor, depth, width * proportion],
            [roof, depth, width * proportion],
        
            ...diagonal_walls.map(geometry => [
                geometry,
                depth,
                diagonal_length
            ])
        ];

        //Escalado de UV
        for(const [geometry, face_width, face_height] of faces){
        
            const uv = geometry.attributes.uv;
        
            for(let i = 0; i < uv.count; i++){
            
                const u = uv.getX(i);
                const v = uv.getY(i);
            
                uv.setXY(
                    i,
                    u * face_width / tile_width,
                    v * face_height / tile_height
                );
            }
        
            uv.needsUpdate = true;
        }

    return BufferGeometryUtils.mergeGeometries(
                [back,wall1,wall2,floor,roof,...diagonal_walls],
                false
            );
}


//----------
//  DOOR
//----------

function buildOctogonalRing(width,heigth,proportion,interProportion,scaleInternWidth,scaleInternHeight,heightSegments,widthSegments){

    const vertexExt = getOrtogonalVertex(width,heigth,proportion);

    const vertexInt = getOrtogonalVertex(width * scaleInternWidth,heigth * scaleInternHeight,interProportion);

    const geometry = new ParametricGeometry(
        function(u,v,target){

            let side = Math.floor(u*8);
            if (side == 8)
                side = 7;

            let next = side+1;
            if (next == 8)
                next = 0;

            const t = 8*u - side;

            const xExt = vertexExt[side].x + t * (vertexExt[next].x - vertexExt[side].x);
            const yExt = vertexExt[side].y + t * (vertexExt[next].y - vertexExt[side].y);

            const xInt = vertexInt[side].x + t * (vertexInt[next].x - vertexInt[side].x);
            const yInt = vertexInt[side].y + t * (vertexInt[next].y - vertexInt[side].y);

            const x = xInt + (xExt - xInt) * v;
            const y = yInt + (yExt - yInt) * v;

            target.set(x,y,0);

        },widthSegments,heightSegments
    );

    const position = geometry.attributes.position;
    const uv = geometry.attributes.uv;

    for(let i = 0; i < position.count; i++){

        const x = position.getX(i);
        const y = position.getY(i);

        uv.setXY(
            i,
            (x + width/2) / width,
            (y + heigth/2) / heigth
        );
    }

    uv.needsUpdate = true;

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
    ///UV

        const tile_width = 80;
        const tile_height = 40;

        const lengths = [];
        let perimeter = 0;

        //Corro la textura 
        const offset_u = 0.25;
        const offset_v = 0.3;

        //Longitud de cada lado
        for(let i = 0; i < 8; i++){
        
            const A = vertex[i];
            const B = vertex[(i + 1) % 8];
        
            const length = A.distanceTo(B);
        
            lengths.push(length);
            perimeter += length;
        }

        //Cantidad de repeticiones sobre el perimetro
        const repetitions = Math.max(
            1,
            Math.round(perimeter / tile_height)
        );

        const uv = geometry.attributes.uv;

        for(let i = 0; i < uv.count; i++){
        
            const u = uv.getX(i);
            const v = uv.getY(i);
        
            const side = Math.min(7, Math.floor(u * 8));
            const local_u = u * 8 - side;
        
            let distance = 0;
        
            for(let j = 0; j < side; j++){
            
                distance += lengths[j];
            }
        
            distance += local_u * lengths[side];
        
            uv.setXY(
                i,
                (1 - v) * depth / tile_width,
                distance / perimeter * repetitions
            );
        }

        uv.needsUpdate = true;
    return geometry;
}

function buildOctogonalToroid(width,height,proportion,proportion_exterior_heigth,depth,internWidth,interProportion,heightSegments,widthSegments){

    const octogonalSegments = Math.max(8,Math.ceil(widthSegments / 8) * 8);

    const scaleInternWidth = 1 - 2 * internWidth / width;
    const scaleInternHeight = (height - 2 * internWidth) / (height * proportion_exterior_heigth);

    const back = buildOctogonalRing(width,height*proportion_exterior_heigth,proportion,interProportion,scaleInternWidth,scaleInternHeight,heightSegments,octogonalSegments);
    const front = buildOctogonalRing(width,height*proportion_exterior_heigth,proportion,interProportion,scaleInternWidth,scaleInternHeight,heightSegments,octogonalSegments);

    const border_ext = buildOctogonalDepth(width,height*proportion_exterior_heigth,proportion,depth,heightSegments,octogonalSegments);

    const border_int = buildOctogonalDepth(width*scaleInternWidth,height*proportion_exterior_heigth*scaleInternHeight,interProportion,depth,heightSegments,octogonalSegments);

    back.translate(0,0,-depth/2);
    front.translate(0,0,depth/2);

    return BufferGeometryUtils.mergeGeometries(
        [back,front,border_ext,border_int],
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
    const proportion_exterior_heigth = measures.TOTAL_EXTERIOR_HEIGTH_PROPORTION;

    //utilizo cantidad de segmentos proporcionales al tamaño
    const totalArea = 4 * (height*width + height*depth + width*depth);
    const segmentsPerUnit = Math.sqrt(Segments / totalArea);

    const widthSegments = Math.max(1, Math.round(width * segmentsPerUnit));
    const heightSegments = Math.max(1, Math.round(height * segmentsPerUnit));
    const depthSegments = Math.max(1, Math.round(depth * segmentsPerUnit));

    //BACK
    const back_geometry = buildPlane(width,height,widthSegments,heightSegments);
    const material_back = new THREE.MeshStandardMaterial({
        map: texture_uv.fondo,
        normalMap: normal_texture_uv.fondo,
        normalScale: new THREE.Vector2(1, 1),
        side: THREE.DoubleSide});
    const back = new THREE.Mesh(back_geometry,material_back);

    //LATERAL WALLS
    const walls_geometry = buildPlane(depth,height,depthSegments,heightSegments);
    const material_walls = new THREE.MeshStandardMaterial({
        map: texture_uv.pared,
        normalMap: normal_texture_uv.pared,
        normalScale: new THREE.Vector2(1, 1),
        side: THREE.DoubleSide});
    const wall1 = new THREE.Mesh(walls_geometry,material_walls);
    const wall2 = wall1.clone();

    wall1.rotateY(Math.PI/2);
    wall2.rotateY(Math.PI/2);
    
    //ROOF
    const roof_geometry = buildPlane(width,depth,widthSegments,depthSegments);
    const material_roof = new THREE.MeshStandardMaterial({
        map: texture_uv.techo,
        side: THREE.DoubleSide});
    const roof = new THREE.Mesh(roof_geometry,material_roof);
    roof.rotateX(Math.PI/2);

    //FLOOR
    const side_length = 3.2;
    //Agujeros: fuselaje,alas,grua
    const holes = [
    { x: -side_length, z: 0, width: side_length, depth: side_length },
    { x: side_length, z: 0, width: side_length, depth: side_length },
    { x: 0, z: -side_length * 1.5, width: side_length * 4, depth: side_length }];
    const floor_geometry = buildFloorWithHoles(width, depth, holes);
    const material_floor = new THREE.MeshStandardMaterial({
        map: texture_uv.piso,
        side: THREE.DoubleSide,
        normalMap: normal_texture_uv.piso,
        normalScale: new THREE.Vector2(0.5, 0.5),
        metalness: 0.7,
        roughness: 0.1,
        envMapIntensity: 1.5  
        });
    const floor = new THREE.Mesh(floor_geometry,material_floor);
    //floor.rotateX(-Math.PI/2);

    //EXTERIOR
    const exterior_geometry = buildExterior(width,height,depth,proportion,proportion_exterior_heigth,widthSegments,heightSegments,depthSegments);
    const material_exterior = new THREE.MeshStandardMaterial({
        map:texture_uv.exterior,
        side: THREE.DoubleSide});
    const exterior = new THREE.Mesh(exterior_geometry,material_exterior);

    //FRAME DOOR
    const frame_door_geometry = buildOctogonalToroid(width,height,proportion,proportion_exterior_heigth,measures.DOOR_FRAME_DEPTH,measures.DOOR_FRAME_WIDTH,measures.DOOR_PROPORTION_OCTAGON_FRAME,
        heightSegments,widthSegments);
    const material_frame_door = new THREE.MeshStandardMaterial({
        map:texture_uv.exterior,
        side: THREE.DoubleSide});
    const frame_door = new THREE.Mesh(frame_door_geometry,material_frame_door);

    //DOOR
    const scaleInternWidth = 1 - 2 * measures.DOOR_FRAME_WIDTH / width-0.01;
    const scaleInternHeight =(height - 2 * measures.DOOR_FRAME_WIDTH) / (height * proportion_exterior_heigth) - 0.01;
    const octogonalSegments = Math.max(8,Math.ceil(heightSegments / 8) * 8);

    const door_geometry = buildOctogonalDepth(width * scaleInternWidth ,proportion_exterior_heigth*height * scaleInternHeight,measures.DOOR_PROPORTION_OCTAGON_FRAME
        , measures.DOOR_FRAME_DEPTH,depthSegments,octogonalSegments);
    const material_door = new THREE.MeshStandardMaterial({
        color: 0x111111,
        side: THREE.DoubleSide});
    const door = new THREE.Mesh(door_geometry,material_door);

    //GROUPING
    const structure = new THREE.Group();
    structure.add(back);
    structure.add(wall1);
    structure.add(wall2);
    structure.add(roof);
    structure.add(floor);
    structure.add(exterior);
    structure.add(frame_door);
    structure.add(door)

    back.position.z  = -depth/2;
    wall1.position.x = -width/2;
    wall2.position.x =  width/2;
    floor.position.y = -height/2;
    roof.position.y  =  height/2;
    frame_door.position.z = (depth+measures.DOOR_FRAME_DEPTH)/2;
    door.position.z=(depth+measures.DOOR_FRAME_DEPTH)/2;



    //LIGTHS 
        const ligth_geometry = buildPlane(measures.COLUMNS_SIDE/4,measures.COLUMNS_SIDE/2,1,1);
        const material_ligth = new THREE.MeshStandardMaterial({
            map: texture_uv.luzIndividual,
            side: THREE.DoubleSide,
            emissiveMap: texture_uv.luzIndividual,
            emissive: 0xAAAAAA,
            emissiveIntensity:3,
        })
    
        const light = new THREE.Mesh(ligth_geometry,material_ligth);
        light.rotateZ(-Math.PI/2);
        //light.translateY((side_length/2 + 0.1));
        light.position.z+=0.1;
        
       //CLONES
        for(let i=0; i<2; i++){
            const light_clone = light.clone();
            light_clone.position.y = (i-0.5) * measures.TOTAL_DEPTH/2.5;
            roof.add(light_clone);
        }

    return structure;
}