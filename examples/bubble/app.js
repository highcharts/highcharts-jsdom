/* eslint-env node, es6 */

const hc = require(__dirname + '/../../highcharts-jsdom');

hc({
    infile: __dirname + '/options.json',
    outfile: __dirname + '/chart.svg',

    // Constructor, defaults to 'chart'
    constr: 'chart',

    // Module files etc
    extensions: [
        'highcharts-more'
    ]
}).then((result) => {
    console.log(result);
});