var express = require('express')
var app = express()

// Dependencies
var LifxClient = require('node-lifx').Client
var ambilight = require("ambilight-provider")

// LIFX Configuration
var client = new LifxClient()
client.init()
client.on('light-new', function (light) {
  bulb = light
})


// Global Variables
var bulb
var prevColors = [0, 0, 0, 0]
var savedColor = { hue: 193, saturation: 100, brightness: 48, kelvin: 3500 }

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

app.get('/toggle-ambilight', (req, res) => {
  if (ambilight.isRunning()) {
    ambilight.stop()
    resetColor()
    res.send("stopped ambilight")
  } else {
    saveColor()
    ambilight.start(150, (color) => {
      try {
        if (difference(prevColors[0], color[0]) + difference(prevColors[1], color[1]) + difference(prevColors[2], color[2]) > 35) {
          prevColors = color
          changeColor({
            "red": parseInt(color[0]),
            "green": parseInt(color[1]),
            "blue": parseInt(color[2]),
            "hue": parseInt(color[3])
          })
        }
      } catch (err) {
        return
      }
    })
    res.send("started ambilight")
  }
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


// Helper Functions
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

var saveColor = () => {
  bulb.getState((err, data) => {
    savedColor = data.color
  })
}

var resetColor = () => {
  bulb.getState((err, data) => {
    bulb.color(savedColor.hue, savedColor.saturation, data.color.brightness, savedColor.kelvin, 200)
  })
}

var changeColor = function (color) {
  bulb.colorRgb(color.red, color.green, color.blue, duration = 300)
}

var difference = function (a, b) {
  return Math.abs(a - b);
}

app.listen(80)