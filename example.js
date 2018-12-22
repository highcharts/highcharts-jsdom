/* eslint-env node, es6 */

const hc = require('./highcharts-jsdom');

hc({
	infile: 'examples/bubble.json',
	outfile: 'chart.svg',

	// Constructor, defaults to 'chart'
	constr: 'chart',

	// Module files etc
	extensions: [
		'highcharts-more'
	]
}).then((result) => {
	console.log(result);
});