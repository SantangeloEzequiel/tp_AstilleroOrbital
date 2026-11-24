import * as measures from './blueprints/measures.js';

import * as THREE from 'three';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import * as atlas_uv from './atlas_uv.js'
import * as atlas_uv_normal from './atlas_uv_normal.js'



//Medidas
const HEIGHT= measures.WINGS_HEIGHT;
const WIDTH= measures.WING1_WIDTH;
const SIDE_LENGTH = measures.WING1_SIDE_LENGTH;
const FRAME_DIAMETER = measures.WINGS_FRAME_DIAMETER; //El diametro del borde de tubo del hexagono
const PYLONS_HEIGHT = measures.WINGS_PYLONS_HEIGHT;
const PYLONS_WIDTH = measures.WINGS_PYLONS_WIDTH;



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

function getParametricHexagonCilinders(vertices_x,vertices_y,radius,depth=1){

    const normals = [];

    for(let i=0; i<6; i++){
        const dx = vertices_x[i+1] - vertices_x[i];
        const dy = vertices_y[i+1] - vertices_y[i];
        const length = Math.hypot(dx,dy);

        normals.push({
            x: -dy/length,
            y: dx/length
        });
    }

    const vertexNormals = [];

    for(let i=0; i<6; i++){
        const prev = normals[(i+5)%6];
        const next = normals[i];

        const nx = prev.x + next.x;
        const ny = prev.y + next.y;
        const length = Math.hypot(nx,ny);

        vertexNormals.push({
            x: nx/length,
            y: ny/length
        });
    }

    return function (u,v,target){
        const phi = 2 * Math.PI * u;
        const side = Math.min(5,Math.floor(6*v));
        const local_v = Math.min(1,v*6-side);

        const x0 = vertices_x[side];
        const x1 = vertices_x[side+1];
        const y0 = vertices_y[side];
        const y1 = vertices_y[side+1];

        const center_x = x0 + (x1-x0)*local_v;
        const center_y = y0 + (y1-y0)*local_v;

        const n0 = vertexNormals[side];
        const n1 = vertexNormals[(side+1)%6];

        let nx = n0.x*(1-local_v) + n1.x*local_v;
        let ny = n0.y*(1-local_v) + n1.y*local_v;

        const length = Math.hypot(nx,ny);
        nx /= length;
        ny /= length;

        const x = center_x + nx*Math.sin(phi)*radius;
        const y = center_y + ny*Math.sin(phi)*radius;
        const z = radius*Math.cos(phi) * depth;

        target.set(x,y,z);
    };
}


function buildHexagonBorders(height,width,side_length,diameter,u_number,v_number, depth = 1){
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
        getParametricHexagonCilinders(vertices_x,vertices_y,radius, depth)
        ,u_number,v_number);

    //UV PARA TEXTURA 
    
    // Calcular longitud de cada lado
    const lengths = [];
    let perimeter = 0;

    for (let i = 0; i < 6; i++) {
        const dx = vertices_x[i + 1] - vertices_x[i];
        const dy = vertices_y[i + 1] - vertices_y[i];

        const length = Math.hypot(dx, dy);
        lengths.push(length);
        perimeter += length;
    }

    // Modificar UV
    const uv = geometry.attributes.uv;

    for (let j = 0; j <= v_number; j++) {

        const v = j / v_number;
        const side = Math.min(5, Math.floor(v * 6));
        const localV = v * 6 - side;

        let distance = 0;

        for (let i = 0; i < side; i++) {
            distance += lengths[i];
        }

        distance += localV * lengths[side];

        const normalizedDistance = (distance / perimeter) * 3;

        for (let i = 0; i <= u_number; i++) {

            const index = j * (u_number + 1) + i;

            uv.setXY(
                index,
                normalizedDistance,
                i / u_number
            );
        }
    }

uv.needsUpdate = true;

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
        
        const grow = radius * (0.5 + v *3 ) *1.2;

        const x = center_x + nx * Math.sin(phi) * grow;
        const y = center_y + ny * Math.sin(phi) * grow;

        const z = Math.cos(phi) * grow / 1.2;
        
        target.set(x,y,z) ;
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
            ,u_number,v_number);
        star.push(arm);
          
        //UV
        const uv = arm.attributes.uv;

        for(let j=0; j<=v_number; j++){
            for(let i=0; i<=u_number; i++){
                const index = j*(u_number+1)+i;
            
                uv.setXY(index,j/v_number,i/u_number);
            }
        }

        uv.needsUpdate = true;
    }
     return BufferGeometryUtils.mergeGeometries(
        star,
        false
    );
}

//********************* */
// COMPLETE WING
//******************* */ 

export function createTieWings(){

    //wing_hexagon
    const hexagon = buildHexagon(1,2,WIDTH,HEIGHT,SIDE_LENGTH);
    const material_hexagon = new THREE.MeshBasicMaterial({ 
        side: THREE.DoubleSide,
        map: atlas_uv.PanelNegroGrande});
    const wing_hexagon = new THREE.Mesh(hexagon, material_hexagon);

    //wing_hexagon_border
    const hexagon_border = buildHexagonBorders(HEIGHT,WIDTH,SIDE_LENGTH,FRAME_DIAMETER,16,36);

   const material_border_base = new THREE.MeshBasicMaterial({
    color: 0x767982
    });

    const material_border = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        map: atlas_uv.borderSeccion,
        transparent: true,
        alphaTest: 0.01,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
        normalMap: atlas_uv_normal.borderSeccion,
        normalScale: new THREE.Vector2(0.1, 0.1),
        metalness: 0.5,
        roughness: 1,
    });

    const wing_hexagon_border = new THREE.Group();

    wing_hexagon_border.add(new THREE.Mesh(hexagon_border,material_border_base));
    wing_hexagon_border.add(new THREE.Mesh(hexagon_border,material_border));
    
    //wing_triangules
    const triangules = buildTriangulesToHexagonVertex(HEIGHT,WIDTH,SIDE_LENGTH,FRAME_DIAMETER,16,8);
    const wing_triangules = new THREE.Group();

    wing_triangules.add(new THREE.Mesh(triangules,material_border_base));
    wing_triangules.add(new THREE.Mesh(triangules,material_border));

    // wing_pylon
    const pylonSideLength = PYLONS_WIDTH - PYLONS_HEIGHT / Math.sqrt(3) * 0.5;
    const hexagon_pylon_front = buildHexagon(1, 2,PYLONS_WIDTH,PYLONS_HEIGHT,pylonSideLength);
    const hexagon_pylon_back = buildHexagon(1, 2,PYLONS_WIDTH,PYLONS_HEIGHT,pylonSideLength);
    const hexagon_pylon_border = buildHexagonBorders(PYLONS_HEIGHT,PYLONS_WIDTH,pylonSideLength,FRAME_DIAMETER,16,24,2.5);

    const material_pylon_front = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        map: atlas_uv.pylonExterior,
        normalMap: atlas_uv_normal.pylonExterior,
        normalScale: new THREE.Vector2(0.1, 0.1),
        metalness: 0.5,
        roughness: 1,
    });
    const material_pylon_back = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        map : atlas_uv.pylonInterior,
        normalMap: atlas_uv_normal.pylonInterior,
        normalScale: new THREE.Vector2(0.1, 0.1),
        metalness: 0.5,
        roughness: 1,
    });
    const material_pylon_border = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        map : atlas_uv.borderSeccion,
        normalMap: atlas_uv_normal.borderSeccion,
        normalScale: new THREE.Vector2(0.1, 0.1),
        metalness: 0.5,
        roughness: 1,
    });

    const pylon_front = new THREE.Mesh(hexagon_pylon_front, material_pylon_front);
    const pylon_back = new THREE.Mesh(hexagon_pylon_back, material_pylon_back);
    const pylon_border = new THREE.Mesh(hexagon_pylon_border,material_pylon_border);
    
    //GROUPING
    const wing = new THREE.Group;

    wing.add(wing_hexagon);

    wing.add(wing_hexagon_border);
    wing_hexagon_border.translateX(-WIDTH/2);
    wing_hexagon_border.translateY(-HEIGHT/2);

    wing.add(wing_triangules);
    wing_triangules.translateX(-WIDTH/2);
    wing_triangules.translateY(-HEIGHT/2);

    wing.add(pylon_front);
    wing.add(pylon_back);
    wing.add(pylon_border);

    pylon_border.translateX(-PYLONS_WIDTH/2);
    pylon_border.translateY(-PYLONS_HEIGHT/2);
    pylon_border.position.z = -FRAME_DIAMETER/4;
    
    pylon_front.position.z = -FRAME_DIAMETER* 1.5;
    pylon_back.position.z = FRAME_DIAMETER;
    
    wing.rotateY(-Math.PI/2);

    return wing;
}