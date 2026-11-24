
//Seccionamiento de imagenes png del ATLAS hecho con IA, era mas rapido que trabajar con el ATLAS directamente

import * as THREE from 'three';


// ==========================================
// IMPORTS DE IMAGENES
// ==========================================

import panelFuselageUrl
    from './texturas_normales/Fuselaje.png';

    
import panelNegroUrl
    from './texturas_normales/PanelNegro.png';

    
import panelNegroGrandeUrl
    from './texturas_normales/PanelNegroGrande.png';

    
import panelCabinaUrl
    from './texturas_normales/Cabina.png';


import panelBrazosUrl
    from './texturas_normales/Brazos.png';    


import bordesAlaUrl
    from './texturas_normales/BordesAla.png';    

import borderSeccionUrl
    from './texturas_normales/BorderSeccion.png'    

import pylonAdentroUrl
    from './texturas_normales/pylon_adentro.png'

import pylonAdelanteUrl
    from './texturas_normales/pylon_adelante.png'    
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

    texture.colorSpace = THREE.NoColorSpace;

    return texture;
}


// ==========================================
// texturas_normales
// ==========================================

export const panelFuselage =
    loadTexture(panelFuselageUrl);

export const panelNegro = 
    loadTexture(panelNegroUrl);

export const PanelNegroGrande = 
    loadTexture(panelNegroGrandeUrl);

export const aroCabinaNegro =
    loadTexture(panelCabinaUrl);

export const panelBrazos =
    loadTexture(panelBrazosUrl);

export const bordesAla =
    loadTexture(bordesAlaUrl); 
    
bordesAla.anisotropy = 16;
bordesAla.magFilter = THREE.NearestFilter;
bordesAla.minFilter = THREE.NearestMipmapNearestFilter;
bordesAla.generateMipmaps = true;
bordesAla.wrapS = THREE.RepeatWrapping;
bordesAla.wrapT = THREE.ClampToEdgeWrapping;
bordesAla.repeat.set(1,1);
bordesAla.needsUpdate = true;

export const borderSeccion =
    loadTexture(borderSeccionUrl);

borderSeccion.anisotropy = 5;
borderSeccion.wrapS = THREE.RepeatWrapping;
borderSeccion.wrapT = THREE.ClampToEdgeWrapping;
borderSeccion.repeat.set(5,1);
borderSeccion.needsUpdate = true;

export const pylonInterior =
    loadTexture(pylonAdentroUrl);


export const pylonExterior =
    loadTexture(pylonAdelanteUrl);    