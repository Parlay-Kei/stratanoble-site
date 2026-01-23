
const fs = require('fs');
const ImageTracer = require('imagetracerjs');

try {
    ImageTracer.imageToSVG(
        'logo.png',
        function (svgstr) {
            fs.writeFileSync('logo.svg', svgstr);
            console.log('Conversion successful!');
        },
        { ltres: 0.1, qtres: 0.1, scale: 1, strokewidth: 0, viewbox: true } // Options for better precision
    );
} catch (e) {
    console.error('Error:', e);
}
