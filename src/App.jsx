import "./App.css"
import React, { useRef, useEffect } from "react";
import { getGame, renderScene } from "./utils/game";
import get from "./utils/config";
import { useState } from "react";

function App(){
  const cRef = useRef()
  const sRef = useRef()
  const sc = useRef(0)
  const loaded = useRef(false)
  const [gameOver, setGameOver] = useState(false)
  const [gameState, setGameState] = useState(false)

  useEffect(() => {
    const canvas = cRef?.current
    canvas.width = get('CANVAS_WIDTH')
    canvas.height = get('CANVAS_HEIGHT')

    const { game, score } = getGame(canvas, setGameOver)
    game.subscribe((actors)=>renderScene(canvas, actors))
    score.subscribe(s => {
      sc.current += s
    })
    loaded.current = true
  }, [gameState])

  function updateGameState(){
    sc.current = 0
    setGameState(!gameState)
  }

  return (
    <div id="game-container">
      {
        gameOver && loaded.current ?
          <div className='game-over'>
            <h1 className="title">Game Over</h1>
            <p>Your score: {sc.current}</p>
            <button onClick={updateGameState}>Restart</button>
          </div>
        : 
          <div className="score" >
            <p className="title">score</p>
            <div ref={sRef}>{sc.current}</div>
          </div>
      }
      <canvas ref={cRef}></canvas>
    </div>
  )
}

export default App