import { ParametricGeometry } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';



export function buildGrua(){
    const GRUA = new THREE.Group();
    const first_axis = new THREE.Group();
    const second_axis = new THREE.Group();
    const third_axis = new THREE.Group();

    //MEDIDAS
    const espesor = 0.1;
    const eslabon_side_length = 0.5;
    const joint_height = 0.2;

    //BASE
    const base_radius=1, base_heigth=1;
    const base_geometry = buildCilinder(base_radius,base_heigth,60,60);
    const base_material = new THREE.MeshBasicMaterial({color: 0x991111, side: THREE.DoubleSide});
    const base = new THREE.Mesh(base_geometry,base_material);

    //FIRST ESLABON
    const firstEslabon_height= 3;
    const firstEslabon = buildEslabon(firstEslabon_height,eslabon_side_length,espesor,joint_height,60,60);
    
    //SECOND ESLABON
    const secondEslabon_height= 2.1;
    const secondEslabon = buildEslabon(secondEslabon_height,eslabon_side_length,espesor,joint_height,60,60);
    secondEslabon.children.at(-1).rotateY(THREE.MathUtils.degToRad(90));

    //third ESLABON
    const thirdEslabon_height= 1;
    const thirdEslabon = buildEslabon(thirdEslabon_height,eslabon_side_length,espesor,joint_height,60,60);
    thirdEslabon.children.at(0).rotateY(THREE.MathUtils.degToRad(90));

    //WRIST 
    const wrist_radius=0.4, wrist_heigth=0.1;
    const wrist_geometry = buildCilinder(wrist_radius,wrist_heigth,60,60);
    const wrist_material = new THREE.MeshBasicMaterial({color: 0x991111, side: THREE.DoubleSide});
    const wrist = new THREE.Mesh(wrist_geometry,wrist_material);
    
    //HAND
    const hand = buildHand(1,0.1,160,160);

    //GROUPING

    GRUA.add(base);
    
    base.add(first_axis);
    first_axis.translateY(base_heigth/2 + joint_height*2);

    first_axis.add(firstEslabon);
    firstEslabon.add(second_axis);
    second_axis.translateY(firstEslabon_height);

    second_axis.add(secondEslabon);
    secondEslabon.add(third_axis);
    third_axis.translateY(secondEslabon_height);

    third_axis.add(thirdEslabon);
    thirdEslabon.add(wrist);
    wrist.translateY(thirdEslabon_height+wrist_heigth/2);

    wrist.add(hand);
    hand.translateY(wrist_heigth/2);
    
    first_axis.name = "first_axis";
    second_axis.name = "second_axis";
    third_axis.name = "third_axis";
    wrist.name = "wrist";
    hand.name = "hand";
    return GRUA;
}
// BUILD ESLABON
function buildEslabon(height, width, espesor, joint_height, heightSegments, widthSegments) {
    const eslabon = new THREE.Group();

    const jointMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        side: THREE.DoubleSide
    });

    const armMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        side: THREE.DoubleSide
    });

    // Altura del brazo central
    const arm_height = height - 2 * joint_height;

    // First joint
    const first_joint_geometry = buildJoint(joint_height, width, espesor, width/2- 2* espesor ,heightSegments / 8, widthSegments / 8);
    const first_joint = new THREE.Mesh(first_joint_geometry, jointMaterial);

    // Arm
    const arm_geometry = buildBox(width, arm_height, width,widthSegments, heightSegments, widthSegments);
    const arm = new THREE.Mesh(arm_geometry, armMaterial);

    // Last joint
    const last_joint_geometry = buildJoint(joint_height, width, espesor, width/2 ,heightSegments / 8, widthSegments / 8);
    const last_joint = new THREE.Mesh(last_joint_geometry, jointMaterial);

    // Posiciones
    first_joint.position.y = joint_height / 2;

    arm.position.y = joint_height + arm_height / 2;

    last_joint.position.y = height - joint_height / 2;

    // Grouping
    eslabon.add(first_joint);
    eslabon.add(arm);
    eslabon.add(last_joint);


    eslabon.translateY(-joint_height);
    return eslabon;
}

//build joint;
function buildJoint(height,width,espesor,separation,heightSegments,widthSegments){
    const face1 = buildBox(width,height,espesor,Math.round(heightSegments/2),Math.round(widthSegments/2));
    const face2 = buildBox(width,height,espesor,Math.round(heightSegments/2),Math.round(widthSegments/2));

    face1.translate(0,0,separation/2);
    face2.translate(0,0,-separation/2);

    return BufferGeometryUtils.mergeGeometries(
        [face1, face2],
        false
    );
}




//---------------
//    UTILS
//---------------

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


function buildBoxWithoutRoof(width, height, depth, widthSegments, heightSegments, depthSegments) {

    const face1 = buildPlane(width, height, widthSegments, heightSegments);
    const face2 = buildPlane(depth, height, depthSegments, heightSegments);
    const face3 = buildPlane(width, height, widthSegments, heightSegments);
    const face4 = buildPlane(depth, height, depthSegments, heightSegments);
    //const face5 = buildPlane(width, depth, widthSegments, depthSegments);
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
    //face5.rotateX(Math.PI);

    // Traslaciones
    face1.translate(0, 0, depth / 2);
    face2.translate(width / 2, 0, 0);
    face3.translate(0, 0, -depth / 2);
    face4.translate(-width / 2, 0, 0);
    //face5.translate(0, height / 2, 0);
    face6.translate(0, -height / 2, 0);

    return BufferGeometryUtils.mergeGeometries(
        [face1, face2, face3, face4, face6],
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


function buildCircle(radius,radialSegments,heightSegments){
    return new ParametricGeometry(
        function(u,v,target){
            const phi = Math.PI * 2 * u;
            const thita = Math.PI * v;

            const x = Math.cos(phi) * radius * v;
            const z = Math.sin(phi) * radius * v;
            target.set(x,0,z);
        },radialSegments,heightSegments);
}



function buildCilinder(radius,height,radialSegments,heightSegments){
    const borde = new ParametricGeometry(
        function(u,v,target){
            const phi = Math.PI * 2 * u;
            const thita = Math.PI * v;

            const x = Math.cos(phi) * radius;
            const y = (v-0.5) * height; 
            const z = Math.sin(phi) * radius;
            target.set(x,y,z);
        },Math.round(radialSegments/2),Math.round(heightSegments/2));


        const faceTop = buildCircle(radius,Math.round(radialSegments/4),Math.round(heightSegments/4));
        const faceBottom = buildCircle(radius,Math.round(radialSegments/4),Math.round(heightSegments/4));

        faceTop.translate(0,height/2,0);
        faceBottom.translate(0,-height/2,0);

        return BufferGeometryUtils.mergeGeometries(
        [faceTop, faceBottom, borde],
        false
    );
}

//-----------
//  HAND
//-----------

function buildHand(length, espesor, lengthSegments, espesorSegments) {

    const hand = new THREE.Group();

    const material = new THREE.MeshStandardMaterial({
        color: 0x888888,
        side: THREE.DoubleSide
    });

    const segmentLength = length / 2;
    const width = espesor * 2;

    const fingers = [];

    // Inclinación fija de las puntas
    const bendAngle = Math.PI / 3; // 60 grados

    for (const side of [-1, 1]) {

        const finger = new THREE.Group();

        // PRIMER TRAMO
        const first_geometry = buildBox( width,segmentLength, espesor, espesorSegments, lengthSegments, espesorSegments);

        const first = new THREE.Mesh(first_geometry, material);
        first.position.y = segmentLength / 2;

        finger.add(first);

        // SEGUNDO TRAMO
        const second_geometry = buildBox( width, segmentLength, espesor, espesorSegments, lengthSegments, espesorSegments);

        const second = new THREE.Mesh(second_geometry, material);

        const joint = new THREE.Group();
        joint.position.y = segmentLength;

        second.position.y = segmentLength / 2;
        joint.add(second);

        // Las puntas siempre apuntan hacia adentro
        joint.rotation.z = side * bendAngle;

        finger.add(joint);
        hand.add(finger);

        fingers.push(finger);
    }

    // Apertura inicial
    hand.apertura = THREE.MathUtils.degToRad(30);

    // Control de apertura por incremento
    hand.setApertura = function(angulo) {

        hand.apertura = THREE.MathUtils.clamp(
            hand.apertura + angulo,
            0,
            Math.PI / 3
        );

        const a = hand.apertura;

        fingers[0].rotation.z = a;
        fingers[1].rotation.z = -a;
    };

    // Aplicar apertura inicial
    hand.setApertura(0);

    return hand;
}