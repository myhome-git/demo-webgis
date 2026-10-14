var _pageObject = _pageObject || {};

(function ($,module) {
    $(document).ready(documentReady);
    function documentReady() {
        module.MAIN.init();
    }
})(jQuery,_pageObject);

//入口
(function($,parent,module){
	module.parent = parent;
	let _this = module;
	
	module.init = function(){
		parent.SHIXUTU_ECHARTS.init();
	}
	
})(jQuery,_pageObject,_pageObject.MAIN={});

/**
 * 网络分析
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this = module,$doc;
	
	module.httpGetDataById = function(option){
		let _moduleName = "http.zhts.ssts.mubiao.shixutu.getById",
			_url = getModuleURL(_moduleName);
		let _sendData = JSON.stringify(option.data);
		xUtilBase.ajax({
			url : _url,
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					if(!result.data){
						layui.layer.msg("数据格式不正确");
						return false;
					}
					if(option.success){
						option.success(result.data);
					}
				}else{
					console.info(result.msg);
				}
			}
		});
	}
	
	module.initPanel = function(data,date){
		let _newMap = new Map();
		let _newData = [];
		
		for(let i in data){
			$.each(data[i], function(index,el) {
				let _m = _newMap.get(i);
				if(!_m){
					_m = new Map();
					_m.set("startTime",el.wzsj);
					_m.set("endTime",el.wzsj);
					_newMap.set(i,_m);
				}else{
					if(new Date(el.wzsj).getTime()>new Date(_m.get("endTime")).getTime()){
						_m.set("endTime",el.wzsj);
						_newMap.set(i,_m);
					}
				}
				let _count = _newMap.get("count");
				if(!_count){
					_count = new Map();
					_count.set("startTime",el.wzsj);
					_count.set("endTime",el.wzsj);
					_newMap.set("count",_count);
				}else{
					if(new Date(el.wzsj).getTime()>new Date(_count.get("endTime")).getTime()){
						_count.set("endTime",el.wzsj);
						_newMap.set("count",_count);
					}else if(new Date(el.wzsj).getTime()<new Date(_count.get("startTime")).getTime()){
						_count.set("startTime",el.wzsj);
						_newMap.set("count",_count);
					}
				}
			});
		}
		
		let _count = _newMap.get("count");
		let _startTime = new Date(_count.get("startTime"));
		let _endTime = new Date(_count.get("endTime"));
		_newMap.forEach(function(value,key){
			if(key!="count"){
				let _sTime = new Date(value.get("startTime")),
					_eTime = new Date(value.get("endTime"));
				_newData.push({
					start: Date.UTC(_sTime.getFullYear(),_startTime.getMonth()+1,_startTime.getDate()),
		            end: Date.UTC(_endTime.getFullYear(),_endTime.getMonth()+1,_endTime.getDate()),
		            completed: (_endTime.getTime()-_sTime.getTime())/(_endTime.getTime()-_startTime.getTime()),
		            name:key
				});
				
			}
		});
		_newData = [{
            start: Date.UTC(2017, 11, 1),
            end: Date.UTC(2018, 1, 2),
            completed: 0.95,
            name: 'Prototyping'
        }, {
            start: Date.UTC(2018, 1, 2),
            end: Date.UTC(2018, 11, 5),
            completed: 0.5,
            name: 'Development'
        }, {
            start: Date.UTC(2018, 11, 8),
            end: Date.UTC(2018, 11, 9),
            completed: 0.15,
            name: 'Testing'
        }, {
            start: Date.UTC(2018, 11, 9),
            end: Date.UTC(2018, 11, 19),
            completed: {
                amount: 0.3,
                fill: '#fa0'
            },
            name: 'Development'
        }, {
            start: Date.UTC(2018, 11, 10),
            end: Date.UTC(2018, 11, 23),
            name: 'Testing'
        }, {
            start: Date.UTC(2018, 11, 25, 8),
            end: Date.UTC(2018, 11, 25, 16),
            name: 'Release'
        }];
		this.initEcharts(_newData);

		//折线图
//		let _echarts1 = this._echarts1 = new ClassEchartsLine();
//		_echarts1.create(document.getElementById("shixutu-echarts"))
//  		.setAnimateSwitch(true);
	}
	
	module.initEcharts = function(data){
		Highcharts.ganttChart('shixutu-echarts', {
		    title: false,
		    yAxis: {
		        uniqueNames: true
		    },
		    navigator: {
		        enabled: true,
		        liveRedraw: true,
		        series: {
		            type: 'gantt',
		            pointPlacement: 0.5,
		            pointPadding: 0.25
		        },
		        yAxis: {
		            min: 0,
		            max: 10,
		            reversed: true,
		            categories: []
		        }
		    },
		    scrollbar: {
		        enabled: false
		    },
		    rangeSelector: {
		        enabled: true,
		        selected: 0
		    },
		    series: [{
		        name: 'Project 1',
		        data : data
		    }]
		});
	}
	
	module.init = function(){
		$doc = $("#x-view-content");
		
		let _parmas = location.search.replace(/^\?+/,"");
		try{
			_parmas = JSON.parse(decodeURIComponent(_parmas));
		}catch(e){
			_parmas = {};
		}
		parent.HTTP.httpGetSXTById({
			data : {
				"mbbh": "0320200020080100001226",
				"startTime": "2020-08-01 00:00:00",
				"endTime": "2020-08-01 15:00:00"
			}||_parmas,
			success : function(result){
				_this.initPanel(result,{
					"startTime": "2020-08-01 00:00:00",
					"endTime": "2020-08-01 15:00:00"
				});
			}
		});
	};
	
})(jQuery,_pageObject,_pageObject.SHIXUTU_ECHARTS={});

/**
 * http请求逻辑
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this = module;
	
	/**
	 * 获取时序图
	 * @param {Object} option
	 */
	module.httpGetSXTById = function(option){
		let _moduleName = "http.zhts.ssts.mubiao.shixutu.getById",
			_url = getModuleURL(_moduleName);
		let _sendData = JSON.stringify(option.data);
		xUtilBase.ajax({
			url : _url,
			data : _sendData,
			success : function(result){
				if(result["code"]=="0"){
					if(!result.data){
						layui.layer.msg("数据格式不正确");
						return false;
					}
					if(option.success){
						option.success(result.data);
					}
				}else{
					layui.layer.msg("数据请求失败",{time:5000});
				}
			}
		});
	};
	
})(jQuery,_pageObject,_pageObject.HTTP={});
