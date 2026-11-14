// Edit panel for one planner item, built on <dialog>.
import { isIsoDate } from '../lib/dates.js';

const STATUSES = [['not-started', 'Not started'], ['in-progress', 'In progress'], ['blocked', 'Blocked'], ['done', 'Done']];

function el(tag, attrs = {}, text) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else n.setAttribute(k, v);
  }
  if (text != null) n.textContent = text;
  return n;
}

function field(id, label, input, hint) {
  const wrap = el('div', { class: 'field' });
  wrap.append(el('label', { for: id }, label), input);
  if (hint) wrap.append(el('p', { class: 'field__hint' }, hint));
  const err = el('p', { class: 'field__err', id: `${id}-err`, 'aria-live': 'polite' });
  input.setAttribute('aria-describedby', `${id}-err`);
  wrap.append(err);
  return { wrap, err };
}

export function peoplePicker(name, people, chosen) {
  const fs = el('fieldset', { class: 'field people' });
  fs.append(el('legend', {}, 'People'));
  const box = el('div', { class: 'people__list' });
  for (const p of people) {
    const id = `${name}-${p}`;
    const l = el('label', { class: 'people__item', for: id });
    const cb = el('input', { type: 'checkbox', id, name, value: p });
    cb.checked = chosen.includes(p);
    l.append(cb, document.createTextNode(p));
    box.append(l);
  }
  fs.append(box);
  return fs;
}

export function openPanel({ item, people, labels, bounds, onSave }) {
  const dlg = el('dialog', { class: 'sheet', 'aria-labelledby': 'panel-title' });
  const form = el('form', { method: 'dialog', class: 'sheet__form', novalidate: '' });
  const kind = item.kind === 'course' ? `Course, ${item.stage === 'plan' ? 'planning stage' : 'running stage'}` : item.kind[0].toUpperCase() + item.kind.slice(1);
  form.append(el('p', { class: 'sheet__kind' }, kind), el('h2', { id: 'panel-title' }, `Edit ${item.name}`));

  const name = el('input', { id: 'ip-name', type: 'text', value: item.name, autocomplete: 'off' });
  const fName = field('ip-name', 'Name', name);
  const start = el('input', { id: 'ip-start', type: 'date', value: item.start, min: bounds.min, max: bounds.max });
  const fStart = field('ip-start', 'Start', start);
  const end = el('input', { id: 'ip-end', type: 'date', value: item.end, min: bounds.min, max: bounds.max });
  const fEnd = field('ip-end', 'End', end);
  const dates = el('div', { class: 'field-row' });
  dates.append(fStart.wrap, fEnd.wrap);

  const label = el('select', { id: 'ip-label' });
  label.append(el('option', { value: '' }, 'No label'));
  for (const l of labels) {
    const o = el('option', { value: l.id }, l.name);
    if (l.id === item.label) o.selected = true;
    label.append(o);
  }
  const status = el('select', { id: 'ip-status' });
  for (const [v, t] of STATUSES) {
    const o = el('option', { value: v }, t);
    if (v === item.status) o.selected = true;
    status.append(o);
  }
  const selects = el('div', { class: 'field-row' });
  selects.append(field('ip-label', 'Label', label).wrap, field('ip-status', 'Status', status).wrap);

  const actions = el('div', { class: 'sheet__actions' });
  const save = el('button', { type: 'submit', class: 'btn', value: 'save' }, 'Save changes');
  const cancel = el('button', { type: 'button', class: 'btn btn--quiet' }, 'Cancel');
  actions.append(save, cancel);

  form.append(fName.wrap, dates, peoplePicker('ip-people', people, item.people), selects, actions);
  dlg.append(form);
  document.body.append(dlg);

  const close = () => { dlg.close(); };
  cancel.addEventListener('click', close);
  dlg.addEventListener('close', () => dlg.remove());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    fName.err.textContent = '';
    fStart.err.textContent = '';
    fEnd.err.textContent = '';
    let firstBad = null;
    const n = name.value.trim();
    if (!n) { fName.err.textContent = 'Write a name for this item.'; firstBad ||= name; }
    if (!isIsoDate(start.value) || start.value < bounds.min || start.value > bounds.max) {
      fStart.err.textContent = 'Pick a start date between 1 Nov 2026 and 30 Apr 2027.'; firstBad ||= start;
    }
    if (!isIsoDate(end.value) || end.value < bounds.min || end.value > bounds.max) {
      fEnd.err.textContent = 'Pick an end date between 1 Nov 2026 and 30 Apr 2027.'; firstBad ||= end;
    } else if (isIsoDate(start.value) && end.value < start.value) {
      fEnd.err.textContent = 'The end date has to be on or after the start date.'; firstBad ||= end;
    }
    if (firstBad) { firstBad.focus(); return; }
    const chosen = [...form.querySelectorAll('input[name="ip-people"]:checked')].map((c) => c.value);
    close();
    onSave({ name: n, start: start.value, end: end.value, people: chosen, label: label.value || undefined, status: status.value });
  });

  dlg.showModal();
  name.focus();
  return dlg;
}
