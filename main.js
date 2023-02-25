//@ts-ignore
//import plot from 'https://cdn.skypack.dev/plotly.js-basic-dist-min';
import plot from './plotly-basic-dist-min.js';

async function getData() {
	const response = await fetch('temps.csv');
	const data = await response.text();
	const rows = data.split('\n').slice(1);

	
	const /** @type {string[]} */ years = [];
	const /** @type {number[]} */ temps = [];
	const /** @type {number[]} */ temps2 = [];
	
	rows.forEach(row => {
		const cols = row.split(',');
	  	years.push(cols[0]);
	  	temps.push(14 + parseFloat(cols[1]));
		temps2.push(15 + parseFloat(cols[1]))
	});
	return { years, temps, temps2 };
}

async function doPlot() {
	const values = await getData();
	let data = [
		{
			type: 'scatter',
			mode: 'lines',  
			name: 'Serie A',
			line: { width: 1 },
			x: values.years,     
			y: values.temps
		},
		{
			type: 'scatter',
			mode: 'markers',
			name: 'Serie B', 
			marker: { size: 3 }, 
			x: values.years,     
			y: values.temps2
		}
	];

	plot.newPlot('plotter', data, {margin: {t: 0}});
}


function start() {
	doPlot();
}

function draw() {
}

// Programmstart
start();
