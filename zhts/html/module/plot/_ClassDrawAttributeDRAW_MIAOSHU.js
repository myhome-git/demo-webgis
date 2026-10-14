/**
 * 绘制图标
 * 描述属性接口
 */
function _ClassDrawAttributeDRAW_MIAOSHU(){
	
	//继承
	_ClassDrawAttributeOBJECT.call(this);
	
	//面板类型
	this.type = "DRAW_MIAOSHU";
		
	//面板名称
	this.name = "标牌图形";
	
	//属性列表
	this.ATTRIBUTES = [
		{"id":"show","name":"显示","type":"boolean","control-type":"select"},
		{"id":"width","name":"宽度","type":"string","control-type":"number"},
		{"id":"height","name":"高度","type":"string","control-type":"number"},
		{"id":"scale","name":"缩放","type":"number","control-type":"number"},
		{"id":"text","name":"名称","type":"string","control-type":"string"},
		{"id":"font-size","name":"字体","type":"string","control-type":"string"},
		{"id":"font-size","name":"字号","type":"string","control-type":"string"},
		{"id":"line-connecting","name":"连接线","type":"line","control-type":"line"},
		{"id":"color","name":"颜色","type":"string","control-type":"color"},
		{"id":"positioning","name":"锚点","type":"string","control-type":"positioning"},
		{"id":"opacity","name":"透明度","type":"float","control-type":"opacity"}
	];
};