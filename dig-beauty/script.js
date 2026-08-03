/* =========================================================
   DIG Beauty
   Movimiento al hacer scroll · menú · formulario a WhatsApp
   · panel de edición de textos
   ========================================================= */

const WHATSAPP_POR_DEFECTO = '34620004434';   // 620 00 44 34
const CLAVE_TEXTOS = 'dig-beauty:textos';
const CLAVE_WA     = 'dig-beauty:whatsapp';
const CLAVE_AVISO  = 'dig-beauty:aviso-oculto';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const whatsapp = () => localStorage.getItem(CLAVE_WA) || WHATSAPP_POR_DEFECTO;

/* ---------------------------------------------------------
   Entrada al hacer scroll: cada bloque sube al asomar
   --------------------------------------------------------- */

function animarEntradas() {
  const bloques = $$('.sube');

  if (!('IntersectionObserver' in window) ||
      matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bloques.forEach((b) => b.classList.add('visible'));
    return;
  }

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      // Escalona los hermanos para que el bloque entre como una sola pieza
      const hermanos = [...entrada.target.parentElement.children].filter((n) => n.classList.contains('sube'));
      const retraso = Math.max(0, hermanos.indexOf(entrada.target)) * 90;
      setTimeout(() => entrada.target.classList.add('visible'), retraso);
      observador.unobserve(entrada.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: .12 });

  bloques.forEach((b) => observador.observe(b));
}

/* ---------------------------------------------------------
   Cabecera y menú
   --------------------------------------------------------- */

function cabecera() {
  const cab = $('#cabecera');
  const marcar = () => cab.dataset.fija = String(window.scrollY > 8);
  marcar();
  addEventListener('scroll', marcar, { passive: true });
}

function menuMovil() {
  const boton = $('.menu__abrir');
  const menu  = $('#menu-movil');

  const alternar = (abrir) => {
    boton.setAttribute('aria-expanded', String(abrir));
    menu.hidden = !abrir;
  };

  boton.addEventListener('click', () => alternar(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.tagName === 'A') alternar(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') alternar(false); });
}

/** Resalta en el menú la sección que se está viendo. */
function menuActivo() {
  const enlaces = $$('.menu a');
  const secciones = enlaces
    .map((a) => $(a.getAttribute('href')))
    .filter(Boolean);
  if (!secciones.length || !('IntersectionObserver' in window)) return;

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      enlaces.forEach((a) => a.setAttribute('aria-current',
        String(a.getAttribute('href') === `#${entrada.target.id}`)));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  secciones.forEach((s) => observador.observe(s));
}

/* ---------------------------------------------------------
   Aviso de contenido provisional
   --------------------------------------------------------- */

function avisoProvisional() {
  const aviso = $('#pendiente');
  if (localStorage.getItem(CLAVE_AVISO) === 'si') { aviso.remove(); return; }
  $('[data-cerrar-aviso]').addEventListener('click', () => {
    localStorage.setItem(CLAVE_AVISO, 'si');
    aviso.remove();
  });
}

/* ---------------------------------------------------------
   Enlace al mapa y teléfono, a partir de los textos actuales
   --------------------------------------------------------- */

function enlaceMapa() {
  const direccion = $('[data-txt="donde.direccion"]').textContent.trim();
  $('#enlace-mapa').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
}

/* ---------------------------------------------------------
   Formulario de contacto a WhatsApp
   --------------------------------------------------------- */

function formularioWhatsApp() {
  const form  = $('#formulario');
  const aviso = $('#aviso');

  const campos = [
    { el: $('#f-nombre'),   texto: 'Escribe tu nombre para poder contestarte' },
    { el: $('#f-telefono'), texto: 'Necesitamos un teléfono de contacto' },
    { el: $('#f-mensaje'),  texto: 'Cuéntanos brevemente qué necesitas' },
  ];

  const decir = (texto, estado) => {
    aviso.textContent = texto;
    aviso.dataset.estado = estado;
  };

  const mensaje = () => [
    '¡Hola DIG Beauty! Me gustaría pedir información 🍊',
    '',
    `• Nombre: ${$('#f-nombre').value.trim()}`,
    `• Teléfono: ${$('#f-telefono').value.trim()}`,
    `• Me interesa: ${$('#f-servicio').value}`,
    '',
    $('#f-mensaje').value.trim(),
  ].join('\n');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const falta = campos.find(({ el }) => !el.value.trim());
    if (falta) {
      falta.el.setAttribute('aria-invalid', 'true');
      falta.el.focus();
      decir(falta.texto, 'error');
      return;
    }

    const url = `https://wa.me/${whatsapp()}?text=${encodeURIComponent(mensaje())}`;

    // Si el navegador bloquea la pestaña, navegamos en la misma: más vale
    // perder la página que perder el contacto.
    const ventana = window.open(url, '_blank', 'noopener');
    if (!ventana || ventana.closed) { location.href = url; return; }

    decir('Se ha abierto WhatsApp con tu mensaje. Pulsa enviar para que nos llegue.', 'ok');
  });

  campos.forEach(({ el }) => el.addEventListener('input', () => {
    el.removeAttribute('aria-invalid');
    if (aviso.dataset.estado === 'error') decir('', 'ok');
  }));
}

/* ---------------------------------------------------------
   Carrusel de valoraciones
   --------------------------------------------------------- */

/** La pista lleva dos copias seguidas para que el desplazamiento no dé saltos.
    La copia se regenera al editar, así refleja siempre lo que hay escrito. */
function duplicarCarrusel() {
  const pista = $('#pista');
  const original = $('#opiniones');
  if (!pista || !original) return;

  $$('[data-copia]', pista).forEach((c) => c.remove());

  const copia = original.cloneNode(true);
  copia.removeAttribute('id');
  copia.dataset.copia = 'si';
  copia.setAttribute('aria-hidden', 'true');
  // sin marcas de edición: si no, el panel montaría dos campos por texto
  $$('[data-txt], [data-txt-lista]', copia).forEach((el) => {
    el.removeAttribute('data-txt');
    el.removeAttribute('data-txt-lista');
  });
  $$('a, button', copia).forEach((el) => el.setAttribute('tabindex', '-1'));

  pista.appendChild(copia);
}

/** La inicial del círculo sale del nombre, para que no se descuadren al editar. */
function iniciales() {
  $$('.firma').forEach((firma) => {
    const nombre = $('b', firma)?.textContent.trim() || '';
    const circulo = $('.firma__inicial', firma);
    if (circulo) circulo.textContent = nombre.charAt(0).toUpperCase();
  });
}

/* ---------------------------------------------------------
   Panel de edición de textos
   --------------------------------------------------------- */

const GRUPOS = {
  inicio: 'Inicio',
  filosofia: 'Quiénes somos',
  valores: 'Valores',
  estetica: 'Estética avanzada',
  faciales: 'Tratamientos faciales',
  masajes: 'Masajes',
  depilacion: 'Depilación',
  productos: 'Productos',
  valoraciones: 'Valoraciones',
  opinion: 'Opiniones',
  donde: 'Dónde estamos',
  cita: 'Contacto',
  pie: 'Pie',
};

const ETIQUETAS = {
  etiqueta: 'Etiqueta', titulo: 'Título', entrada: 'Descripción',
  texto: 'Valoración', autora: 'Nombre', servicio: 'Servicio', fecha: 'Fecha',
  lista: 'Lista (una por línea)', nota: 'Nota media', resumen: 'Pie de la nota',
  direccion: 'Dirección', horario: 'Horario', telefono: 'Teléfono',
  correo: 'Correo', lema: 'Lema', p1: 'Párrafo 1', p2: 'Párrafo 2',
};

/** Todos los elementos editables: texto suelto y listas. */
function editables() {
  return [
    ...$$('[data-txt]').map((el) => ({ el, clave: el.dataset.txt, lista: false })),
    ...$$('[data-txt-lista]').map((el) => ({ el, clave: el.dataset.txtLista, lista: true })),
  ];
}

// El HTML viene indentado, así que el texto trae saltos y espacios que no
// forman parte del contenido: se colapsan antes de mostrarlos en el panel.
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
  const guardado = JSON.parse(localStorage.getItem(CLAVE_TEXTOS) || '{}');
  editables().forEach((campo) => {
    if (campo.clave in guardado) escribir(campo, guardado[campo.clave]);
  });
}

function panelEdicion() {
  const panel     = $('#panel');
  const abrir     = $('#panel-abrir');
  const cerrar    = $('#panel-cerrar');
  const contenedor= $('#panel-campos');
  const entradaWa = $('#panel-wa');

  const guardado = () => JSON.parse(localStorage.getItem(CLAVE_TEXTOS) || '{}');
  const guardar = (obj) => localStorage.setItem(CLAVE_TEXTOS, JSON.stringify(obj));

  // construir un campo por texto editable, agrupados por sección
  let grupoActual = null;
  editables().forEach((campo) => {
    const grupo = campo.clave.split('.')[0];
    if (grupo !== grupoActual) {
      grupoActual = grupo;
      const t = document.createElement('p');
      t.className = 'panel__grupo';
      t.textContent = GRUPOS[grupo] || grupo;
      contenedor.appendChild(t);
    }

    const partes = campo.clave.split('.');
    const nombre = ETIQUETAS[partes.at(-1)] || partes.at(-1);
    const sufijo = partes.length === 3 ? ` ${partes[1]}` : '';

    const etiqueta = document.createElement('label');
    const span = document.createElement('span');
    span.textContent = nombre + sufijo;
    const area = document.createElement('textarea');
    area.rows = campo.lista ? 4 : Math.min(5, Math.ceil(leer(campo).length / 46) || 1);
    area.value = leer(campo);

    area.addEventListener('input', () => {
      escribir(campo, area.value);
      guardar({ ...guardado(), [campo.clave]: area.value });
      if (campo.clave === 'donde.direccion') enlaceMapa();
      if (campo.clave.endsWith('.autora')) iniciales();
      if (campo.clave.startsWith('opinion.')) { iniciales(); duplicarCarrusel(); }
    });

    etiqueta.append(span, area);
    contenedor.appendChild(etiqueta);
  });

  entradaWa.value = whatsapp();
  entradaWa.addEventListener('input', () => {
    localStorage.setItem(CLAVE_WA, entradaWa.value.replace(/\D/g, ''));
  });

  const alternar = (mostrar) => {
    panel.hidden = !mostrar;
    abrir.setAttribute('aria-expanded', String(mostrar));
    if (mostrar) cerrar.focus(); else abrir.focus();
  };

  abrir.addEventListener('click', () => alternar(panel.hidden));
  cerrar.addEventListener('click', () => alternar(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) alternar(false); });

  $('#panel-descargar').addEventListener('click', () => {
    const datos = { whatsapp: whatsapp(), textos: guardado() };
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'dig-beauty-textos.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  $('#panel-restaurar').addEventListener('click', () => {
    localStorage.removeItem(CLAVE_TEXTOS);
    localStorage.removeItem(CLAVE_WA);
    location.reload();
  });

  // Abrir directamente con #editar en la dirección
  if (location.hash === '#editar') alternar(true);
}

/* ---------------------------------------------------------
   Arranque
   --------------------------------------------------------- */

aplicarGuardados();
iniciales();
duplicarCarrusel();
avisoProvisional();
cabecera();
menuMovil();
menuActivo();
enlaceMapa();
formularioWhatsApp();
panelEdicion();
animarEntradas();
