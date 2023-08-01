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
    scatter_mode: {
      type: "string",
      label: "Plot type detail: scatter mode",
      values: [
        {"Markers": "markers"},
        {"Lines": "lines"},
        {"Markers & Lines": "markers+lines"},
      ],
      display: "radio",
      default: "markers"
    },
    bar_mode: {
      type: "string",
      label: "Plot type detail: bar mode",
      values: [
        {"Grouped": "group"},
        {"Stacked": "stack"},
      ],
      display: "radio",
      default: "markers"
    },
    error_bands: {
      type: "boolean",
      label: "Add error bars?",
      default: false,
    },
    value_labels: {
      type: "boolean",
      label: "Labels: annotate?",
      default: false,
    },
    show_legend: {
      type: "boolean",
      label: "Show Legend?",
      default: true,
    },
    xaxis_label: {
      type: "string",
      label: "x axis: label",
    },
    yaxis_label: {
      type: "string",
      label: "y axis: label",
    },
    xaxis_lim: {
      type: "string",
      label: "x axis: manual limits (comma delimited)",
    },
    yaxis_lim: {
      type: "string",
      label: "y axis: manual limits (comma delimited)",
    },
    xaxis_hover_format: {
      type: "string",
      label: "x axis: manual format hover values",
    },
    yaxis_hover_format: {
      type: "string",
      label: "y axis: manual format hover values",
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

    let dim_names = queryResponse.fields.dimensions.map(d => d.name)
    var mes_names = queryResponse.fields.measures.map(m => m.name)
    var mes_names = mes_names.concat(queryResponse.fields.table_calculations.map(t => t.name)) // add table calcs to measures
    
    var mes_labels = queryResponse.fields.measures.map(m => m.label_short)
    var mes_labels = mes_labels.concat(queryResponse.fields.table_calculations.map(t => t.label_short)) // get labels for nice formatting


    if (queryResponse.fields.pivots.length > 0) {
        var piv_keys = queryResponse.pivots.map(p => p.key)
    }

    // Throw errors and exit if the shape of the data isn't what this chart requires
    if (dim_names.length < 1 || mes_names.length < 1) {
      this.addError({title: "< 1 dimensions or measures.", message: "This chart requires at least two fields!"}); // error
      return; // exit
    }
    
    window.scriptLoad.then(() => { // Do this first to ensure js loads in time

      var x = [], x_r = [], y = [], y_r = [], y_lab = [];
      for (var row of data) {
        x.push(dim_names.map(d => row[d].value).flat())
        x_r.push(dim_names.map(d => row[d].html).flat())
        if (piv_keys) {
          y.push(piv_keys.map(p => mes_names.map(m => row[m][p].value)).flat())
          y_r.push(piv_keys.map(p => mes_names.map(m => row[m][p].html)).flat())
        } else {
          y.push(mes_names.map(m => row[m].value).flat())
          y_r.push(mes_names.map(m => row[m].html).flat())
        }
      }

      if (config.xaxis_label) { xaxis_label = config.xaxis_label} 
      else { xaxis_label = queryResponse.fields.dimensions[0].label_short } // label axes

      if (config.yaxis_label) { yaxis_label = config.yaxis_label} 
      else { yaxis_label = queryResponse.fields.measures[0].label_short } // label axes
      
      plotly_data = []
      legend_labels = [] 
      if (piv_keys) {
        for (var p of piv_keys) { for (var m of mes_labels) { legend_labels.push(p.replace('|FIELD|','').concat(' | ', m)) } }
      } else {
        for (var m of mes_labels) { legend_labels.push(m) }
      }

      if (config.plot_type == 'scatter') {
          var mode_type = config.scatter_mode
      } else {
          var mode_type = config.bar_mode
      }
      
      for (var i = 0; i < y[0].length; i++) {
        
        var hovertemplate = "<b>%{xaxis.title.text}: </b> <br>%{x} <br>" + "<br>" + "<b>%{fullData.name}: </b> <br>%{text} <extra></extra>"
        if (config.xaxis_hover_format) { hovertemplate = hovertemplate.replace("%{x}", "%{x:" + config.xaxis_hover_format + "}") }
        if (config.yaxis_hover_format) { hovertemplate = hovertemplate.replace("%{text}", "%{y:" + config.yaxis_hover_format + "}") }
        
        var new_trace = {
          x: x.map(row => row[0]),
          y: y.map(row => row[i]),
          type: config.plot_type,
          mode: mode_type,
          name: legend_labels[i],
          text: y_r.map(row => row[i]),
          hovertemplate: hovertemplate,
        }
        if (config.value_labels == true) {
          new_trace['textposition'] = 'top'
        }
        if (config.error_bands == true) {
            new_trace['error_y'] = {
                type: 'data',
                symmetric: false,
                array: y.map(row => row[i+2]),
                arrayminus: y.map(row => row[i+1]),
              }
            i = i + 2
        }
        plotly_data.push(new_trace)
      }

      console.log(plotly_data)

      layout = {
        margin: { t: 0 },
        title: 'Click Here to Edit Chart Title',
        xaxis : {title: {text: xaxis_label}},
        yaxis : {title: {text: yaxis_label}},
        showlegend: config.show_legend,
        legend: {"orientation": "h"},
        colorway : ['#f3cec9', '#e7a4b6', '#cd7eaf', '#a262a9', '#6f4d96', '#3d3b72', '#182844']
      }

      if (config.plot_type == 'bar') {
        layout['barmode'] = mode_type
      }

      if (config.xaxis_lim) {var xlim = config.xaxis_lim.split(","); layout['xaxis']['range'] = [Number(xlim[0]), Number(xlim[1])]}
      if (config.yaxis_lim) {var ylim = config.yaxis_lim.split(","); layout['yaxis']['range'] = [Number(ylim[0]), Number(ylim[1])]}
      // if (config.xaxis_hover_format) {layout['xaxis']['hoverformat'] = config.xaxis_hover_format};
      // if (config.yaxis_hover_format) {layout['yaxis']['hoverformat'] = config.yaxis_hover_format};
      
      if (config.inverse_log == true) {

        y = y.map(row => row[0])

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
        plotly_data = [plotly_data[0]]
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
        plotly_data,
        layout,
        config
      )
      
    })

    // Let Looker know rendering is complete
    done()
  }
});
