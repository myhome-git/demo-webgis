var _pageObject = _pageObject || {};
(function ($,module) {
    $(document).ready(documentReady);
    function documentReady() {
        module.MAIN.init();
    }
})(jQuery,_pageObject);

/**
 * 模块入口
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this = module;
	
	module.init = function(){
		parent.UPLOAD.init();
	}
	
})(jQuery,_pageObject,_pageObject.MAIN={});

/**
 * 地图定位模块
 * @param {Object} $
 * @param {Object} parent
 * @param {Object} module
 */
(function($,parent,module){
	module.parent = parent;
	let _this=module,$doc,_classFileUploadControl;
	
	
	module.getFileUploadControl = function(){
		return _classFileUploadControl;
	}
	
	module.initUpload = function(){
		var _uploadURL = xUtilBase.getUrlParam("uploadURL"),
			_uploadType = xUtilBase.getUrlParam("type"),
			_uploadSize = xUtilBase.getUrlParam("size"),
			_uploadFileMulti = xUtilBase.getUrlParam("fileMulti"),
			_uploadFileChunkSize = xUtilBase.getUrlParam("fileChunkSize");
		if(_uploadFileMulti=="false"){
			_uploadFileMulti = false;
		}else{
			_uploadFileMulti = true;
		}
			
		//不能放入类中进行初始化或调用，否则会出现连续点击2次的BUG
		var $uploadBox = $("#upload-group-1"),
			$buttonUpload = $uploadBox.find("#button-open-1");
		try{
			//x-plupload-template.js
			var upload = new xUpload();
		}catch(e){
			throw new Error("object xUpload undefined");
			return;
		}
		
		upload.settings = {
			url : _uploadURL || "/FileManage/upload",			//服务器端的上传页面地址
			type : _uploadType || "all",		//文件类型,如果为空则不允许上传
			size : _uploadSize || "10mb",				//文件大小
			multi_selection : _uploadFileMulti,	//是否允许多选
			chunk_size : _uploadFileChunkSize,
			swf : WebLoader.Config.PROBJECT_PATH+"/library/file.plupload-2.1.0/js/Moxie.swf",			//swf文件，当需要使用swf方式进行上传时需要配置该参数
			xap : WebLoader.Config.PROBJECT_PATH+"/library/file.plupload-2.1.0/js/Moxie.xap",			//silverlight文件，当需要使用silverlight方式进行上传时需要配置该参数
			btn_openFileId : $buttonUpload.attr("id"),	//触发文件选择对话框的按钮，为那个元素id
			node_box : $uploadBox.find("#upload-container-1").get(0)						//节点容器，用于创建结构
		};
		
		upload.init(upload.settings);
		
		_classFileUploadControl = new ClassFileUpdateControl();
		
		_classFileUploadControl.InitLinkClass("upload",upload);

		/*************************************************************************
		*	事件控制区
		*************************************************************************/
		
		//选择文件
		upload.bindEvent("FilesAdded",_classFileUploadControl.EventFilesAdded);
		
		//单个文件开始上传
		upload.bindEvent("UploadFile",_classFileUploadControl.EventUploadFile);
		
		//单个文件上传前动作
		upload.bindEvent("BeforeUpload",_classFileUploadControl.EventBeforeUpload);
	
		//单文件进度条
		upload.bindEvent("uploadProgress",_classFileUploadControl.EventuploadProgress);
		
		//文件队列变化时
		upload.bindEvent("QueueChanged",_classFileUploadControl.EventQueueChanged);
		
		//单个文件上传完成
		upload.bindEvent("FileUploaded",_classFileUploadControl.EventFileUploaded);
		
		//全部文件上传完成
		upload.bindEvent("UploadComplete",_classFileUploadControl.EventUploadComplete);
		
		//发生错误
		upload.bindEvent("Error",_classFileUploadControl.EventError);
		
		//开始上传
		$("#button-upload-1").on("click",function(){
			var _upload = _classFileUploadControl.GetLinkClassUpload();
			_upload.setFileAllState(_upload.getFiles());
			_classFileUploadControl.GetLinkClassUpload().start();
		});
	}
	
	module.init = function(){
		$doc = $("#blog-add");
		this.initUpload();
	}
	
})(jQuery,_pageObject,_pageObject.UPLOAD={});