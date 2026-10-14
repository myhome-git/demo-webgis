var PAGEOBJECT = PAGEOBJECT || {};
(function(parent,module){
	module.parent = parent;
	let _this = module,
		_userCheckMap = new Map();
	
	module.checkUserControl = function(name){
		if(_userCheckMap.get(name)){
			return true;
		}
		return false;
	}
	
	module.initCheckUserControl = function(callback){
		if(this.__isRun){
			return false;
		}
		this.__isRun = true;
		if(callback){
			callback();
		}
		return true;

		let _userInfoPerms = parent.USER_MAIN.getUserInfo().perms;
		$.each(_userInfoPerms, function(index,el) {
			if(!new RegExp("^"+SYSTEM.PROBJECT_PATH.replace(/^\//,"")).test(el)){
				location.href = getProbjectPath()+"/login";
			}
			_userCheckMap.set(el,el);
		});
		
		let _KEY = "user-check";
		let $array = $("body["+_KEY+"]");
		// if($array.length<1){
		// 	document.write("用户权限不足");
		// 	return false;
		// }
		
		$array = $("["+_KEY+"]");
		$.each($array, function(index,el) {
			if(el.tagName!="BODY"){
				let $this = $(el);
				if(!_userCheckMap.get($this.attr(_KEY))){
					$this.remove();
				}
			}
		});
		
		if(callback){
			callback();
		}
	}
	
})(PAGEOBJECT,PAGEOBJECT.USER_CONTROL={});
