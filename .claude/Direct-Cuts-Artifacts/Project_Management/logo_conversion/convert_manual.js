
const fs = require('fs');
const PNG = require('pngjs').PNG;
const b2v = require('bitmap2vector');

fs.createReadStream('logo.png')
    .pipe(new PNG())
    .on('parsed', function () {
        console.log('Image parsed:', this.width, this.height);

        // Prepare image data object
        // b2v.imagedataToSVG might expect { width, height, data }
        // this (the PNG instance) has width, height, data.

        try {
            const svg = b2v.imagedataToSVG(this, {
                ltres: 1,
                qtres: 1,
                pathomit: 8,
                rightangleenhance: false,
                colorsampling: 2, // 0: disabled, 1: random, 2: deterministic
                numberofcolors: 16,
                mincolorratio: 0,
                colorquantcycles: 3,
                layering: 0,
                strokewidth: 0,
                linefilter: false,
                scale: 1,
                roundcoords: 1,
                viewbox: true,
                desc: false,
                lcpr: 0,
                qcpr: 0,
                blurradius: 0,
                blurdelta: 10
            });

            fs.writeFileSync('logo.svg', svg);
            console.log('SVG written to logo.svg');
        } catch (e) {
            console.error('Conversion error:', e);
        }
    })
    .on('error', function (err) {
        console.error('PNG error:', err);
    });
