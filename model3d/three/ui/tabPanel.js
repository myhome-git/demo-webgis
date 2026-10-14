function tablePanel(options={}){
	this.domButtonPanel =document.getElementById(defaultValue(options.buttonPanel,"right-header-panel"));
	this.domTabPanel =document.getElementById(defaultValue(options.tabPanel,"right-content-box"));
}

tablePanel.prototype.clear = function(){
	if(this.domButtonPanel)
		$(this.domButtonPanel).html("");
	if(this.domTabPanel)
		$(this.domTabPanel).html("");
}

tablePanel.prototype.addButtons =function(array){
	var buttonHtml = '';
	for (var i = 0; i < array.length; i++) {
		var item = array[i];
		if(i==0)
			buttonHtml+=`<button class="beyonmap-attribute-table-button active" id="${item.key}">${item.value}</button>`;
		else
			buttonHtml+=`<button class="beyonmap-attribute-table-button" id="${item.key}">${item.value}</button>`;
	}
	this.domButtonPanel.insertAdjacentHTML("beforeend", buttonHtml);
	$(".beyonmap-attribute-table-button").click(function(e){
		var target = e.target;
		var id = target.id;
		var buttons = $(".right-header-panel").children();
		for (var i = 0; i < buttons.length; i++) {
			var className = buttons[i].className;
			var index =  buttons[i].className.indexOf("active");
			if(index>0){
				buttons[i].className = className.replace(" active","")
				break;
			} 
		}
		target.className = target.className.indexOf("active") > 0 ? target.className : target.className + " active";
		var panels = $(".right-content-box").children();
		for (var i = 0; i < panels.length; i++) {
			var dom = panels[i];
			var idfy = dom.getAttribute('data-idfy')
			if(id!=idfy){
				dom.style.display="none";
			}
			else{
				dom.style.display="";
			}
		}
		
	});
	
}

tablePanel.prototype.addPanel =function(arrayPanel,data){
	var panelHtml = '';
	for (var i = 0; i < arrayPanel.length; i++) {
		var item = arrayPanel[i];
		if(i==0)
			panelHtml += `<div class = "right-content-tab-panel" data-idfy = "${item.key}" style=""></div>`;
		else
			panelHtml += `<div class = "right-content-tab-panel" data-idfy = "${item.key}" style="display:none;"></div>`;
	}
	this.domTabPanel.insertAdjacentHTML("beforeend", panelHtml);
	var dom = $(".right-content-tab-panel").children().prevObject;
	for (var i = 0; i < data.length; i++) {
		var panelElement = dom[i];
		var panelChildren = data[i];
		this.addContent(panelElement,panelChildren);
	}
}

tablePanel.prototype.addContent = function(panel,array) {
	var domText;
	var html;
	for (var i = 0; i < array.length; i++) {
		var item = array[i];
		switch(item.type){
			case "picture":
				html = `<div class = "fieldset-picture">
							<img src = "${item.value}" class="field-picture-img" title="${item.key}"/>
						</div>`;
				panel.insertAdjacentHTML("beforeend", html);
				break;
			case "field":
				if(!domText){
					domText = document.createElement('div')
					domText.className = "fieldset-common-content";
					panel.appendChild(domText);
				}
				html = `<div class = "fieldset-small-text-box">
							<div class="fieldset-title">${item.key}</div>
							<div class="fieldset-text">${item.value}</div>
						</div>`;
				domText.insertAdjacentHTML("beforeend", html);
				break;
		}
	}
};

tablePanel.prototype.init = function(){
	this.clear();
	this.addButtons(button_info);
	this.addPanel(button_info,[data,data2,data3]);
}
