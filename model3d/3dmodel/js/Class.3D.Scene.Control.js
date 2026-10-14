rendererObj.prototype.addBaseScene = function(options){
	//需要scene自己render
	//if (options.outline==true) this._postprocess=true;

	var id=defaultValue(options.id,this.baseSceneList.size);
	if (this.baseSceneList.has(id)) return this.baseSceneList.get(id);
	options.rendererObj=this;
	var sceneObj=new baseScene(options);	
	this.baseSceneList.set(id,sceneObj);
	if (sceneObj._id==undefined) sceneObj._id=id;
	return sceneObj;
}

//屏幕控制Class
function ClassSceneControl(){
	
	//初始化外部Class
	this.InitLinkClass = function(__class){
		
		this.__linkClass = __class;
		
		this.__sceneIndex = this.__linkClass.SceneIndex;
		
	}
	
	//获取外部Class
	this.GetLinkClass = function(){
		
		return this.__linkClass;
		
	}
	
	//获取外部控制器对象
	this.GetLinkControl = function(){
		
		return this.GetLinkClass().webObject;
		
	}
	
	//获取外部屏幕对象
	this.GetLinkScene = function(){
		
		return this.GetLinkControl().scenes.get(this.__sceneIndex);
		
	}
	
	//获取屏幕渲染器
	this.GetLinkSceneRendererManager = function(){
		
		return this.GetLinkControl().rendererManager;
		
	}
	
	//获取renderer,可以用来获取参数
	this.GetSceneRenderer = function(){
		
		return this.GetLinkSceneRendererManager().getRender(this.__sceneIndex)._renderer;
		
	}
	
	//检测屏幕是否初始化
	this.HasScene = function(){
		
		return this.GetLinkControl().hadModelInScene(this.__sceneIndex);
		
	}
	
	//屏幕初始化，索引和document
	this.CreateScene = function(_index,$doc,_option){
		
		var _linkControl = this.GetLinkControl();
		
		var _scene = _linkControl.scenes.get(_index);
		
		if(_scene){
			
			return;
			
		}
		
		$doc = $doc instanceof jQuery ? $doc : ($doc ? $doc = $($doc) : undefined);
		
		if(_index===undefined || $doc === undefined){
			
			return false;
			
		}
		
		
		
		var _default = {};
		
		$.extend(true, _default, _linkControl.sceneDefaultOptions);
		
		$.extend(true, _default, _option);
		
		_linkControl.createScene(_index,$doc.get(0),_default);
		
		this.__sceneIndex = _index;
		
		return this;
		
	}
	
	//更新屏幕背景
	this.SetSceneBackground = function(_index,_func){
		
		this.GetLinkScene().sceneBackground.changedBG(_index);
		
		if(_func){
			
			_func();
			
		}
		
		return this;
		
	}
	
	//获取gamma
	this.GetSceneGamma = function(){
		
		return this.GetSceneRenderer().gammaOutput;
		
	}
	
	//设置gamma
	this.SetSceneGamma = function(_boolean){
		
		this.GetSceneRenderer().gammaOutput = _boolean;
		
		return this;
		
	}
	
	//设置场景曝光
	this.SetToneMappingExposure = function(_num){
		
		if(typeof _num == "undefined"){
			
			_num = 1.5;
			
		}
		
		this.GetSceneRenderer().toneMappingExposure = _num;
		
		return this;
		
	}
	
	this.GetToneMappingExposure = function(){
		
		return this.GetSceneRenderer().toneMappingExposure;
		
	}
	
	//设置环境强度
	this.SetAmbientIntensity = function(_num){
		
		//暂时屏蔽
		return this;
		
		if(typeof _num == "undefined"){
			
			_num = 1.5;
			
		}
		
		this.GetLinkScene().lightCollection.AmbientLight.intensity = _num;
		
		return this;
		
	}
	
	this.GetAmbientIntensity = function(){
		
		return this.GetLinkScene().lightCollection.AmbientLight.intensity;
		
	}
	
	//设置环境颜色
	this.SetAmbientColor = function(_num){
		
		if(!_num) return this;
		
		this.GetLinkScene().lightCollection.AmbientLight.color = new THREE.Color(_num) || new THREE.Color(0xffffff);
		
		return this;
		
	}
	
	this.GetAmbientColor = function(){
		
		return this.GetLinkScene().lightCollection.AmbientLight.color.toJSON();
		
	}
	
	//事件绑定
	this.AddEventListener = function(_type,_func){
		
		var _scene = this.GetLinkScene();
		
		if(_scene){
			
			_scene.addListener(_type,_func);
			
		}
		
	}
	
	//临时调试
	this.TempRun = function(){
		
		return this;
		
	}
	
	//class默认初始化
	this.Init = function(){
		//_sceneIndex
	}
	
	this.Init();
	
}
