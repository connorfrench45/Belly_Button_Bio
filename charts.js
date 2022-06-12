function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// Create the buildChart function.
function buildCharts(sample) {
  // Use d3.json to load the samples.json file 
  d3.json("samples.json").then((data) => {
    
    // Create a variable that holds the samples array. 
    let allSamples = data.samples;
    // Create a variable that filters the samples for the object with the desired sample number.
    let sampleArray = allSamples.filter(sampleObj => sampleObj.id == sample);
    // 1. Create a variable that filters the metadata array for the object with the desired sample number.
    let metadataArray = data.metadata.filter(sampleObj => sampleObj.id == sample);
    // Create a variable that holds the first sample in the array.
    let searchResult = sampleArray[0];

    // 2. Create a variable that holds the first sample in the metadata array.
    let metadataResult = metadataArray[0];

    // Create variables that hold the otu_ids, otu_labels, and sample_values.
    let otuIds = searchResult.otu_ids;
    
    let otuLabels = searchResult.otu_labels;
    
    let sampleValues = searchResult.sample_values;
    

    // 3. Create a variable that holds the washing frequency.
    let washingFrequency = metadataResult.wfreq;
    
    // Create the yticks for the bar chart.
    var yticks = otuIds.slice(0,10).reverse().map(id => 'OTU ' + id);

    // Use Plotly to plot the bar data and layout.
    var barData = {
      x: sampleValues.slice(0,10).reverse(),
      y: yticks,
      text: otuLabels.slice(0,10).reverse(),
      type: 'bar',
      orientation: 'h'
    };

    var barLayout = {
      title: 'Top 10 Bacteria Cultures Found',
      paper_bgcolor: 'lightgray'
    };

    Plotly.newPlot('bar', [barData], barLayout);
    
    // Use Plotly to plot the bubble data and layout.
    var bubbleData = [{
      x: otuIds,
      y: sampleValues,
      mode: 'markers',
      marker: {size: sampleValues.map(s => (s**0.7)*5), 
        color: otuIds,
        opacity: 0.7},
      text: otuLabels
    }];
    
    var bubbleLayout = {
      title: 'Bacteria Cultures Per Sample',
      hovermode: 'closest',
      xaxis: {title: 'OTU ID'},
      height: 800,
      automargin: true,
      paper_bgcolor: 'lightgray'    
    };

    Plotly.newPlot('bubble', bubbleData, bubbleLayout);
   
    
    // 4. Create the trace for the gauge chart.
    var gaugeData = [{
      type: 'indicator',
      mode: 'gauge+number',
      value: washingFrequency,
      title: {text: '<b>Belly Button Washing Frequency</b><br>Scrubs per Week'},
      gauge: {
        axis: {range: [null, 10], dtick: 2, tick0: 0},
        bar: {color: 'black'},
        steps: [
          {range: [0, 2], color: 'red'},
          {range: [2, 4], color: 'orange'},
          {range: [4, 6], color: 'yellow'},
          {range: [6, 8], color: 'yellowgreen'},
          {range: [8, 10], color: 'green'}
        ]
      }
    }];
    
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
      paper_bgcolor: 'lightgray',
      margin: {t: 100, r: 30, l: 20, b: 20}
    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot('gauge', gaugeData, gaugeLayout);
  });
}
