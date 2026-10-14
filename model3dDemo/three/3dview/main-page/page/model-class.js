var _XModelArray = [];

function _XModelClass(){
	this.ObjectThis = undefined;
};

(function(_object){
	//指针
	_object.prototype.ObjectThis = undefined;
	
	//3d模型对象交互
	_object.prototype.webObject = {};
	
	//屏幕索引
	_object.prototype.SceneIndex = 0;
	
	//id
	_object.prototype.ModelId = "";
	
	//名称
	_object.prototype.ModelName = "";
	
	//type
	_object.prototype.ModelType = "";
	
	//url
	_object.prototype.ModelUrl = "";
	
	//相机状态
	_object.prototype.CameraRotateSwitch = false;
	
	//当前模式状态，参谋、飞行、打击
	_object.prototype.ModelViewState = "CommanderView";
	
	//中文，当前用户模式
	_object.prototype.ModelViewStateName = "指挥员模式";
	
	//绑定数据
	_object.prototype.ChildrenModelBindData = {};
	
	//模型列表数据
	_object.prototype.ModelNeiMaDatalist = [];
	
	//模型内部子节点，不是从接口返回的数据，直接从模型内取出
	_object.prototype.ModelChildrenArray = [];
	
	//模型中英文替换对象
	_object.prototype.ChildrenCodeArray = [];
	
	//子模型点击后的节点名，为了删除上次节点，所以需要存起来
	_object.prototype.NodeName = "";
	
	//当前如果是用户模式的话，可能需要处理其它地方的点击事件
	_object.prototype.isThisUserView = true;
	
	//模型中英文替换对象
	_object.prototype.GetChildrenChinese = function(code){
		code = code || "";
		for(var i=0;i<this.ChildrenCodeArray.length;i++){
			if(code===this.ChildrenCodeArray[i]["src"]){
				return this.ChildrenCodeArray[i]["new"];
			}
		}
		return code;
	}
	
	//生成模型子节点列表，用来查询子模型装备内码
	_object.prototype.InitModelData = function(_array){
		function QueryChildrenModelId(_array){
			$.each(_array, function(index,el) {
				if(el.zbnm){
					_object.prototype.ModelNeiMaDatalist.push({
						"text" : el.text,
						"ID" : el.zbnm
					});
				}
				if(el.children){
					QueryChildrenModelId(el.children);
				}
			});
			
		}
		QueryChildrenModelId(_array);
	}
	
	//获取模型内部动画列表
	_object.prototype.GetModelPalyNodeList = function(){
		var _scene=this.webObject.scenes.get(this.SceneIndex);
		var _list = [];
	    if(!_scene)return null;
	    if(_scene&&_scene.animationCtrlMap.has(this.ModelId)){
	        var animationCtrl=_scene.animationCtrlMap.get(this.ModelId);
	        var _map = animationCtrl.nodeActions;
	        _map.forEach(function(key,value){
	        	_list.push({
	        		key : key,
	        		value : value
	        	});
	        })
	    }
	    return _list;
	}
	
	//判断子模型是否有装备内码ID
	_object.prototype.ChildrenModelIsId = function(name){
		if(this.ModelNeiMaDatalist.indexOf(name)>-1){
			return true;
		}
		return false;
	}
	
	//设置data
	_object.prototype.SetChildModelData = function(data){
		return this.ChildrenModelBindData = data;
	}
	
	//取出data
	_object.prototype.GetChildModelData = function(){
		return this.ChildrenModelBindData;
	}
	
	//检测是否是子节点
	_object.prototype.IsFlag = function(){
		return this.ChildrenModelBindData["isflag"]=="1";
	}
	
	//取出动画名称
	_object.prototype.GetPlayActionName = function(){
		var _dh = this.ChildrenModelBindData["zmx"]["zmxdhmap"] || [];
		if(_dh.length<1){
			return "";
		}
		_dh = _dh[0];
		return _dh["dhmc"];
	}
	
	//清除屏幕label
	_object.prototype.ClearScenesLabel = function(){
		this.webObject.hideAllLabel(this.SceneIndex);
	}
	
	//检测模型是否载入
	_object.prototype.IsLoad = function(){
		return this.webObject.isLoad(this.SceneIndex,this.ModelId)
	}
	
	//检测是否第一次载入
	_object.prototype.HasScene = function(){
		return this.webObject.hadModelInScene(this.SceneIndex);
	}
	
	//创建模型
	_object.prototype.CreateModel = function(){
		
		var _arguments = formatArguments(arguments),
		
			_object = _arguments["object"],
			
			_func = _arguments["function"];
			
		var _default = {
			materialEffect: {
				metalness: 0,
				roughness: 0.5
			},
			backGroundType: SceneBackgroundModel.PICTURE
		};		
		try{
			$.extend(true, _default, data.modelConfig);
		}catch(e){
			//TODO handle the exception
		}
		
		try{
			$.extend(true, _default, _object);
		}catch(e){
			//TODO handle the exception
		}
		
		//
		switch (this.ModelType) {
			case "海":
				_default.backGroundType=SceneBackgroundModel.WATER;
				break;
			case "陆":
				_default.backGroundType=SceneBackgroundModel.PICTURE;
				break;
			case "空":
				_default.backGroundType=SceneBackgroundModel.BOX;
				break;
		}
		this.webObject.addModel(this.SceneIndex, this.ModelUrl, this.ModelId, _func, _default);
	}
	
	//从模型内取出子节点列表
	_object.prototype.GetModelChildrenArray = function(){
		//return false;
		var _this = this;
		_this.ModelChildrenArray = [];
		var modelArray = this.webObject
							.scenes.get(this.SceneIndex)
							.modelManager.getModel(this.ModelId) || {};
		
		function gettemp(modelArray){
			if(modelArray.children && x.getObjectType(modelArray.children)=="array"){
				$.each(modelArray.children, function(x,children) {
					_this.ModelChildrenArray.push(children);
					gettemp(children);
				});
			}
		}
		gettemp(modelArray);
	}
	
	
	
	
	//移除模型
	_object.prototype.RemoveModel = function(){
		var baseScene=this.webObject.scenes.get(this.SceneIndex);
    	if(!baseScene)return false;
    	var modelManager=baseScene.modelManager;	
    	if(modelManager.currentShowModel){
    		this.webObject.remove(this.SceneIndex,modelManager.currentShowModel.id);
    	}
	}
	
	
	//显示模型
	_object.prototype.ShowModel = function(){
		this.webObject.setShow(this.SceneIndex,this.ModelId,true);
	}
	
	//显示模型视图对应标牌
	_object.prototype.ShowModelViewLabel = function(labelClass){
		this.ClearChildrenModelHighlight();
		this.ClearChildrenModelAllLabel();
		
		this.ModelViewState = labelClass || this.ModelViewState;
		
		var nodeArray = [];
		var data = [];
		if(this.ModelViewState=="Default-Close"){
			/*
			var data = this.ChildrenCodeArray;
			$.each(data, function(index,el) {
				nodeArray.push(el.src);
			});
			*/
			var modelArray = this.webObject
								.scenes.get(this.SceneIndex)
								.modelManager.getModel(this.ModelId) || {};
			
			if(modelArray.children && modelArray.children.length>0){
				data = modelArray.children[0].children;
				$.each(data, function(index,el) {
					nodeArray.push(el.name);
				});
			}
		}else{
			data = _XModelClassConfig.GetModelViewData(this.ModelId,this.ModelViewState);
			$.each(data, function(index,el) {
				nodeArray.push(el.nodeName);
			});
		}
		
		if(nodeArray.length>0){
			this.SetChildrenModelHighlight(nodeArray);
			this.ShowLabels(nodeArray);
		}else{
			this.RestoreChildrenModelAlpha();
		}
	}
	
	//定位模型root
	_object.prototype.MoveModelPositionRoot = function(func){
		this.webObject.locateNode(this.SceneIndex,this.ModelId,2000,"RootNode",true,func);
	}
	
	//子模型定位,其中func是回调函数
	_object.prototype.MoveModelPosition = function(func){
		//子模型
		var _obj = this.ChildrenModelBindData["zmx"]["zmxzcmap"];
		_obj = _obj[0];
		this.webObject.locateNode(this.SceneIndex,this.ModelId,2000,_obj["zcbz"],true,func);
	}
	
	//取出子模型节点源名称，只能用在左侧或者已经绑定data数据
	_object.prototype.GetChildModelNodeName = function(){
		if(this.isFlag()===false){
			return false;
		}
		var _obj = this.ChildrenModelBindData["zmx"]["zmxzcmap"];
		_obj = _obj[0] || {};
		return _obj["zcbz"];
	}
	
	//显示数组label
	_object.prototype.ShowLabels = function(_array,isShow=false){
		var _this = this;
		if(!_this.webObject.scenes.get(_this.SceneIndex).modelManager.getModel(_this.ModelId)){
			return;
		}
		var nodeNames = [];
		$.each(_array, function(index,el) {
			/*
			if(_this.ChildrenModelIsId(_this.GetChildrenChinese(el))===true){
				_this.HttpGetLabel(el,isShow);
			}else{
				_this.webObject.showLabel(_this.SceneIndex,_this.ModelId,el,true,_this.GetChildrenChinese(el),undefined,500,isShow);
			}
			*/
			
			var $dom = $(el);
			if($dom instanceof HTMLElement){
				$dom = $dom.get(0);
			}else{
				$dom = _this.GetChildrenChinese(el);
			}
			_this.webObject.showLabel(_this.SceneIndex,_this.ModelId,el,true,$dom,undefined,500,isShow);
		});
		
	}
	
	//显示数组label
	_object.prototype.ShowElementLabels = function(_array,isShow=false){
		var _this = this;
		if(!_this.webObject.scenes.get(_this.SceneIndex).modelManager.getModel(_this.ModelId)){
			return;
		}
		var nodeNames = [];
		$.each(_array, function(index,el) {
			var _node = el.node;
			var $dom = $(el.element);
			$dom = $dom.get(0);
			if($dom instanceof HTMLElement){
				
			}else{
				$dom = _this.GetChildrenChinese(el);
			}
			_this.webObject.showLabel(_this.SceneIndex,_this.ModelId,_node,true,$dom,undefined,500,isShow);
		});
		
	}
	
	//请求label接口
	_object.prototype.HttpGetLabel = function(nodeName,isShow){
		
		var _this = this;
		
		//临时调试属性
		var _len = Math.floor(Math.random()*4+1);
		var datalist = [];
		
		for(var i=0;i<_len;i++){
			var _int = parseInt(Math.random()*(1000-1)+1);
			datalist.push({
				name : "测试"+i,value : _int+"米"
			});
		}
		
		var data = {
			run : true,
			datalist : datalist,
			nodeName : _this.GetChildrenChinese(nodeName)
		}
		
		var _html = template("TemplateChildModelInfoPanel",data);
		_this.webObject.showLabel(_this.SceneIndex,_this.ModelId,nodeName,true,$(_html).get(0),undefined,500,isShow);
		return;
		
		x.ajax({
			url : "http://127.0.0.1:8090/web3d/css/light.css",
			success : function(ret){
				
			},
			error : function(){
				//_this.webObject.showLabel(_this.SceneIndex,_this.ModelId,nodeName,true,nodeName,undefined,500,isShow);
			},
			complete : function(){
				//临时调试属性
				var _len = Math.floor(Math.random()*4+1);
				var datalist = [];
				
				for(var i=0;i<_len;i++){
					var _int = parseInt(Math.random()*(1000-1)+1);
					datalist.push({
						name : "测试"+i,value : _int+"米"
					});
				}
				
				var data = {
					run : true,
					datalist : datalist,
					nodeName : _this.GetChildrenChinese(nodeName)
				}
				
				var _html = template("TemplateChildModelInfoPanel",data);
				_this.webObject.showLabel(_this.SceneIndex,_this.ModelId,nodeName,true,$(_html).get(0),undefined,500,isShow);
			}
		});
	}
	
	
	//控制巡游
	_object.prototype.SetModelControlCameraRotateSwitch = function(bPatrol=true){
		this.webObject
			.scenes.get(this.SceneIndex)
			.modelManager
			.patrolObject(this.ModelId,bPatrol,Math.PI/30);
		this.CameraRotateSwitch = bPatrol;
		this.ModelViewState = "TourModel";
		if(this.CameraRotateSwitch){
			this.ClearChildrenModelHighlight();
			this.ClearChildrenModelAllLabel();
			this.RestoreChildrenModelAlpha();
		}else{
			this.ShowModelViewLabel();
		}
		
	}
	
	//设置旋转
	_object.prototype.SetModelRotation = function(_boolean){
		
		var $doc = $("#control-panel"),
		
			$input = $doc.find("li[name='rotation'] input[type='checkbox']"),
			
			_inputHTML = $input.prop("outerHTML").toLowerCase();
		
		if(/checked/.test(_inputHTML) && !_boolean){
			
			$input.removeAttr("checked");
			
			$input.trigger("click");
			
		}else if(!(/checked/.test(_inputHTML)) && _boolean){
			
			$input.trigger("click");
			
		}
		return this;
		
	}
	
	/**
	 * 给子模型增加标签,如果传入dom，则表示自定义表格或element，offset是标签位置
	 * 如果不传dom和offset则采用默认方式
	 * @param {Object} _this
	 * @param {Object} dom
	 * @param {Object} offset
	 */
	_object.prototype.ShowLabel = function(_this,dom,offset){
		if(_this.IsFlag()===false){
			return false;
		}
		
		//不能使用this，如果设定了回调，这个this有可能指向不是class本身，将不可控
		var _obj = this.ChildrenModelBindData["zmx"]["zmxzcmap"];
		_obj = _obj[0] || {};
		if(!dom){
			dom = this.GetChildrenChinese(_obj["zcbz"]);
		}else if(dom instanceof HTMLElement){
			
		}
		
		//临时调试属性
		var datalist = [{
			name : "距离",value : parseInt(Math.random()*100+1)+"千米"
		},{
			name : "动力",value : parseInt(Math.random()*1000+1)+"马力"
		},{
			name : "范围",value : parseInt(Math.random()*100+1)+"千米"
		}];
		datalist = [];
		data = {
			run : true,
			datalist : datalist,
			nodeName : _XModelClass0.GetChildrenChinese(dom)
		}
		
		var _html = template("TemplateChildModelInfoPanel",data);
		dom = $(_html).get(0);
		this.webObject.showLabel(this.SceneIndex,this.ModelId,_obj["zcbz"],true,dom,offset);
	}
	
	//关闭标签
	_object.prototype.ClearLabel = function(text){
		//子模型
		var _obj = this.ChildrenModelBindData["zmx"]["zmxzcmap"];
		_obj = _obj[0];
		var name = text || _obj["zcbz"];
		this.webObject.showLabel(this.SceneIndex,this.ModelId,name,false);
	}
	
	//清除所有label
	_object.prototype.ClearChildrenModelAllLabel = function(){
		this.webObject
			.scenes.get(this.SceneIndex)
			.labelManager
			.clearAllLabel();
	}
	
	//选中多个子模型,带透明效果
	_object.prototype.SetChildrenModelHighlight = function(_array=[]){
		//_array ["A_ANAPY-9雷达","B_机翼1"]
		//0x84c98
		this.webObject
			.scenes.get(this.SceneIndex)
			.modelManager
			.setObjectAlphaColor(this.ModelId,0.00001,new THREE.Color(0x84c98),undefined,[],_array);
		this.webObject
			.highlight(this.SceneIndex,this.ModelId,_array,true);
	}
	
	//重置子模型透明度
	_object.prototype.RestoreChildrenModelAlpha = function(_array=[]){
		this.webObject.scenes.get(this.SceneIndex).modelManager.restoreObjectAlphaColor(this.ModelId);
	}
	
	//取消所有子模型高亮
	_object.prototype.ClearChildrenModelHighlight = function(){
		this.webObject.scenes.get(this.SceneIndex).modelManager.clearHighlight();
	}
	
	
	//高亮模型
	_object.prototype.Highlight = function(_array=[]){
		//子模型
		var _obj = this.ChildrenModelBindData["zmx"]["zmxzcmap"];
		var _p =_array;
		for(var i=0;i<_obj.length;i++){
			_p.push(_obj[i]["zcbz"]);
		}
		this.webObject.highlight(this.SceneIndex,this.ModelId,_p,true);
	}
	 
	//播放模型动画
	_object.prototype.PlayModelAction = function(){
		//模型动画
		var dh = this.ChildrenModelBindData["zmx"]["zmxdhmap"];
		dh = dh[0] || {};
		this.webObject.playAction(this.SceneIndex,this.ModelId,dh["dhmc"],parseInt(dh["dhksz"]),parseInt(dh["dhjsz"]));
	}
	
	//播放子模型动画
	_object.prototype.PlayNodeAction = function(){
		
		//停止所有动画
		this.webObject.playAction(this.SceneIndex,this.ModelId,"Take 001",0,1000,false,100);
		
		//模型动画
		var dh = this.ChildrenModelBindData["zmx"]["zmxdhmap"];
		dh = dh[0] || {};
		//_webObject.playNodeAction(0,"040100300000000539","B_左侧全动平尾",9,10,true,1,true);
		this.webObject.playNodeAction(this.SceneIndex,this.ModelId,dh["dhmc"],parseInt(dh["dhksz"]),parseInt(dh["dhjsz"]),true,1,true);
	}
	
	//解析子模型形状
	_object.prototype.FormatNodeNameToShape = function(NodeName){
		NodeName = this.GetChildrenChinese(NodeName);
		var name = "";
		if(NodeName.indexOf("雷达")>-1){
			name = "cylinder";
		}
		return name;
	}
	
	//子模型示意范围
	_object.prototype.AddDrawObject = function(NodeName){
		this.NodeName = NodeName;
		var chape = this.formatNodeNameToShape(NodeName);
		if(chape!=""){
			this.webObject.addDrawObject(this.SceneIndex,this.ModelId,NodeName,NodeName,this.drawOptions[chape]);
		}
		
	}
	
	_object.prototype.RemoveDrawObject  = function(NodeName){
		NodeName = NodeName || this.NodeName;
		this.webObject.removeDrawObject(this.SceneIndex,NodeName);
	}
	
	_object.prototype.AnimateDraw = function (NodeName,bPlay,type,duration) {
		NodeName = NodeName || this.NodeName;
		this.webObject.animateDraw(this.SceneIndex,NodeName,bPlay,type,duration);
	}
	
	//模型控制
	_object.prototype.ShowOperateCtrl = function(obj){
		this.webObject.showOperateCtrl(this.SceneIndex,obj);
	}
	
	//
	_object.prototype.SetModelProperty = function(data){
		this.webObject.setModelProperty(this.SceneIndex,this.ModelId,data);
	}
	
	
	//判断定位数据是否有效
	_object.prototype.IsModelPositionExist = function(){
		//子模型
		var _obj = this.ChildrenModelBindData["zmx"]["zmxzcmap"];
		if(_obj.length<1){
			return false;
		}
		return true;
	}
	
	//到文本长度，用来兼容检测
	_object.prototype.ToTextLength = function(obj){
		obj = obj + "";
		if(obj=="undefined"){
			obj = "";
		}
		return obj.length;
	}
	
	//判断动画数据是否有效
	_object.prototype.IsModelPlayActionExist = function(){
		var dh = this.ChildrenModelBindData["zmx"]["zmxdhmap"];
		if(dh.length<1){
			return false;
		}
		
		dh = dh[0];
		if(this.ToTextLength(dh["dhmc"])<1 || this.ToTextLength(dh["dhksz"])<1 || this.ToTextLength(dh["dhjsz"])<1){
			return false;
		}
		
		return true;
	}
	
	_object.prototype.drawOptions = {
		//圆柱形
		cylinder : {
			type: 'cylinder',
			name: 'RadarScanning',
			euler: {
				x: 0,
				y: 0,
				z: Math.PI / 2
			},
			geometry: {
				radiusTop: 0,
				radiusBottom: 50,
				height: 100,
				radialSegments: 25,
				heightSegments: 5,
				openEnded: false,
				thetaStart: 0,
				thetaLength: Math.PI * 2,
				centerIsTop: true
			},
			material: {
				color: 0xffffff,
				transparent: true,
				opacity: 0.6,
				side: THREE.DoubleSide,
				emissive: 0x072534
			},
			wireframe: {
				color: 0xffffff,
				transparent: true,
				opacity: 0.6,
			}
		},
		//圆形
		sphere : {
			type:'sphere',
			name:'sphere',
			geometry:{
				radius:1,
				widthSegments:8,        
				heightSegments:6,
				phiStart:0,
				phiLength:Math.PI * 2,
				thetaStart:0,
				thetaLength:Math.PI,
			},
			material:{
				color:0xffffff,
				transparent:true,
				opacity:0.6,
				side:THREE.DoubleSide,
				emissive:0x072534
			},
			wireframe:{
				color:0xffffff,
				transparent:true,
				opacity:0.6,
			}
		}
	};
	
})(_XModelClass);


//获取对象类型
function typeOf(_object){
	return Object.prototype.toString.call(_object).toLocaleLowerCase().replace(/(^\[object\s*)(.*)(\]$)/, "$2");
}

//格式化参数
function formatArguments(b) {
	for(var a = {}, d = 0; d < b.length; d++) {
		var f = b[d],
			h = this.typeOf(f);
		if(void 0 === a[h]) a[h] = f;
		else {
			for(var g = 0; void 0 != a[h + g];) g += 1;
			a[h + g] = f
		}
	}
	return a;
};