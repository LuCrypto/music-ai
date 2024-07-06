export const playSong = (value: number) => {
  // Création d'un contexte audio
  const AudioContextClass =
    window.AudioContext || (window as any).webkitAudioContext
  const audioContext = new AudioContextClass()

  // Création d'un oscillateur (générateur de son)
  const oscillator = audioContext.createOscillator()

  // Création d'un nœud de gain pour contrôler le volume
  const gainNode = audioContext.createGain()

  // Configuration de l'oscillateur
  oscillator.type = 'sine' // Essayez aussi 'triangle' pour un son plus doux
  oscillator.frequency.setValueAtTime(value, audioContext.currentTime) // La4 standard

  // Configuration du gain (volume)
  gainNode.gain.setValueAtTime(0, audioContext.currentTime)
  gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1)
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5)

  // Connexion oscillateur -> gain -> sortie
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.5)
}
