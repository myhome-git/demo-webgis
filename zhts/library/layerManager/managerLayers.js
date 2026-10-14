olLayer.prototype = {
    constructor: olLayer,
    // 0是都不显示 1是都显示 2是有显示有不显示
    get visible() {
        if (this.instance.length == 0) {
            return undefined;
        }
        var ret = this.instance[0].getVisible() ? 1 : 0;
        this.instance.forEach(x => {
            var bVis = x.getVisible() ? 1 : 0;
            if (ret !== bVis) {
                return 2;
            }
        });
        return ret;
    },
    set visible(visible) {
        if (this.instance.length == 0) {
            return undefined;
        }
        this.instance.forEach(x => {
            x.setVisible(visible);
            // x.visible = visible;
        });
    },

    addInstance: function (ollayer) {
        this.instance.push(ollayer);
    }
}

function olLayer(node, ollayer) {
    this.id = node.id;
    this.instance = [];
    this.instance.push(ollayer);
}

WMSLayer.prototype = {
    constructor: WMSLayer,
    get visible() {
        if (this.instance.length == 0) {
            return undefined;
        }
        var ret = this.instance[0].getVisible() ? 1 : 0;
        this.instance.forEach(x => {
            var bVis = x.getVisible() ? 1 : 0;
            if (ret !== bVis) {
                return 2;
            }
        });
        return ret;
    },
    set visible(visible) {
        if (this.instance.length == 0) {
            return undefined;
        }
        this.instance.forEach(x => {
            x.setVisible(visible);
        });
    },

    SetWMSLayer: function (layers) {
        if (this.instance.length == 0 || !layers) {
            return;
        }
        this.instance[0].getSource().updateParams({
            "LAYERS": "" + layers
        }); //"LAYERS", "" + layers);
        // this.instance[0].getSource().getParams().LAYERS = layers;
    },

    _initInstance: function () {
        var serverUrl = this.serverUrl;
        var layerGroup = this.layerGroup;

        var instance = new ol.layer.Tile({
            title: layerGroup,
            type: "overlay",
            visible: false,
            source: new ol.source.TileWMS({
                cacheSize: 8192,
                urls: [serverUrl, serverUrl, serverUrl],
                crossOrigin: 'anonymous',
                params: {
                    'FORMAT': "image/png",
                    'VERSION': '1.1.1',
                    tiled: true,
                    STYLES: '',
                    LAYERS: [],
                    // tilesOrigin: ext[0] + "," + ext[1]
                }
            })
        });

        // var instance = new ol.layer.Tile({
        //     source: new ol.source.TileWMS({
        //         urls: [serverUrl, serverUrl, serverUrl],
        //         params: {
        //             'LAYERS': [],
        //             'TILED': true
        //         },
        //         serverType: 'geoserver',
        //         crossOrigin: 'anonymous'
        //     }),
        //     visible: false,
        // });
        this.instance.push(instance);
        return instance;
    },
}

function WMSLayer(node, layerOptions) {
    this.id = node.id;
    this.serverUrl = layerOptions.serverUrl;
    this.layerGroup = layerOptions.layerGroup;
    this.instance = [];
    // this.instance.push(ollayer);
    this._initInstance();
}