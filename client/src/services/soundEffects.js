/**
 * Audio Chime and Voice Announcement Service for SIMPus Terpadu
 * Uses Web Audio API for hospital chime bell and Web Speech API for voice calling.
 */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a soothing 3-tone hospital chime (ding-dong-dang)
 */
export function playHospitalChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return Promise.resolve();

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0, duration: 0.4 },     // C5
      { freq: 659.25, time: 0.28, duration: 0.45 }, // E5
      { freq: 783.99, time: 0.58, duration: 0.8 }   // G5
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      // Smooth attack and exponential decay
      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.linearRampToValueAtTime(0.28, now + time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });

    return new Promise((resolve) => setTimeout(resolve, 1200));
  } catch (err) {
    console.warn('Audio chime playback error:', err);
    return Promise.resolve();
  }
}

/**
 * Speak queue announcement in Indonesian using Web Speech API
 * Example: "Nomor antrean A-004, silakan menuju Poli Umum, Ruang 1"
 */
export function speakAnnouncement(text) {
  try {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95; // Slightly measured and clear
    utterance.pitch = 1.05;

    // Try finding Indonesian voice
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find((v) => v.lang.startsWith('id') || v.lang.includes('ID'));
    if (idVoice) {
      utterance.voice = idVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

/**
 * Play chime then speak queue call
 */
export async function announceQueueCall(queueNumber, poliName, roomName = 'Ruang Pemeriksaan') {
  await playHospitalChime();
  const text = `Nomor antrean ${queueNumber}, silakan menuju ${poliName}, ${roomName}.`;
  speakAnnouncement(text);
}
