import './style.css';
import './theme';

const frequencies: { [key: string]: number | undefined } = {
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81,
  'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00,
  'A#3': 233.08, 'B3': 246.94, 'C4': 261.63, 'C#4': 277.18, 'D4': 293.66,
  'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
  'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88, 'C5': 523.25
};

const voices: { [key: string]: [GainNode, BiquadFilterNode] | undefined } = {};

const context: AudioContext = new AudioContext();

const volume: GainNode = context.createGain();
volume.connect(context.destination);

const compressor: DynamicsCompressorNode = context.createDynamicsCompressor();
compressor.connect(volume);

let waveform: OscillatorType = 'sine';

let filterType: BiquadFilterType = 'lowpass';
let filterFreq: number = 0;
let filterQ: number = 0;

const ampEnvelope = { attack: 0.0, decay: 0.0, sustain: 0.0, release: 0.0 };

const filterEnvelope = { attack: 0.0, decay: 0.0, sustain: 0.0, release: 0.0 };

function playNote(note: string): void {
  const freq: number | undefined = frequencies[note];

  if (freq != undefined) {
    const osc: OscillatorNode = context.createOscillator();
    osc.frequency.setValueAtTime(freq, context.currentTime);
    osc.type = waveform;

    const amp: GainNode = context.createGain();
    amp.gain.setValueAtTime(0, context.currentTime);
    amp.gain.linearRampToValueAtTime(1, context.currentTime + ampEnvelope.attack);
    amp.gain.linearRampToValueAtTime(ampEnvelope.sustain, context.currentTime + ampEnvelope.attack + ampEnvelope.decay);

    const filter: BiquadFilterNode = context.createBiquadFilter();
    filter.type = filterType;
    filter.Q.setValueAtTime(filterQ, context.currentTime);
    filter.frequency.setValueAtTime(0, context.currentTime);
    filter.frequency.linearRampToValueAtTime(filterFreq, context.currentTime + filterEnvelope.attack);
    filter.frequency.linearRampToValueAtTime(filterFreq * filterEnvelope.sustain, context.currentTime + filterEnvelope.attack + filterEnvelope.decay);

    osc.connect(amp);
    amp.connect(filter);
    filter.connect(compressor);

    voices[note] = [amp, filter];

    osc.start();
  }
}

function endNote(note: string): void {
  const voice: [GainNode, BiquadFilterNode] | undefined = voices[note];

  if (voice != undefined) {
    const [amp, filter] = voice;
    amp.gain.cancelScheduledValues(context.currentTime);
    amp.gain.setValueAtTime(amp.gain.value, context.currentTime);
    amp.gain.linearRampToValueAtTime(0, context.currentTime + ampEnvelope.release);

    filter.frequency.cancelScheduledValues(context.currentTime);
    filter.frequency.setValueAtTime(filter.frequency.value, context.currentTime);
    filter.frequency.linearRampToValueAtTime(0, context.currentTime + filterEnvelope.release)
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
  });
}

const cutoff: HTMLElement | null = document.getElementById('cutoff');

if (cutoff != null && cutoff instanceof HTMLInputElement) {
  cutoff.setAttribute('min', `10`)
  cutoff.setAttribute('max', `${context.sampleRate / 2}`);

  filterFreq = parseFloat(cutoff.value);

  cutoff.addEventListener('input', _ => {
    filterFreq = parseFloat(cutoff.value);
  });
}

const resonance: HTMLElement | null = document.getElementById('resonance');

if (resonance != null && resonance instanceof HTMLInputElement) {
  filterQ = parseFloat(resonance.value);

  resonance.addEventListener('input', _ => {
    filterQ = parseFloat(resonance.value);
  });
}

const ampAttackInput: HTMLElement | null = document.getElementById('amp-attack');
const ampDecayInput: HTMLElement | null = document.getElementById('amp-decay');
const ampSustainInput: HTMLElement | null = document.getElementById('amp-sustain');
const ampReleaseInput: HTMLElement | null = document.getElementById('amp-release');

if (ampAttackInput != null && ampAttackInput instanceof HTMLInputElement) {
  ampEnvelope.attack = parseFloat(ampAttackInput.value);

  ampAttackInput.addEventListener('input', _ => {
    ampEnvelope.attack = parseFloat(ampAttackInput.value);
  });
}

if (ampDecayInput != null && ampDecayInput instanceof HTMLInputElement) {
  ampEnvelope.decay = parseFloat(ampDecayInput.value);

  ampDecayInput.addEventListener('input', _ => {
    ampEnvelope.decay = parseFloat(ampDecayInput.value);
  });
}

if (ampSustainInput != null && ampSustainInput instanceof HTMLInputElement) {
  ampEnvelope.sustain = parseFloat(ampSustainInput.value);

  ampSustainInput.addEventListener('input', _ => {
    ampEnvelope.sustain = parseFloat(ampSustainInput.value);
  });
}

if (ampReleaseInput != null && ampReleaseInput instanceof HTMLInputElement) {
  ampEnvelope.release = parseFloat(ampReleaseInput.value);

  ampReleaseInput.addEventListener('input', _ => {
    ampEnvelope.release = parseFloat(ampReleaseInput.value);
  });
}

const filterAttackInput: HTMLElement | null = document.getElementById('filter-attack');
const filterDecayInput: HTMLElement | null = document.getElementById('filter-decay');
const filterSustainInput: HTMLElement | null = document.getElementById('filter-sustain');
const filterReleaseInput: HTMLElement | null = document.getElementById('filter-release');

if (filterAttackInput != null && filterAttackInput instanceof HTMLInputElement) {
  filterEnvelope.attack = parseFloat(filterAttackInput.value);

  filterAttackInput.addEventListener('input', _ => {
    filterEnvelope.attack = parseFloat(filterAttackInput.value);
  });
}

if (filterDecayInput != null && filterDecayInput instanceof HTMLInputElement) {
  filterEnvelope.decay = parseFloat(filterDecayInput.value);

  filterDecayInput.addEventListener('input', _ => {
    filterEnvelope.decay = parseFloat(filterDecayInput.value);
  });
}

if (filterSustainInput != null && filterSustainInput instanceof HTMLInputElement) {
  filterEnvelope.sustain = parseFloat(filterSustainInput.value);

  filterSustainInput.addEventListener('input', _ => {
    filterEnvelope.sustain = parseFloat(filterSustainInput.value);
  });
}

if (filterReleaseInput != null && filterReleaseInput instanceof HTMLInputElement) {
  filterEnvelope.release = parseFloat(filterReleaseInput.value);

  filterReleaseInput.addEventListener('input', _ => {
    filterEnvelope.release = parseFloat(filterReleaseInput.value);
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
