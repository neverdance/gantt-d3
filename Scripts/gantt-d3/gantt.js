define(["gantt-d3/gantt.chart", "gantt-d3/gantt.chartManager"], function(gantt_chart, chart_manager){
	return function(json, settings){
	if(!json){
		var today = new Date();
		var nextToday = new Date();
		nextToday.setFullYear(today.getFullYear() + 1);
		json = {
		"name": (settings && settings.project) ? settings.project : "Project",
		"duration": [today.toString(), nextToday.toString()]
		};
	}
	var chart = new gantt_chart(json, settings);
	this.addTask = function(parentId, data){
		var node = {
			name: data.name,
			description: data.description,
			criticalPath: data.criticalPath,
			progress: data.progress,
			dependencies: data.dependencies.split(","),
			criticalPath: data.critical,
			___d:[Date.parse(data.startDate), Date.parse(data.endDate)]
		};
		if(parentId){
			chart.layout.tree(chart.data.data).forEach(function(d){
				if(d.id == parentId){
					if(d.children){
						d.children[d.children.length] = node;
					}else{
						d.children = [];
						d.children[0] = node;
					}
				}
			});
		}else{
			if(chart.data.data.children){
				chart.data.data.children[chart.data.data.children.length] = node;
			}else{
				chart.data.data.children = [];
				chart.data.data.children[0] = node;
			}
		}
		chart.___update();
	},
	this.removeTask = function(taskId, nodes){
		if(!nodes){
			nodes = chart.data.data;
		}
		if(!nodes.children){
			return;
		}
		for(var i in nodes.children){
			if(nodes.children[i].id == taskId){
				nodes.children.splice(i, 1);
				chart.___update();
			}
			this.removeTask(taskId, nodes.children[i]);
		}
	},
	this.editTask = function(taskId, data, nodes){
		if(!nodes){
			nodes = chart.data.data;
		}
		if(!nodes.children){
			return;
		}
		for(var i in nodes.children){
			if(nodes.children[i].id == taskId){
				nodes.children[i] = data;
				data.id = taskId;
				chart.___update();
			}
			this.editTask(taskId, data, nodes.children[i]);
		}
	}
}
});