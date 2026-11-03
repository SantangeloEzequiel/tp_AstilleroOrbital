import * as THREE from 'three';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import * as atlas_uv from './atlas_uv.js'


const SCALE = 0.01;

const HEIGHT= 310 * SCALE;
const WIDTH = 200 * SCALE;
export const DEPTH = 50  * SCALE;

export const FRAME_DIAMETER = 8 * SCALE; //El diametro del borde del ala

const PYLONS_HEIGHT = 100 * SCALE;
const PYLONS_WIDTH = 80 * SCALE;



//********************* */
//      BODY
//******************* */ 

function buildHexagonalCurve(height,width,depth,heightSegments,widthSegments){

    //banana
    const catmull_curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-depth / 2, -height / 2, 0),
        new THREE.Vector3( depth / 2, 0, 0),
        new THREE.Vector3(-depth / 2, height / 2, 0)]);
    
    //
    const hexagonalCurve = new ParametricGeometry (
        function(u,v,target){
            const point = catmull_curve.getPoint(v);

            const x = point.x;
            const y = point.y;
            const z = width * (0.5-u);

            target.set(x,y,z);
        },
        heightSegments,widthSegments
    )

    return hexagonalCurve;
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
//      BORDERS
//******************* */ 

//superficies de revolucion de tubos, que estaran conectados en forma de curva
function getParametricCurveCilinders(curve,radius){
    return function (u, v, target){
        let phi = 2 * Math.PI * u;
        const point   = curve.getPoint(v);
        const tangent = curve.getTangent(v).normalize();
        const normal  =   new THREE.Vector3(tangent.y , -tangent.x, tangent.z);
        
        
        //omito los 0
        if(normal.x + normal.y + normal.z == 1){
            normal.set(1,0,0);
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
    };
}

function buildHexagonCurveBorders(height,width,depth,diameter,u_number,v_number){

    const catmull_curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-depth / 2, -(height+diameter/2) / 2, 0),
        new THREE.Vector3( depth / 2, 0, 0),
        new THREE.Vector3(-depth / 2, (height+diameter/2) / 2, 0)]);

    
    const rectLine = new THREE.LineCurve3(
        new THREE.Vector3(-depth / 2, height / 2, -(width+diameter/2)/2),
        new THREE.Vector3(-depth / 2, height / 2, (width+diameter/2)/2));
   
    const radius = diameter / 2;


    //uso superficies de barrido para los tubos
    const curve1 = new ParametricGeometry (
        getParametricCurveCilinders(catmull_curve,radius)
        ,u_number/4,v_number/4);
    curve1.translate(0,0,width/2);

    const curve2 = new ParametricGeometry (
        getParametricCurveCilinders(catmull_curve,radius)
        ,u_number/4,v_number/4);
    curve2.translate(0,0,-width/2);

    const line1 = new ParametricGeometry (
        getParametricCurveCilinders(rectLine,radius)
        ,u_number/4,v_number/4);
    

    const line2 = new ParametricGeometry (
        getParametricCurveCilinders(rectLine,radius)
        ,u_number/4,v_number/4);
    line2.translate(0,-HEIGHT,0)
    
    return BufferGeometryUtils.mergeGeometries(
        [curve1, curve2, line1, line2],
        false
    );
}


//********************* */
// COMPLETE WING
//******************* */ 

export function createTieWings(){

    //wing body
    const hexagonal_curve = buildHexagonalCurve(HEIGHT,WIDTH,DEPTH,60,60);
    
    const material_hexagonal_curve = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        map: atlas_uv.alaDerPanelesNegros
    });

    const wing_body = new THREE.Mesh(hexagonal_curve, material_hexagonal_curve);

    //wing_border
    const hexagon_curve_border = buildHexagonCurveBorders(HEIGHT,WIDTH,DEPTH,FRAME_DIAMETER,60,60);
    
    const material_hexagonal_curve_border = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        map: atlas_uv.tiraVertical
    });

    const wing_boder = new THREE.Mesh(hexagon_curve_border, material_hexagonal_curve_border);

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

    
    wing.add(wing_boder);
    
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