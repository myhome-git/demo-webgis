/**
 * 绘制图标
 * OBJECT属性接口
 */
function _ClassDrawAttributeOBJECT(){
	
	var $ = jQuery;
	
	//根据type关键字调取方法，可能需要区分静态和动态
	this.type = "OBJECT";
	
	//面板名称
	this.name = "父类";
	
	//继承对象
	this.inheritance = null;
	
	//element
	this.element = null;
	
	//存放数据
	this._data = null;
	
	//窗口是否打开
	this.windowOpen = false;
	
	//属性列表
	this.ATTRIBUTES = [];
	
	//取出属性列表
	this.GetArributes = function(){
		return this.ATTRIBUTES;
	}
	
	//打开面板
	this.OpenPanel = function(){
		this.windowOpen = true;
		this.element.find(".x-panel-content")
			.removeClass("panel-hidden")
			.unbind("click")
			.on("click",function(){
				return false;
			});
	}
	
	//关闭面板
	this.ClosePanel = function(){
		this.windowOpen = false;
		if(this.element){
			this.element.find(".x-panel-content").addClass("panel-hidden");
		}
	}
	
	//切换面板
	this.SetTogglePanel = function(){
		if(this.element){
			this.element.find(".x-panel-content").hasClass("panel-hidden") ? this.OpenPanel() : this.ClosePanel();
		}
	}
	
	//设置面板数据
	this.SetPanel = function(_data){
		if(!_data){
			return;
		}
		var _list = $.extend(true,[],this.GetArributes());
		for(var i=0;i<_list.length;i++){
			var _o = _list[i];
			if(_data[_o.id]!=undefined){
				_o.value = _data[_o.id];
			}
		}
		var _html = template("TemplatePanelDrawAttribute"+this.type,{
			isRun : true,
			type : this.type,
			name : this.name,
			data : _list
		});
		this.element.html(_html);
		if(!this.windowOpen){
			this.ClosePanel();
		}
		
		this.SetData(_data);
		this.OnEvent();
	}
	
	//单击事件
	this.OnEvent = function(){
		var _this = this;
		_this.element.find(".x-panel-title").on("click",function(){
//			_this.inheritance.CloseChildrenAllPanel(_this.type);
//			_this.SetTogglePanel();
		});
    	
    	//表单初始化
    	layui.form.render();
    	
    	$.each(_this.element.find("[x-control-type='color']"), function(index,el) {
    		var $el = $(el),
    			$button = $el.find(">.layui-btn-control-type-color"),
    			_id = $button.attr("id").replace(/^BUTTON-/,"");
    		//颜色选择器表单
			layui.colorpicker.render({
				elem: '#BUTTON-'+_id,
				color: _this.element.find('#INPUT-'+_id).val(),
				format: 'rgb',
				predefine: true,
				alpha: true,
				done: function(color){
					_this.element.find('#INPUT-'+_id).val(color);
					_this.inheritance["SetOpenLayers"+_this.type](_this.GetPanelValue());
				},
				change: function(color){
//					_this.element.find('#INPUT-'+_id).val(color);
//					_this.inheritance["SetOpenLayers"+_this.type](_this.GetPanelValue());
			    }
			});
    	});
		
		var keyupClock;
		_this.element.find("input[x-out-name],select[x-out-name]").on("keyup change",function(event){
			keyupClock = event.timeStamp;
			var $this = $(this),
				_val = $this.val();
			if(!_val){
				return false;
			}
			setTimeout(function(){
	            if(keyupClock-event.timeStamp==0){
					_this.inheritance["SetOpenLayers"+_this.type](_this.GetPanelValue());
	            }
			},500);
		});
		
		layui.form.on("select("+_this.type+"-color)", function(data){
//			  console.log(data.elem); //得到select原始DOM对象
//			  console.log(data.value); //得到被选中的值
//			  console.log(data.othis); //得到美化后的DOM对象
		  	_this.inheritance["SetOpenLayers"+_this.type](_this.GetPanelValue());
		});   
	}
	
	//设置数据
	this.SetData = function(_data){
		this._data = _data;
	}
	
	//取出表单数据
	this.GetPanelValue = function(_data){
		return this.element.getElValue();
	}
	
	//清除数据
	this.ClearData = function(){
		this._data = null;
	}
	
	//默认初始化
	this.init = function(){
		var _this = this;
		layui.use(['form','colorpicker'], function(){
			
		});
	}
	
	this.init();
};
