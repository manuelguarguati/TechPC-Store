import TubesCursor from "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js"

const app = TubesCursor(document.getElementById('canvas'), {
  tubes: {
    colors: ["#00ffea", "#00ff73", "#8a2cff"],
    lights: {
      intensity: 300,
      colors: ["#00ffd5", "#00ff62", "#b44aff", "#009dff"]
    }
  }
})

document.body.addEventListener('click', () => {
  const colors = randomColors(3)
  const lightsColors = randomColors(4)
  app.tubes.setColors(colors)
  app.tubes.setLightsColors(lightsColors)
})

function randomColors(count) {
  return new Array(count)
    .fill(0)
    .map(() =>
      "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    )
}
