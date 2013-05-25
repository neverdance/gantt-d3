define({
	selectedObject: null,
	selectTarget: function(type, data, instance){
		this.selectedObject = {};
		this.selectedObject.type = type;
		this.selectedObject.data = data;
		this.selectedObject.instance = instance;
	},
	releaseTarget: function(){
		this.selectedObject = null;
	},
	isTargetSelected: function(){
		if(!this.selectedObject || this.selectedObject.length == 0){
			return false;
		}
		else{
			return true;
		}
	}
});