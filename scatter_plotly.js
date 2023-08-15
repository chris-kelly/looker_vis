// https://github.com/looker-open-source/custom_visualizations_v2/blob/master/docs/api_reference.md
// https://plotly.com/javascript/getting-started/
// https://plotly.com/javascript/plotlyjs-function-reference/#plotlynewplot

looker.plugins.visualizations.add({
  // Options for user to choose in the "edit" part of looker vis
  options: { 
    num_traces: { type: "number", label: "# traces", order: 0, default: 1, section: "Data"}
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

    window.scriptLoad.then(() => { // Do this first to ensure js loads in time

      ////////////////////////////////////////
      // Get data to populate config:
      ////////////////////////////////////////
      
      function get_pretty_cols(d) {
        if (d.hasOwnProperty('label_short')) { result = d.label_short } else { result = d.label }
        return result
      }

      let cols = [{'-': ""}]
      queryResponse.fields.dimension_like.forEach(x => {d={};d[get_pretty_cols(x)]=x.name; cols.push(d)})
      queryResponse.fields.measure_like.forEach(x => {d={}; d[get_pretty_cols(x)]=x.name; cols.push(d)})
      let colors = ['#56B9D0','#636076','#4A70FC','#9EEBDD']
      let xax = new Set(), yax = new Set()

      const options = { ...this.options };
      options['gti_'] = {type: "string", label: "Graph title", section: 'Style', default: "", order: 0}
      for (let i = 0; i < config.num_traces; i++) {
        let iN = i.toString(), iN2 = (i+1).toString();
        options["div_" + iN] = {label: "<---------- Trace " + iN2 + " ---------->", order: 11*i+1, type: "string", display: "divider", section: "Data"}
        options["x_" + iN] = {label: "Trace " + iN2 + ": x", order: 11*i+2, type: "string", display: "select", display_size: "third", values: cols, section: "Data"}
        options["y_" + iN] = {label: "Trace " + iN2 + ": y", order: 11*i+3, type: "string", display: "select", display_size: "third", values: cols, section: "Data"}
        
        options["d_" + iN] = {label: "Options " + iN2, order: 11*i+4, type: "string", display: "select", display_size: "third", values: [{'Simple':'simple'},{'Detailed':'detailed'}], default: "simple", section: "Data"}
        
        options["div2_" + iN] = {label: "<---------- Trace " + iN2 + " ---------->", order: 9*i+1, type: "string", display: "divider", section: "Series"}
        options["mod_" + iN] = {label: "Scatter mode " + iN2, order: 9*i+2, type: "string", display: "select", values: [{'Markers':'markers'},{'Lines':'lines'},{'Markers & Lines':'markers+lines'}], default: "markers", section: "Series"}
        options["xax_" + iN] = {label: "x axis " + iN2, order: 9*i+3, type: "string", display: "select", display_size: "half", values: [{"1":"x1"},{"2":"x2"},{"3":"x3"},{"4":"x4"}], default:"x1" , section: "Series"}
        options["yax_" + iN] = {label: "y axis " + iN2, order: 9*i+4, type: "string", display: "select", display_size: "half", values: [{"1":"y1"},{"2":"y2"},{"3":"y3"},{"4":"y4"}], default:"y1" , section: "Series"}
        xax.add(config["xax_" + iN]); yax.add(config["yax_" + iN]);
        options["col_" + iN] = {label: "Colour " + iN2, order: 9*i+5, type: "string", display: "color", section: "Series"}
        options["tn_" + iN] = {label: "Name includes " + iN2, order: 9*i+6, type: "string", display: "select", values: [{'-':""},{'x':'x'},{'y':'y'},{'x+y':'x+y'}], section: "Series", default: ""}
        
        if(config["d_" + iN] == "detailed") {
          options["xlb_" + iN] = {label: "x lower bound " + iN2, order: 11*i+5, type: "string", display: "select", display_size: "half", values: cols, default:"" , section: "Data"}
          options["xub_" + iN] = {label: "x upper bound " + iN2, order: 11*i+6, type: "string", display: "select", display_size: "half", values: cols, default:"" , section: "Data"}
          options["ylb_" + iN] = {label: "y lower bound " + iN2, order: 11*i+7, type: "string", display: "select", display_size: "half", values: cols, default:"" , section: "Data"}
          options["yub_" + iN] = {label: "y upper bound " + iN2, order: 11*i+8, type: "string", display: "select", display_size: "half", values: cols, default:"" , section: "Data"}
          options["ltx_" + iN] = {label: "Custom labels " + iN2, order: 11*i+9, type: "string", display: "select", display_size: "half", values: cols, default:"" , section: "Data"}
          options["htx_" + iN] = {label: "Custom hovertext " + iN2, order: 11*i+10, type: "string", display: "select", display_size: "half", values: cols, default:"" , section: "Data"}
        } else {
          delete options["xlb_" + iN]; delete options["xub_" + iN]; delete options["ylb_" + iN]; delete options["yub_" + iN]; delete options["ltx_" + iN]; delete options["htx_" + iN];
        }
        if(config["ltx_" + iN] && config["ltx_" + iN] != "") {
          options["vvp_" + iN] = {label: "Value vertical pos " + iN2, order: 9*i+7, type: "string", display: "select", display_size: "half", values: [{"Top": "top"},{"Centre": "middle"},{"Bottom": "bottom"}], default: "middle" , section: "Series"}
          options["vhp_" + iN] = {label: "Value horizontal pos " + iN2, order: 9*i+8, type: "string", display: "select", display_size: "half", values: [{"Left": "left"},{"Centre": "center"},{"Right": "right"}], default: "center" , section: "Series"}
        } else {
          delete options["vvp_" + iN]; delete options["vhp_" + iN];
        }
        try {options["x_" + iN].default = queryResponse.fields.dimension_like[0].name} catch(err) {options["x_" + iN].default = Object.values(cols[0])}
        try {options["y_" + iN].default = queryResponse.fields.measure_like[i].name} catch(err) {options["y_" + iN].default = Object.values(cols[0])}
        try {options["col_" + iN].default = colors[i]} catch(err) {options["col_" + iN].default = colors[0]}
      }
      var i = 0;
      for (xa of [...xax.values()]) { 
        options["xdiv_" + xa] = {label: "<---------- " + ya + " axis style ---------->", type: "divider", section: "Style", default: "", order: i*11+1}
        options["xaxt_" + xa] = {label: xa + " axis title", type: "string", section: "Style", default: "", order: i*11+2}
        options["xaxs_" + xa] = {label: xa + " axis side ", type: "string", section: "Style", values: [{"Top": "top", "Bottom": "bottom"}], default: "bottom", order: i*11+3, display: "select", display_size: "third"}
        options["xaxl_" + xa] = {label: xa + " axis min", type: "number", section: "Style", order: i*11+4, display_size: "third"}
        options["xaxu_" + xa] = {label: xa + " axis max", type: "number", section: "Style", order: i*11+5, display_size: "third"}
      }
      for (ya of [...yax.values()]) {  
        options["ydiv_" + xa] = {label: "<---------- " + ya + " axis style ---------->", type: "divider", section: "Style", default: "", order: i*11+6}
        options["yaxt_" + xa] = {label: ya + " axis title", type: "string", section: "Style", default: "", order: i*11+7}
        options["yaxs_" + xa] = {label: ya + " axis side ", type: "string", section: "Style", values: [{"Left": "left", "Right": "right"}], default: "left", order: i*11+8, display_size: "third"}
        options["yaxl_" + xa] = {label: ya + " axis min", type: "number", section: "Style", order: i*11+9, display_size: "third"}
        options["yaxu_" + xa] = {label: ya + " axis max", type: "number", section: "Style", order: i*11+10, display_size: "third"}
      }
      for (i of [...Object.keys(options)]) {
        if (i.substring(0,4) == "div_" && parseInt(i.substring(4)) >= config.num_traces) { let iN = parseInt(i.substring(4)); delete options["div_" + iN]; delete options["x_" + iN]; delete options["y_" + iN];}
      }
      console.log(options)
      this.trigger('registerOptions', options)
      console.log(config)

      ////////////////////////////////////////
      // Get data in nice format:
      ////////////////////////////////////////    

      console.log(queryResponse)

      // adapt column keys to get nicely formatted data in one string
      function colname_format(field) {
        var k = field.join(' ~ ').replace('|FIELD|',' | ').replace('$$$_row_total_$$$', 'ROW TOTAL')
        return k
      }
        
      // Get column names and metadata
      var dim_names = queryResponse.fields.dimension_like.map(d => [d.name, get_pretty_cols(d)]) // retrieve both dimensions and non-pivotable table calcs, with nice labels too
      var dimN = dim_names.map(d => d[0]), dimL = dim_names.map(d => d[1]);
      var mes_names = queryResponse.fields.measure_like.map(m => [m.name, get_pretty_cols(m)]) // retrieve both measures and pivotable table calcs, with nice labels too
      var mesN = mes_names.map(m => m[0]), mesL = mes_names.map(m => m[1]);
      if (queryResponse.fields.pivots.length > 0) { var pivK = queryResponse.pivots.map(p => p.key) } // get pivot column names
        
      let nicedata = new Map(), row0 = data[0] // use first row of data as blueprint. Use Map for multiple keys
      for (var k of Object.keys(row0)) {
        if (row0[k].hasOwnProperty('value')) { 
          // simply add keys of column if no pivot. Add name and "Label_short" or "label" data.
          if (dimN.includes(k)) { nicedata.set([k], {'keys': [k], 'type': 'dimension', 'label': dimL[dimN.indexOf(k)] }) }
          if (mesN.includes(k)) { nicedata.set([k], {'keys': [k], 'type': 'measure', 'label': mesL[mesN.indexOf(k)] }) }
        } else { 
          if (mesN.includes(k)) { // data includes hidden columns! So don't include these
            var rowS = row0[k]; // the pivot (k2) is nested below each measure (k) in the data. Split these into seperate columns
            for (var k2 of Object.keys(rowS)) {
              if (k2 != '$$$_row_total_$$$') { // data may include row totals. Exclude for now
                nicedata.set([k,k2], {'keys': [k,k2], 'type': 'pivot + measure', 'label': colname_format([k2, mesL[mesN.indexOf(k)]]) })
              }
            }
          }
        }
      }

      // make nice dict of values and another of labels/text
      function get_pretty_data(d) {
        if (d.hasOwnProperty('html')) { result = d.html } 
        else if (d.hasOwnProperty('rendered')) { result = d.rendered } 
        else { result = d.value }
        return result
      }
      for (var k of [ ...nicedata.keys() ]) {
        nicedata.set(k,{... nicedata.get(k), 
          'values': data.map(row => k.length == 1 ? row[k[0]].value : row[k[0]][k[1]].value), // if two cols (due to pivot), i.e. length > 1, go into level below
          'pretty': data.map(row => k.length == 1 ? get_pretty_data(row[k[0]]) : get_pretty_data(row[k[0]][k[1]]))
        })
      }
      console.log(nicedata)

      ////////////////////////////////////////
      // Make plotly data
      ////////////////////////////////////////    

      // Loop over every measure and add as new trace
      plotly_data = []
      
      for (let i = 0; i < config.num_traces; i++) {

        let iN = i.toString()
        let xname = config["x_" + iN]
        let yname = config["y_" + iN]
        
        
        for (var l of [...nicedata.keys()].filter(x => x[0] == xname)) {
          let x = nicedata.get(l)

          for (var j of [...nicedata.keys()].filter(y => y[0] == yname)) {
            let y = nicedata.get(j)

            // name made up of either x, y, or x & y
            var tname = []
            if (config['tn_'+ iN].includes('x')) {tname.push(x.label)}
            if (config['tn_'+ iN].includes('y')) {tname.push(y.label)}
            tname = colname_format(tname)

            var new_trace = {
              x: x.values,
              y: y.values,
              type: 'scatter',
              mode: config["mod_" + iN],
              name: tname,
              text: y.pretty,
              xaxis: config['xax_'+ iN],
              yaxis: config['yax_'+ iN],
              // textposition: "none",
              // hovertemplate: hovertemplate,
            }

            // Add error bars (x axis)
            if (config["xlb_" + iN] && config["xlb_" + iN] && config["xlb_" + iN] != "" && config["xub_" + iN] != "") {
              let lb = l.length == 1 ? [...nicedata.entries()].find(x => x[1]['keys'][0] == config["xlb_" + iN]) : [...nicedata.entries()].find(x => x[1].keys[0] == config["xlb_" + iN] && x[1].keys[1] == l[1])
              let ub = l.length == 1 ? [...nicedata.entries()].find(x => x[1]['keys'][0] == config["xub_" + iN]) : [...nicedata.entries()].find(x => x[1].keys[0] == config["xub_" + iN] && x[1].keys[1] == l[1])
              new_trace['error_x'] = {
                type: 'data', 
                symmetric: false,
                array: ub[1].values,
                arrayminus: lb[1].values,
              }
            }

            // Add error bars (y axis)
            if (config["ylb_" + iN] && config["yub_" + iN] && config["ylb_" + iN] != "" && config["yub_" + iN] != "") {
              let lb = j.length == 1 ? [...nicedata.entries()].find(x => x[1]['keys'][0] == config["ylb_" + iN]) : [...nicedata.entries()].find(x => x[1].keys[0] == config["ylb_" + iN] && x[1].keys[1] == j[1])
              let ub = j.length == 1 ? [...nicedata.entries()].find(x => x[1]['keys'][0] == config["yub_" + iN]) : [...nicedata.entries()].find(x => x[1].keys[0] == config["yub_" + iN] && x[1].keys[1] == j[1])
              new_trace['error_y'] = {
                type: 'data', 
                symmetric: false,
                array: ub[1].values,
                arrayminus: lb[1].values,
              }
            }
            plotly_data.push(new_trace)

          }

        }
      
      }

      console.log(plotly_data)

      Plotly.newPlot( // use plotly library
        this.plotly_bit, // graphDiv
        plotly_data,
        // layout,
        // {responsive: true}
      )
        
        
      //   var hovertemplate = "<b>%{xaxis.title.text}: </b> <br>%{x} <br>" + "<br>" + "<b>%{fullData.name}: </b> <br>%{text} <extra></extra>"
      //   if (config.xaxis_hover_format) { hovertemplate = hovertemplate.replace("%{x}", "%{x:" + config.xaxis_hover_format + "}") }
      //   if (config.yaxis_hover_format) { hovertemplate = hovertemplate.replace("%{text}", "%{y:" + config.yaxis_hover_format + "}") }
      //   if (config.custom_hover_format) { hovertemplate = "%{text} <extra></extra>" }

      //   var new_trace = {
      //     x: x.map(row => row[0]),
      //     y: y.map(row => row[i]),
      //     type: config.plot_type,
      //     mode: mode_type,
      //     name: legend_labels[i],
      //     text: y_r.map(row => row[i]),
      //     textposition: "none",
      //     hovertemplate: hovertemplate,
      //   }
      //   if (config.value_labels) {
      //     if (config.plot_type == 'scatter') {
      //       new_trace['mode'] = new_trace.mode + "+text"; new_trace['textposition'] = config.value_labels_pos_v + " " + config.value_labels_pos_h 
      //     } else {
      //       new_trace['textposition'] = config.value_labels_pos_b
      //     }
      //   } // Show values
      //   if (config.value_labels_format) { new_trace['texttemplate'] = "%{y:" + config.value_labels_format + "}" }
      //   if (config.error_bands == true) { // if error bands, make every 2nd and 3rd column an error bar
      //       new_trace['error_y'] = {
      //           type: 'data',
      //           symmetric: false,
      //           array: y.map(row => row[i+2]),
      //           arrayminus: y.map(row => row[i+1]),
      //       }
      //       i = i + 2
      //   }
      //   plotly_data.push(new_trace)
      // }

      // console.log(plotly_data) // for debugging

      // // set layout
      // if (config.xaxis_label) { xaxis_label = config.xaxis_label} // label axes
      // else { xaxis_label = get_pretty_labels(queryResponse.fields.dimensions[0]) } 
      // if (config.yaxis_label) { yaxis_label = config.yaxis_label} 
      // else { yaxis_label = get_pretty_labels(queryResponse.fields.measures[0]) } // label axes

      // // set colours
      // if (config.colorPreSet  == 'c') { var colorSettings =  config.colorRange || ['#f3cec9', '#e7a4b6', '#cd7eaf', '#a262a9', '#6f4d96', '#3d3b72', '#182844'] }// put a default in
      // else { var colorSettings =  config.colorPreSet.split(",");}

      // layout = {
      //   margin: { 
      //     l: parseInt(config.margins.split(',')[0]),
      //     r: parseInt(config.margins.split(',')[1]),
      //     b: parseInt(config.margins.split(',')[2]),
      //     t: parseInt(config.margins.split(',')[3]),
      //     pad: parseInt(config.margins.split(',')[4]),
      //   },
      //   title: config.graph_title,
      //   xaxis : {title: {text: xaxis_label}, automargin: true},
      //   yaxis : {title: {text: yaxis_label}, automargin: true},
      //   showlegend: false,
      //   colorway : colorSettings
      // }

      // // Show legend and set orientation
      // if (config.show_legend != "z") { layout['showlegend'] = true; layout['legend'] = {"orientation": config.show_legend} }

      // // set barmode is bar selected
      // if (config.plot_type == 'bar') { layout['barmode'] = mode_type}

      // // set limits for y and x axis
      // if (config.xaxis_lim) {var xlim = config.xaxis_lim.split(","); layout['xaxis']['range'] = [Number(xlim[0]), Number(xlim[1])]}
      // if (config.yaxis_lim) {var ylim = config.yaxis_lim.split(","); layout['yaxis']['range'] = [Number(ylim[0]), Number(ylim[1])]}
      
      // if (config.swap_axes) {
      //   for (var i = 0; i < plotly_data.length; i++) {
      //     x = structuredClone(plotly_data[i]['x'])
      //     y = structuredClone(plotly_data[i]['y'])
      //     plotly_data[i]['x'] = y
      //     plotly_data[i]['y'] = x
      //     plotly_data[i]['error_x'] = structuredClone(plotly_data[i]['error_y'])
      //     delete plotly_data[i].error_y
      //   }
      //   xaxis = structuredClone(layout['xaxis'])
      //   yaxis = structuredClone(layout['yaxis'])
      //   layout['yaxis'] = xaxis
      //   layout['xaxis'] = yaxis
      // }

      // // Function to do inverse log
      // if (config.inverse_log == true) {

      //   yn = y.map(row => row[0])
      //   // create scaled version of y
      //   y_m = math.multiply( math.log10( 
      //     math.add( // equivalent to 1-y
      //         1,
      //         math.multiply( 
      //           math.matrix(yn), // convert y to mathjs vector
      //           -1
      //           )
      //         )
      //       ),
      //     -1)
        
      //   // Set hover-text with original value of y
      //   plotly_data = plotly_data[0]
      //   plotly_data['text'] = y
      //   plotly_data['hovertemplate'] = '<b>%{text}</b>'
      //   plotly_data['y'] = y_m._data // Overwrite y with scaled y
      //   plotly_data = [plotly_data]
        
      //   // Overide yaxis labels
      //   layout['yaxis'] = {
      //     title: {text: yaxis_label},
      //     tickmode: 'array',
      //     tickvals: [0,1,2,3],
      //     ticktext: [0,0.9,0.99,0.999],
      //     range: [0,3.1]
      //   }

      // }

      // config = {
      //   responsive: true // editable: true, // allow user to edit axes by clicking on them
      // }
      
      // Plotly.newPlot( // use plotly library
      //   this.plotly_bit, // graphDiv
      //   plotly_data,
      //   layout,
      //   config
      // )
      
    })

    // Let Looker know rendering is complete
    done()
  }
});
