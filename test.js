//@ts-ignore
import plot from 'https://cdn.skypack.dev/plotly.js-basic-dist-min';


let x = [];
for (let i = -5; i < 6; i++) {
	x.push(i);
}

let y = [];
for (let i = -5; i < 6; i++) {
	y.push(1 / (1 + Math.exp(-i)))
}


/**
 * @param {number[]} xVal 
 * @param {number[]} yVal 
 */
function doPlot(xVal, yVal) {

	let layout = {
		margin: {t: 0},
		xaxis: {
			dtick: 1
		}
	}

	let data = [
		{
			type: 'scatter',
			mode: 'lines',  
			name: 'Serie A',
			line: { width: 1 },
			x: xVal,
			y: yVal
		}
	];

	plot.newPlot('plotter', data, layout);
}

doPlot(x, y);