/* =========================================================
   Miriam · Quiromasaje — reserva de cita vía WhatsApp
   ========================================================= */

const WHATSAPP = '34620004434';          // 620 00 44 34
const DAYS_AHEAD = 21;                    // días laborables que se ofrecen
const MORNING = { from: 9,  to: 13 };     // 9:00 – 13:00
const AFTERNOON = { from: 15, to: 19 };   // 15:00 – 19:00
const STEP_MIN = 30;                      // franjas de media hora

const DOW   = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DOW_L = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MON   = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MON_L = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
               'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const el = {
  serviceChips: document.getElementById('service-chips'),
  dayList:      document.getElementById('day-list'),
  slotList:     document.getElementById('slot-list'),
  slotsEmpty:   document.getElementById('slots-empty'),
  summary:      document.getElementById('summary'),
  form:         document.getElementById('booking-form'),
  submit:       document.getElementById('submit-btn'),
  name:         document.getElementById('name'),
  phone:        document.getElementById('phone'),
  notes:        document.getElementById('notes'),
};

const state = {
  service: 'Quiromasaje terapéutico (60 min)',
  date: null,   // objeto Date del día elegido
  time: null,   // 'HH:MM'
};

/* ---------- Utilidades ---------- */

const isWeekday = (d) => d.getDay() >= 1 && d.getDay() <= 5;

const pad = (n) => String(n).padStart(2, '0');

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Próximos días laborables a partir de hoy. */
function upcomingWeekdays(count) {
  const days = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (days.length < count) {
    if (isWeekday(cursor)) days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

/** Todas las franjas horarias de un tramo, en formato 'HH:MM'. */
function slotsInRange({ from, to }) {
  const out = [];
  for (let m = from * 60; m < to * 60; m += STEP_MIN) {
    out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  }
  return out;
}

/** Franjas libres de un día: si es hoy, oculta las que ya pasaron. */
function slotsForDay(date) {
  const all = [...slotsInRange(MORNING), ...slotsInRange(AFTERNOON)];
  if (!sameDay(date, new Date())) return all;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return all.filter((t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m > nowMin + 60;   // margen de 1 h para avisar
  });
}

/* ---------- Render ---------- */

function renderDays() {
  const today = new Date();
  const days = upcomingWeekdays(DAYS_AHEAD);
  const buttons = [];

  days.forEach((date) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'day';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    btn.innerHTML = `
      <span class="day__dow">${sameDay(date, today) ? 'Hoy' : DOW[date.getDay()]}</span>
      <span class="day__num">${date.getDate()}</span>
      <span class="day__mon">${MON[date.getMonth()]}</span>
    `;
    btn.addEventListener('click', () => selectDay(date, btn));
    el.dayList.appendChild(btn);
    buttons.push(btn);
  });

  // Preselecciona el primer día con huecos libres (o el primero, si ninguno los tiene)
  const first = days.findIndex((d) => slotsForDay(d).length > 0);
  const idx = first === -1 ? 0 : first;
  selectDay(days[idx], buttons[idx]);
}

function selectDay(date, btn) {
  state.date = date;
  state.time = null;

  el.dayList.querySelectorAll('.day').forEach((d) => {
    const active = d === btn;
    d.classList.toggle('is-active', active);
    d.setAttribute('aria-checked', String(active));
  });

  renderSlots();
  updateSummary();
}

function renderSlots() {
  el.slotList.innerHTML = '';
  const slots = slotsForDay(state.date);

  el.slotsEmpty.hidden = slots.length > 0;

  slots.forEach((time) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'slot';
    btn.textContent = time;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    btn.addEventListener('click', () => {
      state.time = time;
      el.slotList.querySelectorAll('.slot').forEach((s) => {
        const active = s === btn;
        s.classList.toggle('is-active', active);
        s.setAttribute('aria-checked', String(active));
      });
      updateSummary();
    });
    el.slotList.appendChild(btn);
  });
}

function prettyDate(date) {
  return `${DOW_L[date.getDay()]} ${date.getDate()} de ${MON_L[date.getMonth()]}`;
}

function updateSummary() {
  if (state.date && state.time) {
    el.summary.textContent = `${prettyDate(state.date)} · ${state.time} h`;
    el.submit.disabled = false;
  } else {
    el.summary.textContent = 'Elige día y hora para continuar';
    el.submit.disabled = true;
  }
}

/* ---------- Servicio ---------- */

el.serviceChips.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  state.service = chip.dataset.service;
  el.serviceChips.querySelectorAll('.chip')
    .forEach((c) => c.classList.toggle('is-active', c === chip));
});

/* ---------- Envío a WhatsApp ---------- */

function buildMessage() {
  const name = el.name.value.trim();
  const phone = el.phone.value.trim();
  const notes = el.notes.value.trim();

  const lines = [
    '¡Hola Miriam! Me gustaría reservar una cita 🌿',
    '',
    `• Sesión: ${state.service}`,
    `• Día: ${prettyDate(state.date)}`,
    `• Hora: ${state.time} h`,
    `• Nombre: ${name}`,
  ];

  if (phone) lines.push(`• Teléfono: ${phone}`);
  if (notes) lines.push('', `Nota: ${notes}`);

  lines.push('', '¿Me confirmas si te viene bien? ¡Gracias!');
  return lines.join('\n');
}

el.form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!el.name.value.trim()) {
    el.name.classList.add('is-error');
    el.name.focus();
    el.summary.textContent = 'Escribe tu nombre para poder reservar';
    return;
  }
  el.name.classList.remove('is-error');

  if (!state.date || !state.time) {
    updateSummary();
    return;
  }

  const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(buildMessage())}`;
  window.open(url, '_blank', 'noopener');
});

el.name.addEventListener('input', () => el.name.classList.remove('is-error'));

/* ---------- Arranque ---------- */

renderDays();
updateSummary();
