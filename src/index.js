

// import Data from './AICS_Cell-feature-analysis_v1.7.csv';
import superagent from 'superagent';
import Data from './cell-feature-analysis.json'
var Plotly = require('plotly.js/dist/plotly');
import { loadImageData, make3Dviewer } from './volume-view';

let currentX;
let currentY;

function onChannelDataReady() {
    let loaded = true;
    console.log("Got channel data");
}
processData(Data)

function makeSelectors(alloptions) {
    let xselect = document.getElementById('x-axis-select');
    let yselect = document.getElementById('y-axis-select')
    alloptions.forEach(ele => {
        let xelement = document.createElement('option');
        xelement.value = ele;
        xelement.text = ele;
        let yelement = document.createElement('option');
        yelement.value = ele;
        yelement.text = ele;
        xselect.appendChild(xelement);
        yselect.appendChild(yelement)
    })
    xselect.addEventListener('change', function(e){
        changeData(this.id, this.value)
    })
    yselect.addEventListener('change', function (e) {
        changeData(this.id, this.value)
    })
};

function changeData(axisId, value){
    let axis = axisId.split('-')[0];
    let newx;
    let newy;
    if (axis === 'x'){
        newx = value;
        currentX = value;
        newy = document.getElementById('y-axis-select').value;
    }
    if (axis === 'y') {
        newy = value;
        currentY = value;
        newx = document.getElementById('x-axis-select').value;

    }
    makePlotly(Data, newx, newy, 'structureProteinName');
}

function processData(allRows) {

    let alloptions = Object.keys(allRows[0]).filter(ele => ele !== 'structureProteinName' && ele !== 'Cell ID' && ele !== 'datadir');

    makeSelectors(alloptions);
    currentX = 'Nuclear volume (fL)';
    currentY = 'Cellular volume (fL)';
    makePlotly(allRows, 'Nuclear volume (fL)', 'Cellular volume (fL)', 'structureProteinName');
}

function unpack(rows, key) {
    return rows.map(function (row) { return row[key]; });
}

function makePlotly(allRows, plotbyOnX, plotByOnY, ColorBy) {
    var trace1 = {
        x: unpack(allRows, plotbyOnX),
        y: unpack(allRows, plotByOnY),
        names: unpack(allRows, 'Cell ID'),
        dir: unpack(allRows, 'datadir'),
        mode: 'markers',
        name: 'scatterplot',
        marker: {
            symbol: 'circle',
            size: 4,
            opacity: 0.4
        },
        type: 'scattergl',
        legendgroup: ColorBy,

        transforms: [
            {
                type: 'groupby',
                groups: unpack(allRows, ColorBy),
    
            }]
    };

    var trace2 = {
        x: unpack(allRows, plotbyOnX),
        y: unpack(allRows, plotByOnY),
        name: 'density',
        ncontours: 20,
        colorscale: 'Hot',
        reversescale: true,
        showscale: false,
        type: 'histogram2dcontour'
    };
    var trace3 = {
        x: unpack(allRows, plotbyOnX),
        name: 'x density',
        marker: { color: 'rgb(102,0,0)' },
        yaxis: 'y2',
        type: 'histogram'
    };
    var trace4 = {
        y: unpack(allRows, plotByOnY),
        name: 'y density',
        marker: { color: 'rgb(102,0,0)' },
        xaxis: 'x2',
        autobiny: false,
        nbinsy: 5,
        type: 'histogram'
    };
    var data = [trace1];


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
        let point = hovered.points[0];
        var thumbnailSrc = point.data.dir ? point.data.dir[point.pointIndex] : null;
        var cellID = point.data.names? point.data.names[point.pointIndex] : null;
        if (cellID && thumbnailSrc ){
            let cellLineId = cellID.split('_')[0];
            hoverInfo.children[0].setAttribute('src', `https://cellviewer-1-2-0.allencell.org/aics/thumbnails/${thumbnailSrc}/${cellLineId}/${cellID}.png`)
            hoverInfo.style.left = hovered.event.pointerX + 'px';
            hoverInfo.style.top = hovered.event.pointerY + 'px';
        }
    })
        .on('plotly_unhover', function (data) {
            hoverInfo.children[0].setAttribute('src', '')
        })
        .on('plotly_click', function (clicked) {
            let points = clicked.points;
            points.map(point => {

                if (point.data.name === 'scatterplot'){
                    var thumbnailSrc = point.data.dir ? point.data.dir[point.pointIndex] : null;
                    var cellID = point.data.names ? point.data.names[point.pointIndex] : null;

                    if (cellID && thumbnailSrc) {
                        let cellLineId = cellID.split('_')[0];
                        // PREPARE SOME TEST DATA TO TRY TO DISPLAY A VOLUME.
                        // let imgdata = {
                        //     "width": 306,
                        //     "height": 494,
                        //     "channels": 9,
                        //     "channel_names": ["DRAQ5", "EGFP", "Hoechst 33258", "TL Brightfield", "SEG_STRUCT", "SEG_Memb", "SEG_DNA", "CON_Memb", "CON_DNA"],
                        //     "rows": 7,
                        //     "cols": 10,
                        //     "tiles": 65,
                        //     "tile_width": 204,
                        //     "tile_height": 292,
                        //     "atlas_width": 2040,
                        //     "atlas_height": 2044,
                        //     "pixel_size_x": 0.065,
                        //     "pixel_size_y": 0.065,
                        //     "pixel_size_z": 0.29,
                        //     "images": [{
                        //         "name": "examples/AICS-10_5_5.ome.tif_atlas_0.png",
                        //         "channels": [0, 1, 2]
                        //     }, {
                        //         "name": "examples/AICS-10_5_5.ome.tif_atlas_1.png",
                        //         "channels": [3, 4, 5]
                        //     }, {
                        //         "name": "examples/AICS-10_5_5.ome.tif_atlas_2.png",
                        //         "channels": [6, 7, 8]
                        //     }],
                        //     "name": "AICS-10_5_5",
                        //     "status": "OK",
                        //     "version": "0.0.0",
                        //     "aicsImageVersion": "0.3.0"
                        // };
                        
                        const url = `https://s3-us-west-2.amazonaws.com/bisque.allencell.org/v1.2.0/Cell-Viewer_Thumbnails/${thumbnailSrc}/${cellLineId}/${cellID}_atlas.json`;
                        return superagent.get(url)
                            .then(res => res.body)
                            .then(jsonData => {
                                let newUrls = jsonData.images.map(image => {
                                    image.name = `https://cellviewer-1-2-0.allencell.org/aics/thumbnails/${thumbnailSrc}/${cellLineId}/${image.name}`;
                                    return image
                                });
                                jsonData.images = newUrls
                                return jsonData;
                            })
                            .then(loadImageData)

                    }
                }
            })

    })
    .on('plotly_relayout',
        function (eventdata) {

            if (eventdata['yaxis.range[1]'] - eventdata['yaxis.range[0]'] < 500){
                let xvalues = unpack(allRows, currentX).map((ele, index) => {
                    if (ele < eventdata['xaxis.range[1]'] && ele > eventdata['xaxis.range[0]']) {

                        return ele;
                    }
                    return false 
                })
                let yvalues = unpack(allRows, currentY).map((ele, index) => {
                    if (ele < eventdata['yaxis.range[1]'] && ele > eventdata['yaxis.range[0]']) {
                        return ele;
                    }
                    return false
                })
                const currentPoints = xvalues.reduce((acc, cur, index) => {
                    if (cur && yvalues[index]){
                        let obj = {};
                        obj.x = cur;
                        obj.y = yvalues[index];
                        acc.push(obj);
                    }
                    return acc
                }, [])
                let xbounds = {max: eventdata['xaxis.range[1]'], min: eventdata['xaxis.range[0]']}
                let ybounds = { max: eventdata['yaxis.range[1]'] , min: eventdata['yaxis.range[0]']}

                // if(currentPoints.length < 4){
                //     currentPoints.forEach(point => {
                //         make3Dviewer(point, xbounds, ybounds);
                //     })
                // }
            }
        });
}

