function draw(data) {

   //manipulate data

 d3.select('body').append('h2').text('Co2 Emission for World Countries').clas

var countries = data.map(function(each) {

 //each row comes in
return {
	id: each['Country_name'],
	values : data.columns.slice(2).map(function(d) {

		//for each year (column header)

		return  { year : +d , emission : +each[d] }
		})}})


debugger;


var margin = {top: 20 , bottom : 40, right: 20, left : 40 },
	width = 1400 - margin.left - margin.right , 
	height = 700 - margin.top - margin.bottom


 svg = d3.select('body').append('svg').
 attr('width', 1400).attr('height',700)


 g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')').
 attr('class', 'main_g')

 //define the axes

 //finding the extent for x and y axis

 var x_extent = d3.extent(data.columns.slice(2), function(d) {return d})

 var y_min = d3.min(countries, function(each_co) {  return d3.min(each_co.values, 
 	function(d) { return d.emission;})})

 var y_max = d3.max(countries, function(each_co) { return d3.max(each_co.values,
 	function(d) { return d.emission})})


//debugger;

 var x = d3.scaleLinear().domain(x_extent).range([0,width]);
 var y = d3.scaleLinear().domain([y_min, y_max]).range([height,0])
 var z = d3.scaleOrdinal(d3.schemeCategory10).domain(countries.map(function(d) {return d.id}))


 //append the each axis groups to the main group

 g.append('g').attr('transform', 'translate(0,' + (height+5) + ')').
 call(d3.axisBottom(x)).append('text').
 attr('transform', 'translate('+(width/2)+',' + 30 + ')').
 text('Years').attr('fill','#000').attr('class', 'axistext')

 g.append('g').call(d3.axisLeft(y)).append('text').attr('transform', "rotate(-90)").
 	text('Co2 Emission by countries').attr('fill','#000').attr('y', 20).
 	attr('class', 'axistext')


 //now we need a a g element for each country. 

 var country = g.selectAll('.main_g').data(countries).
 enter().append('g')

 debugger;

 //create a line function

//this line function takes the values array for each country and convert in to coordinates

var line = d3.line().curve(d3.curveBasis).defined(function(d) { return d}).
x(function(d) { return x(d.year)}).
y(function(d) { return y(d.emission)})


country.append('path').
attr('d', function(d) { return line(d.values);}).
style('stroke', function(d) { return z(d.id);}).
attr('class', function(d) { return d.id + " " + 'line'})

debugger;

}

