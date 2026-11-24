import { ParametricGeometry } from 'three/examples/jsm/Addons.js';
import * as measures from './blueprints/measures.js';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

import * as texture_uv from './texture_uv.js'


//-------------------
//      _  
//     /
//    /
//    |
//    \
//     \
//      _
//-------------------
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

function buildTrianguleRectangule(width,height,widthSegments,heightSegments){
    const geometry = new ParametricGeometry(
        function (u,v,target){
            const x = u * width * (1-v);
            const y = v * height;

            target.set(x,y,0);
        },widthSegments,heightSegments
    );

    return geometry;
}

function buildRectangulePiramid(width,depth,height,widthSegments,heightSegments){
    const face1=buildTrianguleRectangule(width,height,widthSegments,heightSegments);
    const face2=buildPlane(Math.sqrt(width*width+height*height),depth,widthSegments,heightSegments);
    const face3=buildTrianguleRectangule(width,height,widthSegments,heightSegments);

    face2.rotateZ(-Math.atan2(height,width));

    face1.translate(0,-height/2,depth/2);
    face2.translate(width/2,0,0);
    face3.translate(0,-height/2,-depth/2);

    return BufferGeometryUtils.mergeGeometries(
                [face1,face2,face3],
                false
            );
}

function buildSemiBox(width,depth,height,widthSegments,heightSegments){
    const face1=buildPlane(width,height,widthSegments,heightSegments);
    const face2=buildPlane(depth,height,widthSegments,heightSegments);
    const face3=buildPlane(width,height,widthSegments,heightSegments);

    face1.rotateX(-Math.PI/2);
    face2.rotateX(-Math.PI/2);
    face3.rotateX(-Math.PI/2);
    
    face2.rotateY(-Math.PI/2);

    face1.translate(0,0,depth/2);
    face2.translate(depth/2,0,0);
    face3.translate(0,0,-depth/2);

    return BufferGeometryUtils.mergeGeometries(
                [face1,face2,face3],
                false
            );
}

//-------------------
//  BUILD COLUMNS
//-------------------

export function buildColumns(Segments){
    //tendra cierta forma octagonal en los bordes
    //tendra cierta forma octagonal en los bordes
    const total_height = measures.TOTAL_HEIGHT;
    const side_length = measures.COLUMNS_SIDE;
    const pylon_length = measures.COLUMNS_PILON_LENGTH;
    const pylon_height = measures.COLUMNS_PILON_HEIGTH;
    const proportion_pylon_height = measures.COLUMNS_PROPORTION_PILON_HEIGTH;

    //utilizo cantidad de segmentos proporcionales al tamaño
    const totalArea = total_height * side_length * 3 +  pylon_height * pylon_length * 2;
    const segmentsPerUnit = Math.sqrt(Segments / totalArea);
    
    const widthSegments = Math.max(1, Math.round(side_length * segmentsPerUnit));
    const heightSegments = Math.max(1, Math.round(total_height * segmentsPerUnit));
    const depthSegments = Math.max(1, Math.round((side_length+pylon_length) * segmentsPerUnit));

    //BASE
    const base_geometry = buildRectangulePiramid(pylon_length,side_length,pylon_height,widthSegments,depthSegments);
    const material_base = new THREE.MeshStandardMaterial({
        map: texture_uv.columnaBase,
        side: THREE.DoubleSide});
    const base = new THREE.Mesh(base_geometry,material_base);

    //SECOND BASE
    const second_base_geometry = buildRectangulePiramid(pylon_length/2,side_length-0.1,proportion_pylon_height*pylon_height,widthSegments,depthSegments);
    const material_second_base = new THREE.MeshStandardMaterial({
        map: texture_uv.columnaBase,
        side: THREE.DoubleSide});
    const second_base = new THREE.Mesh(second_base_geometry,material_second_base);
    //PILAR
    const pilar_geometry = buildSemiBox(side_length+0.1,side_length+0.1,total_height,widthSegments,heightSegments);
    const material_pilar = new THREE.MeshStandardMaterial({
        map: texture_uv.columnaCuerpo,
        side: THREE.DoubleSide});
    const pilar = new THREE.Mesh(pilar_geometry,material_pilar);

    //LiGTH
    const ligth_geometry = buildPlane(side_length/4,side_length/2,1,1);
    const material_ligth = new THREE.MeshStandardMaterial({
        map: texture_uv.luzIndividual,
        side: THREE.DoubleSide,
        emissiveMap: texture_uv.luzIndividual,
        emissive: 0xffffff,
        emissiveIntensity:6,
    })

    const light = new THREE.Mesh(ligth_geometry,material_ligth);
    light.rotateZ(-Math.PI/2);
    light.rotateY(-Math.PI/2);
    light.translateY((side_length/2 + 0.1));
    
    
    
    
    //GROUPING
    const column = new THREE.Group();
    
    column.add(base);
    column.add(pilar);
    column.add(second_base);

    base.translateY(-(total_height-pylon_height)/2);
    second_base.translateY(-(total_height-pylon_height*proportion_pylon_height)/2);

    //CLONES
    const base_clone = base.clone();
    const second_base_clone = second_base.clone();
        
    column.add(second_base_clone);
    column.add(base_clone);
    
    
    //ligths
    for (let i = 0; i < 2; i++){
        const newLigth = light.clone();

        newLigth.position.y = -measures.TOTAL_HEIGHT/4
                             + (i + 1) * measures.TOTAL_HEIGHT/6;

        column.add(newLigth);
    }
    
    base_clone.scale.y=-1
    second_base_clone.scale.y = -1;
    base_clone.translateY((total_height-pylon_height));
    second_base_clone.translateY((total_height-pylon_height*proportion_pylon_height));

    column.translateX(-(measures.TOTAL_WIDTH-side_length)/2);

    return column;
}