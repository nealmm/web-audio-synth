import './style.css';
import './theme';

const frequencies: { [key: string]: number | undefined } = {
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81,
  'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00,
  'A#3': 233.08, 'B3': 246.94, 'C4': 261.63, 'C#4': 277.18, 'D4': 293.66,
  'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
  'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88, 'C5': 523.25
};

const voices: { [key: string]: OscillatorNode | undefined } = {};

const context: AudioContext = new AudioContext();

const volume: GainNode = context.createGain();
volume.connect(context.destination);

function playNote(note: string): void {
  const freq: number | undefined = frequencies[note];

  if (freq != undefined) {
    const osc: OscillatorNode = context.createOscillator();
    osc.frequency.setValueAtTime(freq, context.currentTime);
    osc.connect(volume);

    voices[note] = osc;

    osc.start();
  }
}

function endNote(note: string): void {
  voices[note]?.stop();
  voices[note]?.disconnect();
  delete voices[note];
}

const volumeInput: HTMLElement | null  = document.getElementById('volume');

if (volumeInput != null && volumeInput instanceof HTMLInputElement) {
  volume.gain.setValueAtTime(parseFloat(volumeInput.value), context.currentTime);

  volumeInput.addEventListener('input', _ => {
    volume.gain.setValueAtTime(parseFloat(volumeInput.value), context.currentTime);
  });
}

const keys: HTMLCollection | undefined = document.getElementById('keyboard')?.children;

if (keys != undefined) {
  for (let i = 0; i < keys.length; i++) {
    const key: Element | null = keys.item(i);

    if (key != null) {
      key.addEventListener('mousedown', _ => playNote(key.id));

      key.addEventListener('mouseenter', event => {
        if (event instanceof MouseEvent) {
          if (event.buttons == 1) {
            playNote(key.id);
          }
        }
      });

      key.addEventListener('mouseup', _ => endNote(key.id));
      key.addEventListener('mouseleave', _ => endNote(key.id));
    }
  }
}
