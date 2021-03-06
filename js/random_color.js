/**
 * Created with JetBrains WebStorm.
 * User: paulroosens
 * Date: 08/11/2013
 * Time: 16:42
 * To change this template use File | Settings | File Templates.
 */


/* HSV idea from http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/ */
/* returns random hex color */
function hsv_random_color(h, s, v) {

    var r = 0;var g = 0;var b = 0;
    var h_i = parseInt(h*6);
    var f = h*6 - h_i;
    var p = v * (1 - s);
    var q = v * (1 - f*s);
    var t = v * (1 - (1 - f) * s);
    switch(h_i) {
        case 0:
            r = v; g = t; b = p;
            break;
        case 1:
            r = q; g = v; b = p;
            break;
        case 2:
            r = p; g = v; b = t;
            break;
        case 3:
            r = p; g = q; b = v;
            break;
        case 4:
            r = t; g = p; b = v;
            break;
        case 5:
            r = v; g = p; b = q;
            break;
        default:
            console.log("Failed to generate random color? h_i="+h_i);
    }
    var red = parseInt(r*256);
    var green = parseInt(g*256);
    var blue = parseInt(b*256);

    var rgb = blue | (green << 8) | (red << 16);
    return '#' + rgb.toString(16);
}
