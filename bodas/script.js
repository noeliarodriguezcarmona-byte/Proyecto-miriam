/* =========================================================
   Differentissgood · Bodas
   Movimiento al hacer scroll · menú · galería y vídeos ·
   formulario a WhatsApp · compartir enlace
   ========================================================= */

const WHATSAPP_POR_DEFECTO = '34620004434';   // cambia esto por el número real
const CLAVE_AVISO = 'differentissgood-bodas:aviso-oculto';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ---------------------------------------------------------
   Fotos y vídeos del reportaje: añade o quita nombres de
   archivo aquí según lo que subas a bodas/media/.
   La galería y la plantilla de Historias leen esta misma lista.
   --------------------------------------------------------- */

const FOTOS_GALERIA = Array.from({ length: 59 }, (_, i) => `boda-${String(i + 1).padStart(2, '0')}.jpg`);

// Índices (empezando en 0) de las fotos que ocupan doble ancho en la cuadrícula.
const FOTOS_ANCHAS = [2, 11, 20, 29, 38, 47, 56];

const VIDEOS_GALERIA = [
  { youtube: 'QNSZ45aThLs', titulo: 'Highlight de boda' },
];

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
  if (!cab) return;
  const marcar = () => cab.dataset.fija = String(window.scrollY > 8);
  marcar();
  addEventListener('scroll', marcar, { passive: true });
}

function menuMovil() {
  const boton = $('.menu__abrir');
  const menu  = $('#menu-movil');
  if (!boton || !menu) return;

  const alternar = (abrir) => {
    boton.setAttribute('aria-expanded', String(abrir));
    menu.hidden = !abrir;
  };

  boton.addEventListener('click', () => alternar(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.tagName === 'A') alternar(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') alternar(false); });
}

function menuActivo() {
  const enlaces = $$('.menu a');
  const secciones = enlaces.map((a) => $(a.getAttribute('href'))).filter(Boolean);
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
  if (!aviso) return;
  if (localStorage.getItem(CLAVE_AVISO) === 'si') { aviso.remove(); return; }
  $('[data-cerrar-aviso]')?.addEventListener('click', () => {
    localStorage.setItem(CLAVE_AVISO, 'si');
    aviso.remove();
  });
}

/** Si la foto de portada no está todavía, se enseña su marco de cortesía en
    vez del icono de imagen rota del navegador. */
function fotoPortada() {
  const foto = $('#foto-portada');
  const hueco = $('#hueco-portada');
  if (!foto || !hueco) return;
  const faltar = () => { foto.style.display = 'none'; hueco.hidden = false; };
  if (foto.complete && foto.naturalWidth === 0) faltar();
  foto.addEventListener('error', faltar);
}

/* ---------------------------------------------------------
   Galería: genera la cuadrícula a partir de FOTOS_GALERIA,
   con marco de cortesía para las fotos que aún no se han subido.
   --------------------------------------------------------- */

function huecoSvg(nombreArchivo) {
  return `
    <div class="hueco">
      <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="6" y="11" width="36" height="26" rx="3"/><circle cx="18" cy="21" r="3.5"/><path d="m6 32 10-8 8 6 6-5 12 9"/></svg>
      <p>Foto pendiente</p>
      <small>Sube <code>${nombreArchivo}</code> a <code>bodas/media/fotos/</code></small>
    </div>`;
}

function pintarGaleria() {
  const cuadricula = $('#cuadricula-galeria');
  if (!cuadricula) return;

  cuadricula.innerHTML = FOTOS_GALERIA.map((archivo, i) => `
    <figure class="galeria__pieza sube${FOTOS_ANCHAS.includes(i) ? ' galeria__pieza--ancha' : ''}">
      <img src="media/fotos/${archivo}" alt="Foto de boda ${i + 1}" loading="lazy" data-archivo="${archivo}">
      ${huecoSvg(archivo)}
    </figure>`).join('');

  $$('.galeria__pieza img', cuadricula).forEach((img) => {
    const hueco = img.nextElementSibling;
    const faltar = () => { img.style.display = 'none'; hueco.hidden = false; };
    hueco.hidden = true;
    img.addEventListener('error', faltar);
  });
}

/* ---------------------------------------------------------
   Vídeos: genera la fila a partir de VIDEOS_GALERIA
   --------------------------------------------------------- */

function pintarVideos() {
  const fila = $('#fila-videos');
  if (!fila) return;

  fila.innerHTML = VIDEOS_GALERIA.map(({ archivo, youtube, titulo }) => youtube ? `
    <figure class="video sube">
      <iframe src="https://www.youtube-nocookie.com/embed/${youtube}" title="${titulo}"
              loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen style="width:100%;height:100%;border:0;"></iframe>
      <figcaption>${titulo}</figcaption>
    </figure>` : `
    <figure class="video sube">
      <video src="media/videos/${archivo}" controls preload="metadata" playsinline data-archivo="${archivo}"></video>
      <figcaption>${titulo}</figcaption>
      <div class="hueco" hidden>
        <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 12h32v24H8z"/><path d="m20 20 10 6-10 6Z"/></svg>
        <p>Vídeo pendiente</p>
        <small>Sube <code>${archivo}</code> a <code>bodas/media/videos/</code></small>
      </div>
    </figure>`).join('');

  $$('.video video', fila).forEach((video) => {
    const hueco = video.parentElement.querySelector('.hueco');
    video.addEventListener('error', () => { video.style.display = 'none'; hueco.hidden = false; });
  });
}

/* ---------------------------------------------------------
   Compartir: copiar el enlace del portfolio
   --------------------------------------------------------- */

function compartir() {
  const boton = $('#btn-copiar');
  const enlace = $('#enlace-portfolio');
  const aviso = $('#copiado-aviso');
  if (!boton || !enlace) return;

  boton.addEventListener('click', async () => {
    const texto = enlace.textContent.trim();
    try {
      await navigator.clipboard.writeText(texto);
      aviso.textContent = 'Enlace copiado. Ya puedes pegarlo en tu historia de Instagram.';
    } catch {
      aviso.textContent = 'No se ha podido copiar automáticamente: copia el enlace de arriba a mano.';
    }
  });
}

/* ---------------------------------------------------------
   Formulario de contacto a WhatsApp
   --------------------------------------------------------- */

function formularioWhatsApp() {
  const form  = $('#formulario');
  const aviso = $('#aviso');
  if (!form) return;

  const campos = [
    { el: $('#f-nombre'),   texto: 'Escribe vuestros nombres para poder contestaros' },
    { el: $('#f-telefono'), texto: 'Necesitamos un teléfono de contacto' },
    { el: $('#f-mensaje'),  texto: 'Contadnos brevemente qué necesitáis' },
  ];
  const consiento = $('#f-consiento');

  const decir = (texto, estado) => {
    aviso.textContent = texto;
    aviso.dataset.estado = estado;
  };

  const mensaje = () => [
    '¡Hola Differentissgood! Nos gustaría pedir presupuesto para nuestra boda 💍',
    '',
    `• Nombres: ${$('#f-nombre').value.trim()}`,
    `• Teléfono: ${$('#f-telefono').value.trim()}`,
    `• Fecha de la boda: ${$('#f-fecha').value || 'por confirmar'}`,
    `• Nos interesa: ${$('#f-servicio').value}`,
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

    if (consiento && !consiento.checked) {
      consiento.parentElement.dataset.invalido = 'true';
      consiento.focus();
      decir('Acepta la política de privacidad para poder enviarlo', 'error');
      return;
    }

    const url = `https://wa.me/${WHATSAPP_POR_DEFECTO}?text=${encodeURIComponent(mensaje())}`;
    const ventana = window.open(url, '_blank', 'noopener');
    if (!ventana || ventana.closed) { location.href = url; return; }

    decir('Se ha abierto WhatsApp con vuestro mensaje. Pulsa enviar para que nos llegue.', 'ok');
  });

  campos.forEach(({ el }) => el.addEventListener('input', () => {
    el.removeAttribute('aria-invalid');
    if (aviso.dataset.estado === 'error') decir('', 'ok');
  }));

  consiento?.addEventListener('change', () => {
    delete consiento.parentElement.dataset.invalido;
    if (aviso.dataset.estado === 'error') decir('', 'ok');
  });
}

/* ---------------------------------------------------------
   Arranque
   --------------------------------------------------------- */

pintarGaleria();
pintarVideos();
fotoPortada();
avisoProvisional();
cabecera();
menuMovil();
menuActivo();
compartir();
formularioWhatsApp();
animarEntradas();
