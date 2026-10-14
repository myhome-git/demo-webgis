var zhtsjs = (function(){

	return {
		setSocketV:function(o,socket){
			
			var prop = $(o).data();
			var type = prop.type;
			var v = $(o).prop("checked");
			
			if(type==='receiveTSLD'&&!v){
				socket.unsubscribeTSLD();
				return;
			}else if(type==='receiveTSLD'){
				socket.syncTSLD();
				return;
			}
	
			if(socket[type]){
				socket[type].show = v ? true : false;
			}else {
				socket.MBClass[prop.ckvalue] = v?true :false;
			}
			
			//敌我
			if(type==='receiveDF'){
				manager.clearDF(v);
			}
			if(type==='receiveWF'){
				manager.clearWF(v);
			}
			
			//陆海空
			if(type ==='receiveLU'){
				manager.clearMBLB("陆地目标",v);
			}
			if(type ==='receiveKONG'){
				manager.clearMBLB("空中目标",v);
			}
			if(type ==='receiveHAI'){
				manager.clearMBLB("水面目标",v);
			}
			
			//清除舰机
			if(prop.ckvalue !=null&&!v){
				manager.clearMBClass(prop.ckvalue );
			}
			
			//民用
			if(type==='receiveMH'){
				manager.clearMH(v);
			}
			
			//军用
			if(type==='receiveJY'){
				manager.clearJY(v);
			}
		},
		getSocket:function(){
			return socket;
		},
		stop:function(){
			$(target).click();
			 socket.stop();
		},
		alter:function(f){
			//清空所有作战能效范围
			//manager.wsLayer.getSource().clear();
			
			//设置当前操作的对象
			ZHTSCONFIG.settrackObj(f);
			
			var o = f.getProperties();
			// console.log(o);
			var mbxx = {nm:o.mbnm,mc:o.jxh,pos:[o.lon,o.lat],feature:f};

			var mblx = o.mblb;
			if(mblx==='空中目标'){
				var tt = $("#rircle-ul-jbxx").find(".font")[0];
				// $(tt).text("");
			}
			
			//刘金芳

			_FunctionObject.CreateCircleMenuElement(mblx);

			TemplateAlertCircle.ClickQueue[0] = TemplateAlertCircle.ClickQueue[1];
			TemplateAlertCircle.ClickQueue[1] = new Date().getTime();
			if(TemplateAlertCircle.ClickQueue[1]-TemplateAlertCircle.ClickQueue[0]<500){
				TemplateAlertCircle.Console(o.jxh+"不能重复点击["+(TemplateAlertCircle.ClickQueue[1]-TemplateAlertCircle.ClickQueue[0])+"毫秒]");
				return false;
			}
			
			var _modelObject = {
				modelId : o.mbnm,
				modelName : o.jxh,
				modelPosition : [o.lon,o.lat]
			}
			

			TemplateAlertCircle._data = o;
			TemplateAlertCircle.Console(_modelObject);
			TemplateAlertCircle.CloseWindowsAll();
			
			TemplateAlertCircle.modelId = _modelObject.modelId;
			TemplateAlertCircle.modelName = _modelObject.modelName;
			TemplateAlertCircle.modelPosition = _modelObject.modelPosition;
			if(_modelObject.modelId){
				TemplateAlertCircle.SetCircleTitle();
				$("#circle-menu-box").css({"display":"block"});
			}else{
				$("#circle-menu-box").css({"display":"none"});
				TemplateAlertCircle.xLayerMessage(" 数据建设中,暂无资料详情!");
			}
		}
	}
})();
