'use client'

import React, { useState, useEffect, useRef } from 'react'

import { playSong } from '../utils/song'
import { analyzeAudio } from '../utils/audioAnalysis'

import Confetti from 'react-confetti'
import { v4 as uuidv4 } from 'uuid'

const ButtonsSections = () => {
  const [sequence, setSequence] = useState<number[]>([])
  const [userSequence, setUserSequence] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [visualMode, setVisualMode] = useState(true)
  const [activeButton, setActiveButton] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [confetti, setConfetti] = useState<
    Array<{ id: string; x: number; y: number }>
  >([])

  const [importedSequence, setImportedSequence] = useState<number[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Ajoutez cette fonction helper
  function getButtonColorClass(color: string) {
    switch (color) {
      case 'green':
        return 'bg-green-500 hover:bg-green-600'
      case 'red':
        return 'bg-red-500 hover:bg-red-600'
      case 'violet':
        return 'bg-violet-500 hover:bg-violet-600'
      case 'orange':
        return 'bg-orange-500 hover:bg-orange-600'
      case 'blue':
        return 'bg-blue-500 hover:bg-blue-600'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      const audioBuffer = await file.arrayBuffer()
      const frequencies = await analyzeAudio(audioBuffer)
      console.log('frequencies : ', frequencies)
      const mappedSequence = frequencies.map(
        (freq: number) =>
          buttons.reduce((closest: any, button: any) =>
            Math.abs(button.frequency - freq) <
            Math.abs(closest.frequency - freq)
              ? button
              : closest
          ).frequency
      )
      setImportedSequence(mappedSequence)
      setSequence(mappedSequence)
    }
  }

  const playSequence = async () => {
    setUserSequence([])
    const sequenceToPlay =
      importedSequence.length > 0 ? importedSequence : sequence
    for (const freq of sequenceToPlay) {
      if (visualMode) {
        setActiveButton(freq)
      }
      playSong(freq)
      await new Promise((resolve) => setTimeout(resolve, 500))
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

  const handleButtonClick = (
    freq: number,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    playSong(freq)
    setActiveButton(freq)
    setTimeout(() => setActiveButton(null), 500)

    const buttonRect = event.currentTarget.getBoundingClientRect()
    const newConfetti = {
      id: uuidv4(),
      x: buttonRect.left + buttonRect.width / 2,
      y: buttonRect.top,
    }
    setConfetti((prev) => [...prev, newConfetti])
    setTimeout(() => {
      setConfetti((prev) => prev.filter((c) => c.id !== newConfetti.id))
    }, 2000)

    if (sequence.length > 0) {
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
      }
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 overflow-hidden">
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
          className="btn bg-transparent border-black border-2 hover:border-black rounded-full w-24 h-24 mt-6"
          onClick={() => fileInputRef.current?.click()}
        >
          Importer
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="audio/*"
          onChange={handleFileImport}
        />
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
        {buttons.map((button) => (
          <div key={button.frequency} className="relative">
            <button
              className={`btn ${
                activeButton === button.frequency ? 'ring-4 ring-white' : ''
              } ${getButtonColorClass(
                button.color
              )} border-black border-2 hover:border-black rounded-full w-16 h-16`}
              onClick={(event) => handleButtonClick(button.frequency, event)}
              disabled={isPlaying}
            />
          </div>
        ))}
      </div>
      {confetti.map(({ id, x, y }) => (
        <div key={id} className="fixed inset-0 pointer-events-none">
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            confettiSource={{
              x: x,
              y: y,
              w: 0,
              h: 0,
            }}
            recycle={false}
            numberOfPieces={50}
          />
        </div>
      ))}
    </div>
  )
}

export default ButtonsSections
