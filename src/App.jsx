import "./App.css"
import React, { useRef, useEffect } from "react";
import { getGame, renderScene } from "./utils/game";
import get from "./utils/config";
import { useState } from "react";

function App(){
  const cRef = useRef()
  const [ record, setRecord ] = useState([{gamesPlayed: 0, recordScore: 0}])  
  const [ game, setGame ] = useState({started: false, completed: false, score: 0 })

  useEffect(() => {
    if(!game.started){
      const canvas = cRef?.current
      canvas.width = get('CANVAS_WIDTH')
      canvas.height = get('CANVAS_HEIGHT')
  
      const { game, score } = getGame(canvas, updateGameState)
  
      game.subscribe((actors)=>renderScene(canvas, actors))
  
      score.subscribe(s => {
        setGame(g => ({...g, score: g.score + s}))
      })
  
      setGameStarted()
    }

  }, [record])

  function setGameStarted(){
    setGame(g => ({...g, started: true}))
  }

  function updateGameState(gameState){
    if(gameState.completed){
      setGame(g => ({
        ...g,
        completed: gameState.completed
      }))
    }
  }

  function getRecordScore(){
    if(record.recordScore >= game.score){
      return record.recordScore
    } else {
      return game.score
    }
  }

  function startNewGame(){
    setGame({started: false, completed: false, score: 0 })
    setRecord(g => ({
      gamesPlayed: ++g.gamesPlayed,
      recordScore: getRecordScore()
    }))
  }

  return (
    <div id="game-container">
      {
        game.started && game.completed ?
          <div className='game-over'>
            <h1 className="title">Game Over</h1>
            <p><b>Your current score:</b> {game.score}</p>
            <p><b>Your Best score:</b> {getRecordScore()}</p>
            <button onClick={startNewGame}>Restart</button>
          </div>
        : 
          <div className="score" >
            <p className="title">score</p>
            <div>{game.score}</div>
          </div>
      }
      <canvas ref={cRef}></canvas>
    </div>
  )
}

export default App