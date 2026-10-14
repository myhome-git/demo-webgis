/**
 * 时间分片工具
 */
var TimeSlice = function(stime,etime,timelimit,num){

	//console.log(Date.parse(new Date("2016-12-01 22:20:00")));
	this._stime = Date.parse(new Date(stime));
	this._etime = Date.parse(new Date(etime));
	this._num = num;
//	console.log(this._stime);
	
	this.timelimit = timelimit||5;	
	var between_misecond=this._etime -this._stime;
	var between_mintis = between_misecond/60000;
	var count = between_mintis/this.timelimit;
	/*var t = between_mintis%timelimit;
	if(t>0){
		count++;
	}*/
	this.count = count;
	this.total = count;
	this._setTimeGroup(count,timelimit);
}

/**
 * 获取指定间隔时间数量
 * 
 * @returns {Number}
 */
TimeSlice.prototype.getTimeStepCount=function(){	
	return this.count;
} 

TimeSlice.prototype.getTotalTimeStepCount=function(){	
	return this.total;
} 

/**
 * 每次对时间间隔数减一
 */
TimeSlice.prototype.timeDeCount=function(){	
	  var count  = this.count;
	  if(count>0){
		  this.count=count-1;
	  }
}

TimeSlice.prototype.getTimeGroup = function(){
	return this.timegroup;
}


TimeSlice.prototype._setTimeGroup = function(count,timelimit){
	var groups = [];
	for(var i=0;i<count;i++){
		
		var stime1 = this._stime+(timelimit*1000*60)*i;
		var etime1 = this._stime+(timelimit*1000*60)*(i+1);
		if(etime1>this._etime){
			etime1 = this._etime;
		}
		
		groups.push([stime1,etime1]);
	}
	this.timegroup = groups;
}


TimeSlice.prototype.getStarttime = function(){
	return this._stime;
}


TimeSlice.prototype.getEndtime = function(){
	return this._etime;
}

TimeSlice.prototype.getNum = function(){
	return this._num;
}


TimeSlice.prototype.clockCallback=function(ms) {
    console.log(ms);
    $('#cursor-date').html(ol.Playback.Util.DateStr(ms));
    $('#cursor-time').html(ol.Playback.Util.TimeStr(ms));
};

TimeSlice.prototype.sliderValToSpeed=function(val) {
    if (val < 0) 
    	return parseFloat((1+val/10).toFixed(2));
    return val + 1;
}











