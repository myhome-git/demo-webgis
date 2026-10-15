var _pageObject = _pageObject || {};

(function($,parent,module) {
	
	$(document).ready(documentReady);
	
	function documentReady() {
		//初始化对象
		let _this = module;
		module.parent = parent;
		
		//初始化
		module.init = function(){
			this.parent.TABLE.init();
			
			//折线图
			let _echarts1 = this._echarts1 = new ClassEchartsLine();
			_echarts1.create(document.getElementById("echarts-1"))
        		.setAnimateSwitch(true);
			
			let _echarts2 = this._echarts2 = new ClassEchartsLine2();
			_echarts2.create(document.getElementById("echarts-2"))
				.setAnimateSwitch(true);
			
			let _echarts3 = this._echarts3 = new ClassEchartsHELIUTU();
			_echarts3.create(document.getElementById("echarts-3"))
				.setAnimateSwitch(true);
			
			let _echarts4 = this._echarts4 = new ClassEchartsTIAOXINGTU();
			_echarts4.create(document.getElementById("echarts-4"))
				.setAnimateSwitch(true);
			
		}
		
		//加载
		module.init();
		
	}
})(jQuery,_pageObject,_pageObject.MAIN={});

//表格
(function($,parent,module) {
	//初始化对象
	let _this = module;
	module.parent = parent;
	
	//定义变量
	let $body = $("body"),
		$xHiddenWindow = $("#x-hidden-window"),
		$layuiTable = $body.find("#layui-table-data"),
		$layuiTableTopToolbar = $body.find("#layui-table-top-toolbar"),
		_xUtilLayuiTable = new xUtilLayuiTable();
	
	//载入表格
	module.LoadTable = function(){
		
		var _data = {};
		
		//判断结束时间是否小于开始时间
		if(new Date(_data.end).getTime()-new Date(_data.start).getTime()<0){
			layui.layer.msg("结束时间不能小于开始时间");
			return false;
		}
		
		//复写方法，浏览器缩放时可以动态设置
		_xUtilLayuiTable.GetTableAutoHeight = function(){
			return "auto";
		}
		
		function onResize(event){
			return _xUtilLayuiTable.GetTableAutoHeight();
		}
		
		function onRowClick(obj){
			
		}
		
		function onSelected(data,obj){

		}
		
		//行工具栏点击
		function onRowTool(obj){
			var data = obj.data,
				layEvent = obj.event;
				
			layui.layer.msg(layEvent);
			
			if(layEvent == 'delete') {
				layer.confirm('删除后数据不可进行恢复，是否继续？', {
					btn: ['确认删除', '取消'],
					title: "系统确认",
					shade : 0.1,
					success: function(layero, index) {
						
					}
				},
				function(index, layero) {
					_this.DeleteById(data.id);
				},
				function(index) {
					
				});
			}else if(layEvent == 'update'){
				
			}
		}
		
		_xUtilLayuiTable.init({
			elem: "#"+$layuiTable.attr("id"),
			cellMinWidth: 1,
			height: _xUtilLayuiTable.GetTableAutoHeight(),
			page : false,
			cols: _this.__tableHeader || [],
			url: "layui.table.json",
			method : "get",
			toolbar : false,
			parseData:function (result) {
				let $box = $layuiTable.closest(".x-bean-content");
				
				let _newData = [];
				let _d = result.data[0];
				for(let i=0;i<50;i++){
					if((i+1)*35 > ($box.outerHeight()-100)){
						break;
					}
					let _newD = {};
					for(let x in _d){
						_newD[x] = _d[x];
					}
					_newD.id = i+1;
					_newData.push(_newD);
				}
				result.data = _newData;
				return {
					code:0,
					count: result.page ? result.page.rsCount || result.page.total || 0 : 0,
					data:result.data
				}
			},
//				request:{
//					pageName:'pageIndex',
//					limitName:'pageSize'
//				},
			where : (function(){
				var _data = {};
				for(var i in _data){
					if(!_data[i]){
						delete _data[i];
					}
				}
				return _data;
			})(),
			callback : {
				onRowClick : onRowClick,
				onRowTool : onRowTool,
				onSelected : onSelected,
				onResize : onResize
			}
		});
		
	}
	
	//删除数据
	module.removeById = function(idArray){
		layui.layer.confirm('您确认删除这条数据吗？', {icon: 3, title:'提示'}, function(index){
			let _data = JSON.stringify({
				ids : idArray
			});
			xUtilBase.ajax({
				url : SYSTEM.PAGEURL.GetURL("http.module.music.delete"),
				type : "post",
				data : _data,
				contentType:"application/json",
				success : function(data){
					if(data["code"]=="0"){
						layui.layer.msg("删除成功");
						_xUtilLayuiTable.reload();
					}else{
						layui.layer.msg(data["message"],{time:5000});
					}
				}
			});
		});
	}
	
	//初始化
	module.init = function(){
		
		$body = $("body"),
		$xHiddenWindow = $("#x-hidden-window"),
		$layuiTable = $body.find("#layui-table-data"),
		_xUtilLayuiTable = new xUtilLayuiTable();
		
		layui.use(['form','laydate','table'], function(){
			
			//预留加载数据接口
			$.when(
				
				//请求逻辑
				
			).then(function(){
				
				$.each(arguments, function(index,el) {
					
					if(el[0] instanceof Object && el[0].code==0){
						
						console.info(el[0]);
						
					}
					
				});
				
				//渲染表单
				layui.form.render();
				
				//设置表格头
				_this.__tableHeader = _mainJSON.table.header;
				
				//开始加载表格
				_this.LoadTable();
				
			},function(){
				
				throw new Error(arguments[1]+"："+arguments[0].status);
				
			});
			
		});
		
	}
	
	//加载
	module.init();
	
})(jQuery,_pageObject,_pageObject.TABLE={});