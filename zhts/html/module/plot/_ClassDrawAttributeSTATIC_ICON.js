/**
 * 绘制图标
 * ICON属性接口
 */
function _ClassDrawAttributeSTATIC_ICON(){
	
	//继承
	_ClassDrawAttributeOBJECT.call(this);
	
	//根据type关键字调取方法
	this.type = "STATIC_ICON";
	
	//面板名称
	this.name = "图形属性";
	
	//set交互对象
	this.ControlObject = undefined;
	
	//属性列表
	this.ATTRIBUTES = [
		{"id":"width","name":"宽度","type":"number","control-type":"number"},
		{"id":"height","name":"高度","type":"number","control-type":"number"},
		{"id":"scale","name":"缩放","type":"number","control-type":"number"},
		{"id":"color","name":"颜色","type":"string","control-type":"select-color"},
		{"id":"coordinatesX","name":"X坐标","type":"string","control-type":"coordinates"},
		{"id":"coordinatesY","name":"Y坐标","type":"string","control-type":"coordinates"},
		{"id":"anchor","name":"锚点","type":"string","control-type":"anchor"},
		{"id":"rotation","name":"旋转角度","type":"float","control-type":"rotation"},
		{"id":"opacity","name":"透明度","type":"float","control-type":"opacity"}
	];
	
};
