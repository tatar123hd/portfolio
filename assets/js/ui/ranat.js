// Playable ranat ek: 21 bars, Thai 7-tone tuning, mallet-like sound from Web Audio.
import { RANAT_BARS, ranatFreq } from '../lib/ranat.js';

let ctx = null;

function audio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function strike(i) {
  const a = audio();
  if (!a) return;
  const f = ranatFreq(i);
  const t = a.currentTime;
  const out = a.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(0.42, t + 0.004);
  out.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);
  out.connect(a.destination);
  // Fundamental plus two inharmonic partials that die faster, like a hardwood bar.
  for (const [mult, amp, decay] of [[1, 1, 0.95], [3.9, 0.16, 0.25], [9.2, 0.05, 0.08]]) {
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = 'sine';
    o.frequency.value = f * mult;
    g.gain.setValueAtTime(amp, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 1);
  }
}

export function mountRanat(root) {
  if (!root) return;
  root.textContent = '';
  const bars = [];
  for (let i = 0; i < RANAT_BARS; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ranat__bar';
    b.style.height = `${84 - i * 2}%`;
    b.setAttribute('aria-label', `Bar ${i + 1}`);
    b.dataset.i = String(i);
    root.append(b);
    bars.push(b);
  }

  const hit = (b) => {
    strike(Number(b.dataset.i));
    b.classList.remove('is-hit');
    void b.offsetWidth;
    b.classList.add('is-hit');
    setTimeout(() => b.classList.remove('is-hit'), 120);
  };

  // Pointer: tap to play, drag across to glissando. elementFromPoint works with captured touch pointers.
  let down = false;
  let last = null;
  const barAt = (x, y) => {
    const n = document.elementFromPoint(x, y);
    return n && n.classList.contains('ranat__bar') && root.contains(n) ? n : null;
  };
  root.addEventListener('pointerdown', (e) => {
    const b = barAt(e.clientX, e.clientY);
    if (!b) return;
    down = true;
    last = b;
    root.setPointerCapture(e.pointerId);
    hit(b);
  });
  root.addEventListener('pointermove', (e) => {
    if (!down) return;
    const b = barAt(e.clientX, e.clientY);
    if (b && b !== last) { last = b; hit(b); }
  });
  const stop = () => { down = false; last = null; };
  root.addEventListener('pointerup', stop);
  root.addEventListener('pointercancel', stop);

  // Keyboard: Enter/Space play (click with detail 0), arrows move between bars.
  root.addEventListener('click', (e) => {
    const b = e.target.closest('.ranat__bar');
    if (b && e.detail === 0) hit(b);
  });
  root.addEventListener('keydown', (e) => {
    const i = bars.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = bars[Math.max(0, Math.min(bars.length - 1, i + (e.key === 'ArrowRight' ? 1 : -1)))];
      next.focus();
    }
  });
}
