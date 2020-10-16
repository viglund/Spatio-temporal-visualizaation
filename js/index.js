/*jshint esversion: 6 */

import {
  initPanel
} from './panel.js';

import $ from "jquery";
import 'ol/ol.css';
import 'ol-layerswitcher/src/ol-layerswitcher.css';
import '../css/main.css';



import {
  Map,
  View
} from 'ol';
import {
  getWidth,
  getTopLeft
} from 'ol/extent.js';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import OSM from 'ol/source/OSM';
import {
  Draw,
  Modify,
  Snap
} from 'ol/interaction.js';
import {
  Vector as VectorSource
} from 'ol/source.js';
import {
  Circle as CircleStyle,
  Fill,
  Stroke,
  Style
} from 'ol/style.js';
import {
  get as getProjection
} from 'ol/proj.js';
import {
  register
} from 'ol/proj/proj4.js';
import proj4 from 'proj4';
import WMTS from 'ol/source/WMTS.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import {
  defaults as defaultControls
} from 'ol/control.js';
import MousePosition from 'ol/control/MousePosition.js';
import {
  Zoom,
  ZoomSlider,
  ZoomToExtent,
  Attribution
} from 'ol/control.js';
import {
  createStringXY
} from 'ol/coordinate.js';
import {
  Image as ImageLayer,
  Vector as VectorLayer
} from 'ol/layer.js';
import ImageWMS from 'ol/source/ImageWMS.js';
import GeoJSON from 'ol/format/GeoJSON';
import Observable from 'ol/Observable';
import LayerGroup from 'ol/layer/Group';
import LayerSwitcher from 'ol-layerswitcher';
import Swal from 'sweetalert2';

var drawNr = 0;
var chooseGeometryId = null;
var maxArea = 20000; // dekar

var key;

var backgroundUrl = "https://opencache.statkart.no/gatekeeper/gk/gk.open_wmts"; // OPEN WMTS first
var backgroundUrlNib = "https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm33_wmts_v2"; // OPEN WMTS first

  $.ajax({
  url: '/map/token.jsp',
  contentType: "application/json",
  dataType: "text",
  success: function (data, textStatus, jqXHR) {
    var result = jQuery.parseJSON( data );
    if (result.key) {
      key = result.key;
      backgroundUrl = "https://gatekeeper{1-3}.geonorge.no/BaatGatekeeper/gk/gk.cache_wmts?gkt="+key;
      backgroundUrlNib = "https://gatekeeper{1-3}.geonorge.no/BaatGatekeeper/gk/gk.nib_utm33_wmts_v2?gkt="+key;
    }
    function createNewSource(layerName) {
      var newSource = new WMTS({
        url: backgroundUrl,
        crossOrigin: 'Anonymous',
        layer: layerName,
        matrixSet: 'EPSG:25833',
        format: 'image/png',
        projection: projection,
        tileGrid: new WMTSTileGrid({
          origin: getTopLeft(mapExtent),
          resolutions: resolutions,
          matrixIds: matrixIds
        }),
        style: 'default',
        extent: mapExtent,
      });
      return newSource;
    }
    var newSourceNib = new WMTS({
      url: backgroundUrlNib,
      crossOrigin: 'Anonymous',
      layer: 'Nibcache_UTM33_EUREF89_v2',
      matrixSet: 'default028mm',
      format: 'image/png',
      projection: projection,
      tileGrid: new WMTSTileGrid({
        origin: getTopLeft(mapExtent),
        resolutions: resolutions,
        matrixIds: matrixIds_nib
      }),
      style: 'default',
      extent: mapExtent,
    });
    graatone.setSource(createNewSource('topo4graatone'));
    farger.setSource(createNewSource('topo4'));
    raster.setSource(createNewSource('toporaster3'));
    norgeibilder.setSource(newSourceNib);
   },
   error: function(jqXHR, textStatus, errorThrown) {
     //Error handling code
     console.log('Kunne ikke hente token fra kartverket, bruker opencache');
   }

});


  proj4.defs("EPSG:25833", "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
  register(proj4);
  //var projection = ol.proj.get('EPSG:32633');
  var projection = getProjection('EPSG:25833');
  var mapExtent = [-2500000.0, 3500000.0, 3045984.0, 9045984.0];
  var resolutions = [21664,
    10832,
    5416,
    2708,
    1354,
    677,
    338.5,
    169.25,
    84.625,
    42.3125,
    21.15625,
    10.578125,
    5.2890625,
    2.64453125,
    1.322265625,
    0.6611328125,
    0.33056640625,
    0.165283203125
  ];
  var matrixIds = new Array(resolutions.length);
  var matrixIds_nib = new Array(resolutions.length);
  for (var z = 0; z < resolutions.length; ++z) {
    matrixIds[z] = 'EPSG:25833:' + z;
    matrixIds_nib[z] = z;
  }



  // Background raster
  var graatone = new TileLayer({
    title: 'Gråtone',
    id: 'GRAATONE',
    type: 'base',
    source: new WMTS({
      // url: "http://opencache.statkart.no/gatekeeper/gk/gk.open_wmts",
      url: backgroundUrl,
      crossOrigin: 'Anonymous',
      layer: 'topo4graatone',
      matrixSet: 'EPSG:25833',
      format: 'image/png',
      projection: projection,
      tileGrid: new WMTSTileGrid({
        origin: getTopLeft(mapExtent),
        resolutions: resolutions,
        matrixIds: matrixIds
      }),
      style: 'default',
      extent: mapExtent,
    })
  });

  var farger = new TileLayer({
    title: 'Farger',
    id: 'FARGER',
    type: 'base',
    source: new WMTS({
      // url: "http://opencache.statkart.no/gatekeeper/gk/gk.open_wmts",
      url: backgroundUrl,
      crossOrigin: 'Anonymous',
      layer: 'topo4',
      matrixSet: 'EPSG:25833',
      format: 'image/png',
      projection: projection,
      tileGrid: new WMTSTileGrid({
        origin: getTopLeft(mapExtent),
        resolutions: resolutions,
        matrixIds: matrixIds
      }),
      style: 'default',
      extent: mapExtent,
    })
  });


  var norgeibilder = new TileLayer({
    title: 'Norge i bilder',
    id: 'flybilder',
    type: 'base',
    source: new WMTS({
      url: backgroundUrlNib,
      crossOrigin: 'Anonymous',
      layer: 'Nibcache_UTM33_EUREF89_v2',
      matrixSet: "default028mm",
      format: 'image/jpeg',
      projection: projection,
      tileGrid: new WMTSTileGrid({
        origin: getTopLeft(mapExtent),
        resolutions: resolutions,
        matrixIds: matrixIds_nib
      }),
      style: 'default',
      extent: mapExtent,
    })
  });
  var raster = new TileLayer({
    title: 'Raster',
    id: 'RASTER',
    type: 'base',
    source: new WMTS({
      // url: "http://opencache.statkart.no/gatekeeper/gk/gk.open_wmts",
      url: backgroundUrl,
      crossOrigin: 'Anonymous',
      layer: 'toporaster3',
      matrixSet: 'EPSG:25833',
      format: 'image/png',
      projection: projection,
      tileGrid: new WMTSTileGrid({
        origin: getTopLeft(mapExtent),
        resolutions: resolutions,
        matrixIds: matrixIds
      }),
      style: 'default',
      extent: mapExtent,
    })
  });







var mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(0),
  projection: 'EPSG:25833',
  // comment the following two lines to have the mouse position
  // be placed within the map.
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),
  undefinedHTML: 'UTM 33'
});

var zoomOptions = {
  className: 'map-zoom',
  zoomInLabel: '',
  zoomOutLabel: '',
  zoomInTipLabel: 'Zoom in',
  zoomOutTipLabel: 'Zoom out',
};

var zoomSliderOptions = {
  className: 'ol-zoomslider'
};
var extentOptions = {
  extent: [-2175810,5823784,2933018,8628631],
  tipLabel: 'Zoom til hele Norge',
  label: '',
  className: 'mapExtent'
};

var source = new VectorSource();
var vector = new VectorLayer({
  source: source,
  style: new Style({
    fill: new Fill({
      color: 'rgba(255, 0, 0, 0.2)'
    }),
    stroke: new Stroke({
      color: '#ff0000',
      width: 2
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: '#ff0000'
      })
    })
  })
});


const map = new Map({
  controls: [
    new Zoom(zoomOptions),
    new ZoomSlider(zoomSliderOptions),
    new ZoomToExtent(extentOptions),
    new Attribution({
      collapsible: false,
      collapsed: false
    }),
    mousePositionControl
  ],
  target: 'map',

  layers: [
        new LayerGroup({
            'title': 'Backgroud',
            layers: [
                new TileLayer({
                    title: 'OSM',
                    type: 'base',
                    visible: true,
                    source: new OSM()
                }),
                raster,
                norgeibilder,
                farger,
                graatone
            ]
        }),
        new LayerGroup({
            title: 'PT kartlag',
            layers: [


              new ImageLayer({
                title: 'pt 1999',
                //extent: [-1280314, 6154666, 2080314, 8513334],
                opacity: 1,
                visible:false,
                //maxResolution: 10,
                source: new ImageWMS({
                  projection: projection,
                  url: '/kart10test',
                  crossOrigin: 'Anonymous',
                  params: {
                    'LAYERS': 'sl:1999'
                  }
                })
              }),
              new ImageLayer({
                title: 'pt 2009',
                //extent: [-1280314, 6154666, 2080314, 8513334],
                opacity: 1,
                visible:false,
                //maxResolution: 10,
                source: new ImageWMS({
                  projection: projection,
                  url: '/kart10test',
                  crossOrigin: 'Anonymous',
                  params: {
                    'LAYERS': 'sl:2009'
                  }
                })
              }),
              new ImageLayer({
                title: 'pt 2019',
                //extent: [-1280314, 6154666, 2080314, 8513334],
                opacity: 1,
                //maxResolution: 10,
                source: new ImageWMS({
                  projection: projection,
                  url: '/kart10test',
                  crossOrigin: 'Anonymous',
                  params: {
                    'LAYERS': 'pt:2019'
                  }
                })
              }),
              vector
            ]
        })
    ],
  view: new View({
    projection: projection,
    center: [378604, 7226208],
    zoom: 6,
    maxZoom: 20,
    minZoom: 6
  })
});

var layerSwitcher = new LayerSwitcher();
  map.addControl(layerSwitcher);




/*function setStyle(sid) {
  getFeature(sid).setStyle(new Style({
    stroke: new Stroke({
      color: 'rgba(255,0,0,1)',
      width: 5
    }),
    fill: new Fill({
      color: 'rgba(255,0,0,0.7)'
    }),
    image: new CircleStyle({
      radius: 10,
      stroke: new Stroke({
        color: 'rgba(255,255,255,1)',
        width: 5
      }),
      fill: new Fill({
        color: '#ff0000'
      })
    })
  }));
}*/





//Change size on map
setMapSize();
//debugger;
function setMapSize() {

  //var infoWidth = Math.round((window.innerWidth / 3) - 10);
  //var mapWidth = Math.round((window.innerWidth / 3) * 2);
  var mapWidth = window.innerWidth;
  var mapHeight = window.innerHeight;

  $('#map').css({
    width: mapWidth + 'px',
    height: mapHeight + 'px'
  }); // change OpenLayers map *container* size
  map.setSize([mapWidth, mapHeight]); // adjust the map's size
  map.updateSize();

}

window.onresize = function(event) {
  setMapSize();
};

$(document).ready(function() {

  $('#open_info_button').click(function() {
    initPanel();
  });

  initPanel();

});
