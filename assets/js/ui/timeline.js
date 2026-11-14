// Timeline renderer for the planner demo. Pure DOM; state changes go back through `on`.
import { addDays, daysBetween, fmtShort } from '../lib/dates.js';
import { barGeometry } from '../lib/range.js';

export const RANGE = { min: '2026-11-01', max: '2027-04-30' };
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const STATUS = { 'not-started': 'Not started', 'in-progress': 'In progress', blocked: 'Blocked', done: 'Done' };
const DRAG_THRESHOLD = 4;

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

const totalDays = () => daysBetween(RANGE.min, RANGE.max) + 1;
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function header(dayW) {
  const head = el('div', 'tl__head');
  const months = el('div', 'tl__months');
  let cursor = RANGE.min;
  while (cursor <= RANGE.max) {
    const [y, m] = cursor.split('-').map(Number);
    const next = `${m === 12 ? y + 1 : y}-${String(m === 12 ? 1 : m + 1).padStart(2, '0')}-01`;
    const end = next > RANGE.max ? addDays(RANGE.max, 1) : next;
    const cell = el('span', null, `${MONTHS[m - 1]} ${y}`);
    cell.style.width = `${daysBetween(cursor, end) * dayW}px`;
    months.append(cell);
    cursor = next;
  }
  const weeks = el('div', 'tl__weeks');
  for (let i = 0; i < totalDays(); i++) {
    const d = addDays(RANGE.min, i);
    if (new Date(`${d}T00:00:00Z`).getUTCDay() !== 1) continue;
    const tick = el('span', null, String(Number(d.slice(8))));
    tick.style.left = `${i * dayW}px`;
    weeks.append(tick);
  }
  head.append(el('div', 'tl__corner'), months, el('div', 'tl__corner'), weeks);
  return head;
}

function describe(item, state) {
  const label = state.labels.find((l) => l.id === item.label);
  const stage = item.kind === 'course' ? `${item.stage === 'plan' ? 'planning' : 'running'}, ` : '';
  return `${item.name}, ${stage}${fmtShort(item.start)} to ${fmtShort(item.end)}, ${item.people.join(' and ') || 'no one assigned'}, ${STATUS[item.status]}${label ? `, ${label.name}` : ''}. Enter to edit, arrow keys to move by a day, Shift and arrow by a week.`;
}

function bar(item, state, ctx, extra = '') {
  const b = el('button', `tl__bar tl__bar--${item.kind}${item.stage ? ` tl__bar--${item.stage}` : ''}${extra}`);
  b.type = 'button';
  b.dataset.id = item.id;
  const label = state.labels.find((l) => l.id === item.label);
  if (label) b.style.setProperty('--tag', label.color);
  if (item.status === 'done') b.classList.add('is-done');
  if (ctx.clashIds.has(item.id)) b.classList.add('is-clash');
  const box = barGeometry(item, RANGE.min, ctx.dayW);
  b.style.left = `${box.left}px`;
  b.style.width = `${box.width}px`;
  b.append(el('span', 'tl__bar-text', item.kind === 'course' ? (item.stage === 'plan' ? 'Plan' : 'Run') : item.name));
  b.setAttribute('aria-label', describe(item, state));
  b.title = `${item.name}: ${fmtShort(item.start)} to ${fmtShort(item.end)}`;
  for (const edge of box.handles ? ['start', 'end'] : []) {
    const h = el('span', `tl__h tl__h--${edge}`);
    h.dataset.edge = edge;
    h.setAttribute('aria-hidden', 'true');
    b.append(h);
  }
  wireBar(b, item, ctx);
  return b;
}

function wireBar(b, item, ctx) {
  let suppressClick = false;
  b.addEventListener('click', () => {
    if (suppressClick) { suppressClick = false; return; }
    ctx.on.edit(item.id);
  });
  b.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const step = (e.shiftKey ? 7 : 1) * (e.key === 'ArrowRight' ? 1 : -1);
    ctx.on.move(item.id, step);
  });
  b.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const edge = e.target.dataset?.edge || null;
    const x0 = e.clientX;
    const left0 = parseFloat(b.style.left);
    const width0 = parseFloat(b.style.width);
    let days = 0;
    let dragging = false;
    try { b.setPointerCapture(e.pointerId); } catch { /* pointer already released */ }
    const move = (ev) => {
      const dx = ev.clientX - x0;
      if (!dragging && Math.abs(dx) < DRAG_THRESHOLD) return;
      dragging = true;
      b.classList.add('is-dragging');
      days = Math.round(dx / ctx.dayW);
      const px = days * ctx.dayW;
      if (!edge) b.style.left = `${left0 + px}px`;
      else if (edge === 'start') { b.style.left = `${left0 + px}px`; b.style.width = `${Math.max(ctx.dayW, width0 - px)}px`; }
      else b.style.width = `${Math.max(ctx.dayW, width0 + px)}px`;
    };
    const up = () => {
      b.removeEventListener('pointermove', move);
      b.removeEventListener('pointerup', up);
      b.removeEventListener('pointercancel', up);
      b.classList.remove('is-dragging');
      if (!dragging) return;
      suppressClick = true;
      if (days === 0) return;
      // Commit after the click that follows pointerup has been swallowed by this (still attached) bar.
      setTimeout(() => (edge ? ctx.on.resize(item.id, edge, days) : ctx.on.move(item.id, days)), 0);
    };
    b.addEventListener('pointermove', move);
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
  });
}

function row(labelNode, bars, cls = '') {
  const r = el('div', `tl__row ${cls}`.trim());
  const lab = el('div', 'tl__label');
  lab.append(labelNode);
  const lane = el('div', 'tl__lane');
  lane.append(...bars);
  r.append(lab, lane);
  return r;
}

function groupRow(text) {
  const r = el('div', 'tl__group');
  r.append(el('div', 'tl__label', text), el('div', 'tl__lane'));
  return r;
}

function toggleLabel(item, ctx, level, hasChildren) {
  const wrap = el('div', `tl__name tl__name--l${level}`);
  if (hasChildren) {
    const t = el('button', 'tl__toggle');
    t.type = 'button';
    t.dataset.id = item.id;
    const open = ctx.view.expanded.has(item.id);
    t.setAttribute('aria-expanded', String(open));
    t.setAttribute('aria-label', `${open ? 'Collapse' : 'Expand'} ${item.name}`);
    t.textContent = open ? '−' : '+';
    t.addEventListener('click', () => ctx.on.toggle(item.id));
    wrap.append(t);
  } else wrap.append(el('span', 'tl__toggle-space'));
  const text = el('span', 'tl__name-text', item.name);
  wrap.append(text);
  if (item.people.length) wrap.append(el('span', 'tl__who', item.people.join(', ')));
  return wrap;
}

// Greedy lanes so bars of one person never draw on top of each other.
function tracks(items) {
  const ends = [];
  const placed = [];
  for (const it of [...items].sort((a, b) => (a.start < b.start ? -1 : 1))) {
    let t = ends.findIndex((end) => end < it.start);
    if (t === -1) { t = ends.length; ends.push(it.end); } else ends[t] = it.end;
    placed.push({ it, t });
  }
  return { placed, count: Math.max(1, ends.length) };
}

export function renderTimeline(root, state, view, ctxIn) {
  const ctx = { ...ctxIn, view };
  const { dayW } = ctx;
  root.textContent = '';
  const inner = el('div', 'tl__inner');
  inner.style.setProperty('--lane', `${totalDays() * dayW}px`);
  inner.style.setProperty('--day', `${dayW}px`);
  inner.append(header(dayW));

  const body = el('div', 'tl__body');
  const rows = [];

  if (view.groupBy === 'person') {
    for (const person of ctx.people) {
      const items = ctx.bookable.filter((i) => i.people.includes(person) && ctx.matches(i));
      const { placed, count } = tracks(items);
      const bars = placed.map(({ it, t }) => {
        const b = bar(it, state, ctx);
        b.style.top = `${8 + t * 36}px`;
        b.querySelector('.tl__bar-text').textContent = it.kind === 'course' ? `${it.name} (${it.stage})` : it.name;
        return b;
      });
      const name = el('div', 'tl__name tl__name--person');
      name.append(el('span', 'tl__name-text', person), el('span', 'tl__who', `${items.length} item${items.length === 1 ? '' : 's'}`));
      const r = row(name, bars, ctx.clashPeople.has(person) ? 'is-clash' : '');
      r.querySelector('.tl__lane').style.height = `${16 + count * 36}px`;
      rows.push(r);
    }
  } else {
    const kids = (id) => state.items.filter((i) => i.parent === id);
    const visible = (it) => ctx.matches(it) || kids(it.id).some(visible);
    const projects = state.items.filter((i) => i.kind === 'project' && visible(i));
    if (projects.length) rows.push(groupRow('Projects'));
    const addTree = (it, level) => {
      const children = kids(it.id).filter(visible);
      const b = bar(it, state, ctx, ctx.matches(it) ? '' : ' is-dim');
      rows.push(row(toggleLabel(it, ctx, level, children.length > 0), [b], `tl__row--l${level}`));
      if (children.length && view.expanded.has(it.id)) children.forEach((c) => addTree(c, level + 1));
    };
    projects.forEach((p) => addTree(p, 0));

    const groups = [...new Set(state.items.filter((i) => i.kind === 'course').map((i) => i.group))];
    const courseRows = [];
    for (const g of groups) {
      const items = state.items.filter((i) => i.group === g);
      const shown = items.filter(ctx.matches);
      if (!shown.length) continue;
      const first = items[0];
      const name = el('div', 'tl__name tl__name--l0');
      name.append(el('span', 'tl__toggle-space'), el('span', 'tl__name-text', first.name));
      const people = [...new Set(items.flatMap((i) => i.people))];
      if (people.length) name.append(el('span', 'tl__who', people.join(', ')));
      courseRows.push(row(name, shown.map((i) => bar(i, state, ctx)), 'tl__row--course'));
    }
    if (courseRows.length) rows.push(groupRow('Courses'), ...courseRows);
  }

  if (!rows.length) {
    const empty = el('p', 'tl__empty', 'Nothing matches these filters. Clear a filter to see more.');
    body.append(empty);
  } else body.append(...rows);

  const today = todayIso();
  if (today >= RANGE.min && today <= RANGE.max) {
    const line = el('div', 'tl__today');
    line.style.left = `calc(var(--label) + ${(daysBetween(RANGE.min, today) + 0.5) * dayW}px)`;
    line.append(el('span', null, 'Today'));
    body.append(line);
  }
  inner.append(body);
  root.append(inner);

  if (ctx.focusToggle) root.querySelector(`.tl__toggle[data-id="${CSS.escape(ctx.focusToggle)}"]`)?.focus({ preventScroll: true });
  if (ctx.focusId) root.querySelector(`.tl__bar[data-id="${CSS.escape(ctx.focusId)}"]`)?.focus({ preventScroll: true });
}
