function heatArea(model, options) {
	if (!model) {
		return;
	}
	if (!model.__proto__.isObject3D || model.constructor.name != "Scene")
		return;
	// this._collection = model.children;//模型所含对象集合
	// this._drawCollection = new Map();//绘制集合，key是对应绘制出area的父对象mesh的name，value是绘制出打击范围等业务的mesh引用，实体引用在this._collection中 [mesh，mesh]
	this.model = model;

	this.showLabel = defaultValue(options.label, true);
	this._sphereSub = "sphere";
	this._cylinderSub = "cylinder"
	this._labelSub = "label";
}

//radius: 打击范围，mesh：对应关节节点，text：打击范围的显示文字
heatArea.prototype.drawSphereArea = function (radius, mesh, text, options = {}) {
	if (!mesh)
		return;
	// if(mesh.parent!= this.model)
	// 	return;
	//配置参数
	options.color = defaultValue(options.color, 0xffffff);
	options.transparent = defaultValue(options.transparent, true);
	options.opacity = defaultValue(options.opacity, 0.5);

	// 绘制外部轮廓
	var geometry = new THREE.SphereBufferGeometry(radius, 25, 25);
	var material = new THREE.MeshBasicMaterial({
		color: options.color,
		wireframeLinewidth: 1,
		opacity: options.opacity,
		transparent: options.transparent
	});
	var sphere = new THREE.Mesh(geometry, material);
	material.wireframe = true;

	mesh.add(sphere); //添加到mesh里去

	sphere.name = mesh.name + LOW_LINE + this._sphereSub;
	sphere.datatype = this._sphereSub;

	if (this.showLabel) {
		var css2dLabelName = sphere.name + LOW_LINE + this._labelSub;
		this.addCss2dLabel(sphere, {
			x: radius,
			y: 0,
			z: 0
		}, text, css2dLabelName);
	}

	// this._drawCollection.set(mesh.name,sphere);
}

//radius: 打击范围，mesh：对应关节节点，text：打击范围的显示文字
heatArea.prototype.drawHalfSphereArea = function (radius, mesh, text, options = {}) {
	if (!mesh)
		return;
	// if(mesh.parent!= this.model)
	// 	return;
	//配置参数
	options.color = defaultValue(options.color, 0xffffff);
	options.transparent = defaultValue(options.transparent, true);
	options.opacity = defaultValue(options.opacity, 0.5);

	// 绘制外部轮廓
	var geometry = new THREE.SphereBufferGeometry(radius, 25, 25);
	var material = new THREE.MeshBasicMaterial({
		color: options.color,
		wireframeLinewidth: 1,
		opacity: options.opacity,
		transparent: options.transparent
	});
	var sphere = new THREE.Mesh(geometry, material);
	material.wireframe = true;

	mesh.add(sphere); //添加到mesh里去

	sphere.name = mesh.name + LOW_LINE + this._sphereSub;
	sphere.datatype = this._sphereSub;

	if (this.showLabel) {
		var css2dLabelName = sphere.name + LOW_LINE + this._labelSub;
		this.addCss2dLabel(sphere, {
			x: radius,
			y: 0,
			z: 0
		}, text, css2dLabelName);
	}

	// this._drawCollection.set(mesh.name,sphere);
}

//radius: 打击范围，mesh：对应关节节点，text：打击范围的显示文字
heatArea.prototype.drawCylinderArea = function (mesh, text, options = {}, options1 = {}) {
	if (!mesh)
		return;
	var _radiusTop = defaultValue(options.radiusTop, 0);
	var _length = defaultValue(options.length, 10);
	var _angle = defaultValue(options.angle, PAI / 6);
	var _segments = defaultValue(options.segments, 4);
	var _heightSegments = defaultValue(options.heightSegments, 64);
	//方向角
	var rotationX = defaultValue(options.rotationX, 0);
	var rotationY = defaultValue(options.rotationY, 0);
	var rotationZ = defaultValue(options.rotationZ, 0);
	var rotationOrder = defaultValue(options.rotationZ, "XYZ");

	var _radiusBottom;
	//根据角度，长度以及radiusTop计算radiusBottom的大小
	if (!options.radiusBottom)
		_radiusBottom = Math.atan(_angle) * _length + _radiusTop;
	else
		_radiusBottom = options.radiusBottom;

	//获取mesh的中心点，此处的
	if (mesh == this.model)
		var center = this.model.position;
	else
		var center = mesh.geometry.boundingSphere.center;

	//配置参数
	options1.color = defaultValue(options1.color, 0xffffff);
	options1.transparent = defaultValue(options1.transparent, true);
	options1.opacity = defaultValue(options1.opacity, 0.5);

	// 绘制外部轮廓
	var geometry = new THREE.CylinderBufferGeometry(_radiusTop, _radiusBottom, _length, _segments, _heightSegments, undefined, undefined, undefined, true); //0是上部分的直径  75是圆锥底部直径  200圆锥的高度  64圆锥底部用的64边型逼近圆形  5是圆锥高度采样点的数量
	var material = new THREE.MeshBasicMaterial({
		color: options1.color,
		wireframeLinewidth: 1,
		opacity: options1.opacity,
		transparent: options1.transparent
	});
	var cylinder = new THREE.Mesh(geometry, material);
	material.wireframe = true;

	mesh.add(cylinder); //添加到mesh里去
	var meshName = mesh == this.model ? mesh.id : mesh.name;
	cylinder.name = meshName + LOW_LINE + this._cylinderSub;

	// this._drawCollection.set(meshName,cylinder);

	//平移圆锥到中心点
	cylinder.position.x = center.x;
	cylinder.position.y = center.y;
	cylinder.position.z = center.z;

	//旋转角度
	cylinder.rotation.x = rotationX;
	cylinder.rotation.y = rotationY;
	cylinder.rotation.z = rotationZ;
	cylinder.rotation.order = rotationOrder;

	//类型标识
	cylinder.datatype = this._cylinderSub;

	if (this.showLabel) {
		var css2dLabelName = cylinder.name + LOW_LINE + this._labelSub;
		var xz = _radiusTop / 4 + _radiusBottom / 4;
		this.addCss2dLabel(cylinder, {
			x: xz,
			y: 0 - _length / 2,
			z: xz
		}, text, css2dLabelName);
	}

	return cylinder;
}

//打击范围显示，用于炮火等构建球面一部分
// function CylinderbBallBufferGeometry( radiusX, radiusZ, height, xSegments, zSegments, heightSegments, openEnded ) 
heatArea.prototype.drawBallPart = function (mesh, text, options = {}, options1 = {}) {
	if (!mesh)
		return;
	var radiusX = defaultValue(options.radiusX, PAI / 4);
	var radiusZ = defaultValue(options.radiusZ, PAI / 4);
	var height = defaultValue(options.height, 50);
	var xSegments = defaultValue(options.xSegments, 2);
	var zSegments = defaultValue(options.zSegments, 8);
	var heightSegments = defaultValue(options.heightSegments, 2);

	//方向角
	var rotationX = defaultValue(options.rotationX, 0);
	var rotationY = defaultValue(options.rotationY, 0);
	var rotationZ = defaultValue(options.rotationZ, 0);
	var rotationOrder = defaultValue(options.rotationZ, "XYZ");

	//获取mesh的中心点，此处的
	if (mesh == this.model)
		var center = this.model.position;
	else
		var center = mesh.geometry.boundingSphere.center;

	//配置参数
	options1.color = defaultValue(options1.color, 0xffffff);
	options1.transparent = defaultValue(options1.transparent, true);
	options1.opacity = defaultValue(options1.opacity, 0.5);

	// 绘制外部轮廓
	var geometry = new THREE.CylinderbBallBufferGeometry(radiusX, radiusZ, height, xSegments, zSegments, heightSegments);
	// var material = new THREE.MeshBasicMaterial( {color:options1.color,wireframeLinewidth:1,opacity:options1.opacity,transparent:options1.transparent,side: THREE.DoubleSide} );
	// var partBall = new THREE.Mesh( geometry, material ) ;



	var geometryTemp = new THREE.BufferGeometry();
	geometryTemp.addAttribute('position', new THREE.Float32BufferAttribute([], 3));

	var lineMaterial = new THREE.LineBasicMaterial({
		color: 0xffffff,
		transparent: true,
		opacity: 0.5
	});
	var meshMaterial = new THREE.MeshPhongMaterial({
		color: 0x156289,
		emissive: 0x072534,
		side: THREE.DoubleSide,
		/*flatShading: true*/
	});

	var wireframes = new THREE.LineSegments(geometryTemp, lineMaterial);
	var partBall = new THREE.Mesh(geometryTemp, meshMaterial);

	wireframes.geometry.dispose();
	wireframes.geometry = new THREE.WireframeGeometry(geometry);

	partBall.geometry.dispose();
	partBall.geometry = geometry;



	// var material2 = new THREE.LineBasicMaterial( {
	// 	color: 0xffffff,
	// 	linewidth: 1,
	// 	linecap: 'round', //ignored by WebGLRenderer
	// 	linejoin:  'round' //ignored by WebGLRenderer
	// } );


	// material.wireframe = true;

	mesh.add(partBall); //添加到mesh里去
	mesh.add(wireframes); //添加到mesh里去
	var meshName = mesh == this.model ? mesh.id : mesh.name;
	partBall.name = meshName + LOW_LINE + this._cylinderSub;

	// this._drawCollection.set(meshName,partBall);

	//平移圆锥到中心点
	partBall.position.x = center.x;
	partBall.position.y = center.y;
	partBall.position.z = center.z;

	//旋转角度
	partBall.rotation.x = rotationX;
	partBall.rotation.y = rotationY;
	partBall.rotation.z = rotationZ;
	partBall.rotation.order = rotationOrder;

	//类型标识
	partBall.datatype = this._cylinderSub;

	// if(this.showLabel){
	// 	var css2dLabelName = partBall.name + LOW_LINE + this._labelSub;
	// 	var xz = _radiusTop / 4 + _radiusBottom / 4;
	// 	this.addCss2dLabel(cylinder, {x : xz,y : 0 - _length / 2,z : xz }, text, css2dLabelName);
	// }

	return partBall;

}


/*
 *添加元素下的label元素
 *@param mesh ：添加label的元素
 *@param position ： 相对mesh原点的距离 
 *@param text : 显示文字
 *@param name : div的id值
 */
heatArea.prototype.addCss2dLabel = function (mesh, position, text, name) {
	var div = document.createElement('div');
	div.className = 'label';
	div.id = name;
	div.textContent = text;
	div.style.marginTop = '-1em';
	var divLabel = new THREE.CSS2DObject(div);
	divLabel.position.set(position.x, position.y, position.z);
	divLabel.datatype = this._labelSub;
	mesh.add(divLabel);
}

/*
 *删除mesh节点下的绘制内容
 *@param mesh 要删除的节点
 *@param sub 要过滤的条件,默认全部清除。
 *@param topDirectory 是否仅仅过滤第一层级
 */
heatArea.prototype.removeDraw = function (mesh, sub = "", topDirectory = true) {
	heatArea.call(this);
	for (var i = 0; i < mesh.children.length; i++) {
		var object = mesh.children[i];
		if (object.isObject3D) {
			if (sub == "") {
				if (object.datatype) {
					mesh.remove(object);
					continue;
				} else {
					if (topDirectory)
						continue;
					this.removeDraw(object, sub, topDirectory);
				}
			} else {
				if (object.datatype == sub) {
					mesh.remove(object);
					continue;
				} else {
					if (topDirectory)
						continue;
					this.removeDraw(object, sub, topDirectory);
				}
			}
		}
	}
}

/*
 *设置mesh节点下所有绘制的绘制元素、标牌的显隐，可以根据类型选择，类型是sub
 *@param mesh 要搜索的节点
 *@param visible 设置的显隐
 *@param sub 要过滤的条件,默认全部清除。
 *@param topDirectory 是否仅仅过滤第一层级
 */
heatArea.prototype.setVisible = function (mesh, visible, sub = "", topDirectory = true) {
	heatArea.call(this);
	for (var i = 0; i < mesh.children.length; i++) {
		var object = mesh.children[i];
		if (object.isObject3D) {
			if (object.children.length != 0 && !topDirectory) {
				this.setVisible(object, visible, sub, topDirectory);
				if (object.datatype && sub == "") {
					object.visible = visible;
					continue;
				}
				if (object.datatype == sub) {
					object.visible = visible;
					continue;
				}
			} else if (object.children.length == 0 || topDirectory) {
				if (object.datatype && sub == "") {
					object.visible = visible;
					continue;
				}
				if (object.datatype == sub) {
					object.visible = visible;
					continue;
				}
			}
		}
	}
}