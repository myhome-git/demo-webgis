//折线图
function ClassEchartsLine(){
	
	//定义变量
	let _this = this,
		_option,
		_date,
		_dateData = new Map();
	
	//创建
	this.create = function(option){
		
		_option = option;
		this.setDate(_option.date)
    		.update();
    	
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
	
	this.setDate = function(date){
		_date = date;
		return this;
	}
	
	function onMouseMove(event){
		if(event.target.tagName!="CANVAS"){
			return;
		}
		let $this = $(event.target),
			_cache = $this.data("__cache"),
			_offsetX = event.offsetX;
			
			_offsetX += 1;
		
		//计算百分比
		let _startTime = _date.startTime,
    		_endTime = _date.endTime,
    		_count = _endTime.getTime()-_startTime.getTime();
    	
    	let _thisTime = _startTime.getTime()+_offsetX*_count/$this.outerWidth();
    		_thisTime = _thisTime.toString().replace(/\.\d+$/,"").replace(/\d{4,4}$/,"0000");
    		_thisTime = Number(_thisTime);
		let _d = _dateData.get(_cache.id);
//		console.info(_startTime.getTime(),_thisTime,_d.indexOf(_thisTime));

//		let _id = "template-echarts-tips";
//		let $tips = $("#"+_id);
//		if($tips.length>0){
//			$tips.remove();
//		}
//		console.info(_offsetX,_d.indexOf(_offsetX));
//		if(_d.indexOf(_offsetX)>-1){
//			$tips = $("<div id='"+_id+"' class='template-echarts-tips'></div>");
//			$this.after($tips);
////			$tips.html(WebLoader.classDate.responseDate(new Date(_thisTime),"yyyy-mm-dd hh:mm:ss"));
//			$tips.html(_offsetX);
//			$tips.css({"position":"absolute","left":(_offsetX+5)+"px","top":(event.offsetY-10)+"px"});
//		}
	}
	
	this.update = function(){
		let _startTime = _date.startTime,
    		_endTime = _date.endTime,
    		_count = _endTime.getTime()-_startTime.getTime();
    	
    	//设定颜色和颜色队列
		let _colors = [
			"255,0,0","0,184,120","30,159,255",
			"255,87,34","255,184,0","255,140,0","255,155,0","144,238,144",
			"0,206,209","199,21,133","0,186,189","255,120,0"
		];
		
		$.each(_colors, function(index,el) {
			_colors[index] = "rgba("+el+",1)";
		});
		
    	$.each(_option.dataX, function(index,el) {
    		el.elem.on("mousemove",onMouseMove);
    		el.elem.data("__cache",el);
    		let _ctx = el.elem.get(0).getContext("2d"),
    			_width = el.elem.outerWidth(),
    			_height = el.elem.outerHeight();
    		_ctx.clearRect(0,0,_width,_height);
    		
    		let _array = [];
    		$.each(el.data, function(i,e) {
    			let _time = new Date(e);
    			if(_time.getTime()>=_startTime.getTime() && _time.getTime()<=_endTime.getTime()){
	    			let _p = _time.getTime()-_startTime.getTime();
	    			let _x = _p/_count*_width;
	    				_x = parseInt(_x);
					_ctx.fillStyle=_colors[index];
					_ctx.fillRect(_x,0,1,_height);
					_array.push(_x);
    			}
    		});
    		_dateData.set(el.id,_array);
    	});
		return this;
	}
	
	this.resize = function(){
		$.each(_option.dataX, function(index,el) {
    		let $canvas = el.elem;
    		$canvas.attr("width",$canvas.parent().outerWidth())
    			.attr("height",$canvas.parent().outerHeight())
    	});
    	this.update();
	}
}