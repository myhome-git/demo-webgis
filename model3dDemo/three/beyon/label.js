
function LabelManager(base_scene){
    BeyonManager.call(this);
    //map(id,label)
    //this.collection=new Map();
    //map(modelid+nodename,labelid)
    this.nodeLabelList=new Map();
    this.base_scene=base_scene;  

    this._parentDomElement=base_scene._renderer.domElement.parentElement;
    this._size=this.base_scene._size;
    //添加一个cssrender
    this.addCSSRender=function(parentDomElement,size,b3d=false){
        if(!defined(parentDomElement))parentDomElement=this._parentDomElement;
        if(!defined(size))size=this._size;
        if(b3d){
            this._css3dRender=new THREE.CSS3DRenderer();
            this._css3dRender.setSize(size.width,size.height);
            this._css3dRender.domElement.className='css2drenderDom';
            this._css3dRender.domElement.style.position = 'absolute';
            this._css3dRender.domElement.style.top = size.top+"px";	
            this._css3dRender.domElement.style.left = size.left+"px";            
            parentDomElement.appendChild( this._css3dRender.domElement );
        }else{
            this._css2dRender=new THREE.CSS2DRenderer();
            this._css2dRender.setSize(size.width,size.height);
            this._css2dRender.domElement.className='css2drenderDom';
            this._css2dRender.domElement.style.position = 'absolute';
            this._css2dRender.domElement.style.top = size.top+"px";	
            this._css2dRender.domElement.style.left = size.left+"px";
            parentDomElement.appendChild( this._css2dRender.domElement );
        }        
    }


    this.dispose=function(){
        this.collection.forEach(function(label){
            label.dispose();
        });
        this.base_scene=null;
    }
    this.ModelProperty ={};

}

//原型继承
LabelManager.prototype = new BeyonManager();
//将自身指针指向自己的构造函数
LabelManager.prototype.constructor = LabelManager;

LabelManager.prototype.registe_service=function(){
    //添加Poplabel  参数有顺序

    serviceParams=[
            {key:"id",value:"need"},
            {key:"info",value:"need"},
            {key:"position",value:"need"},
            {key:"offset",value:"option"},
            {key:"matrix",value:"option"},
            {key:"animateTime",value:"option"},
            {key:"clearOthe",value:"option"},
            {key:"callback",value:"option"}  
        
        ]
    this.add_service("addPopLabel",serviceParams);
}

LabelManager.prototype.clearAllLabel=function(){
	if(!_webObject.lockScene){
		this.collection.forEach(function(label){
			label.show(false);
		});
	}
	return true
    
}



//render setting
LabelManager.prototype.setRenderSize=function(size){
    if(this._css2dRender){
        this._css2dRender.setSize( size.width, size.height);
        this._css2dRender.domElement.style.top = size.top+"px";	
        this._css2dRender.domElement.style.left = size.left+"px";	
    }
    if(this._css3dRender){
        this._css3dRender.setSize( size.width, size.height);
        this._css3dRender.domElement.style.top = size.top+"px";	
        this._css3dRender.domElement.style.left = size.left+"px";	
    }
}
LabelManager.prototype.setDomElement=function(domElement){
    if(this._css2dRender){
        domElement.appendChild( this._css2dRender.domElement );
    }
    if(this._css3dRender){
        domElement.appendChild( this._css3dRender.domElement );	
    }
}


LabelManager.prototype.render=function(scene,camera){
    for(var [id,label] of this.collection){
        //实时刷新暂时去掉
        label.update();
        if(label._needDestroy){
            this.collection.delete(id);
        }
    }
    if(this._css2dRender)  this._css2dRender.render(scene,camera );
    if(this._css3dRender)  this._css3dRender.render(scene,camera );
}


// LabelManager.prototype.addInfoLabel=function(id,info,pos,offset,clearOther=true){
//     //信息标牌，只显示一个时
//     if(clearOther){
//         this.collection.forEach(function(label){
//             label.show(false);
//         });
//     }
//     var label=undefined;
//     if(this.collection.has(id)){
//         label=this.collection.get(id);
//     }else{
//         //信息标牌，2d标牌，不绑定空间位置，始终为屏幕位置
//         var options={
//             b3d:false,
//             b3dPos:false,
//             camera:this.base_scene.camera,
//             scene:this.base_scene.scene,
//             position:pos,
//             windowOffset:offset
//         }
//         //info为Div
//         if(info instanceof HTMLElement){
//             options.div=info;
//         }
//         label=new THREE.Label(options);
//         if(label.b3dLabel&&!defined(this._css3dRender))
//         {
//             this.addCSSRender(undefined,undefined,true);
//         }else if(!defined(this._css2dRender)){
//             this.addCSSRender(undefined,undefined,false);
//         }
//         this.base_scene.scene.add(label);
//         this.collection.set(id,label);
//     }
//     label.setPosition(pos);
//     label.setOffset(offset,undefined,true);
//     label.setContent(info);
//     label.show(true);
//     return label;   
// }

LabelManager.prototype.addPopLabel=function(id,info,pos,offset,matrix=new THREE.Matrix4(),popTime=500,clearOther=true,cb){
    //信息标牌，只显示一个时
    if(clearOther){
        for(var [id,label] of this.collection){
            label.show(false);
            if(label._needDestroy){
                this.remove(id);
            }
        }
    }
    var label=undefined;
    if(this.has(id)){
        label=this.getObject(id);
    }else{
        var scope=this;
        //信息标牌，2d标牌，不绑定空间位置，始终为屏幕位置
        var options={
            id:id,
            manager:scope,
            //是否是3d标牌
            b3d:false,
            //是否绑定空间位置
            b3dPos:true,
            camera:this.base_scene.camera,
            scene:this.base_scene.scene,
            position:pos,
            offset:offset,
            popTime:popTime,
            matrix:matrix
        }

        label=new THREE.PopLabel(options);
        if(label.b3dLabel&&!defined(this._css3dRender))
        {
            this.addCSSRender(undefined,undefined,true);
        }else if(!defined(this._css2dRender)){
            this.addCSSRender(undefined,undefined,false);
        }
        this.base_scene.scene.add(label);
        label.updateMatrixWorld();
        this.add(id,label);
    }
    label.setContent(info);
    // var oriPos=label.position.clone();
    // oriPos.project( this.base_scene.camera );
    // var winOffset=this.autoGetWindowOffset(new THREE.Vector2(oriPos.x,oriPos.y));
    // //转成世界坐标
    // label._offset=new THREE.Vector3();
    // label._offset.x=winOffset.x;label._offset.y=winOffset.y;label._offset.z=0.5;
    // label._offset.unproject(this.base_scene.camera );
    // label.updateMatrix();
    // //强制更新
    // label.updateMatrixWorld();
    // label.worldToLocal(label._offset);
    label.initAfter(cb);
    //label.show(true);
    return label;   
}

LabelManager.prototype.getNodeCurrentPos=function(modelObj,nodeName){
    var pos=new THREE.Vector3();
    if(modelObj){
        var node=modelObj.getObjectByName(nodeName);
        if(node) return node.getWorldPosition(pos);
    }
    return null;
}
//自动计算标牌位置
//原则：从原点往一个方向偏移，自动计算屏幕空白位置
LabelManager.prototype.autoGetWindowOffset=function(originPos,vect=new THREE.Vector2(1,1),step=0.1){
    var baseScene=this.base_scene;
    var bCal=true;
    vect.normalize();
    var dis=THREE.Vector2();
    while(bCal){
        var vec=vect.clone();
        vec.multiplyScalar(step);
        dis=originPos.add(vec);
        if(!baseScene.rayPick(dis))
            bCal=false;
        else{
            step+=step;
        }
        if(Math.abs(dis.x)>0.9||Math.abs(dis.y)>0.9)
            bCal=false;
    }
    return dis;
}
LabelManager.prototype.calAutoOffset=function(object3d,localOffset){
    var boundingSphere=this.base_scene.calculateBoundingSphere(object3d);
    if(boundingSphere){
        var offset=new THREE.Vector3();
		offset.x=(boundingSphere.radius)*Math.sin(Math.PI/4);
        offset.y=(boundingSphere.radius)*Math.sin(Math.PI/4);
        if(localOffset){
            offset.add(localOffset);
        }
        return offset;
    }
    else return null;
}
// //模型节点标牌
// LabelManager.prototype.addNodeLabel=function(modelID,nodeName,clearOther=true){
//     if(clearOther){
//         this.collection.forEach(function(label){
//             label.show(false);
//         });
//     }
//     if(this.nodeLabelList.has(modelID+nodeName))
//     {
//         var labelID=this.nodeLabelList.get(modelID+nodeName);
//         var model=this.base_scene.modelManager.getModel(modelID);
//         var pos=this.getNodeCurrentPos(model,nodeName);
//         if(defined(pos)){
//             var node=model.getObjectByName(nodeName);
//             var offset=this.calAutoOffset(node,new THREE.Vector3(3,3,0));
//             if(pos.x<model.position.x)offset.x=-offset.x;            
//             this.setPosition(labelID,pos,offset)
//             this.showLabel(labelID,true);
//         }
//     }else{
//         var obj=this.base_scene.modelManager.getObject(modelID);
//         var model=obj.scene;
//         if(model){
//             var pos=this.getNodeCurrentPos(model,nodeName);
//             if(defined(pos)){
//                 var node=model.getObjectByName(nodeName);
//                 var offset=this.calAutoOffset(model,new THREE.Vector3(3,3,0));
//                 if(pos.x<model.position.x)offset.x=-offset.x;
//                 var id=THREE.Math.generateUUID();            
//                 this.nodeLabelList.set(modelID+nodeName,id);
//                 var info=nodeName;
//                 if(obj.nodeNameMap){
//                     var info=obj.nodeNameMap.has(info)?obj.nodeNameMap.get(info):info;
//                 }	
//                 return this.addInfoLabel(id,info,pos,offset);
//             }            
//         }
//         return null;
//     }
    
// }

LabelManager.prototype.showLabel=function(id,bShow){
    if(this.collection.has(id))
        this.collection.get(id).show(bShow);
}



LabelManager.prototype.setPosition=function(id,pos,offset){
    if(this.collection.has(id))
        this.collection.get(id).setPosition(pos,offset);
}

//标牌对象，继承Object3D
//标牌对象，继承Object3D+
THREE.Label=function(){
    THREE.Object3D.call( this );
    //标记标牌是否是3d标牌,默认平面
    this.b3dLabel=false;
    //标记标牌是否绑定空间位置，针对2d标牌，默认true
    this.b3dPos=true;
    //引用相机
    this._camera=undefined;

    //this.visible=true;

    //线
    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( 2 * 3 ), 3 ) );
    matLine =new THREE.LineBasicMaterial( {
        color: new THREE.Color(0,127/255,127/255),
        opacity: 0.7,
        linewidth: 3
        } ) ;

    this._lineObject = new THREE.Line( geometry, matLine); 
    var scope=this;

    this.add(this._lineObject);
    //保存一个文字div避免重复创建
    this._textDiv=document.createElement('div');
    this._textDiv.className = 'label';
    //this._textDiv.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';
    //this._textDiv.style.marginTop = '-1em';
//  this._textDiv.style.position = 'absolute';
//  this._textDiv.style.display="none";
//  this._textDiv.style.border = "1px solid rgb(0,127,127)";
//  this._textDiv.style.fontSize = "28px";
//  this._textDiv.style.color = 'rgb(21,240,6)';
    
    //展示内容物件
    this._contentObject=undefined;

    //设置下本地坐标
    //线偏移末点，本地坐标
    this._offset=undefined;

    //保存一个屏幕偏移位置,固定屏幕位置时使用
    this._windowOffset=undefined;

    this._needDestroy=false;

    this.dispose=function(){
        this._lineObject.geometry.dispose();
        this._lineObject.material.dispose();
        this.remove(this._lineObject);
        this.remove(this._contentObject);
        if(this._textDiv&&this._textDiv.parentNode)this._textDiv.parentNode.removeChild(this._textDiv);
        this._textDiv=undefined;
    }
}

THREE.Label.prototype = Object.create( THREE.Object3D.prototype );
THREE.Label.prototype.constructor = THREE.Label;
//
THREE.Label.prototype.init=function(options){
    this.labelId=options.id;
    this.manager=options.manager;
    if(options.matrix) this.matrix=options.matrix;
    if(options.camera)this._camera=options.camera;
    if(options.scene)this._scene=options.scene;
    if(options.b3d!=undefined)    
        this.b3dLabel=options.b3d;
    if(options.b3dPos!=undefined) 
        this.b3dPos=options.b3dPos;

    if(options.position){
        this.position.set(options.position.x,options.position.y,options.position.z);
    }    
    //内容标牌
    if(options.div){
        this._labelDiv=options.div;
    }else{
        this._labelDiv=this._textDiv;
    }
    // if(this.b3dLabel){
    //     this._contentObject = new THREE.CSS3DObject( this._labelDiv );
    // }else{
    //     this._contentObject = new THREE.CSS2DObject( this._labelDiv );
    // }
    // this.add( this._contentObject);

    //设置下本地坐标
    //线偏移末点，本地坐标  
    if(!this.b3dPos)
        this._windowOffset=options.offset;
    
    this._offset=options.offset||new THREE.Vector3(0,0,0);
    
    // //保存一个屏幕偏移位置
    // this._windowOffset=options.windowOffset;
    
    // this.setOffset(this._offset,true,!this.b3dPos,2); 
    // var scope=this;
    // this._scene.onBeforeRender=function( render, scene, camera, geometry, material, group){
    //     scope.update();      
    //     scope.updateOffset();
    // };
    
}





THREE.Label.prototype.setContent=function(info){
    var oldEle=this._contentObject.element;
    if(oldEle&&oldEle.parentNode)oldEle.parentNode.removeChild(oldEle);
    this._contentObject.element=undefined;
     //info为Div
     if(info instanceof HTMLElement){
        this._labelDiv=info;
        this._labelDiv.style.position = 'absolute';
        this._contentObject.element=this._labelDiv;
    }else{
        this._labelDiv=this._textDiv;
        //this._labelDiv.textContent=info;
        this._contentObject.element=this._labelDiv;
		
		//测试代码
		/* var size = 100;
		var divisions = 10;
		
		var gridHelper = new THREE.GridHelper( 100, 10,0x0000ff, 0x808080);
		_webObject.scenes.get(0).scene.add(gridHelper) 
		
		
		
		var geom = new THREE.Geometry();
		var material = new THREE.ParticleBasicMaterial({ 
		color: 0x00FFFF, 
		size: 1
		}); 
		// 创建单个粒子 
		
		var color1 = new THREE.Color( 0x0000ff );
		var p1 = new THREE.Vector3( 0, 0, 1 );
		// 将粒子加入粒子geometry 
		geom.vertices.push(p1); 
		geom.colors.push(color1);
		// 创建粒子系统 
		var system =  new THREE.ParticleSystem(geom, material);
		_webObject.scenes.get(0).scene.add(system)  */
		
		
        //根据点击位置确定label朝向
		var _div = document.createElement("div");
		var _font = document.createElement("font");
		_font.innerHTML = info;
		_div.appendChild(_font);
		
        if (this.pickPositon.z> 0) {
			_div.setAttribute("class","aaa");
            this._labelDiv.style.left = info.length / 2 * parseInt(this._labelDiv.style.fontSize) + 21 + 'px'
        } else {
			_div.setAttribute("class","bbb");
            this._labelDiv.style.left = -info.length / 2 * parseInt(this._labelDiv.style.fontSize) - 21 + 'px'
            
        }
		this._labelDiv.appendChild(_div);
		this._labelDiv.style.left = 0;
		//this._labelDiv.style.top = -parseInt(this._labelDiv.style.fontSize) / 2 - parseInt(this._labelDiv.style.borderWidth) - 30 + "px"
		this._labelDiv.style.top = 0;
    }       
    this._labelDiv.style.display="";
}


THREE.Label.prototype.show=function(bShow){
    this._labelDiv.style.display=bShow?"":"none";
    this._lineObject.visible=bShow;
    this.visible=bShow;
}

THREE.Label.prototype.update=function(){
    if(!this.visible)return;
    //不使用空间位置，则实时计算屏幕偏移转空间坐标
    if(!this.b3dPos){
        //转成世界坐标
        this._offset=this._windowOffset.clone();
        this._offset.unproject( this._camera );
        this.worldToLocal(this._offset);
        this.updateOffset();
    }
}

THREE.Label.prototype.setPosition=function(worldPos){
    this.position.set( worldPos.x, worldPos.y, worldPos.z);
}
//
THREE.Label.prototype.setOffset=function(offset,bLocal=true,bWindow=false,linePosCount=11){
    
    //给定的偏移是屏幕偏移 
    if(bWindow){
        //不绑定空间位置
        this.b3dPos=false;
        this._windowOffset=offset.clone();           
        
    }else{
        //不是屏幕偏移，那么就不用render计算位置
        this.b3dPos=true;
        this._offset=offset.clone();
        if(!bLocal)
        {   
            //通知更新矩阵
            this.updateMatrix();
            //强制更新
            this.updateMatrixWorld();
            this.worldToLocal(this._offset);
        }
        this.updateOffset(linePosCount);
    }   
    
}

THREE.Label.prototype.updateOffset=function(linePosCount){
    //var offset=this.worldToLocal(offset);    
    
    var geometry = this._lineObject.geometry;
    var vertices=geometry.vertices;
    if(!vertices)return;
    linePosCount=linePosCount||vertices.length;
    var v=new THREE.Vector3();
    
    for(var i=0;i<linePosCount-1;i++){
        var v3=v.lerp(this._offset,i/(linePosCount-1));
        if(vertices.length<linePosCount){
            vertices.push(v3);
        }else{
            vertices[i].copy(v3);
        }
    }
    geometry.verticesNeedUpdate=true;
}


//弹出标牌，隐藏即销毁

THREE.PopLabel=function(options){
    THREE.Label.call( this );
    this.init(options);
	//console.log(options.position)
    this.pickPositon = options.position//.sub(_classModelControl.GetLinkModel("Root Scene").boundingSphere.center);//dk
    
    
    //添加内容标牌
    if(this.b3dLabel){
        this._contentObject = new THREE.CSS3DObject( this._labelDiv );
    }else{
        this._contentObject = new THREE.CSS2DObject( this._labelDiv );
    }
    this.add( this._contentObject);




    this.popTime=options.popTime||500;

    this._labelDiv.style.display="none";    
    
}

THREE.PopLabel.prototype = Object.create( THREE.Label.prototype );
THREE.PopLabel.prototype.constructor = THREE.PopLabel;


THREE.PopLabel.prototype.initAfter=function(cb){
    this._labelDiv.style.display="block";
    var localPos=new THREE.Vector3();
    
    var positionAttr = this._lineObject.geometry.attributes.position;
    //var attributes=this._lineObject.geometry.attributes;
    var posArray=[localPos];
   var scope=this;
new TWEEN.Tween(localPos)
        .to({x:this._offset.x,y:this._offset.y,z:this._offset.z},this.popTime)
         .onUpdate(function(){
              posArray.push(localPos.clone());
              var posBuffer=new Float32Array(posArray.length*3);
              for(var i=0;i<posArray.length;i++){
                  posBuffer[i*3]=posArray[i].x;
                  posBuffer[i*3+1]=posArray[i].y;
                  posBuffer[i*3+2]=posArray[i].z;
              }    
              positionAttr.setArray(posBuffer);
              positionAttr.needsUpdate=true;

         })
         .onComplete(function(){
             scope._contentObject.position.copy(localPos);
             scope._labelDiv.style.display="";
             var func=defaultValue(cb,()=>{});
             func();
        })
         .easing( TWEEN.Easing.Sinusoidal.InOut)//.start();   

}

THREE.PopLabel.prototype.removeSelf=function(){
    this.dispose();  

}

THREE.PopLabel.prototype.show=function(bShow){
    if(!bShow){   
        this.manager.remove(this.labelId);     
    }   

}