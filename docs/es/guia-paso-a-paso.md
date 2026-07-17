# Guía paso a paso (español)

Documento de aprendizaje sobre cómo está construido este proyecto. Explica los
conceptos y recorre cada parte del código con detalle. Los documentos técnicos
principales están en inglés en la carpeta [`docs/`](../README.md); este es un
complemento en español.

---

## 1. Conceptos previos

**CRUD** son las cuatro operaciones básicas sobre datos: *Create, Read, Update,
Delete* (crear, leer, actualizar, borrar). Casi cualquier aplicación es, en el
fondo, un conjunto de CRUDs.

Toda app web se divide en dos mitades:

- **Frontend**: lo que ve y usa la persona (páginas, formularios, botones). Se
  ejecuta en el navegador. Aquí: Next.js + React.
- **Backend**: la lógica que no se ve (recibe peticiones, aplica reglas, habla
  con la base de datos). Aquí: Node.js + Express.

Se comunican por **HTTP** intercambiando datos en formato **JSON**. El backend
expone una **API**: un conjunto de operaciones (*endpoints*) que el frontend
puede invocar. Cada endpoint se identifica por un método HTTP y una URL:

| Método | Operación CRUD | Ejemplo |
|--------|----------------|---------|
| GET | Leer | `GET /api/pacientes` |
| POST | Crear | `POST /api/pacientes` |
| PUT | Actualizar | `PUT /api/pacientes/:id` |
| DELETE | Borrar | `DELETE /api/pacientes/:id` |

La **base de datos** (PostgreSQL) guarda los datos de forma permanente: sobreviven
aunque se reinicie el servidor.

---

## 2. Arquitectura

Tres procesos que corren a la vez, cada uno en su puerto:

```
Frontend (Next.js)  →  Backend (Express)  →  Base de datos (PostgreSQL)
 localhost:3000         localhost:3001         localhost:5432
```

Se separan para aislar responsabilidades: se puede cambiar la interfaz sin tocar
la lógica, trabajar en paralelo, o añadir en el futuro otro cliente (por ejemplo
una app móvil) sobre la misma API.

### Recorrido de una petición (crear un paciente)

1. El formulario del frontend envía `POST /api/pacientes` con los datos en JSON.
2. Express interpreta el cuerpo y dirige la petición al controlador `crear`.
3. El controlador **valida** los datos con Zod. Si algo falla, responde `400`.
4. Comprueba que el email no exista ya (si existe, `409`).
5. Guarda el registro con Prisma en PostgreSQL.
6. Responde `201` con el paciente creado.
7. El frontend vuelve a la lista, que ya muestra el nuevo registro.

Las demás operaciones siguen el mismo patrón cambiando el verbo y la consulta.

---

## 3. El backend por capas

Cada carpeta de `backend/src` tiene una única responsabilidad:

- **`index.ts`** — arranca el servidor: registra los *middlewares* globales
  (`cors` para permitir llamadas del frontend, `express.json` para leer el JSON),
  monta las rutas y, al final, el manejo de errores.
- **`routes/`** — asocia cada URL + método con la función del controlador.
- **`controllers/`** — la lógica de cada endpoint: valida, aplica reglas de
  negocio, llama a la capa de datos y decide el código de respuesta.
- **`data/`** — el acceso a la base de datos (`prisma.ts` crea el cliente;
  `store.ts` contiene las consultas).
- **`middleware/errorHandler.ts`** — traduce cualquier error a una respuesta HTTP
  coherente.
- **`types/paciente.ts`** — define las reglas de los datos con Zod y deriva los
  tipos de TypeScript.

### Validación con Zod

En `types/paciente.ts` se define **una sola vez** el esquema de un paciente (el
nombre no vacío, el email con formato válido, el género dentro de una lista
cerrada, etc.). De ese esquema se obtienen dos cosas: la validación en tiempo de
ejecución y los tipos de TypeScript. Así nunca se desincronizan.

### Códigos de estado HTTP

El backend responde con códigos estándar: `200` (ok), `201` (creado), `204` (ok
sin contenido, típico al borrar), `400` (datos inválidos), `404` (no
encontrado), `409` (conflicto, p. ej. email duplicado), `500` (error interno).

---

## 4. La base de datos con Prisma

Para hablar con PostgreSQL se usa **Prisma**, un ORM: se escribe JavaScript y
Prisma genera el SQL por debajo. Ventaja: consultas tipadas y legibles, sin SQL a
mano.

- **`schema.prisma`** define la tabla `pacientes` (columnas, tipos, el `id`
  único, el email único, el enum de género). Es la fuente de verdad.
- **Migraciones**: `npm run db:migrate` genera y aplica el SQL que crea o
  modifica las tablas. Se guardan en `prisma/migrations/` y se versionan en git,
  para poder recrear la base de datos en cualquier sitio.
- **Seed**: `npm run db:seed` inserta datos de ejemplo con `upsert` (no duplica
  si se ejecuta varias veces).

PostgreSQL se levanta con Docker (`docker compose up -d`); las credenciales y la
conexión (`DATABASE_URL`) están en `backend/.env`, que **no se sube a git** por
contener credenciales.

---

## 5. El frontend con Next.js

En Next.js (App Router) **las páginas se crean con carpetas**: cada `page.tsx` es
una ruta, y `[id]` es un segmento dinámico (el id de la URL).

- **`lib/api.ts`** centraliza las llamadas al backend (con `fetch`) y define los
  tipos del dominio. Ningún componente llama a `fetch` directamente.
- **`app/page.tsx`** — lista los pacientes (los pide al cargar, los guarda en
  estado, los pinta en una tabla) y permite borrar.
- **`components/PacienteForm.tsx`** — un formulario reutilizable para crear y
  editar. No sabe cuál de las dos operaciones hace: recibe los valores iniciales
  y una función `onSubmit`, y quien lo usa decide qué hacer.
- **`app/pacientes/nuevo`** y **`app/pacientes/[id]/editar`** reutilizan ese
  formulario cambiando solo el `onSubmit` (crear vs. actualizar).

Conceptos de React usados: **componentes** (piezas de interfaz) y **estado**
(`useState`: datos que, al cambiar, repintan la pantalla). `useEffect` sirve para
cargar los datos cuando la página aparece.

---

## 6. Cómo ejecutarlo

Con Node y Docker instalados y en marcha, desde la raíz del proyecto:

```powershell
.\start.ps1     # Windows
```

El script levanta PostgreSQL, instala dependencias la primera vez, aplica las
migraciones, mete datos de ejemplo y arranca backend y frontend. Después, abre
`http://localhost:3000`.

Para pararlo: cierra las ventanas del backend y el frontend, y ejecuta
`.\stop.ps1` (la base de datos conserva los datos).

Los detalles de configuración, scripts y resolución de problemas están en
[`docs/development.md`](../development.md).
