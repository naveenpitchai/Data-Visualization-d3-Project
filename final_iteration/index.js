
//Defining global variables used through out the code

var countries = null;
var prevselection = null;
var global_div_index = null;
var global_region = null;
var x = null;
var y = null;
var split_country = null;
var column_names = null;
var clear_ind = false;
var prevclass = null;
var prevclickedpath = null;
var trans_val = d3.transition().duration(400);
var average_data = null;
var data_type = 'capita';
var filtered_avg = null;
var prevpath_clicked = null;
var prevcountryclass = null;
var regionsdiv = null;
var bool = true;



//function to redraw the plot when the radio button is changed
function selectData() {

    d3.select('.mainsvg').style('opacity', 0.2);
    d3.select('#loaderimage').style('opacity', 1);

    if (this.value === "tonspercapita") {

        data_type = 'capita';

        d3.select('#titlediv').text('Co2 Emission for World Countries (Metric tons per capita)');

        d3.csv('data/Co2-emission-ktpergdp.csv', draw);
    } else {

        data_type = 'total';

        d3.select('#titlediv').text('Co2 Emission for World Countries (Thousands of Tonnes)');
        d3.csv('data/Co2-emission-kt.csv', tonneconversion, draw);

    }

    function tonneconversion(d) { //coverting the values to thousands of tones

        column_names.forEach(function(c) {
            d[c] = (+d[c] / 1000);
        })
        return d;
    }

}


//adds the initial arrow on top of the plot
function arrow_help() {

    var t = d3.transition().duration(2000);

    var t_short = d3.transition().duration(400);

    var help_g = d3.select('#labelsvg').append('g').attr('id', 'helpg');

    help_g.append('text').text('hover for help').attr('x', -100).style('font-color', 'red').
    transition(t).attr('x', 0).attr('y', 20);

    var arrow = d3.select('#labelsvg').append('polygon').attr('points', "110,8 120,17 110,26").
    style('fill', '#a30404');

    for (i = 0; i < 20; i++) {

        arrow = arrow.transition(t_short).attr('points', "105,5 115,14 105,23").
        transition(t_short).attr('points', "110,5 120,14 110,23");

    }}



//main draw function
function draw(data) {


    d3.select('.mainsvg').style('opacity', 0.2);
    d3.select('#loaderimage').style('opacity', 1);

    //removing the previous SVG before creating the new one. 

    d3.select('.mainsvg').selectAll('*').remove();

    arrow_help() //adding the arrow help animation


    column_names = data.columns.slice(4);

    var all_cols = data.columns;

    average_data = data.map(function(x) {

        return {
            id: x.Country_code,
            name: x.Country_name,
            avg: +((+x.average).toFixed(2)),
            region: x.Region
        }

    })

    average_data = average_data.sort(function(a, b) {
        return b.avg - a.avg;
    })


    countries = data.map(function(each) {

        //each row comes in
        return {
            id: each['Country_code'],
            name: each['Country_name'],
            region: each['Region'],
            values: data.columns.slice(4).map(function(d) {

                return {
                    year: +d,
                    emission: +((+each[d]).toFixed(2))
                }
            })
        }
    })


    var width_svg = 1100,
        height_svg = 550;

    var margin = {
            top: 20,
            bottom: 40,
            right: 20,
            left: 40
        },
        width = width_svg - margin.left - margin.right,
        height = height_svg - margin.top - margin.bottom;


    svg = d3.select('.mainsvg').attr('width', width_svg).attr('height', height_svg);

    g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')').
    attr('class', 'main_g');


    //define the axes

    //finding the extent for x and y axis

    var x_extent = d3.extent(data.columns.slice(4), function(d) {
        return d;
    })

    var y_min = d3.min(countries, function(each_co) {
        return d3.min(each_co.values,
            function(d) {
                return d.emission;
            })
    })

    var y_max = d3.max(countries, function(each_co) {
        return d3.max(each_co.values,
            function(d) { //    //
                return d.emission;
            })
    })


    x = d3.scaleLinear().domain(x_extent).range([0, width]);
    y = d3.scaleLinear().domain([y_min, y_max]).range([height,0]);
    var z = d3.scaleOrdinal(d3.schemeCategory10).domain(countries.map(function(d) {
        return d.id;
    }))


    //append the each axis groups to the main group


    var xaxis = g.append('g').attr('transform', 'translate(0,' + (height + 5) + ')').
    call(d3.axisBottom(x).tickFormat(d3.format('d'))).attr('id','xaxis').
    append('text').attr('transform', 'translate(' + (width / 2) + ',' + 30 + ')').
    text('Years').attr('fill', '#000').attr('class', 'axistext');


    var yaxis = g.append('g').call(d3.axisLeft(y)).
    attr('id', 'yaxis').append('text').
    attr('transform', "rotate(-90)").attr('fill', '#000').
    attr('y', 20).attr('class', 'axistext');


    if (d3.selectAll('.dataoption')._groups[0][0].checked) {

        if (d3.select('.infocheckbox')._groups[0][0].checked) {

            summary_info(average_data, 300, '(per capita)', 1000);

        }

        yaxis.transition(trans_val).text('Co2 Emission in tonnes');

    } else {


        if (d3.select('.infocheckbox')._groups[0][0].checked) {

            summary_info(average_data, 100, '(in tonnes)', 2000);
        }

        yaxis.transition().text('Co2 Emission in thousands of tonnes');
    }


    //create a line function

    //this line function takes the values array for each country and convert in to coordinates

    var line = d3.line().
    defined(function(d) {
            return !isNaN(d.emission);
        }). //curve(d3.curveBasis).
    x(function(d) {
        return x(d.year);
    }).
    y(function(d) {
        return y(d.emission);
    })


    //now we need a  g element for each country. 
    var country = g.selectAll('.countryg').data(countries, function(d) {
        return d['id'];
    }).
    enter().append('g').attr('class', 'countryg');


    var paths = country.append('path').style('stroke', function(d) {
        return z(d.id);
    })



    if (prevselection === null) {

        var n = 0;

        country.selectAll('circle').data(function(d) {
            return d.values;
        }).enter().append('circle').attr('cx', line.x()).
        attr('cy', function(d) {
            if (!isNaN(d.emission)) {
                return y(d.emission);
            };return y(0);
        }).
        attr('r', function(d) {
            return circleNaNcheck(d);
        }).attr('class', 'countrycircles')


        //setting the fill of the circles same as the path
        d3.selectAll('.countrycircles').style('fill', function(d) { //;
            return this.parentNode.childNodes[0].style.stroke
        }).style('fill-opacity', 0);


        paths.transition().delay(function(d, i) {
                return i * 10;
            })
            .attr('d', function(d) {
                return line(d.values);
            })
            .style('stroke', function(d) {
                return z(d.id);
            })
            .attr('class', function(d) {
                return d.id + " " + 'line' + " " + 'countrypath';
            })
            .attr('id', function(d) {
                return d.id;
            }).on('start', function() {
                n++;
                //console.log('start ' + n);
            })
            .on('end', function() {
                n--;
                d3.select(this.parentNode).selectAll('circle').style('fill-opacity', 1);
                //console.log('end ' + n);
                if (n === 0) {
                    if (prevselection !== null && !clear_ind) { //debugger;
                        update(global_region, global_div_index);
                    }
                    eventhandlers();
                    add_general();
                }
            })
    } else {

        country.selectAll('circle').data(function(d) {
            return d.values;
        }).enter().append('circle').attr('cx', line.x()).
        attr('cy', function(d) {
            if (!isNaN(d.emission)) {
                return y(d.emission);
            } else {
                return y(0);
            }
        }).
        attr('r', function(d) {
            return circleNaNcheck(d);
        }).attr('class', 'countrycircles');


        //setting the fill of the circles same as the path
        d3.selectAll('.countrycircles').style('fill', function(d) { //;
            return this.parentNode.childNodes[0].style.stroke;
        })


        paths //.transition().delay(function(d,i) { return i*5})
            .attr('d', function(d) {
                return line(d.values);
            })
            .style('stroke', function(d) {
                return z(d.id);
            })
            .attr('class', function(d) {
                return d.id + " " + 'line' + " " + 'countrypath';
            })
            .attr('id', function(d) {
                return d.id;
            })


        if (!clear_ind) {
            update(global_region, global_div_index);
        }

        eventhandlers();
        add_general();

    }


    //circles.append('circle').attr('cx', function(d){  // })
    regions_list = ['Africa', 'Central & North America', 'East Asia & Pacific',
        'Western Europe', 'Eastern Europe & Asia', 'Middle East', 
        'South America & Carribean', 'South Asia','Future pledges'];

    d3.select('#mainregion').append('div').attr('id', 'datadiv');

    d3.select('#datadiv').append('div').attr('id', 'regiondiv');

    regionbuttons = d3.select('#regiondiv').selectAll('div').data(regions_list).enter().append('div').
    text(function(d) {
            return d;
        }).attr('class', 'regionslist');


    sublist = ['africa', 'centralnorthamerica', 'eastasiapacific',
        'eurasia', 'easteuropeasia', 'middleeast', 'southamericacarb', 'southasia',''
    ];


    var prevregions = null;

    function summary_info(avg_data, x, text, dur) {

        d3.select('.summarysvg').remove();


        var y = 50;

        var dataoption = d3.selectAll('.dataoption')._groups[0][0].checked;
        var scaleoption = d3.selectAll('.scaleoption')._groups[0][1].checked;

        if (global_div_index === 7 || global_div_index === 2) {
            x = 100;
            y = 120;
        }

        if (global_div_index === 2 && dataoption) {
            x = 300;
            y = 120;
        }

        if (global_div_index === 1 && dataoption && !scaleoption) {
            x = 50;
            y = 200;
        }

        if (global_div_index === 1 && !dataoption && !scaleoption) {
            x = 100;
            y = 200;
        }

        if (global_div_index === 3 && dataoption && !scaleoption) {
            x = 630;
            y = 30;
        }

        if (global_div_index === 5 && !dataoption) {
            x = 100;
            y = 150;
        }


        if (global_div_index === 5 && dataoption) {
            x = 320;
            y = 30;
        }

        if (global_div_index === 6 && !dataoption) {
            x = 100;
            y = 120;
        }



        var del = d3.transition().duration(dur);

        svg = d3.select('#mainregion').append('svg').attr('width',600).
        attr('height',300).attr('class','summarysvg')

        if(regionsdiv !== null) { 

            h = d3.select('.countrydiv').node().getBoundingClientRect().height;

            svg.attr('transform','translate(540,-' + (h+30) + ')')

            

        } else { 

            svg.attr('transform','translate(550,-280)')


        }


        svg.append('text').text('Top Polluting countries').attr('id', 'summarytext').
        attr('transform', 'translate(-' + x + ',50)').style('fill', '#a50404').
        style('font-weight', 'bold').
        transition(del).attr('transform', 'translate(0,20)');

        summary_g = svg.append('g').attr('transform', 'translate(-50,0)').
        attr('id', 'summaryheader');

        summary_g.transition(del).attr('transform', 'translate(0,0)');

        row1 = summary_g.append('text').attr('class', 'summaryrows').attr('dy', '3.3em');

        row1.append('tspan').text('Countries');
        row1.append('tspan').text('Average Emission ' + text).attr('dx', '3em');

        //Add data rows below

        var summary_data = svg.append('g').attr('transform', 'translate(0,50)').
        attr('id', 'summaryg').selectAll('text').
        data(avg_data.slice(0, 7));


        var summary_text = summary_data.enter().append('text').
        attr('transform', function(d, i) {
            return 'translate(' + (i * 20 - 100) + (i * 20) + ')';
        });

        summary_text.append('tspan').text(function(d) {
            return d.name;
        }).attr('class', 'summaryrows').
        attr('dy', '1.2em').
        style('font-style', 'italic');

        summary_text.append('tspan').text('-').attr('dx', '2em').
        attr('class', 'summaryrows');

        summary_text.append('tspan').html(function(d) {
            return d.avg;
        }).attr('dx', '2em').
        attr('class', 'summaryrows').style('font-weight', 'bold').style('fill', '#f47142');

        summary_text.transition(d3.transition().duration(dur)).
        attr('transform', function(d, i) {
            return 'translate(0,' + (i * 20) + ')';
        });

    }


    function circleNaNcheck(d) {
        if (!isNaN(d.emission)) {
            return 3;
        }
    }

    function circleyNaNcheck(d) {

        if (!isNaN(d.emission)) {
            return line.y();
        } else {
            return 0;
        }
    }

    function addsummary_asia() {

        var dataoption = d3.selectAll('.dataoption')._groups[0][0].checked;
        var scaleoption = d3.selectAll('.scaleoption')._groups[0][1].checked;

        d3.select('.trendtext').remove();

        d3.select('.mainsvg').append('g').
        attr('transform', 'translate(-100,50)').attr('class', 'trendtext').
        transition().duration(500).attr('transform', 'translate(100,50)');

        d3.select('.mainsvg').append('g').
        attr('transform','translate(2000,400)').attr('class','trendtext2').
        transition().duration(2000).attr('transform','translate(500,400)')


        if (dataoption && scaleoption) {

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,0)').
            append('tspan').
            text('Emission/capita for south asian region was low compared \
            to the rest of the world,');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,20)').
            append('tspan').
            text('checkout the relative scale to see the trend in this region');

        } else if (dataoption && !scaleoption) {

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,0)').
            append('tspan').
            text('Almost every country in the region had a clear upward trend of emissions/capita,');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,20)').
            append('tspan').
            text('which seems to be reasonable for this highly developing region considering the fact');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,40)').
            append('tspan').
            text('these numbers are insignificant compared to the rest of the world.');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,70)').
            append('tspan').
            text('Countries like ').append('tspan').text('India,Bangladesh,Sri lanka,Afghanistan ').
            style('font-style','italic').
            style('fill','#a50404').style('font-weight','bold');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,90)').
            append('tspan').
            text('pledged to reduce their carbon footprint in next 13-17 years in the 2015 Paris agreement.');

            bhu_each = d3.select('.trendtext').append('text').attr('transform', 'translate(0,120)')

            bhu_each.append('tspan').
            text('Bhutan ').style('font-style','italic').
            style('fill','#a50404').style('font-weight','bold');

            bhu_each.append('tspan').
            text('has already become a ');

            bhu_each.append('tspan').text('carbon negative country').style('font-style','italic').
            style('fill','#a50404').style('font-weight','bold'); 

            bhu_each.append('tspan').text(' due to their amazing afforestation');

        
            d3.select('.trendtext').append('text').attr('transform', 'translate(0,140)').
            append('tspan').
            text('efforts and now the forest cover in the country absorb more co2 than it emits.');

            ind_each = d3.select('.trendtext').append('text').attr('transform', 'translate(0,170)')

            ind_each.append('tspan').text('India - ').style('font-style','italic').
            style('fill','#a50404').style('font-weight','bold');

            ind_each.append('tspan').text('a deceptive case here, although it seems to have insignificant emission/capita')

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,190)').append('tspan')
            .text('the raw tonnage shows a rapid growth. switch to tonnage plot to see it.')

        } else if (!dataoption && !scaleoption) {

            each_text = d3.select('.trendtext').append('text').attr('transform', 'translate(0,0)');

            each_text.append('tspan').
            text('South Asia is marked with quite a few small countries except ');

            each_text.append('tspan').
            text('India,').style('font-weight', 'bold').style('fill', '#a50404');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,20)').
            append('tspan').text('which had a whopping ').append('tspan').text('increase of 1000% since 1970').
            style('font-weight', 'bold').style('fill', '#a50404');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,50)').
            append('tspan').text('This astronomical increase can be attributed to the below practices,')

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,70)').
            append('tspan').text("1. India's automobile emission standards are not at par with world countries")

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,90)').
            append('tspan').text('2. Fuel and biomass burning for domestic usage due to the lack of proper electricity')

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,110)').
            append('tspan').text('3. Traffic congestion due to evergrowing population')


            d3.select('.trendtext').append('text').attr('transform', 'translate(0,110)').
            append('tspan').text('3. Traffic congestion due to evergrowing population')

            d3.select('.trendtext2').append('text').attr('transform','translate(0,20)').
            append('tspan').text('Other countries in this region are small economic and had considerably')

            d3.select('.trendtext2').append('text').attr('transform','translate(0,40)').
            append('tspan').text('less impact over the years.')

             

        }
    }


    function addsummary_eastasia() {

        var dataoption = d3.selectAll('.dataoption')._groups[0][0].checked;
        var scaleoption = d3.selectAll('.scaleoption')._groups[0][1].checked;


        d3.select('.trendtext').remove();
        d3.select('.trendtext2').remove();

        d3.select('.mainsvg').append('g').
        attr('transform', 'translate(-100,50)').attr('class', 'trendtext').
        transition().duration(800).attr('transform', 'translate(100,50)');


        if ((!dataoption && !scaleoption) || (!dataoption && scaleoption)) {

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,0)').
            append('tspan').text('As a major country in east Asia, China has seen a steady trend since 1970');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,20)').
            append('tspan').text('and specifically an ').append('tspan').
            text('alarmingly steep increase since 2002').style('font-style','italic').
            style('fill','#a50404').style('font-weight','bold');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,50)').
            append('tspan').text('This steady and steep increase in the case of China can be \
                explained by below facts,')

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,80)').
            append('tspan').text("1. China is the largest consumer of coal in the world, \
                73% of China's energy comes from coal")

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,100)').
            append('tspan').text("2. China is the outsourced manufacturing hub of the world, which prompts \
                enormous energy needs.")

            d3.select('.trendtext').append('text').attr('transform', 'translate(25,120)').
            append('tspan').text("More energy needs equals more emission.")

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,150)').
            append('tspan').text("Japan has maintained almost the same emission over the years \
             despite its technological advancements")

            
            d3.select('.trendtext').append('text').attr('transform', 'translate(0,170)').
            append('tspan').text("This low trend can be attributed the infamous ").append('tspan').
            text('Pollution Diet of 1970 -').style('font-style','italic').
            style('fill','#a50404').style('font-weight','bold');


            d3.select('.trendtext').append('text').attr('transform', 'translate(0,190)').
            append('tspan').text("14 laws passed to curb pollution, which was rampant in 1960's");

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,220)').
            append('tspan').text("Australia,despite being a huge land mass kept its population on check ");

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,250)').
            append('tspan').text("Other countries in this region are relatively small and the emission \
                rates has been");

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,270)').
            append('tspan').text("same through out the years");

        }
    }


    function addsummary_weurope() {


        var dataoption = d3.selectAll('.dataoption')._groups[0][0].checked;
        var scaleoption = d3.selectAll('.scaleoption')._groups[0][1].checked;


        d3.select('.trendtext').remove();
        d3.select('.trendtext2').remove();

     


        if (!dataoption && !scaleoption) {

            d3.select('.mainsvg').append('g').
            attr('transform', 'translate(-100,50)').attr('class', 'trendtext').
            transition().duration(500).attr('transform', 'translate(100,120)');


            each_text = d3.select('.trendtext').append('text')
                .attr('transform', 'translate(0,0)');

            each_text.append('tspan').text('Majority of european countries');

            each_text.append('tspan').text(' (UK,Germany, Switzerland,France,Belgium) saw a decrease').
            style('font-weight', 'bold').style('fill', '#a50404');

            each_text.append('tspan').text(' in the pollution ');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,20)').
            append('tspan').text('from 1970 or in recent times, largely due to their increased')
                .append('tspan').text(' effort on reducing Global warming.').
            style('font-weight', 'bold').style('fill', '#a50404').style('font-style', 'italic');

        }

        if(dataoption) { 

            d3.select('.mainsvg').append('g').
            attr('transform', 'translate(-100,40)').attr('class', 'trendtext').
            transition().duration(500).attr('transform', 'translate(200,40)');

            each_text = d3.select('.trendtext').append('text')
            .attr('transform', 'translate(0,0)');

            each_text.append('tspan').text('The correlation continous here,');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,20)')
            .append('tspan').text('Highest emission/capita in europe - Luxembourg - also tops the income/capita in among Europeon countries');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,40)')
            .append('tspan').text('same goes for other countries - Denmark,Germany, Netherlands,Belgium,Finland');

            d3.select('.trendtext').append('text').attr('transform', 'translate(80,70)')
            .append('tspan').text('Other than the comparisons with in the region, the emission/capita trend');

            d3.select('.trendtext').append('text').attr('transform', 'translate(110,90)')
            .append('tspan').text('was on a decline for most of the countries in the recent years,');

            
            d3.select('.trendtext').append('text').attr('transform', 'translate(140,110)')
            .append('tspan').text('majorly due to the increased efforts to cutback emissions.');

             








        }

    }


    function addsummary_africa() {


        var dataoption = d3.selectAll('.dataoption')._groups[0][0].checked;
        var scaleoption = d3.selectAll('.scaleoption')._groups[0][1].checked;


        d3.select('.trendtext').remove();
        d3.select('.trendtext2').remove();

        d3.select('.mainsvg').append('g').
        attr('transform', 'translate(2000,50)').attr('class', 'trendtext').
        transition().duration(500).attr('transform', 'translate(300,300)');

        d3.select('.mainsvg').append('g').
        attr('transform', 'translate(-200,50)').attr('class', 'trendtext2').
        transition().duration(500).attr('transform', 'translate(70,40)');


 

        if (!dataoption && !scaleoption) {

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,0)').
            append('tspan').text('The trend in africa is mainly marked by south africa \
                with its higher values from the start');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,20)').
            append('tspan').text('and steadily increased than the rest of the countries');

            d3.select('.trendtext2').append('text').attr('transform','translate(0,0)').
            append('tspan').text('South Africa -').style('font-weight', 'bold').
            style('fill', '#a50404').style('font-style', 'italic');

            d3.select('.trendtext2').append('text').attr('transform','translate(125,0)').
            append('tspan').text('The top contributor in the region generates 90% of its electricity burning coal.');

            d3.select('.trendtext2').append('text').attr('transform','translate(0,50)').
            append('tspan').text('Generally African countries had much lower emissions than rest of the world');

            d3.select('.trendtext2').append('text').attr('transform','translate(0,70)').
            append('tspan').text('the highest tonne emission has not crossed the 500k mark.')

        }

    }

    function addsummary_northam() {


        var dataoption = d3.selectAll('.dataoption')._groups[0][0].checked;
        var scaleoption = d3.selectAll('.scaleoption')._groups[0][1].checked;

        d3.select('.trendtext').remove();
        d3.select('.trendtext2').remove();

        d3.select('.mainsvg').append('g').
        attr('transform', 'translate(2000,50)').attr('class', 'trendtext').
        transition().duration(500).attr('transform', 'translate(80,200)');


        if (!dataoption && !scaleoption) {

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,0)').
            append('tspan').text('As it can be seen here United States, \
                most populated of all, had a staggeringly');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,20)').
            append('tspan').text('high emission and a steady increase over the years. \
                Although other countries');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,40)').
            append('tspan').text('had an upward trend,both emission and the spike was minimal.');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,70)').
            append('tspan').text('Emission of US, ').
            style('font-weight', 'bold').style('fill', '#a50404').style('font-style','italic');

            d3.select('.trendtext').append('text').attr('transform', 'translate(120,70)').
            append('tspan').text('as it can be seen, have been historically high, but considering the economical growth,');


            d3.select('.trendtext').append('text').attr('transform', 'translate(0,90)').
            append('tspan').text('the increase on the emissions has been moderate so to speak \
                and fell in the recent years due to the actions');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,110)').
            append('tspan').text('against global warming.');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,140)').
            append('tspan').text('Despite being an oil rich country,').append('tspan').text('Canada ').
            style('font-weight', 'bold').style('fill', '#a50404').style('font-style','italic');

            d3.select('.trendtext').append('text').attr('transform', 'translate(320,140)').
            append('tspan').text('managed to have the emissions under check and')

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,160)').
            append('tspan').text('that could be attributed to its low population');

        }

    }


    function addsummary_meast() {


        var dataoption = d3.selectAll('.dataoption')._groups[0][0].checked;
        var scaleoption = d3.selectAll('.scaleoption')._groups[0][1].checked;

        d3.select('.trendtext').remove();
        d3.select('.trendtext2').remove();



        if (!dataoption && scaleoption) {

            d3.select('.mainsvg').append('g').
            attr('transform', 'translate(-100,50)').attr('class', 'trendtext').
            transition().duration(500).attr('transform', 'translate(100,80)');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,0)').
            append('tspan').text('Compared to other countries in the world, \
                middleeast countries trend is not dissectable');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,20)').
            append('tspan').text('Please use relative scale to look at the trends.');


        } else if (!dataoption && !scaleoption) {

            d3.select('.mainsvg').append('g').
            attr('transform', 'translate(-100,50)').attr('class', 'trendtext').
            transition().duration(500).attr('transform', 'translate(100,80)');


            d3.select('.trendtext').append('text').attr('transform', 'translate(0,0)').
            append('tspan').html('Almost all of Middle east countries had a constant \
                upward trend from 1970 - 2015');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,20)').
            append('tspan').html('Iran and Saudi, both had a extremely steep increase over the years');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,50)').
            append('tspan').html('Iran & Saudi ').style('font-weight', 'bold').style('fill', '#a50404')
            .append('tspan').text('had a explosive CO2 emission mainly due to its \
                oil, gas and petrochemical industries');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,70)').
            append('tspan').html('It had taken measures in 2014 to cut the consumption of fossil fuels.');


            d3.select('.trendtext').append('text').attr('transform', 'translate(0,20)').
            append('tspan').html('Iran and Saudi, both had a extremely steep increase over the years');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,100)').
            append('tspan').html('Generally the middleeast region is known for their oil industry,');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,120)').
            append('tspan').html('thus can be seen a consistent increase in emissions over the years.');

        } else if(dataoption) { 

            d3.select('.mainsvg').append('g').
            attr('transform', 'translate(-100,50)').attr('class', 'trendtext').
            transition().duration(500).attr('transform', 'translate(150,40)');

            d3.select('.trendtext').append('text').attr('transform','translate(0,0)').
            append('tspan').text('Some of the richest countries in the world - \
                Qatar,UAE,Kuwait,Saudi Arabia had the highest emission/capita,')

            d3.select('.trendtext').append('text').attr('transform','translate(0,20)').
            append('tspan').text('further confirming the trend.')




        }

    }


    function addsummary_latin() {


        var dataoption = d3.selectAll('.dataoption')._groups[0][0].checked;
        var scaleoption = d3.selectAll('.scaleoption')._groups[0][1].checked;

        d3.select('.trendtext').remove();
        d3.select('.trendtext2').remove();

        


        if (!dataoption && !scaleoption) {

            d3.select('.mainsvg').append('g').
            attr('transform', 'translate(-100,50)').attr('class', 'trendtext').
            transition().duration(500).attr('transform', 'translate(100,50)');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,0)').
            append('tspan').html('Latin america, with its large concentration of developing countries,')
            d3.select('.trendtext').append('text').attr('transform', 'translate(0,20)').
            append('tspan').html('is all upwards in a constant manner over the years.');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,50)').
            append('tspan').html('Especially Brazil,Venezuela,Argentina,Colombia,Chile has seen the highest \
                increase of any countries');

            ven_text = d3.select('.trendtext').append('text').
            attr('transform', 'translate(0,80)')

            ven_text.append('tspan').text('Venezuela').style('font-style','italic').
            style('fill','#a50404').style('font-weight','bold');

            ven_text.append('tspan').text(' has pledged to cutdown its emissions')

            ven_text.append('tspan').text(' 20% by 2030 in 2015').style('font-style','italic').
            style('fill','#a50404').style('font-weight','bold');


            braz_text = d3.select('.trendtext').append('text').
            attr('transform', 'translate(0,100)')

            braz_text.append('tspan').text('Brazil').style('font-style','italic').
            style('fill','#a50404').style('font-weight','bold');

            braz_text.append('tspan').text(' has pledged to cutdown its emissions')

            braz_text.append('tspan').text(' 37% by 2025 in 2015').style('font-style','italic').
            style('fill','#a50404').style('font-weight','bold');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,160)').
            text("For more pledges by countries, checkout the 'Future Pledges' section")


        }

        if(dataoption) { 

            d3.select('.mainsvg').append('g').
            attr('transform', 'translate(-100,50)').attr('class', 'trendtext').
            transition().duration(500).attr('transform', 'translate(220,50)');

            d3.select('.trendtext').append('text').attr('transform', 'translate(0,0)').
            append('tspan').text('Surprise contenders here - ');

            d3.select('.trendtext').append('text').attr('transform', 'translate(210,0)').
            append('tspan').text('Aruba and Trinidad & Tobago.').style('font-style','italic').
            style('fill','#a50404').style('font-weight','bold');

            d3.select('.trendtext').append('text').attr('transform', 'translate(430,0)').
            append('tspan').text(' These two tiny countries had');

            d3.select('.trendtext').append('text').attr('transform', 'translate(15,20)').
            append('tspan').text('per capita emissions rivaling some big countries in the world.');

            d3.select('.trendtext').append('text').attr('transform', 'translate(15,50)').
            append('tspan').text('Aruba mainly due to its fossil fuel burning and T&T due \
                to its fossil fuels and');

            d3.select('.trendtext').append('text').attr('transform', 'translate(40,70)').
            append('tspan').text('the cement manufacturing industry.')


            
        }

    }


    function addsummary_easteur() { 


        var dataoption = d3.selectAll('.dataoption')._groups[0][0].checked;
        var scaleoption = d3.selectAll('.scaleoption')._groups[0][1].checked;

        d3.select('.trendtext').remove();
        d3.select('.trendtext2').remove();

        d3.select('.mainsvg').append('g').
        attr('transform', 'translate(-100,30)').attr('class', 'trendtext').
        transition().duration(500).attr('transform', 'translate(100,40)');

        if(dataoption) {


        d3.select('.trendtext').append('text').attr('transform','translate(0,0)').
        append('tspan').text('Russia,Poland,Mongolia,Turkey').style('font-style','italic').
            style('fill','#a50404').style('font-weight','bold'); 



        d3.select('.trendtext').append('text').attr('transform','translate(0,20)').
        append('tspan').text('some of the top contributors in the region attribute');

        d3.select('.trendtext').append('text').attr('transform','translate(0,40)')
        .append('tspan').text('it mainly to fossil fuel burning for energy.');



        } else if(!dataoption) { 

            d3.select('.trendtext').append('text').attr('transform','translate(0,0)').
            append('tspan').text('In terms of pure tonnage, Russia standsout from rest of the region');


            d3.select('.trendtext').append('text').attr('transform','translate(0,30)').
            append('tspan').text('Ukraine,Romania,Poland,Bulgaria - All had a downward trend');

            d3.select('.trendtext').append('text').attr('transform','translate(0,50)').
            append('tspan').text('which is good news and many countries pledged cutbacks.');

        }}


    function add_general() { 


        var dataoption = d3.selectAll('.dataoption')._groups[0][0].checked;
        var scaleoption = d3.selectAll('.scaleoption')._groups[0][1].checked;

        d3.select('.trendtext').remove();
        d3.select('.trendtext2').remove();

        

        if(dataoption) { 

            d3.select('.mainsvg').append('g').
            attr('transform', 'translate(-100,30)').attr('class', 'trendtext').
            transition().duration(500).attr('transform', 'translate(170,30)');

            d3.select('.trendtext').append('text').attr('transform','translate(0,0)').
            append('tspan').text('There is a slight correlation between the income/capita \
                of countries to its emissions/capita');

            d3.select('.trendtext').append('text').attr('transform','translate(0,20)').
            append('tspan').text('Some of the higher emission countries like ');

            

            d3.select('.trendtext').append('text').attr('transform','translate(335,20)').
            append('tspan').text('Qatar, Luxembourg,UAE,Brunei,Kuwait,Bahrain, Hongkong').
            style('font-style','italic').
            style('fill','#a50404').style('font-weight','bold');

            d3.select('.trendtext').append('text').attr('transform','translate(0,40)').
            append('tspan').text('ranks higher up the income/capita lists. select each region to learn more..');



        }

        if(!dataoption) { 

            d3.select('.mainsvg').append('g').
            attr('transform', 'translate(-100,30)').attr('class', 'trendtext').
            transition().duration(300).attr('transform', 'translate(100,30)');

            d3.select('.trendtext').append('text').attr('transform','translate(0,0)').
            append('tspan').text('A whole another story can be seen when looking at \
                the raw emission tonnage for the world countries.');

            d3.select('.trendtext').append('text').attr('transform','translate(0,30)').
            append('tspan').text("Some of the world's biggest countries both \
                economically and geographically has been the");

            d3.select('.trendtext').append('text').attr('transform','translate(0,50)').
            append('tspan').text("biggest polluters. There is a even more stronger \
                correlation between GDP and the emissions.");

            d3.select('.trendtext').append('text').attr('transform','translate(0,80)').
            append('tspan').text("Ofcourse the trend has not been same over the years,");

            each_text = d3.select('.trendtext').append('text').attr('transform','translate(0,100)')

            each_text.append('tspan').text("China ").style('font-style','italic').
            style('fill','#a50404').style('font-weight','bold');

            each_text.append('tspan').text(", started with mere million tonnes has eventually \
                grew over 1000% over the years mainly due")

            d3.select('.trendtext').append('text').attr('transform','translate(0,120)').
            append('tspan').text("to its aggressive manufacturing practice and use of coal for energy.");

            each_text2 = d3.select('.trendtext').append('text').attr('transform','translate(0,150)')

            each_text2.append('tspan').text("United States ").style('font-style','italic').
            style('fill','#a50404').style('font-weight','bold');

            each_text2.append('tspan').text(",on the other hand, started big way back in \
                1970, way more than any country at that time,")


            d3.select('.trendtext').append('text').attr('transform','translate(0,170)').
            append('tspan').text("and had a very moderate growth over the years and drops \
                in the recent years.");

            d3.select('.trendtext').append('text').attr('transform','translate(-30,290)')
            .append('tspan').text("Other countries had nt had as nearly as dramatic trend as \
                China and US.");

            each_text3 = d3.select('.trendtext').append('text').attr('transform','translate(-30,320)');

            each_text3.append('tspan').text("Major economies such as ");

            each_text3.append('tspan').text("Japan,Germany,UK,France,India,Russia").
            style('font-style','italic').
            style('fill','#a50404').style('font-weight','bold');

            d3.select('.trendtext').append('text').attr('transform','translate(-30,340)').
            append('tspan').text('had an upward trend and some even managed to reduce it in the recent years.');

            d3.select('.trendtext').append('text').attr('transform','translate(-30,360)').
            append('tspan').text('Drilldown on each region to see more focused trends');

           


        }

    }

    

    function update(region, i) {

        clear_ind = false;

        if (i === 7) {
            addsummary_asia();
        } else if (i === 2) {
            addsummary_eastasia();
        } else if (i === 3) {
            addsummary_weurope();
        } else if (i === 0) {
            addsummary_africa();
        } else if (i === 1) {
            addsummary_northam();
        } else if (i === 5) {
            addsummary_meast();
        } else if (i === 6) {
            addsummary_latin();
        } else if(i === 4) { 
            addsummary_easteur();
        } else {
            d3.select('.trendtext').remove();
        }


        d3.select('#summarytext').remove();
        d3.select('#summaryheader').remove();
        d3.select('#summaryg').remove();

        d3.select('.countrydiv').remove();

        regionsdiv = d3.select('#datadiv').append('div').
        attr('class', 'countrydiv');

        var filtered = countries.filter(function(d) {
            return d.region === sublist[i];
        })


        filtered_avg = average_data.filter(function(d) {

            return d.region === sublist[i];
        })

        filtered_avg = filtered_avg.sort(function(a, b) {
            return b.avg - a.avg;
        })

        
        //

        regionsdiv.selectAll('div').data(filtered).
        enter().append('div').text(function(each) {
            return each.name;
        }).attr('class', 'countrylist');

        prevregions = regionsdiv;

        if (d3.select('.infocheckbox')._groups[0][0].checked) {

            summary_info(filtered_avg, 100, '', 1000);
        }


        var filtered_y_min = d3.min(filtered, function(d) {
            return d3.min(d.values, function(d) {
                return d.emission;
            })
        });

        var filtered_y_max = d3.max(filtered, function(d) {
            return d3.max(d.values, function(d) {
                return d.emission
            })
        });


        var y_filtered = d3.scaleLinear().domain([filtered_y_min, filtered_y_max]).range([height, 0]);

        if (d3.selectAll('.scaleoption')._groups[0][1].checked) {

            y_filtered = y;
        }


        d3.select('#yaxis').call(d3.axisLeft(y_filtered));

        line_filtered = d3.line().defined(function(d) {
                return !isNaN(d.emission);
            }). //curve(d3.curveBasis).
        x(function(d) {
            return x(d.year);
        }).y(function(d) {
            return y_filtered(d.emission);
        });

        //below selection captures the current available paths in the document
        //so that the updated paths can be appended using enter and previous 
        //paths can be removed using exit

        var filtered_countries = d3.select('.main_g').selectAll('.countryg').
        data(filtered, function(d) {
            return d.id;
        });

        filtered_countries.exit().remove();

        var newaddition = filtered_countries.enter().append('g').
        attr('class', 'countryg');

        newaddition.append('path').attr('class', function(d) {
            return d.id + ' line' + ' countrypath';
        }).attr('id', function(d) {
            return d.id;
        });

        //newaddition.transition()


        d3.selectAll('.countrypath').attr('d', function(d) {
            return line_filtered(d.values);
        }).
        style('stroke', function(d) {
            return z(d.id);
        });


        //changing the attribute of the path for both first attempt and every successive attempts

        newaddition.selectAll('.countrycircles').data(function(d) {
            return d.values;
        }).enter().
        append('circle').attr('class', 'countrycircles');

        d3.selectAll('.countrycircles').style('fill', function(d) {

            return this.parentNode.childNodes[0].style.stroke;
        }).attr('cx', line_filtered.x()).attr('cy', line_filtered.y()).
        style('fill', function(d) {
            return this.parentNode.childNodes[0].style.stroke;
        }).
        attr('r', function(d) {
            return circleNaNcheck(d);
        });


        eventhandlers(); //registering the newly created path

    }

    //var prevregions = NaN

    var prevcircle = null;
    var prevpath = null;
    var stateout = true;
    var prevtext = null;
    var selected_country = null;

    regionbuttons.on('click', function(d, i) {

        debugger;

        stateout = true;

        global_div_index = i ;//storing values here to use later.
        global_region = d;

        //if there is a previous selection remove the background 

        if (prevselection !== null) {
            
            prevselection.style.backgroundColor = '';
        }

        d3.selectAll('.textpanes').remove();

        prevselection = this;

        this.style.backgroundColor = '#42d7f4';

        debugger;

        if(i === 8) { 

            d3.csv('data/Co2-emission-kt_future.csv', update_future);

        } else {update(d, i); }

        

    })



    function eventhandlers() {

        d3.select('#option1').selectAll('input').on("change", selectData);

        //d3.select('#option2').selectAll('input').on("change", selectData)

        d3.select('#option2').selectAll('input').on("change", function() {

            if (prevselection !== null) {
                update(global_region, global_div_index);
            }
        });


        d3.select('.main_g').selectAll('circle').on('click', circleclicks)
            .on('mouseover', circleclicks);

        d3.selectAll('.countrylist').on('mouseenter', mouseoverevent)
            .on('click', countryClick);

        d3.select('.countrydiv').on('mouseleave', countrydivout);

        d3.selectAll('.countrypath').on('mouseover', pathmouseover).on('click', pathclick)
        .on('mouseleave', mouseoutevent);

        d3.select('#firstsvg').on('mouseleave', svgout);

        d3.select('.infocheckbox').on('change', function() {

            if (this.checked) {
                if (data_type === 'capita' && prevselection === null) {
                    summary_info(average_data, 320, '(per capita)', 1000);
                } else if (data_type === 'capita' && prevselection !== null) {
                    summary_info(filtered_avg, 320, '(in capita)', 1000);
                } else if (data_type === 'total' && prevselection === null) {
                    summary_info(average_data, 100, '(in tonnes)', 1000);
                } else {
                    summary_info(filtered_avg, 100, '(in tonnes)', 1000);
                }


            } else {

                d3.select('#summarytext').remove();
                d3.select('#summaryheader').remove();
                d3.select('#summaryg').remove();

            }

        });

        //d3.select('#option2').on('change', function(d) { update(d,i) })

        d3.select('#infoimg').on('mouseover', function() {

            var textdiv = d3.select('#mainheader').append('div').attr('id', 'helppane').
            style('border', '2px dashed black').style('padding', '10px').
            attr('position', 'fixed');

            //var textdiv = d3.select('#formdiv')

            textdiv.append('text').html('<u><strong>Few tips to interact: </strong></u><br><br> Radio buttons can be used to customize the plot,<br> \
                <strong>Fixed --</strong> Used to compate regions across the world | <strong>Relative -</strong> Used to compare the countries with in the selected\
                region<br><br>Type of the plot can be changed with any regions selected<br><br>Click on any region to reveal the countries and filter the plot, After the filter, hover over any country to highlight\
                the corresponding plot line <br><br>\
                Hover on the circles to reveal year and emission information, hovering on any plot line to highlight it.<br><br>\
                Click on any country plot line to highlight and choose multiple lines to compare,this can be done by hovering and clicking on country names too<br><br>\
                <strong>Show Info</strong> - Check this to display additional information<br><br>\
                Use the clear button to reset the plot')
                .style('font-family', 'futura, "Lucida Grande", \
                "Lucida Sans Unicode", Helvetica, Arial, Verdana, sans-serif');

        }).on('mouseleave', mouseoutevent);


        function pathclick(d) {

            prevclass = this.attributes.class.nodeValue;
            prevclickedpath = this;

            d3.select('.infopanes').remove();

            g.append('text').attr('x', Math.abs(Math.floor((Math.random() * 100) - 40))+'%').attr('dx', '2em').attr('letter-spacing', 3).
            attr('class', 'selectedinfopanes').
            append('textPath').attr('xlink:href', '#' + d.id).text(d.name);

            d3.select(this).attr('class', 'clickedpath');

            stateout = false;

        }

        function svgout(d) { 

            stateout = true;
            d3.selectAll('.clickedpath').attr('class', prevclass);
            d3.selectAll('.selectedinfopanes').attr('class', 'infopanes');

            mouseoutevent();

        }


        function countrydivout(d) { 

            stateout = true;
            d3.selectAll('.clickedcountry').attr('class', prevcountryclass);

            mouseoutevent();

        }


        d3.select('#clearimg').on('click', function() {
            
            d3.selectAll('.dataoption')._groups[0][0].checked = true;
            d3.selectAll('.scaleoption')._groups[0][0].checked = true;
            d3.select('.infocheckbox')._groups[0][0].checked = false;
            d3.select('.countrydiv').remove();

            add_general();


            if (prevselection !== null) {
                prevselection.style.backgroundColor = null;
            }
            clear_ind = true;

            d3.csv('data/Co2-emission-ktpergdp.csv', draw);
        })



        function countryClick(d) {

            svg.selectAll('.infopaneshover').remove();




            var x_pos = 

        
            prevpath_clicked = d3.select('#' + d.id)
                .style('stroke-width', 5).style('stroke-opacity', 1);


            prevcountryclass = prevpath_clicked._groups[0][0].attributes.class.nodeValue;

            prevpath_clicked.attr('class', 'clickedcountry');

            g.append('text').attr('x', Math.abs(Math.floor((Math.random() * 100) - 40))+'%').attr('dx', 40).attr('letter-spacing', 3).
            attr('class', 'infopanes').
            append('textPath').attr('xlink:href', '#' + d.id).text(d.name);

            this.style.backgroundColor = '#efb95b';

            stateout = false;

        }

        function mouseoverevent(d) {

            d3.selectAll('.infopaneshover').remove();


            /*

            if (stateout) {

                if (prevpath !== null && selected_country.style.backgroundColor === "") {

                    prevpath.style('stroke-width', 1).style('stroke-opacity', 1);
                    prevtext.remove();

                }

            } */

            d3.selectAll('.countrypath').style('stroke-opacity',0.2).
            style('stroke-width',1);
            d3.selectAll('.countrycircles').style('opacity',0.2);

            selected_country = this;

            prevpath = d3.select('#' + d.id)
                .style('stroke-width', 5).style('stroke-opacity', 1);

            prevtext = g.append('text').attr('x', '20%').attr('dx',"0.35em").attr('letter-spacing', 3).
            attr('class', 'infopaneshover').
            append('textPath').attr('xlink:href', '#' + d.id).text(d.name);

            stateout = true;

        }


        function circleclicks(d) {

            d3.selectAll('.textpanes').remove();

            if (prevcircle !== null) {
                prevcircle.parentNode.childNodes[0].style['stroke-width'] = 1;
            }

            c_value = (this.parentNode.__data__.name + '(' + d.year + ')').length;

            e_value = ('Emission:' + d.emission).length;

            
            x_text = 0;

            y_text = 0;

            if (this.attributes.cx.nodeValue > 850) {
                x_text = 110;
            }

            if (this.attributes.cy.nodeValue < 50) {

                y_text = -70;

            }

            info_g = g.append('g').attr('class', 'textpanes');

            //

            info_g.append('rect').attr('x', this.attributes.cx.nodeValue - x_text).
            attr('y', this.attributes.cy.nodeValue - (y_text + 50)).
            attr('width', d3.max([c_value, e_value]) * 8 + 'px').
            attr('height', 40 + 'px').style('fill', '#bab4ae');


            info_g.append('text').attr('x', this.attributes.cx.nodeValue - x_text).
            attr('y', this.attributes.cy.nodeValue - (y_text + 30)).
            text(this.parentNode.__data__.name + '(' + d.year + ')');


            info_g.append('text').attr('x', this.attributes.cx.nodeValue - x_text).
            attr('y', this.attributes.cy.nodeValue - (y_text + 16)).text('Emission:' + d.emission);


        }


        function mouseoutevent() {

            d3.select('#helppane').remove();
            svg.selectAll('.infopanes').remove();
            svg.selectAll('.infopaneshover').remove();
            d3.selectAll('.textpanes').remove();


            d3.selectAll('.countrylist').style('background-color', '');

            if (stateout) {

                d3.selectAll('.countrypath').style('stroke-opacity', 1).style('stroke-width', 1);
                d3.selectAll('.countrycircles').style('opacity', 1);

            }
        }

        function pathmouseover(d) {


            d3.selectAll('.textpanes').remove();
            d3.selectAll('.infopanes').remove();

            d3.selectAll('.countrypath').style('stroke-opacity', 0.2).style('stroke-width', 1);
            d3.selectAll('.countrycircles').style('opacity', 0.2);

            d3.select(this).style('stroke-width', 5).style('stroke-opacity', 1);

            g.append('text').attr('x', '10%').attr('dx', '2em').attr('letter-spacing', 3).
            attr('class', 'infopanes').
            append('textPath').attr('xlink:href', '#' + d.id).text(d.name);

        }

    }

    d3.select('#loaderimage').style('opacity', 0);

    d3.select('.mainsvg').style('opacity', 1);


    function update_future(data) { 


        d3.select('.trendtext').remove();
        d3.select('.trendtext2').remove();


        d3.select('.mainsvg').selectAll('.countryg').remove();

        var countries_f = data.map(function(each) {  

            return { 

                id: each.Country_code,
                name: each.Country_name,
                avg: each.average,
                pledge: each.pledge,
                values: data.columns.slice(5).map(function(d) { 

                    return { 

                        year: +d,
                        emission: (+each[d]/1000) 

                    }})

            }})


        d3.select('#summarytext').remove();
        d3.select('#summaryheader').remove();
        d3.select('#summaryg').remove();

        d3.select('.countrydiv').remove();

        regionsdiv = d3.select('#datadiv').append('div').
        attr('class', 'countrydiv');

        regionsdiv.selectAll('div').data(countries_f).
        enter().append('div').text(function(each) {
            return each.name + '   -   ' + each.pledge + '%';
        }).attr('class', 'countrylist').append('input').attr('type','checkbox');


        var val_min = d3.min(countries_f, function(d) { return d3.min(d.values,function(x) { return x.emission})})

        var val_max = d3.max(countries_f, function(d) { return d3.max(d.values,function(x) { return x.emission})})

        var y_fut = d3.scaleLinear().domain([val_min,val_max]).range([height,0]);
        var x_fut = d3.scaleLinear().domain([1987,2030]).range([0,width]);

        var line_future = d3.line().defined(function(d) {
            return !isNaN(d.emission);
        }).
        x(function(d) { return x_fut(d.year)}).
        y(function(d) { return y_fut(d.emission)});

        debugger;

        d3.select('#xaxis').call(d3.axisBottom(x_fut).tickFormat(d3.format('d')))

        d3.select('#yaxis').call(d3.axisLeft(y_fut))


        var future_g = d3.select('.main_g').selectAll('.countryg').
        data(countries_f, function(d) { return d.id}).
        enter().append('g').attr('class','line countryg')

        debugger;

        future_g.append('path').attr('d', function(d) { return line_future(d.values)}).
        attr('class','countrypath').attr('id', function(d) { return d.id}).
        style('stroke', function(d) { return z(d.id)})

        future_g.selectAll('circle').data(function(d) { return d.values}).enter().append('circle').
        attr('r', function(d) { return circleNaNcheck(d)}).attr('cx', line_future.x()).attr('cy', line_future.y()).
        style('fill', function(d) { return this.parentNode.childNodes[0].style.stroke }).
        attr('class','countrycircles')

        eventhandlers();

        add_future();

    }

}