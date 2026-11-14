// Small planner on the home page: 3 people, 12 weeks, drag bars to see double-bookings.
import { addDays, daysBetween } from '../lib/dates.js';
import { moveRange } from '../lib/range.js';
import { findClashes } from '../lib/clash.js';

const BASE = '2027-01-04';
const WEEKS = 12;
const PEOPLE = ['Ploy', 'Ton', 'Nok'];
const DRAG_THRESHOLD = 4;

const ITEMS = [
  { id: 'onb', person: 'Ploy', name: 'Onboarding revamp', week: 0, len: 5, color: '#4f6b3a' },
  { id: 'dat', person: 'Ton', name: 'Data literacy', week: 1, len: 3, color: '#2f5d7c' },
  { id: 'lead', person: 'Ton', name: 'Leadership course', week: 8, len: 3, color: '#9a3b1e' },
  { id: 'chal', person: 'Nok', name: 'Innovation challenge', week: 3, len: 6, color: '#7a5a2f' },
];

const toRange = (it) => ({ start: addDays(BASE, it.week * 7), end: addDays(BASE, (it.week + it.len) * 7 - 1) });
const weekOf = (iso) => Math.floor(daysBetween(BASE, iso) / 7) + 1;
const bounds = { min: BASE, max: addDays(BASE, WEEKS * 7 - 1) };

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

export function mountMiniPlanner(root) {
  if (!root) return;
  const items = ITEMS.map((i) => ({ ...i }));
  root.textContent = '';
  root.classList.add('mp');

  const scroll = el('div', 'mp__scroll');
  const grid = el('div', 'mp__grid');
  const head = el('div', 'mp__head');
  head.append(el('span'));
  const weeks = el('div', 'mp__weeks');
  for (let w = 1; w <= WEEKS; w++) weeks.append(el('span', null, `W${w}`));
  head.append(weeks);
  grid.append(head);

  const rows = new Map();
  for (const p of PEOPLE) {
    const row = el('div', 'mp__row');
    row.append(el('div', 'mp__who', p));
    const lane = el('div', 'mp__lane');
    row.append(lane);
    grid.append(row);
    rows.set(p, { row, lane });
  }
  scroll.append(grid);
  const msg = el('p', 'mp__msg');
  msg.setAttribute('aria-live', 'polite');
  root.append(scroll, msg);

  function label(it) {
    return `${it.person}: ${it.name}, weeks ${it.week + 1} to ${it.week + it.len}. Use the left and right arrow keys to move it.`;
  }

  function place(it) {
    it.bar.style.left = `${(it.week / WEEKS) * 100}%`;
    it.bar.style.width = `calc(${(it.len / WEEKS) * 100}% - 4px)`;
    it.bar.setAttribute('aria-label', label(it));
  }

  function check() {
    const clashes = findClashes(items.map((it) => ({ id: it.id, name: it.name, people: [it.person], ...toRange(it) })));
    for (const { row } of rows.values()) row.classList.remove('is-clash');
    if (!clashes.length) {
      msg.textContent = 'Everyone has one thing at a time.';
      msg.classList.remove('is-bad');
      return;
    }
    msg.classList.add('is-bad');
    msg.textContent = clashes.map((c) => {
      rows.get(c.person).row.classList.add('is-clash');
      const a = weekOf(c.from);
      const b = weekOf(c.to);
      return `${c.person} is double-booked in ${a === b ? `week ${a}` : `weeks ${a} to ${b}`}.`;
    }).join(' ');
  }

  function moveTo(it, week) {
    const r = moveRange(toRange(it), (week - it.week) * 7, bounds);
    const next = daysBetween(BASE, r.start) / 7;
    if (next === it.week) return;
    it.week = next;
    place(it);
    check();
  }

  for (const it of items) {
    const bar = el('button', 'mp__bar', it.name);
    bar.type = 'button';
    bar.style.background = it.color;
    it.bar = bar;
    rows.get(it.person).lane.append(bar);
    place(it);

    bar.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        moveTo(it, it.week + (e.key === 'ArrowRight' ? 1 : -1));
      }
    });

    bar.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const lane = bar.parentElement;
      const weekW = lane.getBoundingClientRect().width / WEEKS;
      const x0 = e.clientX;
      const start = it.week;
      let dragging = false;
      try { bar.setPointerCapture(e.pointerId); } catch { /* pointer already released */ }
      const move = (ev) => {
        const dx = ev.clientX - x0;
        if (!dragging && Math.abs(dx) < DRAG_THRESHOLD) return;
        dragging = true;
        bar.classList.add('is-dragging');
        moveTo(it, start + Math.round(dx / weekW));
      };
      const up = () => {
        bar.classList.remove('is-dragging');
        bar.removeEventListener('pointermove', move);
        bar.removeEventListener('pointerup', up);
        bar.removeEventListener('pointercancel', up);
      };
      bar.addEventListener('pointermove', move);
      bar.addEventListener('pointerup', up);
      bar.addEventListener('pointercancel', up);
    });
  }
  check();
}
