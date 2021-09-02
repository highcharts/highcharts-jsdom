/**
 * Sample of serverside generation of Highcharts using an extension to jsdom in
 * node.js.
 */

/* eslint-env node, es6 */
/* eslint no-console: 0 */
const jsdom = require('jsdom');
const fs = require('fs');

const { JSDOM } = jsdom;

// Get the document and window
const dom = new JSDOM(
    `<!doctype html>
    <html>
        <body>
            <div id="container"></div>
        </body>
    </html>`);
const win = dom.window;
const doc = win.document;

global.Node = win.Node; // Workaround for issue #1
win.Date = Date;

// Do some modifications to the jsdom document in order to get the SVG bounding
// boxes right.
let oldCreateElementNS = doc.createElementNS;
doc.createElementNS = (ns, tagName) => {
    let elem = oldCreateElementNS.call(doc, ns, tagName);
    if (ns !== 'http://www.w3.org/2000/svg') {
        return elem;
    }

    /**
     * Pass Highcharts' test for SVG capabilities
     * @returns {undefined}
     */
    elem.createSVGRect = () => {};
    /**
     * jsdom doesn't compute layout (see
     * https://github.com/tmpvar/jsdom/issues/135). This getBBox implementation
     * provides just enough information to get Highcharts to render text boxes
     * correctly, and is not intended to work like a general getBBox
     * implementation. The height of the boxes are computed from the sum of
     * tspans and their font sizes. The width is based on an average width for
     * each glyph. It could easily be improved to take font-weight into account.
     * For a more exact result we could to create a map over glyph widths for
     * several fonts and sizes, but it may not be necessary for the purpose.
     * @returns {Object} The bounding box
     */
    elem.getBBox = () => {
        let lineWidth = 0,
            width = 0,
            height = 0;

        let children = [].slice.call(
            elem.children.length ? elem.children : [elem]
        );

        children
            .filter(child => {
                if (child.getAttribute('class') === 'highcharts-text-outline') {
                    child.parentNode.removeChild(child);
                    return false;
                }
                return true;
            })
            .forEach(child => {
                let fontSize = child.style.fontSize || elem.style.fontSize,
                    lineHeight,
                    textLength;

                // The font size and lineHeight is based on empirical values,
                // copied from the SVGRenderer.fontMetrics function in
                // Highcharts.
                if (/px/.test(fontSize)) {
                    fontSize = parseInt(fontSize, 10);
                } else {
                    fontSize = /em/.test(fontSize) ?
                        parseFloat(fontSize) * 12 :
                        12;
                }
                lineHeight = fontSize < 24 ?
                    fontSize + 3 :
                    Math.round(fontSize * 1.2);
                textLength = child.textContent.length * fontSize * 0.55;

                // Tspans on the same line
                if (child.getAttribute('dx') !== '0') {
                    height += lineHeight;
                }

                // New line
                if (child.getAttribute('dy') !== null) {
                    lineWidth = 0;
                }

                lineWidth += textLength;
                width = Math.max(width, lineWidth);

            }
        );

        return {
            x: 0,
            y: 0,
            width: width,
            height: height
        };
    };
    return elem;
};

module.exports = ({
    constr = 'chart',
    extensions = [],
    infile,
    outfile = 'chart.svg'
}) => {
    return new Promise((resolve, reject) => {
        // Require Highcharts with the window shim
        const Highcharts = require('highcharts')(win);
        extensions.forEach(ext => {
            require(`highcharts/${ext}`)(Highcharts);
        });

        if (!Highcharts.Chart.prototype.sanitizeSVG) {
            require('highcharts/modules/exporting')(Highcharts);
        }


        // Disable all animation
        Highcharts.setOptions({
            plotOptions: {
                series: {
                    animation: false,
                    dataLabels: {
                        defer: false
                    }
                }
            }
        });

        if (infile) {

            fs.readFile(infile, 'utf8', (err, file) => {
                if (err) {
                    reject(err);
                }

                let chart;
                let options = JSON.parse(file);

                // Generate the chart into the container
                let start = Date.now();
                try {
                    chart = Highcharts[constr](
                        'container',
                        options
                    );
                } catch (e) {
                    reject(e);
                    return;
                }

                let time = Date.now() - start;

                let svg = chart.sanitizeSVG(
                    chart.container.innerHTML
                );
                fs.writeFile(outfile, svg, function (err) {

                    if (err) {
                        reject(err);
                    }

                    resolve({
                        bytes: svg.length,
                        outfile: __dirname + '/' + outfile,
                        time: time
                    });
                });
            });
        } else {
            reject('No infile given');
        }
    });
};