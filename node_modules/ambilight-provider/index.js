var screenshot = require('desktop-screenshot');
var color = require('dominant-color')

var timer
var isRunning = false

exports.start = (interval, callback) => {
    isRunning = true
    timer = setInterval(() => {
        screenshot("screenshot.png", function (error, complete) {
          color("screenshot.png", { format: 'rgb' }, (err, color) => {
            if (err) {
                console.log("Computer cant keep up with interval. Try increasing by 25ms")
                return
            }
            callback(color)
          })
        })
      }, interval)
}

exports.stop = () => {
    if (timer != null && isRunning) {
        clearInterval(timer)
        isRunning = false
    }     
}

exports.isRunning = () => {
    return isRunning
}