function beyonClock(domTime,domDate,domWeek){
	this.domTime = domTime;
	this.domDate = domDate;
	this.domWeek = domWeek;
	this.weekMap = new Map([[1,"星期一"],[2,"星期二"],[3,"星期三"],[4,"星期四"],[5,"星期五"],[6,"星期六"],[7,"星期日"]]);
	if(!domTime&&domDate&&domWeek)
		return;
	this._init();
}

beyonClock.prototype._init = function(){
	var me = this;
	this._updateTime(me);
	this.interval = setInterval(function(){
		me._updateTime(me);
	},1000);
}
beyonClock.prototype.dispose = function(){
	if(!this.interval)
		window.clearInterval(this.interval);
	this.interval = undefined;
}

beyonClock.prototype._updateTime = function(me){
	var date = new Date();
	if(me.domTime){
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var seconds = date.getSeconds();
		hours = hours > 9 ? hours : '0' + hours;
		minutes = minutes > 9 ? minutes : '0' + minutes;
		seconds = seconds > 9 ? seconds : '0' + seconds;
		var timeStr = hours +":"+ minutes + ":" + seconds;
		me.domTime.innerText = timeStr;
	}
	if(me.domDate){
		var month = date.getMonth()+1;
		month = month > 9 ? month : '0' + month;
		var day = date.getDate();
		day = day > 9 ? day : '0' + day;
		var dateStr = date.getFullYear() + "-" + month + "-" + day;
		me.domDate.innerText = dateStr;
	}
	if(me.domWeek){
		var weekDay = me.weekMap.get(date.getDay());
		me.domWeek.innerText = weekDay;
	}
}