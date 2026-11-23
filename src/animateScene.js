import { ParametricGeometry } from 'three/examples/jsm/Addons.js';
import * as HANGAR_measures from '../models_code/TIE-Fighter-Construction-Facility/blueprints/measures.js';
import * as TIE_measures from '../models_code/TIE-Fighter/blueprints/measures.js';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';


//Models hangar
import {buildStructure} from '../models_code/TIE-Fighter-Construction-Facility/structure.js';
import {buildColumns} from '../models_code/TIE-Fighter-Construction-Facility/columns.js';
import {buildRiels} from '../models_code/TIE-Fighter-Construction-Facility/riels.js';
import {buildRielsSupport} from '../models_code/TIE-Fighter-Construction-Facility/riels_suports.js';
//modelos tie
import { createTieWings as createTieWings_1 } from '../models_code/TIE-Fighter/wings_1.js';
import { createTieWings as createTieWings_2 } from '../models_code/TIE-Fighter/wings_2.js';
import { createTieWings as createTieWings_3 } from '../models_code/TIE-Fighter/wings_3.js';
import { createTieFuselage, DIAMETER_CENTER } from '../models_code/TIE-Fighter/fuselage.js';
import { createTieEngines as createTieEngines_1} from '../models_code/TIE-Fighter/engines_1.js';
import { createTieEngines as createTieEngines_2} from '../models_code/TIE-Fighter/engines_2.js';
import { createTieCockpit as createTieCockpit} from '../models_code/TIE-Fighter/cockpit.js';
//model grua
import { buildGrua } from './buildGrua.js';




export class AnimateScene {
    constructor(scene, cameras) {
        this.scene = scene;
        this.cameras = cameras;

        //timers
        this.elapsed_time=0;

        //BUILD PLATAFORM
        const plataform_fuselage = new THREE.Group();
        const side_length = 3.2;
        this.side_length = side_length;
        
        //DOOR
        const door_depth = side_length;
        const door_geometry = buildBox(door_depth,0.1,door_depth,100,100);
        const door_material = new THREE.MeshBasicMaterial({color: 0x111111, side: THREE.DoubleSide});
        const door = new THREE.Mesh(door_geometry,door_material);
        door.translateY(-0.1);

        //CONTAINER
        const container_geometry = buildBoxWithoutRoof(side_length,HANGAR_measures.TOTAL_HEIGHT/4,side_length,120,120);
        const container_material = new THREE.MeshBasicMaterial({color: 0x111177, side: THREE.DoubleSide});
        const container = new THREE.Mesh(container_geometry,container_material);
        container.translateY(-HANGAR_measures.TOTAL_HEIGHT/8);

        //PISTON
        const piston_geometry = buildBox(side_length/2,0.1,side_length/2,120,120);
        const piston_material = new THREE.MeshBasicMaterial({color: 0x441111, side: THREE.DoubleSide});
        const piston = new THREE.Mesh(piston_geometry,piston_material);
        piston.translateY(-(HANGAR_measures.TOTAL_HEIGHT/4 - 0.1));

        //WINGS
        this.wings = [];
        this.wings.push(model_createTieWing_1(side_length*2));
        this.wings.push(model_createTieWing_1(side_length*2));
        

        //FUSELAGE
        this.fuselage = [];
        this.fuselage.push(model_fusesalge());

        //PLATAFORM 
        plataform_fuselage.add(door);
        plataform_fuselage.add(container);

        //PLATAFORM WINGS
        const plataform_wings = plataform_fuselage.clone();
        plataform_wings.translateX(side_length);
        

        //PLATAFORM GRUA
        const plataform_grua = plataform_fuselage.clone();
        plataform_grua.scale.x=4;
        plataform_grua.translateZ(- side_length * 1.5);
        plataform_grua.translateX(0);
        

        //GRUA
        const GRUA = buildGrua();

        const first_axis = GRUA.getObjectByName("first_axis");
        const second_axis = GRUA.getObjectByName("second_axis");
        const third_axis = GRUA.getObjectByName("third_axis");
        const wrist = GRUA.getObjectByName("wrist");

        GRUA.translateZ(-side_length*1.5);
        GRUA.translateX(-side_length);
        GRUA.translateY(-(HANGAR_measures.TOTAL_HEIGHT/4));

        
        first_axis.rotateZ(-Math.PI/2.5);
        second_axis.rotateZ(-Math.PI/2);
        wrist.rotateY(Math.PI/2)
        
        

        //SCENE
        plataform_fuselage.translateX(-side_length);
        piston.translateX(-side_length);
        this.wings[0].translateY(-side_length);
        this.wings[0].translateZ(0.3);
        this.wings[0].scale.set(1,1,-1);
        this.wings[1].translateY(-side_length);
        this.wings[1].translateZ(-TIE_measures.WINGS_FRAME_DIAMETER*2);
        this.wings[1].scale.set(1,1,-1);

        scene.add(GRUA)

        scene.add(plataform_fuselage);
        scene.add(plataform_wings);
        scene.add(plataform_grua);
        scene.add(this.wings[0]);
        scene.add(this.wings[1]);
        piston.add(this.fuselage[0]);
        scene.add(piston);


        // Guardo referencias 
        this.door_fuselage = door;
        this.piston = piston;
        this.door_wings = plataform_wings.children[0];
        this.door_grua = plataform_grua.children[0];
        this.grua = GRUA;

        //constantes de calculo
        this.ala_agarrada = false;
        this.anclaje_terminado = false;
    }

    animate(delta) {
        //El tiempo de la animacion lo recibe del timer de main
        let this_animation_time,total_animation_time=0;

        
        //GRUA
        const first_axis = this.grua.getObjectByName("first_axis");
        const second_axis = this.grua.getObjectByName("second_axis");
        const third_axis = this.grua.getObjectByName("third_axis");
        const wrist = this.grua.getObjectByName("wrist");
        const hand = this.grua.getObjectByName("hand")

        //TIMER
        const previous_time = this.elapsed_time;
        this.elapsed_time += delta;
        const animation_time = this.elapsed_time;
        let time = 0;

        //Tiempo exacto recorrido en cada etapa (independiente de los FPS)
        const stepTime = (start, duration) => Math.max(0,
            Math.min(animation_time, start + duration) - Math.max(previous_time, start)
        );

        //----------------------------------------
        //      SE ABREN LAS PUERTAS
        //----------------------------------------

        this_animation_time = 3;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = this.side_length / this_animation_time;
            this.door_wings.translateX(-speed * time );
            this.door_fuselage.translateX(-speed * time);
            this.door_grua.translateX(-speed * time);
        }
        total_animation_time+=this_animation_time;

        
        //----------------------------------------
        //      SUBE EL FUSELAJE Y LA GRUA
        //----------------------------------------

        this_animation_time = 3; 
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (HANGAR_measures.TOTAL_HEIGHT/6 + TIE_measures.TOTAL_HEIGHT / 2) / this_animation_time;
            this.piston.translateY(speed * time );
        }        
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (HANGAR_measures.TOTAL_HEIGHT/6 + TIE_measures.TOTAL_HEIGHT / 2) / this_animation_time;
            this.grua.translateY(speed * time );
        }
        total_animation_time+=this_animation_time;

        //----------------------------------------
        // GRUA SE ACOMODA A SU POSICION DEFAULT
        //----------------------------------------
        //giran los eslabones
        this_animation_time = 2;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            first_axis.rotateZ(speed / 2.5 * time)
        }
        total_animation_time+=this_animation_time;
        //gira la base
        this_animation_time = 2;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (-Math.PI/2) / this_animation_time;
            this.grua.rotateY(speed * time);
        }
        total_animation_time+=this_animation_time;
        
        //espero 0.5 segundo
        this_animation_time = 0.5;
        total_animation_time+=this_animation_time;
        
        //----------------------------------------
        //   GRUA  SE MUEVE HACIA LA PRIMER ALA
        //----------------------------------------
        this_animation_time = 2;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (2 * this.side_length) / this_animation_time;
            this.grua.translateZ(- speed * time );
        }
        total_animation_time+=this_animation_time;

        //espero 0.5 segundo
        this_animation_time = 0.5;
        total_animation_time+=this_animation_time;

        //----------------------------------------
        //      GRUA AGARRA EL PRIMER ALA
        //----------------------------------------

        //rota el primer eslabon
        this_animation_time = 2;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            first_axis.rotateZ( -speed/3.4 * time );
        }
        total_animation_time+=this_animation_time;
        //se abre la mano
        this_animation_time = 1;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = 30 / this_animation_time;
            hand.setApertura(THREE.MathUtils.degToRad(speed * time));
        }
        total_animation_time+=this_animation_time;
        
        //espero 0.5 segundo
        this_animation_time = 0.5;
        total_animation_time+=this_animation_time;

        //se encastra
        this_animation_time = 0.1;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            first_axis.rotateZ( - speed/16 * time );
            second_axis.rotateZ( speed/16 * time);
        }
        total_animation_time+=this_animation_time;

        //espero 0.5 segundo
        this_animation_time = 0.5;
        total_animation_time+=this_animation_time;

        //cierro la mano
        this_animation_time = 0.5;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = 12 / this_animation_time;
            hand.setApertura(THREE.MathUtils.degToRad(-speed * time));
        }
        total_animation_time+=this_animation_time;

        //espero 0.5 segundo
        this_animation_time = 0.5;
        total_animation_time+=this_animation_time;

        //----------------------------------------
        //   GRUA SE ACOMODA A SU POSICION DEFAULT
        //----------------------------------------
        //ala hija de mano
        this_animation_time = 2;
        if(previous_time < total_animation_time && animation_time >= total_animation_time && this.ala_agarrada == false){
            hand.attach(this.wings[0]); //se ejecuta una sola vez
            this.ala_agarrada = true;
        }
        //vuelve a default
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            first_axis.rotateZ(speed/3.4 * time + speed/16 * time);
            this.wings[0].rotateY(- speed/4.85 * time)
            second_axis.rotateZ(- speed/16 * time );
        }
        total_animation_time+=this_animation_time;

        //espero 0.5 segundo
        this_animation_time = 0.5;
        total_animation_time+=this_animation_time;

        //----------------------------------------
        //      GRUA SE MUEVE A FUSELAJE
        //----------------------------------------
        this_animation_time = 2;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (3 * this.side_length) / this_animation_time;
            this.grua.translateZ(speed * time );
        }
        total_animation_time+=this_animation_time;

        //----------------------------------------
        //      ENCASTRE DEL PRIMER ALA
        //----------------------------------------

        //gira el ultimo brazo a 90 grados para que este en angulo con el brazo del fuselaje
        this_animation_time = 1;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            third_axis.rotateX(-speed/2 * time);
        }
        total_animation_time+=this_animation_time;
        //gira la base para dar espacio
        this_animation_time = 0.5
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            this.grua.rotateY(-speed/60 * time);
        }
        total_animation_time+=this_animation_time;

        //espero 0.5 segundo
        this_animation_time = 0.5; total_animation_time+=this_animation_time;

        //giran los eslabones para el encastre
        this_animation_time = 2;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            first_axis.rotateZ(-speed/2 * time + speed/140 * time);
            second_axis.rotateZ(speed/2 * time );
        }
        total_animation_time+=this_animation_time;

        //espero 0.5 segundo
        this_animation_time = 0.5; total_animation_time+=this_animation_time;

        //rota la muñeca para orientar el ala
        this_animation_time = 1;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            wrist.rotateY(speed/2 * time);
        }
        total_animation_time+=this_animation_time;

        //espero 0.5 segundo
        this_animation_time = 0.5; total_animation_time+=this_animation_time;

        //encastre
        this_animation_time = 0.1;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            this.grua.rotateY(speed/60 * time);
        }
        total_animation_time+=this_animation_time;
        
        //espero 0.5 seg y desheredo el ala
        this_animation_time=0.5;
        if(previous_time < total_animation_time && animation_time >= total_animation_time && this.ala_agarrada == true){
            this.scene.attach(this.wings[0]); //se ejecuta una sola vez
            this.ala_agarrada = false;

            //la acomodo desde 0
            this.wings[0].rotation.set(0, -Math.PI/2, 0);
            this.wings[0].position.set(- (this.side_length + TIE_measures.FUSELAGE_LENGTH/2), TIE_measures.TOTAL_HEIGHT / 2, 0);
            this.wings[0].scale.set(1, 1, -1);
        }
        total_animation_time+=this_animation_time;

        //----------------------------------------
        //   GRUA VUELVE A SU POSICION DEFAULT
        //----------------------------------------

        //separo el ala
        this_animation_time=0.5;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            first_axis.rotateZ(speed/120 * time );
            this.grua.rotateY(-speed/25 * time);
        }
        total_animation_time+=this_animation_time;

        //espero 0.5 segundo
        this_animation_time = 0.5; total_animation_time+=this_animation_time;

        //ACOMODO LA GRUA A SU POSICION DEFAULT
        this_animation_time = 2;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            first_axis.rotateZ(speed/2 * time - speed/140 * time);
            second_axis.rotateZ(-speed/2 * time );
            third_axis.rotateX(speed/2 * time);
            wrist.rotateY(-speed/2 * time);

            this.grua.rotateY(speed/25 * time);
        }
        total_animation_time+=this_animation_time;

        //espero 0.5 segundo
        this_animation_time = 0.5; total_animation_time+=this_animation_time;

        //----------------------------------------
        //  GRUA SE MUEVE A ALAS, Y SUBE SEGUNDO ALA
        //----------------------------------------

        //se mueve la grua
        this_animation_time = 2;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = -(3 * this.side_length) / this_animation_time;
            this.grua.translateZ(speed * time );
        }
        //sube el ala
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (0.4+TIE_measures.WINGS_FRAME_DIAMETER*2) / this_animation_time;
            this.wings[1].translateZ(speed * time);
        }
        total_animation_time+=this_animation_time;


        //----------------------------------------
        //      GRUA AGARRA SEGUNDO ALA
        //----------------------------------------

        //espero 0.5 segundo
        this_animation_time = 0.5; total_animation_time+=this_animation_time;

        //rota el primer eslabon
        this_animation_time = 2;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            first_axis.rotateZ( -speed/3.4 * time );
        }
        total_animation_time+=this_animation_time;
        //se abre la mano
        this_animation_time = 1;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = 30 / this_animation_time;
            hand.setApertura(THREE.MathUtils.degToRad(speed * time));
        }
        total_animation_time+=this_animation_time;
        
        //espero 0.5 segundo
        this_animation_time = 0.5; total_animation_time+=this_animation_time;

        //se encastra
        this_animation_time = 0.1;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            first_axis.rotateZ( - speed/16 * time );
            second_axis.rotateZ( speed/16 * time);
        }
        total_animation_time+=this_animation_time;

        //espero 0.5 segundo
        this_animation_time = 0.5; total_animation_time+=this_animation_time;

        //cierro la mano
        this_animation_time = 0.5;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = 12 / this_animation_time;
            hand.setApertura(THREE.MathUtils.degToRad(-speed * time));
        }
        total_animation_time+=this_animation_time;

        //espero 0.5 segundo
        this_animation_time = 0.5;
        total_animation_time+=this_animation_time;

        //----------------------------------------
        //   GRUA SE ACOMODA A SU POSICION DEFAULT
        //----------------------------------------
        //ala hija de mano
        this_animation_time = 2;
        if(previous_time < total_animation_time && animation_time >= total_animation_time && this.ala_agarrada == false){
            hand.attach(this.wings[1]); //se ejecuta una sola vez
            this.ala_agarrada = true;
        }
        //vuelve a default
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            first_axis.rotateZ(speed/3.4 * time + speed/16 * time);
            this.wings[1].rotateY(- speed/4.85 * time)
            second_axis.rotateZ(- speed/16 * time );
        }
            total_animation_time+=this_animation_time;

        //espero 0.5 segundo
        this_animation_time = 0.5; total_animation_time+=this_animation_time;

        //----------------------------------------
        //      GRUA SE MUEVE A FUSELAJE
        //----------------------------------------
        this_animation_time = 2;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (this.side_length - TIE_measures.WINGS_FRAME_DIAMETER) / this_animation_time;
            this.grua.translateZ(speed * time );
        }
        total_animation_time+=this_animation_time;

        //----------------------------------------
        //      ENCASTRE DEL SEGUNDO ALA
        //----------------------------------------

        //gira el ultimo brazo a 90 grados para orientar el ala
        this_animation_time = 1;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            third_axis.rotateX(speed/2 * time);
        }
        total_animation_time+=this_animation_time;

            //gira la base para dar espacio
        this_animation_time = 0.5;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            this.grua.rotateY(speed/60 * time);
        }
        total_animation_time+=this_animation_time;

            //espero 0.5 segundo
        this_animation_time = 0.5; total_animation_time+=this_animation_time;

            //giran los eslabones para el encastre
        this_animation_time = 2;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            first_axis.rotateZ(-speed/2 * time + speed/140 * time);
            second_axis.rotateZ(speed/2 * time);
        }
        total_animation_time+=this_animation_time;

            //espero 0.5 segundo
        this_animation_time = 0.5; total_animation_time+=this_animation_time;

            //rota la muñeca para orientar el ala
        this_animation_time = 1;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            wrist.rotateY(-speed/2 * time);
        }
        total_animation_time+=this_animation_time;

            //espero 0.5 segundo
        this_animation_time = 0.5; total_animation_time+=this_animation_time;

            //encastre
        this_animation_time = 0.1;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            this.grua.rotateY(-speed/60 * time);
        }
        total_animation_time+=this_animation_time;

            //espero 0.5 seg y desheredo el ala
        this_animation_time = 0.5;
        if(previous_time < total_animation_time && animation_time >= total_animation_time && this.ala_agarrada == true){
            this.scene.attach(this.wings[1]);
            this.ala_agarrada = false;

                //la acomodo del otro lado del fuselaje
            this.wings[1].rotation.set(0, Math.PI/2, 0);
            this.wings[1].position.set(
                -(this.side_length - TIE_measures.FUSELAGE_LENGTH/2),
                TIE_measures.TOTAL_HEIGHT/2,
                0
            );
            this.wings[1].scale.set(1, 1, -1);
        }
        total_animation_time+=this_animation_time;

        //----------------------------------------
        //   GRUA VUELVE A SU POSICION DEFAULT
        //----------------------------------------

        //separo el ala
        this_animation_time = 0.5;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            first_axis.rotateZ(speed/120 * time);
            this.grua.rotateY(speed/25 * time);
        }
        total_animation_time+=this_animation_time;

        //espero 0.5 segundo
        this_animation_time = 0.5; total_animation_time+=this_animation_time;

        //ACOMODO LA GRUA A SU POSICION DEFAULT
        this_animation_time = 2;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;

                first_axis.rotateZ(speed/2 * time - speed/140 * time);
            second_axis.rotateZ(-speed/2 * time);
            third_axis.rotateX(-speed/2 * time);
            wrist.rotateY(speed/2 * time);

                this.grua.rotateY(-speed/25 * time);
        }
        total_animation_time+=this_animation_time;  

        //espero 0.5 segundo
        this_animation_time = 0.5; total_animation_time+=this_animation_time;

        //----------------------------------------
        //      GRUA VUELVE A LA POSICION INICIAL
        //----------------------------------------

        //grua vuelve a su plataforma
        this_animation_time = 2;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (this.side_length + TIE_measures.WINGS_FRAME_DIAMETER/2) / this_animation_time;
            this.grua.translateZ(speed * time);
        }
        total_animation_time+=this_animation_time;

        //gira la base
        this_animation_time = 2;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI/2) / this_animation_time;
            this.grua.rotateY(speed * time);
        }
        total_animation_time+=this_animation_time;

        //giran los eslabones
        this_animation_time = 2;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (Math.PI) / this_animation_time;
            first_axis.rotateZ(-speed/2.5 * time - speed/60 * time);
        }
        total_animation_time+=this_animation_time;

        //----------------------------------------
        //      BAJA EL MECANISMO
        //----------------------------------------
        this_animation_time = 3;

        if(previous_time < total_animation_time && animation_time >= total_animation_time && this.anclaje_terminado == false){
            this.scene.attach(this.fuselage[0]); //se ejecuta una sola vez
            this.anclaje_terminado = true;
        }

        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = (HANGAR_measures.TOTAL_HEIGHT/6 + TIE_measures.TOTAL_HEIGHT/2) / this_animation_time;
            this.grua.translateY(-speed * time);
            this.piston.translateY(-speed * time);
        }
        total_animation_time+=this_animation_time;

        //----------------------------------------
        //      SE CIERRAN LAS PUERTAS
        //----------------------------------------

        this_animation_time = 3;
        if((time = stepTime(total_animation_time, this_animation_time)) > 0){
            const speed = this.side_length / this_animation_time;
            this.door_wings.translateX(speed * time);
            this.door_fuselage.translateX(speed * time);
            this.door_grua.translateX(speed * time);
        }
        total_animation_time+=this_animation_time;
        
    }
}

//MODELS
function model_createTieWing_1(x){
    const wing = createTieWings_1()
    wing.rotateX(-Math.PI/2)
    wing.translateZ( - TIE_measures.WINGS_FRAME_DIAMETER - 0.5);
    wing.translateY(x);
    return wing
}

function model_fusesalge(){
    const fuselage = createTieFuselage()
    fuselage.scale.y=-1;
    fuselage.translateZ(- TIE_measures.FUSELAGE_DIAMETER_CENTER - 0.3);
    return fuselage;
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