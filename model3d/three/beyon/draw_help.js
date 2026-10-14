function drawManager(baseScene) {
    BeyonManager.call(this);
    
    this._baseScene=baseScene;


        //删除单个元素
    this.removeDrawObject = function(id) {
        if(!this.has(id))return;
        var drawObj=this.getObject(id);
        if(this._baseScene.animationCtrlMap.has(drawObj)){
            var ac=this._baseScene.animationCtrlMap.get(drawObj);
            ac.dispose();
        }
        this.remove(id);

    }
    
}
//原型继承
drawManager.prototype = new BeyonManager();
//将自身指针指向自己的构造函数
drawManager.prototype.constructor = drawManager;

drawManager.prototype.addDrawObject=function(id,type,name,parentNode,drawParams){
    if(this.has(id))return this.getObject(id);
    var drawObj;
    if(name==undefined)name=id;
    if(parentNode&&parentNode.isObject3D){
        drawObj=new THREE.DrawInstance(name,type,parentNode,drawParams);
    }else if(!parentNode){
        drawObj=new THREE.DrawInstance(name,type,this._baseScene.scene,drawParams);
    }
    if(drawObj)
    {
        this.add(id,drawObj);
        parentNode.add(drawObj);    
    }
    //初始化旋转角度
    if(drawParams.euler){
        drawObj.rotation.x+=drawParams.euler.x;
        drawObj.rotation.y+=drawParams.euler.y;
        drawObj.rotation.z+=drawParams.euler.z;
    }
    return drawObj;
}

drawManager.prototype.animateDraw=function(id,play,type,duration){
    if(!this.has(id))return;
    var drawObj=this.getObject(id);
    if(!this._baseScene.animationCtrlMap.has(drawObj)){
        var ac=new animationCtrl(drawObj);
        var track=ac.generateNodeTrack(drawObj,'quaternion',type,duration);
        var clip=new THREE.AnimationClip(drawObj.name+type,duration,[track]);
        ac.addAnimationClip(clip);
        ac.playAction(drawObj.name+type,type,9999);
        this._baseScene.animationCtrlMap.set(drawObj,ac);
    }else{
        var ac=this._baseScene.animationCtrlMap.get(drawObj);
        var action=ac.getAnimationClip(drawObj.name+type);
        if(!action){
            var track=ac.generateNodeTrack(drawObj,'quaternion',type,duration);
            var clip=new THREE.AnimationClip(drawObj.name+type,duration,[track]);
            ac.addAnimationClip(clip);
        }
        ac.playAction(drawObj.name+type,play,9999);
    }  
    
}


//绘制对象，继承Object3D
//

//THREE.DrawInstance=function(base_scene,offset=undefined){
THREE.DrawInstance=function(name,type,parentNode,drawParams){
    THREE.Group.call( this );
    this.name=name;
    this._type=type;
    this._parentNode=parentNode;

    if('sphere'===type){
        this.drawSphere(drawParams);
    }else if('cylinder'===type){
        this.drawCylinder(drawParams);
    }

    //this._parentNode.add(this);
    //执行销毁
    var scope=this;
    this.removeSelf=function(){
        scope._parentNode.remove(scope);
        for(var i=0;i<scope.children.length;i++){
            var child=scope.children[i];
            if(child.geometry)child.geometry.dispose();
            if(child.material)child.material.dispose();
        }
    }
    
}


THREE.DrawInstance.prototype = Object.create( THREE.Group.prototype );
THREE.DrawInstance.prototype.constructor = THREE.DrawInstance;

/*
var drawParams={
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
*/
THREE.DrawInstance.prototype.drawSphere= function (options) {
    var ops=options||{};
    //geometry
    var geometryParams=ops.geometry||{
        radius:10,
        widthSegments:25,        
        heightSegments:25,
        phiStart:0,
        phiLength:Math.PI * 2,
        thetaStart:0,
        thetaLength:Math.PI,
    }
    var radius=defaultValue(geometryParams.radius,1);
    var widthSegments=defaultValue(geometryParams.widthSegments,24);
    var heightSegments=defaultValue(geometryParams.heightSegments,12); 
    var phiStart=defaultValue(geometryParams.phiStart,0); 
    var phiLength=defaultValue(geometryParams.phiLength,Math.PI*2);
    var thetaStart=defaultValue(geometryParams.thetaStart,0);
    var thetaLength=defaultValue(geometryParams.thetaLength,Math.PI);
    var geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength);

    //meshMaterial
    var materialParams=ops.material||{
        color:0xff0000,
        transparent:true,
        opacity:0.6,
        side:THREE.DoubleSide,
        emissive:0x072534,
    }
    var color=defaultValue(materialParams.color,0xffffff);
    var transparent=defaultValue(materialParams.transparent,true);
    var opacity=defaultValue(materialParams.opacity,0.6); 
    var side=defaultValue(materialParams.side,THREE.DoubleSide); 
    var emissive=defaultValue(materialParams.emissive,0x072534);
    var meshMaterial=new THREE.MeshPhongMaterial({ 
                            color: color, 
                            emissive: emissive, 
                            side:side, 
                            flatShading: true,
                            opacity: opacity,
		                    transparent: transparent
                        });
    var sphere = new THREE.Mesh(geometry, meshMaterial);
    this.add(sphere);                    
    //是否绘制边框线
    if(ops.wireframe){
        var color=defaultValue(ops.wireframe.color,0xffffff);
        var transparent=defaultValue(ops.wireframe.transparent,true);
        var opacity=defaultValue(ops.wireframe.opacity,0.8); 
        var lineMaterial = new THREE.LineBasicMaterial( { color:color, transparent:transparent, opacity:opacity} );
        var line=new THREE.LineSegments( geometry, lineMaterial );
        this.add(line);
    }
}



/*
var drawParams={
    geometry:{
        radiusTop:0,
        radiusBottom:50,
        height:100,        
        radialSegments:25,
        heightSegments:5,
        openEnded:false,
        thetaStart:0,
        thetaLength:Math.PI*2,
        centerIsTop:true
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
*/
THREE.DrawInstance.prototype.drawCylinder= function (options) {
    var ops=options||{};
    //geometry
    var geometryParams=ops.geometry||{
        radiusTop:0,
        radiusBottom:50,
        height:100,        
        radialSegments:25,
        heightSegments:5,
        openEnded:false,
        thetaStart:0,
        thetaLength:Math.PI*2,
        centerIsTop:true
    };
    var radiusTop=defaultValue(geometryParams.radiusTop,0);
    var radiusBottom=defaultValue(geometryParams.radiusBottom,50);
    var height=defaultValue(geometryParams.height,100);
    var radialSegments=defaultValue(geometryParams.radialSegments,25); 
    var heightSegments=defaultValue(geometryParams.heightSegments,5); 
    var openEnded=defaultValue(geometryParams.openEnded,false);
    var thetaStart=defaultValue(geometryParams.thetaStart,0);
    var thetaLength=defaultValue(geometryParams.thetaLength,Math.PI*2);
    var centerIsTop=defaultValue(geometryParams.centerIsTop,true);
    var geometry = new THREE.CylinderBufferGeometry(radiusTop,radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength,centerIsTop);

    //meshMaterial
    var materialParams=ops.material||{
        color:0xff0000,
        transparent:true,
        opacity:0.6,
        side:THREE.DoubleSide,
        emissive:0x072534,
    }
    var color=defaultValue(materialParams.color,0xffffff);
    var transparent=defaultValue(materialParams.transparent,true);
    var opacity=defaultValue(materialParams.opacity,0.6); 
    var side=defaultValue(materialParams.side,THREE.DoubleSide); 
    var emissive=defaultValue(materialParams.emissive,0x072534);
    var meshMaterial=new THREE.MeshPhongMaterial({ 
                            color: color, 
                            emissive: emissive, 
                            side:side, 
                            flatShading: true,
                            opacity: opacity,
		                    transparent: transparent
                        });
    var cone = new THREE.Mesh(geometry, meshMaterial);
    this.add(cone);                    
    //是否绘制边框线
    if(ops.wireframe){
        var color=defaultValue(ops.wireframe.color,0xffffff);
        var transparent=defaultValue(ops.wireframe.transparent,true);
        var opacity=defaultValue(ops.wireframe.opacity,0.8); 
        var lineMaterial = new THREE.LineBasicMaterial( { color:color, transparent:transparent, opacity:opacity} );
        var line=new THREE.LineSegments( geometry, lineMaterial );
        this.add(line);
    }
}