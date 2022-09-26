// https://github.com/looker-open-source/custom_visualizations_v2/blob/master/docs/api_reference.md
// https://plotly.com/javascript/getting-started/
// https://plotly.com/javascript/plotlyjs-function-reference/#plotlynewplot

looker.plugins.visualizations.add({

    options: { 
      video_src: {
        type: "string",
        label: "Video link",
      },
      video_start_at: {
        type: "string",
        label: "Video start at (s)",
        default: 30
      },
    },
  
    // Set up the initial state of the visualization
    create: function(element, config) { 

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
      this.video_bit = container;    
  
    },
  
    
    updateAsync: function(data, element, config, queryResponse, details, done) { // Update everytime data/settings change
  
      // Clear errors from previous updates
      this.clearErrors();
  
      // Throw errors and exit if the shape of the data isn't what this chart requires
      if (queryResponse.fields.dimensions.length == 0) {
        this.addError({title: "No Dimensions", message: "This chart requires dimensions."}); // error
        return; // exit
      }
      
       vid = "<video id ='video_id' controls autoplay > <source src="
       vid = vid.concat(config.video_src)
       vid = vid.concat(' type="video/mp4"></video>')

       this.video_bit.innerHTML = vid
       
       document.getElementById("video_id").currentTime = config.video_start_at;
           
      // Let Looker know rendering is complete
      done()
    }
  });