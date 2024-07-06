export async function analyzeAudio(
  audioBuffer: ArrayBuffer
): Promise<number[]> {
  const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)()
  const decodedData = await audioContext.decodeAudioData(audioBuffer)
  const analyser = audioContext.createAnalyser()

  // Augmenter la précision de l'analyse
  analyser.fftSize = 32768 // Valeur maximale pour une meilleure résolution
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Float32Array(bufferLength)

  const offlineContext = new OfflineAudioContext(
    decodedData.numberOfChannels,
    decodedData.length,
    decodedData.sampleRate
  )

  const source = offlineContext.createBufferSource()
  source.buffer = decodedData
  source.connect(analyser)
  analyser.connect(offlineContext.destination)

  const frequencies: number[] = []
  const interval = 0.1 // Analyser toutes les 100ms
  const totalFrames = Math.ceil(decodedData.duration / interval)

  source.start(0)

  for (let frame = 0; frame < totalFrames; frame++) {
    offlineContext.suspend(frame * interval).then(() => {
      analyser.getFloatFrequencyData(dataArray)
      frequencies.push(
        ...extractSignificantFrequencies(
          dataArray,
          decodedData.sampleRate,
          analyser.fftSize
        )
      )
      offlineContext.resume()
    })
  }

  await offlineContext.startRendering()

  await audioContext.close()

  return frequencies
}

function extractSignificantFrequencies(
  dataArray: Float32Array,
  sampleRate: number,
  fftSize: number
): number[] {
  const significantFrequencies: number[] = []
  const threshold = -70 // Seuil en dB pour considérer une fréquence comme significative

  for (let i = 0; i < dataArray.length; i++) {
    if (dataArray[i] > threshold) {
      const frequency = (i * sampleRate) / fftSize
      significantFrequencies.push(frequency)
    }
  }

  return significantFrequencies
}
