var ganttChart;
myJson ={
		"name": "ProjectAAA",
		"tasks":[
		{
			"name":"WorkItem1",
			"duration": ["Jan 5, 2012", "Jan 12, 2012"],
			"tasks":[
			{
				"name":"task1",
				"criticalPath": true,
				"progress": "0.8",
				"duration": ["Jan 5,2012","Jan 6,2012"]
			},{
				"name":"task2",
				"dependencies":["task1"],
				"progress": "0.5",
				"duration": ["Jan 7,2012","Jan 8,2012"]
			},{
				"name":"task3",
				"progress": "0.6",
				"duration": ["Jan 10,2012","Jan 12,2012"]
			}			
			]
		},{
			"name":"WorkItem2",
			"duration": ["Jan 10, 2012", "Jan 20, 2012"],
			"tasks":[
			{
				"name":"task4",
				"progress": "0.5",
				"criticalPath": true,
				"duration": ["Jan 10,2012","Jan 15,2012"]
			},{
				"name":"task5",
				"progress": "0.2",
				"duration": ["Jan 12,2012","Jan 18,2012"]
			},{
				"name":"task6",
				"progress": "0",
				"dependencies":["task4"],
				"duration": ["Jan 18,2012","Jan 20,2012"]
			}			
			]}
			,{
			"name":"WorkItem3",
			"duration": ["Jan 25, 2012", "Jan 30, 2012"],
			"tasks":[
			{
				"name":"task7",
				"duration": ["Jan 25,2012","Jan 26,2012"]
			},{
				"name":"task8",
				"duration": ["Jan 26,2012","Jan 28,2012"]
			},{
				"name":"task9",
				"duration": ["Jan 25,2012","Jan 30,2012"]
			}			
			]}
		]
	};

require(["gantt-d3/gantt"], function(gantt){
	ganttChart = new gantt(myJson, {childrenNode:"tasks", id:"name", width: 800});
});

function addTask(){
	var parentId = $("#task-parent")[0].value;
	var node ={
		name: $("#task-name")[0].value,
		description: $("#task-descr")[0].value,
		startDate: $("#task-start")[0].value,
		endDate: $("#task-end")[0].value,
		dependencies: $("#task-predecs")[0].value,
		critical: $("#task-critic")[0].checked,
		progress: $("#task-progress")[0].value,
	};
	ganttChart.addTask(parentId, node);
	$('#addTask').modal('hide');
}

function removeTask(){
	var taskName = $("#task-name-remove")[0].value;
	ganttChart.removeTask(taskName);
	$('#removeTask').modal('hide');
}

function createNew(){
	require(["gantt-d3/gantt"], function(gantt){
		ganttChart = new gantt(null, {childrenNode:"tasks", id:"name", width: 800});
	});
}