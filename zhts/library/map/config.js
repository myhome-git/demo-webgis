/**
 * 配置对象，用于配置地图地址和其他通用配置
 */
var CONFIG = {
    HAITU:"http://m1{1-3}.shipxy.com/tile.c?l=Na&m=o&x={x}&y={y}&z={z}",
    HAITU_CHINA:"http://www.ais.msa.gov.cn/MapService?service=wmts&request=gettile&tilematrixset=advsea&tilematrix={z}&tilerow={y}&tilecol={x}&format=image/png&layer=default&style=default&version=1.0.0",
    TDT_RasterUrl: "http://t{0-6}.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=661c60fd0d30694200e0fd7b25bd744a",
    TDT_RasterAnoUrl: "http://t{0-6}.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=661c60fd0d30694200e0fd7b25bd744a",
    TDT_VectorUrl: "http://t{0-6}.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=661c60fd0d30694200e0fd7b25bd744a",
    TDT_VectorAnoUrl: "http://t{0-6}.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=661c60fd0d30694200e0fd7b25bd744a",
    GAODE_Online_RasterUrl: "http://webst0{1-3}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
    GAODE_Online_RasterAnoUrl: "http://webst0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8",
    GAODE_VECTOR: "http://webrd0{1-3}.is.autonavi.com/appmaptile?style=7&lang=zh_cn&size=1&scale=1&x={x}&y={y}&z={z}",
    Google_Url: "http://mt{1-3}.google.cn/vt/lyrs=m@180000000&hl=zh-CN&gl=cn&src=app&s=Gal&x={x}&y={y}&z={z}",
    Google_Terrain: "http://mt{1-3}.google.cn/vt/lyrs=t@132,r@298&hl=zh-CN&gl=cn&src=app&s=Gal&x={x}&y={y}&z={z}",
    Google_RasterAnoUrl:'http://mt{1-3}.google.cn/vt/lyrs=h@298&gl=cn&s=Ga&x={x}&y={y}&z={z}',
    Google_RasterUrl:'http://mt{1-3}.google.cn/vt/lyrs=s@170&gl=cn&s=Gal&x={x}&y={y}&z={z}',
    JIANGTU:"http://222.216.1.141:8061/geoserver/gwc/service/gmaps?layers=basemap:gis_mapgrp&zoom={z}&x={x}&y={y}&format=image/png",
    ChinaOnlineStreetPurplishBlue_Url:'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',
    DEM3_Url: "//assets.agi.com/stk-terrain/world",
    DEM_Url: "http://" + window.location.hostname +":9090/chinadem",
    DATASERVICE:"http://"+window.location.hostname+":8090",
    MQSOCKET: "ws://" + window.location.hostname +":15674/ws",
    APPKEY:""
}
