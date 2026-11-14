// Planner demo page: state, filters, editing, add-course generator, saving.
import { SAMPLE } from './data/planner-sample.js';
import { addDays, daysBetween, fmtShort } from './lib/dates.js';
import { moveRange, resizeRange } from './lib/range.js';
import { findClashes, clashSentence } from './lib/clash.js';
import { generateSessions, clipSessions } from './lib/sessions.js';
import { loadState, saveState } from './lib/store.js';
import { bookableItems } from './lib/planner-model.js';
import { renderTimeline, RANGE } from './ui/timeline.js';
import { openPanel, peoplePicker } from './ui/item-panel.js';

const KEY = 'yc-planner-v1';
const fresh = () => JSON.parse(JSON.stringify(SAMPLE));

function valid(s) {
  return s && Array.isArray(s.items) && Array.isArray(s.people) && Array.isArray(s.labels) && Array.isArray(s.areas)
    && s.items.every((i) => i && typeof i.id === 'string' && typeof i.start === 'string' && typeof i.end === 'string' && Array.isArray(i.people));
}

let state = loadState(KEY, null);
if (!valid(state)) state = fresh();
const view = {
  groupBy: 'item',
  filters: { person: 'all', area: 'all', stage: 'all', label: 'all' },
  expanded: new Set(state.items.filter((i) => i.kind === 'project' || i.kind === 'phase').map((i) => i.id)),
};
let focusId = null;

const $ = (id) => document.getElementById(id);
const note = $('save-note');

function persist() {
  const ok = saveState(KEY, state);
  note.textContent = ok ? '' : 'Your browser is blocking storage, so changes will be lost when you reload.';
}

const nameOf = (id) => {
  const it = state.items.find((i) => i.id === id);
  if (!it) return id;
  return it.kind === 'course' ? `${it.name}, ${it.stage === 'plan' ? 'planning' : 'run'}` : it.name;
};

function matches(it) {
  const f = view.filters;
  if (f.person !== 'all' && !it.people.includes(f.person)) return false;
  if (f.area !== 'all' && it.area !== f.area) return false;
  if (f.label !== 'all' && it.label !== f.label) return false;
  if (f.stage !== 'all' && it.kind === 'course' && it.stage !== f.stage) return false;
  if (f.stage !== 'all' && it.kind !== 'course') return false;
  return true;
}

const dayWidth = () => (window.innerWidth < 700 ? 4 : 6);

function descendants(id) {
  const out = [];
  const walk = (pid) => state.items.filter((i) => i.parent === pid).forEach((c) => { out.push(c); walk(c.id); });
  walk(id);
  return out;
}

function move(id, delta) {
  const it = state.items.find((i) => i.id === id);
  if (!it) return;
  const family = [it, ...descendants(id)];
  const minStart = family.reduce((m, i) => (i.start < m ? i.start : m), it.start);
  const maxEnd = family.reduce((m, i) => (i.end > m ? i.end : m), it.end);
  const d = Math.max(daysBetween(minStart, RANGE.min), Math.min(daysBetween(maxEnd, RANGE.max), delta));
  if (!d) return;
  for (const f of family) Object.assign(f, moveRange(f, d, RANGE));
  focusId = id;
  persist();
  render();
}

function resize(id, edge, delta) {
  const it = state.items.find((i) => i.id === id);
  if (!it) return;
  Object.assign(it, resizeRange(it, edge, delta, RANGE));
  focusId = id;
  persist();
  render();
}

function edit(id) {
  const it = state.items.find((i) => i.id === id);
  if (!it) return;
  openPanel({
    item: it,
    people: state.people,
    labels: state.labels,
    bounds: RANGE,
    onSave: (patch) => {
      Object.assign(it, patch);
      if (!patch.label) delete it.label;
      // A course's name belongs to the course, not one stage: keep the row label in step.
      if (it.kind === 'course') state.items.filter((i) => i.group === it.group).forEach((i) => { i.name = patch.name; });
      focusId = id;
      persist();
      render();
    },
  });
}

let focusToggle = null;
function toggle(id) {
  if (view.expanded.has(id)) view.expanded.delete(id); else view.expanded.add(id);
  focusToggle = id;
  render();
  focusToggle = null;
}

function renderClashes(clashes) {
  const box = $('clashes');
  box.textContent = '';
  const h = document.createElement('p');
  h.className = 'clashes__h';
  if (!clashes.length) {
    h.textContent = 'No one is double-booked.';
    box.classList.remove('is-bad');
    box.append(h);
    return;
  }
  box.classList.add('is-bad');
  h.textContent = clashes.length === 1 ? 'One double-booking' : `${clashes.length} double-bookings`;
  const ul = document.createElement('ul');
  for (const c of clashes) {
    const li = document.createElement('li');
    li.textContent = clashSentence(c, nameOf);
    ul.append(li);
  }
  box.append(h, ul);
}

function render() {
  const bookable = bookableItems(state.items);
  const clashes = findClashes(bookable);
  renderClashes(clashes);
  const people = view.filters.person === 'all' ? state.people : [view.filters.person];
  renderTimeline($('timeline'), state, view, {
    dayW: dayWidth(),
    people,
    bookable,
    matches,
    clashIds: new Set(clashes.flatMap((c) => [c.a, c.b])),
    clashPeople: new Set(clashes.map((c) => c.person)),
    focusId,
    focusToggle,
    on: { move, resize, edit, toggle },
  });
  focusId = null;
}

function fillSelect(sel, values, allText) {
  sel.textContent = '';
  const all = document.createElement('option');
  all.value = 'all';
  all.textContent = allText;
  sel.append(all);
  for (const [v, t] of values) {
    const o = document.createElement('option');
    o.value = v;
    o.textContent = t;
    sel.append(o);
  }
}

function setupToolbar() {
  fillSelect($('f-person'), state.people.map((p) => [p, p]), 'Everyone');
  fillSelect($('f-area'), state.areas.map((a) => [a, a]), 'All areas');
  fillSelect($('f-stage'), [['plan', 'Planning'], ['run', 'Running']], 'All stages');
  fillSelect($('f-label'), state.labels.map((l) => [l.id, l.name]), 'All labels');
  for (const k of ['person', 'area', 'stage', 'label']) {
    $(`f-${k}`).addEventListener('change', (e) => { view.filters[k] = e.target.value; render(); });
  }
  $('clear-filters').addEventListener('click', () => {
    for (const k of ['person', 'area', 'stage', 'label']) { view.filters[k] = 'all'; $(`f-${k}`).value = 'all'; }
    render();
  });
  document.querySelectorAll('[data-group]').forEach((b) => b.addEventListener('click', () => {
    view.groupBy = b.dataset.group;
    document.querySelectorAll('[data-group]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    render();
  }));
  $('reset').addEventListener('click', () => {
    state = fresh();
    view.expanded = new Set(state.items.filter((i) => i.kind === 'project' || i.kind === 'phase').map((i) => i.id));
    persist();
    setupLegend();
    render();
    $('reset-note').textContent = 'Sample data restored.';
    setTimeout(() => { $('reset-note').textContent = ''; }, 2500);
  });
  $('add-course').addEventListener('click', openAddCourse);
  setupLegend();
}

function setupLegend() {
  const legend = $('legend');
  legend.textContent = '';
  for (const l of state.labels) {
    const li = document.createElement('li');
    const sw = document.createElement('span');
    sw.className = 'legend__sw';
    sw.style.background = l.color;
    li.append(sw, document.createTextNode(l.name));
    legend.append(li);
  }
}

function openAddCourse() {
  const dlg = $('add-dialog');
  const form = $('add-form');
  form.reset();
  $('a-start').value = '2027-01-11';
  $('a-start').min = RANGE.min;
  $('a-start').max = RANGE.max;
  const areaSel = $('a-area');
  areaSel.textContent = '';
  for (const a of state.areas) { const o = document.createElement('option'); o.value = a; o.textContent = a; areaSel.append(o); }
  const slot = $('a-people');
  slot.replaceChildren(peoplePicker('a-people', state.people, []));
  updatePreview();
  dlg.showModal();
  $('a-name').focus();
}

function sessionsFromForm() {
  const sessions = generateSessions({
    start: $('a-start').value,
    everyWeeks: $('a-every').value,
    count: $('a-count').value,
    lengthDays: $('a-length').value,
  });
  return clipSessions(sessions, RANGE);
}

function updatePreview() {
  const sessions = sessionsFromForm();
  const list = $('a-preview');
  list.textContent = '';
  for (const s of sessions) {
    const li = document.createElement('li');
    li.textContent = s.start === s.end ? fmtShort(s.start) : `${fmtShort(s.start)} to ${fmtShort(s.end)}`;
    list.append(li);
  }
  const name = $('a-name').value.trim();
  $('a-create').disabled = !sessions.length || !name;
  $('a-summary').textContent = !sessions.length
    ? 'No sessions to create. Set a start date inside the timeline and a count of 1 or more.'
    : `${sessions.length} session${sessions.length === 1 ? '' : 's'} will be created${name ? '' : ' once the course has a name'}.`;
}

function setupAddCourse() {
  const form = $('add-form');
  form.addEventListener('input', updatePreview);
  $('a-cancel').addEventListener('click', () => $('add-dialog').close());
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const sessions = sessionsFromForm();
    const name = $('a-name').value.trim();
    if (!sessions.length || !name) return;
    const group = `c${Date.now().toString(36)}`;
    const people = [...form.querySelectorAll('input[name="a-people"]:checked')].map((c) => c.value);
    sessions.forEach((s, i) => state.items.push({
      id: `${group}-${i}`, kind: 'course', group, stage: 'run', name, area: $('a-area').value, people, start: s.start, end: s.end, status: 'not-started',
    }));
    $('add-dialog').close();
    persist();
    render();
  });
}

let lastW = dayWidth();
window.addEventListener('resize', () => {
  const w = dayWidth();
  if (w !== lastW) { lastW = w; render(); }
});

setupToolbar();
setupAddCourse();
render();

// Start the view near today (or the start of the range).
const tl = $('timeline');
const today = new Date();
const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
if (iso > RANGE.min && iso < RANGE.max) tl.scrollLeft = Math.max(0, daysBetween(RANGE.min, addDays(iso, -10)) * dayWidth());
