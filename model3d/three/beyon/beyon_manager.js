/*
*管理对象的基类
*
*/

function BeyonManager(){
	this.name =undefined ;
	
	this._collection=new Map();

	this.services=new Map();
	
}

BeyonManager.prototype = {
	constructor:BeyonManager,
	get collection(){
			return this._collection;
	},
	
}
BeyonManager.prototype.registe_service=function(){
	
}
BeyonManager.prototype.add_service=function(serviceName,service){
    if(!this.services.has(serviceName)){        
		this.services.set(serviceName,service);
		return true;
	}
	return false;
}

BeyonManager.prototype.remove_service=function(serviceName){
    if(this.services.has(serviceName)){        
		this.services.delete(serviceName);
	}
}

BeyonManager.prototype.exec_service = function(serviceName,params) {
	var result={
		success:true,
		return:undefined
	};
	var funcParams=[];
    if(this.services.has(serviceName)){
		var serviceParams=this.services.get(serviceName);
		//复制参数
		for(var i=0;i<serviceParams.length;i++){
			var param=serviceParams[i];
			var value=params[param.key];
			if(param.value==="need"&&!defined(value)){
				//没有必须参数，则返回错误
				result.success=false;
				result.return="the params "+name+"is necessary";
				return result;
			}
			funcParams.push(value);
		};
		switch (i) {
			case 0:
				result.return=this[serviceName](funcParams[0]);
				break;
			case 1:
			result.return=this[serviceName](funcParams[0],funcParams[1]);
				break;
			case 2:
			result.return=this[serviceName](funcParams[0],funcParams[1],funcParams[2]);
				break;
			case 3:
			result.return=this[serviceName](funcParams[0],funcParams[1],funcParams[2],funcParams[3],funcParams[4]);
				break;
			case 4:
			result.return=this[serviceName](funcParams[0],funcParams[1],funcParams[2],funcParams[3],funcParams[4],funcParams[5]);
				break;
			case 5:
			result.return=this[serviceName](funcParams[0],funcParams[1],funcParams[2],funcParams[3],funcParams[4],funcParams[5],funcParams[6]);
				break;
			case 6:
			result.return=this[serviceName](funcParams[0],funcParams[1],funcParams[2],funcParams[3],funcParams[4],funcParams[5],funcParams[6],funcParams[7]);
				break;
			case 7:
			result.return=this[serviceName](funcParams[0],funcParams[1],funcParams[2],funcParams[3],funcParams[4],
				funcParams[5],funcParams[6],funcParams[7],funcParams[8]);
				break;
			case 8:
			result.return=this[serviceName](funcParams[0],funcParams[1],funcParams[2],funcParams[3],funcParams[4],
				funcParams[5],funcParams[6],funcParams[7],funcParams[8],funcParams[9]);
				break;
			case 9:
			result.return=this[serviceName](funcParams[0],funcParams[1],funcParams[2],funcParams[3],funcParams[4],
				funcParams[5],funcParams[6],funcParams[7],funcParams[8],funcParams[9],funcParams[9]);
				break;
			case 10:
			result.return=this[serviceName](funcParams[0],funcParams[1],funcParams[2],funcParams[3],funcParams[4],
				funcParams[5],funcParams[6],funcParams[7],funcParams[8],funcParams[9],funcParams[9],funcParams[10]);
				break;
		}
		
	}else{
		//没有必须参数，则返回错误
		result.success=false;
		result.return="the service "+serviceName+"is undefined";
	}
	return result;
}

BeyonManager.prototype.size = function() {
	return this._collection.size;
}
BeyonManager.prototype.add = function(id,obj) {
    this._collection.set(id,obj);
}

//删除单个元素
BeyonManager.prototype.remove = function(id) {
	if(!defined(id)||!this._collection.has(id)){
		return;
	}
	var element = this._collection.get(id);
	//场景元素自行销毁
	element.removeSelf();	
	//删除图层中的逻辑元素
	this._collection.delete(id);
}

//删除所有元素
BeyonManager.prototype.removeAll = function() {
	this._collection.forEach(function(item){
		//场景元素自行销毁
		item.removeSelf();
	});
	//清空图层中的逻辑元素
	this._collection.clear();
}

//获取元素
BeyonManager.prototype.getObject= function(id) {
	if(this._collection.has(id))
		return this._collection.get(id);
	else
		return null;
}

//是否存在元素
BeyonManager.prototype.has = function(id) {
	return this._collection.has(id);
}

//由obj获取元素ID
BeyonManager.prototype.getId = function(obj) {
	for (var [key,value] of this._collection) {
		if(value===obj)	return key;
	}
	return null;
}

