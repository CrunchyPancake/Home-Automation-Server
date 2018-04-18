var express = require('express')
var app = express()
var screenshot = require('desktop-screenshot');
const average = require("image-average-color")
// LIFX Configuration
var LifxClient = require('node-lifx').Client;
var client = new LifxClient();
var bulb
client.on('light-new', function (light) {
  console.log("found light")
  bulb = light;
});
client.init();


var prevColors = [0, 0, 0, 0]

// setInterval(() => {
//   screenshot("screenshot.png", function (error, complete) {
//     average("./screenshot.png", (err, color) => {
//       if (err) throw err;

//       if (prevColors[0] - color[0] < -20 || prevColors[0] - color[0] > 20 ||
//         prevColors[1] - color[1] < -20 || prevColors[1] - color[1] > 20 ||
//         prevColors[2] - color[2] < -20 || prevColors[2] - color[2] > 20) {
//         prevColors = color
//         var colors = {
//           "red": color[0],
//           "green": color[1],
//           "blue": color[2],
//           "hue": color[3]
//         }
//         changeColor(colors)
//       }

//     })
//   })
// }, 200)

var blueColor = { hue: 193, saturation: 100, brightness: 48, kelvin: 3500 }

app.get('/lamp-toggle', function (req, res) {
  bulb.getPower((error, power) => {
    if (power == 1) {
      bulb.off(1500)
      res.send('lamp-off')
    } else {
      bulb.on(2000)
      res.send('lamp-on')
    }
  })
})

app.get('/set-color', function(req, res) {
  bulb.color(blueColor.hue, blueColor.saturation, blueColor.brightness, blueColor.kelvin, 200)
  res.send("done")
})

app.get('/get-color', function(req, res) {
  bulb.getState((err, data) => {
    blueColor = data.color; 
    res.send("result: " + data)
  })
})

app.get('/fade-up', function (req, res) {
  fade((color) => {
    if (color.brightness > 85) {
      bulb.color(color.hue, color.saturation, 100, color.kelvin, 200)
    } else {
      bulb.color(color.hue, color.saturation, color.brightness + 15, color.kelvin, 200)
    }
    res.send('fade-up')
  })
})

app.get('/fade-down', function (req, res) {
  fade((color) => {
    if (color.brightness < 15) {
      bulb.color(color.hue, color.saturation, 0, color.kelvin, 200)
    } else {
      bulb.color(color.hue, color.saturation, color.brightness - 15, color.kelvin, 200)
    }
    res.send('fade-down')
  })
})


// Helper
var fade = function (cb) {
  bulb.getPower((error, power) => {
    if (!error) {
      if (power == 1) {
        bulb.getState((error, data) => {
          return cb(data.color);
        })
      }
    } else {
      return;
    }
  })
}

var changeColor = function (color) {
  bulb.getPower((error, power) => {
    if (power == 1) {
      color.red = color.red * 0.85;
      bulb.colorRgb(color.red, color.green, color.blue, duration = 300)
      return;
    }
  })
}

app.listen(80)