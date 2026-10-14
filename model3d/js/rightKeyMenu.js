var ie = (navigator.appVersion.indexOf("MSIE")!=-1);//IE
var ff = (navigator.userAgent.indexOf("Firefox")!=-1);//Firefox
var RightKeyMenu = {
	/** 初始化菜单对象 **/
	menuObj : null,
	/*
	 * 创建右键菜单
	 */
	Menu : function(){
		/** 初始化菜单项 **/
		this.menuItemsHTML = "";
		/** 当前菜单项 **/
		this.menuItemsIndex = 0;
		/** 初始化菜单 **/
		this.menuHTML = "";
		/** 菜单ID **/
		this.menuId = "";
		
		this.setMenu = function(menuId,menuDiv){
			this.menuId = menuId;
			RightKeyMenu.menuObj = document.getElementById(menuDiv);
		};
		/** 往右键菜单中添加项 **/
		this.addMenuItems = function(paramsObj,eventObj){
			if(paramsObj != null && paramsObj != ""){
				var id = "";
				var img = "";
				var text = "";
				var setOnclick = "";
				if(eventObj != null && eventObj != "" && eventObj.setOnClick != null && eventObj.setOnClick != ""){
					setOnclick = eventObj.setOnClick;
				}
				if(paramsObj.menuItemId != null && paramsObj.menuItemId != "")
					id = paramsObj.menuItemId;
				
				if(paramsObj.menuItmeImgSrc != null && paramsObj.menuItmeImgSrc != "")
					img = '<td style="width:21px;" align="center"><img src="'+paramsObj.menuItmeImgSrc+'"/></td>';
				else
					img = '<td style="width:5px;" align="center">&nbsp;</td>';
				
				if(paramsObj.menuItemText != null && paramsObj.menuItemText != "")
					text = '<td>&nbsp;'+paramsObj.menuItemText+'&nbsp;</td>';
				else
					text = '<td>&nbsp;</td>';
					
				this.menuItemsHTML += '<tr id="'+id+'" onmouseover="javascript:this.style.backgroundColor = \'#C3E2F8\'" onmouseout="javascript:this.style.backgroundColor = \'#F0F0F0\'" style="height:25px;cursor:pointer;" onclick="'+setOnclick+';">' + img + text + '</tr>';
				if(paramsObj.menuSplit != null && paramsObj.menuSplit == true){
					this.menuItemsHTML += '<tr style="height:1px;"><td colspan="2" valign="middle"><hr size="1" align="center" style="border-top: 1px dashed #C0C0C0;width:85%;"></td></tr>';
				}
				
				this.menuItemsIndex++;
			};
			
		};
		/** 显示右键菜单 **/
		this.show = function(){
			RightKeyMenu.menuObj.innerHTML = '<table id="table_'+this.menuId+'" bordercolor="#CCCCCC" rules="groups" border="1" cellSpacing="0" cellPadding="0" style="border-collapse:collapse;min-width:80px;">' +this.menuItemsHTML + '</table>';
			
			var dbcw = document.body.clientWidth; 
			var dbch = document.body.clientHeight;
			var dbsl = document.body.scrollLeft;
			var dbst = document.body.scrollTop;
			
			var event = this.getEvent();
			
			var rightedge = dbcw - event.clientX;
			var bottomedge = dbch - event.clientY;
			
			RightKeyMenu.menuObj.style.display = "";
			if(ie){
				if (rightedge < RightKeyMenu.menuObj.offsetWidth) {
					RightKeyMenu.menuObj.style.left = (dbcw >= RightKeyMenu.menuObj.offsetWidth) ? (dbcw - RightKeyMenu.menuObj.offsetWidth) : 0;
				} else {
					RightKeyMenu.menuObj.style.left = dbsl + event.clientX;
				}
			
				if (bottomedge < RightKeyMenu.menuObj.offsetHeight) {
					RightKeyMenu.menuObj.style.top = (dbch >= RightKeyMenu.menuObj.offsetHeight) ? (dbch - RightKeyMenu.menuObj.offsetHeight) : 0;
				} else {
					RightKeyMenu.menuObj.style.top = dbst + event.clientY;
				}
			}else{
				if (rightedge < RightKeyMenu.menuObj.offsetWidth) {
					RightKeyMenu.menuObj.style.left = dbcw - RightKeyMenu.menuObj.offsetWidth;
				} else {
					var leftXValue = dbsl + event.clientX+6;
					RightKeyMenu.menuObj.style.left = leftXValue + "px";
				}
			
				if (bottomedge < RightKeyMenu.menuObj.offsetHeight) {
					RightKeyMenu.menuObj.style.top = (dbch >= RightKeyMenu.menuObj.offsetHeight) ? (dbch - RightKeyMenu.menuObj.offsetHeight) : 0;
				} else {
					var leftYValue = dbst + event.clientY;
					RightKeyMenu.menuObj.style.top = leftYValue + "px";
				}
			}
			RightKeyMenu.menuObj.style.visibility = "visible";
			event.returnValue = false;
			return false;
		};
		/** 获取鼠标事件 **/
		this.getEvent = function(){
			if (document.all) {
				return window.event;
			}
			func = this.getEvent.caller;
			while (func != null) {
				var arg0 = func.arguments[0];
				if (arg0) {
					if ((arg0.constructor == Event || arg0.constructor == MouseEvent) || (typeof (arg0) == "object" && arg0.position)) {
						if (arg0.position) {
							arg0.clientX=arg0.position.x;
							arg0.clientY=arg0.position.y;
						}
						return arg0;
					}
				}
				func = func.caller;
			}
			return null;
		}
	},
	/** 隐藏右键菜单 **/
	hidden : function(){
		if(RightKeyMenu.menuObj != null){
			RightKeyMenu.menuObj.style.display = "none";
			RightKeyMenu.menuObj = null;
		}
	}
}


