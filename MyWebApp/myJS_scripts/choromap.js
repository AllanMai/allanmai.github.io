window.onload = function () {
	var margin = { top: 20, right: 20, bottom: 20, left: 20 };
	width = 800 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom,
		formatPercent = d3.format(".1%");

	var svg = d3.select("#map").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	tooltip = d3.select("body").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);

	queue()
		.defer(d3.csv, "data/finalwaterdata.csv")
		.defer(d3.json, "data/us.json")
		.await(ready);

	var legendText = ["0/Null", "10", "50", "250", "500", "1000", "3000", "5500"];
	var legendColors = ["#d4e6f1", "#a9cce3", "#7fb3d5", "#2980b9", "#2471a3", "#1f618d", "#1a5276", "#154360"];


	function ready(error, data, us) {

		var counties = topojson.feature(us, us.objects.counties);

		data.forEach(function (d) {
			d.year = +d.year;
			d.fips = +d.fips;
			d.total = +d.total;
		});

		var dataByCountyByYear = d3.nest()
			.key(function (d) { return d.fips; })
			.key(function (d) { return d.year; })
			.map(data);

		counties.features.forEach(function (county) {
			county.properties.years = dataByCountyByYear[+county.id]
		});

		var color = d3.scale.threshold()
			.domain([0, 10, 50, 250, 500, 1000, 3000, 5500])
			.range(["#d4e6f1", "#a9cce3", "#7fb3d5", "#2980b9", "#2471a3", "#1f618d", "#1a5276", "#154360"]);

		var projection = d3.geo.albersUsa()
			.translate([width / 2, height / 2]);

		var path = d3.geo.path()
			.projection(projection);

		var countyShapes = svg.selectAll(".county")
			.data(counties.features)
			.enter()
			.append("path")
			.attr("class", "county")
			.attr("d", path);

		countyShapes
			.on("mouseover", function (d) {
				tooltip.transition()
					.duration(250)
					.style("opacity", 1);
				tooltip.html(
					"<p><strong>" + d.properties.years[2000][0].county + ", " + d.properties.years[2000][0].state + "</strong></p>" +
					"<table><tbody><tr><td class='wide'>Total Ground and Surface Water Withdrawals 2000:</td><td>" + (d.properties.years[2000][0].total) + "</td></tr>" +
					"<tr><td>Total Ground and Surface Water Withdrawals 2005:</td><td>" + (d.properties.years[2005][0].total) + "</td></tr>" +
					"<tr><td>Total Ground and Surface Water Withdrawals 2010:</td><td>" + (d.properties.years[2010][0].total) + "</td></tr></tbody></table>"
				)
					.style("left", (d3.event.pageX + 15) + "px")
					.style("top", (d3.event.pageY - 28) + "px");
			})
			.on("mouseout", function (d) {
				tooltip.transition()
					.duration(250)
					.style("opacity", 0);
			});

		svg.append("path")
			.datum(topojson.feature(us, us.objects.states, function (a, b) { return a !== b; }))
			.attr("class", "states")
			.attr("d", path);

		var legend = svg.append("g")
			.attr("id", "legend");

		var legenditem = legend.selectAll(".legenditem")
			.data(d3.range(8))
			.enter()
			.append("g")
			.attr("class", "legenditem")
			.attr("transform", function (d, i) { return "translate(" + i * 41 + ",0)"; });

		legenditem.append("rect")
			.attr("x", width - 300)
			.attr("y", -7)
			.attr("width", 40)
			.attr("height", 6)
			.attr("class", "rect")
			.style("fill", function (d, i) { return legendColors[i]; });

		legenditem.append("text")
			.attr("x", width - 300)
			.attr("y", -10)
			.style("text-anchor", "middle")
			.text(function (d, i) { return legendText[i]; });

		function update(year) {
			slider.property("value", year);
			d3.select(".year").text(year);
			countyShapes.style("fill", function (d) {
				return color(d.properties.years[year][0].total);
			});
		}

		var slider = d3.select(".slider")
			.append("input")
			.attr("type", "range")
			.attr("min", 2000)
			.attr("max", 2010)
			.attr("step", 5)
			.on("input", function () {
				var year = this.value;
				update(year);
			});

		update(2005);

	}

	d3.select(self.frameElement).style("height", "685px");
};