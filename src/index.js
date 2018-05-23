import {
    GlobalView,
    RandomDataset,
} from "global-view";

import Data from './AICS_Cell-feature-analysis_v1.7.csv';
var Plotly = require('plotly.js/dist/plotly');
// const globalviewPlot = new GlobalView(document.querySelector('#global-view'), null);
// const globalviewData = new RandomDataset(1000000, 3, (dataset) => globalviewPlot.load(dataset, 0, 1, 2, 2));

function normal() {
    var x = 0,
        y = 0,
        rds, c;
    do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        rds = x * x + y * y;
    } while (rds == 0 || rds > 1);
    c = Math.sqrt(-2 * Math.log(rds) / rds); // Box-Muller transform
    return x * c; // throw away extra sample y * c
}


function init() {
    // set_handlers("app");
}

init()
let loaded = false;
function onChannelDataReady() {
    let loaded = true;
    console.log("Got channel data");
}
processData(Data)


function processData(allRows) {

    let x = []
    let y = []
    let classes = [];
    let names = [];

    for (var i = 0; i < allRows.length; i++) {
        let row = allRows[i];
        x.push(row['Nuclear volume (fL)'])
        y.push(row['Cellular volume (fL)'])
        classes.push(row['classes']);
        names.push(row['Cell ID'])
    }
    makePlotly(x, y, classes, names);
}

function makePlotly(x, y, classes, names) {
    var trace1 = {
        x: x,
        y: y,
        names: names,
        mode: 'markers',
        marker: {
            symbol: 'circle',
            size: 4,
            opacity: 0.4
        },
        type: 'scattergl'
    };


    var trace2 = {
        x: x,
        y: y,
        name: 'density',
        ncontours: 20,
        colorscale: 'Hot',
        reversescale: true,
        showscale: false,
        type: 'histogram2dcontour'
    };
    var trace3 = {
        x: x,
        name: 'x density',
        marker: { color: 'rgb(102,0,0)' },
        yaxis: 'y2',
        type: 'histogram'
    };
    var trace4 = {
        y: y,
        name: 'y density',
        marker: { color: 'rgb(102,0,0)' },
        xaxis: 'x2',
        type: 'histogram'
    };
    var data = [trace4, trace3, trace2, trace1];


    var layout = {
        showlegend: false,
        autosize: false,
        width: 600,
        height: 550,
        margin: { t: 50 },
        hovermode: 'closest',
        bargap: 0,
        xaxis: {
            domain: [0, 0.85],
            showgrid: false,
            zeroline: false
        },
        yaxis: {
            domain: [0, 0.85],
            showgrid: false,
            zeroline: false
        },
        xaxis2: {
            domain: [0.85, 1],
            showgrid: false,
            zeroline: false
        },
        yaxis2: {
            domain: [0.85, 1],
            showgrid: false,
            zeroline: false
        }
    }
    Plotly.newPlot('app', data, layout);
    const plot = document.getElementById('app')
    const hoverInfo = document.getElementById('hoverinfo')
    plot.on('plotly_hover', function (hovered) {
        console.log(hovered.points[0])
        var infotext = hovered.points.map(function (d) {
            return (d.data.names[d.pointIndex])
            // return ('name: ' + xaxis.l2p(d.x) + ', height: ' + yaxis.l2p(d.y));
        });

        hoverInfo.innerHTML = infotext.join('');
    })
        .on('plotly_unhover', function (data) {
            hoverInfo.innerHTML = '';
        });

}