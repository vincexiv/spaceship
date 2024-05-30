import "./App.css"
import React, { useRef, useEffect } from "react";
import { getGame, renderScene } from "./utils/game";
import get from "./utils/config";

function App(){
  const cRef = useRef()

  useEffect(() => {
      const canvas = cRef?.current
      canvas.width = get('CANVAS_WIDTH')
      canvas.height = get('CANVAS_HEIGHT')
      const game = getGame(canvas)
      game.subscribe((actors)=>renderScene(canvas, actors))
  }, [])

  return (
    <div id="game-container">
      <canvas ref={cRef}></canvas>
    </div>
  )
}

export default App