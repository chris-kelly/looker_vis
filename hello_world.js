// https://github.com/looker-open-source/custom_visualizations_v2/blob/master/docs/api_reference.md

looker.plugins.visualizations.add({
  // options for user to choose in the "edit" part of looker vis
  // options: { 
  //   font_size: {
  //     type: "string",
  //     label: "Font Size",
  //     values: [
  //       {"Large": "large"},
  //       {"Small": "small"}
  //     ],
  //     display: "radio",
  //     default: "large"
  //   }
  // },

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

    // // Create an element to contain the text.
    // this._textElement = container.appendChild(document.createElement("div"));

  },

  
  updateAsync: function(data, element, config, queryResponse, details, done) { // Update everytime data/settings change

    // Clear errors from previous updates
    this.clearErrors();

    // Throw errors and exit if the shape of the data isn't what this chart requires
    if (queryResponse.fields.dimensions.length == 0) {
      this.addError({title: "No Dimensions", message: "This chart requires dimensions."}); // error
      return; // exit
    }

    // // Grab first cell of the data
    // var firstRow = data[0];
    // var firstCell = firstRow[queryResponse.fields.dimensions[0].name];
    // // Insert the data into the page
    // this._textElement.innerHTML = LookerCharts.Utils.htmlForCell(firstCell);

    var x = []
    var y = []

    for(var row of data) {
			var x_i = row[queryResponse.fields.dimensions[0].name];
      var y_i = row[queryResponse.fields.dimensions[1].name];
			x += LookerCharts.Utils.textForCell(x_i);
      y += LookerCharts.Utils.textForCell(y_i);
		}

    Plotly.newPlot( this._plotly_test, [{
      x: x, // [1, 2, 3, 4, 5],
      y: y // [1, 2, 4, 8, 16] 
    }], 
    {margin: { t: 0 } } 
    );

    // Set the size to the user-selected size
    // if (config.font_size == "small") {
    //   this._textElement.className = "hello-world-text-small";
    // } else {
    //   this._textElement.className = "hello-world-text-large";
    // }

    // Let Looker know rendering is complete
    done()
  }
});