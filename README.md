# Data-Visualization-d3-Project

Explanatory data visualization using D3 and dimple

&nbsp;

>### Summary : 

This data viz. shows a comprehensive look on co2 emission by world countries between 1970 - 2014. The Co2 emissions are subjective since not every country is made equal and it depends on various factors, so this visulaization looks at the emission in terms of sheer volume in tonnes and emission per capita. Users can interact with the plot by selecting the type of plot, scales and a particular region they wish to analyze. plot can be used to understand the effect of industrial developments in the developed countries and the effect of climate change initiatives in developed countries.

Below summary of insights can be learned from the data and plot

* There was a good correlation between income/capita and emission/capita of world countries.

* There was a correlation between GDP and raw emission tonnage of world countries.

* Mainly western europe countries has seen good drop in emission in recent years due to their flight against Global warming.

* Some countries like ***Brazil,China,India,Saudi,Iran*** had humble beginnings and grew to be the top polluter,in some cases over 1000%, largely due to   the large scale burning of fossil fuels particularly ***Coal*** for energy needs and outdated environmental practice.

* Some small countries, but big economies such as ***Qatar,Luxemborugh,Trinidad&Tobago,Aruba,Bahamas,Kuwait*** had higher than average emissions/capita rivaling huge countries.

* Some 148 countries have made pledges,in 2015 Paris agreement, to cut its emissions in in 12-17 years. Projections for some of the top pledges has been discussed in a separate section.

&nbsp;

>### Design : 

***Chart type*** - The decision to use line plot stemmed on the type of data we are dealing with - Time series data. 



***Region split*** - Region split was designed as a way for the user to dig further in to a part of the world and understand the effects. The reason for this divide  follows the geographical divide of the world. 

***Scales*** - Plot has two scales, Fixed and relative scale. the intuition behind this design was to let the user understand the effects by quickly comparing the plot lines between different regions of the world(fixed scale) and compare different countries with in a selected region(relative scale)

***Path hover animations*** - Hover effects was designed as a way to provide users a mean to quickly distinguish the progress of a particular country and fading out others.

***Circle click info*** - An info pane with country and emission info of that particular year appears when a circle is clicked on. This was designed in order to provide the info quickly to the users for a particular country and year.

***Country list hover animation*** - In addition to path hover animation, a hover on country list also highlights a country's trend. This was created in order to provide users a means to quickly see the trend based on the name of a country(which was lacking in path hover anumation).

***Hover multiple clicks*** - Main reason for this design was to compare multiple countries by clicking on their paths based on the trend(For eg: users were curious on a lines which were close to each other and wanted to compare)

***Multiple clicks on country list*** - The reasoning behind this decision was to do the above comparison bases on the name of the countries. 

***Summary info*** - Summary info was created to provide a summary of a particular region to the user. 

***Help Info*** - This decision was made to provide users on information to make most out of the plot and various animations it uses to get the point across. 

&nbsp;

>### Feedback :

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

&nbsp;

>### Resources :

https://gist.github.com/mbostock/2565344
http://bl.ocks.org/ChrisJamesC/5896521/83d7c5c04f7d031d3c71b4d6fd5b5193366d9fed
https://www.w3schools.com/graphics/svg_intro.asp
https://developer.mozilla.org/en-US/docs/Web/
https://bl.ocks.org/mbostock/5247027
http://bl.ocks.org/mbostock/3943967
https://github.com/d3/d3-transition
http://www.wickham43.net/hoverpopups.php






