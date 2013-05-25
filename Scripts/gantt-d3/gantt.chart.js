define(["gantt-d3/gantt.settings", "gantt-d3/gantt.chartManager", "gantt-d3/gantt.actions", "gantt-d3/gantt.util"], 
function(gantt_settings, gantt_chartManager, gantt_actions, gantt_util){
return function(json, settings){
	this.___initializeTreeData = function(jsonData, childrenNode){
		if(jsonData && childrenNode){
			if(jsonData[childrenNode]){
				jsonData.children = [];
				jsonData.___d = [];
				for(var i in jsonData[childrenNode]){
					this.___initializeTreeData(jsonData[childrenNode][i], childrenNode);
					var depth =jsonData[childrenNode][i].___depth + 1;
					jsonData.___depth = jsonData.___depth >= depth ? jsonData.___depth:depth;
					if(!jsonData.___d[0] || jsonData.___d[0] > jsonData[childrenNode][i].___d[0] ){
						jsonData.___d[0] = jsonData[childrenNode][i].___d[0];
					}
					if(!jsonData.___d[1] || jsonData.___d[1] < jsonData[childrenNode][i].___d[1]){
						jsonData.___d[1] = jsonData[childrenNode][i].___d[1];
					}
					if(jsonData[childrenNode][i].___depend){
						jsonData.___depend = jsonData.___depend ? 
						jsonData.___depend.concat(jsonData[childrenNode][i].___depend):jsonData[childrenNode][i].___depend;
					}
					jsonData.children[i] = jsonData[childrenNode][i];
				}
			}
			else{
				if(jsonData.duration && Date.parse(jsonData.duration[0]) < Date.parse(jsonData.duration[1])){
					var startDate = Date.parse(jsonData.duration[0]);
					var endDate = Date.parse(jsonData.duration[1]);
					jsonData.___d = [startDate, endDate];
				}
				jsonData.___depth = 1;
				jsonData.___depend = [];
				var depends;
				if(this.settings.dependNode){
					depends = jsonData[this.settings.dependNode];
				}
				for(var i in depends){
					jsonData.___depend[i] = {"source": depends[i], "target": jsonData[this.settings.id]};
				}
			}
		}
	};
	this.___update = function(myNodes){
		this.___updateDurationAndDepth(this.data.data);
		this.data.nodes = this.layout.tree.nodes(this.data.data);
		myNodes = myNodes || this.data.nodes;

		
		//gantt axis
		this.layout.x = d3.time.scale().domain([this.data.data.___d[0], this.data.data.___d[1]])
		.range([0, this.settings.width]);
		this.layout.xAxis = d3.svg.axis().scale(this.layout.x).tickFormat(
			gantt_util.customTimeFormat
		);
		this.layout.mainContainer.select("g.axis").remove();
		var axisContainer = this.layout.mainContainer.append("g")
		.attr("transform", "translate(310,"+ (this.settings.barHeight * this.data.nodes.length + 50) +")")
		.attr("class", "x axis").call(this.layout.xAxis);
		this.___updateAxis(this.data.nodes);
			
		//draw base line
		var lineBase = this.layout.nodeContainer.selectAll("line.base").data(this.data.nodes, function(d){
			return d.name;
		});
		var lineBaseEnter = lineBase.enter().append("line").attr("class", "base").attr("x1", function(d){ return 300; })
		.attr("y1", function(d){ return d.y; }).attr("x2", + this.settings.width + 300).attr("y2", function(d){ return d.y; });
		var lineBaseUpdate = lineBase.transition().duration(1000).attr("y1", function(d){
		return d.y; }).attr("y2", function(d){ return d.y; });
		var lineBaseExit = lineBase.exit().remove();
		
		//draw node
		var node = this.layout.nodeContainer.selectAll(".node")
		.data(this.data.nodes, function(d){ return d.id || (d.id = d.name); });
		
		/**************************************************************************
		*****************************Node Enter************************************
		****************************************************************************/
		var that = this;
		var nodeEnter = node.enter().append("g").attr("class", "node")
							.on("click", function(d){ 
								that.___toggle(d); 
								that.___update(d);
							});
		var nodeContainer = nodeEnter.append("g").attr("transform", function(d, i){ 
			   return "translate(" + myNodes.___x + "," + myNodes.___y + ")";
		});
		var treeCircle = nodeContainer.append("circle");
		treeCircle.transition().duration(1000).attr("r", 4).attr("x", 5);
		treeCircle.append("title").text(function(d){
			return d.description;
		});
		nodeContainer.append("text").style("fill-opacity", 1e-6).transition().duration(1000).text(function(d) { return d.name; })
					 .attr("x", 0).attr("y",0).attr("dy", 4).attr("dx", 5).attr("font-size", 15).style("fill-opacity", 1);

		var durContainer = nodeEnter.append("g").attr("class", "duration");
		var durNode = durContainer.append("rect");
		durNode.attr("height", that.settings.barHeight).attr("width", function(d){
				return d.___duration;
			}).attr("y", function(d, idx){
				return myNodes.___y - that.settings.barHeight/2;
			}).attr("class", function(d){
				 if(d.criticalPath){
					return "duration critical opacity50 strock";
				 }else if(d.children){
					 return "duration parent opacity50 strock";
				 }else{
					 return "duration children opacity50 strock";
				 }
			 }).transition().duration(1000).attr("y", function(d){
				return d.y - that.settings.barHeight/2;
			 });
		durNode.append("title").text(function(d){ 
			if(d.duration){
				return "From:"+ new Date(d.___d[0]) + "\nTo:" + new Date(d.___d[1]);
			}
		});
		
		durContainer.append("line").attr("class", function(d){ 
			if(!d.children){ 
				return "draggable-bar-left"; 
			}else{ 
				return "no-strock"; 
			}}).on("mousedown", function(d){
				gantt_chartManager.selectTarget("draggedLeftBar", d, that);
				gantt_util.stopEvent();
				that.layout.nodeContainer.select("g.notification").attr("class", "notification");
			}).attr("y1", function(d, idx){
				return myNodes.___y - that.settings.barHeight/2;
			}).attr("y2", function(d, idx){
				return myNodes.___y + that.settings.barHeight/2;
			});
		
		durContainer.append("line").attr("class", function(d){ 
			if(!d.children){ 
				return "draggable-bar-right"; 
			}else{ 
				return "no-strock"; 
			}}).attr("y1", function(d){ return myNodes.___y - that.settings.barHeight/2; })
			.attr("y2", function(d){ return myNodes.___y + that.settings.barHeight/2; })
			.on("mousedown", function(d){
				gantt_chartManager.selectTarget("draggedRightBar", d, that);
				gantt_util.stopEvent();
				that.layout.nodeContainer.select("g.notification").attr("class", "notification");
			});
		
		var progress = nodeEnter.append("rect")
		progress.attr("height", that.settings.barHeight/2).attr("width", function(d){
			if(d.progress){
				return d.___duration * d.progress - 4;
			}else{
				return 0;
			}}).attr("x", function(d){
				return d.___start + 2;
			}).attr("y", function(d, idx){
				return myNodes.___y - that.settings.barHeight/4;
			}).attr("class", function(d){
				 if(d.criticalPath){
					return "progress critical"
				 }else if(d.children){
					 return "progress parent";
				 }else{
					 return "progress children";
				 }
			 }).transition().duration(1000).attr("y", function(d){
				return d.y - that.settings.barHeight/4;
		});
		progress.append("title").text(function(d){ 
			if(d.progress){
				return d.progress;
			}
		});;
			 
		/*************************************************************************
		*****************Node Update**********************************************
		**************************************************************************/
		//update node container
		node.select("g").transition().duration(1000).attr("transform", function(d){ 
			return "translate(" +d.x + "," + d.y + ")";
		});
		//update duration container
		node.select("g.duration").select("rect").transition().duration(1000).attr("y", function(d){ 
			   return d.y - that.settings.barHeight/2;
		});
		node.select("g.duration").select("rect").select("title").text(function(d){ 
			if(d.duration){
				return "From:"+ new Date(d.___d[0]) + "\nTo:" + new Date(d.___d[1]);
			}
		});
		node.select("line.draggable-bar-right").attr("class", function(d){ 
			if(!d.children){ 
				return "draggable-bar-right"; 
			}else{ 
				return "no-strock"; 
			}}).transition().duration(1000).attr("y1", function(d){ 
			   return d.y - that.settings.barHeight/2;
		}).attr("y2", function(d){ 
			   return d.y + that.settings.barHeight/2;
		});
		node.select("line.draggable-bar-left").attr("class", function(d){ 
			if(!d.children){ 
				return "draggable-bar-left"; 
			}else{ 
				return "no-strock"; 
			}}).transition().duration(1000).attr("y1", function(d){ 
			   return d.y - that.settings.barHeight/2;
		}).attr("y2", function(d){ 
			   return d.y + that.settings.barHeight/2;
		});;
		
		//update for drag&drop
		node.select("g.duration").select("rect").attr("width", function(d){ 
			return d.___duration; 
		}).attr("x", function(d){
				return d.___start;
		});
		node.select("line.draggable-bar-right").attr("x1", function(d){ 
			return d.___start + d.___duration; 
		}).attr("x2", function(d){ 
			return d.___start + d.___duration; 
		});
		node.select("line.draggable-bar-left").attr("x1", function(d){ 
			return d.___start; 
		}).attr("x2", function(d){ 
			return d.___start; 
		});
		
		//update for progress
		node.select("rect.progress").transition().duration(1000).attr("y", function(d){ 
			   return d.y - that.settings.barHeight/4;
		}).attr("width", function(d){
			if(d.progress){
				return d.___duration * d.progress - 4;
			}else{
				return 0;
			}
		}).attr("x", function(d){
				return d.___start + 2;
		});
		
		
		/*******************************************************************************
		***************************Node Exit********************************************
		*******************************************************************************/
		node.exit().select("g").transition().duration(1000).attr("transform", function(d){
			return "translate(" + myNodes.___x + "," + myNodes.___y + ")";
			}).remove();
		node.exit().select("g.duration").select("rect").transition().duration(1000).attr("y", function(d, idx){ 
			   return myNodes.___y;
		}).remove();
		node.exit().select("line.draggable-bar-right").transition().duration(1000).attr("y1", function(d, idx){ 
			   return myNodes.___y;
		}).attr("y2", function(d, idx){ 
			   return myNodes.___y;
		}).remove();
		node.exit().select("line.draggable-bar-left").transition().duration(1000).attr("y1", function(d, idx){ 
			   return myNodes.___y;
		}).attr("y2", function(d, idx){ 
			   return myNodes.___y;
		}).remove();
		node.exit().select("rect.progress").transition().duration(1000).attr("y", function(d, idx){ 
			   return myNodes.___y;
		}).remove();
		node.exit().transition().duration(1000).remove();
		
		//link
		var links = this.layout.tree.links(this.data.nodes);
		var diagonal = d3.svg.diagonal()
						 .projection(function(d) { 
							 return [d.x, d.y];
						 });
		var link = this.layout.nodeContainer.selectAll(".link").data(links, function(d){
				return d.target.id;
			});
		
		//link enter
		var linkEnter = link.enter().append("path").attr("class","link").attr("d", function(d){
			var o = {x: myNodes.___x, y: myNodes.___y};
			return diagonal({source: o, target: o});
		}).transition().duration(1000).attr("d", diagonal);
		//link update
		var linkUpdate = link.transition().duration(1000).attr("d",diagonal);
		//link exit
		var linkExit = link.exit().transition().duration(1000).attr("d", function(d){
			var o = {x: myNodes.___x, y: myNodes.___y};
			return diagonal({source: o, target: o});
		}).remove();
		
		setTimeout(function(d){
			// draw dependenices
			that.___updateDependencies(that.data.nodes[0]);
			that.data.depends = that.data.data.___depend;
			that.data.dependNodes = that.___drawDepNodes(that.data.depends);
			that.___drawDep();
			that.data.nodes.forEach(function(d) {
				d.___x = d.x;
				d.___y = d.y;
			});
		}, 1000);
	},
	this.___updateAxis = function(){
		var depth = this.data.data.___depth;
		var that = this;
		this.data.nodes.forEach(function(d, idx){
			if(depth > 0){
				d.x = that.settings.treeWidth/that.data.data.___depth * d.depth;
			}else{
				d.x = 0;
			}
			d.y = idx * that.settings.barHeight;
			if(d.___d){
				d.___duration = (d.___d[1] - d.___d[0])/(that.data.data.___d[1] - that.data.data.___d[0])*that.settings.width;
				d.___start = that.layout.x(d.___d[0]) + that.settings.treeWidth;
			}
		});
	},
	this.___updateAxis = function(){
		var depth = this.data.data.___depth;
		var that = this;
		this.data.nodes.forEach(function(d, idx){
			if(depth > 0){
				d.x = that.settings.treeWidth/that.data.data.___depth * d.depth;
			}else{
				d.x = 0;
			}
			d.y = idx * that.settings.barHeight;
			if(d.___d){
				d.___duration = (d.___d[1] - d.___d[0])/(that.data.data.___d[1] - that.data.data.___d[0])*that.settings.width;
				d.___start = that.layout.x(d.___d[0]) + that.settings.treeWidth;
			}
		});
	},
	this.___updateDurationAndDepth = function(data){
		if(data && data.children){
			data.___d = [];
			data.___depth = 0; //Clear old depth
			for(var i in data.children){
				this.___updateDurationAndDepth(data.children[i]);
				if(!data.___d[0] || data.___d[0] > data.children[i].___d[0]){
					data.___d[0] = data.children[i].___d[0];
				}
				if(! data.___d[1] || data.___d[1] < data.children[i].___d[1]){
					data.___d[1] = data.children[i].___d[1];
				}
				data.___depth = data.children[i].___depth + 1 > data.___depth 
				? data.children[i].___depth + 1 : data.___depth;
			}
		}
		else if(data){
			data.___depth = 1;
		}
	},
	this.___toggle = function(node){
		if(node.children)
		{
			node.___cld = node.children;
			node.children = null;
		}
		else{
			node.children = node.___cld;
			node.___cld = null;
		}
	},
	this.___updateDependencies = function(node){
			var depends;
			var	___depend = [];
			if( node && node.children ){
				node.___depend = [];
				if(this.settings.dependNode){
					depends = node[this.settings.dependNode];
				}
				for(var i in depends){
					node.___depend[i] = {"source": depends[i], "target": node[this.settings.id]};
				}
				for(var i in node.children){
					this.___updateDependencies(node.children[i]);
					if(node.children[i].___depend && node.children[i].___depend.length > 0){
						node.___depend = node.___depend.concat(node.children[i].___depend);
					}
				}
			}else if( node ){
				node.___depend = [];
				if(this.settings.dependNode){
					depends = node[this.settings.dependNode];
				}
				for(var i in depends){
					node.___depend[i] = {"source": depends[i], "target": node[this.settings.id]};
				}
			}
	},
	this.___drawDepNodes = function(dependencies){
		var updatedDependencies = [];
		var that = this;
		dependencies.forEach(function(dep, i){
			var nodeId = dep.source + dep.target;
			var node = that.data.nodes.filter(function(e){ 
				if(e[that.settings.id] == dep.source){
					return true;
				}
				else{
					return false;
				}});
			if(node && node[0]){
				dep.x1 = node[0].___start + node[0].___duration;
				dep.y1 = node[0].y;
			}
			var node =  that.data.nodes.filter(function(e){ if(e[that.settings.id] == dep.target){return true;}else{return false;}});
			if(node && node[0]){
				//Minor offset adjust just to make depend lines looks better
				dep.x2 = node[0].___start + 4;
				dep.y2 = node[0].y - that.settings.barHeight/2;
			}
			var depNodes = [] ,depNodes1 = [],depNodes2 = [];
			var depLines = [];
			if(dep.x1 == dep.x2){
				depNodes[0]= { x: dep.x1, y: dep.y1, id:nodeId+"-0" };
				depNodes[1]= { x: dep.x2, y: dep.y2, id:nodeId+"-1" };
				depLines[0] = { nodes: depNodes, "class" : "cursor-e-resize", dependId:nodeId, lineId: 0 };
			}
			else{
				depNodes1[0]= { x: dep.x1, y: dep.y1, id:nodeId+"-0" };
				depNodes1[1]= { x: dep.x2, y: dep.y1, id:nodeId+"-1" };
				depLines[0]= { nodes: depNodes1, "class" : "cursor-n-resize", dependId: nodeId, lineId: 0 };
				
				depNodes2[0]= { x: dep.x2, y: dep.y1, id:nodeId+"-1" };
				depNodes2[1]= { x: dep.x2, y: dep.y2, id:nodeId+"-2" };
				depLines[1]= { nodes: depNodes2, "class" : "cursor-e-resize", dependId: nodeId, lineId: 1 };
			}
			updatedDependencies[i] = { "id": nodeId, "lines": depLines };
		});
		return updatedDependencies;
	},
	this.___drawDep = function(){
		var depends = this.data.dependNodes;
		var that = this;
		var line = d3.svg.line().x(function(d) { 
			return d.x; 
		})
		.y(function(d) { 
			return d.y; 
		}).interpolate("linear");
		var depend = this.layout.nodeContainer.selectAll("g.dependContainer").data(depends, function(d){
			return d.id; 
			} );
		var dependContainerEnter = depend.enter().append("g").attr("class", "dependContainer").attr("id", function(d){return d.id;});

		var dependContainerUpdate = depend.select("g.dependContainer");
		var path = depend.selectAll("path.depend").data(function(d){
			return d.lines;
			});
		var pathEnter = path.enter().append("path").attr("class","depend").classed("cursor-e-resize", function(d){
				return d["class"] == "cursor-e-resize"; 
			}).classed("cursor-n-resize", function(d){
				return d["class"] == "cursor-n-resize"; 
			}).attr("marker-end", function(d, idx){if(idx == 1 || ( idx == 0 && d.class == "cursor-e-resize") )return "url(#suit)"});;
			
		path.on("mousedown", function(d){
				gantt_chartManager.selectTarget("dependLine", d, that);
				gantt_util.stopEvent();
			}).attr("d", function(d){
				return line(d.nodes);
			});
		var pathExit = path.exit().remove();
		
		var dependUpdate = depend.select("path.depend");
		depend.exit().remove();
		
		gantt_util.stopEvent();
	};
	//gantt settings
	this.settings = new gantt_settings(settings);
	
	//gantt data
	this.___initializeTreeData(json, this.settings.childrenNode);
	this.data = {};
	this.layout = {};
	this.data.data = json;
	this.data.depends = json.___depend;
	//gantt layout tree, tree height not make sense
	this.layout.tree = d3.layout.tree([this.settings.minNodeWidth * this.data.data.___depth, 1000])
	.children(function(d){return d.children;});
	this.data.nodes = this.layout.tree.nodes(this.data.data);
	
	//remove old chart and append new chart and reusable components
	d3.select(this.settings.container).select("svg").remove();
	this.layout.mainContainer = d3.select("div#svg-container").append("svg")
	.attr("width", this.settings.treeWidth + this.settings.width + 50);
	this.layout.mainContainer.append("defs").append("marker").attr("id", "suit")
	.attr("viewBox", "0 -5 10 10").attr("refX", 5).attr("refY", 0)
	.attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto")
	.attr("fill", "black").append("path").attr("d", "M0,-5L10,0L0,5")
	.attr("stroke", "black");
	this.layout.nodeContainer = this.layout.mainContainer.append("g").attr("transform", "translate(10,50)");
	
	this.data.data.___x = 0;
	this.data.data.___y = 0;
	
	this.___update(this.data.data);
	
	var nContainer = this.layout.nodeContainer.append("g").attr("class", "notification hidden");
	nContainer.append("rect").attr("width", 400).attr("height", 25);
	nContainer.append("text").attr("y", 15).attr("x", 5);
	
	d3.select(window)
	.on("mousemove", gantt_actions.mousemove)
	.on("mouseup", function(){ 
		if(!gantt_chartManager.isTargetSelected()){
			return;
		}
		gantt_actions.mousemove();
		var me = gantt_chartManager.selectedObject.instance;
		gantt_chartManager.releaseTarget();
		me.layout.nodeContainer.select("g.notification").attr("class", "notification hidden");
	});
};
});