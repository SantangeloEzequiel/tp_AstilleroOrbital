import * as THREE from 'three';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import * as atlas_uv from './atlas_uv.js'


const SCALE = 0.01;

const HEIGHT= 310 * SCALE;
const WIDTH = 280 * SCALE;
export const DEPTH = 50  * SCALE;

export const FRAME_DIAMETER = 8 * SCALE; //El diametro del borde del ala

const PYLONS_HEIGHT = 100 * SCALE;
const PYLONS_WIDTH = 80 * SCALE;



//********************* */
//      BODY
//******************* */ 

function buildTrianguleRectanguleGeometry(height,width,heightSegments,widthSegments){ 
        const geometry = new THREE.BufferGeometry;
        const position = [];
        const uv = [];

        //Creo el array de posiciones
        for (let y= 0; y<= heightSegments; y++){
            for (let x=0; x<= widthSegments; x++){
                
                let current_width = width *(1- y/heightSegments);

                let position_width = x * (current_width/widthSegments);
                let position_height = y * (height/heightSegments);
                position.push(position_width, position_height,0);
                
                // uv
                uv.push(x/widthSegments, y/heightSegments);
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

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position),3));
        geometry.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(uv),2));
        geometry.setIndex(indices);
    
        return geometry;
}


function buildRectanguleGeometry(height,width,heightSegments,widthSegments){
        const geometry = new THREE.BufferGeometry;
        const position = [];
        const uv = [];

        //Creo el array de posiciones
        for (let y= 0; y<= heightSegments; y++){
            for (let x=0; x<= widthSegments; x++){
                
                let position_width = x * (width/widthSegments);
                let position_height = y * (height/heightSegments);
                position.push(position_width, position_height,0);
                
                // uv
                uv.push(x/widthSegments, y/heightSegments);
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

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position),3));
        geometry.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(uv),2));
        geometry.setIndex(indices);
    
        return geometry;
}


function buildBodyGeometry(height,width,angle,heightSegments,widthSegments){
    const square = buildRectanguleGeometry(height/3, height/3, heightSegments/5, widthSegments/5);
    const rectangule1 = buildRectanguleGeometry(height/3, height/3, heightSegments/5, widthSegments/5);
    const rectangule2 = buildRectanguleGeometry(height/3, height/3, heightSegments/5, widthSegments/5);
    const triangule1 = buildTrianguleRectanguleGeometry(height/3, width-height/3, heightSegments/5, widthSegments/5);
    const triangule2 = buildTrianguleRectanguleGeometry(height/3, width-height/3, heightSegments/5, widthSegments/5);

    rectangule1.rotateX(angle);
    rectangule2.rotateX(-angle);
    triangule1.rotateX(angle);
    triangule2.rotateX(-angle);

    triangule2.rotateX(Math.PI);

    const factor_y = Math.sin(angle);
    const factor_x = Math.cos(angle);

    rectangule1.translate(0, height/3, 0);
    rectangule2.translate(0, -(height/3)*factor_x, (height/3)*factor_y);

    triangule1.translate(height/3, height/3, 0);
    triangule2.translate(height/3, 0, 0);

    return BufferGeometryUtils.mergeGeometries(
        [square, rectangule1, rectangule2, triangule1, triangule2],
        false
    );
}


//********************* */
//      BORDERS
//******************* */ 

function getParametricCilinder(A,B,radius,radialSegments,lengthSegments){
    
    //Primero extiendo la linea por el radio en A y B para que se solapen con el resto
    const direction = new THREE.Vector3()
        .subVectors(B, A)
        .normalize();

    const newA = A.clone().sub(direction.clone().multiplyScalar(radius/2));
    const newB = B.clone().add(direction.clone().multiplyScalar(radius/2));

    const line = new THREE.LineCurve3(newA, newB);
    //con eso calculo la parametrizacion
    return new ParametricGeometry(
     function (u, v, target){
            let phi = 2 * Math.PI * u;

            const point   = line.getPoint(v);
            const tangent = line.getTangent(v).normalize();
            
            //evito normales nulas (cuando la tangente tiene direccion del eje)
            let normal = new THREE.Vector3(tangent.y * tangent.z , - 2 * tangent.x * tangent.z, tangent.x * tangent.y).normalize();
            if(normal.lengthSq() === 0){
                if(Math.abs(tangent.x) == 1)
                    normal = new THREE.Vector3(0,1,0);
                if(Math.abs(tangent.y) == 1)
                    normal = new THREE.Vector3(0,0,1);
                if(Math.abs(tangent.z) == 1)
                    normal = new THREE.Vector3(1,0,0);
            }

            
            
            //producto vectorial
            const binormal = new THREE.Vector3(
                tangent.y * normal.z - tangent.z * normal.y,
                tangent.z * normal.x - tangent.x * normal.z,
                tangent.x * normal.y - tangent.y * normal.x
            ).normalize();
            
            const x = point.x + radius * Math.sin(phi) * normal.x + Math.cos(phi) * binormal.x * radius;
            const y = point.y + radius * Math.sin(phi) * normal.y + Math.cos(phi) * binormal.y * radius;
            const z = point.z + radius * Math.sin(phi) * normal.z + Math.cos(phi) * binormal.z * radius;
    
            target.set(x,y,z);
        },radialSegments,lengthSegments)
}

function getParametricCilinderPoligon(vertex,radius,radialSegments,lengthSegments){
    const cilinders = [];
    for (let i=0; i < vertex.length-1; i++){
        cilinders.push(getParametricCilinder(vertex[i],vertex[i+1],radius,radialSegments,lengthSegments));
    }
    cilinders.push(getParametricCilinder(vertex[vertex.length-1],vertex[0],radius,radialSegments,lengthSegments)); //cierro el poligono
    return BufferGeometryUtils.mergeGeometries(cilinders,false);
}

function buildBordersGeometry(height,width,angle,radius,radialSegments,lengthSegments){
    //Creo las formas
    const vertex_square =[];
    vertex_square.push(new THREE.Vector3(-(height / 3) / 2, (height / 3) / 2, 0));
    vertex_square.push(new THREE.Vector3( (height / 3) / 2, (height / 3) / 2, 0));
    vertex_square.push(new THREE.Vector3( (height / 3) / 2,-(height / 3) / 2, 0));
    vertex_square.push(new THREE.Vector3(-(height / 3) / 2,-(height / 3) / 2, 0));
    const square = getParametricCilinderPoligon(vertex_square,radius,radialSegments/5,lengthSegments/5);
    
    const rectangule1 = getParametricCilinderPoligon(vertex_square,radius,radialSegments/5,lengthSegments/5);
    const rectangule2 = getParametricCilinderPoligon(vertex_square,radius,radialSegments/5,lengthSegments/5);

    const vertex_triangule =[];
    vertex_triangule.push(new THREE.Vector3(-(height/3)/2,-(height/3)/2,0));
    vertex_triangule.push(new THREE.Vector3(-(width-height/3/2),-(height/3)/2,0));
    vertex_triangule.push(new THREE.Vector3(-(height/3)/2,(height/3)/2,0));
    
    const triangule1 = getParametricCilinderPoligon(vertex_triangule,radius,radialSegments/5,lengthSegments/5);
    const triangule2 = getParametricCilinderPoligon(vertex_triangule,radius,radialSegments/5,lengthSegments/5);
    
    //las acomodo
    rectangule1.rotateX(angle);
    rectangule2.rotateX(-angle);
    triangule1.rotateX(angle);
    triangule2.rotateX(-angle);

    triangule2.rotateX(Math.PI);

    const factor_y = Math.sin(angle);
    const factor_x = Math.cos(angle);

    rectangule1.translate(0,  (height/3)/2 * (1+factor_x), (height/3)/2 * factor_y);
    rectangule2.translate(0, -(height/3)/2 * (1+factor_x), (height/3)/2 * factor_y);

    triangule1.translate(0,(height/3)/2 * (1+factor_x), (height/3)/2 * (factor_y));
    triangule2.translate(0,-(height/3)/2 * (1+factor_x),(height/3)/2 * (factor_y));

    return BufferGeometryUtils.mergeGeometries(
        [square, rectangule1, rectangule2, triangule1, triangule2],
        false
    );
}

//********************* */
//      PYLON
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
// COMPLETE WING
//******************* */ 

export function createTieWings(){

    //wing body

    const body_geometry = buildBodyGeometry(HEIGHT,WIDTH,Math.PI/4,120,120);
    const material_body = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        map: atlas_uv.panelNegro
    });

    const wing_body = new THREE.Mesh(body_geometry, material_body);
    
    //wing_border
    const border_geometry = buildBordersGeometry(HEIGHT,WIDTH,Math.PI/4,FRAME_DIAMETER,120,120)
    const material_border = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        map: atlas_uv.tiraVertical
    });

    const wing_border = new THREE.Mesh(border_geometry, material_border);

    // wing_pylon
    const pylonSideLength = PYLONS_WIDTH - PYLONS_HEIGHT / Math.sqrt(3) * 0.5;
    const hexagon_pylon = buildHexagon(20, 60,PYLONS_WIDTH,PYLONS_HEIGHT,pylonSideLength);
    const hexagon_pylon_border = buildHexagonBorders(PYLONS_HEIGHT,PYLONS_WIDTH,pylonSideLength,FRAME_DIAMETER,20,60);
 
    const material_pylon = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        map: atlas_uv.alaIzqHexagonoCentro
    });
    const material_pylon_border = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        map: atlas_uv.tiraVertical
    });

    const pylon = new THREE.Mesh(hexagon_pylon, material_pylon);
    const pylon_border = new THREE.Mesh(hexagon_pylon_border,material_pylon_border);
    
    //GROUPING
    const wing = new THREE.Group;

    wing.add(wing_body);
    wing_body.rotateY(-Math.PI/2)
    wing_body.rotateZ(Math.PI);
    
    wing_body.translateY(-PYLONS_HEIGHT/2);
    wing_body.translateX(-(HEIGHT/3)/2);
    wing_body.translateZ(- DEPTH /2);

    //border
    wing.add(wing_border);
    wing_border.rotateY(-Math.PI/2);
    wing_border.translateZ(- DEPTH /2);

    //Pylon
    pylon.rotateY(-Math.PI/2);
    pylon_border.rotateY(-Math.PI/2);
    wing.add(pylon);
    wing.add(pylon_border);

    pylon_border.translateX(-PYLONS_WIDTH/2);
    pylon_border.translateY(-PYLONS_HEIGHT/2);
    
    pylon_border.translateZ(FRAME_DIAMETER- DEPTH/2);
    pylon.translateZ(2 * FRAME_DIAMETER - DEPTH/2); 

    
    return wing;
}