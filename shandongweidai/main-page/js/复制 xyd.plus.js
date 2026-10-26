/*********************************************************
*	jquery xyd plus
*********************************************************/
window.onerror = function(){
	//return true;
};

//修复ie不支持console会报错bug
/*
if(!window.console){
	window.console =  {};
	window.console.info = function(option){
		alert(option);
	}
}
*/
(function($,xyd){
	
	"use strict";
	
	$.extend({
		xydAjaxData:function(data){
			xyd.ajaxData(data);
	    }
	});
	
	/**
	 * 判断参数类型
	 * string、number、boolean、array、object、null、undefined、function、date
	 * @param {Object} object
	 */
	xyd.getObjectType = function(object){
		var s = Object.prototype.toString.call(object).toLocaleLowerCase();
		return s.replace(/(^\[object\s*)(.*)(\]$)/,"$2");
	}
	
	/**
	 * 判断是否是一个JQuery对象
	 * @param {Object} object
	 */
	xyd.isJQueryObject = function(object){
    	return object instanceof jQuery;
	}
	
	/**
	 * 判断是否是一个Date对象
	 * @param {Object} object
	 */
	xyd.isDateObject = function(object){
    	return object instanceof Date;
	}
	
	xyd.isObjectEmpty = function(object){
		var ret = false;
		for(var i in object){
			ret = true;
			break;
		}
		return ret;
	}
	
	/**
	 * 判断是否为有效数字
	 * @param {Object} object
	 */
	xyd.isNumber = function(object){
		if(xyd.getObjectType(object)!="string" && xyd.getObjectType(object)!="number"){
			return false;
		}
		
		var object = Number(object);
    	if(isNaN(object)){
    		return false;
    	}
    	if(object===Infinity || object===-Infinity){
    		return false;
    	}
    	
    	return true;
	}
	
	
	/**
	 * 判断是否为一个整数
	 * @param {Object} num
	 */
	xyd.isInteger = function(num) {
        return Math.floor(num) === num;
	}
	
	/**
	 * 判断是否是汉字
	 * @param {Object} object
	 */
    xyd.isChinese = function(object){
    	return /^[\u4e00-\u9fa5]+$/.test(""+object);
    	var reg = new RegExp("[\\u4E00-\\u9FFF]+","g");
    	return reg.test(val);
    }
    
    /**
     * 匹配帐号是否合法(必须以字母开头，允许5-16位，允许字母数字下划线)
     * @param {Object} name
     */
    xyd.isUserName = function(name){
    	if(name===undefined || name===null){
    		return false;
    	}
    	return /^[a-zA-Z][a-zA-Z0-9_]{4,15}$/.test(""+name);
    };
    
    /**
     * 验证手机号码
     * @param {Object} object
     */
    xyd.isPhone = function(object){
    	//目前手机号网段为13,15,18,17
		var re= /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/; 
		return re.test(""+object);
	}
	
	/**
	 * 验证是否email格式
	 * @param {Object} object
	 */
	xyd.isEmail = function(object){
		var re = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
		return re.test(""+object);
	}
	
	/**
	 * 验证身份证号码是否合法(18位)
	 * @param {Object} code
	 */
	xyd.isIdCard = function(code){
		var city={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江 ",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北 ",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏 ",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外 "};
        var tip = "";
            var pass= true;
 
            if(!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)){
            tip = "身份证号码格式错误";
            pass = false;
        }
        
       else if(!city[code.substr(0,2)]){
            tip = "地址编码错误";
            pass = false;
        }
        else{
            //18位身份证需要验证最后一位校验位
            if(code.length == 18){
                code = code.split('');
                //∑(ai×Wi)(mod 11)
                //加权因子
                var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
                //校验位
                var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
                var sum = 0;
                var ai = 0;
                var wi = 0;
                for (var i = 0; i < 17; i++)
                {
                    ai = code[i];
                    wi = factor[i];
                    sum += ai * wi;
                }
                var last = parity[sum % 11];
                if(parity[sum % 11] != code[17]){
                    tip = "校验位错误";
                    pass =false;
                }
            }
        }
        //if(!pass) alert(tip);
        return pass;
	}
	
	/**
	 * 根据一个字符串返回扩展名(不带.)
	 * @param {Object} string
	 */
	xyd.getFileExtend = function(string){
		var d=/\.[^\.]+$/.exec(string);
		if(!d){
			d = "";
		}else{
			d = d[0];
		}
		//替换特殊字符
		d = d.replace(/\./,"");
		return d;
	} 

	/**
	 * 根据18位身份证取出性别
	 * @param {Object} object
	 */
	xyd.getIdCardSex = function(object){
		try{
			var sex = (""+object).substring(14,17)%2==0 ? '女':'男';
			return sex;
		}catch(e){}
		return undefined;
	}
	
	/**
	 * 根据身份证取出出生年月，返回一个对象
	 * @param {Object} str
	 * @param {Object} type
	 */
	xyd.getIdCardBirth = function(str,type){
		try{
			var idCard,birth,retType;
			idCard = str===undefined ? "" : str.toString();
			retType = type===undefined ? "object" : "string";
			if(idCard.length==18){
				birth = idCard.substring(6,14);
			}else if(idCard.length==15){
				birth = "19"+idCard.substring(6,12);
			}
			if(retType == "object"){
				return {
					year : birth.substring(0,4),
					month : birth.substring(4,6),
					day : birth.substring(6,8)
				}
			}else{
				return {
					year : parseInt(birth.substring(0,4)),
					month : parseInt(birth.substring(4,6)),
					day : parseInt(birth.substring(6,8))
				}
			}
		}catch(e){}
		return undefined;
	}
		
    /**
     * 运行一个函数
     * @param {Object} callback
     */
    xyd.exeFunction = function(callback){
    	if(xyd.getObjectType(callback)=="function"){
    		callback();
    	}
    },
	
	/**
	 * 封装ajax
	 * @param {Object} params
	 */
	xyd.ajax = function(params){
		$.ajax({
			url : params["url"] || "",
			data : params["data"] || {},
			type : params["type"] || "POST",
			dataType : params["dataType"] || 'json',
			async : params["async"] || true,
			success : function(result,textStatus,jqXHR){
				xyd.exeFunction(params["success"](result));
			},
			error : function(XMLHttpRequest, textStatus, errorThrown){
				xyd.exeFunction(params["error"](XMLHttpRequest, textStatus, errorThrown));
			}
		});
	}
	
	/**
	 * 对数据有效性进行验证
	 * @param {Object} sourceObject
	 * @param {Object} optionObject
	 */
	xyd.dataVerification = function(sourceObject,optionObject){
		if(xyd.getObjectType(sourceObject)!="object" || xyd.getObjectType(optionObject)!="object"){
   			return;
   		}
   		for(var i in sourceObject){
			if(xyd.getObjectType(optionObject[i])===undefined || xyd.getObjectType(optionObject[i])==null || optionObject[i]==""){
				return sourceObject[i];
			}
		}
   		return true;
	}
	
	/**
	 * 格式化一个对象，转换为JSONVALUE方式
	 * @param {Object} object
	 */
    xyd.ajaxData = function(object){
    	if(xyd.getObjectType(object)!="object"){
    		xyd.throwNewError("ajaxData object is type error");
    	}
    	var a = $.extend(true, {}, object);
    	a["TIMESTAMP"] = new Date().getTime();
		return {JSONVALUE:JSON.stringify({input:a})};
    }
    
    /**
	 * 格式化一个对象，转换为JSONVALUE方式
	 * @param {Object} object
	 */
    xyd.JSONVALUE = function(object){
		return xyd.ajaxData(object);
    }
    
    /**
     * 取浏览器信息
     */
    xyd.getBrowser = function(){
		var sys = {},
			ua = navigator.userAgent.toLowerCase(),
			re =/(msie|firefox|chrome|opera|version).*?([\d.]+)/,
			m = ua.match(re);
		sys.info = ua;
		sys.browser = m[1].replace(/version/, "'safari");
		sys.ver = m[2];
		return sys;
	}
    
    /**
     * 取浏览器地址栏参数
     * @param {Object} name
     */
    xyd.getUrlParam = function (name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) return unescape(r[2]); return null;
	}
	
	/**
	 * 取密码等级,共1,2,3
	 * @param {Object} str
	 */
	xyd.getPasswordLevel = function(str){
		var s = str===undefined ? str="" : str.toString(),
			level = 0;
		if(s.length<6){return level;}
		var reg = /[0-9]+/igm;
		reg.test(s) ? level=level+1 : level;
		reg = /[a-z]+/igm;
		reg.test(s) ? level=level+1 : level;
		reg = /[\.\!@#\$%\^&\*\(\)\[\]\{\}]{1,}/igm;
		reg.test(s) ? level=level+1 : level;
		return level;
	}
	
    /**
     * 创建一个uuid
     */
    xyd.createUUID = function(){
       var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		  var r = (d + Math.random()*16)%16 | 0;
		  d = Math.floor(d/16);
		  return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		});
		return uuid;
    }
    
    /**
     * 取右边字符串
     * @param {Object} string
     * @param {Object} i
     */
	xyd.getStringRight = function(string,i){
		i = i===undefined ? string.length : i;
		i = i > string.length ? string.length : i;
		return string.match(new RegExp(".*(.{"+i+"})"))[1];
	}
	
	/**
	 * 替换全部字符串(不能包含特殊字符)
	 * @param {Object} reallyDo
	 * @param {Object} replaceString
	 */
	xyd.replaceAll = function(string,replaceString,replaceNewString){
		try{
			var jsSpecialChars = ["\\", "^", "$", "*", "?", ".", "+", "(", ")", "[","]", "|", "{", "}"];
			var replaceString = replaceString===undefined ? "" : ""+replaceString;
			var replaceNewString = replaceNewString===undefined ? "" : ""+replaceNewString;
			for (var i = 0; i < jsSpecialChars.length; i++) {
		        replaceString = replaceString.replace(new RegExp("\\"
		                + jsSpecialChars[i], "g"), "\\"
		                + jsSpecialChars[i]);
			}
			for (var i = 0; i < jsSpecialChars.length; i++) {
		        replaceNewString = replaceNewString.replace(new RegExp("\\"
		                + jsSpecialChars[i], "g"), "\\"
		                + jsSpecialChars[i]);
			}
			var reg = new RegExp(replaceString,"gm");
			return string.replace(reg,replaceNewString);
		}catch(e){}
	}
	
	/**
	 * 保留小数
	 * @param {Object} num
	 * @param {Object} s
	 */
    xyd.toFixed = function(num, s) {
	    var times = Math.pow(10, s)
	    var des = num * times + 0.5
	    des = parseInt(des, 10) / times
	    return des + ''
	}
	

    /**
     * 格式化参入参数,只能用在function内部
     * 示例：function test(a,b,c,d,f,g,h,i){
	 *			console.info(xyd.getFormatArguments(arguments));
	 *		}
     * @param {Object} arrayArguments
     */
    xyd.formatArguments = function(arrayArguments){
    	/**
    	 * 不明白为何IE下不能用foreach循环
    	 */
    	var params = {};
    	for(var i=0;i<arrayArguments.length;i++){
    		var d = arrayArguments[i],
				name = xyd.getObjectType(d);
				if(params[name]===undefined){
					params[name] = d;
				}else{
					var y = 0;
					while(params[name+y]!=undefined){
						y += 1;
					}
					params[name+y] = d;
				}
    	}
    	return params;
	};
	
	/**
	 * 默认接收两个参数，一个string，一个callback
	 */
	xyd.buttonClick = function(){		
		var params = xyd.formatArguments(arguments);		
		var name = params["string"];
		var callback = params["function"];
		var boolean = params["boolean"];
		$("[xyd-button-name='"+name+"']").unbind("click").on("click",function(event){
			//是否冒泡，默认允许
			if(boolean===false){
				if (window.event) {
					event.cancelBubble=true;// ie下阻止冒泡
				} else {
				  //e.preventDefault();
				  event.stopPropagation();// 其它浏览器下阻止冒泡
				}
			}
			try{
				xyd.exeFunction(callback(event));
			}catch(e){}
			return this;
		});
	}
	
	xyd.getYHKHMC = function(val){
		var val = val===undefined ? "" : val + "";
    	if(val.length<1) return;
    	var benlist = {
    		"YH436742" : "中国建设银行VISA龙卡借记卡",
			"YH436745" : "中国建设银行VISA龙卡贷记卡",
			"YH622280" : "中国建设银行支付宝龙卡借记卡",
			"YH458123" : "交通银行VISA普通卡",
			"YH521899" : "交通银行MC信用卡普通卡",
			"YH622260" : "交通银行太平洋卡借记卡",
			"YH402674" : "上海银行VISA金卡",
			"YH622892" : "上海银行借记卡",
			"YH622188" : "中国邮政储蓄绿卡借记卡",
			"YH602969" : "北京银行京卡借记卡",
			"YH622760" : "中国银行中银都市卡",
			"YH409666" : "中国银行BOC系列VISA标准卡普通卡/VISA高校认同卡",
			"YH438088" : "中国银行国航知音信用卡",
			"YH622752" : "中国银行上海市分行长城人民币贷记卡普通卡",
			"YH427020" : "中国工商银行VISA学生国际信用卡",
			"YH427030" : "中国工商银行VISA国际信用卡金卡",
			"YH530990" : "中国工商银行MC国际信用卡普通卡",
			"YH622230" : "中国工商银行新版人民币贷记卡普卡",
			"YH622235" : "中国工商银行新版人民币贷记卡金卡",
			"YH622210" : "中国工商银行新版信用卡(准贷)普卡",
			"YH622215" : "中国工商银行新版信用卡(准贷)金卡",
			"YH622200" : "中国工商银行牡丹灵通卡借记卡",
			"YH955880" : "中国工商银行原牡丹灵通卡借记卡",
			"YH622568" : "广东发展银行新理财通借记卡",
			"YH520152" : "广东发展银行南航明珠卡MC金卡",
			"YH520382" : "广东发展银行南航明珠卡MC普卡",
			"YH911121" : "广东发展银行理财通借记卡",
			"YH548844" : "广发真情卡",
			"YH512431" : "宁波银行",
			"YH520194" : "宁波银行",
			"YH622318" : "宁波银行",
			"YH622778" : "宁波银行",
			"YH622282" : "宁波银行汇通卡人民币金卡/钻石联名卡",
			"YH407405" : "民生银行",
			"YH517636" : "民生银行",
			"YH512466" : "中国民生银行MC金卡",
			"YH415599" : "中国民生银行星座卡借记卡",
			"YH421870" : "中国民生银行VISA信用卡金卡",
			"YH622622" : "中国民生银行蝶卡银卡借记卡",
			"YH528948" : "民生银行",
			"YH552288" : "民生银行",
			"YH556610" : "民生银行",
			"YH622600" : "民生银行",
			"YH622601" : "民生银行",
			"YH622602" : "民生银行",
			"YH622603" : "民生银行",
			"YH421869" : "民生银行",
			"YH421871" : "民生银行",
			"YH628258" : "民生银行",
			"YH418152" : "上海浦东发展银行奥运WOW卡美元单币",
			"YH456418" : "上海浦东发展银行WOW卡/奥运WOW卡",
			"YH622521" : "上海浦东发展银行东方卡借记卡",
			"YH404738" : "上海浦东发展银行VISA普通卡",
			"YH404739" : "上海浦东发展银行VISA金卡",
			"YH498451" : "浦东发展银行",
			"YH622517" : "浦东发展银行",
			"YH622518" : "浦东发展银行",
			"YH515672" : "浦东发展银行",
			"YH517650" : "浦东发展银行",
			"YH525998" : "浦东发展银行",
			"YH356850" : "浦东发展银行",
			"YH356851" : "浦东发展银行",
			"YH356852" : "浦东发展银行",
			"YH435744" : "深发展联名普卡",
			"YH622526" : "深发展卡普通卡",
			"YH435745" : "深发展联名金卡",
			"YH998801" : "深圳发展银行",
			"YH998802" : "深圳发展银行",
			"YH622525" : "深发展卡金卡",
			"YH622538" : "深圳发展银行发展卡借记卡",
			"YH406254" : "光大银行",
			"YH622655" : "光大银行",
			"YH622650" : "光大银行",
			"YH622658" : "光大银行",
			"YH356839" : "光大银行",
			"YH486497" : "光大银行",
			"YH481699" : "光大银行",
			"YH543159" : "光大银行",
			"YH425862" : "光大银行",
			"YH406252" : "光大银行",
			"YH356837" : "光大银行",
			"YH356838" : "光大银行",
			"YH356840" : "光大银行",
			"YH622161" : "光大银行",
			"YH628201" : "光大银行",
			"YH628202" : "光大银行",
			"YH622155" : "深圳平安银行",
			"YH622156" : "深圳平安银行",
			"YH528020" : "深圳平安银行万事达卡普卡",
			"YH526855" : "深圳平安银行万事达卡金卡",
			"YH539867" : "华夏银行",
			"YH528709" : "华夏银行",
			"YH523959" : "华夏银行MC钛金卡",
			"YH622637" : "华夏银行人民币卡金卡",
			"YH622636" : "华夏银行人民币卡普卡",
			"YH528708" : "华夏银行MC金卡",
			"YH539868" : "华夏银行MC普卡",
			"YH518710" : "招商银行哆啦A梦粉丝信用卡",
			"YH518718" : "招商银行哆啦A梦粉丝信用卡珍藏版卡面/MC贝塔斯曼金卡/MC车主卡",
			"YH622588" : "招商银行QQ一卡通借记卡",
			"YH622575" : "招商银行HELLO KITTY单币卡",
			"YH545947" : "招商银行",
			"YH521302" : "招商银行",
			"YH439229" : "招商银行",
			"YH552534" : "招商银行",
			"YH622577" : "招商银行",
			"YH622579" : "招商银行",
			"YH439227" : "招商银行",
			"YH479229" : "招商银行",
			"YH356890" : "招商银行",
			"YH356889" : "招商银行JCB信用卡普通卡",
			"YH356885" : "招商银行",
			"YH439188" : "招商银行VISA白金卡",
			"YH545948" : "招商银行",
			"YH545623" : "招商银行",
			"YH552580" : "招商银行",
			"YH552581" : "招商银行",
			"YH552582" : "招商银行",
			"YH552583" : "招商银行",
			"YH552584" : "招商银行",
			"YH552585" : "招商银行",
			"YH552586" : "招商银行",
			"YH552588" : "招商银行",
			"YH552589" : "招商银行",
			"YH645621" : "招商银行",
			"YH545619" : "招商银行",
			"YH356886" : "招商银行",
			"YH622578" : "招商银行",
			"YH622576" : "招商银行",
			"YH622581" : "招商银行",
			"YH439228" : "招商银行",
			"YH439225" : "招商银行VISA信用卡普通卡",
			"YH439226" : "招商银行VISA信用卡金卡",
			"YH628262" : "招商银行",
			"YH628362" : "招商银行",
			"YH376968" : "中信银行",
			"YH376966" : "中信银行",
			"YH622918" : "中信银行",
			"YH622916" : "中信银行",
			"YH518212" : "中信银行国航知音信用卡/万事达卡普通卡",
			"YH622690" : "中信银行理财宝卡借记卡",
			"YH520108" : "中信银行万事达卡金卡",
			"YH376969" : "中信银行",
			"YH622919" : "中信银行",
			"YH556617" : "中信银行",
			"YH622680" : "中信银行蓝卡/I卡信用卡",
			"YH403391" : "中信银行",
			"YH558916" : "中信银行",
			"YH514906" : "中信银行",
			"YH400360" : "中信银行",
			"YH433669" : "中信银行",
			"YH433667" : "中信银行",
			"YH433666" : "中信银行",
			"YH404173" : "中信银行",
			"YH404172" : "中信银行",
			"YH404159" : "中信银行",
			"YH404158" : "中信银行",
			"YH403393" : "中信银行",
			"YH403392" : "中信银行",
			"YH622689" : "中信银行",
			"YH622688" : "中信银行",
			"YH433668" : "中信银行",
			"YH404157" : "中信银行",
			"YH404171" : "中信银行",
			"YH404174" : "中信银行",
			"YH628209" : "中信银行",
			"YH628208" : "中信银行",
			"YH628206" : "中信银行",
			"YH451289" : "兴业银行",
			"YH622902" : "兴业银行",
			"YH622901" : "兴业银行",
			"YH527414" : "兴业银行",
			"YH524070" : "兴业银行",
			"YH486493" : "兴业银行",
			"YH486494" : "兴业银行",
			"YH451290" : "兴业银行",
			"YH523036" : "兴业银行",
			"YH486861" : "兴业银行",
			"YH622922" : "兴业银行",
			"YH552599" : "农业银行",
			"YH404119" : "农业银行",
			"YH404121" : "农业银行",
			"YH519412" : "农业银行",
			"YH403361" : "农业银行",
			"YH558730" : "农业银行",
			"YH520083" : "农业银行",
			"YH520082" : "农业银行",
			"YH519413" : "农业银行",
			"YH49102" : "农业银行",
			"YH404120" : "农业银行",
			"YH404118" : "农业银行",
			"YH53591" : "农业银行",
			"YH404117" : "农业银行",
			"YH622836" : "中国农业银行人民币贷记卡 香港旅游卡贷记卡金卡",
			"YH622837" : "中国农业银行人民币贷记卡 香港旅游卡贷记卡普卡",
			"YH622848" : "中国农业银行世纪通宝借记卡"
    	};
    	//8,6,5,4
    	
    	var card = val.substr(0,6);
    	if(benlist["YH"+card]){
    		return benlist["YH"+card];
    	}
		card = val.substr(0,5);
    	if(benlist["YH"+card]){
    		return benlist["YH"+card];
    	}
    	card = val.substr(0,4);
    	if(benlist["YH"+card]){
    		return benlist["YH"+card];
    	}
	  	return ''; 
    }
	
   
   /*
	* formatMoney(s,type)
	* 功能：金额按千位逗号分割
	* 参数：s，需要格式化的金额数值.
	* 参数：type,判断格式化后的金额是否需要小数位.
	* 返回：返回格式化后的数值字符串.
	*/ 
	xyd.formatMoney = function(s, type) {
		if (/[^0-9\.]/.test(s))
		return "0";
		if (s == null || s == "")
		return "0";
		s = s.toString().replace(/^(\d*)$/, "$1.");
		s = (s + "00").replace(/(\d*\.\d\d)\d*/, "$1");
		s = s.replace(".", ",");
		var re = /(\d)(\d{3},)/;
		while (re.test(s))
		s = s.replace(re, "$1,$2");
		s = s.replace(/,(\d\d)$/, ".$1");
		if (type == 0) {// 不带小数位(默认是有小数位)
		var a = s.split(".");
		if (a[1] == "00") {
		s = a[0];
		}
		}
		return s;
	}
	
	/**
	 * 禁用退格键
	 */
	xyd.disablePageBackEvent = function(){
		function banBackSpace(e) {
			var ev = e || window.event; //获取event对象
			var obj = ev.target || ev.srcElement; //获取事件源
			var t = obj.type || obj.getAttribute('type'); //获取事件源类型
			//获取作为判断条件的事件类型
			var vReadOnly = obj.getAttribute('readonly');
			var vEnabled = obj.getAttribute('enabled');
			//处理null值情况
			vReadOnly = (vReadOnly == null) ? false : vReadOnly;
			vEnabled = (vEnabled == null) ? true : vEnabled;
			//当敲Backspace键时，事件源类型为密码或单行、多行文本的，
			//并且readonly属性为true或enabled属性为false的，则退格键失效
			var flag1 = (ev.keyCode == 8 && (t == "password" || t == "text" || t == "textarea") && (vReadOnly == true || vEnabled != true)) ? true : false;
			//当敲Backspace键时，事件源类型非密码或单行、多行文本的，则退格键失效
			var flag2 = (ev.keyCode == 8 && t != "password" && t != "text" && t != "textarea") ? true : false;
			//判断
			if(flag2) {
				return false;
			}
			if(flag1) {
				return false;
			}
		}
		//禁止后退键 作用于Firefox、Opera
		document.onkeypress=banBackSpace;
		//禁止后退键 作用于IE、Chrome
		document.onkeydown=banBackSpace;
		//处理键盘事件 禁止后退键（Backspace）密码或单行、多行文本框除外
	}
	/**
	 * 禁用F5事件
	 */
	xyd.disablePageF5Event = function(){
		document.onkeydown = function(e){
		e = window.event || e;
		var keycode = e.keyCode || e.which;
			if(e.ctrlKey || e.altKey || e.shiftKey ||
				keycode >= 112 && keycode <= 123) {
				if(window.event) { // ie
					try {
						e.keyCode = 0;
					} catch(e) {}
					e.returnValue = false;
				} else { // ff
					e.preventDefault();
				}
			}
		}
	}
	
	/**
	 * 禁用右键
	 */
	xyd.disablePageRightButtonEvent = function(){
		document.oncontextmenu = function(e){
			return false;
		}
	}
	/**
     * 抛出一个异常
     * @param {Object} error
     */
	xyd.throwNewError = function(error){
   		throw new Error(error);
	},
	
	xyd.jsPading = function(_params){		
		var _default = {
			rsCount : 0,				//总条数
			pageSize : 10,				//每页大小
			pageCount : 0,				//分页数量
			pageIndex : 1,				//当前第几页
			pageStepNumber : 3,			//步长
			pageStep : [],				//步进
			pageIsHome : false,			//是否是首页
			pageIsEnd : false			//是否有尾页
		};
		
		//加载参数,如果为undefined则不覆盖，null会替换当前参数
		var params = xyd.formatArguments(arguments);
		_default = $.extend(true,_default , params["object"]);
		
		//全部进行Number转换，防止类型不正确导致计算失败
		_default = {
			rsCount : Number(_default.rsCount),			
			pageSize : Number(_default.pageSize),			
			pageCount : Number(_default.pageCount),				
			pageIndex : Number(_default.pageIndex),			
			pageStepNumber : Number(_default.pageStepNumber)
		};
		
		//验证转换结果
		for(var i in _default){
			//如果为null，或者转换失败，则会出现NaN	
			if(_default[i].toString()=="NaN"){
				throw new Error("jsPading params error");
			}
		}
		
		//如果记录数小于1，修正为0，防止负数出现
		_default.rsCount = _default.rsCount < 1 ? 0 : _default.rsCount;
		
		//总分页数
		_default.pageCount = _default.rsCount%_default.pageSize==0
			? _default.rsCount/_default.pageSize 
			: parseInt(_default.rsCount/_default.pageSize)+1;
		
		//修正当前页		
		_default.pageIndex = _default.pageIndex>_default.pageCount ? _default.pageCount : _default.pageIndex;
		_default.pageIndex = _default.pageIndex<1 ? 1 : _default.pageIndex;
		
		//根据用户想看的页pagenum，算出页面的起始和结束页码
		_default.pageStepNumber = _default.pageStepNumber<3 ? 3 : _default.pageStepNumber;
		
		if(_default.pageCount<=_default.pageStepNumber){
			//如果不是最后
			_default.pageStep = [1,_default.pageCount];
		}else{
			_default.pageStep = [_default.pageStepNumber%2==0
				?_default.pageIndex-parseInt(_default.pageStepNumber/2-1)
				:_default.pageIndex- parseInt(_default.pageStepNumber/2),_default.pageIndex + parseInt(_default.pageStepNumber/2)];
		}
		
		_default.pageStep = _default.pageStep[0]<1
			? [1,_default.pageStepNumber]
			: _default.pageStep;
			
		_default.pageStep = _default.pageStep[1]>_default.pageCount 
			? [_default.pageCount-(_default.pageStepNumber-1),_default.pageCount]
			: _default.pageStep;
			
		_default.pageStep = _default.pageStep[0]>_default.pageStep[1] 
			? [_default.pageStep[1],_default.pageStep[1]] 
			: _default.pageStep;
		
		_default.pageStepList = [];
		for(var i=_default.pageStep[0];i<=_default.pageStep[1];i++){
			_default.pageStepList.push(i);
		}

		_default.pageIsHome = _default.pageStep[0] > 1 ? true : false;
		_default.pageIsEnd = _default.pageStep[1] < _default.pageCount ? true : false;
	
		_default.result = ""
			+ "记录数["+_default.rsCount+"]"
			+ "，每页大小["+_default.pageSize+"]"
			+ "，分页数["+_default.pageCount+"]"
			+ "，当前页索引["+_default.pageIndex+"]"
			+ "，步进["+_default.pageStep+"]"
			+ "，步长["+_default.pageStepNumber+"]"
			+ "，是否有首页["+_default.pageIsHome+"]"
			+ "，是否有尾页["+_default.pageIsEnd+"]"
		return _default;
	}
})(jQuery,xyd = {});


/**
 * xyd class date
 * @param {Object} $
 * @param {Object} xyd
 */
(function($,xyd){
	
	"use strict";
	
	var date = {};
	
	/**
	 * 创建一个日常时间对象
	 * 默认传入对象为date，如果无参数，则以当前时间自动创建
	 * @param {Object} object
	 */
	date.newDate = function(object){		
		var d = xyd.getObjectType(object)!="date" ? new Date() : object;
		return {
			year : d.getFullYear(),
			month : d.getMonth()+1,
			day : d.getDate(),
			hour : d.getHours(),
			minute :  d.getMinutes(),
			seconds :  d.getSeconds()
		};
	}
	
	/**
	 * 
	 * 创建一个常用时间(格式为对象),默认返回string类型
	 * @param {Object} object	如果没有参数，则自动创建一个{}格式对象
	 */
	date.newFormatDate = function(object){
		var d = xyd.getObjectType(object)!="object" ? date.newDate() : object;
		return {
			year : xyd.getStringRight("0000"+d["year"],4),
			month : xyd.getStringRight("00"+d["month"],2),
			day : xyd.getStringRight("00"+d["day"],2),
			hour : xyd.getStringRight("00"+d["hour"],2),
			minute :  xyd.getStringRight("00"+d["minute"],2),
			seconds :  xyd.getStringRight("00"+d["seconds"],2)
		};
	}
	
	/**
	 * 将一个json string时间(格式为对象)，转化为number格式
	 * 示例
	 * 		{year:"2014"} to {year:2014}
	 * @param {Object} object
	 */
	date.StringToNumber = function(object){
		var d = xyd.getObjectType(object)!="object" ? date.newDate() : object;
		var params = {};
		for(var i in object){
			params[i] = Number(object[i])
		}
		return params;
	}
	
	/**
	 * 将一个json number时间转换为string格式
	 * 示例
	 * 		{year:2014} to {year:"2014"}
	 * @param {Object} object
	 */
	date.numberToString = function(object){
		var d = xyd.getObjectType(object)!="object" ? date.newDate() : object;
		date.newFormatDate(d);
	}
	
	/**
	 * 将一个时间输出为日期格式
	 * yyyy-mm-dd，yyyy-mm-dd hh:mm:ss
	 * yyyy年mm月dd日，yyyy年mm月dd日 hh时mm分ss秒
	 * @param {Object} object
	 * @param {Object} formatText
	 */
	date.responseDate = function(object,formatText){
		var d = xyd.getObjectType(object)!="object" ? date.newDate() : object;
			d = date.newFormatDate(d);
			formatText = formatText===undefined ? "yyyy-mm-dd" : formatText;
		var respText;
		switch (formatText) {
			case "yyyy-mm-dd":
				respText = d["year"]+"-"+d["month"]+"-"+d["day"];
				break;
			case "yyyy-mm-dd hh:mm:ss":
				respText = d["year"]+"-"+d["month"]+"-"+d["day"]+" "+d["hour"]+":"+d["minute"]+":"+d["seconds"];
				break;
			case "yyyy年mm月dd日":
				respText = d["year"]+"年"+d["month"]+"月"+d["day"]+"日";
				break;
			case "yyyy年mm月dd日 hh时mm分ss秒":
				respText = d["year"]+"年"+d["month"]+"月"+d["day"]+"日 "+d["hour"]+"时"+d["minute"]+"分"+d["seconds"]+"秒";
				break;
			default:
				respText = ""
				break;
		}
		return respText;
	}
	
	/**
	 * 增加日期时间
	 * 参数分别为日期对象，增加的类型，增加的数量 
	 * @param {Object} date
	 * @param {Object} type
	 * @param {Object} Number
	 */
	date.dateAdd = function(dateObject,type, Number) {
		if(xyd.getObjectType(dateObject)!="date") return {};
		var d;
		var dtTmp = dateObject;  
		switch (type) {
			case 'second':
			case 's' :
				d = new Date(Date.parse(dtTmp) + (1000 * Number));
				break;
			case 'minute':
			case 'n' :
				d = new Date(Date.parse(dtTmp) + (60000 * Number));  
				break;
			case 'hour':
			case 'h' :
				d = new Date(Date.parse(dtTmp) + (3600000 * Number)); 
				break;
			case 'day':                            
			case 'd' :
				d = new Date(Date.parse(dtTmp) + (86400000 * Number)); 
				break;
			case 'week':                            
			case 'w' :
				d = new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number));
				break;
			case 'month':
			case 'm' :
				d = new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds()); 
				break;
			case 'year':
			case 'y' :
				d = new Date((dtTmp.getFullYear() + Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds()); 
				break;
			default:
				d = new Date;
				break;
			
		}
		return date.newDate(d);
	}
	
	/**
	 * 判断两个日期间隔
	 * @param {Object} date1
	 * @param {Object} date2
	 */
    date.dateDiff = function(date1, date2){
    	//除1000是毫秒，不加是秒 
        return (date2.getTime() - date1.getTime()) / 1000 / 60 / 60 / 24;    
    }
    
    /**
     * 把一个字符串转换为date日期类型,格式为2014-1-1,如果是2014/1/1不能进行转换
     * @param {Object} object
     */
    date.stringFormatToDate = function(object){
    	//把一个字符串转换为date日期类型,格式为2014-1-1,如果是2014/1/1不能进行转换
    	//return new Date(Date.parse((""+object).replace(/-/g,  "/")));
    	return new Date(Date.parse(object));
    }
    
	xyd.classDate = date;
	
})(jQuery,xyd);


/**
 *xyd class string 
 */
(function($,xyd){
	
	"use strict";
	
	var stringObject = {};
	
	/**
	 * 将字符串格式化为整数
	 * @param {Object} val
	 */
	stringObject.formatToInteger = function(val){
		val = val + "";
		if(val=="undefined" || val.length<1){
			return "";
		}
		val = val.replace(/\D/g,"");
		return val;
	}
	
	/**
	 * 将字符串格式化为数字(包含小数点)
	 * @param {Object} val
	 */
	stringObject.formatToNumber = function(val){
		val = val + "";
		if(val=="undefined" || val.length<1){
			return "";
		}
		val = val.replace(/[^\d.]/g,"");//先把非数字的都替换掉，除了数字和.
		val = val.replace(/^\./g,""); //必须保证第一个为数字而不是.
		val = val.replace(/\.{2,}/g,"."); //保证只有出现一个.而没有多个.	
		val = val.replace(".","$#$").replace(/\./g,"").replace("$#$","."); //保证.只出现一次，而不能出现两次以上 
		return val;
	}
	
	/**
	 * 将数字字符串格式化为保留2位小数
	 * @param {Object} val
	 * @param {Object} len
	 */
	stringObject.formatToMoney = function(val,len){
		var val = stringObject.formatToNumber(val);
		if(val.length<1){
			return "";
		}
		len = len===undefined ? 2 : len;
		var RegStr = '^[\\+\\-]?\\d+\\.?\\d{0,'+len+'}'; // 保留小数点后2位
		val = val.match(new RegExp(RegStr, 'g'));
		return val[0];
	}

	xyd.classString = stringObject;
})(jQuery,xyd);


/**
 * xyd class cookies
 */

(function($,xyd){
	
	"use strict";
	
	var cookieObject = {};
	/**
	 * 取cookie
	 * @param {Object} name
	 */
	cookieObject.getCookie = function (name){
        var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
        if (arr != null) return unescape(arr[2]);
        return null;

    }
	
	/**
	 * 设置cookie
	 * @param {Object} name
	 * @param {Object} value
	 */
    cookieObject.setCookie = function (name, value) {
        var Days = 30;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
        document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + ";path=/";
    }
    xyd.classCookie = cookieObject;
})(jQuery,xyd);

(function($){
	
	"use strict";
	
	$.fn.extend({
		
		//获取iframe内部对象
		getIframeObject : function(){
			//return this.get(0).contentWindow;
			//return this.contents();
		},
		
		//设置元素表单内容
		setHTML : function(options){
			var val = this.is(":input") ? "val" : "html";
			return this[val](options);
		},
		
		//取出表单内容
		getHTML : function(){
			var val = this.is(":input") ? "val" : "html";
			return this[val]();
		},
		
		//清除元素表单内容为空
		xydClearHTML : function(){			
			var val = this.is(":input") ? "val" : "html";
			return this[val]("");
		},
		
		//设置提示信息,
		setElMessage : function(name,value){
			var el = this.find("[data-input-message-name='"+name+"']");
			if(el.length>0){
				el.setHTML(value);
			}
			return this;
        },
        
        //清除提示信息,
		clearElMessage : function(){
			return this.find("[data-input-message-name]").xydClearHTML();
        },
        
		//设置表单内容,
		setElValue : function(object){
			for(var i in object){
				var el = this.find("[data-input-name='"+i+"']");
				if(el.length>0){
					el.setHTML(object[i]);
				}
			}
			return this;
        },
        
        //设置表单内容-加强版
        setElValuePlus : function(a,b){
        	var params = xyd.formatArguments(arguments);
			var attrName = params["string"];
			var object = params["object"];
			
			for(var i in object){
				var el = this.find("["+attrName+"='"+i+"']");
				if(el.length>0){
					el.setHTML(object[i]);
				}
			}
			return this;
        },
        
        //清除表单内容
        clearElValue : function(){
			return this.find("[data-input-name]").xydClearHTML();
        },
        
        /**
         * 设置select
         */
        setSelectData : function(){
			if(this.length<1) return false;
			var params = xyd.formatArguments(arguments);
			var arrayList = params["array"] || [];
			var object = params["object"] || {};
			var string = params["string"] || "请选择";
			var code = {CODE : "id",NAME : "name"};
			if(object){
				code["CODE"] = object["CODE"];
				code["NAME"] = object["NAME"];
			}
			this.empty();
			this.append($("<option value=\"\">"+string+"</option>"));
			for(var i in arrayList){
				if(this.get(0)["tagName"]!=="SELECT"){
					return false;
				}
				var d = arrayList[i];
				this.append($("<option value=\""+d[code["CODE"]]+"\">"+d[code["NAME"]]+"</option>"));
			}
			return this;
		},
		
        //取节点数据，返回一个对象
        getElValue : function(){
			var els = this.find("[data-out-name]");
			var object = {};
			for(var i=0;i<els.length;i++){
				var box = $(els[i]);				
				var outName = box.attr("data-out-name");
				if(outName.length>0){
					var s = box.getHTML();
					if(s===undefined || s==null){
						s = "";
					}
					object[outName] = s;
				}
			}
			return object;
		},
		
		//取节点数据-加强版，返回一个对象
        getElValuePlus : function(a){
        	var params = xyd.formatArguments(arguments);
			var attrName = params["string"]===undefined ? "data-out-name" : params["string"];
			var els = this.find("["+attrName+"]");
			var object = {};
			for(var i=0;i<els.length;i++){
				var box = $(els[i]);				
				var outName = box.attr(attrName);
				if(outName.length>0){
					var s = box.getHTML();
					if(s===undefined || s==null){
						s = "";
					}
					object[outName] = s;
				}
			}
			return object;
		}
		
	});
	
})(jQuery);


(function($){
	$.fn.hoverDelay = function(options) {
		var defaults = {
			hoverDuring: 200,
			outDuring: 200,
			hoverEvent: function() {
				$.noop();
			},
			outEvent: function() {
				$.noop();
			}
		};
		var sets = $.extend(defaults, options || {});
		var hoverTimer, outTimer;
		return $(this).each(function() {
			$(this).hover(function() {
				clearTimeout(outTimer);
				hoverTimer = setTimeout(sets.hoverEvent, sets.hoverDuring);
			}, function() {
				clearTimeout(hoverTimer);
				outTimer = setTimeout(sets.outEvent, sets.outDuring);
			});
		});
	}
})(jQuery); 

/**
 * 将字符串格式化为整数
 * @param {Object} val
 */
function stringFormatToInteger(val){
	val = val + "";
	if(val=="undefined" || val.length<1){
		return "";
	}
	val = val.replace(/\D/g,"");
	return val;
}

/**
 * 将字符串格式化为数字(包含小数点)
 * @param {Object} val
 */
function stringFormatToNumber(val){
	val = val + "";
	if(val=="undefined" || val.length<1){
		return "";
	}
	val = val.replace(/[^\d.]/g,"");//先把非数字的都替换掉，除了数字和.
	val = val.replace(/^\./g,""); //必须保证第一个为数字而不是.
	val = val.replace(/\.{2,}/g,"."); //保证只有出现一个.而没有多个.	
	val = val.replace(".","$#$").replace(/\./g,"").replace("$#$","."); //保证.只出现一次，而不能出现两次以上 
	return val;
}
/**
 * 将数字字符串格式化为保留2位小数
 * @param {Object} val
 * @param {Object} len
 */
function stringFormatToMoney(val,len){
	val = stringFormatToNumber(val);
	if(val.length<1){
		return "";
	}
	len = len===undefined ? 2 : len;
	var RegStr = '^[\\+\\-]?\\d+\\.?\\d{0,'+len+'}'; // 保留小数点后2位
	val = val.match(new RegExp(RegStr, 'g'));
	return val[0];
}

var bindName;
if (navigator.userAgent.indexOf("MSIE") != -1){
	bindName = 'input keyup propertychange beforepaste';
}else{
	bindName = "input keyup beforepaste";
}

$(document).on(bindName,"input[data-control-type='money']",function(){
	this.value = stringFormatToMoney(this.value);
});
$(document).on(bindName,"input[data-control-type='number']",function(){
	this.value = stringFormatToNumber(this.value);
});
$(document).on(bindName,"input[data-control-type='integer']",function(){
	this.value = stringFormatToInteger(this.value);
});
$(document).on(bindName,"input[data-control-type='identity_card']",function(){
	//var reg=/^[1-9]{1}[0-9]{14}$|^[1-9]{1}[0-9]{16}([0-9]|[xX])$/;
	if(this.value.length<18){
		var val = stringFormatToInteger(this.value);
		this.value = val.substring(0,17);
	}else if(this.value.length==18 || this.value.length>18){
		var val = stringFormatToInteger(this.value);
		val = val.substring(0,17);
		val = val +  this.value.substring(17,18);
		val = val.toLocaleUpperCase();
		this.value = val;
	}
	
});
$(document).on(bindName,"input[data-control-type='phone']",function(){
	this.value = stringFormatToInteger(this.value);
	if(this.value.length>11){
		this.value = this.value.substring(0,11);
	}
});

$(document).on("blur","input[data-control-type='XINGMING']",function(){
	this.value = this.value.replace(/[^\u4E00-\u9FA5]/g,"");
});

window.Echo = (function(window, document, undefined) {
	'use strict';
	var store = [],
		offset,
		throttle,
		poll;
	var _inView = function(el) {
		var coords = el.getBoundingClientRect();
		return((coords.top >= 0 && coords.left >= 0 && coords.top) <= (window.innerHeight || document.documentElement.clientHeight) + parseInt(offset));
	};
	var _pollImages = function() {
		for(var i = store.length; i--;) {
			var self = store[i];
			if(_inView(self)) {
				self.src = self.getAttribute('data-echo');
				store.splice(i, 1);
			}
		}
	};
	var _throttle = function() {
		clearTimeout(poll);
		poll = setTimeout(_pollImages, throttle);
	};
	var init = function(obj) {
		var nodes = document.querySelectorAll('[data-echo]');
		var opts = obj || {};
		offset = opts.offset || 0;
		throttle = opts.throttle || 250;
		for(var i = 0; i < nodes.length; i++) {
			store.push(nodes[i]);
		}
		_throttle();
		if(document.addEventListener) {
			window.addEventListener('scroll', _throttle, false);
		} else {
			window.attachEvent('onscroll', _throttle);
		}
	};
	return {
		init: init,
		render: _throttle
	};
})(window, document);

/**
 * 初始化函数
 */
//xyd.disablePageRightButtonEvent();
xyd.disablePageBackEvent();
//xyd.disablePageF5Event();