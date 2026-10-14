function zhtsGroupManager(layerManagerView,groupZTree) {
    this._layerManagerView=layerManagerView;
    this._zTree=groupZTree;
    this._groupList=new Map();
    this.name='态势编队'
    //var root=this._zTree.addNodes(null,{id:0,name:this.name,open:true});
    this._idMapTId=new Map();
    //this._idMapTId.set(0,root.tId);

    this.selectList=new Map();
//创建一个右键菜单Div
    this.RMenuDiv=document.createElement("div");
    this.RMenuDiv.id="tabRMenu";
    this.RMenuDiv.style.position= 'absolute';
    this.RMenuDiv.style.display= 'none';
    this.RMenuDiv.style.zIndex= 9999999;
    this.RMenuDiv.innerHTML='<ul>\
                                <li id="RMenu_addGroup" >加入分组</li>\
                            </ul>';
    //document.getElementByC("body").append(this.RMenuDiv);
    $("body").append(this.RMenuDiv);
    //$("#tab-modelInfo").after(this.RMenuDiv);
    $("#RMenu_addGroup").on('click',this.intoGroup);
    layerManagerView.addMouseListener(BeyonMap.ScreenSpaceEventType.LEFT_CLICK,this.scenePick_cb,this);
}

zhtsGroupManager.prototype.intoGroup = function(e){
    var curTreeNode=groupManager._zTree.getSelectedNodes()[0];
    if(!curTreeNode||!curTreeNode.isGroup){
        alert("没有选中编队节点！\n请先选择需要加入的编队节点");
    }else{
        var clickDom=e.currentTarget;
        var id=$(clickDom).attr("value"); 
        var tr=document.getElementById(id);        
        var data={
            id:id,
            pId:curTreeNode.id,
            name:tr.children[1].innerText,
            isModel:true,
            primitive:groupManager.selectList.get(id)
        }
        groupManager.addData(data);
        tr.parentNode.removeChild(tr);
        groupManager.selectList.delete(id);
    }    
}


zhtsGroupManager.prototype.init = function(dataUrl){
    var scope=this;
    $.ajax({
        type: "GET",
        url: dataUrl,
        //data: {username:$("#username").val(), content:$("#content").val()},
        dataType: "json",
        success: function(data){
                    $.each(data, function(index, comment){
                        scope.addData(comment)
                    });
                 },
        error:function(e){
            //没有数据，添加root节点
            var rootNode={id:0,name:"态势编队",open:true};
            scope.addData(rootNode);
        }
    });
    // //绑定节点click事件到管理器
    // this._zTree.setting.callback.onClick=this.onClick;

}

//树节点点击事件
zhtsGroupManager.prototype.onClick = function(treeNode){
    //var zGroup=this._groupList.get(treeNode.id);
    //alert(zGroup);
    const id=treeNode.id;
    const pId= treeNode.pId;
    if(treeNode.isGroup){
        var group=this._groupList.get(id);
        group.onClick();

    }else if(treeNode.isModel){
        var group=this._groupList.get(pId);
        group.onClick(id);
    }

}
//场景点击事件回调
zhtsGroupManager.prototype.scenePick_cb = function(pickObj){
    if(!pickObj)return;
    //过滤一下  只保存模型
    const model=pickObj.primitive;
    if(!(model instanceof BeyonMap.Model))return;

    const entity=pickObj.id;
    const name=entity._name;
    const viewType=entity.viewType;
    const id=entity.objId?entity.objId:entity.id;
    const layerId=entity.layerId;    
    var trID=id+'_'+layerId+'_'+viewType;
    //已经存在下面树中
    if(this._idMapTId.has(trID)){
        var tId=this._idMapTId.get(trID);
        var node=this._zTree.getNodeByTId(tId);
        this._zTree.selectNode(node);
    }else if(!this.selectList.has(trID)){        
        var selTable=$("#tab-modelInfo");
        var trHTML ='<tr id="'+trID+'">\
                        <td>'+id+'</td>\
                        <td>'+name+'</td>\
                        <td>'+layerId+'</td>\
                    </tr>'
        selTable.append(trHTML);//在table最后面添加一行
        // var modelInfo={
        //     viewType:viewtype,
        //     layerId:layerid,
        //     objectId:id,
        //     primitive:pickObj.primitive
        // };
        $("#"+trID).bingRightMenu(this.RMenuDiv);
        this.selectList.set(trID,model)
    }   

}


zhtsGroupManager.prototype.addData = function(data){
    var node={
        id:data.id,
        name:data.name
    }
    var pNode=this._zTree.getNodeByTId(this._idMapTId.get(data.pId));
    var newNode=this._zTree.addNodes(pNode,node)[0];
    this._idMapTId.set(node.id,newNode.tId);


    //根节点
    if(newNode.id==0){
        var addStr = "<span class='button chk checkbox_false_part_focus' id='treeEdit_button"
            + "' title='edit group' onfocus='this.blur();' onclick='editSwitch();'></span>";
        $("#groupTree_1_switch").before(addStr);
    }
    //组节点
    else if(pNode&&!data.isModel&&!this._groupList.has(data.pId)){
        var zGroup=new zhtsGroup(viewer.camera,newNode);
        newNode.isGroup=true;
        this._groupList.set(newNode.id,zGroup);
    }
    //模型节点
    else if(pNode&&data.isModel&&this._groupList.has(data.pId)){
        var zGroup=this._groupList.get(data.pId);
        newNode.isModel=true;
        newNode.primitive=data.primitive;
        zGroup.addObject(node.id,data.primitive);
    }

}











function zhtsGroup(camera,treeNode) {
    this.modelList=new Map;
    this.name=undefined;
    //视角矩形范围
    this._rectangle=undefined;//new BeyonMap.Rectangle(west, south, east, north)
    this._camera=camera;
    this._show=true;
    this.treeNode=treeNode;
    //卸载
    this.remove=function(){
        this.treeNode=undefined;
        this.modelList.clear();
    }
}

zhtsGroup.prototype.addObject = function(id,primitive){
    if(this.modelList.has(id))return;
    this.modelList.set(id,primitive);
}

zhtsGroup.prototype.removeObject = function(){

}

zhtsGroup.prototype.show = function(bShow){

}

zhtsGroup.prototype.calculateRect = function(){
    
}

zhtsGroup.prototype.onClick = function(id){
    //点击定位
    this.locate(id);
}

zhtsGroup.prototype.locate = function(id){
    //单个节点定位    
    if(id){
        var model=this.modelList.get(id);
        var boundingSphere=model._boundingSphere.clone();
        //boundingSphere转换成世界坐标
        BeyonMap.Matrix4.multiplyByPoint(model.modelMatrix, boundingSphere.center, boundingSphere.center);
        this._camera.flyToBoundingSphere(boundingSphere);

    }else{
        this._camera.flyTo({
            destination :this._rectangle
        });
    }
    
}
//保存全局变量
var zTree_ts_Group;
var groupManager;

//添加树
var setting = {
    view: {
        addHoverDom: addHoverDom,
        removeHoverDom: removeHoverDom,
        selectedMulti: false
    },
    check: {
        enable: true
    },
    edit: {
        enable: true,
        editNameSelectAll: true,
        showRemoveBtn: showRemoveBtn,
        showRenameBtn: showRenameBtn
    },
    data: {
        simpleData: {
            enable: true
        }
    },
    callback: {
        beforeDrag: beforeDrag,
        beforeEditName: beforeEditName,
        beforeRemove: beforeRemove,
        beforeRename: beforeRename,
        onRemove: onRemove,
        onRename: onRename,

        onClick:onClick,
    }
};


function onClick(e, treeId, treeNode){
    groupManager.onClick(treeNode);
}

var log, className = "dark";
function beforeDrag(treeId, treeNodes) {
    return false;
}
function beforeEditName(treeId, treeNode) {
    className = (className === "dark" ? "":"dark");
    showLog("[ "+getTime()+" beforeEditName ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name);
    
    zTree_ts_Group.selectNode(treeNode);
    setTimeout(function() {
        if (confirm("进入节点 -- " + treeNode.name + " 的编辑状态吗？")) {
            setTimeout(function() {
                zTree_ts_Group.editName(treeNode);
            }, 0);
        }
    }, 0);
    return false;
}
function beforeRemove(treeId, treeNode) {
    className = (className === "dark" ? "":"dark");
    showLog("[ "+getTime()+" beforeRemove ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name);
    
    zTree_ts_Group.selectNode(treeNode);
    return confirm("确认删除 节点 -- " + treeNode.name + " 吗？");
}
function onRemove(e, treeId, treeNode) {
    showLog("[ "+getTime()+" onRemove ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name);
}
function beforeRename(treeId, treeNode, newName, isCancel) {
    className = (className === "dark" ? "":"dark");
    showLog((isCancel ? "<span style='color:red'>":"") + "[ "+getTime()+" beforeRename ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name + (isCancel ? "</span>":""));
    if (newName.length == 0) {
        setTimeout(function() {
            
            zTree_ts_Group.cancelEditName();
            alert("节点名称不能为空.");
        }, 0);
        return false;
    }
    return true;
}
function onRename(e, treeId, treeNode, isCancel) {
    showLog((isCancel ? "<span style='color:red'>":"") + "[ "+getTime()+" onRename ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name + (isCancel ? "</span>":""));
}
//显示remove按钮
function showRemoveBtn(treeId, treeNode) {
    return  zTree_ts_Group.canEditTree&&treeNode.parentTId;
}
//显示重命名按钮
function showRenameBtn(treeId, treeNode) {
    return zTree_ts_Group.canEditTree&&treeNode.isParent&&treeNode.level==1;
}
function showLog(str) {
    if (!log) log = $("#log");
    log.append("<li class='"+className+"'>"+str+"</li>");
    if(log.children("li").length > 8) {
        log.get(0).removeChild(log.children("li")[0]);
    }
}
function getTime() {
    var now= new Date(),
    h=now.getHours(),
    m=now.getMinutes(),
    s=now.getSeconds(),
    ms=now.getMilliseconds();
    return (h+":"+m+":"+s+ " " +ms);
}
var newCount = 1;

function addHoverDom(treeId, treeNode) {
    
    //是否进入了编辑状态
    if(!zTree_ts_Group.canEditTree)return;									
    var sObj = $("#" + treeNode.tId + "_span");
    if (treeNode.editNameFlag || $("#addBtn_"+treeNode.tId).length>0) return;
    var addStr = "<span class='button add' id='addBtn_" + treeNode.tId
        + "' title='add node' onfocus='this.blur();'></span>";
    sObj.after(addStr);
    var btn = $("#addBtn_"+treeNode.tId);
    if (btn) btn.bind("click", function(){												
        zTree_ts_Group.addNodes(treeNode, {id:(100 + newCount), pId:treeNode.id, name:"new node" + (newCount++)});
        return false;
    });
};
//移出添加按钮
function removeHoverDom(treeId, treeNode) {
    $("#addBtn_"+treeNode.tId).unbind().remove();
};
function selectAll() {
    
    zTree_ts_Group.setting.edit.editNameSelectAll =  $("#selectAll").attr("checked");
}
function editSwitch(){
    //
    if(zTree_ts_Group.canEditTree){
        var selNodes=zTree_ts_Group.getSelectedNodes();
        if(selNodes.length>0){
            removeHoverDom('groupTree',selNodes[0]);
            $("#"+selNodes[0].tId+"_edit").unbind().remove();
            $("#"+selNodes[0].tId+"_remove").unbind().remove();
        }
    }
    zTree_ts_Group.canEditTree=!zTree_ts_Group.canEditTree;
    if(zTree_ts_Group.canEditTree)
        $("#treeEdit_button").attr('class',"button chk checkbox_true_part_focus");
    else
        $("#treeEdit_button").attr('class',"button chk checkbox_false_part_focus");
    
}
$(document).ready(function(){
    $.fn.zTree.init($("#groupTree"), setting);
    zTree_ts_Group = $.fn.zTree.getZTreeObj("groupTree");
    $("#selectAll").bind("click", selectAll);
    var addStr = "<span class='button chk checkbox_false_part_focus' id='treeEdit_button"
        + "' title='edit group' onfocus='this.blur();' onclick='editSwitch();'></span>";
    $("#groupTree_1_a").after(addStr);

    groupManager=new zhtsGroupManager(layerManagerView,zTree_ts_Group);
   //groupConfigUrl=(project_data_url||"")+"/zhtsGroupConfig.json";
    //groupManager.init(groupConfigUrl);
   

});							
										
										



//业务部分
//态势编队
function getModelInfo(pickObj){
    console.info(pickObj);
}
// var btn_selModel=$("#btn-sel-model");
// var btn_inGroup=$("#btn-in-group");
// var btn_outGroup=$("#btn-out-group");
// var tab_model=$("#tab-modelInfo");
// btn_selModel.on("click", function () {
//     var bSelect = this.getAttribute("value"); 
//     if(bSelect==='selected'){
//         var  modelContainer=document.getElementById("beyonmapContainer"); 
//         modelContainer.style.cursor='';
//         layerManagerView.removeMouseListener(BeyonMap.ScreenSpaceEventType.LEFT_CLICK,getModelInfo,this);
//         this.setAttribute('value','');
//     }else if(bSelect===''){
//         var  modelContainer=document.getElementById("beyonmapContainer"); 
//         modelContainer.style.cursor='pointer';
//         layerManagerView.addMouseListener(BeyonMap.ScreenSpaceEventType.LEFT_CLICK,getModelInfo,this);
//         this.setAttribute('value','selected');
//     }			
// });

// //添加进分组
// btn_inGroup.on("click", function () {

			
// });

// //移出分组
// btn_outGroup.on("click", function () {
			
// });


(function($){
	"use strict";
	$.fn.extend({
		//注册右键菜单
		bingRightMenu : function(divDom){
			
			var _this = this; 
			
			//获取菜单对象
			var _menu = $(divDom);
			
			_menu.hover(function() {}, function() {
				_menu.hide();
			});
			
			_this.bind("contextmenu", function (event) {
                event = event || window.event;                
                //option.eventMenuUp ? option.eventMenuUp() : function(){};
                _menu.find("li").attr("value",event.currentTarget.id);
				_menu.show().css({
					"top" :  (event.clientY-1) + 'px',
					"left" : (event.clientX-1) + 'px'
				});
		        return false;
		    });
		    
		    _menu.on("click",function(event){
		    	event = event || window.event;
		    	return false;
		    });
		    
		    //是否屏蔽右键的默认浏览器菜单，默认屏蔽
		    _menu.bind("contextmenu", function (event) {
		    	return false;
		    });
		    
		    return _this;
		},
		//卸载右侧菜单
		unbindRightMenu : function(){
			this.unbind("contextmenu").unbind("click");
			return this;
		}
	});
})(jQuery);