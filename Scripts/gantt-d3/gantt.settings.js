define(function(){
	return function(settings){
			settings = settings || {};
			this.treeWidth = settings.treeWidth || 300;
			this.treeHeight = settings.treeHeight || 200;
			this.treeHeight = settings.treeHeight || 200;
			this.width = settings.width || 1000;
			this.windowWidth = window.width;
			this.nodeCount = 0;
			this.barHeight = settings.barHeight || 20;
			this.barWidth = settings.barWidth || 100;
			this.barTextHeight = settings.barTextHeight || 15;
			this.childrenNode = settings.childrenNode || "Children";
			this.id = settings.id || "id";
			this.dependNode = settings.dependNode || "dependencies";
			this.minNodeWidth = 60;
			this.container = "div#svg-container";
			switch(settings.axis){
				case 'month':
					this.axis = d3.time.months;
					break;
				case 'week':
					this.axis = d3.time.weeks;
					break;
				case 'day':
					this.axis = d3.time.days;
					break;
				default:
					this.axis = d3.time.weeks;
			}
			if(settings && settings.getDepend){
				this.getDepend = settings.getDepend;
			}
		} 
});