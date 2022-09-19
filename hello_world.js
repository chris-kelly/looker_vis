// https://github.com/looker-open-source/custom_visualizations_v2/blob/master/docs/api_reference.md
// https://plotly.com/javascript/getting-started/
// https://plotly.com/javascript/plotlyjs-function-reference/#plotlynewplot

looker.plugins.visualizations.add({
  // Options for user to choose in the "edit" part of looker vis
  // In this example, whether the plot is bar or scatter
  options: { 
    graph_type: {
      type: "string",
      label: "Plot type",
      values: [
        {"Scatter": "scatter"},
        {"Bar": "bar"}
      ],
      display: "radio",
      default: "scatter"
    },
    xaxis_label: {
      type: "string",
      label: "x axis label",
      default: "Enter text"
    },
    yaxis_label: {
      type: "string",
      label: "y axis label",
      default: "Enter text"
    }
  },

  // Set up the initial state of the visualization
  create: function(element, config) { 

    // import scripts to allow matrix operations
    var mathjs_script = document.createElement("script");
    // import scripts to build that vis
    var plotly_script = document.createElement("script");
    
    
    window.scriptLoad = new Promise(load => {
      mathjs_script.onload = load;
      plotly_script.onload = load;
    })
    
    mathjs_script.src = "https://cdnjs.com/libraries/mathjs";
    plotly_script.src = "https://cdn.plot.ly/plotly-2.14.0.min.js";
    
    mathjs_script.type = "text/javascript";
    plotly_script.type = "text/javascript";
    
    document.head.appendChild(mathjs_script)
    document.head.appendChild(plotly_script)

    // Insert a <style> tag with class to keep stuff centered.
    element.innerHTML = `
      <style>
        .container_style {
          /* Vertical centering */
          height: 90%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
          top: 0px;
          margin: 0;
        }
        .container_style > .plot-container {
            height: 100%;
        }
      </style>
    `;

    // Create the container element with that class to let us center the vis.
    var container = element.appendChild(document.createElement("div"));
    container.className = "container_style";
    this.plotly_bit = container;    

  },

  
  updateAsync: function(data, element, config, queryResponse, details, done) { // Update everytime data/settings change

    // Clear errors from previous updates
    this.clearErrors();

    // Throw errors and exit if the shape of the data isn't what this chart requires
    if (queryResponse.fields.dimensions.length == 0) {
      this.addError({title: "No Dimensions", message: "This chart requires dimensions."}); // error
      return; // exit
    }

    console.log(queryResponse)

    data_m = math.matrix(data)

    var x = []
    var y = []

    first_dim_name = queryResponse.fields.dimensions[0].name
    first_measure_name = queryResponse.fields.measures[0].name

    for(var row of data) { // for each row in data
			var x_i = row[first_dim_name]; // take first dimension
      var y_i = row[first_measure_name]; // take first measure
			x.push(LookerCharts.Utils.textForCell(x_i)); // append to array
      y.push(LookerCharts.Utils.textForCell(y_i)); // append to array
		}

    plotly_data = [{  
      x: x,
      y: y,
      type: config.graph_type // Set the type to the user-selected graph type
    }]

    if (config.xaxis_label != "Enter text") {
      xaxis_label = config.xaxis_label
    } else {
      xaxis_label = first_dim_name
    }

    if (config.yaxis_label != "Enter text") {
      yaxis_label = config.yaxis_label
    } else {
      yaxis_label = first_measure_name
    }

    layout = {
      margin: { t: 0 },
      title: 'Click Here to Edit Chart Title',
      xaxis : {title: {text: xaxis_label}},
      yaxis : {title: {text: yaxis_label}},
    }

    config = {
      // editable: true,
      responsive: true
    }
    
    window.scriptLoad.then(() => {
      
      Plotly.newPlot( // use plotly library
        this.plotly_bit, // graphDiv
        data,
        layout,
        config
      )
      
    })

    // Let Looker know rendering is complete
    done()
  }
});