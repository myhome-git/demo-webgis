/*
 * 本js 实现的是 综合态势  目标右键菜单  
 * 作战能力 : 显示目标打击探测范围  并形成包略图
 * 
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
    // AMD. Register as anonymous module.
      define(['jquery'], factory);
	} else {
	  // Browser globals.
	  factory(jQuery);
	}
})(function (jQuery) {

	var $ = jQuery,//scrollid = 2019,
    _win = typeof window !== "undefined" ? window : this;

    var pixel;  // 要素坐标
    var feature ; // 要素

    var newFeature ; // 新要素

	var zzfwnl_info = function(){
      //this.path = 
      this.opt = {
        name:"xzy_TargetRightMenu", //软件的名字
        text:"",
        icon:"", //软件对应的图标(暂无用)
        css:"xzy_TargetRightMenu",//此功能需要加载的css文件
        inmediately:true,//转载完成后立即执行本软件的init函数（this.init()）
        dialog:undefined
      };

      //打击探测能力 对话框 面板
      this.mbActionScope = `
        <div class="xzy-action-scope">
          <i class="icon-close"></i>
          <div class="layui-tab layui-tab-brief" lay-filter="action-scope">
            <ul class="layui-tab-title">
              <li class="layui-this">按目标类型</li>
              <li >按范围类型</li>
            </ul>
            <div class="layui-tab-content">
              <div id="action-scope-check-box" class="">
                <div class="title">
                  <font>筛选条件：</font>
                </div>
                <div class="check-box-warp">
                  <input name="showType" type="checkbox" checked value="circle"><span>圆</span>
                  <input name="showType" type="checkbox" checked value="line"><span>线</span>
                  <input name="showType" type="checkbox" checked value="text"><span>字</span>
                  
                </div>
              </div>

              <div  class="layui-tab-item layui-show">
                <div id="scrollbar-warp">
                  <div id="mbTypeContent" class="layui-collapse" style="height:100%" lay-filter="panelTree">
                  
                  </div>
                </div>
              </div>

              <div class="layui-tab-item">
                <div id="fwTypeContent">
                  <ul id="range-type-tree"  class="ztree" style="height:100%"></ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      // 按目标类型 显示打击探测 信息  对话框
      this.layuiPanelTree = `
          <div class="layui-colla-item" > 
            <h2 class="layui-colla-title"></h2>
            <div class="layui-colla-content">
               <ul id="action-scope"  class="ztree"></ul>
            </div>
          </div>
      `;

       // 按范围类型 显示打击探测 信息  对话框
      this.rangeTypePanelTree = `
         <ul id="range-type-tree"  class="ztree"></ul>
      `;

      this.mbPointMap = {};       // 存放目标 坐标信息

      this.rangeTypeMap = {};     // 存放范围 类型信息(全部)
      this.tempTypeMap = {};      // 临时范围 类型信息(新的)
      this.mbFwNmMap = {};      
      this.actionScopeNodeMap = {};  // 所有节点 信息

      //目标点类型  树列表设置
      this.actionScope_setting = {
        check: {
              enable: true,   // 是否显示复选框 或单选框 
              chkStyle: "checkbox",
              chekboxType: {"Y":"ps","N":"ps"}   
        },    
        view: {
          showIcon: false,  // 是否显示 tree 图标
          showLine: false,  // 是否显示 连线
          addDiyDom: addColorMarker  //在作用范围 树节点上 添加对应颜色标记
        },
        callback: {
          onCheck: showRange  // 勾选或取消选中节点 会触发此事件
        }
      };

      //范围类型  树列表设置
      this.rangeTypeScope_setting = {
        check: {
              enable: true,   // 是否显示复选框 或单选框 
              chkStyle: "checkbox",
              chekboxType: {"Y":"ps","N":"ps"}   
        },    
        view: {
          showIcon: false,  // 是否显示 tree 图标
          showLine: false,  // 是否显示 连线
          addDiyDom: addColorMarker  //在作用范围 树节点上 添加对应颜色标记
        },
        callback: {
          onCheck: showRangeType, // 勾选或取消选中节点 会触发此事件
          onNodeCreated: defaultChecked // 节点创建时执行此方法   用于默认选中所有树节点
        }
      };

      // 节点创建 回调函数
      function defaultChecked(event, treeId, treeNode){
        if(treeNode){
           treeNode.checkedOld = true; // 设置所有节点为选中状态
        }
        
      }

      //为实力打击探测效能  添加 颜色标记
      function addColorMarker(treeId,treeNode){
        var aNode = $("#"+treeNode.tId+"_a");
        if(treeNode.isParent) return;
        var info = treeNode.info;
        var color= AttackRange.getFeatureColor(info.zzxnnm); // 根据作战效能内码  获取一种颜色
        if($("#divBtn_"+treeNode.id).length>0) return ; // 在当前节点前 添加自定义 DOM元素 设置颜色标记
        var editStr = "<span id='" +treeNode.id+ "_color' class='mb-color-marker' style='background-color:rgba("+color+")'></span>";
        $("#"+treeNode.tId+"_ico").before(editStr);         
      }


      //目标点类型树  节点选中事件
      function showRange(event,treeId,v){
        // 获取当前ztree 对象
        var treeObj = $.fn.zTree.getZTreeObj(treeId);
        // 获取ztree 中 所有选中状态改变的节点
        var nodes = treeObj.getChangeCheckedNodes();
          for(var i = 0; i< nodes.length;i++){
            nodes[i].checkedOld = nodes[i].checked; // 切换节点选中状态
            if(nodes[i].isParent){  // 父节点 不需要上图
             continue;
            }
            // 取出当前节点的  效能数据
            var node = zzfwnl.actionScopeNodeMap[nodes[i].nm+"_"+nodes[i].info.sszbjc+"_"+nodes[i].info.zdxn];
            // 获取坐标
            var point = node.point;
            // 根据作战效能内码 获取一种颜色
            var color= AttackRange.getFeatureColor(nodes[i].info.zzxnnm);
            /**
              * 上图  包括  圆  线  字
              * 方法 共 6 个参数  按照顺序  
              * 分别为：(坐标,半径,内码,名称,颜色,性能内码,效能类型(打击/探测)    
              */
            AttackRange.showRange(point,nodes[i].info.zdzyjl,  nodes[i].nm,  nodes[i].info.sszbjc+"-"+nodes[i].info.zdxn,  color,  nodes[i].info.zzxnnm,nodes[i].info.zylx+nodes[i].info.xnlx);
          }
      }

      //范围类型树  节点选中事件
      function showRangeType(event,treeId,treeNode){
        // 获取当前ztree 对象
        var treeObj = $.fn.zTree.getZTreeObj(treeId);
        // 切换节点选中状态
        treeNode.checkedOld = treeNode.checked;
        // 遍历所有节点数据
        for(var str in zzfwnl.actionScopeNodeMap){
          // 判断当前map中的 当前node 对象的 效能类型 是否与 当前选中的效能类型相同
          if(str.split("_")[2]==treeNode.name){  // 相同
            // 取出node
            var node = zzfwnl.actionScopeNodeMap[str];  
            // 获取坐标
            var point = zzfwnl.mbPointMap[node.nm];
            // 获取颜色
            var color= AttackRange.getFeatureColor(node.info.zzxnnm);
            /**
              * 上图  包括  圆  线  字
              * 方法 共 6 个参数  按照顺序  
              * 分别为：(坐标,半径,内码,名称,颜色,性能内码,效能类型(打击/探测)    
              */
            AttackRange.showRange(node.point ,node.info.zdzyjl,  node.nm,  node.info.sszbjc+"-"+node.info.zdxn,  color,  node.info.zzxnnm,node.info.zylx+node.info.xnlx);
          }
        }
        
      }
  }
  
  zzfwnl_info.prototype = {
      init:function(){
          this.target = $(this.mbActionScope).appendTo($(document.body));
          var height = $(window).height()*0.6;
          var _self = this;

          // 实力打击探测 面板 复选框  按钮点击事件（圆、线、字）
          $("input[name=showType]").on("click",function(e){
             var check = e.target.checked;
             var value = e.target.value;
             if(value=="text"){// 文字
              AttackRange.showName(check);
             }
             if(value=="line"){//线
              AttackRange.showRadius(check);  
             }
             if(value=="circle"){//圆
              AttackRangeConfig.showCircle(check);  
             }
          });

          // 实力打击探测 面板 树列表滚动条
          var el = $("#scrollbar-warp");
          el.css({
            height: height+"px"
          });
          el.mCustomScrollbar({
            theme: 'minimal-dark',
            scrollInertia: 100,
            axis: 'yx',
            mouseWheel: {
              enable: true,
              axis: 'y',
              preventDefault: true
            }
          });

          // 监听 实力打击探测树 关闭按钮 
          $(".xzy-action-scope .icon-close").on("click",function(){
              AttackRange.clearAllRange();    // 清除所有包略图 层
              zzfwnl.cleanrTreeNodes();       // 清除tree 节点 并关闭树
          })

          // 使用 layer 面板
          layui.use(["element","layer"],function(){
            var $ = layui.jquery;
            var element = layui.element;
            var layer = layui.layer;

            // 监听实力打击探测树  对话框  完成 切换
            element.on("tab(action-scope)",function(data){
              // 切换对话框实 取消所有节点选中 并清除所有包略图 
              zzfwnl.setTreeNodeAllChecked(false);
              
            })

            element.on("tab(panelTree)",function(data){
              // console.log(this);
              // console.log(data.index);
              // console.log(data.elem);
            })
          })
         
      },
      clearAll:function(){
        fxtsst.removeAllLayer();  // 清除全部feature 移除所有layer
        AttackRange.clearAllRange();  // 清除包略图
        this.cleanrTreeNodes();   // 清除树节点 关闭树面板
        this.clearMap();          // 清除所有 实力打击探测数据
      },
      /**
       * 方法功能： 面板关闭 
       *  清除实力打击探测 面板ztree 数据 并关闭面板
       */
      cleanrTreeNodes: function(){
        $("#mbTypeContent").html(""); // 左侧目标类型树
        $("#range-type-tree").html("");// 右侧范围类型树
        $(".xzy-action-scope").hide(200);// 树面板
      },
      /**
       * 方法功能： ztree 数据清空
       *  清除所有已经加载的实力打击探测数据
       */
      clearMap: function(){
        this.mbPointMap = {};     // 目标点坐标   信息
        this.rangeTypeMap = {};   // 全部范围类型  信息
        this.tempTypeMap = {};    // 临时范围类型  信息
        this.mbFwNmMap = {};      // 目标范围内码  信息
        this.actionScopeNodeMap = {};  // 所有节点 信息
      },
      /**
       * 方法功能： 设置 ztree 节点 选中状态
       */ 
      setTreeNodeAllChecked: function(flag){
        var doms = $(".xzy-action-scope .ztree");
        for(var i = 0; i < doms.length; i++){
          var id = doms[i].id;
          var obj = $.fn.zTree.getZTreeObj(doms[i].id);
          obj.refresh();
	        obj.checkAllNodes(flag);
        }
        if(!flag){
          // 如果全部 取消勾选状态 则清除包略图
          AttackRange.clearAllRange();
        }
      },
      // 获取 元素节点
      getJsllbsDom:function(){
        return $(".military-force");
      },
      // 获取 目标点要素
      getJsllbsFeature:function(){
        return newFeature;
      },
      // 获取 目标点要素
      getJsllbsOldFeature:function(){
        return feature;
      },
      // 设置新目标
      setJsllbsFeature:function(){
        return feature = newFeature;
      },
      // 获取 目标点信息
      getJsllbsInfo:function(){
        if(newFeature){
          return newFeature.getProperties().info;
        }
        return null;
      },
      // 获取 目标点类型
      getJsllbsType:function(){
        if(newFeature){
          return newFeature.getProperties().type;
        }
        return null;
      },
       // 获取 目标点nm
      getJsllbsNm:function(){
        if(newFeature){
          return newFeature.getProperties().nm;
        }
        return null;
      },
      
      /**
       *  actionScope 方法
       *  参数：
       *  1、nm   ：  目标内码
       *  2、name ：  目标名称
       *  3、point：  目标坐标
       *  4、type ：  目标类型 (ssmb\bdmb\ptmb)
       */
      actionScope:function(nm,name,point,type){ 
        
          // 记录目标坐标点
          zzfwnl.mbPointMap[nm] = point;

          // 记录目标内码
          zzfwnl.mbFwNmMap[nm] = nm;

          // 根据 目标点类型  内码  查询打击探测信息， 并回调指定 的 addClick 函数 
          AttackRange.getZzxnArr(type,nm,addClick);

          // 此函数 用于 处理查询后 返回的数据  并加载到 ztree 树面板中
          function addClick(data) {
            //console.log(data);  //此处可以查看返回的数据结构

            // 存放所有目标点  效能信息
            var  nodes = [];
            zzfwnl.tempTypeMap = {}; // 存放 新的范围类型 数据
            $.each(data, function(i, v) {
              
              // node 与 children 显示  按目标类型  对话框中的  ztree数据
              var node = {};
              // 根节点为装备信息  
              node.isParent = true;     // 为父节点
              node.name = v[0].sszbjc;  // 设施装备简称
              node.id = "a_"+i;         // ztree 节点id
              node.info = v;            // 当前 实力信息
              node.nm = v[0].mbnm;      // 目标内码
              node.point = point;       // 目标坐标
             
              // 子节点为 装备 打击探测能力信息
              node.children = [];       
              for(var j = 0; j < v.length; j++){
                var children = {};
                children.isParent = false;  // 为子节点
                children.name = v[j].zdxn+"("+v[j].zdzyjl+"米)";  //装备效能 及作用距离  如： 对海最大探测能力（800000米）
                children.id = "b_"+j;     // ztree 节点id
                children.info = v[j];     // 当前 效能信息
                children.nm = v[j].mbnm;  // 目标内码
                children.point = point;   // 目标坐标
                node.children.push(children); // 设置为根  的子节点

                // nodeTree 为显示  按范围类型 对话框中的  ztree数据
		            var nodeTree= {}; 
                nodeTree.isParent = false;
                nodeTree.name = v[j].zdxn;  // 装备效能
                nodeTree.id = "b_"+j;       // ztree 节点id
                nodeTree.info = v[j];       // 当前效能信息
                nodeTree.point = point;     // 目标坐标

                // rangeTypeMap  存储所有 范围类型数据
                // 不同目标的 同一种装备效能  在 范围类型对话框中  只显示一次
                // 当选中 对海最大探测能力时  具备相同装备效能的 目标点 都会被上图
                /**
                 * 例如： 
                 *  按目标类型                                      按范围类型
                 * 
                 *    东引军港                                       对海最大探测能力
                 *        AN/FPS-110B雷达                            对陆最大射程
                 *          对海最大探测能力（1600000米）
                 *          对陆最大射程（888888米）
                 * 
                 *    岩国海军基地
                 *        US-2旧难机
                 *          对海最大探测能力（700000米）
                 */
                if(!zzfwnl.rangeTypeMap[v[j].zdxn]){  // 如果rangTypeMap 中 不存在的当前 效能类型  该效能类型 就需要添加到 ztree 树中
                    zzfwnl.tempTypeMap[v[j].zdxn] = nodeTree; // 用于存储新的 效能类型  并添加到树节点中
                }
                zzfwnl.rangeTypeMap[v[j].zdxn] = nodeTree; // 不存在的效能类型  会添加  存在的会替换
                zzfwnl.actionScopeNodeMap[nm+"_"+v[0].sszbjc+"_"+v[j].zdxn] = nodeTree;
                
                // 判断当前目标 是否已经上图  如果存在 默认选中当前节点及所有子节点
                // if(AttackRange.getfeatures()[nm]){
                //   if(AttackRange.getfeatures()[nm][v[j].sszbjc+v[j].zdxn]){
                //     node.checked = true;    // 选中根节点
                //     children.checked = true;// 选中子节点
                //   }
                // }

              }
              nodes.push(node); 
            });

          if(!(nodes||nodes==null||nodes.length==0)){
            alert("没有相关数据");
            return;
          }else{
            if(!$("#action-scope-"+nm).html()){ // 判断当前目标是否已经加载过  如果没有 动态添加 
              /**
               *  ① 加载左侧对话框 数据   按目标类型 窗口
               */
              // 获取对话框面板DOM对象 
              var panelTree = $(zzfwnl.layuiPanelTree); 
              // 查找ztree 元素  并根据 内码 设置唯一 di 属性值
              panelTree.find("#action-scope").attr("id","action-scope-"+nm);  
              // 设置当前标题内容
              panelTree.find("h2").html(name);   
              // 将当前的 ztree DOM对象 添加到面板中              
              panelTree.appendTo($("#mbTypeContent"));
              // 将nodes 中的数据加载到 ztree 树中
              var obj = $.fn.zTree.init($("#action-scope-"+nm),zzfwnl.actionScope_setting, nodes);
              // 刷新 layui 面板项
              layui.element.render("collapse","panelTree");

              /**
               * ② 加载右侧对话框 数据 按范围类型窗口
               */
              var  treeNodes = [];
              // 取出 此次需要加载到  右侧对话框中的数据
              for(var key in zzfwnl.tempTypeMap){
                treeNodes.push(zzfwnl.tempTypeMap[key]);
              }
              // 如果右侧对话框中的 ztree 已经存在节点数据  
              if($("#range-type-tree").html()){
                $.fn.zTree.getZTreeObj("range-type-tree").addNodes(null,treeNodes); // 添加新节点
              }else{
                $.fn.zTree.init($("#range-type-tree"),zzfwnl.rangeTypeScope_setting, treeNodes);  // 重新加载树
              } 
            }
            $(".xzy-action-scope").show(200); // 显示 对话框面板
          }  
        }
      },

  }
  window.zzfwnl = new zzfwnl_info();
  
  return zzfwnl;
});
