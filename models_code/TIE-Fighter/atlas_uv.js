
//Seccionamiento de imagenes png del ATLAS hecho con IA, era mas rapido que trabajar con el ATLAS directamente

import * as THREE from 'three';


// ==========================================
// IMPORTS DE IMAGENES
// ==========================================

import panelCascoSuperiorUrl
    from './texturas/01_panel_casco_superior.png';

import soportesBrazoUrl
    from './texturas/02_soportes_brazo.png';

import aroCabinaNegroUrl
    from './texturas/03_aro_cabina_negro.png';

import hexagonoNegroPequenoUrl
    from './texturas/04_hexagono_negro_pequeno.png';

import piezasRojasUrl
    from './texturas/05_piezas_rojas.png';

import tapaPilonAUrl
    from './texturas/06_tapa_pilon_A.png';

import tapaPilonBUrl
    from './texturas/07_tapa_pilon_B.png';

import panelesCabinaMitadesUrl
    from './texturas/08_paneles_cabina_mitades.png';

import panelesLateralesCabinaUrl
    from './texturas/09_paneles_laterales_cabina.png';

import tiraVerticalUrl
    from './texturas/10_tira_vertical.png';

import soportePequenoUrl
    from './texturas/11_soporte_pequeno.png';

import tapaInferiorAUrl
    from './texturas/12_tapa_inferior_A.png';

import barrasEstructuraUrl
    from './texturas/13_barras_estructura.png';

import tapaInferiorBUrl
    from './texturas/14_tapa_inferior_B.png';

import alaIzqCompletaUrl
    from './texturas/15_ala_izq_completa.png';

import alaDerCompletaUrl
    from './texturas/15_ala_der_completa.png';

import alaIzqPanelesNegrosUrl
    from './texturas/16_ala_izq_paneles_negros.png';

import alaDerPanelesNegrosUrl
    from './texturas/16_ala_der_paneles_negros.png';

import alaIzqBordeMarcoUrl
    from './texturas/17_ala_izq_borde_marco.png';

import alaDerBordeMarcoUrl
    from './texturas/17_ala_der_borde_marco.png';

import alaIzqHexagonoCentroUrl
    from './texturas/18_ala_izq_hexagono_centro.png';

import alaDerHexagonoCentroUrl
    from './texturas/18_ala_der_hexagono_centro.png';

import escotillaRedondaUrl
    from './texturas/19_escotilla_redonda.png';

import escotillaVentanaCabinaUrl
    from './texturas/20_escotilla_ventana_cabina.png';

import panelNegroUrl
    from './texturas/textura_panel_negro_512.png';

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

export const panelCascoSuperior =
    loadTexture(panelCascoSuperiorUrl);

export const panelNegro = 
    loadTexture(panelNegroUrl);

export const soportesBrazo =
    loadTexture(soportesBrazoUrl);


export const aroCabinaNegro =
    loadTexture(aroCabinaNegroUrl);


export const hexagonoNegroPequeno =
    loadTexture(hexagonoNegroPequenoUrl);


export const piezasRojas =
    loadTexture(piezasRojasUrl);


export const tapaPilonA =
    loadTexture(tapaPilonAUrl);


export const tapaPilonB =
    loadTexture(tapaPilonBUrl);


export const panelesCabinaMitades =
    loadTexture(panelesCabinaMitadesUrl);


export const panelesLateralesCabina =
    loadTexture(panelesLateralesCabinaUrl);


export const tiraVertical =
    loadTexture(tiraVerticalUrl);


export const soportePequeno =
    loadTexture(soportePequenoUrl);


export const tapaInferiorA =
    loadTexture(tapaInferiorAUrl);


export const barrasEstructura =
    loadTexture(barrasEstructuraUrl);


export const tapaInferiorB =
    loadTexture(tapaInferiorBUrl);


export const alaIzqCompleta =
    loadTexture(alaIzqCompletaUrl);


export const alaDerCompleta =
    loadTexture(alaDerCompletaUrl);


export const alaIzqPanelesNegros =
    loadTexture(alaIzqPanelesNegrosUrl);


export const alaDerPanelesNegros =
    loadTexture(alaDerPanelesNegrosUrl);


export const alaIzqBordeMarco =
    loadTexture(alaIzqBordeMarcoUrl);


export const alaDerBordeMarco =
    loadTexture(alaDerBordeMarcoUrl);


export const alaIzqHexagonoCentro =
    loadTexture(alaIzqHexagonoCentroUrl);


export const alaDerHexagonoCentro =
    loadTexture(alaDerHexagonoCentroUrl);


export const escotillaRedonda =
    loadTexture(escotillaRedondaUrl);


export const escotillaVentanaCabina =
    loadTexture(escotillaVentanaCabinaUrl);