function ScriptManager(baseScene) {
	BeyonManager.call(this);
	this.baseScene=baseScene;
	var scope=this;
	_webObject.render(false);
	this.timeLiner=new Timeliner( scope );

	this.scene = baseScene.scene;
	this.camera = baseScene.camera;

	if(this.camera.name==='')this.camera.name=this.camera.type;
	this._trackInfo = [];

	

	this._mixer = null;
	this._clip = null;
	this._action = null;

	this._tracks = {};
	this._propRefs = {};
	this._channelNames = [];

	var editor_css=[
		"../../../editor/css/main.css",		
	]
	loadCss(editor_css);
	loadCss("../../../editor/css/light.css","theme");	
	
	var editorJs=[
		"../../../js/libs/system.min.js"
		,"../../../editor/js/libs/codemirror/codemirror.js"
		,"../../../editor/js/libs/codemirror/addon/dialog.js"
		,"../../../editor/js/libs/codemirror/addon/show-hint.js"
		,"../../../editor/js/libs/codemirror/addon/tern.js"
		,"../../../editor/js/libs/acorn/acorn.js"
		,"../../../editor/js/libs/acorn/acorn_loose.js"
		,"../../../editor/js/libs/acorn/walk.js"
		,"../../../editor/js/libs/ternjs/polyfill.js"
		,"../../../editor/js/libs/ternjs/signal.js"
		,"../../../editor/js/libs/ternjs/tern.js"
		,"../../../editor/js/libs/ternjs/def.js"
		,"../../../editor/js/libs/ternjs/comment.js"
		,"../../../editor/js/libs/ternjs/infer.js"
		,"../../../editor/js/libs/ternjs/doc_comment.js"
		,"../../../editor/js/libs/tern-threejs/threejs.js"		
		,"../../../editor/js/Player.js"
		,"../../../editor/js/Script.js"
		,"../../../editor/js/libs/ui.js"
		,"../../../editor/js/libs/ui.three.js"
		,"../../../editor/js/libs/signals.min.js"
		,"../../../editor/js/Storage.js"
		,"../../../editor/js/Editor.js"
		,"../../../editor/js/Config.js"
		,"../../../editor/js/History.js"
		,"../../../editor/js/Loader.js"
		,"../../../editor/js/Menubar.js"
		,"../../../editor/js/Menubar.File.js"
		,"../../../editor/js/Menubar.Edit.js"
		,"../../../editor/js/Menubar.Add.js"
		,"../../../editor/js/Menubar.Play.js"
		,"../../../editor/js/Menubar.Examples.js"
		,"../../../editor/js/Menubar.Help.js"
		,"../../../editor/js/Menubar.Status.js"
		,"../../../editor/js/Sidebar.js"
		,"../../../editor/js/Sidebar.Scene.js"
		,"../../../editor/js/Sidebar.Project.js"
		,"../../../editor/js/Sidebar.Settings.js"
		,"../../../editor/js/Sidebar.Settings.Shortcuts.js"
		,"../../../editor/js/Sidebar.Settings.Viewport.js"
		,"../../../editor/js/Sidebar.Properties.js"
		,"../../../editor/js/Sidebar.Object.js"
		,"../../../editor/js/Sidebar.Geometry.js"
		,"../../../editor/js/Sidebar.Geometry.Geometry.js"
		,"../../../editor/js/Sidebar.Geometry.BufferGeometry.js"
		,"../../../editor/js/Sidebar.Geometry.Modifiers.js"
		,"../../../editor/js/Sidebar.Geometry.BoxGeometry.js"
		,"../../../editor/js/Sidebar.Geometry.CircleGeometry.js"
		,"../../../editor/js/Sidebar.Geometry.CylinderGeometry.js"
		,"../../../editor/js/Sidebar.Geometry.IcosahedronGeometry.js"
		,"../../../editor/js/Sidebar.Geometry.PlaneGeometry.js"
		,"../../../editor/js/Sidebar.Geometry.SphereGeometry.js"
		,"../../../editor/js/Sidebar.Geometry.TorusGeometry.js"
		,"../../../editor/js/Sidebar.Geometry.TorusKnotGeometry.js"
		,"../../../editor/js/Sidebar.Geometry.TeapotBufferGeometry.js"
		,"../../../editor/js/Sidebar.Geometry.LatheGeometry.js"
		,"../../../editor/js/Sidebar.Material.js"
		,"../../../editor/js/Sidebar.Animation.js"
		,"../../../editor/js/Sidebar.Script.js"
		,"../../../editor/js/Sidebar.History.js"
		,"../../../editor/js/Strings.js"
		,"../../../editor/js/Toolbar.js"
		,"../../../editor/js/Viewport.js"
		,"../../../editor/js/Viewport.Info.js"
		,"../../../editor/js/Command.js"
		,"../../../editor/js/commands/AddObjectCommand.js"
		,"../../../editor/js/commands/RemoveObjectCommand.js"
		,"../../../editor/js/commands/MoveObjectCommand.js"
		,"../../../editor/js/commands/SetPositionCommand.js"
		,"../../../editor/js/commands/SetRotationCommand.js"
		,"../../../editor/js/commands/SetScaleCommand.js"
		,"../../../editor/js/commands/SetValueCommand.js"
		,"../../../editor/js/commands/SetUuidCommand.js"
		,"../../../editor/js/commands/SetColorCommand.js"
		,"../../../editor/js/commands/SetGeometryCommand.js"
		,"../../../editor/js/commands/SetGeometryValueCommand.js"
		,"../../../editor/js/commands/MultiCmdsCommand.js"
		,"../../../editor/js/commands/AddScriptCommand.js"
		,"../../../editor/js/commands/RemoveScriptCommand.js"
		,"../../../editor/js/commands/SetScriptValueCommand.js"
		,"../../../editor/js/commands/SetMaterialCommand.js"
		,"../../../editor/js/commands/SetMaterialValueCommand.js"
		,"../../../editor/js/commands/SetMaterialColorCommand.js"
		,"../../../editor/js/commands/SetMaterialMapCommand.js"
		,"../../../editor/js/commands/SetSceneCommand.js"
		,"../../../editor/js/libs/html2canvas.js"
		,"../../../editor/js/libs/three.html.js"
	]
	loadJs(editorJs,undefined,function(){
		var editor=new Editor(scope);

		scope.registEditorSignals(editor.signals);

		var toolbar = new Toolbar( editor );
		document.body.appendChild( toolbar.dom );

		var script = new Script( editor );
		document.body.appendChild( script.dom );

		// var player = new Player( editor );
		// document.body.appendChild( player.dom );

		// var menubar = new Menubar( editor );
		// document.body.appendChild( menubar.dom );

		var sidebar = new Sidebar( editor );
		document.body.appendChild( sidebar.dom );

		var modal = new UI.Modal();
		document.body.appendChild( modal.dom );

		//

		editor.setTheme( "../../../editor/"+editor.config.getKey( 'theme' ) );

		this.editor=editor;		
	});
	this.init(this.timeLiner);
}

//原型继承
ScriptManager.prototype = new BeyonManager();
ScriptManager.prototype = {

	constructor: ScriptManager,

	init: function( timeliner ) {
		
		this._mixer=	new THREE.AnimationMixer( this.baseScene.scene );
		var tracks = [],
			trackInfo = this._trackInfo;
		var camera=this.camera;
		var camPosTrack={
			type: THREE.VectorKeyframeTrack,
			propertyPath: camera.name+'.'+'position',
			initialValue: [ camera.position.x, camera.position.y, camera.position.z ],
			interpolation: THREE.InterpolateSmooth
		}
		trackInfo.push(camPosTrack);
		var camRoTrack={
			type: THREE.VectorKeyframeTrack,
			propertyPath: camera.name+'.'+'rotation',
			initialValue: [ camera.rotation.x, camera.rotation.y, camera.rotation.z ],
			interpolation: THREE.InterpolateSmooth
		}
		trackInfo.push(camRoTrack);		


		for ( var i = 0, n = trackInfo.length; i !== n; ++ i ) {

			var spec = trackInfo[ i ];

			tracks.push( this._addTrack(
					spec.type, spec.propertyPath,
					spec.initialValue, spec.interpolation ) );
		}

		this._clip = new THREE.AnimationClip( 'editclip', 20, tracks );
		this._action = this._mixer.clipAction( this._clip ).play();

	},
	onUpdate : function(time){
		this.baseScene.script_render(time);
	},
	start:function(){
		this._mixer.update(0);
		this._action.reset();    
        this._action.play();
	},
	stop:function(){
		this._action.stop();
		this._action.reset();   
	},
	setDisplayTime: function( time ) {
		this._action.time = time;
		this._mixer.update(time);
	},

	setDuration: function( duration ) {

		this._clip.duration = duration;

	},

	getChannelNames: function() {

		return this._channelNames;

	},

	getChannelKeyTimes: function( channelName ) {

		return this._tracks[ channelName ].times;

	},

	setKeyframe: function( channelName, time ) {

		var track = this._tracks[ channelName ],
			times = track.times,
			index = Timeliner.binarySearch( times, time ),
			values = track.values,
			stride = track.getValueSize(),
			offset = index * stride;

		if ( index < 0 ) {

			// insert new keyframe

			index = ~ index;
			offset = index * stride;

			var nTimes = times.length + 1,
				nValues = values.length + stride;

			for ( var i = nTimes - 1; i !== index; -- i ) {

				times[ i ] = times[ i - 1 ];

			}

			for ( var i = nValues - 1,
					e = offset + stride - 1; i !== e; -- i ) {

				values[ i ] = values[ i - stride ];

			}

		}

		times[ index ] = time;
		this._propRefs[ channelName ].getValue( values, offset );

	},

	delKeyframe: function( channelName, time ) {

		var track = this._tracks[ channelName ],
			times = track.times,
			index = Timeliner.binarySearch( times, time );

		// we disallow to remove the keyframe when it is the last one we have,
		// since the animation system is designed to always produce a defined
		// state

		if ( times.length > 1 && index >= 0 ) {

			var nTimes = times.length - 1,
				values = track.values,
				stride = track.getValueSize(),
				nValues = values.length - stride;

			// note: no track.getValueSize when array sizes are out of sync

			for ( var i = index; i !== nTimes; ++ i ) {

				times[ i ] = times[ i + 1 ];

			}

			times.pop();

			for ( var offset = index * stride; offset !== nValues; ++ offset ) {

				values[ offset ] = values[ offset + stride ];

			}

			values.length = nValues;

		}

	},

	moveKeyframe: function( channelName, time, delta, moveRemaining ) {

		var track = this._tracks[ channelName ],
			times = track.times,
			index = Timeliner.binarySearch( times, time );

		if ( index >= 0 ) {

			var endAt = moveRemaining ? times.length : index + 1,
				needsSort = times[ index - 1 ] <= time ||
					! moveRemaining && time >= times[ index + 1 ];

			while ( index !== endAt ) times[ index ++ ] += delta;

			if ( needsSort ) this._sort( track );

		}

	},

	serialize: function() {

		var result = {
				duration: this._clip.duration,
				channels: {}
			},

			names = this._channelNames,
			tracks = this._tracks,

			channels = result.channels;

		for ( var i = 0, n = names.length; i !== n; ++ i ) {

			var name = names[ i ],
				track = tracks[ name ];

			channels[ name ] = {

				times: track.times,
				values: track.values

			};

		}

		return result;

	},

	deserialize: function( structs ) {

		var names = this._channelNames,
			tracks = this._tracks,

			channels = structs.channels;

		this.setDuration( structs.duration );

		for ( var i = 0, n = names.length; i !== n; ++ i ) {

			var name = names[ i ],
				track = tracks[ name ],
				data = channels[ name ];

			this._setArray( track.times, data.times );
			this._setArray( track.values, data.values );

		}

		// update display
		this.setDisplayTime( this._mixer.time );

	},

	_sort: function( track ) {

		var times = track.times,
			order = THREE.AnimationUtils.getKeyframeOrder( times );

		this._setArray( times,
				THREE.AnimationUtils.sortedArray( times, 1, order ) );

		var values = track.values,
			stride = track.getValueSize();

		this._setArray( values,
				THREE.AnimationUtils.sortedArray( values, stride, order ) );

	},

	_setArray: function( dst, src ) {

		dst.length = 0;
		dst.push.apply( dst, src );

	},

	_addTrack: function( type, prop, initialValue, interpolation ) {

		var track = new type(
				prop, [ 0 ], initialValue, interpolation );

		// data must be in JS arrays so it can be resized
		track.times = Array.prototype.slice.call( track.times );
		track.values = Array.prototype.slice.call( track.values );

		this._channelNames.push( prop );
		this.timeLiner.addLayer(prop);
		this._tracks[ prop ] = track;

		// for recording the state:
		this._propRefs[ prop ] =
				new THREE.PropertyBinding( this.baseScene.scene, prop );

		return track;

	},

	addTrack:function(o3d,property){
		var prop=o3d.name+'.'+property;
		this.timeLiner.addLayer(prop);
	}


};
//将自身指针指向自己的构造函数
//ScriptManager.prototype.constructor = ScriptManager;

ScriptManager.prototype.editorScript=function(){
	new Timeliner( this );
}

ScriptManager.prototype.registEditorSignals=function(signals){
	var modelManager=this.baseScene.modelManager;
	signals.objectFocused.add( function ( object ) {
		modelManager.locateNode(object);	
	} );
}

