/*********************************************************
*	jquery xyd plus
*********************************************************/
window.onerror = function(){
	//return true;
};
var fn = {
	
	// 两个浮点数求和  
    accAdd : function(num1,num2){  
       var r1,r2,m;  
       try{  
           r1 = num1.toString().split('.')[1].length;  
       }catch(e){  
           r1 = 0;  
       }  
       try{  
           r2=num2.toString().split(".")[1].length;  
       }catch(e){  
           r2=0;  
       }  
       m=Math.pow(10,Math.max(r1,r2));  
       // return (num1*m+num2*m)/m;  
       return Math.round(num1*m+num2*m)/m;  
    },
      
    // 两个浮点数相减  
    accSub : function (num1,num2){  
       var r1,r2,m;  
       try{  
           r1 = num1.toString().split('.')[1].length;  
       }catch(e){  
           r1 = 0;  
       }  
       try{  
           r2=num2.toString().split(".")[1].length;  
       }catch(e){  
           r2=0;  
       }  
       m=Math.pow(10,Math.max(r1,r2));  
       n=(r1>=r2)?r1:r2;  
       return (Math.round(num1*m-num2*m)/m).toFixed(n);  
    },
    // 两数相除  
    accDiv : function (num1,num2){  
       var t1,t2,r1,r2;  
       try{  
           t1 = num1.toString().split('.')[1].length;  
       }catch(e){  
           t1 = 0;  
       }  
       try{  
           t2=num2.toString().split(".")[1].length;  
       }catch(e){  
           t2=0;  
       }  
       r1=Number(num1.toString().replace(".",""));  
       r2=Number(num2.toString().replace(".",""));  
       return (r1/r2)*Math.pow(10,t2-t1);  
    }, 
    //两数相乘
    accMul : function (num1,num2){
    
       var m=0,s1=num1.toString(),s2=num2.toString();
	    try{
	    	if(s1.indexOf(".")>-1){
	    		m+=s1.split(".")[1].length;
	    	}
	    }catch(e){
	    	console.info(s1);
	    };
	    try{
	    	if(s2.indexOf(".")>-1){
	    		m+=s2.split(".")[1].length;
	    	}
	    }catch(e){
	    	console.info(s2);
	    };
	    return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m);  
    },
    //保留小数
    toFixed : function(num, s) {
	    var times = Math.pow(10, s)
	    var des = num * times + 0.5
	    des = parseInt(des, 10) / times
	    return des + ''
	},
	getCookie : function (name){
        var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
        if (arr != null) return unescape(arr[2]);
        return null;

    },
    setCookie : function (name, value) {
        var Days = 30;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
        document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + ";path=/";
    },
    
   
};	


/**
 * function fixed() {
        var top = $(document).scrollTop();
        if (($.browser.msie == true) && ($.browser.version == 1)) {
            if (top > 58) $(".navBar").css({ position: "absolute", top: top - 68 });

        } else {
            if (top > 58) $(".navBar").css({ position: "fixed", top: 68 });

        }
        if (top <= 58) $(".navBar").css({ position: "static", top: 0 });

    };
    $(function () {
        window.onscroll = fixed;
        window.onresize = fixed;
    });
 */











var floatTool = function() {
    
    /*
     * 判断obj是否为一个整数
     */
    function isInteger(obj) {
        return Math.floor(obj) === obj
    }
    
    /*
     * 将一个浮点数转成整数，返回整数和倍数。如 3.14 >> 314，倍数是 100
     * @param floatNum {number} 小数
     * @return {object}
     *   {times:100, num: 314}
     */
    function toInteger(floatNum) {
        var ret = {times: 1, num: 0}
        if (isInteger(floatNum)) {
            ret.num = floatNum
            return ret
        }
        var strfi  = floatNum + ''
        var dotPos = strfi.indexOf('.')
        var len    = strfi.substr(dotPos+1).length
        var times  = Math.pow(10, len)
        var intNum = parseInt(floatNum * times + 0.5, 10)
        ret.times  = times
        ret.num    = intNum
        return ret
    }
    
    /*
     * 核心方法，实现加减乘除运算，确保不丢失精度
     * 思路：把小数放大为整数（乘），进行算术运算，再缩小为小数（除）
     *
     * @param a {number} 运算数1
     * @param b {number} 运算数2
     * @param digits {number} 精度，保留的小数点数，比如 2, 即保留为两位小数
     * @param op {string} 运算类型，有加减乘除（add/subtract/multiply/divide）
     *
     */
    function operation(a, b, op) {
        var o1 = toInteger(a)
        var o2 = toInteger(b)
        var n1 = o1.num
        var n2 = o2.num
        var t1 = o1.times
        var t2 = o2.times
        var max = t1 > t2 ? t1 : t2
        var result = null
        switch (op) {
            case 'add':
                if (t1 === t2) { // 两个小数位数相同
                    result = n1 + n2
                } else if (t1 > t2) { // o1 小数位 大于 o2
                    result = n1 + n2 * (t1 / t2)
                } else { // o1 小数位 小于 o2
                    result = n1 * (t2 / t1) + n2
                }
                return result / max
            case 'subtract':
                if (t1 === t2) {
                    result = n1 - n2
                } else if (t1 > t2) {
                    result = n1 - n2 * (t1 / t2)
                } else {
                    result = n1 * (t2 / t1) - n2
                }
                return result / max
            case 'multiply':
                result = (n1 * n2) / (t1 * t2)
                return result
            case 'divide':
                return result = function() {
                    var r1 = n1 / n2
                    var r2 = t2 / t1
                    return operation(r1, r2, 'multiply')
                }()
        }
    }
    
    // 加减乘除的四个接口
    function add(a, b) {
        return operation(a, b, 'add')
    }
    function subtract(a, b) {
        return operation(a, b, 'subtract')
    }
    function multiply(a, b) {
        return operation(a, b, 'multiply')
    }
    function divide(a, b) {
        return operation(a, b, 'divide')
    }
    
    // exports
    return {
        add: add,
        subtract: subtract,
        multiply: multiply,
        divide: divide
    }
}();

//修复toFixed精度问题
/*
Number.prototype.toFixed = function(scale) { 
    var s, s1, s2, start; 
    s1 = this + ""; 
    start = s1.indexOf("."); 
    s = s1.movePoint(scale); 
    if (start >= 0) { 
        s2 = Number(s1.substr(start + scale + 1, 1)); 
        if (s2 >= 5 && this >= 0 || s2 < 5 && this < 0) { 
            s = Math.ceil(s); 
        }else { 
            s = Math.floor(s); 
        }
    }
    return s.toString().movePoint(-scale);
}  
*/




