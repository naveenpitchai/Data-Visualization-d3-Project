# data_visualization_using_d3
Explanatory data visualization using D3 and dimple

### Summary : 

This data viz. shows a comprehensive look on co2 emission by world countries between 1970 - 2014. The Co2 emissions are subjective since not every country is made equal and it depends on various factors, so this visulaization looks at the emission in terms of sheer volume in tonnes and emission per capita. Users can interact with the plot by selecting the type of plot, scales and a particular region they wish to analyze. plot can be used to understand the effect of industrial developments in the developed countries and the effect of climate change initiatives in developed countries.  


### Design : 

Region split - The plot as is had many plot lines and was highly indistinguishable in case user wished to get details for a particular country. 

Scales - Plot has two scales, Fixed and relative scale. the intuition behind this design was to let the user understand the effects by quickly comparing the plot lines between different regions of the world(fixed scale) and compare different countries with in a selected region(relative scale)

Hover animations - Hover effects can be triggered in the plot by either hovering on the list of countries or on the paths in the plot. Idea here was to give a quick look in to the line of a particular country there by a look in to its emission history. 

Path highlights - Hovering or clicking on country paths make the selected line highlighted and everything else fade in to background a little bit. this was to trace the path of a country since there were lot of overlapping lines. 

Summary info - Idea behind this was to give a quick over look on the data overall and for each region. 

### Feedback :

1. The plot has too many lines to dissect and access a particular line of a country, emission value in a particular year. 

To solve this and add more context for the reader to get out of the plot, regions were added and the visualization is filtered based on the selected region. Further hovering over each circle gives user the value of that particular year. 
In addition to these a particular countrys line can be highlighted to see the trend by hovering over the name of that country or over the plot line. 

2. Co2 emission per capita can be misleading since countries with lower population can come out showing higher numbers and the ones with higher population goes scott free (like China, USA, India)

A second plot was added to the visualization to show the net volume of Co2 emission for all countries. As it can seen in the plot both plots vary wildly and some counries which has been polluting heavily (China, India) had its population increase too, over the years, which made the per capita values at minimum. 

3. The visualization should narrate a story and should highlight the trend instead of an exploratory graph.

The trend the plot narrates is multi fold, 

a, Some countries when compared to the volumes of emission of some big super powere, seems minimal (India, Iran, Saudi, Brazil for example), but if those were to be put in a relative scale among its peers(relative scale), the increase was steep and, in some cases an increase of 800%. 

b, In European countries a clear trend of downward emission due to their efforts on Global Warming

c, Summary info are added for each region to indicate important story.

### Resources :

https://gist.github.com/mbostock/2565344
http://bl.ocks.org/ChrisJamesC/5896521/83d7c5c04f7d031d3c71b4d6fd5b5193366d9fed
https://www.w3schools.com/graphics/svg_intro.asp
https://developer.mozilla.org/en-US/docs/Web/
https://bl.ocks.org/mbostock/5247027
http://bl.ocks.org/mbostock/3943967
https://github.com/d3/d3-transition
http://www.wickham43.net/hoverpopups.php






