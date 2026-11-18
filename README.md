# DF urbano — MVP (maqueta)

Prototipo estático (HTML/CSS/JS puro, sin build) basado en el wireframe de Figma. Móvil (430 px) + versión desktop (≥ 900 px). Todo es simulado: productos, precios, carrito y compra.

## Vistas
| Ruta | Vista |
|---|---|
| `#/` | Inicio (ticker, hero, Lo popular, Mirala puesta, Adultos/Niños, Local) |
| `#/catalogo/{todo,vivo,lisos,manchados,camuflados,popular,puesta}` | Catálogo de pantalones por estilo, con orden por precio |
| `#/producto/{id}` | Ficha: color, talle, cantidad, agregar al carrito, Whatsapp |
| `#/carrito` | Carrito con totales y precio por transferencia |
| `#/checkout` | Contacto, entrega (retiro/domicilio), pago (transferencia/tarjeta) |
| `#/gracias` | Confirmación de pedido simulado |
| `#/login`, `#/cuenta` | Iniciar sesión / crear cuenta (simulado) y Mi cuenta |
| `#/local` | Dirección, horarios, mapa (placeholder) y formulario de contacto |
| `#/info/{envios,cambios,pagos,talles}` | Páginas informativas |

Además: menú lateral, búsqueda en vivo y carrito lateral (íconos del header). El carrito se guarda en `localStorage`.

## Ver en local
Abrí `index.html` en el navegador, o:
```
python -m http.server 8000
```

## Publicar en GitHub Pages
1. Subí estos archivos a un repositorio, rama `main`.
2. **Settings → Pages → Deploy from a branch → main / (root)**.
3. Queda en `https://<usuario>.github.io/<repo>/` (las rutas usan `#`, no necesita configuración extra).

## Editar contenido
- Productos, precios, datos del local, número de Whatsapp: `js/data.js`
- Vistas y lógica: `js/app.js`
- Estilos (móvil + desktop): `css/styles.css`
- Íconos y placeholders exportados de Figma: `assets/`

Nota: el wireframe usa la fuente "Skybold Demo", que no se puede publicar en la web; se aproxima con Anton comprimida.
