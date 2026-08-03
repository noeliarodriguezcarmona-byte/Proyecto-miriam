/* =========================================================
   DIG Beauty · versión B
   Entrada al bajar · menú · valoraciones rotativas
   · formulario a WhatsApp · panel de edición
   ========================================================= */

const WHATSAPP_DEFECTO = '34620004434';   // 620 00 44 34
const K_TEXTOS = 'dig-b:textos';
const K_WA     = 'dig-b:whatsapp';
const K_AVISO  = 'dig-b:aviso';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const whatsapp = () => localStorage.getItem(K_WA) || WHATSAPP_DEFECTO;
const sinRuido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------
   Entrada al bajar
   --------------------------------------------------------- */

function entradas() {
  const bloques = $$('.entra');

  if (!('IntersectionObserver' in window) || sinRuido()) {
    bloques.forEach((b) => b.classList.add('vista'));
    return;
  }

  const obs = new IntersectionObserver((filas) => {
    filas.forEach((fila) => {
      if (!fila.isIntersecting) return;
      const hermanos = [...fila.target.parentElement.children].filter((n) => n.classList.contains('entra'));
      setTimeout(() => fila.target.classList.add('vista'), Math.max(0, hermanos.indexOf(fila.target)) * 100);
      obs.unobserve(fila.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

  bloques.forEach((b) => obs.observe(b));
}

/* ---------------------------------------------------------
   Barra y menú
   --------------------------------------------------------- */

function barra() {
  const b = $('#barra');
  const marcar = () => b.dataset.pegada = String(scrollY > 8);
  marcar();
  addEventListener('scroll', marcar, { passive: true });
}

function menu() {
  const boton = $('.hamburguesa');
  const lista = $('#nav-movil');

  const abrir = (si) => {
    boton.setAttribute('aria-expanded', String(si));
    lista.hidden = !si;
  };

  boton.addEventListener('click', () => abrir(lista.hidden));
  lista.addEventListener('click', (e) => { if (e.target.tagName === 'A') abrir(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') abrir(false); });
}

function menuActivo() {
  const enlaces = $$('.nav a');
  const zonas = enlaces.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if (!zonas.length || !('IntersectionObserver' in window)) return;

  const obs = new IntersectionObserver((filas) => {
    filas.forEach((fila) => {
      if (!fila.isIntersecting) return;
      enlaces.forEach((a) => a.setAttribute('aria-current',
        String(a.getAttribute('href') === `#${fila.target.id}`)));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  zonas.forEach((z) => obs.observe(z));
}

function avisoMuestra() {
  const aviso = $('#aviso-muestra');
  if (localStorage.getItem(K_AVISO) === 'si') { aviso.remove(); return; }
  $('[data-cerrar-aviso]').addEventListener('click', () => {
    localStorage.setItem(K_AVISO, 'si');
    aviso.remove();
  });
}

/** Si una foto no está todavía, se enseña su marco en vez del icono de rota. */
function fotos() {
  const foto = $('#foto-portada');
  const hueco = $('#hueco-portada');
  if (!foto || !hueco) return;

  const faltar = () => { foto.style.display = 'none'; hueco.hidden = false; };
  if (foto.complete && foto.naturalWidth === 0) faltar();
  foto.addEventListener('error', faltar);
}

function irAlMapa() {
  const direccion = $('[data-txt="lugar.direccion"]').textContent.trim();
  $('#ir-mapa').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
}

/* ---------------------------------------------------------
   Valoraciones: una cada vez, rotando
   --------------------------------------------------------- */

function valoraciones() {
  const fichas = $$('.testimonio');
  const puntos = $('#puntos');
  if (fichas.length < 2) return;

  let actual = 0;
  let reloj = null;

  const botones = fichas.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Valoración ${i + 1}`);
    b.addEventListener('click', () => { mostrar(i); arrancar(); });
    puntos.appendChild(b);
    return b;
  });

  function mostrar(i) {
    actual = (i + fichas.length) % fichas.length;
    fichas.forEach((f, n) => {
      if (n === actual) f.dataset.activo = String(n);
      else delete f.dataset.activo;
    });
    botones.forEach((b, n) => b.setAttribute('aria-selected', String(n === actual)));
  }

  const arrancar = () => {
    clearInterval(reloj);
    if (!sinRuido()) reloj = setInterval(() => mostrar(actual + 1), 7000);
  };

  $('#anterior').addEventListener('click', () => { mostrar(actual - 1); arrancar(); });
  $('#siguiente').addEventListener('click', () => { mostrar(actual + 1); arrancar(); });

  // Al leer una, no se cambia sola bajo los ojos
  const zona = $('.cita-grande');
  zona.addEventListener('mouseenter', () => clearInterval(reloj));
  zona.addEventListener('mouseleave', arrancar);
  zona.addEventListener('focusin', () => clearInterval(reloj));

  mostrar(0);
  arrancar();
}

/* ---------------------------------------------------------
   Formulario a WhatsApp
   --------------------------------------------------------- */

function formulario() {
  const form = $('#hoja');
  const salida = $('#respuesta');

  const obligatorios = [
    { el: $('#c-nombre'),   aviso: 'Escribe tu nombre para poder contestarte' },
    { el: $('#c-telefono'), aviso: 'Necesitamos un teléfono de contacto' },
    { el: $('#c-mensaje'),  aviso: 'Cuéntanos brevemente qué necesitas' },
  ];

  const decir = (texto, estado) => {
    salida.textContent = texto;
    salida.dataset.estado = estado;
  };

  const mensaje = () => [
    '¡Hola DIG Beauty! Me gustaría pedir información ✨',
    '',
    `• Nombre: ${$('#c-nombre').value.trim()}`,
    `• Teléfono: ${$('#c-telefono').value.trim()}`,
    `• Me interesa: ${$('#c-servicio').value}`,
    '',
    $('#c-mensaje').value.trim(),
  ].join('\n');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const falta = obligatorios.find(({ el }) => !el.value.trim());
    if (falta) {
      falta.el.setAttribute('aria-invalid', 'true');
      falta.el.focus();
      decir(falta.aviso, 'error');
      return;
    }

    const url = `https://wa.me/${whatsapp()}?text=${encodeURIComponent(mensaje())}`;

    // Si el navegador bloquea la pestaña, navegamos en la misma:
    // más vale perder la página que perder el contacto.
    const ventana = window.open(url, '_blank', 'noopener');
    if (!ventana || ventana.closed) { location.href = url; return; }

    decir('Se ha abierto WhatsApp con tu mensaje. Pulsa enviar para que nos llegue.', 'ok');
  });

  obligatorios.forEach(({ el }) => el.addEventListener('input', () => {
    el.removeAttribute('aria-invalid');
    if (salida.dataset.estado === 'error') decir('', 'ok');
  }));
}

/* ---------------------------------------------------------
   Panel de edición
   --------------------------------------------------------- */

const GRUPOS = {
  portada: 'Portada', tira: 'Cifras', servicios: 'Servicios',
  s1: 'Estética avanzada', s2: 'Tratamientos faciales', s3: 'Masajes',
  s4: 'Depilación', s5: 'Productos',
  noelia: 'Noelia y equipo', opiniones: 'Valoraciones',
  op1: 'Valoración 1', op2: 'Valoración 2', op3: 'Valoración 3',
  op4: 'Valoración 4', op5: 'Valoración 5',
  lugar: 'Dónde estamos', contacto: 'Contacto', pie: 'Pie',
};

const NOMBRES = {
  pico: 'Etiqueta', titulo: 'Título', sumario: 'Descripción', texto: 'Texto',
  nombre: 'Nombre', lista: 'Lista (una por línea)', autora: 'Nombre',
  detalle: 'Servicio y fecha', cargo: 'Cargo', titulaciones: 'Titulaciones (una por línea)',
  direccion: 'Dirección', horario: 'Horario', telefono: 'Teléfono', correo: 'Correo',
  lema: 'Lema', '1n': 'Cifra 1', '1t': 'Pie 1', '2n': 'Cifra 2', '2t': 'Pie 2',
  '3n': 'Cifra 3', '3t': 'Pie 3', '4n': 'Cifra 4', '4t': 'Pie 4',
};

const editables = () => [
  ...$$('[data-txt]').map((el) => ({ el, clave: el.dataset.txt, lista: false })),
  ...$$('[data-txt-lista]').map((el) => ({ el, clave: el.dataset.txtLista, lista: true })),
];

// El HTML viene indentado: los saltos y espacios no son contenido.
const limpio = (t) => t.replace(/\s+/g, ' ').trim();

const leer = ({ el, lista }) => lista
  ? $$('li', el).map((li) => limpio(li.textContent)).join('\n')
  : limpio(el.textContent);

const escribir = ({ el, lista }, valor) => {
  if (!lista) { el.textContent = valor; return; }
  el.replaceChildren(...valor.split('\n').filter((l) => l.trim()).map((l) => {
    const li = document.createElement('li');
    li.textContent = l.trim();
    return li;
  }));
};

function aplicarGuardados() {
  const guardado = JSON.parse(localStorage.getItem(K_TEXTOS) || '{}');
  editables().forEach((campo) => {
    if (campo.clave in guardado) escribir(campo, guardado[campo.clave]);
  });
}

function panel() {
  const caja   = $('#panel');
  const abrir  = $('#editar');
  const cerrar = $('#cerrar-panel');
  const lista  = $('#panel-lista');
  const campoWa= $('#wa');

  const guardado = () => JSON.parse(localStorage.getItem(K_TEXTOS) || '{}');
  const guardar = (o) => localStorage.setItem(K_TEXTOS, JSON.stringify(o));

  let grupo = null;
  editables().forEach((campo) => {
    const raiz = campo.clave.split('.')[0];
    if (raiz !== grupo) {
      grupo = raiz;
      const t = document.createElement('p');
      t.className = 'panel__grupo';
      t.textContent = GRUPOS[raiz] || raiz;
      lista.appendChild(t);
    }

    const hoja = campo.clave.split('.').at(-1);
    const etiqueta = document.createElement('label');
    const nombre = document.createElement('span');
    nombre.textContent = NOMBRES[hoja] || hoja;

    const area = document.createElement('textarea');
    area.value = leer(campo);
    area.rows = campo.lista ? 4 : Math.min(5, Math.ceil(area.value.length / 44) || 1);
    area.addEventListener('input', () => {
      escribir(campo, area.value);
      guardar({ ...guardado(), [campo.clave]: area.value });
      if (campo.clave === 'lugar.direccion') irAlMapa();
    });

    etiqueta.append(nombre, area);
    lista.appendChild(etiqueta);
  });

  campoWa.value = whatsapp();
  campoWa.addEventListener('input', () => {
    localStorage.setItem(K_WA, campoWa.value.replace(/\D/g, ''));
  });

  const alternar = (ver) => {
    caja.hidden = !ver;
    abrir.setAttribute('aria-expanded', String(ver));
    (ver ? cerrar : abrir).focus();
  };

  abrir.addEventListener('click', () => alternar(caja.hidden));
  cerrar.addEventListener('click', () => alternar(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !caja.hidden) alternar(false); });

  $('#descargar').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ whatsapp: whatsapp(), textos: guardado() }, null, 2)],
                          { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'dig-beauty-b-textos.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  $('#restaurar').addEventListener('click', () => {
    localStorage.removeItem(K_TEXTOS);
    localStorage.removeItem(K_WA);
    location.reload();
  });

  if (location.hash === '#editar') alternar(true);
}

/* ---------------------------------------------------------
   Arranque
   --------------------------------------------------------- */

aplicarGuardados();
avisoMuestra();
barra();
menu();
menuActivo();
irAlMapa();
fotos();
valoraciones();
formulario();
panel();
entradas();
