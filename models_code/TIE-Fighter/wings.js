import * as THREE from 'three';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import * as atlas_uv from './atlas_uv.js'




//Medidas
const SCALE = 0.01;
const HEIGHT= 310 * SCALE;
const WIDTH= 270 * SCALE;
const SIDE_LENGTH = 170 *SCALE;
const FRAME_DIAMETER = 8 * SCALE; //El diametro del borde de tubo del hexagono
const PYLONS_HEIGHT = 100 * SCALE;
const PYLONS_DEPTH = 80 * SCALE;
const PYLON_BODY_DEPTH = 20 * SCALE;



//********************* */
//      HEXAGONO
//******************* */ 

//plano hexagonal que sirve de ala
function buildHexagon(widthSegments, heightSegments,width,height,side_length){
    

    const geometry = new THREE.BufferGeometry;
    const position = [];
    const uv = [];
    //Creo el array de posiciones

    //se agranda
    for (let y= 0; y< heightSegments/2; y++){
        const actual_row = side_length + (y/ (heightSegments/2))  * (width - side_length);
        for (let x=0; x<= widthSegments; x++){
            let position_width = -actual_row/2 + x * actual_row/widthSegments;
            let position_height = height /2 -y * height/heightSegments;
            position.push(position_width, position_height,0);
            
            //uv
            const u = (position_width + width / 2) / width;
            const v = (position_height + height / 2) / height;        
            uv.push(u, v);
        }
    } 
    
    //se achica
    for (let y= heightSegments* 1/2; y<= heightSegments; y++){
        const actual_row = width-(((y-heightSegments/2)) / (heightSegments/2))  * (width - side_length);
        for (let x=0; x<= widthSegments; x++){
            let position_width = -actual_row/2 + x * actual_row/widthSegments;
            let position_height = height /2 -y * height/heightSegments;
            position.push(position_width, position_height,0);
            
            //uv
            const u = (position_width + width / 2) / width;
            const v = (position_height + height / 2) / height;        
            uv.push(u, v);
        }
    }

    const indices = [];
    //Creo el array de indices
    for (let y= 0; y< heightSegments; y++){
        for (let x=0; x< widthSegments; x++){
            indices.push(y*(widthSegments+1)+x);
            indices.push(y*(widthSegments+1)+x+widthSegments+1);
            indices.push(y*(widthSegments+1)+x+1);
            

            
            indices.push(y*(widthSegments+1)+x+widthSegments+1);
            indices.push(y*(widthSegments+1)+x+widthSegments+2);
            indices.push(y*(widthSegments+1)+x+1);
        }
    }
    
    //const uv[];
    //array de uv ...


    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position),3));
    geometry.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(uv),2));
    geometry.setIndex(indices);

    return geometry;
}

//********************* */
// BORDES DEL HEXAGONO
//******************* */ 

//superficies de revolucion de tubos, que estaran conectados en forma de hexagono
function getParametricHexagonCilinders(vertices_x,vertices_y,radius){
    return function (u, v, target){
        let phi = 2 * Math.PI * u;
        let side = Math.floor(6*v);
        if(side == 6) side = 5;
        
        const x0 = vertices_x[side];
        const x1 = vertices_x[side+1];
        
        const y0 = vertices_y[side];
        const y1 = vertices_y[side+1];

        const local_v = v * 6 - side;

        const dx = (x1-x0);
        const dy = (y1-y0);
        const length = (Math.sqrt(dx*dx+dy*dy));

        const extra = 0.001; //esto lo pongo para que se solapen y queden bien los vertices
        
        const center_x = x0 + (2* extra * (dx / length) +dx) * local_v - extra * (dx / length);
        const center_y = y0 + (2* extra * (dy / length) + dy) * local_v - extra * (dy / length);
        
        const nx= -dy / length;
        const ny= dx / length;
        
        const x = center_x + nx * Math.sin(phi) * radius;
        const y = center_y + ny * Math.sin(phi) * radius;
        const z = radius * Math.cos(phi) * 2; //EL espesor es el del diametro, por eso el *2
        
        target.set(x,y,z);
    };
}

function buildHexagonBorders(height,width,side_length,diameter,u_number,v_number){
//defino vertices en sentido horario empezando por arrriba, repito devuelta el primero en la ultima posicion para simplificar codigo
    const vertices_y = [
        height,
        height,
        height/2,
        0,
        0,
        height/2,
        height];
    const vertices_x = [
        width - (width-side_length) /2,
        (width-side_length) /2,
        0,
        (width-side_length)/2,
        width - (width-side_length) /2,
        width,
        width - (width-side_length) /2];

    const radius = diameter / 2;


    //uso superficies de barrido para los tubos
    const geometry = new ParametricGeometry (
        getParametricHexagonCilinders(vertices_x,vertices_y,radius)
        ,u_number,v_number);
    return geometry;
}

//********************* */
// TRIANGULOS QUE SALEN DEL CENTRO
//******************* */ 

function getParametricStarArm(x0,y0,center_star_x,center_star_y, radius){
    //cada brazo de la estrella crece en forma de triangulo hacia el centro
    return function (u, v, target) {
        const phi= 2 * Math.PI * u;
        const dx = (center_star_x-x0);
        const dy = (center_star_y-y0);
        const length = (Math.sqrt(dx*dx+dy*dy));

        const extra = 0.001; //esto lo pongo para que se solapen y queden bien los vertices
        
        const center_x = x0 + (2* extra * (dx / length) +dx) * v - extra * (dx / length);
        const center_y = y0 + (2* extra * (dy / length) + dy) * v - extra * (dy / length);
        
        const nx= -dy / length;
        const ny= dx / length;
        
        const grow = radius * (0.5+ v * 3);
        const x = center_x + nx * Math.sin(phi)  * grow;
        const y = center_y + ny * Math.sin(phi)  * grow;
        const z = radius * Math.cos(phi) * 2 + radius * Math.sin(phi) * 3 *v; //EL espesor es el del diametro, por eso el *2
        
        target.set(x,y,z);
    };
}

function buildTriangulesToHexagonVertex(height,width,side_length,diameter,u_number,v_number){

    //defino vertices en sentido horario empezando por arrriba

    const vertices_y = [
        height,
        height,
        height/2,
        0,
        0,
        height/2];

    const vertices_x = [
        width - (width-side_length) /2,
        (width-side_length) /2,
        0,
        (width-side_length)/2,
        width - (width-side_length) /2,
        width];

    

    const center_star_x = width/2;
    const center_star_y = height/2;
    const radius = diameter/2;

    const star= [];
    
    for (let side = 0; side<6; side++){
    //uso superficies de barrido para los tubos
        const arm = new ParametricGeometry (
            getParametricStarArm(vertices_x[side],vertices_y[side],center_star_x,center_star_y, radius)
            ,u_number/6,v_number/6);
        star.push(arm);
    }
     return BufferGeometryUtils.mergeGeometries(
        star,
        false
    );
}


//********************* */
// PYLONS
//******************* */ 
//parte del centro que se une con los bordes y se ancla al fuselaje

//EL cuerpo principal es un hexagono piramidal doble

function buildHexagonalFrustumBorders(vertices_x,vertices_y,depth){
    return function(u,v,target){
        let side = Math.floor(6*v);
        if(side == 6) side = 5;
        
        const x0 = vertices_x[side];
        const x1 = vertices_x[side+1];
        
        const y0 = vertices_y[side];
        const y1 = vertices_y[side+1];

        const local_v = v * 6 - side;

        const dx = (x1-x0);
        const dy = (y1-y0);
        
        const x = x0 + dx * local_v ;
        const y = y0 + dy * local_v ; 
        const z = depth * u;
        
        target.set(x,y,z);
    }
}

function buildHexagonalDoubleFrustum(widthSegments,heightSegments,side_length,depth){
    //defino vertices en sentido horario empezando por arrriba, repito devuelta el primero en la ultima posicion para simplificar codigo
    const height = side_length * Math.sqrt(3);
    const width = height;

    const vertices_y = [
        height,
        height,
        height/2,
        0,
        0,
        height/2,
        height];
    const vertices_x = [
        width - (width-side_length) /2,
        (width-side_length) /2,
        0,
        (width-side_length)/2,
        width - (width-side_length) /2,
        width,
        width - (width-side_length) /2];

    const hexagon_front = buildHexagon(widthSegments/3,heightSegments/3,width,height,side_length);

    const hexagonal_frustum_borders = new ParametricGeometry(
        buildHexagonalFrustumBorders(vertices_x,vertices_y,depth),widthSegments/3,heightSegments/3
    );

    const hexagon_back = buildHexagon(widthSegments/3,heightSegments/3,width,height,side_length);
    

    //POSITION CORRECTION
    hexagonal_frustum_borders.translate(-height/2,-width/2,0);
    hexagon_back.translate(0,0,depth);

    //AGREGO ESTO PROVISIONALMENTE PARA COMPATIBILIDAD EN MERGEGEOMETRIES
    hexagon_front.computeVertexNormals();
    hexagon_back.computeVertexNormals();
    //addDummyUVs(hexagon_front);
    //addDummyUVs(hexagon_back);

    return BufferGeometryUtils.mergeGeometries([
        hexagon_back,
        hexagon_front,
        hexagonal_frustum_borders],
        false
    );
}

function buildHexagonalFrustumCenterTriangules(vertices_x,vertices_y,depth){
    
    
    const centerX =
        vertices_x.slice(0, 6).reduce((sum, x) => sum + x, 0) / 6;

    const centerY =
        vertices_y.slice(0, 6).reduce((sum, y) => sum + y, 0) / 6;

    const hexagonalTriangules = [];

    const uv = new Float32Array([
        0, 0,
        1, 0,
        0.5, 1
    ]);

    for (let side = 0; side<6; side++){
    //Creo el triangulo con 3 vertices
        const triangule = new THREE.BufferGeometry;
        const vertices = new Float32Array([
            vertices_x[side], vertices_y[side], 0,
            vertices_x[side+1], vertices_y[side+1], 0,
            (centerX), (centerY), depth]);

        triangule.setAttribute('position',new THREE.BufferAttribute(vertices, 3));
        triangule.setAttribute('uv',new THREE.BufferAttribute(uv, 2));
        
        triangule.setIndex([0, 1, 2]);
        triangule.computeVertexNormals();

        hexagonalTriangules.push(triangule)
    }

     return BufferGeometryUtils.mergeGeometries(
        hexagonalTriangules,
        false
    );
}

function buildHexagonalConector(widthSegments,heightSegments,side_length, depth,diameter){
    
    const height = side_length * Math.sqrt(3);
    const width = height;

    const vertices_y = [
        height,
        height,
        height/2,
        0,
        0,
        height/2,
        height];
    const vertices_x = [
        width - (width-side_length) /2,
        (width-side_length) /2,
        0,
        (width-side_length)/2,
        width - (width-side_length) /2,
        width,
        width - (width-side_length) /2];

    const hexagonal_frustum_borders = new ParametricGeometry(
        buildHexagonalFrustumBorders(vertices_x,vertices_y,depth/4),widthSegments/3,heightSegments/3
    );

    const hexagonal_frustum_center_triangules = buildHexagonalFrustumCenterTriangules(vertices_x,vertices_y,depth/4);

    hexagonal_frustum_center_triangules.translate(0,0,depth/4);
    
    return BufferGeometryUtils.mergeGeometries(
        [hexagonal_frustum_borders, hexagonal_frustum_center_triangules],
        false
    );
}

function buildPylons(widthSegments,heightSegments,side_length,depth,diameter){
    
    const height = side_length * Math.sqrt(3);
    const width = height;
    
    const hexagonal_frustum = buildHexagonalDoubleFrustum(widthSegments,heightSegments,side_length,diameter);
    const conector = buildHexagonalConector(widthSegments,heightSegments,side_length,depth);
    
    conector.translate(-width / 2, -height / 2, 0);
    hexagonal_frustum.translate(0,0,-diameter / 2);


    const pylon = BufferGeometryUtils.mergeGeometries(
        [hexagonal_frustum,conector],
        false
    );
    
    return pylon;
}

//********************* */
// COMPLETE WING
//******************* */ 

export function createTieWings(){

    //wing_hexagon
    const hexagon = buildHexagon(20,60,WIDTH,HEIGHT,SIDE_LENGTH);
    const material_hexagon = new THREE.MeshBasicMaterial({ 
        side: THREE.DoubleSide,
        map: atlas_uv.alaDerPanelesNegros});
    const wing_hexagon = new THREE.Mesh(hexagon, material_hexagon);

    //wing_hexagon_border
    const hexagon_border = buildHexagonBorders(HEIGHT,WIDTH,SIDE_LENGTH,FRAME_DIAMETER,20,120);
    const material_border = new THREE.MeshBasicMaterial({ 
        side: THREE.DoubleSide,
        map: atlas_uv.tiraVertical});
    const wing_hexagon_border = new THREE.Mesh(hexagon_border, material_border);
    
    //wing_triangules
    const triangules = buildTriangulesToHexagonVertex(HEIGHT,WIDTH,SIDE_LENGTH,FRAME_DIAMETER,60,120);
    const material_triangules = new THREE.MeshBasicMaterial({ 
        side: THREE.DoubleSide,
        map: atlas_uv.tiraVertical});
    const wing_triangules = new THREE.Mesh(triangules, material_triangules);

    //wing_pylon
    const pylon = buildPylons(60,120,PYLONS_HEIGHT / Math.sqrt(3),PYLONS_DEPTH,PYLON_BODY_DEPTH);
    const material_pylon = new THREE.MeshBasicMaterial({ 
        side: THREE.DoubleSide,
        map: atlas_uv.tiraVertical});
    const wing_pylon = new THREE.Mesh(pylon, material_pylon);
    
    //GROUPING
    const wing = new THREE.Group;

    wing.add(wing_hexagon);

    wing.add(wing_hexagon_border);
    wing_hexagon_border.translateX(-WIDTH/2);
    wing_hexagon_border.translateY(-HEIGHT/2);

    wing.add(wing_triangules);
    wing_triangules.translateX(-WIDTH/2);
    wing_triangules.translateY(-HEIGHT/2);

    wing.add(wing_pylon);
 //   wing_pylon.translateZ(-FRAME_DIAMETER/2);

    return wing;
}