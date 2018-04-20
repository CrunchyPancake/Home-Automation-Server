var ambilight = require("./index")

ambilight.start(150, (color) => {
    console.log(color)
})

setTimeout(() => {
    ambilight.stop()
    console.log("stopped ambilight")
}, 3000)