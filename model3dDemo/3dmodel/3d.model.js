/***************************************测试代码*******************************************************/

var _XModelArray = [],
	_classSceneControl = new ClassSceneControl(),
	_classModelControl = new ClassModelControl(),
	_ModelTest;

(function($){
	
	$(document).ready(documentReady);
	
	function documentReady(){

		//创建模型控制对象
		_XModelClass0 = new _XModelClass();
		
		_XModelClass0.webObject = _webObject;
		
		_XModelClass0.SceneIndex = 0;
		
		//初始化scene
		_classSceneControl.InitLinkClass(_XModelClass0);
		
		_classSceneControl.CreateScene(0,"#model-main");
		
		//绑定屏幕单击事件
		_classSceneControl.AddEventListener("click",function(baseScene,root,selObj){
			
			//清除label
			_classModelControl.ClearScenesLabel();
			
			//选中的物体
			var _node=selObj.object;
			
			//判断是否选中，如果是空白，则取消上次锁定，可以进行选择，如果不是空白，则屏蔽点击
			if(!_node){
				
				return;
				
			}
			
			_classModelControl.SetModelNodeLabel(_node.name);
			
		});
		
		//初始化模型控制器
		_classModelControl.InitLinkClass(_XModelClass0);
		
		//测试菜单
		var $testDoc = $("#model-test");
		
		var $selectModelNodes = $testDoc.find("#model-nodes");
		
		$testDoc.find("[x-button-name]").on("click",function(){
			
			var $this = $(this),
			
				_val = $this.attr("x-button-name");
		
			_ModelTest[_val]();
			
		});
		
		//模型旋转
		var $buttonModelRotation = $testDoc.find("#model-rotation");
		
		$buttonModelRotation.on("click",function(){
			var $this = $(this),
				_keyName = "model-rotation-state",
				_val = $this.attr(_keyName);
			if(_val!="true"){
				_classModelControl.SetModelControlCameraRotateSwitch(true);
				$this.attr(_keyName,"true");
			}else{
				_classModelControl.SetModelControlCameraRotateSwitch(false);
				$this.removeAttr(_keyName);
			}
		});
		
		
		//========================测试function======================================
		_ModelTest = new Object();
		
		//载入模型
		_ModelTest.loadModel = function(){

			var _this = this;
			
			var _object = {
				index : 0,
				id: "040100300000002335",
				name: "拉森（DDG82）",
				path: "/model3dDemo/data/model/ddg83.glb",
				type: "海",
				guojia: "美",
				success : function(){
					
					//回调function
					setTimeout(function(){
						
						_this.__modelViewCameraPosition = JSON.stringify(_classModelControl.GetModelView());
						
					},500)
					
					_this.resolveModelNodeAllList();
					
					_this.resolveModelNodeAnimateList();
					
				}
			};
			
			if(_classModelControl.__modelId == _object.id){
				
				return;
				
			}
			
//			$.extend(true, _object, _option);
			
			_classModelControl.RemoveModel();
			
			_classModelControl.LoadModel(_object);
			
		}
		
		//重置模型
		_ModelTest.resetModel = function(){
			
			_classModelControl.ClearModelNodesAlphaColor();
			
			_classModelControl.ClearScenesLabel();
			
			_classModelControl.ClearModelNodeAllHighlight();
			
			
			var position = JSON.parse(this.__modelViewCameraPosition);
			
			_classModelControl.SetModelView(new THREE.Vector3(position.x,position.y,position.z));
			
			_classModelControl.ResetModelCenter();
			
		}
		
		//解析模型子节点
		_ModelTest.resolveModelNodeAllList = function(){
			
			_classModelControl.FormatModelNodeAllList();
			
			var _selectModelNodes = _classModelControl.GetModelNodeAllList();
			
			$selectModelNodes.empty();
			
			$.each(_selectModelNodes, function(index,el) {
				
				$option = $("<option></option>");
				
				$option.attr("value",el.name);
				
				$option.html(el.name);
				
				$selectModelNodes.append($option);
				
			});
		
		}
		
		//解析模型动画
		_ModelTest.resolveModelNodeAnimateList = function(){
			
			_classModelControl.FormatModelNodeAnimateList();
		
		}
		
		//取出模型动画列表
		_ModelTest.GetModelNodeAnimateList = function(){
			
			var _nodes = _classModelControl.GetModelNodeAnimateList();
			
			console.info(_nodes);
		
		}
		
		//根据name获取节点
		_ModelTest.GetModelNodeByName = function(){
			layui.layer.prompt({
			  value: 'C_指挥灯',
			  title: '请输入值',
			}, function(value, index, elem){
			  var _node = _classModelControl.GetModelNodeByName(value);
				
				if(_node){
					
					_classModelControl.SetModelNodePosition(_node);
					
				}else{
					
					layui.layer.msg("没有这个节点");
					
				}
				layui.layer.close(index);
			});
		}
		
		//获取选中节点
		_ModelTest.getSeletedNode = function(){
			
			var _node = $selectModelNodes.val();
			
			return _classModelControl.GetModelNodeByName(_node);
			
		}
		
		//显示节点
		_ModelTest.childrenNodeShow = function(){
			
			var _node = this.getSeletedNode();
			
			if(_node){
				
				var _id = _node.id;
				
				_classModelControl.SetModelNodeShow(_id,true);
				
				_classModelControl.SetModelNodeHighlight([_node.name]);
				
			}else{
				
				layui.layer.msg("没有选中节点");
				
			}
		
		}
		
		//隐藏节点
		_ModelTest.childrenNodeHidden = function(){
			
			var _node = this.getSeletedNode();
			
			if(_node){
				
				var _id = _node.id;
				
				_classModelControl.SetModelNodeShow(_id,false);
				
			}else{
				
				layui.layer.msg("没有选中节点");
				
			}
		
		}
		
		//获取节点位置
		_ModelTest.getNodePosition = function(){
			
			layui.layer.msg(JSON.stringify(_ModelTest.getSeletedNode().position));
			
		}
		
		//显示label
		_ModelTest.setModelNodeLabel = function(){
			
			var _node = this.getSeletedNode();
			
			_classModelControl.SetModelNodeLabel(_node.name);
			
		}
		
		//清除label
		_ModelTest.clearModelNodeLabel = function(){
			
			var _node = this.getSeletedNode();
			
			_classModelControl.ClearModelNodeLabel(_node.name);
			
		}
		
		//设置节点定位
		_ModelTest.setModelNodePosition = function(){
			
			var _this = this;
			
			layer.confirm('是否需要自定义坐标值？', {
			  btn: ['确定','取消'] //按钮
			}, function(index){
				layui.layer.prompt({
				  value: '0,0,0',
				  title: '请输入坐标值',
				}, function(value, index, elem){
					
					var _values = value.match(/(\d)/g);
					
					$.each(_values, function(index,el) {
						
						
						_values[index] = Number(el);
						
					});
					
					var _node = _this.getSeletedNode();
				
					var _cameraPosition = {
						
						cameraPosition : new THREE.Vector3(_values[0],_values[1],_values[2])
						
					};
					
					var _option = {
						
						view : JSON.stringify(_cameraPosition)
						
					};
					
					_classModelControl.SetModelNodePosition(_node,_option);
					
					layui.layer.close(index);
				});
				
				layui.layer.close(index);
			}, function(){
			  	
			  	var _node = _this.getSeletedNode();
				
				_classModelControl.SetModelNodePosition(_node);
			  	
			});
			
		}
		
		_ModelTest.Init = function(){
			
			var _this = this;
			
			layui.use(['element',"layer",'form'], function(){
						
				var element = layui.element; //导航的hover效果、二级菜单等功能，需要依赖element模块
				  
				  //监听导航点击
				element.on('nav(demo)', function(elem){
					
					//console.log(elem)
					layer.msg(elem.text());
					
				});
				  
				layui.form.render();
			  	
			});
			
		}
		
		_ModelTest.Init();
		
	}
	
})(jQuery);
