# Sube aquí tus fotos y vídeos de Pixiset

La web ya está montada y funcionando con marcos de "foto pendiente" en cada
hueco. En cuanto subas un archivo con el nombre exacto que espera, aparece
solo — no hay que tocar código.

## Cómo subir un archivo a esta carpeta desde GitHub

1. Entra en esta carpeta (`bodas/media/`, o la subcarpeta `fotos/` o `videos/`
   según toque) en github.com.
2. Botón **Add file → Upload files**.
3. Arrastra el archivo ya descargado de Pixiset **con el nombre exacto** de la
   lista de abajo (o renómbralo antes de subirlo).
4. **Commit changes** directamente en la rama
   `claude/pixiset-wedding-portfolio-3xt0q9`.

## Portada (raíz de `media/`)

| Archivo | Dónde sale | Tamaño recomendado |
|---|---|---|
| `portada.jpg` | Foto grande de la sección de inicio | Vertical, mínimo 1600×2000 |
| `og-bodas.jpg` | Vista previa al compartir el enlace (WhatsApp, Instagram) | 1200×630 |

## Fotos de la galería (`media/fotos/`)

Sube hasta 12, con estos nombres exactos:

```
boda-01.jpg   boda-02.jpg   boda-03.jpg   boda-04.jpg
boda-05.jpg   boda-06.jpg   boda-07.jpg   boda-08.jpg
boda-09.jpg   boda-10.jpg   boda-11.jpg   boda-12.jpg
```

Si tienes menos de 12, sube las que tengas: las que falten se quedan con su
marco de "foto pendiente" hasta que las añadas. Si quieres más de 12 o
cambiar los nombres, dímelo y ajusto la lista en `script.js`
(`FOTOS_GALERIA`).

## Vídeos (`media/videos/`)

```
boda-01.mp4   boda-02.mp4
```

Highlights cortos (1–3 minutos), en formato `.mp4` para que se reproduzcan
bien en cualquier navegador. Si tienes reportajes completos además de los
highlights, súbelos con otro nombre y dímelo para añadir un enlace de
descarga aparte — los vídeos largos no conviene incrustarlos enteros en la web.

## Después de subir

Dímelo y reviso que todo cargue bien, ajusto el orden o el recorte de las
fotos anchas de la cuadrícula, y actualizo los textos de ejemplo (opiniones,
nombres de la plantilla de Historias) por los datos reales que me pases.
