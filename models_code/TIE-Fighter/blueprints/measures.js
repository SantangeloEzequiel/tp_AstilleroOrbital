import {SCALE_TIE_FIGHTER as SCALE} from '../../constants.js';

//FUSELAGE
export const FUSELAGE_LENGTH = 280 * SCALE; //2/3 cockpit - 1/3 tubes
export const FUSELAGE_DIAMETER_CENTER = 65 * SCALE;
export const FUSELAGE_DIAMETER_EXT = 24 * SCALE;
export const COCKPIT_DIAMETER = 60 * SCALE;
export const COCKPIT_FRAME_WIDTH = 4 * SCALE;

//WINGS
export const WINGS_HEIGHT= 310 * SCALE;
export const WINGS_FRAME_DIAMETER = 6 * SCALE; //El diametro del borde del ala
export const WINGS_PYLONS_HEIGHT = 100 * SCALE;
export const WINGS_PYLONS_WIDTH = 80 * SCALE;
export const WINGS_DEPTH = 50  * SCALE; 
//wing 1
export const WING1_WIDTH= 270 * SCALE;
export const WING1_SIDE_LENGTH = 170 * SCALE
//wing 2
export const WING2_WIDTH = 200 * SCALE
//wing 3
export const WING3_WIDTH = 280 * SCALE;

//ENGINES
export const ENGINES_EXTERIOR_DIAMETER = (65 / 2) * SCALE; // half of cockpit diameter
export const ENGINES_DEPTH = 12 * SCALE;
//proportions
export const ENGINES_CENTER_DIAMETER = ENGINES_EXTERIOR_DIAMETER/2;
export const ENGINES_HEXAGON_DIAMETER = ENGINES_CENTER_DIAMETER * (1/2);


//UTILS
export const TOTAL_WIDTH_WINGS_1 = FUSELAGE_LENGTH + 2 * WINGS_FRAME_DIAMETER;
export const TOTAL_HEIGHT = WINGS_HEIGHT;