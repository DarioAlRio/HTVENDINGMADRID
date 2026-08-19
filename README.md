# HT Vending Madrid — sitio web rediseñado

Rediseño multipágina de **htvendingmadrid.es** manteniendo la marca, los colores, los textos
y las imágenes del dominio original, con maquetación responsive moderna.

## Cómo verlo en local

```bash
node HTVendingMadrid/serve.js
```

Después abre `http://localhost:4400`. `serve.js` es solo una utilidad de desarrollo:
no hace falta subirla al hosting.

## Estructura

```
HTVendingMadrid/
├─ index.html              Portada (carrusel, propuesta de valor, productos, cifras, vídeo)
├─ servicios.html          Servicios de vending + 8 familias de producto
├─ maquinas.html           Catálogo de 10 máquinas con galería a pantalla completa
├─ empresa.html            Quiénes somos, clientes y factor humano
├─ certificaciones.html    ISO 9001 / 14001, APPCC, descargas y preguntas frecuentes
├─ alergenos.html          Gestión de alérgenos + QR y PDF del listado
├─ excelencia.html         Estrella de Oro a la Excelencia Profesional
├─ trabajo.html            Únete a HT
├─ contacto.html           Formulario, teléfonos, datos y mapa
├─ legal.html              Aviso legal (texto íntegro del sitio original)
├─ privacidad.html         Política de privacidad (texto íntegro del sitio original)
├─ cookies.html            Declaración de cookies (Cookiebot)
├─ sitemap.xml, robots.txt
├─ serviciosyproductos.html · quienesomos.html · contacto.php · excelencia_profesional.html
│                          Redirecciones desde las URL antiguas, para no perder posicionamiento
└─ assets/
   ├─ css/style.css        Sistema de diseño completo (tokens, componentes, responsive)
   ├─ js/main.js           Menú, carrusel, galería, formulario, animaciones (sin librerías)
   ├─ img/                 Imágenes del dominio original, optimizadas + variantes .webp
   │  └─ _original/        Copia intacta de las imágenes tal como estaban en el dominio
   └─ docs/                PDF originales (calidad, ambiental, alérgenos, presentación)
```

## Decisiones de diseño

- **Un solo menú** para todo el sitio: 7 secciones + desplegable «Calidad» que agrupa
  certificaciones, dossier ambiental, alérgenos y el galardón de excelencia. En móvil se
  convierte en un panel lateral con acordeones, cierre por Escape, por fondo y por enlace.
- **Marca respetada**: cian `#29abe2` y gris `#58595b` del logotipo, con la gama azul
  (`#3498db`/`#2980b9`) que ya usaba el sitio original. El logotipo se toma del propio
  `header.jpg` del dominio mediante recorte por CSS, así que es idéntico al original.
- **Tipografía**: Montserrat (ya presente en el sitio antiguo) para titulares e Inter para
  el texto, con escala fluida `clamp()` que se adapta de 360 px a 1440 px sin saltos.
- **Compatibilidad**: prefijos `-webkit-` para `backdrop-filter`, longhand `top/right/bottom/left`
  en lugar de `inset`, respaldo `@supports` para `aspect-ratio` y `svh`, y `<picture>` con
  WebP + respaldo JPEG/PNG. Funciona en Safari, Chrome, Firefox y Edge.
- **Accesibilidad**: navegación por teclado completa, `aria-expanded`/`aria-current`, enlace
  de salto al contenido, foco visible, textos alternativos y respeto a `prefers-reduced-motion`.

## Formulario de contacto

`contacto.html` envía por `POST` a `php/contactform.php`, el mismo endpoint que usaba el
sitio original. Al subirlo al hosting actual funcionará sin cambios. Si el endpoint no
responde, el formulario muestra el correo y el teléfono como alternativa. Valida en cliente
e incluye trampa antispam; sin JavaScript sigue funcionando como envío HTML normal.

## Imágenes

Todas proceden del dominio original. Se han recomprimido y redimensionado al tamaño real de
uso: **23,4 MB → 2,1 MB (91 % menos)**, además de generar variantes WebP. Los archivos tal
como estaban en el servidor se conservan en `assets/img/_original/`.

## Notas

- Se mantienen los scripts de **Cookiebot** y **Google Tag Manager** (`GTM-W7T6CT2`) que ya
  tenía el sitio original. Si no se quieren, basta con borrarlos de la cabecera de cada página.
- El código QR de alérgenos del sitio antiguo estaba roto (la API de Google Charts que usaba
  fue retirada y devuelve 404). Se ha generado uno nuevo como SVG en
  `assets/img/qr-alergenos.svg`, apuntando al mismo PDF de materias primas.
