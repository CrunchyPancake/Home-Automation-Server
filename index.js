var express = require('express')
var app = express()
var screenshot = require('desktop-screenshot');

// LIFX Configuration
var LifxClient = require('node-lifx').Client;
var client = new LifxClient();
var bulb
client.on('light-new', function (light) {
  bulb = light;
});
client.init();

const colorList = {
  "red": [0, 0, 2],
  "green": [0, 0, 0],
  "blue": [0, 0, 0],
  "yellow": [0, 0, 0],
  "": [0, 0, 0]
}

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

app.get('/fade-up', function (req, res) {
  // for (var i = 0; i < 10; i++) {
  //   screenshot("screenshot" + i + ".png", function (error, complete) {
  //     if (error)
  //       console.log("Screenshot failed", error);
  //     else
  //       console.log("Screenshot succeeded");
  //   });
  // }

  fade((color) => {
    if (color.brightness > 95) {
      bulb.color(color.hue, color.saturation, 100)
    } else {
      bulb.color(color.hue, color.saturation, color.brightness + 5)
    }
    res.send('fade-up')
  })
})

app.get('/fade-down', function (req, res) {
  fade((color) => {
    if (color.brightness < 5) {
      bulb.color(color.hue, color.saturation, 0)
    } else {
      bulb.color(color.hue, color.saturation, color.brightness - 5)
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

  var changeColor = function (color) {
    bulb.getPower((error, data) => {
      if (power == 1) {
        bulb.colorRgb(color.red, color.green, color.blue)
        res.send('changed light color')
      }
    })
  }
}

app.listen(8080)