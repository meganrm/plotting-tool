const VolumeViewer = require('volume-viewer');
const viewer = document.getElementById('viewer');
import control from 'control-panel';
let mainview3D = new VolumeViewer.AICSview3d(viewer);

export function make3Dviewer(point, xbounds, ybounds) {
    const viewerContainer = document.getElementById('zoom-viewers')

    const newViewer = document.createElement('div');
    newViewer.id = `${point.x}-${point.y}`;
    newViewer.classList.add('little-viewer')
    newViewer.style.position = 'absolute';
    newViewer.style.right = ((point.x - xbounds.min)/(xbounds.max - xbounds.min)) + 'px';
    newViewer.style.top = ((point.y - ybounds.min) / (ybounds.max - ybounds.min)) + 'px';

    viewerContainer.appendChild(newViewer)
    let view3D = new VolumeViewer.AICSview3d(newViewer);

    loadImageData(imgdata, view3D)
}

const defaultColors = [
    [226, 205, 179],
    [111, 186, 17],
    [141, 163, 192],
    [245, 241, 203],
    [224, 227, 209],
    [221, 155, 245],
    [227, 244, 245],
    [255, 98, 0],
    [247, 219, 120],
    [249, 165, 88],
    [218, 214, 235],
    [235, 26, 206],
    [36, 188, 250],
    [111, 186, 17],
    [167, 151, 119],
    [207, 198, 207],
    [249, 165, 88],
    [247, 85, 67],
    [141, 163, 192],
    [152, 176, 214],
    [17, 168, 154],
    [150, 0, 24],
    [253, 219, 2],
    [231, 220, 190],
    [226, 205, 179],
    [235, 213, 210],
    [227, 244, 245],
    [240, 236, 221],
    [219, 232, 209],
    [224, 227, 209],
    [222, 213, 193],
    [136, 136, 136],
    [240, 224, 211],
    [244, 212, 215],
    [247, 250, 252],
    [213, 222, 240],
    [87, 249, 235]
];


const getColorByChannelIndex = (index) => {
    return defaultColors[index] ? defaultColors[index] : [141, 163, 192];
};

const colorFromArray = (val) => {
    return 'rgb(' + val[0] + ',' + val[1] + ',' + val[2] + ')'
}

function onChannelDataReady(){

}
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
const defaultChannels = [0,1,2]

export function loadImageData(jsondata, ele) {
    let view3D = ele ? ele: mainview3D;
    view3D.resize();
    const aimg = new VolumeViewer.AICSvolumeDrawable(jsondata, "test");


    var inputs = [
        { type: 'range', label: 'brightness', min: 0, max: 3, initial: 1 },
        { type: 'range', label: 'density', min: 0, max: 1, initial: 0.1 },
        { type: 'checkbox', label: 'maxProject', initial: false }
    ]

    aimg.channel_names.forEach(function (d, i) {
        var colors = [colorFromArray(getColorByChannelIndex(i)), colorFromArray(getColorByChannelIndex(i))]
        inputs.push({ type: 'multibox', label: d, count: 2, names: ['volume', 'surface'], colors: colors, initial: [i, false] })
    })

    var panel = control(inputs, { theme: 'dark', position: 'top-right', width: '250px' })

    view3D.setCameraMode('3D');
    view3D.setImage(aimg, onChannelDataReady);
    aimg.setDensity(0.1);
    aimg.setBrightness(1.0);
    aimg.setUniform('maxProject', 0, true, true)

    aimg.channel_names.forEach(function (d, i) {
        aimg.updateChannelColor(i, getColorByChannelIndex(i))
    })

    panel.on('input', function (data) {
        aimg.setBrightness(data['brightness'])
        aimg.setDensity(data['density'])
        aimg.setUniform('maxProject', data['maxProject'] ? 1 : 0, true, true)

        aimg.channel_names.forEach(function (d, i) {
            aimg.setVolumeChannelEnabled(i, data[d][0])
            if (aimg.hasIsosurface(i)) {
                if (!data[d][1]) {
                    aimg.destroyIsosurface(i)
                }
            }
            else {
                if (data[d][1]) {
                    aimg.createIsosurface(i, 50, 1);
                }
            }
        })
        aimg.fuse()
    })
}
