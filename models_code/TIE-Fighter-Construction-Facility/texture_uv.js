
//Seccionamiento de imagenes png del ATLAS hecho con IA, era mas rapido que trabajar con el ATLAS directamente

import * as THREE from 'three';


// ==========================================
// IMPORTS DE IMAGENES
// ==========================================

import exterior_url
    from './texture_maps/Exterior.png';

import techo_url
    from './texture_maps/Techo.png';

    
import pared_url
    from './texture_maps/Pared.png';

    
import fondo_url
    from './texture_maps/Fondo.png';

    
import piso_url
    from './texture_maps/Piso.png';


import tiraLuces_url
    from './texture_maps/Tira_Luces.png';    

import luzIndividual_url
    from './texture_maps/Luz-individual.png';    

import columnaCuerpo_url
    from './texture_maps/Columna_Cuerpo.png';
    
import columnaBase_url
    from './texture_maps/Columna_Base.png';    

import rielSeccionUrl
    from './texture_maps/Riel_Seccion.png'    

// ==========================================
// TEXTURE LOADER
// ==========================================

const textureLoader = new THREE.TextureLoader();


// Todas estas imágenes representan color,
// por eso las cargamos como sRGB.

function loadTexture(url) {

    const texture = textureLoader.load(
        url,

        () => {
            console.log('Textura cargada:', url);
        },

        undefined,

        (error) => {
            console.error('Error cargando textura:', url, error);
        }
    );

    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
}

// ==========================================
// TEXTURAS
// ==========================================
export const exterior =
    loadTexture(exterior_url);
exterior.wrapS = THREE.RepeatWrapping;
exterior.wrapT = THREE.RepeatWrapping;    

export const techo =
    loadTexture(techo_url);

export const pared =
    loadTexture(pared_url);

export const fondo =
    loadTexture(fondo_url);

export const piso =
    loadTexture(piso_url);
piso.wrapS = THREE.RepeatWrapping;
piso.wrapT = THREE.RepeatWrapping;

piso.repeat.set(5, 4.25);

piso.anisotropy = 16;
piso.magFilter = THREE.LinearFilter;
piso.minFilter = THREE.LinearMipmapLinearFilter;
piso.generateMipmaps = true;

export const tiraLuces =
    loadTexture(tiraLuces_url);

export const luzIndividual =
    loadTexture(tiraLuces_url);

export const columnaCuerpo =
    loadTexture(columnaCuerpo_url);

export const columnaBase =
    loadTexture(columnaBase_url);    

export const rielSeccion =
    loadTexture(rielSeccionUrl);