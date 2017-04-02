//d3.csv('data/Co2-emission-ktpergdp.csv', draw);

//d3.select('#option1').selectAll('input').on("change",selectData);

var countries = null;

var regions_list = ['Africa', 'Central & North America', 'East Asia & Pacific',
    'Western Europe', 'Eastern Europe & Asia', 'Middle East', 'South America & Carribean', 'South Asia'
]

var prevselection = null;
var global_div_index = null;
var global_region = null;
var x = null;
var y = null;
var split_country = null;
var column_names = null;
var clear_ind = false;

//var update = null;

function selectData() {

    //debugger;

    if (this.value === "tonspercapita") {

        d3.select('#mainheader').text('Co2 Emission for World Countries (Metric tons per capita)');

        d3.csv('data/Co2-emission-ktpergdp.csv', draw)
    } else {

        d3.select('#mainheader').text('Co2 Emission for World Countries (Thousands of Tonnes)')
        d3.csv('data/Co2-emission-kt_1.csv', tonneconversion, draw);

    }


    function tonneconversion(d) { //coverting the values to thousands of tones

        column_names.forEach(function(c) {
            d[c] = (+d[c] / 1000)
        });
        return d;
    }

}

function draw(data) {

    debugger;


    d3.select('.mainsvg').selectAll('*').remove();

    debugger;

    column_names = data.columns.slice(3);

    //d3.select('.countryhead').remove();

    countries = data.map(function(each) {

        //each row comes in
        return {
            id: each['Country_code'],
            name: each['Country_name'],
            region: each['Region'],
            values: data.columns.slice(3).map(function(d) {

                return {
                    year: +d,
                    emission: +((+each[d]).toFixed(2))
                }
            })
        }
    })

    debugger;

    var width_svg = 1100, height_svg = 550;

    var margin = {
            top: 20,
            bottom: 40,
            right: 20,
            left: 40
        },
        width = width_svg - margin.left - margin.right,
        height = height_svg - margin.top - margin.bottom


    svg = d3.select('.mainsvg').attr('width', width_svg).attr('height', height_svg)

    g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')').
    attr('class', 'main_g')


    //define the axes

    //finding the extent for x and y axis

    var x_extent = d3.extent(data.columns.slice(3), function(d) {
        return d
    })

    var y_min = d3.min(countries, function(each_co) {
        return d3.min(each_co.values,
            function(d) {
                return d.emission;
            })
    })

    var y_max = d3.max(countries, function(each_co) {
        return d3.max(each_co.values,
            function(d) { //    debugger;
                return d.emission
            })
    })

    debugger;



    x = d3.scaleLinear().domain(x_extent).range([0, width]);
    y = d3.scaleLinear().domain([y_min, y_max]).range([height, 0])
    var z = d3.scaleOrdinal(d3.schemeCategory10).domain(countries.map(function(d) {
        return d.id
    }))

    //append the each axis groups to the main group

    g.append('g').attr('transform', 'translate(0,' + (height + 5) + ')').
    call(d3.axisBottom(x)).append('text').
    attr('transform', 'translate(' + (width / 2) + ',' + 30 + ')').
    text('Years').attr('fill', '#000').attr('class', 'axistext')


    var yaxis = g.append('g').call(d3.axisLeft(y)).
    attr('id', 'yaxis').append('text').
    attr('transform', "rotate(-90)").attr('fill', '#000').
    attr('y', 20).attr('class', 'axistext')


    if (d3.selectAll('.dataoption')._groups[0][0].checked) {

        yaxis.transition().delay(500).text('Co2 Emission in tonnes')


    } else {
        yaxis.transition().text('Co2 Emission in thousands of tonnes')
    }


    //create a line function

    //this line function takes the values array for each country and convert in to coordinates

    debugger;

    var line = d3.line().
    defined(function(d) {
            return !isNaN(d.emission)
        }). //curve(d3.curveBasis).
    x(function(d) {
        return x(d.year)
    }).
    y(function(d) {
        return y(d.emission)
    })


    //now we need a a g element for each country. 
    var country = g.selectAll('.countryg').data(countries, function(d) {
        return d['id']
    }).
    enter().append('g').attr('class', 'countryg')
        //debugger;

    debugger;

    country.append('path') //.transition().delay(function(d, i) { return i * 10; })
        .attr('d', function(d) {
            return line(d.values);
        })
        .style('stroke', function(d) {
            return z(d.id);
        })
        .attr('class', function(d) {
            return d.id + " " + 'line' + " " + 'countrypath'
        })
        .attr('id', function(d) {
            return d.id
        })


    country.selectAll('circle').data(function(d) {
        return d.values
    }).enter().
    append('circle').attr('cx', line.x()).
    attr('cy', line.y()).attr('r', function(d) {
        return circleNaNcheck(d)
    }).
    attr('class', 'countrycircles')


    //setting the fill of the circles same as the path
    d3.selectAll('.countrycircles').
    style('fill', function(d) {
        //debugger;
        return this.parentNode.childNodes[0].style.stroke
    })


    //circles.append('circle').attr('cx', function(d){  debugger; })
    regions_list = ['Africa', 'Central & North America', 'East Asia & Pacific',
        'Western Europe', 'Eastern Europe & Asia', 'Middle East', 'South America & Carribean', 'South Asia'
    ]

    d3.select('#mainregion').append('div').attr('id', 'datadiv')

    d3.select('#datadiv').append('div').attr('id', 'regiondiv')

    regionbuttons = d3.select('#regiondiv').selectAll('div').data(regions_list).enter().append('div').
    text(function(d) {
            debugger;
            return d
        }).attr('class', 'regionslist') //style('width',220+'px')


    sublist = ['africa', 'centralnorthamerica', 'eastasiapacific',
        'eurasia', 'easteuropeasia', 'middleeast', 'southamericacarb', 'southasia'
    ]


    var prevregions = null;

    //d3.select('#mainregion').append('div').text('Countries').
    //attr('class', 'infohead' + " " + 'countryhead')


    function circleNaNcheck(d) {
        if (!isNaN(d.emission)) {
            return 3;
        }
    }


    function update(region, i) {

        //d3.selectAll('.textpanes').remove()

        d3.select('.countrydiv').remove();

        var regionsdiv = d3.select('#datadiv').append('div').
        attr('class', 'countrydiv')

        var filtered = countries.filter(function(d) {
            return d.region === sublist[i]
        })

        regionsdiv.selectAll('div').data(filtered).
        enter().append('div').text(function(each) {
            return each.name
        }).attr('class', 'countrylist')

        prevregions = regionsdiv


        var filtered_y_min = d3.min(filtered, function(d) {
            return d3.min(d.values, function(d) {
                return d.emission
            })
        })
        var filtered_y_max = d3.max(filtered, function(d) {
            return d3.max(d.values, function(d) {
                return d.emission
            })
        })

        debugger;


        var y_filtered = d3.scaleLinear().domain([filtered_y_min, filtered_y_max]).range([height, 0])

        if (d3.selectAll('.scaleoption')._groups[0][0].checked) {
            debugger;
            y_filtered = y;
        }


        debugger;

        d3.select('#yaxis').call(d3.axisLeft(y_filtered));

        line_filtered = d3.line().defined(function(d) {
                return !isNaN(d.emission)
            }). //curve(d3.curveBasis).
        x(function(d) {
            return x(d.year)
        }).y(function(d) {
            return y_filtered(d.emission)
        })

        //below selection captures the current available paths in the document
        //so that the updated paths can be appended using enter and previous 
        //paths can be removed using exit

        var filtered_countries = d3.select('.main_g').selectAll('.countryg').
        data(filtered, function(d) {
            return d.id
        })

        filtered_countries.exit().transition().remove()

        debugger;

        var newaddition = filtered_countries.enter().append('g').
        attr('class', 'countryg')

        newaddition.append('path').attr('class', function(d) {
            return d.id + ' line' + ' countrypath'
        }).attr('id', function(d) {
            return d.id
        })

        //newaddition.transition();


        d3.selectAll('.countrypath').attr('d', function(d) {
            return line_filtered(d.values)
        }).
        style('stroke', function(d) {
            debugger;
            return z(d.id)
        })


        //changing the attribute of the path for both first attempt and every successive attempts

        //debugger;

        newaddition.selectAll('.countrycircle').data(function(d) {
            return d.values
        }).enter().
        append('circle').attr('class', 'countrycircles')

        //debugger;


        d3.selectAll('.countrycircles').
        attr('cx', line_filtered.x()).attr('cy', line_filtered.y()).
        attr('r', function(d) {
            return circleNaNcheck(d)
        }).
        style('fill', function(d) {
            return this.parentNode.childNodes[0].style.stroke
        })

        eventhandlers(); //registering the newly created path

    }

    //var prevregions = NaN;

    regionbuttons.on('click', function(d, i) {

        global_div_index = i; //storing values here to use later.
        global_region = d;

        debugger;

        //if there is a previous selection remove the background color

        if (prevselection !== null) {
            debugger;
            prevselection.style.backgroundColor = ''
        }

        d3.selectAll('.textpanes').remove()

        prevselection = this

        this.style.backgroundColor = '#42d7f4'

        debugger;

        update(d, i);

    })

    var prevcircle = null;
    var prevpath = null

    var state = true;


    function eventhandlers() {

        d3.select('#option1').selectAll('input').on("change", selectData);

        //d3.selectAll('.scaleoption').on("change", update(global_region,global_div_index));

        d3.select('.main_g').selectAll('circle').on('click', circleclicks).
        on('mouseover', circleclicks)

        d3.selectAll('.countrylist').on('mouseover', mouseoverevent).on('click', countryClick)

        d3.selectAll('.countrypath').on('mouseover', pathmouseover).
        on('mouseout', mouseoutevent)

        d3.select('#infoimg').on('mouseover', function() {

                //d3.select('#helppane').remove();

            debugger;

            //d3.select('#helppane').style('visibility', 'visible')


                var textdiv = d3.select('header').append('div').attr('id','helppane').
                style('border', '2px dashed black').style('padding', '10px').
                attr('position', 'fixed');

                //var textdiv = d3.select('#formdiv')


                textdiv.append('text').html('Few tips to interact: <br><br> Radio buttons can be used to customize the plot,<br> \
                Fixed - Used to compate regions across the world <br> Relative - Used to compare the countries with in the selected\
                region<br><br>Click on any region to reveal the countries and filter the plot,<br>After the filter hover over any country to highlight\
                the corresponding line, this can be done by hovering on the line as well. <br>\
                click on the circles to reveal year and emission information. <br><br>\
                Use the adjacent clear button to reset the plot')
                .style('font-family', 'futura, "Lucida Grande", \
                "Lucida Sans Unicode", Helvetica, Arial, Verdana, sans-serif') 

                }).on('mouseout', mouseoutevent)

        


        d3.select('#clearimg').on('click', function() { debugger;
        d3.selectAll('.dataoption')._groups[0][0].checked = true;
        d3.select('.countrydiv').remove();
        prevselection.style.backgroundColor = null;
        clear_ind = true; d3.csv('data/Co2-emission-ktpergdp.csv', draw)})


            if (state) {
                d3.select('.countrydiv').on('mouseout', mouseoutevent)

            };

            //on('mouseout', mouseoutevent)


            //d3.selectAll('.countrypath').style('stroke-opacity', 1)
            //d3.selectAll('.countrycircles').style('stroke-opacity', 1)


            function countryClick(d) {

                debugger;

                state = false;

                debugger;

                d3.selectAll('.countrypath').style('stroke-opacity', 0.3)
                d3.selectAll('.countrycircles').style('opacity', 0.3)

                if (prevpath !== null) {
                    prevpath.style('stroke-width', 1).style('stroke-opacity', 0.3)
                }

                prevpath = d3.select('#' + this.name).style('stroke-width', 5).
                style('stroke-opacity', 1)
            }


            function mouseoverevent(d) {


                svg.selectAll('.infopanes').remove()

                d3.selectAll('.countrypath').
                style('stroke-opacity', 0.3)
                d3.selectAll('.countrycircles').
                style('opacity', 0.3)

                if (prevpath !== null) {
                    prevpath.style('stroke-width', 1).style('stroke-opacity', 0.3)
                }

                prevpath = d3.select('#' + d.id)
                    .style('stroke-width', 5).style('stroke-opacity', 1)

                g.append('text').attr('x', '5%').attr('dx', 40).attr('letter-spacing', 3).
                attr('class', 'infopanes').
                append('textPath').attr('xlink:href', '#' + d.id).text(d.name)

            }


            function circleclicks(d) {

                d3.selectAll('.textpanes').remove()

                if (prevcircle !== null) {
                    prevcircle.parentNode.childNodes[0].style['stroke-width'] = 1
                }

                /*

                svg.append('text').attr('x', (this.attributes.cx.nodeValue - 20)).
                attr('y', (this.attributes.cy.nodeValue + 10)).
                html(this.parentNode.__data__.name + ' -- <br>  Year:' + d.year + ' ' + 'Emission:' + d.emission).
                attr('class', 'textpanes').style('white-space', 'normal') */

                svg.append('svg:text').attr('x', (this.attributes.cx.nodeValue - 10)).
                attr('y', (this.attributes.cy.nodeValue - 30)).attr('class', 'textpanes').
                append('svg:tspan').text(this.parentNode.__data__.name+'('+d.year+')').
                attr('x',(this.attributes.cx.nodeValue - 10)).
                attr('dy', '1.4em') //.attr('dx', '2em')

                d3.select('.textpanes').append('svg:tspan').
                text('Emission:' + d.emission).
                attr('x',(this.attributes.cx.nodeValue - 10)).
                attr('dy', '1.4em')


                //this.parentNode.childNodes[0].style.stroke = 'black'
                this.parentNode.childNodes[0].style['stroke-width'] = 6
                this.attributes

                //d3.select('.'+this.parentNode.attributes.class.value).selectAll('circle').style('fill', 'black')

                prevcircle = this

            }


            function mouseoutevent() {

                d3.select('#helppane').remove();

                svg.selectAll('.infopanes').remove()

                d3.selectAll('.textpanes').remove()

                d3.selectAll('.countrypath').style('stroke-opacity', 1).style('stroke-width', 1)
                d3.selectAll('.countrycircles').style('opacity', 1)

            }

            function pathmouseover(d) {

                d3.selectAll('.textpanes').remove()

                d3.selectAll('.countrypath').style('stroke-opacity', 0.3)
                d3.selectAll('.countrycircles').style('opacity', 0.3)

                d3.select(this).style('stroke-width', 5).style('stroke-opacity', 1);

                g.append('text').attr('x', '50%').attr('dx', '2em').attr('letter-spacing', 3).
                attr('class', 'infopanes').
                append('textPath').attr('xlink:href', '#' + d.id).text(d.name)

            }

        }

        if (prevselection !== null && !clear_ind ) {

            update(global_region, global_div_index);

        }

        eventhandlers();

    }



 //.on('mouseout',mouseoutevent)