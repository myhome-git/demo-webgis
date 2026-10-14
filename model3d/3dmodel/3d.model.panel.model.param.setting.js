/**
 * 面板控制-模型节点信息编辑
 */
function ClassPanelModelParamSetting(){
	
	//定义变量
	var _this = this;
	
	//定义外部class变量
	var _classModelControl;
	
	this.__ClassLinkObject = new Object();
	
	//初始化外部类
	this.InitLinkClass = function(_name,_class){
		
		this.__ClassLinkObject[_name] = _class;
		
	}
	
	//获取外部类
	this.GetLinkClass = function(_name){
		
		if(!_name){
			
			return this.__ClassLinkObject;
			
		}
		
		return this.__ClassLinkObject[_name];
		
	}
	
	//打开面板
	this.OpenPanel = function(){
		
		var _default = {
			id : "layer-open-update",
            type: 2,
            anim : -1,
            title: "调整模型参数",
            shade : false,
            area: ['300px', '500px'],
            shadeClose: false,
            isOutAnim : false,
            content: "/model3d/3dmodel/page/iframe/model.setting.html",
            btn: ['确定', '取消'],
            yes: function (index) {
            	
            	_classPanelModelList.httpSaveModelView(function(){
            		
            		layui.layer.close(index);
            		
            	});
		    	
            },
            cancel: function(index, layero){
				
			}, 
			end : function(index, layero){
            	
            },
            success: function(layero, index){
			   
			}
        };
        
		layui.layer.open(_default);
		
	}
	
	//关闭面板
	this.ClosePanel = function(){
		
		layui.layer(this.__openPanelIndex);
		
	}
	
	//类初始化
	this.Init = function(){
		
		//初始化class
		_classModelControl = _this.GetLinkClass("ClassModelControl");
		
		
	}
	
}
