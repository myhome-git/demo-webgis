 var send3DViewer = false;
 var start23DAsy = false;
// var keyBoradEventHandle = new 

// ///键盘事件参数入口
// function KeyEventCarry()
// {
	
// }
// //键盘事件响应类
// KeyEventCarry.prototype=
// {
// 	constructor : KeyEventCarry,
// 	keyDown:function(event){
// 		document.onkeydown=event;
// 		},
// 	keyUp:function(event){
// 		document.onkeyup=event;
// 		},
// 	keyPress:function(event){
// 		document.onkeypress=event;
// 		},
// }

function synchronization(cc_socket){
	var me =this;
	this.startReceive = true;
	this.socket = cc_socket;
	this.camera = viewer.camera;
	Object.defineProperty(this,"imageryLayers",{
		get:function(){
			return viewer.imageryLayers.get(0);
		}		
	});
	Object.defineProperty(this,"level",{
		get:function(){
			return this.imageryLayers.curZoomLevel;
		}		
	});
	this.getCameraEvent = function(){
		var camera = me.camera;
		var heading = camera.heading;
		var position = camera.positionCartographic;
		var msg = {
			type : "2D",
			value : {
				rot : heading,
				pt : [BeyonMap.Math.toDegrees(position.longitude),BeyonMap.Math.toDegrees(position.latitude)],
				zoom : me.level,
			}
		};
		return JSON.stringify(msg);
	};

	// this.camera.moveStart.addEventListener(function(){
	// 	if(send3DViewer){
	// 		var msg = syn23DCtrl.getCameraEvent();
	// 		syn23DCtrl.socket.sendMsg(msg);
	// 	}
	// });

	this.camera.moveEnd.addEventListener(function(){
		send3DViewer = false;
	});
	// var updateEventHandle = new BeyonMap.ScreenSpaceEventHandler(viewer.scene.canvas);
	var updateEventHandle = eventHandler;
	updateEventHandle.setInputAction(function(movement){
		send3DViewer = true;
	},
	BeyonMap.ScreenSpaceEventType.LEFT_DOWN);
	updateEventHandle.setInputAction(function(movement){
		send3DViewer = true;
	},
	BeyonMap.ScreenSpaceEventType.MIDDLE_DOWN);
	updateEventHandle.setInputAction(function(movement){
		send3DViewer = true;
	},
	BeyonMap.ScreenSpaceEventType.PINCH_START);
	updateEventHandle.setInputAction(function(movement){
		send3DViewer = true;
	},
	BeyonMap.ScreenSpaceEventType.LEFT_DOWN);
	updateEventHandle.setInputAction(function(movement){
		send3DViewer = true;
	},
	BeyonMap.ScreenSpaceEventType.RIGHT_DOWN);
	updateEventHandle.setInputAction(function(movement){
		send3DViewer = true;
	},
	BeyonMap.ScreenSpaceEventType.WHEEL );

	this.eventHelper = new BeyonMap.EventHelper();
}
synchronization.prototype.startSynchronization = function(){
	var callBack = function(m){
		var msg = JSON.parse(m.body);
        var type = msg.type;
        var value = msg.value;
        //  var msg = {type:"3D",value:{ pt:view.getCenter(), zoom:view.getZoom(), rot:view.getRotation(),extent:ext }};
        if(type=='3D'){
        	console.log(value);
            var position = new BeyonMap.Cartesian3.fromDegrees(value.pt[0],value.pt[1]);
            var extent = value.extent;
            var v = {
                    destination:new BeyonMap.Rectangle(BeyonMap.Math.toRadians(value.extent[0]),BeyonMap.Math.toRadians(value.extent[1]), BeyonMap.Math.toRadians(value.extent[2]),BeyonMap.Math.toRadians(value.extent[3])),
                    orientation: {
                        heading : BeyonMap.Math.toRadians(value.rot), // east, default value is 0.0 (north)
                        pitch : BeyonMap.Math.toRadians(-90),    // default value (looking down)
                        roll : 0.0                             // default value
                    }
                }
            viewer.camera.setView(v);
        }
	}

	syn23DCtrl.socket.syncTSLD(callBack)
	syn23DCtrl.eventHelper.add(syn23DCtrl.camera.changed,function(){
		if(send3DViewer){
			var msg = syn23DCtrl.getCameraEvent();
			syn23DCtrl.socket.sendMsg(msg);
		}
	});
}

synchronization.prototype.stopSynchronization = function(){
	isStopSynView = false;
	syn23DCtrl.socket.unsubscribe("SSTS_TSLD");
	syn23DCtrl.camera.moveEnd.addEventListener(function(){
		send3DViewer = false;
	});
	// syn23DCtrl.eventHelper.removeAll();
}



