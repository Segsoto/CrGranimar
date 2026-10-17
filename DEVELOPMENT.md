# Frontend de CR Granimar

El sitio usa HTML, CSS y JavaScript nativos. No necesita un framework ni instalar paquetes de Node.

## Estilos

Editar los archivos de `styles/src/`:

- `tokens.css`: colores, tamaños de texto, espacios y movimiento compartidos.
- `base.css`: estructura y estilos originales de las páginas interiores.
- `components.css`: navegación, botones, formularios, tarjetas, visor y adaptación compartida.
- `home.css`: composición editorial de la página de inicio.
- `works.css`: galería completa de Trabajos.

Generar el archivo que sirve la web:

```sh
node scripts/build-styles.mjs
```

El resultado es `styles/global.css`. No editarlo directamente. La web carga un único CSS y conserva las referencias existentes en el HTML.

Comprobar que está actualizado:

```sh
node scripts/build-styles.mjs --check
node --check scripts/main.js
```

## Interacciones

`scripts/main.js` contiene inicializadores independientes de navegación, animaciones, vista previa de galería y visor. No dependen de una biblioteca externa. La galería con `data-gallery-all` muestra todas sus fotos; las demás permiten expandir una vista previa. Los enlaces a fotos siguen funcionando sin JavaScript.

## Imágenes

`scripts/optimize_images.py` genera WebP sin eliminar los originales. Requiere Pillow y pillow-heif. Mantiene los metadatos del `<head>` y actualiza únicamente las referencias de imágenes del cuerpo.

## Verificación visual

Revisar inicio, Trabajos, catálogo y contacto en móvil, tablet y escritorio; comprobar menú, expansión, visor, Escape, navegación por teclado y movimiento reducido. Mantener sin cambios los textos, metadatos y archivos SEO existentes salvo petición expresa.
