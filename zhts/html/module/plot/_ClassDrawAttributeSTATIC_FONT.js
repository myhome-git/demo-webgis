/**
 * 绘制图标
 * FONT属性接口
 */
function _ClassDrawAttributeSTATIC_FONT(){
	
	//继承
	_ClassDrawAttributeOBJECT.call(this);
	
	//面板类型
	this.type = "STATIC_FONT";
		
	//面板名称
	this.name = "文字属性";
	
	//属性列表
	this.ATTRIBUTES = [
		{"id":"text","name":"名称","type":"string","control-type":"string"},
		{"id":"font-family","name":"字体","type":"string","control-type":"string"},
		{"id":"font-size","name":"字号","type":"string","control-type":"string"},
		{"id":"color","name":"颜色","type":"string","control-type":"color"},
		{"id":"offsetX","name":"X轴偏移","type":"string","control-type":"offsetX"},
		{"id":"offsetY","name":"Y轴偏移","type":"string","control-type":"offsetY"},
		{"id":"rotation","name":"旋转角度","type":"float","control-type":"rotation"}
	];
};