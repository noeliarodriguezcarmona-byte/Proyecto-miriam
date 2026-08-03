const WHATSAPP  = '34620004434';
const DAYS_AHEAD = 21;
const MORNING    = { from: 9,  to: 13 };
const AFTERNOON  = { from: 15, to: 19 };
const STEP_MIN   = 30;
const LEAD_MIN   = 60;   // margen mínimo para reservar el mismo día

const DOW   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const DOW_L = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const MON   = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const MON_L = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

const el = {
  chips:   document.getElementById('service-chips'),
  days:    document.getElementById('day-list'),
  slots:   document.getElementById('slot-list'),
  empty:   document.getElementById('slots-empty'),
  summary: document.getElementById('summary'),
  form:    document.getElementById('booking-form'),
  submit:  document.getElementById('submit-btn'),
  name:    document.getElementById('name'),
  phone:   document.getElementById('phone'),
  notes:   document.getElementById('notes'),
};

const state = { service: 'Quiromasaje terapéutico (60 min)', date: null, time: null };

const pad = (n) => String(n).padStart(2, '0');
const isWeekday = (d) => d.getDay() >= 1 && d.getDay() <= 5;
const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function upcomingWeekdays(count) {
  const out = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (out.length < count) {
    if (isWeekday(cursor)) out.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

function slotsInRange({ from, to }) {
  const out = [];
  for (let m = from * 60; m < to * 60; m += STEP_MIN) out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  return out;
}

/** Franjas libres del día; si es hoy, oculta las que ya pasaron. */
function slotsForDay(date) {
  const all = [...slotsInRange(MORNING), ...slotsInRange(AFTERNOON)];
  if (!sameDay(date, new Date())) return all;
  const now = new Date();
  const limit = now.getHours() * 60 + now.getMinutes() + LEAD_MIN;
  return all.filter((t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m > limit;
  });
}

const prettyDate = (d) => `${DOW_L[d.getDay()]} ${d.getDate()} de ${MON_L[d.getMonth()]}`;

function renderDays() {
  const today = new Date();
  const days = upcomingWeekdays(DAYS_AHEAD);
  const buttons = days.map((date) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'day';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    btn.innerHTML =
      `<small>${sameDay(date, today) ? 'Hoy' : DOW[date.getDay()]}</small>` +
      `<b>${date.getDate()}</b><small>${MON[date.getMonth()]}</small>`;
    btn.addEventListener('click', () => selectDay(date, btn));
    el.days.appendChild(btn);
    return btn;
  });

  const first = days.findIndex((d) => slotsForDay(d).length > 0);
  const i = first === -1 ? 0 : first;
  selectDay(days[i], buttons[i]);
}

function selectDay(date, btn) {
  state.date = date;
  state.time = null;
  el.days.querySelectorAll('.day').forEach((d) => d.setAttribute('aria-checked', String(d === btn)));
  renderSlots();
  updateSummary();
}

function renderSlots() {
  el.slots.replaceChildren();
  const slots = slotsForDay(state.date);
  el.empty.hidden = slots.length > 0;

  slots.forEach((time) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'slot';
    btn.textContent = time;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    btn.addEventListener('click', () => {
      state.time = time;
      el.slots.querySelectorAll('.slot').forEach((s) => s.setAttribute('aria-checked', String(s === btn)));
      updateSummary();
    });
    el.slots.appendChild(btn);
  });
}

function updateSummary(message) {
  if (message) {
    el.summary.textContent = message;
    el.summary.dataset.state = 'error';
    return;
  }
  el.summary.dataset.state = 'ok';
  if (state.date && state.time) {
    el.summary.textContent = `${prettyDate(state.date)} · ${state.time} h`;
    el.submit.disabled = false;
  } else {
    el.summary.textContent = 'Elige día y hora para continuar';
    el.submit.disabled = true;
  }
}

el.chips.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  state.service = chip.dataset.service;
  el.chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
});

function buildMessage() {
  const lines = [
    '¡Hola Miriam! Me gustaría reservar una cita 🌿',
    '',
    `• Sesión: ${state.service}`,
    `• Día: ${prettyDate(state.date)}`,
    `• Hora: ${state.time} h`,
    `• Nombre: ${el.name.value.trim()}`,
  ];
  const phone = el.phone.value.trim();
  const notes = el.notes.value.trim();
  if (phone) lines.push(`• Teléfono: ${phone}`);
  if (notes) lines.push('', `Nota: ${notes}`);
  lines.push('', '¿Me confirmas si te viene bien? ¡Gracias!');
  return lines.join('\n');
}

el.form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!el.name.value.trim()) {
    el.name.setAttribute('aria-invalid', 'true');
    el.name.focus();
    updateSummary('Escribe tu nombre para poder reservar');
    return;
  }
  if (!state.date || !state.time) { updateSummary(); return; }

  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(buildMessage())}`, '_blank', 'noopener');
});

el.name.addEventListener('input', () => {
  el.name.removeAttribute('aria-invalid');
  if (el.summary.dataset.state === 'error') updateSummary();
});

renderDays();
updateSummary();
