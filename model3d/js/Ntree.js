// JavaScript Document
var NTree = function (o) {
	var shadow = $("<div>").appendTo($($("#" + o.id).parent())),
		top_shadow = $("<div>").appendTo($(document.body)),
		returnTop = $("<div>").appendTo($($("#" + o.id).parent()));
	shadow.css({
		"position": "absolute",
		"left": "0",
		"right": "0",
		"top": "0",
		"bottom": "0",
		"background-color": "rgba(0,0,0,0.5)",
		"display": "none"
	});
	top_shadow.css({
		"position": "absolute",
		"left": "0",
		"right": "0",
		"top": "0",
		"bottom": "0",
		"background-color": "rgba(255,255,255,0.5)",
		//"background-image": "url(/webgis/resources/webgis/js/zhts/wait.gif)",
		"background-position": "center center",
		"background-repeat": "no-repeat",
		"display": "none",
		"z-index": 9999
	});
	returnTop.css({
		"position": "absolute",
		"top": "0",
		"right": "0",
		"width": "24px",
		"height": "24px",
		//"background": "url(/webgis/resources/webgis/img/totop.png)",
		"display": "none"
	});
	var setting = {
		view: {
			addHoverDom: addHoverDom,
			removeHoverDom: removeHoverDom,

			selectedMulti: o.selMulti ? o.selMulti : false
		},
		check: {
			enable: o.check,
			nocheckInherit: false,
			chkDisabledInherit: false

		},
		data: {
			simpleData: {
				enable: true
			}
		},
		callback: {
			onCheck: OnCheck, //insertMarker,
			onClick: OnClick,
			onDblClick: OnDblClick,
			onExpand: onExpand,
			beforeExpand: beforeExpand,
			beforeCheck: BeforeCheck,
			onRightClick: onRClick,
			beforeDrag: beforeDrag,
			beforeDrop: beforeDrop,
			onRemove: onRemove,
			onDrag: onDrag,
			onDrop: onDrop
		}
	};
	if (setting.view.removeHoverDom) {
		setting.callback.beforeRemove = beforeRemove;
	}

	function showRemoveBtn(treeId, treeNode) {
		return !treeNode.data.arg.bsc;
	}
	if (o.drag) {
		if (!setting.edit) {
			setting.edit = {};
		}
		if (!setting.edit.drag) {
			setting.edit.drag = {};
		}
		setting.edit.enable = true;
		setting.edit.showRemoveBtn = o.removeBtn ? showRemoveBtn : false;
		setting.edit.showRenameBtn = false;
		setting.edit.drag.isCopy = true
		setting.edit.drag.isMove = true
		setting.edit.drag.prev = true;
		setting.edit.drag.inner = true;
		setting.edit.drag.next = true;
		//setting.edit.drag.isMove = true;
	}
	var url = "",
		check = {
			func: [],
			addFunction: function (f) {
				if (typeof (f) != "function") {
					console.log("check.addFunction函数的参数必须为‘function’");
					return false;
				}
				check.func.push(f);
			},
			removeFunction: function (f) {
				if (typeof (f) != "function") {
					console.log("check.addFunction函数的参数必须为‘function’");
					return false;
				}
				for (var i = 0; i < func.length; i++) {
					if (f == func[i]) {
						func.splice(i, 1);
					}
				}
			}
		};
	var click = {
		func: [],
		addFunction: function (f) {
			if (typeof (f) != "function") {
				console.log("click.addFunction函数的参数必须为‘function’");
				return false;
			}
			click.func.push(f);
		},
		removeFunction: function (f) {
			if (typeof (f) != "function") {
				console.log("click.addFunction函数的参数必须为‘function’");
				return false;
			}
			for (var i = 0; i < click.func.length; i++) {
				if (f == click.func[i]) {
					click.func.splice(i, 1);
				}
			}
		}
	}
	var dblclick = {
		func: [],
		addFunction: function (f) {
			if (typeof (f) != "function") {
				console.log("dblclick.addFunction函数的参数必须为‘function’");
				return false;
			}
			dblclick.func.push(f);
		},
		removeFunction: function (f) {
			if (typeof (f) != "function") {
				console.log("dblclick.addFunction函数的参数必须为‘function’");
				return false;
			}
			for (var i = 0; i < dblclick.func.length; i++) {
				if (f == dblclick.func[i]) {
					dblclick.func.splice(i, 1);
				}
			}
		}
	}
	var rclick = {
		func: [],
		addFunction: function (f) {
			if (typeof (f) != "function") {
				console.log("rclick.addFunction函数的参数必须为‘function’");
				return false;
			}
			rclick.func.push(f);
		},
		removeFunction: function (f) {
			if (typeof (f) != "function") {
				console.log("rclick.addFunction函数的参数必须为‘function’");
				return false;
			}
			for (var i = 0; i < rclick.func.length; i++) {
				if (f == rclick.func[i]) {
					rclick.func.splice(i, 1);
				}
			}
		}
	}
	var hover = {
		func: [],
		addFunction: function (f) {
			if (typeof (f) != "function") {
				console.log("hover.addFunction函数的参数必须为‘function’");
				return false;
			}
			hover.func.push(f);
		},
		removeFunction: function (f) {
			if (typeof (f) != "function") {
				console.log("hover.addFunction函数的参数必须为‘function’");
				return false;
			}
			for (var i = 0; i < hover.func.length; i++) {
				if (f == hover.func[i]) {
					hover.func.splice(i, 1);
				}
			}
		}
	}
	//this.onClick = null;
	this.init = function () {
		return $.fn.zTree.init($("#" + o.id), setting /*, zNodes*/ );
	};
	var zTree = this.init();
	this.zTree = function () {
		return zTree;
	};
	this.showWinShadow = function (show) {
		var display = show ? "block" : "none";
		top_shadow.css("display", display);
	}
	this.click = function (f) {
		click.addFunction(f);
		return click;
	};

	this.dblclick = function (f) {
		dblclick.addFunction(f);
		return dblclick;
	};
	this.check = function (f) {
		check.addFunction(f);
		return check;
	};
	this.rclick = function (f) {
		rclick.addFunction(f);
		return rclick;
	};
	this.hover = function (f) {
		hover.addFunction(f);
		return hover;
	};
	this.add = function (ce) {
		return tadd(ce);
	};
	this.removeAll = function () {
		var nodes = zTree.getNodes();
		var delNodes = [];
		for (var i = 0; i < nodes.length; i++) {
			delNodes.push(nodes[i]);
		}
		for (var i = 0; i < delNodes.length; i++) {
			//			if(delNodes[i].isParent){
			//				zTree.removeChildNodes(delNodes[i]);
			//			}
			zTree.removeNode(delNodes[i], false);
		}
	};
	this.selectNode = function (node) {
		zTree.selectNode(node);
	};
	this.getSelected = function () {
		return zTree.getSelectedNodes();
	};
	this.checkallnodes = function (checked) {
		zTree.checkAllNodes(checked);
	};
	this.getNodeByTid = function (id) {
		return zTree.getNodeByTId(id);
	}

	function beforeDrag(treeId, treeNodes) {
		for (var i = 0; i < treeNodes.length; i++) {
			if (treeNodes[i].data.arg.jdbz == 0) {
				return false;
			}
		}
		return true;
	}

	function beforeDrop(treeId, treeNodes, targetNode, moveType) {
		return targetNode.data.arg.jdbz == 0;
	}

	function onDrag(event, treeId, treeNodes) {
		var i = 0;
	}

	function onDrop(event, treeId, treeNodes, targetNode, moveType) {
		dropNodeToTag({
			e: event,
			tid: treeId,
			nodes: treeNodes,
			tNode: targetNode,
			mType: moveType
		});
	}

	function tadd(ce) {
		//var isParent = ce.isParent,
		data = ce.data,
			treeNode = zTree.addNodes(ce.node, data /*{data:data, isParent:isParent, nocheck:false, name:data.text}*/ , true);
		if (treeNode) {
			return treeNode[0];
		}
	}

	function reAddTree(node) {
		if (node.data.children) {
			var tree = node.data.children;
			if (tree) {
				if (tree.length == 0) {
					return false;
				}
			}
			var len = tree.length,
				isParent = false;
			for (var i = 0; i < len; i++) {
				if (tree[i].children) {
					isParent = true;
				} else isParent = false;
				var data = {
					data: tree[i],
					isParent: isParent,
					nocheck: tree[i].bdx,
					name: tree[i].text,
				};
				if (tree[i].tid) {
					data.tId = tree[i].tid;
				}
				if (tree[i].tp) {
					data.icon = "/webgis/resources/country/24/" + tree[i].tp;
					data.iconSkin = o.icClass;
				}
				var znode = tadd({
					data: data,
					node: node
				});
				if (o.check && node.checked) {
					if (!znode.children) {
						reAddTree(znode);
					}
				}
			}
			return true;
		} else {
			return false;
		}
	}

	function BeforeCheck(treeId, node) {

		//		if(!node.children && node.isParent){
		//			if(!reAddTree(node)){
		//				if(!node.unReload){
		//					node.data.arg.personal = o.data.personal;
		//					getTreeNodes({
		//						url:o.data.tree_url,
		//						data:node.data.arg,
		//						pNode:node,
		//						havaChect:true
		//					});
		//				}
		//			}
		//		}
	}

	function beforeRemove(id, node) {
		if (!confirm("您确认删除此节点吗?", "提示")) {
			return false;
		}
		return true;
	}

	function onRemove(e, treeId, treeNode) {

		//		$.ajax({
		//			type:"POST",
		//			dataType:"json",
		//			url:"page/dxqb/xxcq/zdmbscwjj",
		//			data:treeNode.data.arg,
		//			success:function(data){
		//				zTree.initTree();
		//				unselSCNodeInitAdd();
		//			},
		//			error:function(data){}
		//		});
	}

	function OnCheck(event, treeId, node) {
		var nodes = zTree.getChangeCheckedNodes();
		//		var func = check.func;
		//		if(node.children){
		//			nodes = zTree.getChangeCheckedNodes();
		for (var i = 0; i < nodes.length; i++) {
			nodes[i].checkedOld = nodes[i].checked;
		}
		//		}
		//		else {
		//			node.checkedOld = node.checked;
		//		}
		//		for(var i = 0;i < func.length;i++){
		//			func[i]({evt:event,id:treeId,node:treeNode,nodes:nodes});
		//		}
		console.log("chk"); //return ;

		node.data.arg.eve = "check";
		var func = check.func;
		for (var i = 0; i < func.length; i++) {
			func[i]({
				evt: event,
				id: treeId,
				node: node,
				data: o.data,
				changeChk: nodes
			});
		}
	};

	function beforeExpand(treeId, node) {
		if (!node.children && node.isParent) {
			if (!reAddTree(node)) {
				if (!node.unReload) {
					node.data.arg.personal = o.data.personal;
					getTreeNodes({
						url: o.data.tree_url,
						data: node.data.arg,
						pNode: node,
						havaChect: true,
						isSilent: true,
					});
				}
			}
		}
		// console.log(123)
	};

	function onExpand(event, treeId, treeNode) {
		console.log(1234)
	};

	function addHoverDom(treeId, treeNode) {
		var fun = hover.func;
		for (var i = 0; i < fun.length; i++) {
			fun[i]({
				id: treeId,
				node: treeNode,
				zTree: zTree
			});
		}
	};

	function removeHoverDom(treeId, treeNode) {
		if (!o.diyBtn) return false;
		$("#addBtn_" + treeNode.tId).unbind().remove();
		$("#scBtn_" + treeNode.tId).unbind().remove();
		$("#gxBtn_" + treeNode.tId).unbind().remove();
		if (treeNode.playing) {

		} else {
			$("#bfBtn_" + treeNode.tId).unbind().remove();
		}
		//		$("#addBtn_"+treeNode.tId).css("display","none");
		//		$("#scBtn_"+treeNode.tId).css("display","none");
	};

	function OnClick(event, treeId, treeNode, clickFlag) {
		treeNode.data.arg.eve = "click";
		var func = click.func;
		for (var i = 0; i < func.length; i++) {
			func[i]({
				evt: event,
				id: treeId,
				node: treeNode,
				flag: clickFlag,
				data: o.data
			});
		}
		// zTree.expandNode(treeNode, true, false, true, true);
		zTree.checkNode(treeNode, !treeNode.checked, true, true);
	};

	function onRClick(event, treeId, treeNode) {
		var func = rclick.func;
		for (var i = 0; i < func.length; i++) {
			func[i]({
				evt: event,
				id: treeId,
				node: treeNode,
				ztree: zTree,
				data: o.data
			});
		}
	};

	function OnDblClick(event, treeId, node) {
		var func = dblclick.func;
		for (var i = 0; i < func.length; i++) {
			func[i]({
				evt: event,
				id: treeId,
				node: node,
				data: o.data
			});
		}
	};

	function getTreeNodes(option) {
		$.ajax({
			type: "POST",
			url: option.url, //"page/dxqb/xxcq/callDXQB",
			data: option.data ? option.data : {
				personal: o.data.personal,
				gj: option.gj
			},
			success: function (data) {
				//console.log(123);
				var tree = data.jsonTree;
				if (!tree) return false;
				var len = tree.length;
				//isParent = false;
				for (var i = 0; i < len; i++) {
					var isParent = tree[i].parent ? tree[i].parent : false;
					var data = {
						data: tree[i],
						isParent: isParent,
						name: tree[i].text,
						nocheck: tree[i].arg.bdx
						//icon:tree[i].tp?basePath+"/resources/country/24/"+tree[i].tp:"undefined",

					};
					if (tree[i].tp) {
						data.icon = "/webgis/resources/country/24/" + tree[i].tp;
						data.iconSkin = o.icClass;
					}
					if (tree[i].tid) {
						data.tId = tree[i].tid;
					}
					//					if(tree[i].arg.bdx){
					//						data.nocheck = true
					//					}else{
					//						
					//					}
					var znode = tadd({
						data: data,
						node: option.pNode,
						isSilent: option.isSilent,
					});
					if (option.havaChect && !tree[i].arg.bdx && option.pNode.checked) {
						zTree.checkNode(znode, true, true, true);
					}
					isInit = true;
				}
			},
			async: true,
			dataType: 'json',
			beforeSend: function () {
				//alert(url);
			},
			error: function (data) {
				// alert(data.responseText);
			}

		});
	}
	this.getOData = function () {
		return o.data;
	}
	this.setOData = function (od) {
		o.data = od;
	}
	//获取数据
	var isInit = false;
	this.initTree = function (b, dataPost) {
		if (typeof b === "object") {
			dataPost = b;
			b = false;
		}
		dataPost = dataPost || {};
		if (b || !isInit) {
			this.removeAll();
			dataPost.url = o.data.tree_url;
			getTreeNodes(dataPost);
		}
	}

	var obj = document.getElementById(o.id).parentNode;
	var scrollFunc = function (e) {
		var direct = 0;
		e = e || window.event;
		if (e.wheelDelta) { //IE//Chrome
			direct = e.wheelDelta / 4;
		} else if (e.detail) { //Firefox
			direct = -e.detail * 10;
		}
		var barTop = obj.scrollTop - direct;
		obj.scrollTop = barTop;
		//		if(barTop >= 100){
		//			returnTop.css('display' , "block");
		//		}else{
		//			returnTop.css('display' , "none");
		//		}
		if (document.all) {
			window.event.returnValue = false;
		} else {
			e.preventDefault();
		}
	}
	/*注册事件  for火狐*/

	if (obj.addEventListener) {
		obj.addEventListener('DOMMouseScroll', scrollFunc, false);
	} //W3C
}