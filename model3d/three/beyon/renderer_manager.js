function rendererObj(options) {
	if (!defined(options.width)||!defined(options.height)) return undefined;
	var params={
		antialias:defaultValue(options.antialias,true)
	};
	
	var renderer = new THREE.WebGLRenderer(params);
	if(options.domElement){
		options.domElement.appendChild( renderer.domElement );
	}

	renderer.physicallyCorrectLights = true;
	renderer.toneMappingExposure = options.exposure;
	renderer.gammaOutput = true;
	renderer.setPixelRatio( window.devicePixelRatio);
	this._lastW=options.width;
	this._lastH=options.height;
	renderer.setSize( options.width, options.height);
	this._renderer=renderer;
	this._id=defaultValue(options.id,undefined);
	this.baseSceneList=new Map;
	//this._postprocess=defaultValue(options.postprocess,false);
	this._bMouseMove=false;
	this._bLeftClick=true;

}
rendererObj.prototype.addBaseScene = function(options){
	//需要scene自己render
	//if (options.outline==true) this._postprocess=true;

	var id=defaultValue(options.id,this.baseSceneList.size);
	if (this.baseSceneList.has(id)) return undefined;
	options.rendererObj=this;
	var sceneObj=new baseScene(options);	
	this.baseSceneList.set(id,sceneObj);
	if (sceneObj._id==undefined) sceneObj._id=id;
	return sceneObj;
}
rendererObj.prototype.render = function(){
	var renderer=this._renderer;
	//var labelRenderer=this._labelRenderer;
	var scenes=this.baseSceneList;
	//var bRender=!this._postprocess;
	
	renderer.setClearColor( 0xffffff );
	renderer.setScissorTest( false );
	renderer.clear();

	renderer.setClearColor( 0xe0e0e0 );
	renderer.setScissorTest( true );
	var left   = 0;
	var top    = 0;
	scenes.forEach( function( scene ) {
		// set the viewport
		var size=scene.size;
		renderer.setViewport( size.left, size.top, size.width, size.height );
		renderer.setScissor( size.left, size.top, size.width, size.height );	
		scene.render();
		//if(scene._postprocess) renderer.render( scene.scene, scene.camera );
	} );
}
rendererObj.prototype.onMouseMove=function(pos){
	if (this._bMouseMove==false) return false;
	var bR=false;
	this.baseSceneList.forEach( function( scene ) {
		if(!bR) bR=scene.onMouseMove(pos);
	});
	return bR;
}
rendererObj.prototype.onLeftClick=function(pos){
	if (this._bLeftClick==false) return false;
	var bR=false;
	this.baseSceneList.forEach( function( scene ) {
		if(!bR) bR=scene.onLeftClick(pos);
	});
	return bR;
}
rendererObj.prototype.onWindowResize = function(){
	var container=this._renderer.domElement.parentNode;
		
	var w_r=this._lastW/container.offsetWidth;
	var h_r=this._lastH/container.offsetHeight;
	var size={};
	size.left=0; 
	size.top=0;
	size.width=0;
	this.baseSceneList.forEach( function( scene ) {				
		size.left=size.width; 
		size.top=0;
		size.width=scene.size.width/w_r; 
		size.height=scene.size.height/h_r;
		scene.size=size;
	});
	this._lastW=container.offsetWidth;
	this._lastH=container.offsetHeight;
	this._renderer.setSize(container.offsetWidth, container.offsetHeight);
	//this._labelRenderer.setSize(container.offsetWidth, container.offsetHeight);
}

rendererObj.prototype.setDomElement = function(domElement){
	domElement.appendChild( this._renderer.domElement );
	//domElement.appendChild( this._labelRenderer.domElement );
	this.baseSceneList.forEach( function( scene ) {				
		scene.setDomElement(domElement);
	});
}
rendererObj.prototype.setMouseMove = function(enable){
	this._bMouseMove=enable;
}
rendererObj.prototype.setLeftClick = function(enable){
	this._bLeftClick=enable;
}

///rendererManager construct
function rendererManager(options) {
	this.rendererList=new Map;
	this.rendererObj=undefined  //方便大多一个render场景
	this._bMouseMove=true;

}


rendererManager.prototype.onMouseMove = function(pos){
	if (this._bMouseMove==false) return false;
	this.rendererList.forEach( function( rendererObj ) {
		rendererObj.onMouseMove(pos);
	});
}
rendererManager.prototype.onLeftClick = function(pos){
	if (this._bLeftClick==false) return false;
	this.rendererList.forEach( function( rendererObj ) {
		rendererObj.onLeftClick(pos);
	});
}
rendererManager.prototype.setMouseMove = function(enable,renderObj=undefined){	
	if (renderObj==undefined) this._bMouseMove=enable;
	else{
		this._bMouseMove=true;
		renderObj.setMouseMove(enable);
	}
}
rendererManager.prototype.setLeftClick = function(enable,renderObj=undefined){	
	if (renderObj==undefined) this._bLeftClick=enable;
	else{
		this._bLeftClick=true;
		renderObj.setLeftClick(enable);
	}
}
rendererManager.prototype.addRender = function(options){
	if (!defined(options.width)||!defined(options.height)) return false;
	var renderObj=new rendererObj(options);
	var id=defaultValue(options.id,this.rendererList.size);
	if (this.rendererList.has(id)) return false;
	if (renderObj.id==undefined) renderObj._id=id;
	this.rendererList.set(id,renderObj);
	this.renderObj=renderObj;
	return renderObj;
}

rendererManager.prototype.getRender = function(id){
	return this.rendererList.get(id);
}

rendererManager.prototype.render = function(){
	this.rendererList.forEach(function( rendererObj ) {
		rendererObj.render();
	});
}


rendererManager.prototype.onWindowResize = function(){
	this.rendererList.forEach(function( rendererObj ) {
		rendererObj.onWindowResize();
	});
}