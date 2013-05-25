define({
	customTimeFormat: function(date){
		var formats = [
		  [d3.time.format("%Y"), function() { return true; }],
		  [d3.time.format("%B"), function(d) { return d.getMonth(); }],
		  [d3.time.format("%b %d"), function(d) { return d.getDate() != 1; }],
		  [d3.time.format("%a %d"), function(d) { return d.getDay() && d.getDate() != 1; }],
		  [d3.time.format("%I %p"), function(d) { return d.getHours(); }],
		  [d3.time.format("%I:%M"), function(d) { return d.getMinutes(); }],
		  [d3.time.format(":%S"), function(d) { return d.getSeconds(); }],
		  [d3.time.format(".%L"), function(d) { return d.getMilliseconds(); }]
		];
		var i = formats.length - 1, f = formats[i];
		while(!f[1](date)){
			f = formats[--i];
		}
		return f[0](date);
	},


	stopEvent: function(){
		if (d3.event) {
			d3.event.preventDefault();
			d3.event.stopPropagation();
		}
	}
});