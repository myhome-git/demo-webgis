/*
	表格组件
*/
var xydTable;
$(function(){
	xydTable = function(){
		var object = new Object();
		
		object.getTypeof = function(b){
			var base = Object.prototype.toString.call(b).toLocaleLowerCase();
			return base.replace(/(^\[object\s*)(.*)(\]$)/,"$2");
		}
		
		object.jpage = {
			ajax : {},					//ajax方式
			params : {},				//查询参数
			data : undefined,			//表格数据
			control : {},				//分页信息
			settings : undefined		//设置区
		};
		
		object.init = function(settings){
			object.jpage.settings = {
				tableId : "body",
				selectTrue : "false",
				checkbox : "true",
				Columns : [],
				isTableNowrap : "true",
				uuid : "uuid",
				checkboxName : "groupCheck"+new Date().getTime(),
				isTableNum : true,
				width : "100%"
			};
			object.jpage.settings = $.extend(this, settings);
			
			settings.pageSize = settings.pageSizeGroup ? settings.pageSizeGroup[0] : settings.pageSize;
			object.jpage.control = {
				pageSize : settings.pageSize || 10,
				pageIndex : 1,
				pageStepNumber : settings.pageStepNumber || 5,		//步进
				pageSizeGroup : settings.pageSizeGroup || [10,15,20,50,100,200]
			};
			
			object.createAuto();
			
			return object;
		}
		
		//自动创建
		object.createAuto = function(){
			var s = object["jpage"]["settings"],html,c;
				c = s["isTableNowrap"]=="true" ? " table-nowrap" : "";
				w = s["width"];
				html = "<div class=\"xydTable\"><table class=\""+c+"\"  cellspacing=\"0\" cellpadding=\"0\">"+object.createTableThead()
					+ "</table></div>";

			var o = $(s["tableId"]);
			o.css({
				"width":o.parent().outerWidth()+"px"
			});
			
			o["html"] ? o["html"](html) : "";
			
			var t = $(s["tableId"]).find(".xydTable");
			t.css({
				"width":o.innerWidth()+"px",
				"overflow":"auto"				
			});
			
			
			var fix = $("<div class=\"xydTableMenu\"></div>");
				fix.css({"position":"relative","background":"#f5f5f5"});
				
			var btnBox = $("<div class=\"xydTableMenuBtnBox\"></div>");
				btnBox.css({
					"float":"left"
				});
				btnBox.append(s["btnBox"]);
			var btn = $("<div class=\"xydTableMenuControl\" style=\"font-size:14px;color:#239DCE;\"><i class=\"iconfont\">&#xe7ab;</i>&nbsp;操作</div>");
				btn.css({
					"position":"absolute",
					"right":"10px",
					"top":"-35px",
					"cursor":"pointer"
				});
				btn.click(function(){
					fix.find("div.ul_box").toggle();
				});
				
			var ul_box = $("<div class=\"ul_box\"></div>");
				ul_box.css({
					"position":"absolute",
					"right":"0",
					"top":"0",
					"z-index":"1",
					"display":"none"
				});
				ul_box.hover(function(){},function(){
					$(this).hide();
				});
			var ul = $("<ul></ul>");
				ul.css({				
					"background":"#FFB200",
					"padding":"5px",
					"border":"1px solid #ddd"
					
				});
			ul_box.append(ul);
			
			for(var i=0;i<s["Columns"].length;i++){
				var obj = s["Columns"][i];
				var li = $("<li></li>");
					li.css({
						"padding":"5px",
						"cursor":"pointer"
					});
					
				var c = $("<input type=\"checkbox\" name=\"xydTableMenuCheckbox\" checked=\"true\"/>");
				
				try{
		          throw i;
		       }catch(i){
		          	c.click(function(){
		          		var thDisplayLength = 0;
						var checkboxList = o.find(".ul_box").find(":checkbox");
		          		for(var tt=0;tt<checkboxList.length;tt++){
							if($(checkboxList[tt]).prop("checked")===true){
								thDisplayLength +=1 ;
							}
						}
						if(thDisplayLength<2){
							return false;
						}
						
						
						var $this = $(this);
						var val = $this.parent().text();

						var thead = t.find(".thead");						
						var ths = thead.find("th");
						var index;
						for(var mm=0;mm<ths.length;mm++){
							if(val==$(ths[mm]).text()){
								index = mm;
							}
						}
						
						var trs = t.find(".tbody").find("tr");

						if($this.prop("checked")===false){
							thead.find("th:eq("+index+")").hide();
							for(var mm=0;mm<trs.length;mm++){
								$(trs[mm]).find("td:eq("+index+")").hide();
							}
						}else{
							thead.find("th:eq("+index+")").show();
							for(var mm=0;mm<trs.length;mm++){
								$(trs[mm]).find("td:eq("+index+")").show();
							}
						}

						//s["ColumnsTemp"]
					});
					
		        }
			        
				var span = $("<span>"+obj["title"]+"</span>");
					span.css({
						"color":"#fff"
					});
				li.append(c);
				li.append(span);
				ul.append(li);
			}
			fix.append(btnBox);
			fix.append(btn);
			btnBox.css({"width":(fix.outerWidth()-btn.outerWidth()-100)+"px"});
			fix.append("<div style=\"clear:both;\"></div>");
			fix.append(ul_box);
	
			o.prepend(fix);
			t.scroll(function(){
				var $this = $(this);
				fix.css({
					//"right" : "-"+$this.scrollLeft()+"px"
				});
				//btnBox.css({"width":(fix.outerWidth()-btn.outerWidth()-100)+"px"});
			});

			object.bindHeadOnclick();
			
		}
		
		//节点-创建加载界面
		object.createPageLoadding = function(){
			var s = object["jpage"]["settings"];
			var el = $(s["tableId"]);
			
			var len = el.find("thead th").length;
			var str = ""
					+ "<tr><td Colspan=\""+len+"\" style=\"height:30px;\"><center>"
					+ "<img src=\"/web/page/images/load.gif\" style=\"width:auto;height:auto;\"/>"
					+ "<span>&nbsp;&nbsp;正在加载....</span>"
					+ "</center></td></tr>";

			return el.find("tbody").html(str);
		}
		
		//创建没有数据界面
		object.createPageLoaddingNoneData = function(){
			var s = object["jpage"]["settings"];
			var el = $(s["tableId"]);
			
			var len = el.find("thead th").length;
			var str = ""
					+ "<tr><td Colspan=\""+len+"\" style=\"height:30px;\"><center>"
					+ "<i class=\"iconfont\">&#xe663;</i>"
					+ "<span>&nbsp;&nbsp;没有查询到相关数据！</span>"
					+ "</center></td></tr>";
			
			return el.find("tbody").html(str);
		}
		
		//节点-创建错误界面
		object.createPageLoaddingErr = function(str){
			var s = object["jpage"]["settings"];
			var el = $(s["tableId"]);
			
			var len = el.find("thead th").length;
			var str = ""
					+ "<tr><td Colspan=\""+len+"\" style=\"height:30px;color:#f00;\"><center>"
					//+ "<i class=\"iconfont\">&#xe663;</i>"
					+ "<span>&nbsp;&nbsp;"+str+"</span>"
					+ "</center></td></tr>";
			
			return el.find("tbody").html(str);
		}
		
		//节点-创建表头
		object.createTableThead = function(){
			var s = object["jpage"]["settings"];

			if(!object.getTypeof(s["Columns"])=='array' || s["Columns"].length<1){
				return "";
			}
			
			var thead = "";
			
			thead = "<thead class=\"thead\" data-type=\"thead\"><tr>";

			if(s.checkbox==="true"){
				thead += s.selectTrue==="true" 
						? "<th width=\"34\"><div class=\"thbox\"><input type=\"checkbox\" class=\"th_checkbox\" /></div></th>"
						: "<th width=\"34\"><div class=\"thbox\"><input type=\"checkbox\" class=\"th_checkbox\" disabled=\"disabled\" autocomplete=\"off\"/></div></th>";
			}
			if(s["isTableNum"]===true){
				
				thead += "<th><div class=\"thbox\">序号</div></th>";
			}
			
			for(var i in s["Columns"]){
				var o = s["Columns"][i];
				
				thead += o["width"] 
						? "<th width=\""+o["width"]+"\"><div class=\"thbox\">"+o["title"]+"</div></th>"
						: "<th><div class=\"thbox\">"+o["title"]+"</div></th>";
			}
			thead += "</tr></thead><tbody class=\"tbody\"></tbody>";
			
			return thead;
			
		}

		//节点-创建数据区
		object.createTableTbody = function(data){
			if(object.getTypeof(data)!=="array"){return;}
			if(data.length<1){return;}
			var s = object.jpage.settings;
			var tbodyHtml = "";
			var tableId = $(object["tableId"]);
			var lis = tableId.find(".ul_box").find("li");
			var checkboxList = {};
			for(var i=0;i<lis.length;i++){
				var checkbox = $(lis[i]).find("input[type='checkbox']");
				if(checkbox.prop("checked")===false){
					checkboxList[$(lis[i]).text()] = false;
				}else{
					checkboxList[$(lis[i]).text()] = true;
				}
			}
			
			for(var i=0;i<data.length;i++){
				var d = data[i];
			
				if(d[s["uuid"]]===undefined){
					d[s["uuid"]] = i;
				}
				
				
				var tr = "<tr data-uuid=\""+d[s["uuid"]]+"\" data-index=\""+i+"\" data-type=\"unit\">";
	
				s["checkbox"]==="true" ? tr += "<td><input type=\"checkbox\" name=\""+s["checkboxName"]+"\" /></td>" : tr;
				if(s["isTableNum"]===true){
					tr += "<td>"+((object.jpage.control.pageIndex-1)*object.jpage.control.pageSize+i)+"</td>";
				}
				for(var y in s["Columns"]){
					
					var c = s["Columns"][y];
	
					var isDisplay = checkboxList[c["title"]]===false ? "display:none;" : "";
					
					var td = c["isTitle"] ? "<td title=\""+d[c["field"]]+"\" style=\""+isDisplay+"\">" : "<td style=\""+isDisplay+"\">";	
					
					var tdHTML = d[c["field"]];
					try{
						for(var o in c["replace"]){
							if(c["replace"][o]["key"]==tdHTML){
								tdHTML = c["replace"][o]["value"];
							}
						}
					}catch(e){}
					tdHTML = tdHTML=== undefined ? "-" : tdHTML;
					tdHTML = d[c["escape"]]===true ? escapeHTML(tdHTML) : tdHTML;
					
					td += tdHTML + "</td>";
					tr += td;
				}
				tr += "</tr>";
				tbodyHtml += tr;
			}
			//tbodyHtml = "<tbody class=\"tbody\">"+tbodyHtml+"</tbody>";
			return tbodyHtml;	
		}
		
		
		
		//创建分页数据
		object.createJpage = function(params){
			if(!params){return false;}
			var control = object.jpage.control;
			
			var ret = {
				pageSizeGroup : control.pageSizeGroup,
				rsCount : undefined,				//总条数
				pageSize : undefined,				//每页大小
				pageCount : undefined,				//分页数量
				pageIndex : undefined,				//当前第几页
				pageStepNumber : undefined,			//步长
				pageStep : []						//步进
			};
			
			ret.rsCount = params.rsCount===undefined || params.rsCount < 1 ? 0 : params.rsCount;
			ret.pageSize =  control.pageSize;
			
			ret.pageCount = ret.rsCount%ret.pageSize==0 ? ret.rsCount/ret.pageSize : parseInt(ret.rsCount/ret.pageSize)+1;

			//修正当前页
			ret.pageIndex = control.pageIndex===undefined || control.pageIndex<1 ? 1 : control.pageIndex;
			if(ret.pageCount>0){
				ret.pageIndex = ret.pageIndex>ret.pageCount ? ret.pageCount : ret.pageIndex;
			}
			
			
			//根据用户想看的页pagenum，算出页面的起始和结束页码
			ret.pageStepNumber = control.pageStepNumber;
			ret.pageStepNumber = ret.pageStepNumber<5 ? 5 : ret.pageStepNumber;

			if(ret.pageCount<=ret.pageStepNumber){
				ret.pageStep = [1,ret.pageCount];
			}else{
				ret.pageStep = [ret.pageStepNumber%2==0?ret.pageIndex-parseInt(ret.pageStepNumber/2-1):ret.pageIndex- parseInt(ret.pageStepNumber/2),ret.pageIndex + parseInt(ret.pageStepNumber/2)];
			}
			
			ret.pageStep = ret.pageStep[0]<1 ? [1,ret.pageStepNumber] : ret.pageStep;
			ret.pageStep = ret.pageStep[1]>ret.pageCount ? [ret.pageCount-(ret.pageStepNumber-1),ret.pageCount] : ret.pageStep;
			ret.pageStep = ret.pageStep[0]>ret.pageStep[1] ? [ret.pageStep[1],ret.pageStep[1]] : ret.pageStep;

			//console.info("记录数["+ret.rsCount+"]，每页大小["+ret.pageSize+"]，分页数["+ret.pageCount+"]，当前页索引["+ret.pageIndex+"]，步进["+ret.pageStep[0]+","+ret.pageStep[1]+"]，步长["+ret.pageStepNumber+"]");
			object.jpage.control = ret;

			return object.jpage.control;
		}
		
		
		
		//创建分页节点
		object.createPageBottomNav = function(){

			var s = object.jpage.settings
			var control = object.jpage.control;

			var str = "";
				str += "<div class=\"pagePaging xyd_clearfix\">"
						+ "<center>"
						+ "<span>每页显示</span>"
						+ "<div class=\"xyd_inlineblock\" style=\"width:10px;\"></div>"
						+ "<select class=\"pageSizeGroup\" style=\"width:60px;\">";
						for(var i in control.pageSizeGroup){
							var group = control.pageSizeGroup[i];
							if(control.pageSize==group){
								str += "<option selected=\"selected\">"+group+"</option>";
							}else{
								str += "<option>"+group+"</option>";
							}
						}
					str	+= "</select>"
						+ "<div class=\"xyd_inlineblock\" style=\"width:10px;\"></div>"
						+ "<span>条</span>，"
						+ "<span>共<i class=\"rsCount\">"+control.rsCount+"</i>条数据，</span>"
						+ "<div class=\"xyd_inlineblock\" style=\"width:10px;\"></div>"
						+ "<i class=\"pageIndex\">"+control.pageIndex+"</i>/<i class=\"pageCount\">"+control.pageCount+"</i>页"
						+ "<div class=\"xyd_inlineblock\" style=\"width:10px;\"></div>"
						+ "<div class=\"pageStep xyd_inlineblock\">";
						
						//步长从2开始才显示首页
						if(control.pageStep[0] > 1){
							str += "<span class=\"pageNumber pageleft\" data-index=\"1\">首页</span>";
						}
						
						//步长结尾和步长开始相减大于0才显示步长
						if(control.pageStep[1]-control.pageStep[0] > 0){
							var selectIndex;
							for(var i=control.pageStep[0];i<=control.pageStep[1];i++){
								if(i==control.pageIndex){
									selectIndex = "selectIndex"
								}else{
									selectIndex = ""
								}
								str += "<a class=\"pageNumber "+selectIndex+"\" data-index=\""+i+"\">"+(i)+"</a>";
							}
						}
						
						//只有步进结尾小于总页数才显示尾页
						if(control.pageStep[1] < control.pageCount){
							str +=  "<span class=\"pageNumber pageright\" data-index=\""+control.pageCount+"\">尾页</span>";
						}
						
					str += "</div>";
						
						//只有总页数超出步长，才显示跳转
						if(control.pageStepNumber < control.pageCount){
							str += "<div class=\"xyd_inlineblock\" style=\"width:20px;\"></div>"
								+ "<span>到第&nbsp;</span>"
								+ "<input type=\"text\" class=\"jumpNumber\" />"
								+ "<span>&nbsp;页</span>"
								+ "<div class=\"xyd_inlineblock\" style=\"width:10px;\"></div>"
								+ "<span class=\"btnJump\">跳转</span>";
						}

					str += "</center>"
					+ "</div>";

			return str;
		}
		
		//节点-绑定选中事件
		object.bindTheadChecked = function(){
			
			var s = object.jpage.settings;
			$(s.tableId + " .xydTable thead .th_checkbox").on("click",function(){
				var $this = $(this);
				if($this.is(":checked")==true){
					object.setCheckedAll();
				}else{
					object.setCheckedNoneAll();
				}
			});
			
			
			$(s.tableId + " .xydTable tbody tr[data-type='unit']").on("click",function(){
				var $this = $(this);
				if(s.selectTrue=="false"){
					if($this.attr("data-action")!=="checked"){
						object.setCheckedNoneAll();
						object.setCheckedId($this.attr("data-uuid"));
					}else{
						object.setCheckedNoneId($this.attr("data-uuid"));
					}
				}else if(s.selectTrue=="true"){
					if($this.attr("data-action")!=="checked"){
						object.setCheckedId($this.attr("data-uuid"));
					}else{
						object.setCheckedNoneId($this.attr("data-uuid"));
					}
				}
			});
			
		}
		
		//绑定排序事件
		object.bindHeadOnclick = function(callback){
			var s = object.jpage.settings;
			$(s.tableId).find("[data-type='thead'] .thbox").on("dblclick",function(){
				if(callback){
					callback(this);	
				}
				return false;
				var $this = $(this);
				var s = object.jpage.settings;
				var Columns = object.jpage.settings.Columns;
				for(var i in Columns){
					if($this.html()==Columns[i].title){
						object.sortCreateTbody(Columns[i].field);
					}
				}
				//console.info(object.jpage.control.pageIndex);
			});
		}
		
		//绑定分页事件
		object.bindJpage = function(){
			var s = object.jpage.settings;
			$(s.tableId + " .pageNumber").on("click",function(){
				var pageIndex = parseInt($(this).attr("data-index"));
				object.jpage.control.pageIndex = pageIndex;
				object.ajaxGetTableData();
				
			});
			
			//单击每页显示条数
			$(s.tableId + " .pageSizeGroup").on("change",function(){
				object.jpage.control.pageSize = $(this).val();
				object.setPageSizeCount(this);
				object.ajaxGetTableData();
			});
			
			
			$(s.tableId + " .btnJump").on("click",function(){
				var pageIndex = $(s.tableId).find(".jumpNumber").val();
				pageIndex = parseInt(pageIndex);
	
				if(isNaN(pageIndex) || pageIndex<1){
					pageIndex = 1;
				}
				if(pageIndex > object.jpage.control.pageCount){
					pageIndex = object.jpage.control.pageCount;
				}
				object.jpage.params.pageIndex = pageIndex;
				object.jpage.control.pageIndex = pageIndex;
				object.ajaxGetTableData();

			});

		}
		
		
		//配置查询
		object.queryParams = function(params){
			return params;
		}
		
		//数据提交
		object.ajaxGetTableData = function(){
			
			var jpage = object.jpage;
			var s = jpage.settings;
			
			jpage.params.pageSize =  jpage.control.pageSize;
			
			jpage.params.pageIndex =  jpage.control.pageIndex;
			var p = object.queryParams(object.jpage.params);
			jpage.params = p.params;
			/*
			jpage.control.pageSize = jpage.params.pageSize;
			jpage.control.pageIndex = jpage.params.pageIndex;
			*/
			jpage.ajax = p.ajax;

			jpage.ajax.url = jpage.ajax.url;
			jpage.ajax.type = "POST";
			var ajaxParams = jpage.ajax.type===undefined && jpage.ajax.type!=="get" ? "POST" : jpage.ajax.type;

			$(s.tableId).find("tbody").empty();
			$(s.tableId).find(".pagePaging").empty();
			
			//object.createPageLoadding();
			
			$.ajax({
				url : jpage.ajax.url,
				data : jpage.params,
				type : ajaxParams,
				dataType : "json",
				async : true,
				success : function(ret){
			
					if(ret["return"]["RTNCODE"]!=="100"){
						var RTNMSG = ret["return"]["RTNMSG"];
							RTNMSG = RTNMSG + "";
						object.createPageLoaddingErr(RTNMSG.xydReplaceAll("核心系统处理失败，失败原因："));
						return;
					}
					var el = $(s.tableId);
					
					try{
						try{
							if(object.getTypeof(ret["datalist"])=="array"){
								object.jpage.data = ret["datalist"];
								object.createJpage({rsCount : ret["page"]?ret["page"]["RECORD_COUNT"]:0});
							}else{
								object.jpage.data = [];
							}							
							
						}catch(e){
							throw new Error(e.massage);
						}
						
						var d = object.getTbaleDataAll();
						
						var tbody = object.createTableTbody(object.jpage.data);
						
						 window.setTimeout(function(){
							el.find("tbody").html(tbody);
							object.onLoadSuccess();
							var el_jpage = el.find(".pagePaging");
							if(el_jpage.length<1){
								el_jpage = $("<div class=\"pagePaging\"></div>");
								el.append(el_jpage);
							}
							object.bindTheadChecked();
							if(object.getTypeof(object.jpage.data)=="array"){
								if(object.jpage.data.length>0){
									try{
										el_jpage.show();
										el_jpage.html(object.createPageBottomNav());
									}catch(e){}

									object.bindJpage();
									
								}else{
									el_jpage.hide();
									object.createPageLoaddingNoneData();
								}
							}else{
								el_jpage.hide();
								object.createPageLoaddingNoneData();
							}
							
							
						 },500);
					}catch(e){
						object.createPageLoaddingErr("数据加载失败，请刷新重试！");
					}
					
				},
				error : function(jqXHR, textStatus, errorThrown){
					object.createPageLoaddingErr("服务器请求失败，请刷新重试！");
				}
				
			})
			
		}
		
		//节点-选中ID
		object.setCheckedId = function(uuid){
			if(object.getTypeof(uuid)!=='string' && object.getTypeof(uuid)!=='number'){
				return;
			}
			var s = object.jpage.settings;
			var $this = $(s.tableId).find("tbody tr[data-type='unit'][data-uuid='"+uuid+"']");
				$this
				.attr("data-action","checked")
				.addClass("checked");
				var checkBox = $this.find("input[name='"+s.checkboxName+"']")
				checkBox.prop("checked",true);
		}
		//节点-选中取消ID
		object.setCheckedNoneId = function(uuid){
			if(object.getTypeof(uuid)!=='string' && object.getTypeof(uuid)!=='number'){
				return;
			}
			var s = object.jpage.settings;
			var $this = $(s.tableId).find("tbody tr[data-type='unit'][data-uuid='"+uuid+"']");
				$this
				.removeAttr("data-action")
				.removeClass("checked");
				var checkBox = $this.find("input[name='"+s.checkboxName+"']")
				checkBox.prop("checked",false);
		}
		
		//节点-全部选中
		object.setCheckedAll = function(){
			var s = object.jpage.settings;
			$(s.tableId).find("tbody tr[data-type='unit']").each(function(){
				object.setCheckedId($(this).attr("data-uuid"));
			});
		}
		//节点-取消全部选中
		object.setCheckedNoneAll = function(){
			var s = object.jpage.settings;
			$(s.tableId).find("tbody tr[data-type='unit']").each(function(){
				object.setCheckedNoneId($(this).attr("data-uuid"));
			});
		}
		//节点-取选中数据
		object.getTableCheckedData = function(){
			var s = object.jpage.settings;
			var ret = [];
			$(s.tableId).find("tbody tr[data-type='unit'][data-action='checked']").each(function(index,f){
				var id = $(f).attr("data-uuid");
				var temp = object.getTableDataId(id);
				if(temp){
					ret.push(temp);
				}
			});
			return ret;
		}
		
		//节点-删除数据ID
		object.remove = function(uuid){
			var s = object.jpage.settings;
			if(object.getTypeof(uuid)!=='array'){
				for(var i in uuid){
					$(s.tableId).find("tr[data-uuid='"+uuid[i]+"']").remove();
				}
			}else{
				$(s.tableId).find("tr[data-uuid='"+uuid+"']").remove();
			}
		}
		
		//设置tbody的html
		object.setTbodyHtml = function(html){
			var s = object.jpage.settings;
			$(s.tableId).find("tbody").html(html);
		}
		//事件区-单击每页条数
		object.setPageSizeCount = function(){};
		
		//数据区-取数据全部
		object.getTbaleDataAll = function(){
			return object.jpage.data;
		}
		
		//数据区-设置数据
		object.setTbaleData = function(data){
			return object.jpage.data = data;
		}
		
		//数据区-取数据ID
		object.getTableDataId = function(uuid){
			if(uuid===undefined){return;}
			var data = object.jpage.data;
			var s = object.jpage.settings;
			for(var i in data){
				var d = data[i];
				if(d[s.uuid].toString() ===uuid.toString()){
					/*
						删除temp副本的属性时会连带原型链属性也被删除
						如果生成另一个副本将会增加内存用量，暂时搁置
					var temp = d;
					if(s.isuuid==false){
						delete temp[s.uuid];
					}
					*/
					return d;
				}
			}
		}
		object.onLoadSuccess = function(){
			
		}
		//数据区-删除数据ID
		object.deleteTableId = function(uuid){
			if(uuid===undefined){return;}
			var s = object.jpage.settings;
			var d = object.getTbaleDataAll();
			for(var i in d){
				if(d[i][s.uuid].toString()==uuid.toString()){
					d.splice(uuid,1);
					return d;
				}
			}
		}
		
		//数据排序
		object.sortBy = function(filed, rev, primer){
			rev = (rev) ? -1 : 1;
			return function (a, b) {
				a = a[filed];
				b = b[filed];
				if (typeof (primer) != 'undefined') {
					a = primer(a);
					b = primer(b);
				}
				if (a < b) { return rev * -1; }
				if (a > b) { return rev * 1; }
				return 1;
			}
		}
		
		//数据排序后重新生成
		object.sortCreateTbody = function(colname){
			var s = object.jpage.settings;
			//obj.sort(sortBy('b', false, parseInt));	数字排序
			//obj.sort(sortBy('b', false, String));		字符串排序
			try{
				object.jpage.data.sort(object.sortBy(colname, true, String));
			}catch(e){}
			
			var d = object.getTbaleDataAll();
			var el = $(s.tableId);
			el.find("tbody").html(object.createTableTbody(object.jpage.data));
			object.bindTheadChecked();
		}
		
		var escapeHTML = function (text) {
			if (typeof text === 'string') {
				return text
					.replace(/&/g, "&amp;")
					.replace(/</g, "&lt;")
					.replace(/>/g, "&gt;")
					.replace(/"/g, "&quot;")
					.replace(/'/g, "&#039;");
			}
			return text;
		};
		return object;
	};

})