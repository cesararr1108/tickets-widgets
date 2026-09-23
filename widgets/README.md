# Tickets Widget

Widget de soporte para insertar en cualquier página.

## Estructura

```text
widgets/
├── tickets.js
├── README.md
└── js/
    ├── api.js
    ├── companies.js
    ├── branches.js
    └── tickets.js
```

## Instalación

Copiar esta carpeta dentro de:

```text
/var/www/tickets-codeigniter4/public/widgets/
```

Debe quedar:

```text
/var/www/tickets-codeigniter4/public/widgets/tickets.js
/var/www/tickets-codeigniter4/public/widgets/js/api.js
/var/www/tickets-codeigniter4/public/widgets/js/companies.js
/var/www/tickets-codeigniter4/public/widgets/js/branches.js
/var/www/tickets-codeigniter4/public/widgets/js/tickets.js
```

> IMPORTANTE: el nombre de la carpeta pública debe ser exactamente
> `widgets` (con "s"). El archivo `tickets.js` carga sus módulos con
> `import()` usando la ruta fija `/widgets/js/...` (ver más abajo), así
> que si la carpeta se publica como `widget` (sin "s") los imports
> dinámicos fallarán con `TypeError: Failed to fetch dynamically
> imported module`, aunque el `<script>` principal y los endpoints de
> `/api` funcionen sin problema.

## Uso desde otra página

```html
<div id="tickets-widget"></div>

<script
    src="https://200.122.206.204:8081/widgets/tickets.js"
    data-container="tickets-widget"
    data-api="https://200.122.206.204:8081/api">
</script>
```

## Pasar contexto desde la página anfitriona (compañía, sucursal, usuario)

Si la página que incrusta el widget ya conoce la compañía, sucursal y/o
usuario (por ejemplo porque el usuario ya inició sesión ahí), se pueden
pasar como atributos `data-*` adicionales en el mismo `<script>`. La
página anfitriona los debe renderizar en el HTML (server-side, con PHP
u otro backend) al momento de imprimir el `<script>`:

```html
<div id="tickets-widget"></div>

<script
    src="https://200.122.206.204:8081/widgets/tickets.js"
    data-container="tickets-widget"
    data-api="https://200.122.206.204:8081/api"
    data-company-id="12"
    data-branch-id="34"
    data-user-id="56"
    data-user-name="Juan Pérez">
</script>
```

Todos son opcionales e independientes entre sí:

- `data-company-id` / `data-branch-id`: si se pasan, el widget carga
  igual los selects de Compañía/Sucursal desde `/api/companies` y
  `/api/branches/{id}`, pero deja preseleccionada esa opción (el
  usuario puede cambiarla). Si el id no aparece entre los que devuelve
  el API, se deja sin preseleccionar y se avisa por consola
  (`console.warn`).
- `data-user-id` / `data-user-name`: se agregan como `user_id` y
  `user_name` al payload de `POST /api/tickets` al crear un ticket, y
  `user_id` se manda como query param en `GET /api/tickets?user_id=...`
  para que la pestaña "Mis tickets" solo traiga los del usuario actual
  en vez de todos.

**Requiere que el backend (CodeIgniter) soporte:**
- Aceptar `user_id` y `user_name` en el body de `POST /api/tickets` (o
  ignorarlos si no los usa).
- Aceptar el query param `user_id` en `GET /api/tickets` y filtrar por
  ese usuario. Si el backend no lo soporta todavía, seguirá
  devolviendo todos los tickets (no falla, pero tampoco filtra).

## Endpoints utilizados actualmente

```text
GET  /api/companies
GET  /api/branches/{companyId}
POST /api/tickets            (incluye user_id, user_name si se pasaron)
GET  /api/tickets             (?user_id=... si se pasó data-user-id)
```

La parte de branches está preparada para cambiar fácilmente si el backend usa:

```text
/branches?company=1
```

en lugar de:

```text
/branches/1
```

## Importante

El archivo `tickets.js` carga los módulos con `import()` desde:

```text
https://200.122.206.204:8081/widgets/js/
```

Por eso los archivos deben estar disponibles públicamente mediante Nginx/CodeIgniter.

Si el navegador muestra errores de CORS, hay que configurar CORS en CodeIgniter para permitir el dominio de la página que incrusta el widget.

Si el certificado HTTPS no es válido para la IP pública, el navegador también puede bloquear las peticiones. Lo recomendable para producción es utilizar un dominio con certificado TLS válido.
