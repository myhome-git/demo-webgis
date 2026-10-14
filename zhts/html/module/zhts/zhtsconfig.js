//综合态势配置脚本
var zhtsConfig = function () {
    //配置可接收的实时数据源
    var _websocketarr = [];
    //接收或者显隐状态--------->用于记录当前是打开功能默认显示隐藏实时态势数据状态的变量，“0”为打开战略态势；“1”为打开综合态势
    var _showstatus = 0;
    //战略态势显示状态--------->用于记录战略态势功能是否已经处于打开状态
    var _zltsShowStatus = true;
    this.websocketarr = _websocketarr;
    this.showstatus = _showstatus;
    this.zltsShowStatus = _zltsShowStatus;
    this.showMenu = false;
    //当前选中的对象
    this.trackObj = {};
    //用于控制态势图层信源接收设置，动态配置；设置哪个就显示哪些节点
    /**
     * name----->名称
     * queuename------>队列名称
     * show----->是否显示
     */
    this.tstcsettingObj = [
        { name: "融合结果", queuename: "SSTS_RHJG_4", show: true },
        { name: "联合海情", queuename: "SSTS_LHHQ_1", show: true },
        { name: "联合空情", queuename: "SSTS_LHKQ_3", show: true },
        { name: "技侦态势", queuename: "SSTS_JZTS_2", show: true },
        { name: "电侦态势", queuename: "SSTS_DZTS_5", show: true },
        { name: "航侦态势", queuename: "SSTS_HZTS_10", show: true },
        { name: "态势快报", queuename: "SSTS_TSKB_11", show: true },
        { name: "联合空情_南部战区", queuename: "SSTS_LHKQ_NBZQ_7", show: true }
    
    ];

    //用于控制数据源接收复选框显示隐藏
    this.zhtssourceObj = {
        "SSTS_RHJG_4": false,
        "SSTS_LHHQ_1": false,
        "SSTS_LHKQ_3": false,
        "SSTS_JZTS_2": false,
        "SSTS_DZTS_5": false,
        "SSTS_HZTS_10": false,
        "SSTS_TSKB_11": false,
        "SSTS_LHKQ_NBZQ_7": false
    };

    this.init();
}

zhtsConfig.prototype.init = function () {
    //根据动态对象配置接收多选框显示于隐藏
    this.configrhjgckIsShow();
}

zhtsConfig.prototype.getwebsocketArr = function () {
    return this.websocketarr;
}

zhtsConfig.prototype.setwebsocketArr = function (arr) {
    this.websocketarr = arr;
}

zhtsConfig.prototype.getshowstatusVal = function () {
    return this.showstatus;
}

zhtsConfig.prototype.setshowstatusVal = function (val) {
    this.showstatus = val;
}

zhtsConfig.prototype.getzltsShowStatus = function () {
    return this.zltsShowStatus;
}

zhtsConfig.prototype.setzltsShowStatus = function (val) {
    this.zltsShowStatus = val;
}

zhtsConfig.prototype.setShowMenu = function (show) {
    this.showMenu = show;
}

zhtsConfig.prototype.isShowMenu = function () {
    return this.showMenu;
}

zhtsConfig.prototype.gettrackObj = function () {
    return this.trackObj;
}

zhtsConfig.prototype.settrackObj = function (obj) {
    this.trackObj = obj;
}

zhtsConfig.prototype.configrhjgckIsShow = function () {
    var arr = this.tstcsettingObj;
    var domarr = $("[lay-filter='rhjgck']");
    domarr.each(function () {
        var _ = $(this);
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].queuename == _.data("ckvalue")) {
                if (arr[i].show) {//则显示多选框
                    _.next().css("display", "block");
                } else {//则隐藏多选框
                    _.next().css("display", "none");
                }
            }
        }
    });
}

zhtsConfig.prototype.gettstcsettingObj = function () {
    return this.tstcsettingObj;
}

zhtsConfig.prototype.getzhtssourceObj = function () {
    return this.zhtssourceObj;
}

zhtsConfig.prototype.setzhtssourceObj = function (obj) {
    this.zhtssourceObj = obj;
}