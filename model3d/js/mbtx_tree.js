function mbtxTreeManager(id) {
   

    this.checkedList = new Set();
    var o = this;
  
    
    var setting = {
        id: id,
       
        check: {
            enable: true
        },
        data: {
            simpleData: {
                enable: true
            }
        },
        callback: {
            onCheck: function (event, treeId, treeNode) {
                var checked = treeNode.checked;
                //判断当前监听的队列
                if (treeNode.level == "0") {
                    
                    treeNode.children.foreach(function(mbtxItem){
                        disPlayToMap(mbtxItem,checked);
                       })
                 
                }else if(treeNode.level=="1"){
                    disPlayToMap(treeNode.children,checked);
                    
                }else{
                    disPlayToMap(treeNode,checked);
                }
            },
            
        }
    };
    this.tree = new newTree(setting);
    this.checkedPNodes = function () {
        return this.tree.getSelectedNode();
    }

    this.initTree = function () {
        var me = this;
        $.ajax({
            url : url_mbtx,
            type: "post",
            dataType: "json",
            async:false,
            success:function(data){
                console.log(data);
                me.tree.addNodes(null, [data], false);
            },
            error:function(error){
                console.log(error);
           
            }
        });
    
    }
    //上图显示目标并绘制能力范围
    this.disPlayToMap=function(item,isVisible){
        if(item&&item.children){
            item.children.foreach(function(mb){

            })
        }else if(item){

        }
    }
    this.removeTreeChildren = function (node) {
        if (node.children) {
            this.tree.zTree().removeChildNodes(node);
        }
    }

    this.initTree();

}