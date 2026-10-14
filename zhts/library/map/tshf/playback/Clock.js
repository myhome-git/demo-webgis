/**
 * 态势回放计时器
 */
Clock = function (trackController, callback, options) {
  if (trackController) {
    this._trackController = trackController;
    this._cursor = trackController.getStartTime();
  }
  this._callbacksArry = [];
  if (callback)
    this.addCallback(callback);
  if (options) {
    this._speed = options.speed;
    this._tickLen = options.tickLen;
    this._transitionTime = this._tickLen / this._speed;
  }

  this._tick = function (self) {

    var etime = self._trackController.getEndTime();
    var scur = self._cursor;

    if (self._cursor > self._trackController.getEndTime()) {
      self.stop();
      //分时加载
      var count = self.timeslice.getTimeStepCount();
      var total = self.timeslice.getTotalTimeStepCount();

      if (count > 0) {

        var bt = self.timeslice.getTimeGroup()[(total - count)];
        self.timeslice.timeDeCount();
        self.tshf.updateTshfData(bt[0], bt[1], self.timeslice.getNum());
        return

      } else {
        //回放结束，清除定时器
        clearInterval(self._intervalID);
        self.tshf.stop(self._trackController.getStartTime());
        return;
      }

    } else {
      self._trackController.tock(self._cursor, self._transitionTime);
      self._callbacks(self._cursor);
      self._cursor += self._tickLen;
    }

  };
  this._callbacks = function (cursor) {
    var arry = this._callbacksArry;
    for (var i = 0, len = arry.length; i < len; i++) {
      arry[i](cursor);
    }
  };
};


Clock.prototype.setTimeSlice = function(timeslice){
    this.timeslice = timeslice;
}

Clock.prototype.getTimeSlice = function(){
    return this.timeslice;
}


Clock.prototype.setTshf = function(tshf){
    this.tshf = tshf;
}

Clock.prototype.getTshf = function(){
   return this.tshf;
}


Clock.prototype.addCallback = function (fn) {
  this._callbacksArry.push(fn);
};


Clock.prototype.start = function () {
  if (this._intervalID) return;
  this._intervalID = window.setInterval(
    this._tick,
    this._transitionTime,
    this);
};

Clock.prototype.stop = function () {
  if (!this._intervalID) return;
  clearInterval(this._intervalID);
  this._intervalID = null;
};

Clock.prototype.getSpeed = function () {
  return this._speed;
};

Clock.prototype.isPlaying = function () {
  return this._intervalID ? true : false;
};

Clock.prototype.setSpeed = function (speed) {
  this._speed = speed;
  this._transitionTime = this._tickLen / speed;
  if (this._intervalID) {
    this.stop();
    this.start();
  }
};

Clock.prototype.setCursor = function (ms) {
  var time = parseInt(ms);
  if (!time) return;
  var mod = time % this._tickLen;
  if (mod !== 0) {
    time += this._tickLen - mod;
  }
  this._cursor = time;
  this._trackController.tock(this._cursor, 0);
  this._callbacks(this._cursor);
};

Clock.prototype.getTime = function () {
  return this._cursor;
};

Clock.prototype.getStartTime = function () {
  return this._trackController.getStartTime();
};

Clock.prototype.getEndTime = function () {
  return this._trackController.getEndTime();
};

Clock.prototype.getTickLen = function () {
  return this._tickLen;
};

