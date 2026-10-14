/*
	option.onClose
*/
function XZQH(option) {
    this.option = option || {};
    this.map = option.map || BIGMap.map;
    this.callback = option.callback||function(){};

    this.wrapper = $('<div>').addClass('city-box').attr("id","temp-city-box");
    this.wrapperInner = $('<div>').addClass('city-box-inner');
    this.wrapperInner.appendTo(this.wrapper);
    this.closeButton = $('<div>').addClass('com-icon city_close');
    this.closeButton.appendTo(this.wrapperInner);
    this.defaultSpan = $('<span>');
    $('<div>').addClass('def_city_con').append('<div><span>当前城市：</span></div>').appendTo(this.wrapperInner);

    this._render();
    this.wrapper.appendTo($('body'))
    $('div.def_city_con>div').append(this.defaultSpan);
    this._eventbind();
}
XZQH.getRegionByName = function(where,name){
    if(!name) return null;
    var xzqData=[];
    switch(where){
        case 'hotcity':
            xzqData = xzqHotCityData;
        break;
        case 'china':
            xzqData = xzqChinaData;
        break;
        case 'country_region':
        xzqData = xzqCountyData;
        break;
    }
    for(var i=0,len=xzqData.length;i<len;i++){
        if(xzqData[i].N == name){
            return xzqData[i]
        }
    }
    return null;
}

XZQH.getSuggestRegionByName = function(name){
    if(!name) return [];
    var result=[];
    var arr = [xzqChinaData,xzqCountyData];
    for(var i=0,cnt = arr.length; i < cnt; i++){
        for(var j=0,len=arr[i].length;j<len;j++){
            var item = arr[i][j];
            if(item.N.indexOf(name)>=0)
                result.push(item);
        }
        /*for(var item in arr[i]){
            if(item.N.indexOf(name)>=0)
                result.push(item);
        }*/
    }
    return result;
}
XZQH.prototype._eventbind = function() {
    //关闭按钮事件
    var _self = this;
    _self.closeButton.click(function() {
        var _onClose = _self.option.onClose;
        if (_onClose && 'function' == typeof _onClose) {
            _onClose(_self.wrapper);
        }
        _self.wrapper.hide();
    });

    /*按照拼音或者字母滚动*/
    $('.city_list_header a').click(function(){
        var char = $(this).text(),scrollTop=0;
        $('.ps_container.hover').find('[id=scroll_to_'+char+']').prevAll().each(function(){
            scrollTop +=$(this).height();
        });
        var maxScrollTop = $('.ps_container.hover>div').height()-$('.ps_container.hover').height();
        if(scrollTop>maxScrollTop) scrollTop = maxScrollTop;
        $('.ps_container.hover').scrollTop(scrollTop);
    });
    var leve1='china',leve1Idx = 0;
    /*
     中国|国家或区域点击事件
    */
    $('div.sort-choose-1 .tabs-a').click(function(){
        if($(this).hasClass('hover')) return;
        $(this).addClass('hover');
        $(this).siblings().removeClass('hover');
        leve1Idx = $(this).index('div.sort-choose-1 .tabs-a');

        //选择第二层的显示，根据序号
        $('div.sort-choose-2').removeClass('hover');
        var leve2This = $('div.sort-choose-2').eq(leve1Idx);
        leve2This.addClass('hover');
        //选择默认第一个
        leve2This.find('.tabs-a').first().click();

    });

    /*第二层选择点击事件*/
    $('.sort-choose-2 .tabs-a').click(function(){
        if(!$(this).parent().hasClass('hover')) return;
        // if($(this).hasClass('hover')) return;
        if(!$(this).hasClass('hover')) $(this).addClass('hover');
        $(this).siblings().removeClass('hover');
        dataClass = $(this).attr('data-class');
        //选择第三层
        //移除所有显示的
        $('#data_class_wrapper .item').removeClass('hover');
        
        //处理拼音以及字母的显示或隐藏
        if('pinyin'==dataClass || 'initials' == dataClass){
            if(!$('#data_class_wrapper div.city_list_header').hasClass('hover'))
                $('#data_class_wrapper div.city_list_header').addClass('hover')
        }else{
            $('#data_class_wrapper div.city_list_header').removeClass('hover')
        }

        //显示
        $('#data_class_wrapper .'+dataClass).addClass('hover');
    });

    /*hotcity点击事件*/
    $('.hot_city a').click(function(){
        var regionName = $(this).text(),where = 'hotcity';
        var regionData = XZQH.getRegionByName(where,regionName);
        if(regionData){
            var view = _self.map.getView();
            view.setCenter(ol.proj.fromLonLat([regionData.X-0,regionData.Y-0]));
            view.setZoom(regionData.Z);
            $('.def_city_con span').last().text(regionName);
            $('.city-change-inner span').text(regionName);
            _self.option.callback(regionData);
        }
//      _self.hide();
    });
    /*绑定城市定位的点击事件*/
    $('a[data-v-0a1b1cfa]').click(function(){
        var regionName = $(this).text(),where = $('.sort-choose-1 .hover').attr('id');
        var regionData = XZQH.getRegionByName(where,regionName);
        if(regionData){
            var view = _self.map.getView();
            view.setCenter(ol.proj.fromLonLat([regionData.X-0,regionData.Y-0]));
            view.setZoom(regionData.Z);
            $('.def_city_con span').last().text(regionName);
            $('.city-change-inner span').text(regionName);
            _self.option.callback(regionData);
        }
//      _self.hide();
    })
    //
    this._eventSearch()
};
XZQH.prototype._render = function() {
    this._renderHotcity()._renderSearch()._renderNavbar()._renderNavbarContent();
};
/*
	private
	生产热点城市
*/
XZQH.prototype._renderHotcity = function() {
    var aHtml = ['<div class="hot_city">'];
    xzqHotCityData.forEach(function(i) {
        aHtml.push('<a href="javascript:;">' + i.N + '</a>')
    });
    aHtml.push('</div>');
    return this.wrapperInner.append($(aHtml.join(''))), this;
};

/*
	private
	搜索
*/
XZQH.prototype._renderSearch = function() {
    var _wrapper = $('<div>').addClass('city_switch_search clearfix');
    this.inpuSearch = $('<input type="text">').attr('placeholder', '请输入中文地名');
    _wrapper.append(this.inpuSearch);
    //搜索按钮
    this.btnSearch = $('<div>').addClass('syn_bom').append('<div class="com-icon searchBtn" style="background-size: auto;"></div>');
    _wrapper.append(this.btnSearch);
    this.wrapperSearch = $('<div>').addClass('searchul').css('display', 'none');
    this.wrapperSchResult = $('<div>').addClass('searchul_inner');
    this.wrapperSchResult.appendTo(this.wrapperSearch);

    return _wrapper.append(this.wrapperSearch), _wrapper.appendTo(this.wrapperInner), this;
};

XZQH.prototype._renderNavbar = function() {
    this.wrapperInner.append($('<div class="nav-bar sort-choose-1 clearfix"><a href="javascript:;" class="tabs-a hover" id="china">中国</a><a href="javascript:;" class="tabs-a" id="country_region">国家或地区</a></div>'));
    this.wrapperInner.append($('<div class="nav-bar sort-choose-2 clearfix hover"><a href="javascript:;" class="tabs-a hover" data-class="province">按省份</a><a href="javascript:;" class="tabs-a" data-class="pinyin">按拼音</a></div>'));
    this.wrapperInner.append($('<div class="nav-bar sort-choose-2 clearfix"><a href="javascript:;" class="tabs-a hover" data-class="continent">按大洲</a><a href="javascript:;" class="tabs-a" data-class="initials">按首字母</a></div>'));
    return this
};

XZQH.prototype._renderNavbarContent = function() {
    var _wrapper = $('<div>').attr('id','data_class_wrapper');
    //生产字母
    var a = ['<div class="city_list_header item">'],
        c = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "W", "X", "Y", "Z"];
    c.forEach(function(i) {
        a.push('<a href="javascript:;">' + i + '</a>');
    })
    a.push('</div>');
    //按照省份的内容
    var arrCity = this._sortCityData(this._gencCityData('city',xzqChinaData));
    a.push('<div class="ps_container province item hover"><div class="city_list_province">');
    	arrCity.forEach(function(it){
    		a.push('<div class="city_list_province_line clearfix">');
    		a.push('<div class="city_list_province_header city_list_provin">');
    		a.push(it.N);
    		a.push('</div>');
    		a.push('<div class="city_list_province_right">');
    		it.AC.forEach(function(it_){
    			a.push('<a data-v-0a1b1cfa href="javascript:;">'+it_.N+'</a>');
    		});
    		a.push('</div>');
    		a.push('</div>');
    	});
    a.push('</div></div>');
    //按照拼音的内容
    arrCity= this._gencCityAlphabeticData('city',xzqChinaData);
    a.push('<div class="ps_container pinyin item"><div class="city_list_province">');
    for(var arrAlphabetic in arrCity){
    	if(arrCity[arrAlphabetic].length){
    		a.push('<div id="scroll_to_' + arrAlphabetic +'" class="city_list_province_line clearfix">');
    		a.push('<div class="city_list_province_header city_list_py">');
    		a.push(arrAlphabetic);
    		a.push('</div>');
    		a.push('<div class="city_list_province_right">');
    		arrCity[arrAlphabetic].forEach(function(it){
    			a.push('<a data-v-0a1b1cfa href="javascript:;">'+it.N+'</a>');
    		});
    		a.push('</div></div>');
    	}
    }
    a.push('</div></div>');
    //按照大洲内容
    arrCity = this._sortCityData(this._gencCityData('country',xzqCountyData));
    a.push('<div class="ps_container continent item"><div class="city_list_province">');
    	arrCity.forEach(function(it){
    		a.push('<div class="city_list_province_line clearfix">');
    		a.push('<div class="city_list_province_header city_list_provin">');
    		a.push(it.N);
    		a.push('</div>');
    		a.push('<div class="city_list_province_right">');
    		it.AC.forEach(function(it_){
    			a.push('<a data-v-0a1b1cfa href="javascript:;">'+it_.N+'</a>');
    		});
    		a.push('</div>');
    		a.push('</div>');
    	});
    a.push('</div></div>');
    //按照大洲首字母内容
    arrCity= this._gencCityAlphabeticData('country',xzqCountyData);
    a.push('<div class="ps_container initials item"><div class="city_list_province">');
    for(var arrAlphabetic in arrCity){
    	if(arrCity[arrAlphabetic].length){
    		a.push('<div id="scroll_to_' + arrAlphabetic +'" class="city_list_province_line clearfix">');
    		a.push('<div class="city_list_province_header city_list_py">');
    		a.push(arrAlphabetic);
    		a.push('</div>');
    		a.push('<div class="city_list_province_right">');
    		arrCity[arrAlphabetic].forEach(function(it){
    			a.push('<a data-v-0a1b1cfa href="javascript:;">'+it.N+'</a>');
    		});
    		a.push('</div></div>');
    	}
    }
    a.push('</div></div>');
    _wrapper.html(a.join(''));
    _wrapper.appendTo(this.wrapperInner)
};

XZQH.prototype._gencCityData = function(a,i) {
	var n = {};
                "city" == a ? n = {
                    10: {
                        N: "其他",
                        PY: "Zzz",
                        X: "",
                        Y: "",
                        Z: -1,
                        AC: []
                    }
                } : "country" == a && (n = {
                    1: {
                        AC: [],
                        N: "亚洲",
                        PY: "Asia",
                        X: "",
                        Y: "",
                        Z: -1
                    },
                    2: {
                        AC: [],
                        N: "欧洲",
                        PY: "Europe",
                        X: "",
                        Y: "",
                        Z: -1
                    },
                    3: {
                        AC: [],
                        N: "非洲",
                        PY: "Africa",
                        X: "",
                        Y: "",
                        Z: -1
                    },
                    4: {
                        AC: [],
                        N: "大洋洲",
                        PY: "Oceania",
                        X: "",
                        Y: "",
                        Z: -1
                    },
                    5: {
                        AC: [],
                        N: "南美洲",
                        PY: "SAmerica",
                        X: "",
                        Y: "",
                        Z: -1
                    },
                    6: {
                        AC: [],
                        N: "北美洲",
                        PY: "NAmerica",
                        X: "",
                        Y: "",
                        Z: -1
                    },
                    7: {
                        AC: [],
                        N: "南极洲",
                        PY: "Antarctica",
                        X: "",
                        Y: "",
                        Z: -1
                    }
                });
                for (var Y = 0, t = i.length; Y < t; Y++) {
                    var e = i[Y]
                      , o = e.GB
                      , r = o.substr(0, 3)
                      , s = o.substr(3, 2)
                      , N = o.substr(5)
                      , B = e.PY;
                    B.replace(/\s/g, "").substr(0, 1).toUpperCase();
                    if ("city" == a)
                        /*156110000|156120000|156310000|156500000 北京|天津|上海|重庆4个直辖市
                            156710000|156820000|156810000 台湾|澳门|香港
                        */

                        "156" == r && "156000000" != o && ("156110000|156120000|156310000|156500000".indexOf(o) > -1 || ("156710000|156820000|156810000".indexOf(o) > -1 ? n[10].AC.push(e) : "0000" == N ? (e.AC = [],
                        n[s] = e) : n[s].AC.push(e)));
                    else if ("country" == a && ("156" != r || "156000000" == o)) {
                        var c = e.C;
                        n[c] && n[c].AC.push(e)
                    }
                }
                return n
};

XZQH.prototype._gencCityAlphabeticData = function(a,i) {
	for (var n = {
                    A: [],
                    B: [],
                    C: [],
                    D: [],
                    E: [],
                    F: [],
                    G: [],
                    H: [],
                    I: [],
                    J: [],
                    K: [],
                    L: [],
                    M: [],
                    N: [],
                    O: [],
                    P: [],
                    Q: [],
                    R: [],
                    S: [],
                    T: [],
                    U: [],
                    V: [],
                    W: [],
                    X: [],
                    Y: [],
                    Z: []
                }, Y = 0, t = i.length; Y < t; Y++) {
                    var e = i[Y]
                      , o = e.PY
                      , r = o.replace(/\s/g, "").substr(0, 1).toUpperCase()
                      , s = e.GB
                      , N = s.substr(0, 3);
                    if ("city" == a) {
                        var B = s.substr(5);
                        "156" == N && ("156110000|156120000|156310000|156500000|156810000|156820000".indexOf(s) > -1 || "0000" != B) && n[r].push(e)
                    } else
                        "country" == a && ("156000000" != s && "156" == N || n[r].push(e))
                }
                return n
};

XZQH.prototype._sortCityData = function(arr) {
	var _a=[];
	for(var m in arr) _a.push(arr[m]);
	_a.sort(function(a, i) {
        return a.PY > i.PY ? 1 : a.PY < i.PY ? -1 : 0
    })
	return _a;
};

XZQH.prototype._eventSearch = function() {
    var _self = this;
    this.inpuSearch.bind('input', function() {
        var keyword = $(this).val();
        if (keyword == '') {
            _self.wrapperSearch.hide();
            return;
        }

        var result = XZQH.getSuggestRegionByName(keyword);

        if (result.length == 0) {
            _self.wrapperSchResult.html('<div class="none_search">没有符合的结果，请输入正确的城市名</div>');
        } else {
            var html = '<div>';
            result.forEach(function(i){
                html += '<a href="javascript:;">' + i.N + '</a>';
            })
            html += '</div>';
            _self.wrapperSchResult.html(html);

            /*绑定点击事件*/
            $('.searchul_inner a').click(function() {
                var txt = $(this).text(),
                    idx = $(this).index('.searchul_inner a'),
                    regionData = result[idx];
                _self.inpuSearch.val(txt);

                var view = _self.map.getView();
                view.setCenter(ol.proj.fromLonLat([regionData.X - 0, regionData.Y - 0]));
                view.setZoom(regionData.Z);
                _self.defaultSpan.text(txt);

                //$('.city-change-inner span').text(txt);
                //关闭suggest
                _self.inpuSearch.val('');
                result.length = 0;
                _self.wrapperSchResult.empty();
                //_self.wrapperSchResult.hide();
//                _self.hide();
                _self.option.callback(regionData);
            });
        }
        _self.wrapperSearch.show()
    })
};


XZQH.prototype.show = function() {
    this.wrapper.show();
};
XZQH.prototype.hide = function() {
    this.closeButton.click();
};
/*
	设置默认城市
	@param {String} cityname 城市名称
*/
XZQH.prototype.setDefault = function(cityname) {
    if (!cityname) throw new Error('没指定城市');
    var arr = XZQH.getSuggestRegionByName(cityname);
    if (arr.length > 0) {
        var regionData = arr[0];
        if (regionData) {
            var view = this.map.getView();
            view.setCenter(ol.proj.fromLonLat([regionData.X - 0, regionData.Y - 0]));
            view.setZoom(regionData.Z);
            var regionName = regionData.N;
            this.defaultSpan.text(regionName);
            this.option.callback(regionData);
        }
        this.hide()
    }
};

