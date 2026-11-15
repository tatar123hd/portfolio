// Photo slideshow tied to a list of bullets: crossfades every few seconds while on screen,
// with previous/next, dots, pause, swipe, and the matching bullet highlighted.
import { wrapIndex } from '../lib/slides.js';

const SWIPE_PX = 40;

export function mountSlideshow(root, { list = null, interval = 5000 } = {}) {
  if (!root) return;
  const items = [...root.querySelectorAll('.slides__item')];
  const dots = [...root.querySelectorAll('.slides__dot')];
  const bullets = list ? [...list.querySelectorAll('[data-slide]')] : [];
  const frame = root.querySelector('.slides__frame');
  const pauseBtn = root.querySelector('.slides__pause');
  if (items.length < 2) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.style.setProperty('--slide-ms', `${interval}ms`);
  let index = 0;
  let wanted = !reduced; // the visitor's choice (Pause/Play)
  let visible = false;
  let held = false; // pointer or keyboard focus inside
  let timer = null;

  const running = () => wanted && visible && !held && !document.hidden;

  function tick() {
    const dot = dots[index];
    if (!dot) return;
    dot.classList.remove('is-ticking');
    void dot.offsetWidth; // restart the progress fill
    if (running()) dot.classList.add('is-ticking');
  }

  function schedule() {
    clearTimeout(timer);
    root.classList.toggle('is-playing', running());
    frame.setAttribute('aria-live', wanted ? 'off' : 'polite');
    tick();
    if (running()) timer = setTimeout(() => show(wrapIndex(index, items.length, 1)), interval);
  }

  function show(n) {
    index = n;
    items.forEach((it, i) => {
      it.classList.toggle('is-active', i === n);
      if (i === n) it.removeAttribute('aria-hidden'); else it.setAttribute('aria-hidden', 'true');
      // Load the next photo early so the crossfade never shows a blank frame.
      if (i === wrapIndex(n, items.length, 1)) it.querySelector('img')?.setAttribute('loading', 'eager');
    });
    dots.forEach((d, i) => {
      if (i === n) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      d.classList.remove('is-ticking');
    });
    bullets.forEach((b, i) => b.classList.toggle('is-current', i === n));
    schedule();
  }

  root.querySelector('.slides__prev')?.addEventListener('click', () => show(wrapIndex(index, items.length, -1)));
  root.querySelector('.slides__next')?.addEventListener('click', () => show(wrapIndex(index, items.length, 1)));
  dots.forEach((d, i) => d.addEventListener('click', () => show(i)));
  bullets.forEach((b, i) => b.addEventListener('click', (e) => {
    if (e.target.closest('a')) return; // the bullet's own link still works
    show(i);
  }));

  if (pauseBtn) {
    pauseBtn.textContent = wanted ? 'Pause' : 'Play';
    pauseBtn.setAttribute('aria-pressed', String(!wanted));
    pauseBtn.addEventListener('click', () => {
      wanted = !wanted;
      pauseBtn.textContent = wanted ? 'Pause' : 'Play';
      pauseBtn.setAttribute('aria-pressed', String(!wanted));
      schedule();
    });
  }

  // Hold while the visitor is looking closely or using the controls.
  root.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { held = true; schedule(); } });
  root.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { held = false; schedule(); } });
  root.addEventListener('focusin', () => { held = true; schedule(); });
  root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget)) { held = false; schedule(); } });
  document.addEventListener('visibilitychange', schedule);

  // Swipe on touch screens.
  let x0 = null;
  frame.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  frame.addEventListener('pointerup', (e) => {
    if (x0 == null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) >= SWIPE_PX) show(wrapIndex(index, items.length, dx < 0 ? 1 : -1));
  });
  frame.addEventListener('pointercancel', () => { x0 = null; });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      schedule();
    }, { threshold: 0.4 }).observe(root);
  } else visible = true;

  show(0);
}
