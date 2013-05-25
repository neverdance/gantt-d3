define(["gantt-d3/gantt.chartManager"], function(chart_manager){
	return {
		mousemove: function(){
			if(!chart_manager.isTargetSelected()){
				return;
			} 
			if( chart_manager.selectedObject.type == "dependLine" && chart_manager.selectedObject.data.lines){
				chart_manager.selectedObject.data = chart_manager.selectedObject.data.lines[0];
			}
			var me = chart_manager.selectedObject.instance;
			if(chart_manager.selectedObject.type == "dependLine"){
				var selectedLine = chart_manager.selectedObject.data;
				var mouse = d3.mouse(me.layout.nodeContainer.node());
				var node = me.data.dependNodes.filter(function(d){
				if(d.id == selectedLine.dependId){
					return true;
				}else{
					return false;
				}});
				if(node&&node[0]){
					if(node[0].lines.length == 1){
						node[0].lines[0].nodes.forEach(function(d){
							d.x = mouse[0];
						});
					}else if(node[0].lines.length == 2){
						switch( selectedLine.lineId ){
						case 0:
							node[0].lines[0].nodes.forEach(function(d){
								d.y = mouse[1];
							});
							node[0].lines[1].nodes[0].y = mouse[1];
							break;
						case 1:
							node[0].lines[1].nodes.forEach(function(d){
								d.x = mouse[0];
							});
							node[0].lines[0].nodes[1].x = mouse[0];
							break;
						}
					}
				}
				me.___drawDep();
			}else if(chart_manager.selectedObject.type == "draggedRightBar"){
				var draggedRightBar = chart_manager.selectedObject.data;
				var mouse = d3.mouse(me.layout.nodeContainer.node());
				var toDate = me.layout.x.invert(mouse[0] - 300);
				var toDateNumber = Date.parse(toDate);
				if( toDateNumber > me.data.data.___d[1] )
				{
					toDateNumber = me.data.data.___d[1];
				}else if(toDateNumber <= draggedRightBar.___d[0] ){
					return;
				}
				draggedRightBar.___d[1] = toDateNumber;
				me.___update();
				var notification = me.layout.nodeContainer.select("g.notification")
				.attr("transform", "translate(" + mouse[0] + ", " + mouse[1]  + ")");
				notification.select("text").text(toDate);
			}else if(chart_manager.selectedObject.type == "draggedLeftBar"){
				var draggedLeftBar = chart_manager.selectedObject.data;
				var mouse = d3.mouse(me.layout.nodeContainer.node());
				var fromDate = me.layout.x.invert(mouse[0] - 300)
				var fromDateNumber = Date.parse(fromDate);
				if( fromDateNumber < me.data.data.___d[0] ){
					fromDateNumber = me.data.data.___d[0];
				}else if( fromDateNumber >= draggedLeftBar.___d[1] ){
					return;
				}
				draggedLeftBar.___d[0] = fromDateNumber;
				me.___update();
				var notification = me.layout.nodeContainer.select("g.notification")
				.attr("transform", "translate(" + mouse[0] + ", " + mouse[1]  + ")");
				notification.select("text").text(fromDate);
			}
		}
	}
});