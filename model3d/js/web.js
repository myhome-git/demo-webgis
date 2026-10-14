var isMbyxTable=false;
var isSwmxTable=false;
var isZTTSTTable=false;
$(document).bind("click",function(e){
	$('#js_list').css('display','none');
});
function showPK(){
	if(arrDataGrid.length > 0){
		if($('#pk_box').css('display') == "block"){
			$('#pk_box').css('display','none');return ;
		}
		$('#pk_box').css('display','block');
	}else $('#pk_box').css('display','none');
}
function changeModel(model_id){
	var mM = layerManager.ModelManager;
	mM.add3Dtile('2',parseInt(model_id) );
	//updateCamera();
}
function btn_ShowModel(obj){
	var url=basePath+$(obj).attr("swmx_url");
	var pos=JSON.parse($(obj).attr("swmx_pos"));
	var layerID=$(obj).attr("layer");    
	var tilesetUrl;
    var tUrl=$(obj).attr("swmx_3dtiles");
    var typeM=$(obj).attr("swmx_type");
    if (tUrl!="undefined") {
        tilesetUrl=basePath+tUrl;
    }
    var options={
        viewType:ViewType.MODEL,
        layerId:parseInt(layerID)
    }
    var layer=layerManagerView.addLayer(options);

    var modelOps={
        type:parseInt(typeM),
        id:layer.size(),
        url:url,        
        position:pos,
        tilesetUrl:tilesetUrl,
        name:$(obj).attr("swmx_mc")
    }

    layer.addModel(modelOps);



	// var layer = layerManager.ModelManager.getModelLayer('2');
 //      var id;
 //        if(layer.ModelLength)
 //          id = layer.ModelLength;
 //        else
 //          id = 0;
 //        layerManager.ModelManager.addModel('2',{
 //          id:id,
 //          name:$(obj).attr("swmx_mc"),
 //          url:url,
 //          x:pos.x,
 //          y:pos.y,
 //          z:pos.z,
 //          isPath:true,
 //          tilesetPath:tilesetUrl
 //        });
    viewer.camera.flyTo({
	    destination : BeyonMap.Cartesian3.fromDegrees(pos.lon,pos.lat,pos.alt+500),
	    orientation : {
	        heading : BeyonMap.Math.toRadians(0),
	        pitch : BeyonMap.Math.toRadians(-90),
	        roll : 0.0
	    }
	});
    //显示模型后添加鼠标右键监听
	viewer.screenSpaceEventHandler.setInputAction(function(movement) {
      var pickedObject = viewer.scene.pick(movement.position);
      var mM = layerManager.ModelManager;
      //取消之前点击的高亮，兼容没有高亮的
      mM.selectedEntity = null;
      mM.selected3Dtile = null;
      if(pickedObject){
        //判断点击对象的类型
        if(pickedObject.constructor.name=="BeyonMap3DTileFeature"||pickedObject.constructor.name=="i"){
          mM.selected3Dtile = pickedObject;
        }else if(pickedObject.constructor.name == 'Object' && BeyonMap.defined(pickedObject.id)){
          mM.selectedEntity = pickedObject.id;
          var rightMenu = new RightKeyMenu.Menu();
			rightMenu.setMenu(id,'menuDiv');
			
			rightMenu.addMenuItems({
				menuItemId:'tileset',
				menuItmeImgSrc:'img/tests.png',
				menuItemText:'切换'
			},{
				setOnClick:"changeModel('"+mM.selectedEntity._id+"')"
			});	
			
			return rightMenu.show();
        }
      }
    }, BeyonMap.ScreenSpaceEventType.RIGHT_CLICK);
  //   //显示模型后添加鼠标左键监听
  //   viewer.screenSpaceEventHandler.setInputAction(function(movement) {
  //     var pickedObject = viewer.scene.pick(movement.position);
  //     var mM = layerManager.ModelManager;
  //     //取消之前点击的高亮，兼容没有高亮的
  //     mM.selectedEntity = null;
  //     mM.selected3Dtile = null;
  //     if(pickedObject){
  //       //判断点击对象的类型
  //       if(pickedObject.constructor.name=="BeyonMap3DTileFeature"||pickedObject.constructor.name=="i"){
  //         mM.selected3Dtile = pickedObject;
  //       }else if(pickedObject.constructor.name == 'Object' && BeyonMap.defined(pickedObject.id)){
  //         mM.selectedEntity = pickedObject.id;
  //       }
  //     }
  // }, BeyonMap.ScreenSpaceEventType.LEFT_CLICK);
}


function mbyxTable() {
    $("#mbyx_table").datagrid({
        width: 400, //宽度
        height: 162, //高度
        selectOnCheck: false,
        checkOnSelect: false,
        // url: basePath+"/page/webgis/txsj/queryTXSJ", //请求路径
        url:zhts_mbyx_iamgeList,
        crossDomain:true,
        method:"post",
        showHeader:false,
        loadMsg:"正在加载，请稍候...",
        checkbox:false,
        columns: [[
        { field: "wjmc", title: "文件名称", width: 328 },
        { field: "wjdx", title: "文件大小", width: 70 },
        { field: "chka", title: "下载", width: 30,formatter: function (value,row,index) { 
        		var href = "window.location.href='"+row.ftpUrl+"'";
	        	return "<button class='tiny_botton download' onclick="+href+"></button>";
	        }
        },
        { field: "jlfx", title: "对比", width: 28,formatter: function (value,row,index) { 
	    		// mbyx[index] = row;
	        	return "<button class='tiny_botton add_pk' onclick='addToJL("+index+")'></button>";
	        }
	    }
        ]],
        onClickRow:function(index, row){
        	$('#mbyx_table').datagrid('unselectRow',index);

        },
        onDblClickRow :function(index, row ){
        	
        	//alert(row.cpbs + " : " + row.stbs);
        	var layerid = row.cpbs + "-" + row.stbs;
        	      
        		 $.ajax({
        		        type: "GET",
        		      //  url: "tile/imageextent/" + "2000100157308-2000100157291",
        		        url: IMAGE_CONFIG.MBYX_BASE + "bigmap/tile/imageextent/" + layerid,
        		        dataType: "json",
        		        processData: true,
        		        error: function (req, status, error) {

        		            if (status == "timeout") {

        		                alert("请求超时，请稍后再试!！");
        		                return;
        		            } else if (status === "error") {

        		                alert("数据请求失败，请稍后再试!如果还未解决，请联系管理员！");
        		                return;
        		            }
        		            return;
        		        },
        		        success: function (obj) {
        		           
        		        	if(obj.code){
        		        		console.log(obj.code+" 请求的影像空间参考不符！")
        		        		return;
        		        	}
                            var directoryNode = layerManagerUI.getNodeById(zhts_mbxy_tree_param.node_layerId);
                            if(directoryNode){
                                layerManagerUI.addDirectoryNode(zhts_mbxy_tree_param.node_layerId,zhts_mbxy_tree_param.layerName);
                            }
                            var name = row.wjmc;
                            var layer = layerManagerUI.getNodeById(layerid);
                            var ext = obj.extent;
                            if(!ext){
                                alert("请求目标影像图范围出错！");
                                return;
                            }
                            var rectangle = new BeyonMap.Rectangle(BeyonMap.Math.toRadians(ext[0]),BeyonMap.Math.toRadians(ext[1]),BeyonMap.Math.toRadians(ext[2]),BeyonMap.Math.toRadians(ext[3]));
                            if(!layer){
                                layer = layerManagerUI.addDataNode(name,layerid,zhts_mbxy_tree_param.node_layerId,{});
                                var imageryProvider = new BeyonMap.UrlTemplateImageryProvider({
                                     url: IMAGE_CONFIG.MBYX_BASE + 'bigmap/tile/mbmap/'+layerid+'/{z}/{x}/{y}',
                                     rectangle:rectangle,
                                });
                                var imageryLayer = new BeyonImageryLayer(viewer,imageryProvider,{
                                    show :true,
                                    baseLayer :false,
                                })
                                layer.bindingLayer(imageryLayer);
                            }
                            viewer.scene.camera.setView({
                                destination:rectangle,
                                orientation:{
                                    heading : 0, // east, default value is 0.0 (north)
                                    pitch : BeyonMap.Math.toRadians(-90),    // default value (looking down)
                                    roll : 0.0   
                                }
                            });
                            
        		        	


        		        	// var l=  new ol.layer.Tile({       		                  
        	          //            title: layerid,
        	          //            type: 'overlay',
        	          //            visible: true,
        	          //            extent:ol.proj.transformExtent(ext,"EPSG:4326","EPSG:3857"),
        	          //            source: new ol.source.XYZ({
        	          //                url: IMAGE_CONFIG.MBYX_BASE + 'bigmap/tile/mbmap/'+layerid+'/{z}/{x}/{y}',

        	          //            })
        	          //        });
        		        	// BIGMap.addMBImageLayer(l);
        		        	
        		        	// BIGMap.getMap().getView().setCenter(ol.extent.getCenter(ol.proj.transformExtent(ext,"EPSG:4326","EPSG:3857")));
        		        	// BIGMap.getMap().getView().setZoom(13);
        		        	
        		        }
        		    });
        	
        },
        onLoadError: function () {
            var i = 0;
        },
        //传输参数
        queryParams: { CPMC: "" },
        pagination: true,
        pageSize: 5,
        pageList: [5,10, 15, 20, 30]
    });
    $("#mbyx_table").datagrid('getPager').pagination({
        beforePageText: "第",
        afterPageText: "页",
        displayMsg: "共 {total} 条数据, 当前为{from} - {to} 条数据"
    });
}
function reLoadMBYX(id){
	$('#mbyx_table').datagrid('load',{
		CPMC: $('#'+id).val()
	});
}
//////////////////以下需要封装修改
//var swmx_data=null,drawinfo = null;
//var isShowZznx = false;

//点击三维模型，调取数字冰雹软件websocket
var websocket_callSZBB = null;
function callSZBB(obj) {
	
	//var drawinfo = swmx_data.drawInfo;
	var zbnm = $(obj).attr("zbnm");
     var wsurl ="ws://" + serverIP + ":" + serverPort + "/webgis/websocket/call";
    // wsurl ="ws://10.17.181.206:8080/webgis/websocket";
     
    //判断当前浏览器是否支持WebSocket
    if('websocket_callSZBB' in window){
    	if (websocket_callSZBB == null)
    		websocket_callSZBB = new WebSocket(wsurl);
    }else if ('Mozwebsocket_callSZBB' in window) { 
    	if (websocket_callSZBB == null)
    		websocket_callSZBB = new MozWebSocket(wsurl); 
    }else{
        alert('Not support websocket_callSZBB');
    }  
    
    //发送消息
    if (websocket_callSZBB != null)
    	websocket_callSZBB.send(zbnm);
    else
    	alert('websocket_callSZBB != null');
}
//END


function swmxTable() {
    showMBMXTree("zhts_mbmx_window");
    return;
//	var s = '${entity.ftpUrl}';
    $("#swmx_table").datagrid({
        width: 450, //宽度
        height: 162, //高度
      //  singleSelect: true, //选中一行的设置
        selectOnCheck: false,
        checkOnSelect: false,
        //rownumbers: true, //行号
        url: basePath+"web3d/model.json", //请求路径
        method:"GET",
        loadMsg:"正在加载，请稍候...",
        showHeader:false,
        checkbox:false,
        //列
        columns: [[
        //{ field: "chk", "checkbox": true},
        { field: "swmxmc", title: "文件名称", width: 328 },
        { field: "fzmxwjdx", title: "文件大小", width: 70 },
        { field: "shtu", title: "shtu", width: 28,formatter: function (value,row,index) { 
        		//SWMX.prepare = row.swmxnm;
        	//swmxIDTemp = row.swmxnm;
	        	return "<button class='tiny_botton onmap' swmx_type='"+row.type+"' swmx_3dtiles='"+row.tileset+"' layer='"+row.layer+"' swmx_pos='"+JSON.stringify(row.pos)+"' swmx_mc='"+row.swmxmc+"' swmx_url='"+row.url+"' swmx_id='"+row.swmxnm+"' onclick=btn_ShowModel(this)></button>";
	        }
	    }
        ]],
        onBeforeLoad: function (param) {
        	var i = 0;
        },
        onLoadSuccess: function (data) {
        	if(data){
        		$.each(data.rows, function(index, item){
	        		if(item.checked){
	        			$('#swmx_table').datagrid('checkRow', index);
	        		}
	        	});
        	} 
        },
        onClickRow:function(index,row){
        	//if(index != swmxSelectIndex){
        	$("#swmx_table").datagrid('unselectRow',index);
        	//}
        },
        onDblClickRow:function(index, row){
        	ShowJWD(row.swmxmc);
        	SWMX.prepare = row.swmxnm;
        	//$("#swmx_table").datagrid('selectRow',index);
        	//swmxSelectIndex = index;
        	//swmxIDTemp = row.swmxnm;
        },
        onLoadError: function () {
            var i = 0;
        },
        onCheck : function(	rowIndex,rowData){
        	
        },
        onUncheck : function(rowIndex,rowData){
        	for(var i = 0; i < arrDataGrid.length;i++){
    			if(arrDataGrid[i] == rowData){
    				arrDataGrid.splice(i, 1);
    			}
    		}
        },
        //传输参数
        queryParams: { SWMXMC: "" },
        pagination: true,
        pageSize: 5,
        pageList: [5, 10, 15, 20, 30]
    });
    $("#swmx_table").datagrid('getPager').pagination({
        beforePageText: "第",
        afterPageText: "页",
        displayMsg: "共 {total} 条数据, 当前为{from} - {to} 条数据"
        //displayMsg: "{from} - {to} OF {total}"
    });
}
function reLoadSWMX(id){
//	arrDataGrid.splice(0, 2);
	$('#swmx_table').datagrid('load',{
		SWMXMC: $('#'+id).val()
	});
	txJWD.hide();
}

function showBox(id){
	for(var i = 0; i < $('.bottom_btns .btn_pro').length;i++){
		var obj = $('.bottom_btns .btn_pro')[i];
		if(obj.id == id){
			if($(obj).css('display') == "none"){
				$(obj).css('display','block');
				if(id == "mbyx_content" && !isMbyxTable){
					mbyxTable();
					isMbyxTable = true;
				}
				else if(id == "swmx_content" && !isSwmxTable){
					swmxTable();
					isSwmxTable = true;
				}//isZTTSTTable
				else if(id == "zttst_content" && !isZTTSTTable){
					zttstTable();
					isZTTSTTable = true;
				}//isZTTSTTable
			}
			else{
				$(obj).css('display','none');
			}
		}
		else {
			$(obj).css('display','none');
		}
	}
}


function updateCamera(){
	viewer.clock.onTick.addEventListener(function(clock){
		var camera=viewer.camera;
		var cameraHeight=viewer.scene.globe.ellipsoid.cartesianToCartographic(camera.position).height;
		if (cameraHeight>50000) {
			var mM = layerManager.ModelManager;
			mM.changeShowStyle("2",0,true,false);
		}
	});
}