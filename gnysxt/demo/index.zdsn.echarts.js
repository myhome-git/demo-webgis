//Echarts父类接口
function ClassEchartsParent() {
	
	//定义变量
	let _this = this;
	this.__cacheData = {};
	
    this.getEchartType = function(){
    	return "parent";
    }
    
    this.setCacheData = function(data){
    	this.__cacheData = data;
    	return this;
    }
    
    this.getCacheData = function(){
    	return this.__cacheData;
    }
    
    this.getEchart = function(){
		return this.getCacheData().myEchart;
	}
    
    this.getElement = function(){
    	return this.getCacheData().element;
    }
    
    //初始化创建
    this.create = function(element,type,option){}
    
    //窗口大小变化
    this.resize = function(callback){
    	this.getEchart().resize();
		if(callback){
			callback();
		}
    }
    
    //重新载入
    this.reload = function(callback){
		this.getEchart().reload();
		if(callback){
			callback();
		}
    }
    
    //打开动画开关，如果false则动画停止
    this.setAnimateSwitch = function(run){
    	this.getCacheData().isAnimate = run;
    	if(this.runAnimate){
    		this.runAnimate();
    	}
    	return this;
    }
    
    this.getAnimateSwitch = function(){
    	return this.getCacheData().isAnimate;
    }
    
    //运行前请先打开setAnimateSwitch方法
    this.runAnimate = function(){}
    
    //这个方法通常用在需要更换echarts图表类型用到
    this.clearElement = function(){
    	let _element = this.getElement(),
    		$element = $(_element);
    	$element.empty().removeAttr("_echarts_instance_");
    }
    
    return {
		create : this.create,
		getEchart : this.getEchart,
		getEchartType : this.getEchartType
	};
	
}
		    
//折线图
function ClassEchartsLine(){
	//继承
	ClassEchartsParent.call(this);
	
	//定义变量
	let _this = this;
	
	this.getEchartType = function(){
    	return "line";
    }
	
	//创建
	this.create = function(element,type,option){
		
		// 基于准备好的dom，初始化echarts实例
        let _myEchart = echarts.init(element);
        
        let _dataRandomLength = 100;
        
        function formatTime(date){
        	return xUtilBase.classDate.responseDate(date,"yyyy-mm-dd hh:mm:ss").replace(/-/g,"/");
        }
        
        let _data = [];
        let _startDate = new Date().getTime()-1000*_dataRandomLength;
		for (var i = 0; i < _dataRandomLength; i++) {
		    _data.push(randomData(new Date(_startDate+1000*i)));
		}
        function randomData(date){
        	let _date = new Date(formatTime(date));
    			_value = parseInt(Math.random()*200+1),
    			_name = formatTime(_date).toString();
        	return {
        		name: _name,
		        value: [_name,Math.round(_value)]
        	};
        }

        //折线图（不平滑线）
		let _option = {
		    grid : {
		    	top : "10px",
		    	right : "0",
		    	bottom : "24px",
		    	left : "40px",
		    },
		    xAxis:  {
//		        type: 'category',
		        type: 'time',
		        boundaryGap: false,
		        axisLine: {
                   lineStyle: {
                       color: '#6b88b3'
                   }
				},
		        splitLine:{  
		            show:true,
				    lineStyle:{
				    	color:'rgba(255,255,255,0.1)',
				    	width: 1,
				    	style : "dotted"
				    }
		        }
		    },
		    yAxis: {
		        type: 'value',
		        splitLine: {
		            show: false
		        },
		        axisLine: {
                   lineStyle: {
                       color: '#6b88b3'
                   }
				},
		        splitLine:{  
		            show:true,
				    lineStyle:{
				    	color:'rgba(255,255,255,0.1)',
				    	width: 1,
				    	style : "dotted"
				    }
		        },
		    },
		    textStyle : {
		    	color : "#ffffff"
		    },
		    series: [
		        {
		            type:'line',
		            showSymbol: false,
					hoverAnimation: false,
		            lineStyle: {
				      color: "#FFCC00"
				    },
		            data:_data
		        }
		    ]
		};

        // 使用刚指定的配置项和数据显示图表。
        $.extend(true,_option,option);
        _myEchart.setOption(_option);
        
        let _conf = {
	    	element : element,
	    	option : _option,
	    	myEchart : _myEchart,
	    	isAnimate : false
	    };
        $.extend(true, this.getCacheData(), _conf);
        
        this.runAnimate = function(){
        	if(!_this.getAnimateSwitch()){
        		return;
        	}
        	
//      	console.info(_myChart.id);
        	for (var i = 0; i < 1; i++) {
		        _data.shift();
		        let _newValue = randomData();
		        _data.push(_newValue);
		    }
					
		    _this.getCacheData().myEchart.setOption({
		        series: [{
		            data:_data
		        }]
		    });
		    setTimeout(function(){
		    	_this.runAnimate();
		    },1000);
		    
		    return _this;
        }
        
        $(window).on("resize",function(event){
			//延时
			_this.__echartLoadClock = event.timeStamp;
			setTimeout(function(){
	            if(_this.__echartLoadClock-event.timeStamp==0){
	            	_this.resize();
	            }
			},250);
		})
		return this;
	}
	
}

//test2
function ClassEchartsLine2(){
	//继承
	ClassEchartsParent.call(this);
	
	//定义变量
	let _this = this,
		_classEchartsLine;
	
	this.getEchartType = function(){
    	return "line2";
    }
	
	this.create = function(element){
		let _option = {
			series: [
		        {
		            lineStyle: {
				      color: "#e631dd"
				    }
		        }
		    ]
		};
		_classEchartsLine = new ClassEchartsLine();
		_classEchartsLine.create(element,null,_option);
		return _classEchartsLine;
	}
	
	this.getLinkClass = function(){
		return _classEchartsLine;
	}
}

//test3
function ClassEchartsTIAOXINGTU(){
	//继承
	ClassEchartsParent.call(this);
	
	//定义变量
	let _this = this,
		_classEchartsLine;
	
	this.getEchartType = function(){
    	return "DATIAOTU";
    }
	
	this.create = function(element){
		let _option = {
			series: [
		        {
		            lineStyle: {
				      color: "#77DC14"
				    }
		        }
		    ]
		};
		_classEchartsLine = new ClassEchartsLine();
		_classEchartsLine.create(element,null,_option);
		
		return _classEchartsLine;
	}
	
	this.getLinkClass = function(){
		return _classEchartsLine;
	}
}

//河流图
function ClassEchartsHELIUTU(){
	//继承
	ClassEchartsParent.call(this);
	
	//定义变量
	let _this = this;
	
	this.getEchartType = function(){
    	return "HELIUTU";
    }
	
	//创建
	this.create = function(element,type,option){
		
		// 基于准备好的dom，初始化echarts实例
        let _myEchart = echarts.init(element);
        
        let _option = {
			grid : {
		    	top : "10px",
		    	right : "10px",
		    	bottom : "30px",
		    	left : "10px",
		    },
		    xAxis:  {
		        axisLine: {
                   lineStyle: {
                       color: '#6b88b3'
                   }
				},
		        splitLine:{  
		            show:true,
				    lineStyle:{
				    	color:'rgba(255,255,255,0.1)',
				    	width: 2
				    }
		        }
		    },
		    yAxis: {
		        splitLine: {
		            show: false
		        },
		        axisLine: {
                   lineStyle: {
                       color: '#6b88b3'
                   }
				},
		        splitLine:{  
		            show:true,
				    lineStyle:{
				    	color:'rgba(255,255,255,0.1)',
				    	width: 2
				    }
		        },
		    },
		    singleAxis: {
		        top: "0px",
		        right : "30px",
		        bottom: "40px",
		        left : "30px",
		        axisTick: {},
		        axisLabel: {},
		        type: 'time',
		        axisPointer: {
		            animation: true,
		            label: {
		                show: false
		            }
		        },
		        splitLine: {
		            show: false,
		            lineStyle: {
		                type: 'dashed',
		                opacity: 0.2
		            }
		        }
		    },
		    textStyle : {
		    	color : "#ffffff"
		    },
		    series: [
		        {
		            type: 'themeRiver',
		            emphasis: {
		                itemStyle: {
		                    shadowBlur: 20,
		                    shadowColor: 'rgba(0, 0, 0, 0.8)'
		                }
		            },
		            data: [['2015/11/08',10,'DQ'],['2015/11/09',15,'DQ'],['2015/11/10',35,'DQ'],
		            ['2015/11/11',38,'DQ'],['2015/11/12',22,'DQ'],['2015/11/13',16,'DQ'],
		            ['2015/11/14',7,'DQ'],['2015/11/15',2,'DQ'],['2015/11/16',17,'DQ'],
		            ['2015/11/17',33,'DQ'],['2015/11/18',40,'DQ'],['2015/11/19',32,'DQ'],
		            ['2015/11/20',26,'DQ'],['2015/11/21',35,'DQ'],['2015/11/22',40,'DQ'],
		            ['2015/11/23',32,'DQ'],['2015/11/24',26,'DQ'],['2015/11/25',22,'DQ'],
		            ['2015/11/26',16,'DQ'],['2015/11/27',22,'DQ'],['2015/11/28',10,'DQ'],
		            ['2015/11/08',35,'TY'],['2015/11/09',36,'TY'],['2015/11/10',37,'TY'],
		            ['2015/11/11',22,'TY'],['2015/11/12',24,'TY'],['2015/11/13',26,'TY'],
		            ['2015/11/14',34,'TY'],['2015/11/15',21,'TY'],['2015/11/16',18,'TY'],
		            ['2015/11/17',45,'TY'],['2015/11/18',32,'TY'],['2015/11/19',35,'TY'],
		            ['2015/11/20',30,'TY'],['2015/11/21',28,'TY'],['2015/11/22',27,'TY'],
		            ['2015/11/23',26,'TY'],['2015/11/24',15,'TY'],['2015/11/25',30,'TY'],
		            ['2015/11/26',35,'TY'],['2015/11/27',42,'TY'],['2015/11/28',42,'TY'],
		            ['2015/11/08',21,'SS'],['2015/11/09',25,'SS'],['2015/11/10',27,'SS'],
		            ['2015/11/11',23,'SS'],['2015/11/12',24,'SS'],['2015/11/13',21,'SS'],
		            ['2015/11/14',35,'SS'],['2015/11/15',39,'SS'],['2015/11/16',40,'SS'],
		            ['2015/11/17',36,'SS'],['2015/11/18',33,'SS'],['2015/11/19',43,'SS'],
		            ['2015/11/20',40,'SS'],['2015/11/21',34,'SS'],['2015/11/22',28,'SS'],
		            ['2015/11/23',26,'SS'],['2015/11/24',37,'SS'],['2015/11/25',41,'SS'],
		            ['2015/11/26',46,'SS'],['2015/11/27',47,'SS'],['2015/11/28',41,'SS'],
		            ['2015/11/08',10,'QG'],['2015/11/09',15,'QG'],['2015/11/10',35,'QG'],
		            ['2015/11/11',38,'QG'],['2015/11/12',22,'QG'],['2015/11/13',16,'QG'],
		            ['2015/11/14',7,'QG'],['2015/11/15',2,'QG'],['2015/11/16',17,'QG'],
		            ['2015/11/17',33,'QG'],['2015/11/18',40,'QG'],['2015/11/19',32,'QG'],
		            ['2015/11/20',26,'QG'],['2015/11/21',35,'QG'],['2015/11/22',40,'QG'],
		            ['2015/11/23',32,'QG'],['2015/11/24',26,'QG'],['2015/11/25',22,'QG'],
		            ['2015/11/26',16,'QG'],['2015/11/27',22,'QG'],['2015/11/28',10,'QG'],
		            ['2015/11/08',10,'SY'],['2015/11/09',15,'SY'],['2015/11/10',35,'SY'],
		            ['2015/11/11',38,'SY'],['2015/11/12',22,'SY'],['2015/11/13',16,'SY'],
		            ['2015/11/14',7,'SY'],['2015/11/15',2,'SY'],['2015/11/16',17,'SY'],
		            ['2015/11/17',33,'SY'],['2015/11/18',40,'SY'],['2015/11/19',32,'SY'],
		            ['2015/11/20',26,'SY'],['2015/11/21',35,'SY'],['2015/11/22',4,'SY'],
		            ['2015/11/23',32,'SY'],['2015/11/24',26,'SY'],['2015/11/25',22,'SY'],
		            ['2015/11/26',16,'SY'],['2015/11/27',22,'SY'],['2015/11/28',10,'SY'],
		            ['2015/11/08',10,'DD'],['2015/11/09',15,'DD'],['2015/11/10',35,'DD'],
		            ['2015/11/11',38,'DD'],['2015/11/12',22,'DD'],['2015/11/13',16,'DD'],
		            ['2015/11/14',7,'DD'],['2015/11/15',2,'DD'],['2015/11/16',17,'DD'],
		            ['2015/11/17',33,'DD'],['2015/11/18',4,'DD'],['2015/11/19',32,'DD'],
		            ['2015/11/20',26,'DD'],['2015/11/21',35,'DD'],['2015/11/22',40,'DD'],
		            ['2015/11/23',32,'DD'],['2015/11/24',26,'DD'],['2015/11/25',22,'DD'],
		            ['2015/11/26',16,'DD'],['2015/11/27',22,'DD'],['2015/11/28',10,'DD']]
		        }
		    ]
		};
		
		// 使用刚指定的配置项和数据显示图表。
        $.extend(true,_option,option);
       _myEchart.setOption(_option);
        
        let _conf = {
	    	element : element,
	    	option : _option,
	    	myEchart : _myEchart,
	    	isAnimate : false
	    };
       $.extend(true, this.getCacheData(), _conf);
        
         $(window).on("resize",function(event){
			//表格载入锁，延时
			_this.__echartLoadClock = event.timeStamp;
			setTimeout(function(){
	            if(_this.__echartLoadClock-event.timeStamp==0){
	            	_this.resize();
	            }
			},250);
		});
		
		return this;
	}
}
