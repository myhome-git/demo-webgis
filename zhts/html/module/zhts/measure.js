/**
 * Currently drawn feature.
 * @type {ol.Feature}
 */
var sketch;


/**
 * The help tooltip element.
 * @type {Element}
 */
var helpTooltipElement;


/**
 * Overlay to show the help messages.
 * @type {ol.Overlay}
 */
var helpTooltip;


/**
 * The measure tooltip element.
 * @type {Element}
 */
var measureTooltipElement;


/**
 * Overlay to show the measurement.
 * @type {ol.Overlay}
 */
var measureTooltip;


/**
 * Message to show when the user is drawing a polygon.
 * @type {string}
 */
var continuePolygonMsg = '点击继续绘制多边形';


/**
 * Message to show when the user is drawing a line.
 * @type {string}
 */
var continueLineMsg = '点击继续绘制线';

var draw;
var typeSelect, geodesicCheckbox;
var wgs84Sphere;
var measureflag = false;

/**
 * 测量组件
 */
var Measurement = function (map, layer) {

    // wgs84Sphere = new ol.Sphere(6378137);

    map.on('pointermove', pointerMoveHandler);

    map.getViewport().addEventListener('mouseout', function () {
        helpTooltipElement.classList.add('hidden');
    });
    typeSelect = document.getElementById('measuretype');
    typeSelect.onchange = function () {
        map.removeInteraction(draw);
        addInteraction(map, layer);
    };
    geodesicCheckbox = document.getElementById('geodesic');
    addInteraction(map, layer);
};

function disableMeasure(map) {
    if (draw) {
        var status = $("#stopmeasureBtn").data("status");
        if (status == 1) {
            var arr = $(".tooltip2");
            arr.each(function () {
                var tip = $(this);
                var clsname = tip[0].className;
                if (clsname.indexOf(" ") == -1) {
                    tip.val("");
                }
            })
        }
        map.removeInteraction(draw);
        map.un("pointermove", pointerMoveHandler);
    }
}

function onchangeHandler(map, layer, obj) {
    typeSelect = obj;
    map.removeInteraction(draw);
    addInteraction(map, layer);
}


function addInteraction(map, layer) {
    var type = (typeSelect.value == 'area' ? 'Polygon' : 'LineString');
    var source = layer.getSource();
    draw = new ol.interaction.Draw({
        source: source,
        type: /** @type {ol.geom.GeometryType} */ (type),
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.5)',
                lineDash: [10, 10],
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.7)'
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                })
            })
        })
    });
    map.addInteraction(draw);

    createMeasureTooltip(map);
    createHelpTooltip(map);

    var listener;
    draw.on('drawstart',
        function (evt) {
            // set sketch
            sketch = evt.feature;

            /** @type {ol.Coordinate|undefined} */
            var tooltipCoord = evt.coordinate;

            listener = sketch.getGeometry().on('change', function (evt) {
                var geom = evt.target;
                var output;
                if (geom instanceof ol.geom.Polygon) {
                    output = formatArea(geom, map);
                    tooltipCoord = geom.getInteriorPoint().getCoordinates();
                } else if (geom instanceof ol.geom.LineString) {
                    output = formatLength(geom, map);
                    tooltipCoord = geom.getLastCoordinate();
                }
                measureTooltipElement.innerHTML = output;
                measureTooltip.setPosition(tooltipCoord);
            });
        }, this);

    draw.on('drawend',
        function () {
            measureTooltipElement.className = 'tooltip2 tooltip-static';
            measureTooltip.setOffset([0, -7]);
            // unset sketch
            sketch = null;
            // unset tooltip so that a new one can be created
            measureTooltipElement = null;
            createMeasureTooltip(map);
            ol.Observable.unByKey(listener);
        }, this);
};


/**
 * Handle pointer move.
 * @param {ol.MapBrowserEvent} evt The event.
 */
function pointerMoveHandler(evt) {
    if (evt.dragging) {
        return;
    }
    /** @type {string} */
    var helpMsg = '点击开始绘制';

    if (sketch) {
        var geom = (sketch.getGeometry());
        if (geom instanceof ol.geom.Polygon) {
            helpMsg = continuePolygonMsg;
        } else if (geom instanceof ol.geom.LineString) {
            helpMsg = continueLineMsg;
        }
    }

    helpTooltipElement.innerHTML = helpMsg;
    helpTooltip.setPosition(evt.coordinate);
    helpTooltipElement.classList.remove('hidden');
};



/**
 * Format length output.
 * @param {ol.geom.LineString} line The line.
 * @return {string} The formatted length.
 */
function formatLength(line, map) {
    // var length;
    // if (geodesicCheckbox.checked) {
    //     var coordinates = line.getCoordinates();
    //     length = 0;
    //     var sourceProj = map.getView().getProjection();
    //     for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
    //         var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
    //         var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
    //         length += wgs84Sphere.haversineDistance(c1, c2);
    //     }
    // } else {
    //     length = Math.round(line.getLength() * 100) / 100;
    // }
    // var output;
    // if (length > 100) {
    //     output = (Math.round(length / 1000 * 100) / 100) +
    //         ' ' + 'km';
    // } else {
    //     output = (Math.round(length * 100) / 100) +
    //         ' ' + 'm';
    // }


    var length = ol.sphere.getLength(line);
        var output;
        if (length > 100) {
          output = (Math.round(length / 1000 * 100) / 100) +
              ' ' + 'km';
        } else {
          output = (Math.round(length * 100) / 100) +
              ' ' + 'm';
        }
    return output;
};


/**
 * Format area output.
 * @param {ol.geom.Polygon} polygon The polygon.
 * @return {string} Formatted area.
 */
function formatArea(polygon, map) {
    // var area;
    // if (geodesicCheckbox.checked) {
    //     var sourceProj = map.getView().getProjection();
    //     var geom = /** @type {ol.geom.Polygon} */ (polygon.clone().transform(
    //         sourceProj, 'EPSG:4326'));
    //     var coordinates = geom.getLinearRing(0).getCoordinates();
    //     area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
    // } else {
    //     area = polygon.getArea();
    // }
    // var output;
    // if (area > 10000) {
    //     output = (Math.round(area / 1000000 * 100) / 100) +
    //         ' ' + 'km<sup>2</sup>';
    // } else {
    //     output = (Math.round(area * 100) / 100) +
    //         ' ' + 'm<sup>2</sup>';
    // }
    // return output;

    var area = ol.sphere.getArea(polygon);
    var output;
    if (area > 10000) {
      output = (Math.round(area / 1000000 * 100) / 100) +
          ' ' + 'km<sup>2</sup>';
    } else {
      output = (Math.round(area * 100) / 100) +
          ' ' + 'm<sup>2</sup>';
    }
    return output;
};


/**
 * Creates a new measure tooltip
 */
function createMeasureTooltip(map) {

    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'tooltip2 tooltip-measure';
    measureTooltip = new ol.Overlay({
        element: this.measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
    });
    map.addOverlay(measureTooltip);
};

/**
 * Creates a new help tooltip
 */
function createHelpTooltip(map) {
    if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }
    helpTooltipElement = document.createElement('div');
    helpTooltipElement.className = 'tooltip2 hidden';
    helpTooltip = new ol.Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left'
    });
    map.addOverlay(helpTooltip);
}