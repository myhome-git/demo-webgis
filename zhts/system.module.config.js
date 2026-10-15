/**
 * 系统模块配置索引，用于快速根据模块名称取出相应窗口
 */
var _SYSTEM_MODULE_CONFIG = {
	"system.ssts.url":"ws://192.168.1.100:15674/ws",
	"system.ssts.vhost":"/lbs",
	"system.ssts.user" : "lbs",
	"system.ssts.password" : "lbs@2020",
	"system.connection" : "http://192.168.1.10:6900",
	"system.main" : getProbjectPath()+"/html/main.html",
	"system.logout" : getProbjectPath()+"/login/index.html",
	"system.guojia.image.getById" : getProbjectPath()+"/html/static/images/guojia/{0}.png",
	"module.layui.datetime" : "/layDateTime.html",
	"module.layui.layTransfer" : "/layTransfer.html",
	"module.layui.colorpicker" : "/layuiColorpicker.html",
	"module.file.upload" : "/file.upload/file.upload.html",
	"module.file.upload" : "/file.upload/file.upload.html",
	
	"module.fence.main" : "/system-manage-fence/fence.main.html",
	"module.fence.quyu.add" : "/system-manage-fence/quyu.add.html",
	"module.fence.guize.add" : "/system-manage-fence/guize.add.html",
	"module.taishi.mubiao.fenzu.main" : "/taishi.mubiao.fenzu/main.html",
	"module.taishi.mubiao.fenzu.add" : "/taishi.mubiao.fenzu/main.add.html",
	"module.taishi.mubiao.fenzu.tree" : "/taishi.mubiao.fenzu/main.tree.html",
	
	"module.plot.main" : "/plot/main.html",
	"module.plot.draw.attribute" : "/plot/main.draw.attribute.html",
	"module.baike.main" : "/baike/index.html",
	"module.baike.image.add" : "/baike/main.wuqi.add.html",
	"module.map.fly.coordinate" : "/map.fly.coordinate/index.html",
	"module.taishi.system.set" : "/taishi.system.set/taishi.system.set.window.html",
	"module.system.manage.config" : "/system-manage-config/main.html",
	"module.system.manage.config.layer.add" : "/system-manage-config/main.add.html",
	"module.system.manage.config.ts.wuqi.add" : "/system-manage-config/main.wuqi.add.html",
	"module.zhts.ssts.lsgj.add" : "/zhts.ssts.lsgj/main.html",
	"module.zhts.mubiao.tongxintaishi.echarts" : "/tongxintaishi.echarts/index.html",
	"module.zhts.mubiao.network.echarts" : "/network.echarts/index.html",
	"module.zhts.mubiao.shixutu.main" : "/taishi.shixutu.echarts/index.html",
	"module.zhts.wuqi.xiaoneng.main" : "/wuqi.xiaoneng/main.html",
	
	"http.system.manage.config.layer.insert" : "/data-server/api/layerManager/insertData",
	"http.system.manage.config.layer.update" : "/data-server/api/layerManager/updateData",
	"http.system.manage.config.layer.delete" : "/data-server/api/layerManager/deleteData",
	"http.system.manage.config.layer.pager" : "/data-server/api/layerManager/getLbsMapLayersPagerData",
	"http.system.manage.config.layer.getById" : "/data-server/api/layerManager/getLbsMapLayerById",
	"http.system.manage.config.layer.getEnabledLayers" : "/data-server/api/layerManager/getMapLayers",
	"http.system.manage.config.ts.wuqi.insert" : "/data-server/ts/wq/insertData",
	"http.system.manage.config.ts.wuqi.update" : "/data-server/ts/wq/updateData",
	"http.system.manage.config.ts.wuqi.delete" : "/data-server/ts/wq/deleteData",
	"http.system.manage.config.ts.wuqi.pager" : "/data-server/ts/wq/getWqPagerData",
	"http.system.manage.config.ts.wuqi.getById" : "/data-server/ts/wq/getWqById",
	"http.system.manage.config.ts.wuqi.icon.insert" : "/data-server/ts/wqIcon/insertData",
	"http.system.manage.config.ts.wuqi.icon.update" : "/data-server/ts/wqIcon/updateData",
	"http.system.manage.config.ts.wuqi.icon.delete" : "/data-server/ts/wqIcon/deleteData",
	"http.system.manage.config.ts.wuqi.icon.pager" : "/data-server/ts/wqIcon/getWqPagerData",
	"http.system.manage.config.ts.wuqi.icon.getIconById" : "/data-server/ts/wqIcon/getIconById",
	"http.system.manage.config.ts.wuqi.icon.getIconsByWqId" : "/data-server/ts/wqIcon/getIconsByWqId",
	
	"http.system.manage.config.ts.mb.media.insert" : "/data-server/mbJbqk/insertData",
	"http.system.manage.config.ts.mb.media.update" : "/data-server/mbJbqk/updateData",
	"http.system.manage.config.ts.mb.media.delete" : "/data-server/mbJbqk/deleteData",
	"http.system.manage.config.ts.mb.media.pager" : "/data-server/mbJbqk/getMbPagerData",
	"http.system.manage.config.ts.mb.media.getIconById" : "/data-server/mbJbqk/getIconById",
	"http.system.manage.config.ts.mb.media.getIconsByMbId" : "/data-server/mbJbqk/getIconsByMbId",
	
	"http.zhts.ssts.mubiaofenzu.tree.add" : "/data-server/sstsMbGroupInfoTree/save",
	"http.zhts.ssts.mubiaofenzu.tree.getList" : "/data-server/sstsMbGroupInfoTree/queryAllTree",
	"http.zhts.ssts.mubiaofenzu.add" : "/data-server/sstsMbGroupInfo/save",
	"http.zhts.ssts.mubiaofenzu.update" : "/data-server/sstsMbGroupInfo/save",
	"http.zhts.ssts.mubiaofenzu.delete" : "/data-server/sstsMbGroupInfo/delete",
	"http.zhts.ssts.mubiaofenzu.getById" : "/data-server/sstsMbGroupInfo/fetchById",
	"http.zhts.ssts.mubiaofenzu.pager" : "/data-server/sstsMbGroupInfo/querySstsMbGroupInfoByPager",
	"http.zhts.ssts.mubiaofenzu.getListAll" : "/data-server/sstsMbGroupInfoTree/queryTree",
	
	"http.zhts.ssts.server.config.add" : "/by-service/userSettingHobby/insertOrUpdate",
	"http.zhts.ssts.server.config.getById" : "/by-service/userSettingHobby/getLastSetting",
	"http.zhts.mubiaodata.getMBBMByName" : "/sjrh-server/sd/dz/getMbmc",
	"http.zhts.mubiaodata.getMBsByDate" : "/data-ssts/tsZhtsEvent/getTsZhtsMbsByDate",
	"http.zhts.ssts.lsgj.getMBDByParam" : "/data-ssts/tsZhtsMb/getTsZhtsMbdByParam",
	"http.zhts.ssts.shijianjilu.add" : "/data-server/tsZhtsEvent/saveTsZhtsEvent",
	"http.zhts.ssts.shijianjilu.update" : "/data-server/tsZhtsEvent/updateTsZhtsEvent",
	"http.zhts.ssts.shijianjilu.delete" : "/data-server/tsZhtsEvent/deleteTsZhtsEvent",
	"http.zhts.ssts.shijianjilu.getById" : "/data-server/tsZhtsEvent/fetchTsZhtsEventById",
	"http.zhts.ssts.mubiaoxiangqing.getById" : "/data-server/mbJbqk/fetchMbBymblbMbmc",
	"http.zhts.ssts.lstxts.getById" : "/data-server/wltlTs/queryWltlTs",
	"http.zhts.ssts.mubiao.shixutu.getById" : "/data-server/tsZhtsMbd/queryMbdByMbbh",	//根据时间查询目标点，包含手段，用于图表显示
	"http.zhts.ssts.mubiao.wangluofenxi.getById" : "/data-server/graph/layout",		//根据类型查询网络分析频率
	"http.zhts.ssts.mubiao.wangluofenxi.table.getById" : "/data-server/networkMeta/queryNetworkMeta",
	"http.zhts.ssts.mubiao.wangluofenxi.table.key.getById" : "/data-server/networkMeta/queryKey",
	"http.zhts.ssts.mubiao.wangluofenxi.shijianxian" : "/data-server/graph/queryNetMetaByParam",	//查询时间线
	
	"http.file.uplaod" : "/data-server/api/uploadFile/upload",
	"http.file.delete" : "/data-server/api/uploadFile/delete",
	"http.file.getById" : "/data-server/api/uploadFile/preview",
	
	"http.dist.getById" : "/data-server/api/lbsDict/getKeyValueByTypeCode",
	"http.satellite.getSatelliteTree":"/data-server/satellite/getSatelliteTree"
};

/**
 * 根据路径取出URL
 * @param {Object} name
 */
function getModuleURL(name){
	let _name = name.toLowerCase();
	return (_SYSTEM_MODULE_CONFIG[_name] || "").replace(/\.html$/, "");
}

/**
 * 根据name取出窗口
 * @param {Object} name
 */
function getModuleWindowByName(name){
	return xUtilBase.getIframeContentWindowById(getModuleURL(name)) || {};
}

/**
 * 根据路径取出窗口
 * @param {Object} url
 */
function getModuleWindowByURL(url){
	return xUtilBase.getIframeContentWindowById(url) || {};
}

/**
 * 根据名称取出窗口，并返回_pageObject
 * @param {Object} name
 */
function getModuleWindowPageObjectByName(name){
	return getModuleWindowByName(name)._pageObject;
}

/**
 * 根据路径取出窗口，并返回_pageObject
 * @param {Object} url
 */
function getModuleWindowPageObjectByURL(url){
	return getModuleWindowByURL(url)._pageObject;
}

/**
 * 自动补充路径
 * @param {Object} module
 */
(function(module,projectName){
	
	let _key,_regExp,_url;
	for(var i in module){
		_key = i.toLowerCase();
		_url = module[i];
//		_regExp = new RegExp("^"+projectName,"i");
		delete module[i];
		
		if(/^system/.test(_key)){
			module[_key] = _url;
		}else if(/^module/.test(_key)){
			module[_key] = projectName+"/html/module"+_url;
		}else if(/^http/.test(_key)){
			module[_key] = _url;
		}
		
//		if(!_regExp.test(_url)){
//			module[_key] = projectName+"/html/module"+_url;
//		}else{
//			module[_key] = _url;
//		}
	}
	
})(_SYSTEM_MODULE_CONFIG,getProbjectPath());
