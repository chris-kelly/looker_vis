looker.plugins.visualizations.add({
  
  // options for user to choose in the "edit" part of looker vis
  options: { 
    font_size: {
      type: "string",
      label: "Font Size",
      values: [
        {"Large": "large"},
        {"Small": "small"}
      ],
      display: "radio",
      default: "large"
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

    // Create an element to contain the text.
    this._textElement = container.appendChild(document.createElement("div"));

  },

  
  updateAsync: function(data, element, config, queryResponse, details, done) { // Update everytime data/settings change

    // Clear errors from previous updates
    this.clearErrors();

    // Throw errors and exit if the shape of the data isn't what this chart requires
    if (queryResponse.fields.dimensions.length == 0) {
      this.addError({title: "No Dimensions", message: "This chart requires dimensions."}); // error
      return; // exit
    }

    // Grab first cell of the data
    var firstRow = data[0];
    var firstCell = firstRow[queryResponse.fields.dimensions[0].name];

    // Insert the data into the page
    this._textElement.innerHTML = LookerCharts.Utils.htmlForCell(firstCell);

    // Set the size to the user-selected size
    if (config.font_size == "small") {
      this._textElement.className = "hello-world-text-small";
    } else {
      this._textElement.className = "hello-world-text-large";
    }

    // Let Looker know rendering is complete
    done()
  }
});