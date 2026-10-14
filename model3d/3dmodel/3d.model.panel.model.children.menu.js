/**
 * 模型节点控制-菜单
 */
function ClassPanelModelChildrenMenu(){
	
	//定义变量
	var _this = this,
	
		$panelMain = $("#x-view-model-children-menu");
		
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
		
		$panelMain.removeClass("panel-hidden");
		
	}
	
	//关闭面板
	this.ClosePanel = function(){
		
		$panelMain.addClass("panel-hidden");
		
	}
	
	//加载模型子节点编辑面板
	this.LoadModelNodeEditPanel = function(){
		
		var _modelNode = (function(){
			
			var _node = _classModelControl.GetSeletedNode();
			
			if(!_node){
				
				layui.layer.msg("没有选中任何节点");
				
				return;
				
			}
			
			var _data = {
					
				action : "add",
				
				modelIdentifier : _classModelControl.__modelId,
				
				identifier : _classModelControl.__modelId + "_" + _node.name,
				
				name : _node.name,
				
				chName : "",
				
				neima : ""
				
			};
			
			return _data;
			
		})();
		
		if(_modelNode){
			
			//清除上次面板
			_classPanelModelChildrenEdit.ClearModelNodeInfo();
			
			_classPanelModelChildrenEdit.ClearModelNodeLabelInfo();
			
			//打开面板
			_classPanelModelChildrenEdit.OpenPanel();
			
			_classPanelModelChildrenList.httpGetModelNodeByIdentifier(_modelNode.identifier,function(result){
				
				if(result["code"]=="0" && result.data){
					
					result.data.action = "update";
					
					_classPanelModelChildrenEdit.SetModelNodeInfo(result.data);
					
				}else{
					
					_classPanelModelChildrenEdit.SetModelNodeInfo(_modelNode);
					
				}
				
				_classPanelModelChildrenEdit.ResetTabDefault();
				
			});
			
			//请求label
			var _lableData = {

				action : "add",
				
				nodeName : _modelNode.name,
				
				modelNodeIdentifier : _modelNode.identifier
				
			};
			
			_classPanelModelChildrenList.httpGetModelNodeLabelByIdentifier(_lableData.modelNodeIdentifier,function(result){
				
				if(result["code"]=="0" && result.data && result.data.length>0){
					
					result.data = result.data[0];
						
					result.data.action = "update";
					
					_classPanelModelChildrenEdit.SetModelNodeLabelInfo(result.data);
					
				}else{
					
					_classPanelModelChildrenEdit.SetModelNodeLabelInfo(_lableData);
					
				}
				
			});
			
			if(_this.GetLinkClass("ClassModelControl").GetIsModelNodeAnimate()){
				
				//请求动画
				var _lableData = {
	
					action : "add",
					
					nodeName : _modelNode.name,
					
					modelNodeIdentifier : _modelNode.identifier
					
				};
				
				_classPanelModelChildrenList.httpGetModelNodeAnimateByIdentifier(_lableData.modelNodeIdentifier,function(result){
					
					if(result["code"]=="0" && result.data && result.data.length>0){
						
						result.data = result.data[0];
							
						result.data.action = "update";
						
						_classPanelModelChildrenEdit.SetModelNodeAnimateInfo(result.data);
						
					}else{
						
						_classPanelModelChildrenEdit.SetModelNodeAnimateInfo(_lableData);
						
					}
					
				});
				
			}
			
		}
		
	}
	
	
	//类初始化
	this.Init = function(){
		
		var _classModelControl = _this.GetLinkClass("ClassModelControl");
		
		var _classPanelModelList = _this.GetLinkClass("ClassPanelModelList");
		
		var _classPanelModelChildrenList = _this.GetLinkClass("ClassPanelModelChildrenList");
		
		var _classPanelModelChildrenEdit = _this.GetLinkClass("ClassPanelModelChildrenEdit");
		
		var _classPanelModelParamSetting = _this.GetLinkClass("ClassPanelModelParamSetting");
		
		//绑定关闭按钮
		$panelMain.find(".x-panel-title .btn-close").unbind().on("click",function(){
			
			_this.ClosePanel();
			
		});
		
		//绑定关闭按钮
		$panelMain.find("[x-button-name]").unbind().on("click",function(){
			
			var $this = $(this),
			
				_val = $this.attr("x-button-name");
			
			switch (_val){
				
				case "load-model-children-param":
				
					_this.LoadModelNodeEditPanel();
					
					break;
					
				case "httpSaveModelView":
				
					_classPanelModelParamSetting.OpenPanel();
					
					break;	
					
				case "PlayModelAnimate":
				
					if($this.data("is-play")==true){
						
						$this.data("is-play",false);
						
						$this.html("播放模型动画");
						
						_classModelControl.PlayModelAction(false);
						
					}else{
						
						$this.data("is-play",true);
						
						$this.html("停止模型动画");
						
						_classModelControl.PlayModelAction(true);
						
					}
					
					break;
					
				case "setLockModel":
				
					if($this.data("is-play")==true){
						
						$this.data("is-play",false);
						
						$this.html("锁定模型");
						
						_classModelControl.SetModelLock(false);
						
					}else{
						
						$this.data("is-play",true);
						
						$this.html("解除锁定");
						
						_classModelControl.SetModelLock(true);
						
					}
					
					break;	
				
				default:
					break;
			}
			
		});
		
	}
	
}
