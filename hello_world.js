// https://github.com/looker-open-source/custom_visualizations_v2/blob/master/docs/api_reference.md
// https://plotly.com/javascript/getting-started/
// https://plotly.com/javascript/plotlyjs-function-reference/#plotlynewplot

looker.plugins.visualizations.add({
  // Options for user to choose in the "edit" part of looker vis
  // In this example, whether the plot is bar or scatter
  options: { 
    // title: {
    //   type: "string",
    //   label: "1. Chart title",
    // },
    plot_type: {
      type: "string",
      label: "Plot",
      values: [
        {"Scatter": "scatter"},
        {"Bar": "bar"},
      ],
      display: "radio",
      default: "scatter",
      section: '1. Plot',
      order: 1
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
      default: "markers",
      section: '1. Plot',
      order: 2
    },
    bar_mode: {
      type: "string",
      label: "Plot type detail: bar mode",
      values: [
        {"Grouped": "group"},
        {"Stacked": "stack"},
      ],
      display: "radio",
      default: "markers",
      section: '1. Plot',
      order: 3
    },
    swap_axes: {
      type: "boolean",
      label: "Swap X and Y",
      default: false,
      section: '1. Plot',
      order: 4
    },
    error_bands: {
      type: "boolean",
      label: "Add error bars? (LB/UB is every 2nd/3rd col)",
      default: false,
      section: '1. Plot',
      order: 5
    },
    inverse_log: {
      type: "boolean",
      label: "Scale y by inverse log? (Non-pivot only)",
      default: false,
      section: '1. Plot',
      order: 6
    },
    show_legend: {
      type: "string",
      label: "Legend options",
      values: [
        {"Hide": "z"},
        {"Horizontal": "h"},
        {"Vertical": "v"},
      ],
      display: "select",
      default: "z",
      section: '1. Plot',
      order: 7
    },
    value_labels: {
      type: "boolean",
      label: "Value labels?",
      default: false,
      section: '2. Values',
      order: 1,
    },
    value_labels_pos_v: {
      type: "string",
      label: "Vertical position",
      values: [
        {"Top": "top"},
        {"Centre": "middle"},
        {"Bottom": "bottom"},
      ],
      display: "select",
      default: "middle",
      section: '2. Values',
      display_size: 'third',
      order: 2,
      
    },
    value_labels_pos_h: {
      type: "string",
      label: "Horizontal position",
      values: [
        {"Left": "left"},
        {"Centre": "center"},
        {"Right": "right"},
      ],
      display: "select",
      default: "center",
      section: '2. Values',
      display_size: 'third',
      order: 3,
    },
    value_labels_pos_b: {
      type: "string",
      label: "Position in/out of bar",
      values: [
        {"Inside": "inside"},
        {"Outside": "outside"},
      ],
      display: "select",
      default: "inside",
      section: '2. Values',
      display_size: 'third',
      order: 4,
    },
    value_labels_format: {
      type: "string",
      label: "Custom format",
      placeholder: "e.g. .2f",
      section: '2. Values',
      order: 5
    },
    graph_title: {
      type: "string",
      label: "x axis title",
      section: '3. Style',
      default: "",
      order: 1,
    },
    xaxis_label: {
      type: "string",
      label: "x axis title",
      section: '3. Style',
      order: 2
    },
    yaxis_label: {
      type: "string",
      label: "y axis title",
      section: '3. Style',
      order: 3
    },
    xaxis_lim: {
      type: "string",
      label: "x axis range (comma delim)",
      section: '3. Style',
      order: 4,
      display_size: 'half',
    },
    yaxis_lim: {
      type: "string",
      label: "y axis range (comma delim)",
      section: '3. Style',
      order: 5,
      display_size: 'half',
    },
    xaxis_hover_format: {
      type: "string",
      label: "Custom hover format (x)",
      placeholder: "e.g. %d-%b",
      section: '3. Style',
      order: 6,
      display_size: 'half',
    },
    yaxis_hover_format: {
      type: "string",
      label: "Custom hover format (y)",
      placeholder: "e.g. .2f",
      section: '3. Style',
      order: 7,
      display_size: 'half',
    },
    custom_hover_format: {
      type: "string",
      label: "Custom hover field",
      placeholder: "Insert column name",
      section: '3. Style',
      order: 8,
    },
    colorPreSet: {
      type: 'string',
      display: 'select',
      label: 'Color Range',
      section: '3. Style',
      values: [
        {'Default': 'c'},
        {'Tomato to Steel Blue': '#F16358,#DF645F,#CD6566,#BB666D,#A96774,#97687B,#856982,#736A89,#616B90,#4F6C97,#3D6D9E'},
        {'Pink to Black': '#170108, #300211, #49031A, #620423, #79052B, #910734, #AA083D, #C30946, #DA0A4E, #F30B57, #F52368, #F63378, #F63C79, #F75389, #F86C9A, #F985AB, #FB9DBC, #FCB4CC, #FDCDDD, #FEE6EE'},
        {'Green to Red': '#7FCDAE, #7ED09C, #7DD389, #85D67C, #9AD97B, #B1DB7A, #CADF79, #E2DF78, #E5C877, #E7AF75, #EB9474, #EE7772'},
        {'White to Green': '#ffffe5,#f7fcb9 ,#d9f0a3,#addd8e,#78c679,#41ab5d,#238443,#006837,#004529'}],
        default: 'c',
        order: 9
    },
    colorRange: {
      type: 'array',
      label: 'Custom Color Ranges',
      section: '3. Style',
      order: 10,
      placeholder: '#fff, red, etc...'
    },
    margins: {
      type: 'string',
      label: 'Margins: L,R,B,T,pad (comma delim)',
      section: '3. Style',
      order: 11,
      default: "0,0,0,0,0"
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
    
    window.scriptLoad.then(() => { // Do this first to ensure js loads in time

      function get_pretty_labels(d) {
        if (d.hasOwnProperty('label_short')) { result = d.label_short } 
        else { result = d.label }
        return result
      }

      let dim_names = queryResponse.fields.dimensions.map(d => d.name) // dimension names
      var mes_names = queryResponse.fields.measures.map(m => m.name) // measure names
      var mes_names = mes_names.concat(queryResponse.fields.table_calculations.map(t => t.name)) // add table calcs to measures
      var mes_labels = queryResponse.fields.measures.map(m => get_pretty_labels(m)) // get measure labels for nice formatting
      var mes_labels = mes_labels.concat(queryResponse.fields.table_calculations.map(t => get_pretty_labels(t))) 
      if (queryResponse.fields.pivots.length > 0) { var piv_keys = queryResponse.pivots.map(p => p.key) } // get pivot names (if any)

      // Throw errors and exit if the shape of the data isn't what this chart requires
      if (dim_names.length < 1 || mes_names.length < 1) {
        this.addError({title: "< 1 dimensions or measures.", message: "This chart requires at least two fields!"}); // error
        return; // exit
      }

      // Function to try and find nicest rendered value for formatting
      function get_pretty_data(d) {
        if (d.hasOwnProperty('html')) { result = d.html } 
        else if (d.hasOwnProperty('rendered')) { result = d.rendered } 
        else { result = d.value }
        return result
      }

      // loop through rows of data, create arrays of values and rendered (pretty) data 
      var x = [], x_r = [], y = [], y_r = [];
      
      for (var row of data) {
        x.push(dim_names.map(d => row[d].value).flat())
        x_r.push(dim_names.map(d => get_pretty_data(row[d])).flat())
        if (piv_keys) { // if pivot, json has extra level, specified
          y.push(piv_keys.map(p => mes_names.map(m => row[m][p].value)).flat())
          if (config.custom_hover_format) {
            y_r.push(piv_keys.map(p => mes_names.map(m => get_pretty_data(row[config.custom_hover_format][p]))).flat())
          } else { 
            y_r.push(piv_keys.map(p => mes_names.map(m => get_pretty_data(row[m][p]))).flat()) 
          }
        } else {
          y.push(mes_names.map(m => row[m].value).flat())
          if (config.custom_hover_format) {
            y_r.push(mes_names.map(m => get_pretty_data(row[config.custom_hover_format])).flat())
          } else { 
            y_r.push(mes_names.map(m => get_pretty_data(row[m])).flat())
          }
          
        }
      }
      
      // if there are pivot keys, legend labels should include them
      legend_labels = [] 
      if (piv_keys) {
        for (var p of piv_keys) { for (var m of mes_labels) { legend_labels.push(p.replace('|FIELD|','').concat(' | ', m)) } }
      } else {
        for (var m of mes_labels) { legend_labels.push(m) }
      }
      
      if (config.plot_type == 'scatter') { var mode_type = config.scatter_mode} 
      else { var mode_type = config.bar_mode }
      
      
      // Loop over every measure and add as new trace
      plotly_data = []
      
      for (var i = 0; i < y[0].length; i++) {
        
        var hovertemplate = "<b>%{xaxis.title.text}: </b> <br>%{x} <br>" + "<br>" + "<b>%{fullData.name}: </b> <br>%{text} <extra></extra>"
        if (config.xaxis_hover_format) { hovertemplate = hovertemplate.replace("%{x}", "%{x:" + config.xaxis_hover_format + "}") }
        if (config.yaxis_hover_format) { hovertemplate = hovertemplate.replace("%{text}", "%{y:" + config.yaxis_hover_format + "}") }
        if (config.custom_hover_format) { hovertemplate = "%{text} <extra></extra>" }

        var new_trace = {
          x: x.map(row => row[0]),
          y: y.map(row => row[i]),
          type: config.plot_type,
          mode: mode_type,
          name: legend_labels[i],
          text: y_r.map(row => row[i]),
          textposition: "none",
          hovertemplate: hovertemplate,
        }
        if (config.value_labels) {
          if (config.plot_type == 'scatter') {
            new_trace['mode'] = new_trace.mode + "+text"; new_trace['textposition'] = config.value_labels_pos_v + " " + config.value_labels_pos_h 
          } else {
            new_trace['textposition'] = config.value_labels_pos_b
          }
        } // Show values
        if (config.value_labels_format) { new_trace['texttemplate'] = "%{y:" + config.value_labels_format + "}" }
        if (config.error_bands == true) { // if error bands, make every 2nd and 3rd column an error bar
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

      console.log(plotly_data) // for debugging

      // set layout
      if (config.xaxis_label) { xaxis_label = config.xaxis_label} // label axes
      else { xaxis_label = get_pretty_labels(queryResponse.fields.dimensions[0]) } 
      if (config.yaxis_label) { yaxis_label = config.yaxis_label} 
      else { yaxis_label = get_pretty_labels(queryResponse.fields.measures[0]) } // label axes

      // set colours
      if (config.colorPreSet  == 'c') { var colorSettings =  config.colorRange || ['#f3cec9', '#e7a4b6', '#cd7eaf', '#a262a9', '#6f4d96', '#3d3b72', '#182844'] }// put a default in
      else { var colorSettings =  config.colorPreSet.split(",");}

      layout = {
        margin: { 
          l: parseInt(config.margins.split(',')[0]),
          r: parseInt(config.margins.split(',')[1]),
          b: parseInt(config.margins.split(',')[2]),
          t: parseInt(config.margins.split(',')[3]),
          pad: parseInt(config.margins.split(',')[4]),
        },
        title: config.graph_title,
        xaxis : {title: {text: xaxis_label}, automargin: true},
        yaxis : {title: {text: yaxis_label}, automargin: true},
        showlegend: false,
        colorway : colorSettings
      }

      // Show legend and set orientation
      if (config.show_legend != "z") { layout['showlegend'] = true; layout['legend'] = {"orientation": config.show_legend} }

      // set barmode is bar selected
      if (config.plot_type == 'bar') { layout['barmode'] = mode_type}

      // set limits for y and x axis
      if (config.xaxis_lim) {var xlim = config.xaxis_lim.split(","); layout['xaxis']['range'] = [Number(xlim[0]), Number(xlim[1])]}
      if (config.yaxis_lim) {var ylim = config.yaxis_lim.split(","); layout['yaxis']['range'] = [Number(ylim[0]), Number(ylim[1])]}
      
      if (config.swap_axes) {
        for (var i = 0; i < plotly_data.length; i++) {
          x = structuredClone(plotly_data[i]['x'])
          y = structuredClone(plotly_data[i]['y'])
          plotly_data[i]['x'] = y
          plotly_data[i]['y'] = x
          plotly_data[i]['error_x'] = structuredClone(plotly_data[i]['error_y'])
          delete plotly_data[i].error_y
        }
        xaxis = structuredClone(layout['xaxis'])
        yaxis = structuredClone(layout['yaxis'])
        layout['yaxis'] = xaxis
        layout['xaxis'] = yaxis
      }

      // Function to do inverse log
      if (config.inverse_log == true) {

        yn = y.map(row => row[0])
        // create scaled version of y
        y_m = math.multiply( math.log10( 
          math.add( // equivalent to 1-y
              1,
              math.multiply( 
                math.matrix(yn), // convert y to mathjs vector
                -1
                )
              )
            ),
          -1)
        
        // Set hover-text with original value of y
        plotly_data = plotly_data[0]
        plotly_data['text'] = y
        plotly_data['hovertemplate'] = '<b>%{text}</b>'
        plotly_data['y'] = y_m._data // Overwrite y with scaled y
        plotly_data = [plotly_data]
        
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
        responsive: true // editable: true, // allow user to edit axes by clicking on them
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
