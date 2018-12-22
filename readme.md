A utility to convert Highcharts configs to SVGs without a browser.

It is generally slower than the export server and the text bounding boxes are
not exact, which affects the whole chart layout. 

### Usage
`npm install`

```js
const hc = require('./highcharts-jsdom');

hc({
	infile: 'examples/column.json',
	outfile: 'examples/column.svg'
}).then((result) => {
	console.log(result);
});
```

### Run example
`node example`