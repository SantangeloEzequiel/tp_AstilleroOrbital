import {SCALE_HANGAR as SCALE} from '../../constants.js';
//para proporcion, un TIE mediria de alto, 10, de ancho 7, y de profundo 6

//MEDIDAS GENERALES
export const TOTAL_WIDTH = 160 * SCALE;
export const TOTAL_DEPTH = 185 * SCALE;
export const TOTAL_HEIGHT = 60 * SCALE;
export const TOTAL_PROPORTION = 0.5; // porcentaje del lado del octagono recto con respecto a la altura total antes que se doble
export const TOTAL_EXTERIOR_HEIGTH_PROPORTION = 2;

//CANTIDADES
export const LATERAL_COLUMNS_PER_SIDE = 9; //separadas por un espacio entre medio que no tiene nada
export const TOP_RIELS_NUMBER = 10;


//MEDIDAS ESPECIFICAS

//columnas
export const COLUMNS_SIDE = 5 * SCALE;
export const COLUMNS_PILON_LENGTH = 10 * SCALE;
export const COLUMNS_PILON_HEIGTH = 10 * SCALE;
export const COLUMNS_PROPORTION_PILON_HEIGTH = 2; //que tan alta sera la segunda base con respecto a la primera

//ligth tubes
export const LIGHT_TUBE_DIAMETER = 4 * SCALE;

//door
export const DOOR_FRAME_WIDTH = 6 * SCALE;
export const DOOR_FRAME_DEPTH = 20 * SCALE;
export const DOOR_PROPORTION_OCTAGON_FRAME = 0.9;

//riels
export const RIELS_SIDE = 2 * SCALE;
export const RIELS_ESPESOR = 0.1 * SCALE