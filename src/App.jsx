import "./App.css"
import React, { useRef, useEffect } from "react";
import { getGame, renderScene } from "./utils/methods";

function App(){
  const cRef = useRef()

  useEffect(() => {
      const canvas = cRef?.current
      canvas.width = 1366
      canvas.height = 768
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      const game = getGame(canvas)
      game.subscribe((actors)=>renderScene(canvas, actors))
  }, [])

  return (
    <canvas ref={cRef}></canvas>
  )
}

export default App