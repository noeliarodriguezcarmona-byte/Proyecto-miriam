# Differentissgood · Bodas

Portfolio de fotografía y vídeo de boda de Differentissgood: reportaje,
dron, fotos de grupo y retratos individuales para álbum.

## Qué hay aquí

1. **`index.html`** — la web para enseñar a futuras parejas: galería,
   vídeos, servicios, opiniones y un formulario de contacto que abre
   WhatsApp con el mensaje ya escrito.
2. **`historia.html`** — plantilla en formato Instagram Stories (1080×1920):
   elige una foto de la galería, escribe los nombres y la fecha, y sigue las
   instrucciones de la propia página para capturarla y subirla a Instagram.
3. **Sección "Comparte este portfolio"** dentro de `index.html`
   (`#compartir`) — para pegar el enlace de la web directamente en una
   historia o en redes, con vista previa cuidada (imagen `og-bodas.jpg`).

## Antes de publicar

1. **Sube tus fotos y vídeos.** Ver `media/LEEME.md` — es la única carpeta
   que hay que tocar para que la web deje de mostrar contenido de muestra.
2. **Número de WhatsApp real.** En `script.js`, primera línea:
   ```js
   const WHATSAPP_POR_DEFECTO = '34600000000';
   ```
3. **Rellenar los textos legales.** En `aviso-legal.html` y `privacidad.html`,
   sustituir los datos entre corchetes por los reales y borrar el bloque de
   aviso `<p class="todo">` (y su regla en `styles.css`).
4. **Poner el dominio real** en las etiquetas Open Graph de `<head>` de
   `index.html` (busca `differentissgood.com`, ahora mismo es un dominio
   provisional), y en `historia.html` si la publicas aparte.
5. **Sustituir las opiniones y nombres de ejemplo** de `index.html` por
   testimonios reales de parejas (con su permiso).

## Publicar

Es una web estática: sin dependencias, sin compilación y sin servidor. Se
puede abrir `index.html` directamente o servir esta carpeta desde cualquier
hosting estático (GitHub Pages, Cloudflare Pages, Netlify...).
