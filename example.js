/* eslint-env node, es6 */

const hc = require('./highcharts-jsdom');

hc({
	infile: 'examples/column.json',
	outfile: 'examples/column.svg'
}).then((result) => {
	console.log(result);
});