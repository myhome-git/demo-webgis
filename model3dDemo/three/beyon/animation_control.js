//动画控制器
//obj:Object3d  the object whose animations shall be played by this mixer.
function animationCtrl(obj) {
    //动画列表  action
    this._actions=new Map;
    this._mixer=new THREE.AnimationMixer(obj);

    this.play=false;

    this._curActionState=undefined;

    //每个节点的动画
    this.nodeActions=new Map;

    //节点的track
    this.nodeTracks=new Map;

    this.dispose=function(){
        //清理动画
        this._mixer.uncacheRoot(this._mixer.getRoot());
        delete this._mixer;
        this.nodeTracks.forEach(function(nt){
            nt.dispose();
        });
        this.nodeTracks.clear();
    }

}
animationCtrl.prototype = {
    constructor:animationCtrl,
}

animationCtrl.prototype.parseClipNode=function(aState){
    //从action._propertyBindings里分析总共节点
    var action=aState.action;
    var actionNodePros=action._propertyBindings;
    for(var i=0;i<actionNodePros.length;i++){
        var nodeBinding=actionNodePros[i].binding;
        var clip=action._clip; 
        var track=clip.tracks[i];
        if(!this.nodeActions.has(nodeBinding.node)){
                       
            var nodeClip=new THREE.AnimationClip(nodeBinding.parsedPath.nodeName+'.'+clip.name,clip.duration,[track]);
            this.nodeActions.set(nodeBinding.node,nodeClip);
        }else{
            var nodeClip=this.nodeActions.get(nodeBinding.node);
            nodeClip.tracks.push(track);
        }
    }
    //将clip转成action，加进播放器还没有播放
    for (var [k,v] of this.nodeActions) {
        // var action=this._mixer.clipAction(v);
        // v=null;
        var nodeActionState={
            name:v.name,
            totalFrame:aState.totalFrame,    //帧数
            frameNumOneSecond:aState.frameNumOneSecond,
            action:this._mixer.clipAction(v),
            actionTime:v.duration,
            time:0,
            startTime:0,
            endTime:null,
            loop:0,
            loopSet:9999
        };
        this.nodeActions.set(k,nodeActionState);
        
    }
}

animationCtrl.prototype.addAnimationClip = function(clip){
    //检查动画名称是否存在
    if(this._actions.has(clip.name))
        return false;    
    var aState={
        name:clip.name,
        totalFrame:clip.tracks[0].times.length,    //帧数
        frameNumOneSecond:24,
        action:this._mixer.clipAction(clip),
        actionTime:clip.duration,
        time:0,
        startTime:0,
        endTime:null,
        loop:0,
        loopSet:9999
    };

    this._actions.set(clip.name,aState);
    this.parseClipNode(aState);
    //new THREE.PropertyBinding( root, path, parsedPath )    
}


animationCtrl.prototype.getAnimationClip = function(name){
    return this._actions.get(name);    
}



animationCtrl.prototype.setFrameNumOneSecond= function(name,nums){
    if(this._actions.has(name)){
        var aState=this._actions.get(name);
        aState.FrameNumOneSecond=nums;
    }

}
//播放节点动画
animationCtrl.prototype.playNodeAction=function(node,play=true,loop=1,startTime=0,endTime=undefined,timeIsFrame=false){
    if(typeof(node)==='string'){
        var rootNode=this._mixer.getRoot();
        node=rootNode.getObjectByName(node);
    }
    if(this.nodeActions.has(node)){
        var actionState=this.nodeActions.get(node);
        var action= actionState.action;
        if(!play)
        {
            actionState.loopSet=0;
            actionState.startTime=0;
            actionState.endTime=undefined;
            action.stop();
            action.reset();
        }else{
            action.reset();
            actionState.loopSet=loop;
            //传帧数转换一下
            if(timeIsFrame){
                startTime=actionState.actionTime*startTime/actionState.totalFrame;
                endTime=actionState.actionTime*endTime/actionState.totalFrame;
            }
            actionState.startTime=startTime;    
            actionState.endTime=endTime>actionState.actionTime?actionState.actionTime-0.001:endTime;
            //action.setLoop(THREE.LoopRepeat,loop);
            action.time=startTime;
            action.play();
        }
    }
}

animationCtrl.prototype.playAction = function(name,play=true,loop=1,startTime=0,endTime=undefined){
    //检查动画名称是否存在
    
    if(!this._actions.has(name))
        return false;
    if(!play)
    {
        this._curActionState=this._actions.get(name);
        this._curActionState.loopSet=0;
        this._curActionState.startTime=0;
        this._curActionState.endTime=undefined;
        var action= this._curActionState.action;
        action.stop();
        action.reset();   
        this._curActionState=undefined; 
    }else{
        this._mixer.update( 0 );    
        this._curActionState=this._actions.get(name);
        this._curActionState.loopSet=loop;
        this._curActionState.startTime=startTime;
        if(endTime==undefined)endTime=this._curActionState.actionTime;
        this._curActionState.endTime=endTime>this._curActionState.actionTime?this._curActionState.actionTime-0.001:endTime;
        var action= this._curActionState.action;
        action.reset();    
        action.time=startTime;
        action.play();
    }
        
    //new THREE.PropertyBinding( root, path, parsedPath )    
}
animationCtrl.prototype.update = function(delta){
    if(this._curActionState){
        var as=this._curActionState;
        var action= as.action;
        if(as.endTime&&as.endTime<=action.time){
            as.loop++;
            if(as.loopSet<=as.loop){
                action.stop(); 
                as.loop=0;               
                as.loopSet=0;
                as.startTime=0;
                as.endTime=undefined;
                action.reset(); 
            }
                
            else{
                action.time=as.startTime;
            }
        }
    }
    this.nodeActions.forEach(function(nodeActionState){
       var action= nodeActionState.action;
       if(nodeActionState.endTime&&nodeActionState.endTime<=action.time){
            nodeActionState.loop++;
            if(nodeActionState.loopSet<=nodeActionState.loop){
                action.stop(); 
                nodeActionState.loop=0;               
                nodeActionState.loopSet=0;
                nodeActionState.startTime=0;
                nodeActionState.endTime=undefined;
                action.reset(); 
            }
                
            else{
                action.time=nodeActionState.startTime;
            }
        }
    })
    this._mixer.update(delta);
}

animationCtrl.prototype.generateNodeTrack = function(node,property,type,duration){
    if(this.nodeTracks.has(node)){
        var nt=this.nodeTracks.get(node);
        return nt.generatePropertyTrack(property,type,duration);
    }else{
        var nTrack=new nodeTrack(node,node.position,node.rotation);
        this.nodeTracks.set(node,nTrack);
        return nTrack.generatePropertyTrack(property,type,duration);
    }
}


//定义几种tracK
function nodeTrack(node,originPos,originEuler){
    this._originPosition=originPos.clone();
    this._originEuler=originEuler.clone();
    this._node=node;
    this._name=node.name;
    this.propertyTracks=new Map;

    this.dispose=function(){
        this.propertyTracks.forEach(function(pTracks){
            pTracks.forEach(function(track){
                track.times=[];
                track.values=[];

            });
            pTracks.clear();
        });
        this.propertyTracks.clear();
    }

}
nodeTrack.prototype.generatePropertyTrack= function(property,type,duration){
    if(this.propertyTracks.has(property)){
        var pt=this.propertyTracks.get(property);
        if(pt.has(type)) return pt.get(type);
        if(property=='quaternion'&&type=='scan'){
            var track=this.generateConeQuaternion(duration);
            pt.set(type,track);
            return track;
        }
    }else{
        if(property=='quaternion'&&type=='scan'){
            var track=this.generateConeQuaternion(duration);
            var pt=new Map();
            pt.set(type,track);
            this.propertyTracks.set(property,pt);
            return track;
        }
    }
}



//锥形绕远点，左右上下扫描  type:scan
nodeTrack.prototype.generateConeQuaternion= function(duration){

    //共9帧
    var interval=duration/9.0;
    var times=[0],values=[];
    for(var i=1;i<9;i++){
        times.push(times[i-1]+interval);
    }

    var Euler=this._originEuler;
    //0
    var q0 = new THREE.Quaternion();
    q0.setFromEuler(Euler);
    values=values.concat(q0.toArray()); 
    //1
    var newEuler=Euler.clone();
    newEuler.y+=Math.PI/4;
    var q1=q0.clone();
    q1.setFromEuler(newEuler);
    values=values.concat(q1.toArray()); 
    //2
    values=values.concat(q0.toArray()); 
    //3
    newEuler=Euler.clone();
    newEuler.y-=Math.PI/4;
    var q3=q0.clone();
    q3.setFromEuler(newEuler);
    values=values.concat(q3.toArray()); 
    //4
    values=values.concat(q0.toArray()); 
//5    
    newEuler=Euler.clone();
    newEuler.z+=Math.PI/4;
    var q5=q0.clone();
    q5.setFromEuler(newEuler);
    values=values.concat(q5.toArray()); 
//6    
    values=values.concat(q0.toArray()); 
//7
    newEuler=Euler.clone();
    newEuler.z-=Math.PI/4;
    var q7=q0.clone();
    q7.setFromEuler(newEuler);
    values=values.concat(q7.toArray());
//8
    values=values.concat(q0.toArray()); 

    return new THREE.QuaternionKeyframeTrack(this._name+'.quaternion', times, values);
}