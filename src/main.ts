import './style.css';
import './theme';

const frequencies: { [key: string]: number | undefined } = {
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81,
  'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00,
  'A#3': 233.08, 'B3': 246.94, 'C4': 261.63, 'C#4': 277.18, 'D4': 293.66,
  'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
  'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88, 'C5': 523.25
};

const voices: { [key: string]: GainNode | undefined } = {};

const context: AudioContext = new AudioContext();

const volume: GainNode = context.createGain();
volume.connect(context.destination);

const compressor: DynamicsCompressorNode = context.createDynamicsCompressor();
compressor.connect(volume);

let waveform: OscillatorType = 'sine';
let filterType: BiquadFilterType = 'notch';

const filter: BiquadFilterNode = context.createBiquadFilter();
filter.type = filterType;
filter.connect(compressor);

const envelope = { attack: 0.0, decay: 0.0, sustain: 0.0, release: 0.0 };

function playNote(note: string): void {
  const freq: number | undefined = frequencies[note];

  if (freq != undefined) {
    const osc: OscillatorNode = context.createOscillator();
    osc.frequency.setValueAtTime(freq, context.currentTime);
    osc.type = waveform;

    const amp: GainNode = context.createGain();
    amp.gain.setValueAtTime(0, context.currentTime);
    amp.gain.linearRampToValueAtTime(1, context.currentTime + envelope.attack);
    amp.gain.linearRampToValueAtTime(envelope.sustain, context.currentTime + envelope.attack + envelope.decay);
    osc.connect(amp);
    amp.connect(filter);

    voices[note] = amp;

    osc.start();
  }
}

function endNote(note: string): void {
  const amp: GainNode | undefined = voices[note];

  if (amp != undefined) {
    amp.gain.cancelScheduledValues(context.currentTime);
    amp.gain.setValueAtTime(amp.gain.value, context.currentTime);
    amp.gain.linearRampToValueAtTime(0, context.currentTime + envelope.release);
  }
}

const volumeInput: HTMLElement | null  = document.getElementById('volume');

if (volumeInput != null && volumeInput instanceof HTMLInputElement) {
  volume.gain.setValueAtTime(parseFloat(volumeInput.value), context.currentTime);

  volumeInput.addEventListener('input', _ => {
    volume.gain.setValueAtTime(parseFloat(volumeInput.value), context.currentTime);
  });
}

const waveformSelect: HTMLElement | null = document.getElementById('waveform');

if (waveformSelect != null && waveformSelect instanceof HTMLSelectElement) {
  waveform = waveformSelect.value as OscillatorType;

  waveformSelect.addEventListener('input', _ => {
    waveform = waveformSelect.value as OscillatorType;
  });
}

const filterSelect: HTMLElement | null = document.getElementById('filter');

if (filterSelect != null && filterSelect instanceof HTMLSelectElement) {
  filterType = filterSelect.value as BiquadFilterType;

  filterSelect.addEventListener('input', _ => {
    filterType = filterSelect.value as BiquadFilterType;
    filter.type = filterType;
    console.log(filter.type);
  });
}

const attackInput: HTMLElement | null = document.getElementById('attack');
const decayInput: HTMLElement | null = document.getElementById('decay');
const sustainInput: HTMLElement | null = document.getElementById('sustain');
const releaseInput: HTMLElement | null = document.getElementById('release');

if (attackInput != null && attackInput instanceof HTMLInputElement) {
  envelope.attack = parseFloat(attackInput.value);

  attackInput.addEventListener('input', _ => {
    envelope.attack = parseFloat(attackInput.value);
  });
}

if (decayInput != null && decayInput instanceof HTMLInputElement) {
  envelope.decay = parseFloat(decayInput.value);

  decayInput.addEventListener('input', _ => {
    envelope.decay = parseFloat(decayInput.value);
  });
}

if (sustainInput != null && sustainInput instanceof HTMLInputElement) {
  envelope.sustain = parseFloat(sustainInput.value);

  sustainInput.addEventListener('input', _ => {
    envelope.sustain = parseFloat(sustainInput.value);
  });
}

if (releaseInput != null && releaseInput instanceof HTMLInputElement) {
  envelope.release = parseFloat(releaseInput.value);

  releaseInput.addEventListener('input', _ => {
    envelope.release = parseFloat(releaseInput.value);
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

const keymap: { [key: string]: string | undefined} = {
  'KeyA': 'C3', 'KeyW': 'C#3', 'KeyS': 'D3', 'KeyE': 'D#3', 'KeyD': 'E3',
  'KeyF': 'F3', 'KeyT': 'F#3', 'KeyG': 'G3', 'KeyY': 'G#3', 'KeyH': 'A3',
  'KeyU': 'A#3', 'KeyJ': 'B3', 'KeyK': 'C4', 'KeyO': 'C#4', 'KeyL': 'D4',
  'KeyP': 'D#4', 'Semicolon': 'E4'
};

document.addEventListener('keydown', event => {
  if (event instanceof KeyboardEvent && !event.repeat) {
    const note: string | undefined = keymap[event.code];

    if (note != undefined) {
      playNote(note);
    }
  }
});

document.addEventListener('keyup', event => {
  if (event instanceof KeyboardEvent) {
    const note: string | undefined = keymap[event.code];

    if (note != undefined) {
      endNote(note);
    }
  }
});
