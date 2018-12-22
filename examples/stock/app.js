/* eslint-env node, es6 */

const hc = require(__dirname + '/../../highcharts-jsdom');

hc({
    infile: __dirname + '/options.json',
    outfile: __dirname + '/chart.svg',

    // Constructor, defaults to 'chart'
    constr: 'stockChart',

    extensions: [
    	// Load the stock module
    	'modules/stock'
    ]
}).then((result) => {
    console.log(result);
});