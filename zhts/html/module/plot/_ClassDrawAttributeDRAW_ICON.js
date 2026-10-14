/**
 * 绘制图标
 * ICON属性接口
 */
function _ClassDrawAttributeDRAW_ICON(){
	
	//继承
	_ClassDrawAttributeOBJECT.call(this);
	
	//根据type关键字调取方法
	this.type = "DRAW_ICON";
	
	//面板名称
	this.name = "图形属性";
	
	//set交互对象
	this.ControlObject = undefined;
	
	//属性列表
	this.ATTRIBUTES = [
		{"id":"stroke-color","name":"画笔颜色","type":"number","control-type":"color"},
		{"id":"stroke-width","name":"画笔粗细","type":"number","control-type":"number"},
		{"id":"fill-color","name":"填充颜色","type":"number","control-type":"color"},
		{"id":"rotation","name":"旋转角度","type":"float","control-type":"rotation"},
	];
	
};
