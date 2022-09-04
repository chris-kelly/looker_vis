// https://github.com/looker-open-source/custom_visualizations_v2/blob/master/docs/api_reference.md
// https://plotly.com/javascript/getting-started/

looker.plugins.visualizations.add({
  // options for user to choose in the "edit" part of looker vis
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
    }
  },

  // Set up the initial state of the visualization
  create: function(element, config) { 

    // Insert a <style> tag with some styles we'll use later.
    element.innerHTML = `
      <style>
        .hello-world-vis {
          /* Vertical centering */
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
        }
        .hello-world-text-large {
          font-size: 72px;
        }
        .hello-world-text-small {
          font-size: 18px;
        }
      </style>
    `;

    // Create a container element to let us center the text.
    var container = element.appendChild(document.createElement("div"));
    container.className = "hello-world-vis";

    // import plotly script
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://cdn.plot.ly/plotly-2.14.0.min.js";
    document.body.appendChild(script)

    // Create an element to contain the plotly vis
    this._plotly_test = container.appendChild(document.createElement("div"));

  },

  
  updateAsync: function(data, element, config, queryResponse, details, done) { // Update everytime data/settings change

    // Clear errors from previous updates
    this.clearErrors();

    // Throw errors and exit if the shape of the data isn't what this chart requires
    if (queryResponse.fields.dimensions.length == 0) {
      this.addError({title: "No Dimensions", message: "This chart requires dimensions."}); // error
      return; // exit
    }

    var x = []
    var y = []

    for(var row of data) {
			var x_i = row[queryResponse.fields.dimensions[0].name];
      var y_i = row[queryResponse.fields.measures[0].name];
			x.push(LookerCharts.Utils.textForCell(x_i));
      y.push(LookerCharts.Utils.textForCell(y_i));
		}

    // Set the typr to the user-selected graph type

    Plotly.newPlot( this._plotly_test, [{ 
      x: x,
      y: y,
      type: config.graph_type
    }], 
    {margin: { t: 0 } } 
    );

    // Let Looker know rendering is complete
    done()
  }
});