// https://github.com/looker-open-source/custom_visualizations_v2/blob/master/docs/api_reference.md
// https://plotly.com/javascript/getting-started/
// https://plotly.com/javascript/plotlyjs-function-reference/#plotlynewplot

looker.plugins.visualizations.add({
  // Options for user to choose in the "edit" part of looker vis
  // In this example, whether the plot is bar or scatter
  options: { 
    plot_type: {
      type: "string",
      label: "Plot type",
      values: [
        {"Scatter": "scatter"},
        {"Bar": "bar"},
      ],
      display: "radio",
      default: "scatter"
    },
    mode_type: {
      type: "string",
      label: "Mode type",
      values: [
        {"Markers": "markers"},
        {"Lines": "lines"},
        {"Markers & Lines": "markers+lines"},
      ],
      display: "radio",
      default: "markers"
    },
    error_bands: {
      type: "boolean",
      label: "Error bars?",
      default: false,
    },
    xaxis_label: {
      type: "string",
      label: "x axis label",
    },
    yaxis_label: {
      type: "string",
      label: "y axis label",
    },
    inverse_log: {
      type: "boolean",
      label: "Scale y by inverse log",
      default: false,
    }
  },

  // Set up the initial state of the visualization
  create: function(element, config) { 

    // import scripts to allow math operations
    var mathjs_script = document.createElement("script");
    mathjs_script.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.4.0/math.js";
    mathjs_script.type = "text/javascript";
    // import scripts to build that vis
    var plotly_script = document.createElement("script");
    plotly_script.src = "https://cdn.plot.ly/plotly-2.14.0.min.js";
    plotly_script.type = "text/javascript";
    
    // load these scripts first
    window.scriptLoad = Promise.all([
      new Promise(load => mathjs_script.onload = load),
      new Promise(load => plotly_script.onload = load),
    ])
    
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

  // Update everytime data/settings change
  updateAsync: function(data, element, config, queryResponse, details, done) { 

    // Clear errors from previous updates
    this.clearErrors();
    console.log(queryResponse) // see everything that is returned by Looker - just for debugging

    dim_names = []; for (i of queryResponse.fields.dimensions) { dim_names.push(i['name']) }
    mes_names = []; for (i of queryResponse.fields.measures) { mes_names.push(i['name']) }

    // Throw errors and exit if the shape of the data isn't what this chart requires
    if (dim_names.length < 1 || mes_names.length < 1) {
      this.addError({title: "< 1 dimensions or measures.", message: "This chart requires at least two fields!"}); // error
      return; // exit
    }
    
    window.scriptLoad.then(() => { // Do this first to ensure js loads in time
      
      var dim = queryResponse.fields.dimensions[0] // get first dimension name
      var mea = [queryResponse.fields.measures[0]] // get first measure name

      if (config.error_bands == true) {
          try {
              mea.push(queryResponse.fields.table_calculations[1])
              mea.push(queryResponse.fields.table_calculations[2])
              var y_lb = []; var y_ub = [];
          } 
          catch {
              this.addError({title: "Not enough measures", message: "Need to have at least 3 measures to add error bands"});
          }
      }

      var x = []; var y = [];
      for(var row of data) { // for each row in data, append to array
        x.push(row[dim.name].value);
        y.push(row[mea[0].name].value);
        if (mea.size > 1) {
            y_lb.push(row[mea[1].name].value)
            y_ub.push(row[mea[2].name].value)
        }
      }

      console.log(x[1])
      console.log(y[1])

      if (config.error_bands == true) {console.log(y_lb[2]); console.log(y_ub[2])}

      if (config.xaxis_label) { xaxis_label = config.xaxis_label} 
      else { xaxis_label = dim.field_group_label }

      if (config.yaxis_label) { yaxis_label = config.yaxis_label} 
      else { yaxis_label = mea[0].field_group_label }

      plotly_data = {  
        x: x,
        y: y,
        type: config.plot_type, // Set the type to the user-selected graph type
        mode: config.mode_type
      }

      if (config.error_bands == true) {
          plotly_data['error_y'] = {
              type: 'data',
              symmetric: false,
              array: y_ub,
              arrayminus: y_lb
            }
      }

      layout = {
        margin: { t: 0 },
        title: 'Click Here to Edit Chart Title',
        xaxis : {title: {text: xaxis_label}},
        yaxis : {title: {text: yaxis_label}},
      }

      if (config.inverse_log == true) {

        // create scaled version of y
        y_m = math.multiply( math.log10( 
          math.add( // equivalent to 1-y
              1,
              math.multiply( 
                math.matrix(y), // convert y to mathjs vector
                -1
                )
              )
            ),
          -1)
        
        // Set hover-text with original value of y
        plotly_data['text'] = y
        plotly_data['hovertemplate'] = '<b>%{text}</b>'
        // Overwrite y with scaled y
        plotly_data['y'] = y_m._data
        
        // Overide yaxis labels
        layout['yaxis'] = {
          title: {text: yaxis_label},
          tickmode: 'array',
          tickvals: [0,1,2,3],
          ticktext: [0,0.9,0.99,0.999],
          range: [0,3.1]
        }

      }

      config = {
        // editable: true, // allow user to edit axes by clicking on them
        responsive: true
      }
      
      Plotly.newPlot( // use plotly library
        this.plotly_bit, // graphDiv
        [plotly_data],
        layout,
        config
      )
      
    })

    // Let Looker know rendering is complete
    done()
  }
});