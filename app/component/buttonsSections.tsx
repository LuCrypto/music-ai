'use client'

import React, { useState, useEffect } from 'react'
import { playSong } from '../utils/playSong'

const ButtonsSections = () => {
  const [sequence, setSequence] = useState<number[]>([])
  const [userSequence, setUserSequence] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [visualMode, setVisualMode] = useState(true)
  const [activeButton, setActiveButton] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const buttons = [
    { color: 'green', frequency: 340 },
    { color: 'red', frequency: 440 },
    { color: 'violet', frequency: 540 },
    { color: 'orange', frequency: 640 },
    { color: 'blue', frequency: 740 },
  ]

  useEffect(() => {
    if (isPlaying) {
      playSequence()
    }
  }, [sequence, isPlaying])

  const playSequence = async () => {
    setUserSequence([])
    for (const freq of sequence) {
      if (visualMode) {
        setActiveButton(freq)
      }
      playSong(freq)
      await new Promise((resolve) => setTimeout(resolve, 750))
      if (visualMode) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        setActiveButton(null)
      }
    }
    setIsPlaying(false)
  }

  const handlePlay = (reset: boolean) => {
    const newFreq =
      buttons[Math.floor(Math.random() * buttons.length)].frequency
    if (reset) {
      setSequence([newFreq])
      setUserSequence([])
      setScore(0)
    } else {
      setSequence([...sequence, newFreq])
    }
    setIsPlaying(true)
  }

  const handleButtonClick = (freq: number) => {
    if (!isPlaying) {
      playSong(freq)
      const newUserSequence = [...userSequence, freq]
      setUserSequence(newUserSequence)

      if (newUserSequence.length === sequence.length) {
        if (JSON.stringify(newUserSequence) === JSON.stringify(sequence)) {
          setScore(newUserSequence.length)
          setTimeout(() => handlePlay(false), 1000)
        } else {
          alert(`Séquence incorrecte ! Votre score final est : ${score}`)
          setSequence([])
          setUserSequence([])
          setScore(0)
        }
      } else if (freq !== sequence[newUserSequence.length - 1]) {
        alert(`Séquence incorrecte ! Votre score final est : ${score}`)
        setSequence([])
        setUserSequence([])
        setScore(0)
        return
      }
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
      <div className="text-2xl font-bold mb-4">Score: {score}</div>
      <div className="flex gap-4">
        <button
          className="btn bg-transparent border-black border-2 hover:border-black rounded-full w-24 h-24 mt-6"
          onClick={() => handlePlay(true)}
          disabled={isPlaying}
        >
          Jouer
        </button>
        <button
          className={`btn ${
            visualMode ? 'bg-blue-500' : 'bg-gray-500'
          } text-white rounded-full w-24 h-24 mt-6`}
          onClick={() => setVisualMode(!visualMode)}
          disabled={isPlaying}
        >
          {visualMode ? 'Mode Visuel' : 'Mode Audio'}
        </button>
      </div>
      <div className="w-full h-full flex items-center justify-center gap-6">
        {buttons.map((button, index) => (
          <button
            key={index}
            className={`btn ${
              activeButton === button.frequency ? 'ring-4 ring-white' : ''
            } bg-${button.color}-500 hover:bg-${
              button.color
            }-600 border-black border-2 hover:border-black rounded-full w-16 h-16`}
            onClick={() => handleButtonClick(button.frequency)}
            disabled={isPlaying}
          ></button>
        ))}
      </div>
    </div>
  )
}

export default ButtonsSections
