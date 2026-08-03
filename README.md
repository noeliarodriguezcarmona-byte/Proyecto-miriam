# Miriam · Quiromasaje

Web de una sola página para el servicio de quiromasaje de Miriam.
Diseño minimalista y espiritual (verdes salvia, azules agua, ilustración de chakras)
con un sistema de reserva de cita que se envía directamente por WhatsApp.

## Cómo funciona la reserva

1. La clienta elige el tipo de sesión.
2. Elige día (solo laborables, próximas 3 semanas) y hora.
3. Escribe su nombre y, si quiere, teléfono y una nota.
4. Al pulsar **Enviar cita por WhatsApp** se abre WhatsApp con el mensaje ya redactado
   —sesión, día, hora, nombre y notas— listo para enviar al **620 00 44 34**.

Las franjas del mismo día que ya han pasado (o quedan a menos de 1 hora) se ocultan
automáticamente.

## Horario

Lunes a viernes · 9:00–13:00 y 15:00–19:00 · franjas de 30 minutos.

## Tema claro y oscuro

La paleta está definida como variables CSS en `:root` y se redefine para modo oscuro.
La página se adapta sola a la preferencia del dispositivo.

## Archivos

| Archivo | Contenido |
|---|---|
| `index.html`   | Estructura de la página y la ilustración de chakras (SVG) |
| `styles.css`   | Paleta, tipografías y todo el diseño |
| `script.js`    | Calendario, franjas horarias y generación del mensaje de WhatsApp |
| `aviso-legal.html` · `privacidad.html` · `cookies.html` | Un texto legal por página |
| `404.html`     | Página de error |
| `og-image.png` | Imagen que se ve al compartir el enlace (1200 × 630) |
| `robots.txt` · `sitemap.xml` | Indexación en buscadores |

## Ajustes rápidos

Todo lo configurable está en las primeras líneas de `script.js`:

```js
const WHATSAPP = '34620004434';         // número de destino (con prefijo, sin +)
const DAYS_AHEAD = 21;                  // días laborables que se ofrecen
const MORNING   = { from: 9,  to: 13 }; // turno de mañana
const AFTERNOON = { from: 15, to: 19 }; // turno de tarde
const STEP_MIN  = 30;                   // duración de cada franja, en minutos
```

Los tres servicios se editan en `index.html`: en las tarjetas de la sección
`#servicios` y en los botones `data-service` del paso 1 del formulario.

## Publicar

Es una web estática: sin dependencias, sin compilación y sin servidor. Se puede abrir
`index.html` directamente o servir la carpeta desde cualquier hosting estático.

### Antes de publicar

1. **Rellenar los textos legales.** En `aviso-legal.html` y `privacidad.html`,
   sustituir los datos entre corchetes por los reales y borrar el bloque de aviso
   `<p class="todo">` (y su regla en `styles.css`).
2. **Poner el dominio real.** Buscar `TU-DOMINIO.es` y sustituirlo en las cuatro
   etiquetas del `<head>` de `index.html`, en `robots.txt` y en `sitemap.xml`.
   Sin esto la tarjeta de WhatsApp no muestra la imagen, porque Open Graph exige
   URL absolutas.
3. **Revisar los servicios y las duraciones** en `index.html` (tarjetas de
   `#servicios` y atributos `data-service` del paso 1).

### Desplegar en Cloudflare Pages

1. Entrar en [dash.cloudflare.com](https://dash.cloudflare.com) → *Workers & Pages*
   → *Create* → *Pages* → *Connect to Git*.
2. Elegir este repositorio.
3. Framework preset: **None**. Build command: **vacío**. Output directory: **`/`**.
4. *Save and Deploy*. Queda publicada en una dirección `.pages.dev`.
5. Para el dominio propio: pestaña *Custom domains* → *Set up a domain*.

Cada push a la rama de producción vuelve a desplegar automáticamente.
