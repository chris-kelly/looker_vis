looker.plugins.visualizations.add({

    options: { 
      video_src: {
        type: "string",
        label: "Video link",
      },
      video_start_at_1: {
        type: "string",
        label: "Video start at (s)",
        default: 30
      },
      video_start_at_2: {
        type: "string",
        label: "Video start at (s)",
        default: 200
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

      // console.log(data)

      api_url = data[0]['trials_denormalised.video_url']['value']

      // console.log(api_url)

      fetch_url = async() => {
        response = await fetch(api_url);
        myJson = await response.json(); // extract JSON from the http response
        return(myJson)
      }

      vid = "<video id ='video_id' controls autoplay > <source src="
      vid = vid.concat('')
      vid = vid.concat(' type="video/mp4"></video>')

      this.video_bit.innerHTML = vid

      fetch_url().then(
        function(value) {
          console.log(value)
          vid_url = value['camera_video_urls']['front-forward']
          video = document.getElementById('video_id');
          video.setAttribute('src', vid_url);
        },
        function(value) {console.log('API failed :(')}
      )

      // vid_url = data[0]['trials_denormalised.video_url_2']['value']
      
      // vid = "<video id ='video_id' controls autoplay > <source src="
      // vid = vid.concat(config.video_src)
      // vid = vid.concat(' type="video/mp4"></video>')

      // vid2 = "<video id ='video_id2' controls autoplay > <source src="
      // vid2 = vid2.concat(config.video_src)
      // // vid2 = vid2.concat(vid_url)
      // vid2 = vid2.concat(' type="video/mp4"></video>')

      // this.video_bit.innerHTML = vid.concat(vid2)
       
      //  document.getElementById("video_id").currentTime = config.video_start_at_1;
      //  document.getElementById("video_id2").currentTime = config.video_start_at_2;
           
      // Let Looker know rendering is complete
      done()
    }
  });