
//Seccionamiento de imagenes png del ATLAS hecho con IA, era mas rapido que trabajar con el ATLAS directamente

import * as THREE from 'three';


// ==========================================
// IMPORTS DE IMAGENES
// ==========================================

import panelFuselageUrl
    from './texturas/Fuselaje.png';

    
import panelNegroUrl
    from './texturas/PanelNegro.png';

    
import panelNegroGrandeUrl
    from './texturas/PanelNegroGrande.png';

    
import panelCabinaUrl
    from './texturas/Cabina.png';


import panelBrazosUrl
    from './texturas/Brazos.png';    

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
