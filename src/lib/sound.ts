// Tiny synthesized move sounds, so we ship no audio files.
let ctx: AudioContext | undefined
let muted = (() => {
  try {
    return localStorage.getItem('lct.muted') === '1'
  } catch {
    return false
  }
})()

export const isMuted = () => muted
export function setMuted(m: boolean) {
  muted = m
  try {
    localStorage.setItem('lct.muted', m ? '1' : '0')
  } catch {
    /* ignore */
  }
}

function blip(freq: number, dur: number, gain: number, type: OscillatorType = 'triangle') {
  if (muted) return
  try {
    ctx ??= new AudioContext()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.value = freq
    g.gain.setValueAtTime(gain, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + dur)
  } catch {
    /* audio not available */
  }
}

export const sounds = {
  move: () => blip(520, 0.07, 0.15),
  capture: () => blip(320, 0.11, 0.2, 'square'),
  error: () => blip(140, 0.25, 0.15, 'sawtooth'),
  success: () => {
    blip(660, 0.12, 0.12)
    setTimeout(() => blip(880, 0.18, 0.12), 110)
  },
}

export function playMoveSound(san?: string) {
  if (!san) return
  if (san.includes('x')) sounds.capture()
  else sounds.move()
}
