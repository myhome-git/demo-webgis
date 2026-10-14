function zhts_mbts_manager(layerManagerView) {
	this.modelSettings = BeyonMap.copyOptions(null, zhts_mbts_manager_model_options);
	this.receiveFilterSetting = BeyonMap.copyOptions(null, zhts_mbts_manager_received_filter);
	this.configs = configs;
	// this.layers = new Map(); 
	this.layerManagerView = layerManagerView;
}

zhts_mbts_manager.prototype.setLayerShow = function (layer_id, visible) {
	var layer = this.layerManagerView.getLayer(ViewType.MODEL, layer_id);
	if (!layer)
		return;
	layer.show = visible;
}

zhts_mbts_manager.prototype.getSize = function (onlyVisible) {
	var count = 0;
	var layers = this.layerManagerView._collection.get(ViewType.MODEL);
	layers.forEach(function (item) {
		if (onlyVisible) {
			if (!item.show)
				return;
			else {
				item.forEach(function (it) {
					if (it.show)
						count++;
				});
			}
		} else {
			count += item.size();
		}
	});
	return count;
}

zhts_mbts_manager.prototype.setLayerPartShow = function (layer_id, keyValueArray, visible = false) {
	if (!keyValueArray instanceof Array) {
		return;
	}
	var layer = this.layerManagerView.getLayer(layer_id);
	if (!layer)
		return;
	layer.collection.forEach(function (item) {
		if (item.show == visible)
			return;
		for (var i = 0; i < keyValueArray.length; i++) {
			var keyValue = keyValueArray[i];
			if (item.prop[keyValue[0]] == keyValue[i]) {
				item.visible = visible;
			}
		}
	});

}

zhts_mbts_manager.prototype.removePartView = function (keyValueArray) {
	var layers = this.layerManagerView._collection.get(ViewType.MODEL);
	var me = this;
	if (keyValueArray.length == 1) {
		layers.forEach(function (item) {
			me.removePartLayer(item.id, keyValueArray[0]);
		});
	} else {
		layers.forEach(function (item) {
			me.removePartLayer(item.id, keyValueArray);
		});
	}
}

zhts_mbts_manager.prototype.removePartLayer = function (layer_id, keyValue) {
	if (!keyValue instanceof Array) {
		return;
	}
	if (typeof (layer_id) == "string")
		layer_id = this.layerManagerView.getLayer(ViewType.MODEL, layer_id);

	if (!layer_id)
		return;
	for (let item of layer_id.collection.entries()) {
		if (item[1].prop[keyValue[0]] == keyValue[1]) {
			layer_id.remove(item[0]);
		} else {

		}
	}

}

zhts_mbts_manager.prototype.removePartLayerArray = function (layer_id, keyValueArray) {
	if (!keyValueArray instanceof Array) {
		return;
	}
	if (typeof (layer_id) == "string")
		layer_id = this.layerManagerView.getLayer(ViewType.MODEL, layer_id);

	if (!layer_id)
		return;
	for (let item of layer_id.collection.entries()) {
		for (let j = 0; j < keyValueArray.length; j++) {
			var keyValue = keyValueArray[j];
			if (item[1].prop[keyValue[0]] == keyValue[1]) {
				item[1].remove();
				layer_id.collection.delete(item[0]);
				return;
			}
		}
	}
}

zhts_mbts_manager.prototype._getUpdateSettingItems = function () {
	var curOptions = this.modelSettings;
	var tarOptions = zhts_mbts_manager_options;
	var curArray = Object.getOwnPropertyNames(curOptions);
	var tarArray = Object.getOwnPropertyNames(tarOptions);
	var differArray = [];
	for (let i = 0; i < curArray.length; i++) {
		if (curOptions[curArray[i]] == tarArray[curArray[i]]) {
			continue;
		} else {
			differArray.push(curArray[i]);
		}
	}
	return differArray;
}

zhts_mbts_manager.prototype.updateLayerProperty = function (layer_id, differArray) {
	var layer = this.layerManagerView.getLayer(layer_id);
	if (!layer)
		return;
	if (!differArray) {
		differArray = this._getUpdateSettingItems();
	}
	var tarOptions = zhts_mbts_manager_options;
	layer.collection.forEach(function (item) {
		for (var i = 0; i < differArray.length; i++) {
			var property = differArray[i];
			switch (property) {
				case "zhts_mbts_min_pixel":
					if (item.type == ModelType.MODEL) {
						item.model.gltf.minimumPixelSize = tarOptions[property];
					} else if (item.type == ModelType.ENTITY) {
						item.model.entity.minimumPixelSize = tarOptions[property];
					}
					break;
				case "zhts_mbts_enemy_color":
					if (item.type == ModelType.ENTITY) {
						if (item.prop.dwsx == '敌')
							item.model.entity.label.backgroundColor = tarOptions[property];
					}
					break;
				case "zhts_mbts_our_color":
					if (item.type == ModelType.ENTITY) {
						if (item.prop.dwsx == '我')
							item.model.entity.label.backgroundColor = tarOptions[property];
					}
					break;
				case "zhts_mbts_enemy_path_color":
					if (item.prop.dwsx == '敌')
						item.model.entityPath.path.material = new BeyonMap.ColorMaterialProperty(tarOptions[property]);
					break;
				case "zhts_mbts_our_path_color":
					if (item.prop.dwsx == '我')
						item.model.entityPath.path.material = new BeyonMap.ColorMaterialProperty(tarOptions[property]);
					break;
				case "zhts_mbts_enemy_font_color":

					break;
				case "zhts_mbts_our_font_color":
					break;
				case "zhts_mbts_model_font":
					break;
				case "zhts_mbts_label_background_color":
					break;
				case "zhts_mbts_label_border_color":
					break;
				case "zhts_mbts_label_border_width":
					break;
				case "zhts_mbts_label_padding":
					break;
				case "zhts_mbts_label_scalebydistance":
					break;
				case "zhts_mbts_clear_model_interval":
					break;
				case "zhts_mbts_clear_model_undate_interval":
					break;
			}
		}
	});
}

zhts_mbts_manager.prototype.setLabelShow = function (visible) {
	var layers = this.layerManagerView._collection.get(ViewType.MODEL);
	var me = this;
	layers.forEach(function (item) {
		item.collection.forEach(function (i) {
			// it._collection.forEach(function(i){
			if (i.dragLabel)
				i.dragLabel.setVisible(visible, i.id, true, true, true);
			// });
		});
	});
}

zhts_mbts_manager.prototype.setLabelFont = function (font, type) {
	var layers = this.layerManagerView._collection.get(ViewType.MODEL);
	var me = this;
	layers.forEach(function (item) {

		item.collection.forEach(function (it) {
			//在这改变所有的label的字号以及问题
			if (!it.dragLabel) {
				return;
			}
			// if (it._clickType == 0) {
			// 	return;
			// }
			if (type == 1) //敌方
			{
				it.dragLabel.changedLabel({
					font: font
				});
				// it.model.entity.label.font = font;
			}
			if (type == 0) //敌方
			{
				it.dragLabel.changedLabel({
					font: font
				});
			}

		});
	});
}

zhts_mbts_manager.prototype.setHJWidth = function (width, type) {
	var layers = this.layerManagerView._collection.get(ViewType.MODEL);
	var me = this;
	var dwTyp = type == 1 ? "df" : "wf";
	var curType = configs.ts.path_type[dwTyp];
	layers.forEach(function (item) {
		item.collection.forEach(function (it) {
			if (!it._bHasPath) return;
			if (type == 1 && it.prop.dwsx == "敌") {
				it.entityPath.changeWidth(width, curType);
			}
			if (type == 0 && it.prop.dwsx == "我") {
				it.entityPath.changeWidth(width, curType);
			}
		});
	});
}

zhts_mbts_manager.prototype.setHJColor = function (color, type) {
	var layers = this.layerManagerView._collection.get(ViewType.MODEL);
	var me = this;
	var dwTyp = type == 1 ? "df" : "wf";
	var curType = configs.ts.path_type[dwTyp];
	layers.forEach(function (item) {
		item.collection.forEach(function (it) {
			if (!it._bHasPath) return;
			if (type == 1 && it.prop.dwsx == "敌") {
				it.entityPath.changeColor(color, curType);
			}
			if (type == 0 && it.prop.dwsx == "我") {
				it.entityPath.changeColor(color, curType);
			}

		});
	});
}

zhts_mbts_manager.prototype.setHJTime = function (count, type) {
	var layers = this.layerManagerView._collection.get(ViewType.MODEL);
	var me = this;
	layers.forEach(function (item) {
		item.collection.forEach(function (it) {
			if (!it._bHasPath) return;
			if (type == 1 && it.prop.dwsx == "敌") {
				it.entityPath.threshold = count;
			}
			if (type == 0 && it.prop.dwsx == "我") {
				it.entityPath.threshold = count;
			}
		});
	});
}

zhts_mbts_manager.prototype.setHJType = function (path_type, type) {
	var layers = this.layerManagerView._collection.get(ViewType.MODEL);
	var me = this;
	layers.forEach(function (item) {
		item.collection.forEach(function (it) {
			if (!it._bHasPath) return;
			if (type == 1 && it.prop.dwsx == "敌") {
				it.entityPath.pathType = path_type;
			}
			if (type == 0 && it.prop.dwsx == "我") {
				it.entityPath.pathType = path_type;
			}
		})
	});
}