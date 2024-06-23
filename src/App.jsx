import "./App.css"
import React, { useRef, useEffect } from "react";
import { getGame, renderScene } from "./utils/game";
import get from "./utils/config";
import { useState } from "react";

const defaultRecordState = { gamesPlayed: 0, recordScore: 0 }
const defaultGameState = { started: false, completed: false, score: 0 }

function App(){
  const cRef = useRef()
  const savedRecord = getFromLocalStorage('record')
  const [ record, setRecord ] = useState(savedRecord || defaultRecordState)  
  const [ game, setGame ] = useState(defaultGameState)

  useEffect(() => {
    if(!game.started){
      const canvas = cRef?.current
      canvas.width = get('CANVAS_WIDTH')
      canvas.height = get('CANVAS_HEIGHT')
  
      const { game: gameObserver, score: scoreObserver } = getGame(canvas, updateGameState)
  
      gameObserver.subscribe((actors)=>renderScene(canvas, actors))
      scoreObserver.subscribe(s => setGame(g => ({...g, score: g.score + s})))

      setTimeout(()=> saveToLocalStorage('record', record), 0)
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
    setGame(defaultGameState)
    setRecord(g => ({
      gamesPlayed: ++g.gamesPlayed,
      recordScore: getRecordScore()
    }))
  }

  function saveToLocalStorage(itemName, item){
    localStorage.setItem(itemName, btoa(JSON.stringify(item)))
  }

  function getFromLocalStorage(itemName){
    const item = localStorage.getItem(itemName)
    if(item){
      return JSON.parse(atob(item))
    } else {
      return null
    }
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